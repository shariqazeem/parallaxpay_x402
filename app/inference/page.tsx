'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createParallaxClient } from '@/lib/parallax-client'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  tokens?: number
  latency?: number
  cost?: number
}

export default function AIInferencePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parallaxStatus, setParallaxStatus] = useState<'checking' | 'online' | 'offline'>('checking')

  // Check Parallax status on mount
  useState(() => {
    const checkStatus = async () => {
      const client = createParallaxClient()
      const isOnline = await client.healthCheck()
      setParallaxStatus(isOnline ? 'online' : 'offline')
    }
    checkStatus()
  })

  const handleSendMessage = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      role: 'user',
      content: input,
      timestamp: Date.now(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)
    setError(null)

    try {
      const startTime = Date.now()

      // Call PROTECTED API endpoint (x402 payment required!)
      // This endpoint is protected by middleware and requires payment
      const response = await fetch('/api/inference/paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: input },
          ],
          max_tokens: 512,
        }),
      })

      // Check if payment required
      if (response.status === 402) {
        const paymentInfo = await response.json()
        setError('💳 Payment Required! This endpoint requires x402 payment. Please use a wallet with USDC or check DEV_MODE in .env.local')
        console.error('Payment required:', paymentInfo)
        setIsLoading(false)
        return
      }

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || 'Request failed')
      }

      // Get response data
      const data = await response.json()
      console.log('Inference response:', data)

      const latency = Date.now() - startTime
      const tokens = data.tokens || 0
      const cost = data.cost || 0

      // Extract content from API response
      const content = data.response || data.result || ''

      if (!content) {
        throw new Error('No content in response from API')
      }

      // Extract transaction hash if present
      const txHash = data.txHash || null

      const assistantMessage: Message = {
        role: 'assistant',
        content: content,
        timestamp: Date.now(),
        tokens,
        latency,
        cost,
      }

      setMessages((prev) => [...prev, assistantMessage])
      setParallaxStatus('online')

      // Store transaction in localStorage for history page
      if (txHash) {
        try {
          const stored = localStorage.getItem('parallaxpay_transactions') || '[]'
          const transactions = JSON.parse(stored)
          transactions.push({
            id: `inference_${Date.now()}`,
            timestamp: Date.now(),
            type: 'inference',
            provider: data.provider || 'Local Parallax Node',
            tokens,
            cost,
            txHash,
            status: 'success',
            network: 'solana-devnet',
          })
          localStorage.setItem('parallaxpay_transactions', JSON.stringify(transactions))
        } catch (e) {
          console.warn('Failed to store transaction:', e)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get response')
      setParallaxStatus('offline')
      console.error('Inference error:', err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <div className="border-b border-border bg-background-secondary/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <h1 className="text-2xl font-heading font-black cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-gradient">ParallaxPay</span>
                </h1>
              </Link>
              <div className="text-text-muted">/</div>
              <h2 className="text-xl font-heading font-bold text-white">
                AI Inference
              </h2>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center gap-2 glass px-4 py-2 rounded-lg">
              <span
                className={`w-2 h-2 rounded-full ${
                  parallaxStatus === 'online'
                    ? 'bg-status-success animate-pulse'
                    : parallaxStatus === 'offline'
                    ? 'bg-status-error'
                    : 'bg-text-muted animate-pulse'
                }`}
              />
              <span className="text-sm font-semibold">
                {parallaxStatus === 'online'
                  ? 'Parallax Online'
                  : parallaxStatus === 'offline'
                  ? 'Parallax Offline'
                  : 'Checking...'}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Interface */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {parallaxStatus === 'offline' && (
          <div className="mb-6 glass-hover p-4 rounded-xl border border-status-error/30 bg-status-error/10">
            <div className="flex items-start gap-3">
              <div className="text-2xl">⚠️</div>
              <div>
                <div className="font-heading font-bold text-white mb-1">
                  Parallax Not Running
                </div>
                <div className="text-sm text-text-secondary mb-2">
                  Start your Parallax scheduler to enable real AI inference:
                </div>
                <code className="text-xs font-mono bg-background-tertiary px-3 py-2 rounded block">
                  parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0
                </code>
              </div>
            </div>
          </div>
        )}

        {/* Messages */}
        <div className="space-y-4 mb-6 min-h-[400px] max-h-[600px] overflow-y-auto">
          <AnimatePresence>
            {messages.length === 0 && (
              <motion.div
                className="text-center py-20"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <div className="text-6xl mb-4">🤖</div>
                <div className="text-2xl font-heading font-bold text-white mb-2">
                  Real AI Inference
                </div>
                <div className="text-text-secondary">
                  Powered by your local Gradient Parallax cluster
                </div>
              </motion.div>
            )}

            {messages.map((message, index) => (
              <MessageBubble key={index} message={message} />
            ))}

            {isLoading && (
              <motion.div
                className="flex items-center gap-3 glass p-4 rounded-xl"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex gap-1">
                  <div className="w-2 h-2 bg-accent-primary rounded-full animate-bounce" />
                  <div
                    className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"
                    style={{ animationDelay: '0.1s' }}
                  />
                  <div
                    className="w-2 h-2 bg-accent-primary rounded-full animate-bounce"
                    style={{ animationDelay: '0.2s' }}
                  />
                </div>
                <span className="text-sm text-text-secondary">
                  Running inference on GPU...
                </span>
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="glass-hover p-4 rounded-xl border border-status-error/30 bg-status-error/10">
              <div className="flex items-start gap-2">
                <span className="text-status-error">❌</span>
                <div>
                  <div className="font-bold text-status-error mb-1">Error</div>
                  <div className="text-sm text-text-secondary">{error}</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input */}
        <div className="glass p-4 rounded-xl border border-border">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder="Ask anything... (e.g., 'Explain quantum computing')"
              className="flex-1 bg-background-tertiary px-4 py-3 rounded-lg text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              disabled={isLoading || parallaxStatus === 'offline'}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim() || parallaxStatus === 'offline'}
              className="glass-hover neon-border px-6 py-3 rounded-lg font-heading font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="text-text-muted">Sending...</span>
              ) : (
                <span className="text-gradient">Send</span>
              )}
            </button>
          </div>
        </div>

        {/* Example Prompts */}
        <div className="mt-6 flex flex-wrap gap-2">
          <div className="text-sm text-text-secondary mr-2">Try:</div>
          {[
            'Explain AI in simple terms',
            'Write a haiku about coding',
            'What is blockchain?',
          ].map((example) => (
            <button
              key={example}
              onClick={() => setInput(example)}
              className="glass-hover px-3 py-1 rounded-lg text-xs text-text-secondary hover:text-white transition-colors"
              disabled={isLoading}
            >
              {example}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === 'user'

  return (
    <motion.div
      className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div
        className={`max-w-[80%] ${
          isUser
            ? 'glass-hover neon-border'
            : 'glass border border-border'
        } p-4 rounded-xl`}
      >
        <div className="flex items-start gap-3 mb-2">
          <div className="text-2xl">{isUser ? '👤' : '🤖'}</div>
          <div className="flex-1">
            <div className="font-heading font-bold text-white mb-1">
              {isUser ? 'You' : 'Parallax AI'}
            </div>
            <div className="text-white whitespace-pre-wrap">{message.content}</div>
          </div>
        </div>

        {/* Metadata */}
        {message.tokens && (
          <div className="mt-3 pt-3 border-t border-border-hover flex flex-wrap gap-4 text-xs">
            <div className="flex items-center gap-1">
              <span className="text-text-muted">Tokens:</span>
              <span className="text-accent-secondary font-mono font-bold">
                {message.tokens}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-text-muted">Latency:</span>
              <span className="text-accent-tertiary font-mono font-bold">
                {message.latency}ms
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-text-muted">Cost:</span>
              <span className="text-status-success font-mono font-bold">
                ${message.cost?.toFixed(5)}
              </span>
            </div>
          </div>
        )}

        <div className="mt-2 text-xs text-text-muted">
          {new Date(message.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  )
}

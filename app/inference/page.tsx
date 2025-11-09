'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { createParallaxClient } from '@/lib/parallax-client'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useX402Payment } from '@/app/hooks/useX402Payment'
import { useProvider } from '@/app/contexts/ProviderContext'
import StreamingMessage, { CostMeter, PaymentAnimation } from '@/app/components/StreamingMessage'

interface Message {
  role: 'user' | 'assistant'
  content: string
  timestamp: number
  tokens?: number
  latency?: number
  cost?: number
  isStreaming?: boolean
}

export default function AIInferencePage() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [parallaxStatus, setParallaxStatus] = useState<'checking' | 'online' | 'offline'>('checking')
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [streamingMessageId, setStreamingMessageId] = useState<number | null>(null)

  // Token controls - users can specify how many tokens they want
  const [maxTokens, setMaxTokens] = useState(512)
  const fixedCost = 0.001 // Fixed $0.001 per request (x402 middleware price)

  // Session stats
  const [sessionTokens, setSessionTokens] = useState(0)
  const [sessionCost, setSessionCost] = useState(0)

  // Wallet connection
  const { publicKey } = useWallet()
  const { fetchWithPayment, isWalletConnected } = useX402Payment()

  // Global provider state from marketplace
  const { selectedProvider } = useProvider()

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

    // Check wallet connection
    if (!isWalletConnected) {
      setError('💳 Please connect your wallet to make paid requests')
      return
    }

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
      // Show payment animation
      setIsProcessingPayment(true)
      await new Promise(resolve => setTimeout(resolve, 1500)) // Simulate payment processing

      const startTime = Date.now()

      // Call PROTECTED API endpoint with x402 payment using user's wallet
      // This will automatically handle 402 responses and make payment
      const response = await fetchWithPayment('/api/inference/paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map((m) => ({ role: m.role, content: m.content })),
            { role: 'user', content: input },
          ],
          max_tokens: maxTokens, // User-specified token limit
          provider: selectedProvider?.name, // Send selected provider from marketplace
        }),
      })

      setIsProcessingPayment(false)

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
        isStreaming: true, // Enable streaming
      }

      const messageIndex = messages.length + 1 // +1 for user message just added
      setStreamingMessageId(messageIndex)
      setMessages((prev) => [...prev, assistantMessage])
      setParallaxStatus('online')

      // Update session stats
      setSessionTokens(prev => prev + tokens)
      setSessionCost(prev => prev + cost)

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
      setIsProcessingPayment(false)
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

            {/* Wallet & Status */}
            <div className="flex items-center gap-3">
              {/* Wallet Connect Button */}
              <WalletMultiButton className="!bg-gradient-to-r !from-accent-primary !to-accent-secondary !rounded-lg !px-4 !py-2 !text-sm !font-bold hover:!scale-105 !transition-transform" />

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

          {/* Selected Provider Banner */}
          {selectedProvider && (
            <div className="mt-4 glass-hover p-4 rounded-lg border border-accent-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl">{selectedProvider.featured ? '⭐' : '🖥️'}</div>
                  <div className="flex-1">
                    <div className="font-heading font-bold text-white mb-1">
                      Using: {selectedProvider.name}
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-text-muted">Model:</span>
                        <span className="text-white font-mono">{selectedProvider.model.split('/')[1]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-text-muted">Latency:</span>
                        <span className="text-status-success font-mono">{selectedProvider.latency}ms</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-text-muted">Uptime:</span>
                        <span className="text-accent-secondary font-mono">{selectedProvider.uptime}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Link href="/marketplace">
                  <button className="glass-hover border border-border px-4 py-2 rounded-lg text-sm font-heading font-bold text-white hover:scale-105 transition-all">
                    Change Provider
                  </button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content - Chat + Session Stats */}
      <div className="max-w-[1600px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Chat Interface */}
          <div className="lg:col-span-2">
        {/* Wallet Not Connected Warning */}
        {!isWalletConnected && (
          <div className="mb-6 glass-hover p-4 rounded-xl border border-accent-primary/30 bg-accent-primary/10">
            <div className="flex items-start gap-3">
              <div className="text-2xl">💳</div>
              <div>
                <div className="font-heading font-bold text-white mb-1">
                  Wallet Not Connected
                </div>
                <div className="text-sm text-text-secondary mb-2">
                  Connect your Solana wallet (Phantom, Solflare) to make paid inference requests using x402 micropayments.
                </div>
                <div className="text-xs text-text-muted">
                  Each inference request costs approximately $0.001 - $0.01 depending on token usage.
                </div>
              </div>
            </div>
          </div>
        )}

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

        {/* Payment Animation */}
        <AnimatePresence>
          {isProcessingPayment && (
            <PaymentAnimation
              amount={fixedCost}
              provider={selectedProvider?.name || 'Parallax'}
            />
          )}
        </AnimatePresence>

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
                  Real AI Inference with Streaming
                </div>
                <div className="text-text-secondary mb-2">
                  Powered by Gradient Parallax + x402 micropayments
                </div>
                <div className="flex items-center justify-center gap-2 text-xs text-text-muted">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-status-success" />
                    <span>Real-time streaming</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent-primary" />
                    <span>Live cost meter</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-accent-secondary" />
                    <span>Token tracking</span>
                  </div>
                </div>
              </motion.div>
            )}

            {messages.map((message, index) => {
              if (message.role === 'assistant' && message.isStreaming) {
                return (
                  <StreamingMessage
                    key={index}
                    fullContent={message.content}
                    tokens={message.tokens || 0}
                    cost={message.cost || 0}
                    latency={message.latency || 0}
                    onComplete={() => {
                      // Mark streaming as complete
                      setStreamingMessageId(null)
                      setMessages(prev => prev.map((m, i) =>
                        i === index ? { ...m, isStreaming: false } : m
                      ))
                    }}
                  />
                )
              }
              return <MessageBubble key={index} message={message} />
            })}

            {isLoading && !isProcessingPayment && (
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

        {/* Token Control & Pricing */}
        <div className="glass p-4 rounded-xl border border-border mb-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <div className="text-sm font-heading font-bold text-white mb-1">
                Response Length: {maxTokens.toLocaleString()} tokens
              </div>
              <div className="text-xs text-text-muted">
                Control how long the AI response will be
              </div>
            </div>
            <div className="text-right">
              <div className="text-lg font-black text-status-success">
                $0.001
              </div>
              <div className="text-xs text-text-muted">
                Fixed price
              </div>
            </div>
          </div>

          {/* Token Slider */}
          <div className="flex items-center gap-4">
            <span className="text-xs text-text-secondary font-mono">100</span>
            <input
              type="range"
              min="100"
              max="2000"
              step="100"
              value={maxTokens}
              onChange={(e) => setMaxTokens(parseInt(e.target.value))}
              disabled={!isWalletConnected}
              className="flex-1 h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary"
              style={{
                background: isWalletConnected
                  ? `linear-gradient(to right, #9945FF 0%, #14F195 ${((maxTokens - 100) / 1900) * 100}%, #1a1a1a ${((maxTokens - 100) / 1900) * 100}%, #1a1a1a 100%)`
                  : '#1a1a1a'
              }}
            />
            <span className="text-xs text-text-secondary font-mono">2000</span>
          </div>

          {/* Pricing Info */}
          <div className="mt-3 pt-3 border-t border-border-hover flex items-center justify-between text-xs">
            <span className="text-text-muted">
              💡 <span className="font-mono font-bold text-accent-secondary">$0.001</span> per request (any length up to 2000 tokens)
            </span>
            <span className="text-text-muted">
              {maxTokens >= 1500 && '🚀 Very long response'}
              {maxTokens >= 1000 && maxTokens < 1500 && '✨ Long response'}
              {maxTokens >= 500 && maxTokens < 1000 && '📝 Medium response'}
              {maxTokens < 500 && '⚡ Short response'}
            </span>
          </div>
        </div>

        {/* Input */}
        <div className="glass p-4 rounded-xl border border-border">
          <div className="flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && !isLoading && handleSendMessage()}
              placeholder={!isWalletConnected ? "Connect wallet to start..." : "Ask anything... (e.g., 'Write 500 lines of HTML code')"}
              className="flex-1 bg-background-tertiary px-4 py-3 rounded-lg text-white placeholder-text-muted focus:outline-none focus:ring-2 focus:ring-accent-primary"
              disabled={isLoading || parallaxStatus === 'offline' || !isWalletConnected}
            />
            <button
              onClick={handleSendMessage}
              disabled={isLoading || !input.trim() || parallaxStatus === 'offline' || !isWalletConnected}
              className="glass-hover neon-border px-6 py-3 rounded-lg font-heading font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isLoading ? (
                <span className="text-text-muted">Sending...</span>
              ) : !isWalletConnected ? (
                <span className="text-text-muted">Connect Wallet</span>
              ) : (
                <span className="text-gradient">Pay $0.001</span>
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

          {/* Session Stats Sidebar */}
          <div className="space-y-6">
            {/* Session Cost Meter */}
            <div className="glass rounded-xl p-6 border border-border sticky top-24">
              <h3 className="text-lg font-heading font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">📊</span>
                Session Stats
              </h3>

              {/* Total Cost */}
              <div className="mb-6 p-4 rounded-lg bg-background-secondary border border-border-hover">
                <div className="text-xs text-text-muted mb-1">Total Cost</div>
                <div className="text-3xl font-black text-status-success">
                  ${sessionCost.toFixed(5)}
                </div>
              </div>

              {/* Stats Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 rounded-lg bg-background-secondary">
                  <div>
                    <div className="text-xs text-text-muted">Total Tokens</div>
                    <div className="text-xl font-bold text-white font-mono">
                      {sessionTokens.toLocaleString()}
                    </div>
                  </div>
                  <div className="text-2xl">🎯</div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background-secondary">
                  <div>
                    <div className="text-xs text-text-muted">Messages</div>
                    <div className="text-xl font-bold text-white font-mono">
                      {messages.length}
                    </div>
                  </div>
                  <div className="text-2xl">💬</div>
                </div>

                <div className="flex items-center justify-between p-3 rounded-lg bg-background-secondary">
                  <div>
                    <div className="text-xs text-text-muted">Avg Cost/Msg</div>
                    <div className="text-xl font-bold text-accent-secondary font-mono">
                      ${messages.length > 0 ? (sessionCost / messages.length).toFixed(5) : '0.00000'}
                    </div>
                  </div>
                  <div className="text-2xl">📈</div>
                </div>

                {sessionTokens > 0 && (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-background-secondary">
                    <div>
                      <div className="text-xs text-text-muted">Cost/Token</div>
                      <div className="text-xl font-bold text-accent-primary font-mono">
                        ${(sessionCost / sessionTokens).toFixed(7)}
                      </div>
                    </div>
                    <div className="text-2xl">💰</div>
                  </div>
                )}
              </div>

              {/* Provider Info */}
              {selectedProvider && (
                <div className="mt-6 pt-6 border-t border-border">
                  <div className="text-xs text-text-muted mb-2">Current Provider</div>
                  <div className="flex items-center gap-2 mb-2">
                    <div className="text-xl">{selectedProvider.featured ? '⭐' : '🖥️'}</div>
                    <div className="font-heading font-bold text-white text-sm">
                      {selectedProvider.name}
                    </div>
                  </div>
                  <div className="space-y-1 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Latency</span>
                      <span className="text-status-success font-mono">{selectedProvider.latency}ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-text-muted">Uptime</span>
                      <span className="text-accent-secondary font-mono">{selectedProvider.uptime}%</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Session Actions */}
              <div className="mt-6 pt-6 border-t border-border space-y-2">
                <button
                  onClick={() => {
                    if (confirm('Clear all messages and reset session stats?')) {
                      setMessages([])
                      setSessionTokens(0)
                      setSessionCost(0)
                    }
                  }}
                  className="w-full glass-hover px-4 py-2 rounded-lg text-sm font-semibold text-text-secondary hover:text-white transition-colors"
                >
                  🗑️ Clear Session
                </button>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="glass rounded-xl p-4 border border-border">
              <h4 className="text-sm font-heading font-bold text-white mb-3">💡 Quick Tips</h4>
              <div className="space-y-2 text-xs text-text-secondary">
                <div className="flex items-start gap-2">
                  <span className="text-accent-primary">•</span>
                  <span>Watch costs update in real-time as AI responds</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-primary">•</span>
                  <span>Streaming shows response character-by-character</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-accent-primary">•</span>
                  <span>All payments verified on Solana devnet</span>
                </div>
              </div>
            </div>
          </div>
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

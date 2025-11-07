'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import OrderBook from '../components/marketplace/OrderBook'
import ProviderList from '../components/marketplace/ProviderList'
import TradingChart from '../components/marketplace/TradingChart'
import MarketHeader from '../components/marketplace/MarketHeader'
import AgentPanel from '../components/marketplace/AgentPanel'

export default function MarketplacePage() {
  const [selectedModel, setSelectedModel] = useState('Qwen-2.5-72B')
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Market Header with Stats */}
      <MarketHeader />

      {/* Main Trading Interface */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Order Book & Agents */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <OrderBook model={selectedModel} />
            <AgentPanel />
          </div>

          {/* Middle Column - Chart & Provider List */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            <TradingChart model={selectedModel} />
            <ProviderList
              model={selectedModel}
              onSelectProvider={setSelectedProvider}
              selectedProvider={selectedProvider}
            />
          </div>

          {/* Right Column - Trade Panel & Info */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <TradePanel
              selectedProvider={selectedProvider}
              model={selectedModel}
            />
            <RecentTrades />
          </div>
        </div>
      </div>
    </div>
  )
}

// Trade Panel Component
function TradePanel({
  selectedProvider,
  model
}: {
  selectedProvider: string | null
  model: string
}) {
  const [prompt, setPrompt] = useState('')
  const [maxTokens, setMaxTokens] = useState(100)
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const estimatedCost = (maxTokens / 1000) * 0.0012 // $0.0012 per 1K tokens

  const handleExecuteTrade = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    setIsExecuting(true)
    setError(null)
    setResult(null)

    try {
      const { createParallaxClient } = await import('@/lib/parallax-client')
      const client = createParallaxClient('http://localhost:3001')

      const response = await client.inference({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: maxTokens,
      })

      console.log('Parallax response:', response)

      // Handle response safely - Parallax uses different formats
      let content = ''
      if (response.choices && response.choices.length > 0) {
        const choice = response.choices[0] as any
        // Try standard OpenAI format
        content = choice.message?.content || ''
        // Try Parallax format (uses "messages" plural)
        if (!content && choice.messages?.content) {
          content = choice.messages.content
        }
        // Try text format
        if (!content && choice.text) {
          content = choice.text
        }
      } else if ((response as any).content) {
        content = (response as any).content
      } else if ((response as any).text) {
        content = (response as any).text
      }

      // Clean up <think> tags if present
      if (content.includes('<think>')) {
        // Remove thinking process, just show the final answer
        const thinkEnd = content.indexOf('</think>')
        if (thinkEnd !== -1) {
          content = content.substring(thinkEnd + 8).trim()
        }
      }

      if (!content) {
        throw new Error('No content in response. Response: ' + JSON.stringify(response))
      }

      setResult(content)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute trade')
      console.error('Trade execution error:', err)
    } finally {
      setIsExecuting(false)
    }
  }

  return (
    <motion.div
      className="glass p-6 rounded-xl border border-border"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <h3 className="text-xl font-heading font-bold mb-4 text-white">
        Execute Trade
      </h3>

      {!selectedProvider ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">👈</div>
          <p className="text-text-secondary text-sm">
            Select a provider from the list to start trading
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your AI inference prompt..."
              className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-white placeholder-text-muted focus:border-accent-primary focus:outline-none resize-none"
              rows={4}
            />
          </div>

          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Max Tokens: {maxTokens}
            </label>
            <input
              type="range"
              min="10"
              max="1000"
              value={maxTokens}
              onChange={(e) => setMaxTokens(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <div className="glass-hover p-4 rounded-lg">
            <div className="flex justify-between items-center mb-2">
              <span className="text-text-secondary text-sm">Provider</span>
              <span className="text-white font-mono text-sm">{selectedProvider}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-text-secondary text-sm">Model</span>
              <span className="text-white font-mono text-sm">{model}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-text-secondary text-sm">Est. Cost</span>
              <span className="text-accent-secondary font-bold">
                ${estimatedCost.toFixed(4)}
              </span>
            </div>
          </div>

          <button
            onClick={handleExecuteTrade}
            disabled={isExecuting || !prompt.trim()}
            className="w-full glass-hover neon-border px-6 py-4 rounded-xl font-heading font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isExecuting ? (
              <span className="text-text-muted">⚡ Running Inference...</span>
            ) : (
              <span className="text-gradient">Execute with x402</span>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/30">
              <div className="text-sm text-status-error">{error}</div>
            </div>
          )}

          {result && (
            <div className="p-4 rounded-lg bg-background-tertiary border border-accent-primary/30">
              <div className="text-xs text-text-secondary mb-2">✅ Result:</div>
              <div className="text-sm text-white whitespace-pre-wrap">{result}</div>
            </div>
          )}

          <div className="text-xs text-text-muted text-center">
            {isExecuting
              ? 'Running on your local Parallax cluster...'
              : 'Payment will be processed automatically via x402 on Solana'
            }
          </div>
        </div>
      )}
    </motion.div>
  )
}

// Recent Trades Component
function RecentTrades() {
  const trades = [
    { time: '14:32:01', model: 'Qwen-2.5-72B', tokens: 247, cost: 0.0030, status: 'success' },
    { time: '14:31:45', model: 'Llama-3.3-70B', tokens: 512, cost: 0.0077, status: 'success' },
    { time: '14:31:22', model: 'DeepSeek-V3', tokens: 128, cost: 0.0012, status: 'pending' },
  ]

  return (
    <motion.div
      className="glass p-6 rounded-xl border border-border"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3 className="text-xl font-heading font-bold mb-4 text-white">
        Recent Trades
      </h3>

      <div className="space-y-3">
        {trades.map((trade, i) => (
          <div
            key={i}
            className="glass-hover p-3 rounded-lg border border-border-hover"
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-text-secondary">
                {trade.time}
              </span>
              <span className={`text-xs font-semibold ${
                trade.status === 'success' ? 'text-status-success' : 'text-status-warning'
              }`}>
                {trade.status === 'success' ? '✓' : '⏳'}
              </span>
            </div>
            <div className="text-sm text-white font-medium mb-1">
              {trade.model}
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-text-secondary">{trade.tokens} tokens</span>
              <span className="text-accent-secondary font-bold">
                ${trade.cost.toFixed(4)}
              </span>
            </div>
          </div>
        ))}
      </div>

      <button className="w-full mt-4 glass-hover px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-white transition-colors">
        View All Transactions →
      </button>
    </motion.div>
  )
}

'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import OrderBook from '../components/marketplace/OrderBook'
import ProviderList from '../components/marketplace/ProviderList'
import TradingChart from '../components/marketplace/TradingChart'
import MarketHeader from '../components/marketplace/MarketHeader'
import AgentPanel from '../components/marketplace/AgentPanel'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useX402Payment } from '@/app/hooks/useX402Payment'

export default function MarketplacePage() {
  const [selectedModel, setSelectedModel] = useState('Qwen-2.5-72B')
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null)

  // Wallet connection for user payments
  const { publicKey } = useWallet()
  const { fetchWithPayment, isWalletConnected } = useX402Payment()

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
              isWalletConnected={isWalletConnected}
              fetchWithPayment={fetchWithPayment}
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
  model,
  isWalletConnected,
  fetchWithPayment
}: {
  selectedProvider: string | null
  model: string
  isWalletConnected: boolean
  fetchWithPayment: (url: string, options?: RequestInit) => Promise<Response>
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

    if (!isWalletConnected) {
      setError('Please connect your wallet to execute trades')
      return
    }

    setIsExecuting(true)
    setError(null)
    setResult(null)

    try {
      // Call PROTECTED API endpoint with x402 payment using user's wallet
      const response = await fetchWithPayment('/api/inference/paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: prompt }],
          max_tokens: maxTokens,
          provider: selectedProvider,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || 'Request failed')
      }

      const data = await response.json()
      console.log('Inference response:', data)

      // Extract content from API response
      const content = data.response || data.result || ''

      if (!content) {
        throw new Error('No content in response from API')
      }

      setResult(content)

      // Store transaction in localStorage if we have a txHash
      if (data.txHash) {
        try {
          const stored = localStorage.getItem('parallaxpay_transactions') || '[]'
          const transactions = JSON.parse(stored)
          transactions.push({
            id: `marketplace_${Date.now()}`,
            timestamp: Date.now(),
            type: 'marketplace',
            provider: selectedProvider || data.provider || 'Local Parallax Node',
            tokens: data.tokens || maxTokens,
            cost: data.cost || estimatedCost,
            txHash: data.txHash,
            status: 'success',
            network: 'solana-devnet',
          })
          localStorage.setItem('parallaxpay_transactions', JSON.stringify(transactions))
        } catch (e) {
          console.warn('Failed to store transaction:', e)
        }
      }
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

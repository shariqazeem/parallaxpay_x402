'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import LiveOrderBook from '../components/marketplace/LiveOrderBook'
import ProviderHeatMap from '../components/marketplace/ProviderHeatMap'
import ProviderList from '../components/marketplace/ProviderList'
import TradingChart from '../components/marketplace/TradingChart'
import MarketHeader from '../components/marketplace/MarketHeader'
import AgentPanel from '../components/marketplace/AgentPanel'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useX402Payment } from '@/app/hooks/useX402Payment'
import { useProvider } from '@/app/contexts/ProviderContext'
import Link from 'next/link'

export default function MarketplacePage() {
  const [selectedModel, setSelectedModel] = useState('Qwen-2.5-72B')

  // Global provider state
  const { selectedProvider, selectProvider, providers } = useProvider()

  // Wallet connection for user payments
  const { publicKey } = useWallet()
  const { fetchWithPayment, isWalletConnected } = useX402Payment()

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Market Header with Stats */}
      <MarketHeader />

      {/* Provider Heat Map - Full Width */}
      <div className="max-w-[1920px] mx-auto px-6 pb-6">
        <ProviderHeatMap />
      </div>

      {/* Main Trading Interface */}
      <div className="max-w-[1920px] mx-auto px-6 pb-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Live Order Book & Agents */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <LiveOrderBook />
            <AgentPanel />
          </div>

          {/* Middle Column - Provider Selection */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {/* Provider Selection */}
            <div className="glass p-6 rounded-xl">
              <h3 className="text-xl font-heading font-bold mb-4 text-white">
                🏪 Browse Providers
              </h3>
              <div className="space-y-3">
                {providers.map((provider) => (
                  <motion.div
                    key={provider.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all ${
                      selectedProvider?.id === provider.id
                        ? 'glass-hover neon-border'
                        : 'glass border border-border hover:border-accent-primary'
                    }`}
                    onClick={() => selectProvider(provider)}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="text-lg">{provider.featured ? '⭐' : '🖥️'}</div>
                        <div className="font-heading font-bold text-white">
                          {provider.name}
                        </div>
                      </div>
                      {selectedProvider?.id === provider.id && (
                        <div className="text-xs bg-accent-primary/20 text-accent-primary px-2 py-1 rounded">
                          ✓ Selected
                        </div>
                      )}
                    </div>
                    <div className="text-xs text-text-muted mb-3">
                      {provider.description}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs">
                      <div>
                        <div className="text-text-muted">Latency</div>
                        <div className="font-mono text-white">{provider.latency}ms</div>
                      </div>
                      <div>
                        <div className="text-text-muted">Uptime</div>
                        <div className="font-mono text-status-success">{provider.uptime}%</div>
                      </div>
                      <div>
                        <div className="text-text-muted">Model</div>
                        <div className="font-mono text-white text-[10px]">{provider.model.split('/')[1]}</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              {/* Use Provider Buttons */}
              {selectedProvider && (
                <div className="mt-6 pt-4 border-t border-border space-y-2">
                  <Link href="/inference">
                    <button className="w-full glass-hover neon-border px-4 py-3 rounded-lg font-heading font-bold transition-all hover:scale-105">
                      <span className="text-gradient">💬 Use in Inference Chat</span>
                    </button>
                  </Link>
                  <Link href="/agents">
                    <button className="w-full glass-hover border border-border px-4 py-3 rounded-lg font-heading font-bold transition-all hover:scale-105 text-white">
                      🤖 Deploy Agent with Provider
                    </button>
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Quick Test Panel */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <TradePanel
              selectedProvider={selectedProvider?.name || null}
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

// Buy Inference Panel Component (formerly "Trade Panel")
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
  const [maxTokens, setMaxTokens] = useState(500)
  const [isExecuting, setIsExecuting] = useState(false)
  const [result, setResult] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const fixedCost = 0.001 // Fixed $0.001 per request

  const handleExecuteTrade = async () => {
    if (!prompt.trim()) {
      setError('Please enter a prompt')
      return
    }

    if (!isWalletConnected) {
      setError('Please connect your wallet to buy AI inference')
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
      setError(err instanceof Error ? err.message : 'Failed to complete inference request')
      console.error('Inference request error:', err)
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
      <div className="mb-4">
        <h3 className="text-xl font-heading font-bold text-white mb-1">
          💰 Buy AI Inference
        </h3>
        <p className="text-xs text-text-muted">
          Pay per token with x402 micropayments
        </p>
      </div>

      {!isWalletConnected ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">💳</div>
          <p className="text-text-secondary text-sm mb-2">
            Connect your wallet to buy AI inference
          </p>
          <p className="text-xs text-text-muted">
            No subscriptions • Pay only for what you use
          </p>
        </div>
      ) : !selectedProvider ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">👈</div>
          <p className="text-text-secondary text-sm">
            Select a provider to start
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Your Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want the AI to do? (e.g., 'Explain quantum computing')"
              className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-white placeholder-text-muted focus:border-accent-primary focus:outline-none resize-none"
              rows={4}
            />
          </div>

          {/* Token Control Slider - matching inference page style */}
          <div className="glass-hover p-4 rounded-lg">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-heading font-bold text-white">
                  Response Length: {maxTokens.toLocaleString()} tokens
                </div>
                <div className="text-xs text-text-muted">
                  Control how long the response will be
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

            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-text-secondary font-mono">100</span>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="flex-1 h-2 bg-background-tertiary rounded-lg appearance-none cursor-pointer accent-accent-primary"
                style={{
                  background: `linear-gradient(to right, #9945FF 0%, #14F195 ${((maxTokens - 100) / 1900) * 100}%, #1a1a1a ${((maxTokens - 100) / 1900) * 100}%, #1a1a1a 100%)`
                }}
              />
              <span className="text-xs text-text-secondary font-mono">2000</span>
            </div>

            <div className="text-xs text-text-muted">
              💡 $0.001 per request (any length)
            </div>
          </div>

          {/* Provider Info */}
          <div className="glass-hover p-3 rounded-lg space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">Provider</span>
              <span className="text-white font-mono">{selectedProvider || 'None'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-text-secondary">Model</span>
              <span className="text-white font-mono">{model}</span>
            </div>
          </div>

          <button
            onClick={handleExecuteTrade}
            disabled={isExecuting || !prompt.trim()}
            className="w-full glass-hover neon-border px-6 py-4 rounded-xl font-heading font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isExecuting ? (
              <span className="text-text-muted">⚡ Processing Payment...</span>
            ) : (
              <span className="text-gradient">Buy Inference • $0.001</span>
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

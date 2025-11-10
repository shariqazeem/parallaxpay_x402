'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import LiveOrderBook from '../components/marketplace/LiveOrderBook'
import ProviderHeatMap from '../components/marketplace/ProviderHeatMap'
import ProviderList from '../components/marketplace/ProviderList'
import TradingChart from '../components/marketplace/TradingChart'
import MarketHeader from '../components/marketplace/MarketHeader'
import AgentPanel from '../components/marketplace/AgentPanel'
import OrderPlacementPanel from '../components/marketplace/OrderPlacementPanel'
import UserPositionPanel from '../components/marketplace/UserPositionPanel'
import TradeAnimations from '../components/marketplace/TradeAnimations'
import { ProviderComparisonMatrix } from '@/components/ProviderComparisonMatrix'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useX402Payment } from '@/app/hooks/useX402Payment'
import { useProvider } from '@/app/contexts/ProviderContext'
import Link from 'next/link'

export default function MarketplacePage() {
  const [selectedModel, setSelectedModel] = useState('Qwen-2.5-72B')

  // Global provider state with REAL discovery
  const { selectedProvider, selectProvider, providers, discoverProviders, isDiscovering } = useProvider()

  // Wallet connection for user payments
  const { publicKey } = useWallet()
  const { fetchWithPayment, isWalletConnected } = useX402Payment()

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Trade Animations Overlay */}
      <TradeAnimations />

      {/* Market Header with Stats */}
      <MarketHeader />

      {/* Selected Provider Banner */}
      {selectedProvider && (
        <div className="max-w-[1920px] mx-auto px-6 pt-6">
          <motion.div
            className="glass-hover neon-border p-4 rounded-xl"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl">{selectedProvider.featured ? '⭐' : '🖥️'}</div>
                <div>
                  <div className="font-heading font-bold text-white mb-1">
                    ✅ Selected as Default: {selectedProvider.name}
                  </div>
                  <div className="text-xs text-text-secondary">
                    All your agents will use this provider • Model: {selectedProvider.model.split('/')[1]} • Latency: {selectedProvider.latency}ms • Uptime: {selectedProvider.uptime}%
                  </div>
                </div>
              </div>
              <Link href="/agents">
                <button className="glass-hover border border-border px-4 py-2 rounded-lg text-sm font-heading font-bold text-white hover:scale-105 transition-all">
                  Go to Agents →
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* Provider Comparison Matrix - Full Width */}
      <div className="max-w-[1920px] mx-auto px-6 pb-6">
        <ProviderComparisonMatrix
          selectedProviderId={selectedProvider?.id}
          onSelectProvider={(provider) => {
            selectProvider(provider as any)
          }}
        />
      </div>

      {/* Provider Heat Map - Full Width */}
      <div className="max-w-[1920px] mx-auto px-6 pb-6">
        <ProviderHeatMap />
      </div>

      {/* Main Trading Interface */}
      <div className="max-w-[1920px] mx-auto px-6 pb-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left Column - Live Order Book & Order Placement */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <LiveOrderBook />
            <OrderPlacementPanel />
          </div>

          {/* Middle Column - Provider Selection */}
          <div className="col-span-12 lg:col-span-6 space-y-6">
            {/* Provider Selection */}
            <div className="glass p-6 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-heading font-bold text-white">
                  🏪 Browse Providers
                </h3>
                <button
                  onClick={discoverProviders}
                  disabled={isDiscovering}
                  className="px-3 py-1.5 text-xs font-heading font-bold glass-hover border border-accent-primary rounded-lg transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDiscovering ? (
                    <span className="text-text-muted">🔄 Discovering...</span>
                  ) : (
                    <span className="text-gradient">🔍 Discover</span>
                  )}
                </button>
              </div>

              {providers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-text-secondary text-sm mb-2">
                    No providers discovered yet
                  </p>
                  <p className="text-xs text-text-muted">
                    Make sure Parallax nodes are running on ports 3001-3003
                  </p>
                </div>
              ) : (
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
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-lg">{provider.featured ? '⭐' : '🖥️'}</div>
                          <div className="font-heading font-bold text-white">
                            {provider.name}
                          </div>
                          {provider.online !== undefined && (
                            <div className={`w-2 h-2 rounded-full ${provider.online ? 'bg-status-success' : 'bg-status-error'}`} />
                          )}
                          {provider.tier && provider.tier !== 'free' && (
                            <div className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              provider.tier === 'premium'
                                ? 'bg-accent-secondary/20 text-accent-secondary border border-accent-secondary/30'
                                : 'bg-accent-primary/20 text-accent-primary border border-accent-primary/30'
                            }`}>
                              {provider.tier.toUpperCase()}
                            </div>
                          )}
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
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
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
                    {provider.minReputation && provider.minReputation > 0 && (
                      <div className="glass-hover p-2 rounded border border-accent-secondary/30 bg-accent-secondary/5">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-text-secondary">
                            <span>🏆</span>
                            <span>Min Reputation:</span>
                          </div>
                          <div className="font-bold text-accent-secondary">
                            {provider.minReputation}+
                          </div>
                        </div>
                      </div>
                    )}
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Use Provider Button */}
              {selectedProvider && (
                <div className="mt-6 pt-4 border-t border-border">
                  <Link href="/agents">
                    <button className="w-full glass-hover neon-border px-4 py-4 rounded-lg font-heading font-bold transition-all hover:scale-105">
                      <span className="text-gradient">🤖 Use This Provider for All Agents →</span>
                    </button>
                  </Link>
                  <p className="text-xs text-text-muted text-center mt-2">
                    Provider saved. All your agents will automatically use {selectedProvider.name}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - User Position & Quick Test */}
          <div className="col-span-12 lg:col-span-3 space-y-6">
            <UserPositionPanel />
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

// Recent Trades Component - NOW WITH ENHANCED REAL TRADES! 🔥
function RecentTrades() {
  const [trades, setTrades] = useState<Array<{
    time: string
    buyerId: string
    sellerId: string
    tokens: number
    cost: number
    status: string
  }>>([])

  useEffect(() => {
    const updateRealTrades = () => {
      try {
        const { getEnhancedOrderBook } = require('@/lib/enhanced-order-book')
        const orderBook = getEnhancedOrderBook()
        const recentTrades = orderBook.getRecentTrades(5)

        const displayTrades = recentTrades.map(trade => ({
          time: new Date(trade.timestamp).toLocaleTimeString(),
          buyerId: trade.buyerId,
          sellerId: trade.sellerId,
          tokens: trade.amount,
          cost: trade.price * trade.amount,
          status: 'success',
        }))

        setTrades(displayTrades)
      } catch (error) {
        console.error('Failed to load trades:', error)
      }
    }

    // Update immediately
    updateRealTrades()

    // Listen for trade events
    const { getEnhancedOrderBook } = require('@/lib/enhanced-order-book')
    const orderBook = getEnhancedOrderBook()
    orderBook.on('tradeExecuted', updateRealTrades)

    // Also update every 3 seconds
    const interval = setInterval(updateRealTrades, 3000)

    return () => {
      orderBook.off('tradeExecuted', updateRealTrades)
      clearInterval(interval)
    }
  }, [])

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

      {trades.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-text-secondary text-sm">
            No trades yet
          </p>
          <p className="text-xs text-text-muted">
            Trades will appear when agents execute
          </p>
        </div>
      ) : (
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
                <span className="text-xs font-semibold text-status-success">
                  ✓
                </span>
              </div>
              <div className="text-sm text-white font-medium mb-1">
                {trade.buyerId.substring(0, 8)}... → {trade.sellerId.substring(0, 8)}...
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-text-secondary">{trade.tokens.toLocaleString()} tokens</span>
                <span className="text-accent-secondary font-bold">
                  ${trade.cost.toFixed(4)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="w-full mt-4 glass-hover px-4 py-2 rounded-lg text-sm font-medium text-text-secondary hover:text-white transition-colors">
        View All Transactions →
      </button>
    </motion.div>
  )
}

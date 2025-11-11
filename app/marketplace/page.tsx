'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import LiveOrderBook from '../components/marketplace/LiveOrderBook'
import ProviderHeatMap from '../components/marketplace/ProviderHeatMap'
import ProviderList from '../components/marketplace/ProviderList'
import TradingChart from '../components/marketplace/TradingChart'
import { UnifiedNavbar } from '@/components/UnifiedNavbar'
import AgentPanel from '../components/marketplace/AgentPanel'
import OrderPlacementPanel from '../components/marketplace/OrderPlacementPanel'
import UserPositionPanel from '../components/marketplace/UserPositionPanel'
import TradeAnimations from '../components/marketplace/TradeAnimations'
import { ProviderComparisonMatrix } from '@/components/ProviderComparisonMatrix'
import { ClusterStatusDashboard } from '@/components/ClusterStatusDashboard'
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
    <div className="min-h-screen bg-white">
      {/* Trade Animations Overlay */}
      <TradeAnimations />

      <UnifiedNavbar currentPage="marketplace" />

      {/* Selected Provider Banner */}
      {selectedProvider && (
        <div className="max-w-[1920px] mx-auto px-6 pt-6">
          <motion.div
            className="bg-white p-4 rounded-xl border-2 border-green-200 shadow-sm"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="text-2xl">{selectedProvider.featured ? '⭐' : '🖥️'}</div>
                <div>
                  <div className="font-bold text-black mb-1">
                    ✅ Selected as Default: {selectedProvider.name}
                  </div>
                  <div className="text-xs text-gray-600">
                    All your agents will use this provider • Model: {selectedProvider.model.split('/')[1]} • Latency: {selectedProvider.latency}ms • Uptime: {selectedProvider.uptime}%
                  </div>
                </div>
              </div>
              <Link href="/agents">
                <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold hover:from-purple-600 hover:to-blue-600 transition-all shadow-md hover:shadow-lg">
                  Go to Agents →
                </button>
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      {/* Cluster Status Dashboard - Full Width */}
      <div className="max-w-[1920px] mx-auto px-6 pb-6">
        <ClusterStatusDashboard />
      </div>

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
            <div className="bg-white p-6 rounded-xl border-2 border-purple-200 shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black">
                  🏪 Browse Providers
                </h3>
                <button
                  onClick={discoverProviders}
                  disabled={isDiscovering}
                  className="px-3 py-1.5 text-xs font-bold bg-black text-white rounded-lg transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDiscovering ? (
                    <span>🔄 Discovering...</span>
                  ) : (
                    <span>🔍 Discover</span>
                  )}
                </button>
              </div>

              {providers.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">🔍</div>
                  <p className="text-gray-600 text-sm mb-2">
                    No providers discovered yet
                  </p>
                  <p className="text-xs text-gray-500">
                    Make sure Parallax nodes are running on ports 3001-3003
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {providers.map((provider) => (
                    <motion.div
                      key={provider.id}
                      className={`p-4 rounded-xl cursor-pointer transition-all ${
                        selectedProvider?.id === provider.id
                          ? 'bg-gradient-to-br from-blue-50 to-purple-50 border-2 border-blue-500 shadow-lg shadow-blue-200/50'
                          : 'bg-white border-2 border-gray-200 hover:border-purple-400 hover:shadow-md'
                      }`}
                      onClick={() => selectProvider(provider)}
                      whileHover={{ scale: 1.02 }}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <div className="text-lg">{provider.featured ? '⭐' : '🖥️'}</div>
                          <div className="font-bold text-black">
                            {provider.name}
                          </div>
                          {provider.online !== undefined && (
                            <div className={`w-2 h-2 rounded-full ${provider.online ? 'bg-green-500' : 'bg-red-500'}`} />
                          )}
                          {provider.tier && provider.tier !== 'free' && (
                            <div className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                              provider.tier === 'premium'
                                ? 'bg-purple-100 text-purple-700 border border-purple-300'
                                : 'bg-blue-100 text-blue-700 border border-blue-300'
                            }`}>
                              {provider.tier.toUpperCase()}
                            </div>
                          )}
                        </div>
                        {selectedProvider?.id === provider.id && (
                          <div className="text-xs bg-gradient-to-r from-blue-500 to-purple-500 text-white px-3 py-1 rounded-full font-bold shadow-md">
                            ✓ Selected
                          </div>
                        )}
                      </div>
                    <div className="text-xs text-gray-600 mb-3">
                      {provider.description}
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div className="bg-purple-50 p-2 rounded-lg border border-purple-200">
                        <div className="text-purple-600 font-semibold mb-1">⚡ Latency</div>
                        <div className="font-mono font-bold text-black">{provider.latency}ms</div>
                      </div>
                      <div className="bg-green-50 p-2 rounded-lg border border-green-200">
                        <div className="text-green-600 font-semibold mb-1">✓ Uptime</div>
                        <div className="font-mono font-bold text-green-700">{provider.uptime}%</div>
                      </div>
                      <div className="bg-blue-50 p-2 rounded-lg border border-blue-200">
                        <div className="text-blue-600 font-semibold mb-1">🤖 Model</div>
                        <div className="font-mono font-bold text-black text-[10px]">{provider.model.split('/')[1]}</div>
                      </div>
                    </div>
                    {provider.minReputation && provider.minReputation > 0 && (
                      <div className="bg-purple-50 p-2 rounded border border-purple-200">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1 text-gray-600">
                            <span>🏆</span>
                            <span>Min Reputation:</span>
                          </div>
                          <div className="font-bold text-purple-700">
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
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <Link href="/agents">
                    <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-4 py-4 rounded-lg font-bold transition-all hover:from-purple-700 hover:to-blue-700 shadow-lg hover:shadow-xl">
                      🤖 Use This Provider for All Agents →
                    </button>
                  </Link>
                  <p className="text-xs text-gray-500 text-center mt-2">
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
            cost: data.cost || 0.001,
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
      className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="mb-4">
        <h3 className="text-xl font-heading font-bold text-black mb-1">
          💰 Buy AI Inference
        </h3>
        <p className="text-xs text-gray-600">
          Pay per token with x402 micropayments
        </p>
      </div>

      {!isWalletConnected ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">💳</div>
          <p className="text-gray-600 text-sm mb-2">
            Connect your wallet to buy AI inference
          </p>
          <p className="text-xs text-gray-500">
            No subscriptions • Pay only for what you use
          </p>
        </div>
      ) : !selectedProvider ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">👈</div>
          <p className="text-gray-600 text-sm">
            Select a provider to start
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Your Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What do you want the AI to do? (e.g., 'Explain quantum computing')"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:border-accent-primary focus:outline-none resize-none"
              rows={4}
            />
          </div>

          {/* Token Control Slider - matching inference page style */}
          <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-4 rounded-lg border-2 border-purple-200">
            <div className="flex items-center justify-between mb-3">
              <div>
                <div className="text-sm font-heading font-bold text-black">
                  Response Length: {maxTokens.toLocaleString()} tokens
                </div>
                <div className="text-xs text-gray-600">
                  Control how long the response will be
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-black text-green-600">
                  $0.001
                </div>
                <div className="text-xs text-gray-600">
                  Fixed price
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-2">
              <span className="text-xs text-gray-600 font-mono">100</span>
              <input
                type="range"
                min="100"
                max="2000"
                step="100"
                value={maxTokens}
                onChange={(e) => setMaxTokens(Number(e.target.value))}
                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-accent-primary"
                style={{
                  background: `linear-gradient(to right, #9945FF 0%, #14F195 ${((maxTokens - 100) / 1900) * 100}%, #e5e7eb ${((maxTokens - 100) / 1900) * 100}%, #e5e7eb 100%)`
                }}
              />
              <span className="text-xs text-gray-600 font-mono">2000</span>
            </div>

            <div className="text-xs text-gray-600">
              💡 $0.001 per request (any length)
            </div>
          </div>

          {/* Provider Info */}
          <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-3 rounded-lg border-2 border-blue-200 space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Provider</span>
              <span className="text-black font-mono">{selectedProvider || 'None'}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-600">Model</span>
              <span className="text-black font-mono">{model}</span>
            </div>
          </div>

          <button
            onClick={handleExecuteTrade}
            disabled={isExecuting || !prompt.trim()}
            className="w-full bg-black text-white px-6 py-4 rounded-xl font-heading font-bold transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isExecuting ? (
              <span>⚡ Processing Payment...</span>
            ) : (
              <span>Buy Inference • $0.001</span>
            )}
          </button>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border-2 border-red-200">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {result && (
            <div className="p-4 rounded-lg bg-green-50 border-2 border-green-200">
              <div className="text-xs text-gray-600 mb-2">✅ Result:</div>
              <div className="text-sm text-black whitespace-pre-wrap">{result}</div>
            </div>
          )}

          <div className="text-xs text-gray-600 text-center">
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

        const displayTrades = recentTrades.map((trade: any) => ({
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
      className="bg-white p-6 rounded-xl border-2 border-gray-200 shadow-sm"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      <h3 className="text-xl font-heading font-bold mb-4 text-black">
        Recent Trades
      </h3>

      {trades.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">📊</div>
          <p className="text-gray-600 text-sm">
            No trades yet
          </p>
          <p className="text-xs text-gray-500">
            Trades will appear when agents execute
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {trades.map((trade, i) => (
            <div
              key={i}
              className="bg-white p-3 rounded-lg border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-mono text-gray-600">
                  {trade.time}
                </span>
                <span className="text-xs font-semibold text-green-600">
                  ✓
                </span>
              </div>
              <div className="text-sm text-black font-medium mb-1">
                {trade.buyerId.substring(0, 8)}... → {trade.sellerId.substring(0, 8)}...
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-600">{trade.tokens.toLocaleString()} tokens</span>
                <span className="text-green-600 font-bold">
                  ${trade.cost.toFixed(4)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      <button className="w-full mt-4 bg-gradient-to-r from-green-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-green-600 hover:to-blue-600 transition-all shadow-md">
        View All Transactions →
      </button>
    </motion.div>
  )
}

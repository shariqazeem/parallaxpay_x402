'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { RealProvider, getRealProviderManager } from '@/lib/real-provider-manager'

interface ProviderComparisonMatrixProps {
  onSelectProvider?: (provider: RealProvider) => void
  selectedProviderId?: string
}

export function ProviderComparisonMatrix({
  onSelectProvider,
  selectedProviderId
}: ProviderComparisonMatrixProps) {
  const [providers, setProviders] = useState<RealProvider[]>([])
  const [loading, setLoading] = useState(true)
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())
  const [isBenchmarking, setIsBenchmarking] = useState(false)

  useEffect(() => {
    discoverProviders()

    // Auto-refresh every 10 seconds
    const interval = setInterval(() => {
      refreshProviders()
    }, 10000)

    return () => clearInterval(interval)
  }, [])

  const discoverProviders = async () => {
    setLoading(true)
    try {
      const manager = getRealProviderManager()
      const discovered = await manager.discoverProviders()
      setProviders(discovered)
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Failed to discover providers:', error)
    } finally {
      setLoading(false)
    }
  }

  const refreshProviders = async () => {
    try {
      const manager = getRealProviderManager()
      const current = manager.getAllProviders()
      setProviders([...current])
      setLastUpdate(Date.now())
    } catch (error) {
      console.error('Failed to refresh providers:', error)
    }
  }

  const benchmarkAll = async () => {
    setIsBenchmarking(true)
    try {
      const manager = getRealProviderManager()
      await manager.benchmarkAll('Say hello')
      await refreshProviders()
    } catch (error) {
      console.error('Benchmark failed:', error)
    } finally {
      setIsBenchmarking(false)
    }
  }

  const getLatencyColor = (latency: number) => {
    if (latency < 100) return 'text-green-400'
    if (latency < 300) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getLatencyLabel = (latency: number) => {
    if (latency < 100) return 'Excellent'
    if (latency < 300) return 'Good'
    return 'Slow'
  }

  const getUptimeColor = (uptime: number) => {
    if (uptime >= 99) return 'text-green-400'
    if (uptime >= 90) return 'text-yellow-400'
    return 'text-red-400'
  }

  if (loading) {
    return (
      <div className="glass border border-cyan-500/30 rounded-xl p-8">
        <div className="flex items-center justify-center gap-3">
          <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-gray-400">Discovering Parallax nodes...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="glass border border-cyan-500/30 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-2xl font-heading font-bold text-white mb-1">
            🖥️ Provider Comparison Matrix
          </h3>
          <p className="text-sm text-gray-400">
            Real-time status of Parallax nodes • Updated {new Date(lastUpdate).toLocaleTimeString()}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={refreshProviders}
            className="glass-hover px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all"
          >
            🔄 Refresh
          </button>
          <button
            onClick={benchmarkAll}
            disabled={isBenchmarking}
            className="glass-hover neon-border px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all disabled:opacity-50"
          >
            {isBenchmarking ? '⚡ Benchmarking...' : '⚡ Benchmark All'}
          </button>
        </div>
      </div>

      {/* No providers found */}
      {providers.length === 0 && (
        <div className="text-center py-12">
          <div className="text-5xl mb-4">🔍</div>
          <h4 className="text-xl font-bold text-white mb-2">No Parallax Nodes Found</h4>
          <p className="text-gray-400 mb-4">
            Make sure Parallax is running on localhost:3001, 3002, or 3003
          </p>
          <code className="block bg-black/50 p-4 rounded-lg text-sm text-cyan-400 mb-4">
            parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --port 3001
          </code>
          <button
            onClick={discoverProviders}
            className="glass-hover neon-border px-6 py-3 rounded-lg font-semibold hover:scale-105 transition-all"
          >
            <span className="text-gradient">Try Again</span>
          </button>
        </div>
      )}

      {/* Provider Table */}
      {providers.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-700">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Provider</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Latency</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Uptime</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Model</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-400">Requests</th>
                <th className="text-right py-3 px-4 text-sm font-semibold text-gray-400">Action</th>
              </tr>
            </thead>
            <tbody>
              {providers.map((provider, index) => {
                const isSelected = selectedProviderId === provider.id

                return (
                  <motion.tr
                    key={provider.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`border-b border-gray-800 hover:bg-gray-800/30 transition-colors ${
                      isSelected ? 'bg-cyan-500/10' : ''
                    }`}
                  >
                    {/* Provider Name */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="text-lg">
                          {provider.region === 'Primary' ? '🎯' :
                           provider.region === 'Secondary' ? '🔷' : '🔶'}
                        </div>
                        <div>
                          <div className="font-semibold text-white">{provider.name}</div>
                          <div className="text-xs text-gray-500">{provider.url}</div>
                        </div>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="py-4 px-4">
                      {provider.online ? (
                        <div className="flex items-center gap-2">
                          <div className="relative">
                            <div className="w-2 h-2 bg-green-500 rounded-full" />
                            <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
                          </div>
                          <span className="text-sm font-semibold text-green-400">Online</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full" />
                          <span className="text-sm font-semibold text-red-400">Offline</span>
                        </div>
                      )}
                    </td>

                    {/* Latency */}
                    <td className="py-4 px-4">
                      {provider.online ? (
                        <div>
                          <div className={`text-lg font-bold font-mono ${getLatencyColor(provider.latency)}`}>
                            {provider.latency}ms
                          </div>
                          <div className="text-xs text-gray-500">
                            {getLatencyLabel(provider.latency)}
                          </div>
                        </div>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>

                    {/* Uptime */}
                    <td className="py-4 px-4">
                      <div className={`text-lg font-bold font-mono ${getUptimeColor(provider.uptime)}`}>
                        {provider.uptime.toFixed(1)}%
                      </div>
                    </td>

                    {/* Model */}
                    <td className="py-4 px-4">
                      <div className="text-sm font-mono text-cyan-400">
                        {provider.model.split('/').pop()}
                      </div>
                    </td>

                    {/* Requests */}
                    <td className="py-4 px-4">
                      <div className="text-sm">
                        <div className="text-white">
                          ✓ {provider.successfulRequests}
                        </div>
                        {provider.failedRequests > 0 && (
                          <div className="text-red-400">
                            ✗ {provider.failedRequests}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Action */}
                    <td className="py-4 px-4 text-right">
                      {provider.online && (
                        <button
                          onClick={() => onSelectProvider?.(provider)}
                          disabled={isSelected}
                          className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                            isSelected
                              ? 'bg-green-500/20 text-green-400 border border-green-500'
                              : 'glass-hover neon-border hover:scale-105'
                          }`}
                        >
                          {isSelected ? '✓ Active' : 'Use This'}
                        </button>
                      )}
                    </td>
                  </motion.tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Stats Summary */}
      {providers.length > 0 && (
        <div className="mt-6 grid grid-cols-4 gap-4 pt-6 border-t border-gray-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-white">{providers.length}</div>
            <div className="text-xs text-gray-400">Total Nodes</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-400">
              {providers.filter(p => p.online).length}
            </div>
            <div className="text-xs text-gray-400">Online</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">
              {providers.length > 0
                ? Math.round(providers.reduce((sum, p) => sum + p.latency, 0) / providers.length)
                : 0}ms
            </div>
            <div className="text-xs text-gray-400">Avg Latency</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {providers.reduce((sum, p) => sum + p.successfulRequests, 0)}
            </div>
            <div className="text-xs text-gray-400">Total Requests</div>
          </div>
        </div>
      )}

      {/* Pro Tip */}
      <div className="mt-6 p-4 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
        <div className="text-sm text-cyan-300">
          <span className="font-bold">💡 Pro Tip:</span> Run multiple Parallax nodes on different ports for true distributed compute.
          The system will auto-discover and load-balance across all available nodes!
        </div>
      </div>
    </div>
  )
}

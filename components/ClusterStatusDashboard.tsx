'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { ProviderCardSkeleton } from './Skeletons'

interface ProviderMetrics {
  id: string
  name: string
  address: string
  status: 'online' | 'offline' | 'unknown'
  latency: number
  uptime: number
  reputation: number
  models: string[]
  gpu: string | null
  region: string
  price: number
  totalRequests: number
  successfulRequests: number
  failedRequests: number
  lastSeen: number
}

interface ClusterSnapshot {
  providers: ProviderMetrics[]
  timestamp: number
  summary: {
    totalProviders: number
    onlineProviders: number
    averageLatency: number
    averagePrice: number
    lowestPrice: number
    highestPrice: number
    totalCapacity: number
  }
}

export function ClusterStatusDashboard() {
  const [clusterStatus, setClusterStatus] = useState<ClusterSnapshot | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchClusterStatus()
    const interval = setInterval(fetchClusterStatus, 10000) // Refresh every 10s
    return () => clearInterval(interval)
  }, [])

  const fetchClusterStatus = async () => {
    try {
      const response = await fetch('/api/cluster/status')
      if (response.ok) {
        const data = await response.json()
        setClusterStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch cluster status:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200 shadow-lg">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-xl font-bold text-black flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              Parallax Cluster Status
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Loading cluster status...
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[0, 1, 2].map((i) => (
            <ProviderCardSkeleton key={i} index={i} />
          ))}
        </div>
      </div>
    )
  }

  if (!clusterStatus || clusterStatus.summary.totalProviders === 0) {
    return (
      <div className="bg-white p-6 rounded-xl border-2 border-yellow-200 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="text-3xl">⚠️</div>
          <div>
            <div className="font-bold text-black mb-2">
              Parallax Cluster Offline
            </div>
            <div className="text-sm text-gray-600 mb-3">
              Start the Parallax cluster to enable distributed AI inference across multiple nodes.
            </div>
            <code className="block bg-gray-900 text-green-400 p-3 rounded-lg text-xs font-mono">
              ./scripts/start-parallax-cluster.sh
            </code>
          </div>
        </div>
      </div>
    )
  }

  const { summary, providers } = clusterStatus
  const onlineProviders = providers.filter(p => p.status === 'online')

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-xl border-2 border-blue-200 shadow-lg"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-xl font-bold text-black flex items-center gap-2">
            <span className="text-2xl">⚡</span>
            Parallax Cluster Status
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Multi-node distributed inference network
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm font-semibold text-green-600">Live</span>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-black">{summary.onlineProviders}</div>
          <div className="text-xs text-gray-600 mt-1">Online Nodes</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-green-600">{Math.round(summary.averageLatency)}ms</div>
          <div className="text-xs text-gray-600 mt-1">Avg Latency</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-blue-600">${summary.averagePrice.toFixed(4)}</div>
          <div className="text-xs text-gray-600 mt-1">Avg Price/1K</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-purple-600">{summary.totalCapacity}</div>
          <div className="text-xs text-gray-600 mt-1">Capacity</div>
        </div>
      </div>

      {/* Provider List */}
      <div className="space-y-3">
        <div className="text-sm font-bold text-gray-700 mb-2">Active Nodes</div>
        {onlineProviders.map((provider, index) => (
          <motion.div
            key={provider.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white p-4 rounded-lg border border-gray-200 hover:border-blue-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3 flex-1">
                <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-lg flex items-center justify-center text-white font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <div className="font-bold text-black text-sm">{provider.name}</div>
                  <div className="text-xs text-gray-600 font-mono">{provider.address}</div>
                </div>
              </div>

              <div className="flex items-center gap-6 text-xs">
                <div className="text-center">
                  <div className="font-bold text-green-600">{provider.latency}ms</div>
                  <div className="text-gray-500">Latency</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">{provider.uptime.toFixed(0)}%</div>
                  <div className="text-gray-500">Uptime</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-purple-600">{provider.totalRequests}</div>
                  <div className="text-gray-500">Requests</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-gray-700">{provider.reputation}</div>
                  <div className="text-gray-500">Score</div>
                </div>
              </div>
            </div>

            {/* Model Info */}
            <div className="mt-3 flex items-center gap-2 text-xs">
              <span className="text-gray-600">Models:</span>
              {provider.models.slice(0, 2).map((model, i) => (
                <span key={i} className="bg-gray-100 px-2 py-1 rounded font-mono">
                  {model}
                </span>
              ))}
              {provider.models.length > 2 && (
                <span className="text-gray-500">+{provider.models.length - 2} more</span>
              )}
            </div>
          </motion.div>
        ))}
      </div>

      {/* Load Balancing Strategy */}
      <div className="mt-4 p-3 bg-white rounded-lg border border-blue-200">
        <div className="flex items-center gap-2 text-sm">
          <span className="font-semibold text-gray-700">Load Balancing:</span>
          <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-bold text-xs">
            Latency-Based
          </span>
          <span className="text-gray-500 text-xs">• Automatically selects fastest node</span>
        </div>
      </div>
    </motion.div>
  )
}

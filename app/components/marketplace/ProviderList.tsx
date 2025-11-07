'use client'

import { motion } from 'framer-motion'
import { useState, useMemo, useEffect } from 'react'

interface Provider {
  id: string
  name: string
  region: string
  price: number
  latency: number
  uptime: number
  reputation: number
  totalRequests: number
  online: boolean
  models: string[]
}

interface ProviderListProps {
  model: string
  onSelectProvider: (providerId: string) => void
  selectedProvider: string | null
}

export default function ProviderList({
  model,
  onSelectProvider,
  selectedProvider,
}: ProviderListProps) {
  const [sortBy, setSortBy] = useState<'price' | 'latency' | 'reputation'>('price')
  const [filterRegion, setFilterRegion] = useState<string>('all')
  const [providers, setProviders] = useState<Provider[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Fetch real providers from discovery service or API
  useEffect(() => {
    const fetchProviders = async () => {
      try {
        // Try to fetch from API endpoint (server-side provider discovery)
        const response = await fetch('/api/providers')
        if (response.ok) {
          const data = await response.json()
          setProviders(data.providers || [])
        } else {
          // Fallback: Use local Parallax node
          setProviders([
            {
              id: 'local-parallax',
              name: 'Local Parallax Node',
              region: 'Local',
              price: 0.00112,
              latency: 45,
              uptime: 100.0,
              reputation: 100.0,
              totalRequests: 0,
              online: true,
              models: ['Qwen-0.6B', 'Qwen-1.7B'],
            },
          ])
        }
      } catch (error) {
        console.error('Failed to fetch providers:', error)
        // Fallback: Use local node
        setProviders([
          {
            id: 'local-parallax',
            name: 'Local Parallax Node',
            region: 'Local',
            price: 0.00112,
            latency: 45,
            uptime: 100.0,
            reputation: 100.0,
            totalRequests: 0,
            online: true,
            models: ['Qwen-0.6B', 'Qwen-1.7B'],
          },
        ])
      } finally {
        setIsLoading(false)
      }
    }

    fetchProviders()

    // Refresh providers every 30 seconds
    const interval = setInterval(fetchProviders, 30000)
    return () => clearInterval(interval)
  }, [])

  const filteredAndSortedProviders = useMemo(() => {
    let filtered = providers

    if (filterRegion !== 'all') {
      filtered = filtered.filter((p) => p.region === filterRegion)
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price
      if (sortBy === 'latency') return a.latency - b.latency
      if (sortBy === 'reputation') return b.reputation - a.reputation
      return 0
    })
  }, [providers, sortBy, filterRegion])

  const regions = useMemo(() => {
    const uniqueRegions = ['all', ...new Set(providers.map((p) => p.region))]
    return uniqueRegions
  }, [providers])

  const onlineCount = filteredAndSortedProviders.filter(p => p.online).length

  return (
    <motion.div
      className="glass rounded-xl border border-border overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header with Filters */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-heading font-bold text-white">
            Providers ({onlineCount} online / {filteredAndSortedProviders.length} total)
          </h3>
          <div className="flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${onlineCount > 0 ? 'bg-status-success animate-pulse' : 'bg-status-error'}`} />
            <span className={`text-xs font-semibold ${onlineCount > 0 ? 'text-status-success' : 'text-status-error'}`}>
              {onlineCount > 0 ? 'CONNECTED' : 'OFFLINE'}
            </span>
          </div>
        </div>

        {/* Filters Row */}
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Sort By */}
          <div className="flex-1">
            <label className="text-xs text-text-secondary mb-1 block">
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-white text-sm focus:border-accent-primary focus:outline-none"
            >
              <option value="price">Price (Low to High)</option>
              <option value="latency">Latency (Low to High)</option>
              <option value="reputation">Reputation (High to Low)</option>
            </select>
          </div>

          {/* Filter Region */}
          <div className="flex-1">
            <label className="text-xs text-text-secondary mb-1 block">
              Region
            </label>
            <select
              value={filterRegion}
              onChange={(e) => setFilterRegion(e.target.value)}
              className="w-full px-3 py-2 bg-background-secondary border border-border rounded-lg text-white text-sm focus:border-accent-primary focus:outline-none"
            >
              {regions.map((region) => (
                <option key={region} value={region}>
                  {region === 'all' ? 'All Regions' : region}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Provider List */}
      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        {filteredAndSortedProviders.map((provider, index) => (
          <ProviderCard
            key={provider.id}
            provider={provider}
            isSelected={selectedProvider === provider.id}
            onClick={() => onSelectProvider(provider.id)}
            index={index}
          />
        ))}
      </div>
    </motion.div>
  )
}

interface ProviderCardProps {
  provider: Provider
  isSelected: boolean
  onClick: () => void
  index: number
}

function ProviderCard({ provider, isSelected, onClick, index }: ProviderCardProps) {
  return (
    <motion.div
      className={`glass-hover p-4 rounded-lg border transition-all ${
        !provider.online
          ? 'opacity-50 cursor-not-allowed border-border'
          : isSelected
          ? 'border-accent-primary bg-accent-primary/10 cursor-pointer'
          : 'border-border hover:border-accent-primary/50 cursor-pointer'
      }`}
      onClick={provider.online ? onClick : undefined}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={provider.online ? { scale: 1.02 } : {}}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-heading font-bold text-white">
              {provider.name}
            </h4>
            {isSelected && provider.online && (
              <span className="text-accent-primary">✓</span>
            )}
            {!provider.online && (
              <span className="text-xs px-2 py-0.5 rounded bg-status-error/20 text-status-error border border-status-error/30">
                OFFLINE
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span className={`w-1.5 h-1.5 rounded-full ${provider.online ? 'bg-status-success' : 'bg-status-error'}`} />
            <span>{provider.region}</span>
          </div>
        </div>

        {/* Price Badge */}
        <div className="text-right">
          <div className="text-lg font-black text-gradient">
            ${provider.price.toFixed(5)}
          </div>
          <div className="text-xs text-text-secondary">per 1K tokens</div>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div>
          <div className="text-xs text-text-secondary mb-1">Latency</div>
          <div className="text-sm font-bold text-accent-tertiary">
            {provider.latency}ms
          </div>
        </div>
        <div>
          <div className="text-xs text-text-secondary mb-1">Uptime</div>
          <div className="text-sm font-bold text-status-success">
            {provider.uptime}%
          </div>
        </div>
        <div>
          <div className="text-xs text-text-secondary mb-1">Reputation</div>
          <div className="text-sm font-bold text-accent-secondary">
            {provider.reputation}%
          </div>
        </div>
      </div>

      {/* Models */}
      <div className="flex flex-wrap gap-2">
        {provider.models.map((model) => (
          <span
            key={model}
            className="text-xs px-2 py-1 rounded bg-background-tertiary border border-border text-text-secondary"
          >
            {model}
          </span>
        ))}
      </div>

      {/* Total Requests */}
      <div className="mt-3 pt-3 border-t border-border-hover">
        <div className="flex justify-between items-center">
          <span className="text-xs text-text-secondary">Total Requests</span>
          <span className="text-xs font-mono text-white">
            {provider.totalRequests.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  )
}

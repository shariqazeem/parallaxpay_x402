'use client'

import { motion } from 'framer-motion'
import { useState, useMemo } from 'react'

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

const MOCK_PROVIDERS: Provider[] = [
  { id: 'node-1', name: 'ParallaxNode-Alpha', region: 'US-East', price: 0.00118, latency: 42, uptime: 99.97, reputation: 98.5, totalRequests: 847123, online: true, models: ['Qwen-2.5-72B', 'Llama-3.3-70B'] },
  { id: 'node-2', name: 'ParallaxNode-Beta', region: 'EU-West', price: 0.00122, latency: 38, uptime: 99.94, reputation: 97.2, totalRequests: 723456, online: true, models: ['Llama-3.3-70B', 'DeepSeek-V3'] },
  { id: 'node-3', name: 'ParallaxNode-Gamma', region: 'Asia-SE', price: 0.00115, latency: 51, uptime: 99.89, reputation: 96.8, totalRequests: 614789, online: true, models: ['Qwen-2.5-72B', 'Llama-3.1-8B'] },
  { id: 'node-4', name: 'ParallaxNode-Delta', region: 'US-West', price: 0.00129, latency: 47, uptime: 99.85, reputation: 95.4, totalRequests: 558234, online: true, models: ['DeepSeek-V3', 'Qwen-2.5-32B'] },
  { id: 'node-5', name: 'ParallaxNode-Epsilon', region: 'EU-Central', price: 0.00112, latency: 55, uptime: 99.81, reputation: 94.9, totalRequests: 492567, online: true, models: ['Llama-3.3-70B', 'Qwen-2.5-72B'] },
  { id: 'node-6', name: 'ParallaxNode-Zeta', region: 'US-Central', price: 0.00135, latency: 33, uptime: 99.92, reputation: 96.1, totalRequests: 634890, online: true, models: ['Qwen-2.5-72B', 'DeepSeek-V3'] },
  { id: 'node-7', name: 'ParallaxNode-Eta', region: 'Asia-East', price: 0.00108, latency: 62, uptime: 99.78, reputation: 93.7, totalRequests: 456123, online: false, models: ['Llama-3.1-8B', 'Qwen-2.5-32B'] },
]

export default function ProviderList({
  model,
  onSelectProvider,
  selectedProvider,
}: ProviderListProps) {
  const [sortBy, setSortBy] = useState<'price' | 'latency' | 'reputation'>('price')
  const [filterRegion, setFilterRegion] = useState<string>('all')

  const filteredAndSortedProviders = useMemo(() => {
    let filtered = MOCK_PROVIDERS.filter((p) => p.online)

    if (filterRegion !== 'all') {
      filtered = filtered.filter((p) => p.region === filterRegion)
    }

    return filtered.sort((a, b) => {
      if (sortBy === 'price') return a.price - b.price
      if (sortBy === 'latency') return a.latency - b.latency
      if (sortBy === 'reputation') return b.reputation - a.reputation
      return 0
    })
  }, [sortBy, filterRegion])

  const regions = ['all', 'US-East', 'US-West', 'US-Central', 'EU-West', 'EU-Central', 'Asia-SE', 'Asia-East']

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
            Providers ({filteredAndSortedProviders.length})
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-status-success rounded-full animate-pulse" />
            <span className="text-xs text-status-success font-semibold">
              ONLINE
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
      className={`glass-hover p-4 rounded-lg border cursor-pointer transition-all ${
        isSelected
          ? 'border-accent-primary bg-accent-primary/10'
          : 'border-border hover:border-accent-primary/50'
      }`}
      onClick={onClick}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h4 className="font-heading font-bold text-white">
              {provider.name}
            </h4>
            {isSelected && (
              <span className="text-accent-primary">✓</span>
            )}
          </div>
          <div className="flex items-center gap-2 text-xs text-text-secondary">
            <span className="w-1.5 h-1.5 bg-status-success rounded-full" />
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

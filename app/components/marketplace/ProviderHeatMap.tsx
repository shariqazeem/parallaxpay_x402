'use client'

/**
 * Provider Heat Map
 *
 * Visual grid showing provider performance with color coding
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface ProviderStatus {
  id: string
  name: string
  region: string
  latency: number
  uptime: number
  load: number
  status: 'excellent' | 'good' | 'degraded' | 'down'
}

export default function ProviderHeatMap() {
  const [providers, setProviders] = useState<ProviderStatus[]>([])
  const [selectedRegion, setSelectedRegion] = useState<string | null>(null)

  useEffect(() => {
    const generateProviders = () => {
      const regions = ['US-East', 'US-West', 'EU-West', 'EU-Central', 'Asia-SE', 'Asia-NE', 'SA-East', 'Africa']

      const newProviders: ProviderStatus[] = regions.map((region, idx) => {
        const latency = 30 + Math.random() * 170
        const uptime = 95 + Math.random() * 5
        const load = Math.random() * 100

        let status: 'excellent' | 'good' | 'degraded' | 'down'
        if (latency < 50 && uptime > 99) status = 'excellent'
        else if (latency < 100 && uptime > 98) status = 'good'
        else if (latency < 200 && uptime > 95) status = 'degraded'
        else status = 'down'

        return {
          id: `provider-${idx}`,
          name: `Node-${idx + 1}`,
          region,
          latency: Math.round(latency),
          uptime: parseFloat(uptime.toFixed(2)),
          load: Math.round(load),
          status,
        }
      })

      setProviders(newProviders)
    }

    generateProviders()
    const interval = setInterval(generateProviders, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'excellent':
        return 'bg-status-success'
      case 'good':
        return 'bg-accent-secondary'
      case 'degraded':
        return 'bg-status-warning'
      case 'down':
        return 'bg-status-error'
      default:
        return 'bg-text-muted'
    }
  }

  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'excellent':
        return '🟢'
      case 'good':
        return '🟡'
      case 'degraded':
        return '🟠'
      case 'down':
        return '🔴'
      default:
        return '⚪'
    }
  }

  const filteredProviders = selectedRegion
    ? providers.filter(p => p.region === selectedRegion)
    : providers

  return (
    <div className="bg-white border-2 border-purple-200 rounded-xl p-6 shadow-lg">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-heading font-bold text-black">🗺️ Provider Heat Map</h3>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-xs text-green-600 font-semibold">Real-time</span>
        </div>
      </div>

      {/* Region Filter */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => setSelectedRegion(null)}
          className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm ${
            selectedRegion === null
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black border border-gray-200'
          }`}
        >
          All Regions
        </button>
        {Array.from(new Set(providers.map(p => p.region))).map(region => (
          <button
            key={region}
            onClick={() => setSelectedRegion(region)}
            className={`px-3 py-2 rounded-lg text-xs font-semibold transition-all shadow-sm ${
              selectedRegion === region
                ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:text-black border border-gray-200'
            }`}
          >
            {region}
          </button>
        ))}
      </div>

      {/* Heat Map Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {filteredProviders.map((provider, idx) => (
          <motion.div
            key={provider.id}
            className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
              getStatusColor(provider.status)
            } bg-opacity-10 hover:bg-opacity-20 ${
              provider.status === 'excellent' ? 'border-status-success' :
              provider.status === 'good' ? 'border-accent-secondary' :
              provider.status === 'degraded' ? 'border-status-warning' :
              'border-status-error'
            }`}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.05 }}
          >
            <div className="flex items-start justify-between mb-2">
              <div>
                <div className="font-heading font-bold text-black text-sm">
                  {provider.name}
                </div>
                <div className="text-xs text-gray-600 font-medium">
                  {provider.region}
                </div>
              </div>
              <div className="text-2xl">
                {getStatusEmoji(provider.status)}
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Latency:</span>
                <span className={`font-mono font-bold ${
                  provider.latency < 50 ? 'text-green-600' :
                  provider.latency < 100 ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {provider.latency}ms
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Uptime:</span>
                <span className={`font-mono font-bold ${
                  provider.uptime > 99 ? 'text-green-600' :
                  provider.uptime > 98 ? 'text-orange-600' :
                  'text-red-600'
                }`}>
                  {provider.uptime}%
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-600">Load:</span>
                <span className="font-mono font-bold text-black">
                  {provider.load}%
                </span>
              </div>

              {/* Load Bar */}
              <div className="w-full bg-gray-200 rounded-full h-1.5 overflow-hidden mt-2">
                <motion.div
                  className={`h-full rounded-full ${
                    provider.load < 60 ? 'bg-green-500' :
                    provider.load < 80 ? 'bg-orange-500' :
                    'bg-red-500'
                  }`}
                  initial={{ width: 0 }}
                  animate={{ width: `${provider.load}%` }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t-2 border-gray-200 flex items-center gap-4 text-xs flex-wrap">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-gray-700 font-medium">Excellent {'(<50ms, >99%)'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-green-400" />
          <span className="text-gray-700 font-medium">Good {'(<100ms, >98%)'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-orange-500" />
          <span className="text-gray-700 font-medium">Degraded {'(<200ms, >95%)'}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded bg-red-500" />
          <span className="text-gray-700 font-medium">Down</span>
        </div>
      </div>
    </div>
  )
}

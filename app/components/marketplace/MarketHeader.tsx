'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import WalletButton from '../WalletButton'
import { getRealProviderManager } from '@/lib/real-provider-manager'

export default function MarketHeader() {
  const [stats, setStats] = useState({
    marketCap: 127432,
    volume24h: 89234,
    trades24h: 2143,
    activeProviders: 0,
    avgLatency: 0,
    totalAgents: 143,
  })

  // Update stats with REAL data from provider manager
  useEffect(() => {
    const updateRealStats = () => {
      try {
        const providerManager = getRealProviderManager()
        const realStats = providerManager.getStats()

        setStats((prev) => ({
          ...prev,
          activeProviders: realStats.online,
          avgLatency: realStats.avgLatency,
        }))
      } catch (error) {
        console.error('Failed to get provider stats:', error)
      }
    }

    // Update immediately
    updateRealStats()

    // Then update every 5 seconds with real data
    const interval = setInterval(() => {
      updateRealStats()

      // Also update simulated stats
      setStats((prev) => ({
        ...prev,
        volume24h: prev.volume24h + Math.floor(Math.random() * 100),
        trades24h: prev.trades24h + Math.floor(Math.random() * 3),
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="border-b border-gray-200 bg-white/90 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-black">
              <span className="text-black">ParallaxPay</span>
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-700 font-semibold">
                LIVE
              </span>
            </div>
          </div>

          <WalletButton />
        </div>

        {/* Live Stats Ticker */}
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          <StatCard
            label="Market Cap"
            value={`$${(stats.marketCap / 1000).toFixed(1)}K`}
            change={2.4}
            icon="💰"
          />
          <StatCard
            label="24h Volume"
            value={`$${(stats.volume24h / 1000).toFixed(1)}K`}
            change={5.7}
            icon="📈"
          />
          <StatCard
            label="24h Trades"
            value={stats.trades24h.toLocaleString()}
            change={12.3}
            icon="⚡"
          />
          <StatCard
            label="Providers"
            value={stats.activeProviders}
            icon="🖥️"
          />
          <StatCard
            label="Avg Latency"
            value={`${stats.avgLatency}ms`}
            icon="⏱️"
            trend={stats.avgLatency < 90 ? 'good' : 'neutral'}
          />
          <StatCard
            label="Active Agents"
            value={stats.totalAgents}
            change={8.1}
            icon="🤖"
          />
        </div>
      </div>
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  change?: number
  icon: string
  trend?: 'good' | 'neutral' | 'bad'
}

function StatCard({ label, value, change, icon, trend }: StatCardProps) {
  return (
    <motion.div
      className="bg-white border-2 border-gray-200 hover:border-gray-300 p-3 rounded-xl shadow-sm hover:shadow-md transition-all"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs text-gray-600 font-semibold">{label}</span>
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <div className="text-lg font-black text-black">{value}</div>
        {change !== undefined && (
          <div
            className={`text-xs font-semibold ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change >= 0 ? '+' : ''}
            {change.toFixed(1)}%
          </div>
        )}
        {trend && !change && (
          <div
            className={`text-xs font-semibold ${
              trend === 'good'
                ? 'text-green-600'
                : trend === 'bad'
                ? 'text-red-600'
                : 'text-gray-600'
            }`}
          >
            {trend === 'good' ? '✓' : trend === 'bad' ? '✗' : '•'}
          </div>
        )}
      </div>
    </motion.div>
  )
}

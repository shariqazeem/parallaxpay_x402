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
    <div className="border-b border-border bg-background-secondary/50 backdrop-blur-xl sticky top-0 z-50">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-4">
            <h1 className="text-2xl font-heading font-black">
              <span className="text-gradient">ParallaxPay</span>
            </h1>
            <div className="flex items-center gap-2 px-3 py-1 glass rounded-full">
              <span className="w-2 h-2 bg-status-success rounded-full animate-pulse" />
              <span className="text-xs text-status-success font-semibold">
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
      className="glass-hover p-3 rounded-lg"
      whileHover={{ scale: 1.02 }}
    >
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className="text-sm">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <div className="text-lg font-black text-white">{value}</div>
        {change !== undefined && (
          <div
            className={`text-xs font-semibold ${
              change >= 0 ? 'text-status-success' : 'text-status-error'
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
                ? 'text-status-success'
                : trend === 'bad'
                ? 'text-status-error'
                : 'text-text-secondary'
            }`}
          >
            {trend === 'good' ? '✓' : trend === 'bad' ? '✗' : '•'}
          </div>
        )}
      </div>
    </motion.div>
  )
}

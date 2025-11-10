'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import WalletButton from '../WalletButton'
import { getRealProviderManager } from '@/lib/real-provider-manager'
import Link from 'next/link'

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
    <div className="border-b-2 border-purple-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
      <div className="max-w-[1920px] mx-auto px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-6">
            <Link href="/">
              <h1 className="text-2xl font-black cursor-pointer hover:opacity-80 transition-opacity">
                <span className="text-black">ParallaxPay</span>
              </h1>
            </Link>
            <div className="flex items-center gap-2 px-3 py-1 bg-green-50 border border-green-200 rounded-full">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <span className="text-xs text-green-700 font-semibold">
                LIVE
              </span>
            </div>
            {/* Navigation Links */}
            <nav className="hidden md:flex items-center gap-4">
              <Link href="/" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors">
                Dashboard
              </Link>
              <Link href="/marketplace" className="text-sm font-semibold text-purple-600 border-b-2 border-purple-600">
                Marketplace
              </Link>
              <Link href="/agents" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors">
                Agents
              </Link>
              <Link href="/swarm" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors">
                Swarm
              </Link>
              <Link href="/transactions" className="text-sm font-semibold text-gray-700 hover:text-purple-600 transition-colors">
                Transactions
              </Link>
            </nav>
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
            value={`${stats.avgLatency || 0}ms`}
            icon="⏱️"
            trend={stats.avgLatency < 90 ? 'good' : 'neutral'}
          />
          <StatCard
            label="Active Agents"
            value={stats.totalAgents || 0}
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
  // Determine color scheme based on label
  const getColorScheme = () => {
    if (label.includes('Market')) return { border: 'border-purple-300', bg: 'bg-gradient-to-br from-purple-50 to-pink-50', text: 'text-purple-600' }
    if (label.includes('Volume')) return { border: 'border-blue-300', bg: 'bg-gradient-to-br from-blue-50 to-cyan-50', text: 'text-blue-600' }
    if (label.includes('Trades')) return { border: 'border-green-300', bg: 'bg-gradient-to-br from-green-50 to-emerald-50', text: 'text-green-600' }
    if (label.includes('Providers')) return { border: 'border-orange-300', bg: 'bg-gradient-to-br from-orange-50 to-amber-50', text: 'text-orange-600' }
    if (label.includes('Latency')) return { border: 'border-cyan-300', bg: 'bg-gradient-to-br from-cyan-50 to-blue-50', text: 'text-blue-700' }
    if (label.includes('Agents')) return { border: 'border-pink-300', bg: 'bg-gradient-to-br from-pink-50 to-rose-50', text: 'text-purple-700' }
    return { border: 'border-gray-300', bg: 'bg-white', text: 'text-gray-600' }
  }

  const colors = getColorScheme()

  return (
    <motion.div
      className={`${colors.bg} border-2 ${colors.border} hover:shadow-lg p-3 rounded-xl shadow-md transition-all`}
      whileHover={{ scale: 1.05, y: -2 }}
    >
      <div className="flex items-start justify-between mb-1">
        <span className={`text-xs ${colors.text} font-bold uppercase tracking-wider`}>{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className="flex items-end gap-2">
        <div className={`text-xl font-black text-black`}>{value}</div>
        {change !== undefined && (
          <div
            className={`text-xs font-bold ${
              change >= 0 ? 'text-green-600' : 'text-red-600'
            }`}
          >
            {change >= 0 ? '↗' : '↘'}
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

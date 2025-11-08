'use client'

/**
 * Competition Leaderboard
 *
 * Gamified leaderboard showing top agents and traders
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

interface LeaderboardEntry {
  rank: number
  name: string
  strategy: string
  profit: number
  trades: number
  winRate: number
  avgSavings: number
  streak: number
  badge?: string
  isCurrentUser?: boolean
}

export default function LeaderboardPage() {
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('7d')
  const [category, setCategory] = useState<'profit' | 'trades' | 'winRate' | 'savings'>('profit')
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])

  useEffect(() => {
    // Generate demo leaderboard data
    const agents = [
      { name: '🎯 Arbitrage Master', strategy: 'arbitrage' },
      { name: '💰 Cost Crusher', strategy: 'cost' },
      { name: '⚡ Speed King', strategy: 'latency' },
      { name: '🧠 AI Optimizer Pro', strategy: 'smart' },
      { name: '🐋 Whale Trader', strategy: 'whale' },
      { name: '🔍 Market Scanner', strategy: 'balanced' },
      { name: '🎪 Swarm Leader', strategy: 'smart' },
      { name: '💎 Diamond Hands', strategy: 'balanced' },
      { name: '🚀 Rocket Agent', strategy: 'cost' },
      { name: '🌟 StarFinder', strategy: 'latency' },
    ]

    const entries: LeaderboardEntry[] = agents.map((agent, idx) => ({
      rank: idx + 1,
      name: agent.name,
      strategy: agent.strategy,
      profit: (100 - idx * 8) + Math.random() * 10,
      trades: Math.floor(500 - idx * 40 + Math.random() * 100),
      winRate: 98 - idx * 2 + Math.random() * 3,
      avgSavings: 45 - idx * 3 + Math.random() * 5,
      streak: Math.floor(20 - idx * 1.5 + Math.random() * 5),
      badge: idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : undefined,
      isCurrentUser: idx === 4, // Highlight user's position
    }))

    // Sort by category
    entries.sort((a, b) => {
      switch (category) {
        case 'profit':
          return b.profit - a.profit
        case 'trades':
          return b.trades - a.trades
        case 'winRate':
          return b.winRate - a.winRate
        case 'savings':
          return b.avgSavings - a.avgSavings
        default:
          return 0
      }
    })

    // Update ranks
    entries.forEach((entry, idx) => {
      entry.rank = idx + 1
    })

    setLeaderboard(entries)
  }, [category, timeframe])

  return (
    <div className="min-h-screen bg-background-primary text-white">
      {/* Header */}
      <div className="border-b border-border bg-background-secondary/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <h1 className="text-2xl font-heading font-black cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-gradient">ParallaxPay</span>
                </h1>
              </Link>
              <div className="text-text-muted">/</div>
              <h2 className="text-xl font-heading font-bold text-white">
                🏆 Competition Leaderboard
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <WalletMultiButton className="!bg-gradient-to-r !from-accent-primary !to-accent-secondary !rounded-lg !px-4 !py-2 !text-sm !font-bold hover:!scale-105 !transition-transform" />
              <Link href="/swarm">
                <button className="glass-hover px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all">
                  🐝 Swarm
                </button>
              </Link>
              <Link href="/agents">
                <button className="glass-hover px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all">
                  My Agents
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
        {/* Hero */}
        <div className="glass rounded-xl p-8 border border-accent-primary/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 to-accent-secondary/5" />
          <div className="relative z-10">
            <h1 className="text-4xl font-heading font-black mb-4">
              <span className="text-gradient">Competition Leaderboard</span> 🏆
            </h1>
            <p className="text-lg text-text-secondary max-w-3xl">
              Compete with other traders and agents. Top performers earn badges, prizes, and bragging rights!
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Timeframe */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Timeframe:</span>
            {(['24h', '7d', '30d', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-accent-primary text-white'
                    : 'glass-hover text-text-muted hover:text-white'
                }`}
              >
                {tf === 'all' ? 'All Time' : tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-text-muted">Rank by:</span>
            {(['profit', 'trades', 'winRate', 'savings'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  category === cat
                    ? 'bg-accent-secondary text-white'
                    : 'glass-hover text-text-muted hover:text-white'
                }`}
              >
                {cat === 'winRate' ? 'Win Rate' :
                 cat === 'avgSavings' ? 'Savings %' :
                 cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="glass rounded-xl border border-border overflow-hidden">
          {/* Header */}
          <div className="px-6 py-4 bg-background-secondary border-b border-border">
            <div className="grid grid-cols-12 gap-4 text-xs text-text-muted font-semibold uppercase">
              <div className="col-span-1">Rank</div>
              <div className="col-span-3">Agent</div>
              <div className="col-span-2">Strategy</div>
              <div className="col-span-1 text-right">Profit ($)</div>
              <div className="col-span-1 text-right">Trades</div>
              <div className="col-span-2 text-right">Win Rate</div>
              <div className="col-span-1 text-right">Savings %</div>
              <div className="col-span-1 text-right">Streak</div>
            </div>
          </div>

          {/* Entries */}
          <div className="divide-y divide-border">
            {leaderboard.map((entry, idx) => (
              <motion.div
                key={entry.name}
                className={`px-6 py-4 hover:bg-background-secondary/50 transition-colors ${
                  entry.isCurrentUser ? 'bg-accent-primary/10 border-l-4 border-accent-primary' : ''
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Rank */}
                  <div className="col-span-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-heading font-black ${
                        entry.rank === 1 ? 'text-accent-secondary' :
                        entry.rank === 2 ? 'text-text-secondary' :
                        entry.rank === 3 ? 'text-status-warning' :
                        'text-text-muted'
                      }`}>
                        #{entry.rank}
                      </span>
                      {entry.badge && <span className="text-xl">{entry.badge}</span>}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="col-span-3">
                    <div className="font-heading font-bold text-white text-lg">
                      {entry.name}
                    </div>
                    {entry.isCurrentUser && (
                      <div className="text-xs text-accent-primary font-semibold">YOU</div>
                    )}
                  </div>

                  {/* Strategy */}
                  <div className="col-span-2">
                    <div className="text-sm px-3 py-1 rounded-lg bg-background-secondary text-text-secondary inline-block">
                      {entry.strategy}
                    </div>
                  </div>

                  {/* Profit */}
                  <div className="col-span-1 text-right">
                    <div className="text-status-success font-mono font-bold">
                      ${entry.profit.toFixed(2)}
                    </div>
                  </div>

                  {/* Trades */}
                  <div className="col-span-1 text-right">
                    <div className="text-white font-mono">
                      {entry.trades.toLocaleString()}
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div className="col-span-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className={`font-mono font-bold ${
                        entry.winRate > 95 ? 'text-status-success' :
                        entry.winRate > 90 ? 'text-status-warning' :
                        'text-text-muted'
                      }`}>
                        {entry.winRate.toFixed(1)}%
                      </div>
                      <div className="w-16 bg-background-secondary rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            entry.winRate > 95 ? 'bg-status-success' :
                            entry.winRate > 90 ? 'bg-status-warning' :
                            'bg-text-muted'
                          }`}
                          style={{ width: `${entry.winRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="col-span-1 text-right">
                    <div className="text-accent-secondary font-mono font-bold">
                      {entry.avgSavings.toFixed(1)}%
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="col-span-1 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xl">🔥</span>
                      <span className="font-mono font-bold text-white">{entry.streak}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="glass rounded-xl p-8 border border-border text-center">
          <h3 className="text-2xl font-heading font-bold mb-4">Want to compete?</h3>
          <p className="text-text-secondary mb-6">Deploy your own agent and climb the leaderboard!</p>
          <Link href="/agent-builder">
            <button className="glass-hover neon-border px-8 py-4 rounded-xl font-heading font-bold hover:scale-105 transition-all">
              <span className="text-gradient">🧠 Build Your Agent</span>
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

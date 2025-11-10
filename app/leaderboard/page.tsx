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
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b border-gray-200 bg-white/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <h1 className="text-2xl font-black cursor-pointer hover:opacity-70 transition-opacity">
                  <span className="text-black">ParallaxPay</span>
                </h1>
              </Link>
              <div className="text-gray-400">/</div>
              <h2 className="text-xl font-bold text-black">
                🏆 Competition Leaderboard
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <WalletMultiButton className="!bg-black !text-white !rounded-lg !px-4 !py-2 !text-sm !font-bold hover:!bg-gray-800 !transition-all" />
              <Link href="/swarm">
                <button className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-black transition-all border border-gray-200 hover:border-gray-400">
                  🐝 Swarm
                </button>
              </Link>
              <Link href="/agents">
                <button className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-black transition-all border border-gray-200 hover:border-gray-400">
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
        <div className="bg-white rounded-xl p-8 border-2 border-gray-200 shadow-sm relative overflow-hidden">
          <div className="absolute inset-0 bg-gray-50" />
          <div className="relative z-10">
            <h1 className="text-4xl font-black mb-4 text-black">
              Competition Leaderboard 🏆
            </h1>
            <p className="text-lg text-gray-600 max-w-3xl">
              Compete with other traders and agents. Top performers earn badges, prizes, and bragging rights!
            </p>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center justify-between flex-wrap gap-4">
          {/* Timeframe */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Timeframe:</span>
            {(['24h', '7d', '30d', 'all'] as const).map((tf) => (
              <button
                key={tf}
                onClick={() => setTimeframe(tf)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  timeframe === tf
                    ? 'bg-black text-white'
                    : 'bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200'
                }`}
              >
                {tf === 'all' ? 'All Time' : tf.toUpperCase()}
              </button>
            ))}
          </div>

          {/* Category */}
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-600">Rank by:</span>
            {(['profit', 'trades', 'winRate', 'savings'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setCategory(cat)}
                className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                  category === cat
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:text-black hover:bg-gray-200'
                }`}
              >
                {cat === 'winRate' ? 'Win Rate' :
                 cat === 'savings' ? 'Savings %' :
                 cat.charAt(0).toUpperCase() + cat.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
          {/* Header */}
          <div className="px-6 py-4 bg-gray-50 border-b border-gray-200">
            <div className="grid grid-cols-12 gap-4 text-xs text-gray-600 font-semibold uppercase">
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
          <div className="divide-y divide-gray-200">
            {leaderboard.map((entry, idx) => (
              <motion.div
                key={entry.name}
                className={`px-6 py-4 hover:bg-gray-50 transition-colors ${
                  entry.isCurrentUser ? 'bg-blue-50 border-l-4 border-blue-600' : ''
                }`}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.05 }}
              >
                <div className="grid grid-cols-12 gap-4 items-center">
                  {/* Rank */}
                  <div className="col-span-1">
                    <div className="flex items-center gap-2">
                      <span className={`text-2xl font-black ${
                        entry.rank === 1 ? 'text-yellow-500' :
                        entry.rank === 2 ? 'text-gray-400' :
                        entry.rank === 3 ? 'text-orange-500' :
                        'text-gray-500'
                      }`}>
                        #{entry.rank}
                      </span>
                      {entry.badge && <span className="text-xl">{entry.badge}</span>}
                    </div>
                  </div>

                  {/* Name */}
                  <div className="col-span-3">
                    <div className="font-bold text-black text-lg">
                      {entry.name}
                    </div>
                    {entry.isCurrentUser && (
                      <div className="text-xs text-blue-600 font-semibold">YOU</div>
                    )}
                  </div>

                  {/* Strategy */}
                  <div className="col-span-2">
                    <div className="text-sm px-3 py-1 rounded-lg bg-gray-100 text-gray-700 inline-block">
                      {entry.strategy}
                    </div>
                  </div>

                  {/* Profit */}
                  <div className="col-span-1 text-right">
                    <div className="text-green-600 font-mono font-bold">
                      ${entry.profit.toFixed(2)}
                    </div>
                  </div>

                  {/* Trades */}
                  <div className="col-span-1 text-right">
                    <div className="text-black font-mono">
                      {entry.trades.toLocaleString()}
                    </div>
                  </div>

                  {/* Win Rate */}
                  <div className="col-span-2 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <div className={`font-mono font-bold ${
                        entry.winRate > 95 ? 'text-green-600' :
                        entry.winRate > 90 ? 'text-yellow-600' :
                        'text-gray-500'
                      }`}>
                        {entry.winRate.toFixed(1)}%
                      </div>
                      <div className="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            entry.winRate > 95 ? 'bg-green-600' :
                            entry.winRate > 90 ? 'bg-yellow-600' :
                            'bg-gray-400'
                          }`}
                          style={{ width: `${entry.winRate}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Savings */}
                  <div className="col-span-1 text-right">
                    <div className="text-blue-600 font-mono font-bold">
                      {entry.avgSavings.toFixed(1)}%
                    </div>
                  </div>

                  {/* Streak */}
                  <div className="col-span-1 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <span className="text-xl">🔥</span>
                      <span className="font-mono font-bold text-black">{entry.streak}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="bg-white rounded-xl p-8 border-2 border-gray-200 text-center shadow-sm">
          <h3 className="text-2xl font-bold mb-4 text-black">Want to compete?</h3>
          <p className="text-gray-600 mb-6">Deploy your own agent and climb the leaderboard!</p>
          <Link href="/agent-builder">
            <button className="bg-black text-white px-8 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all">
              🧠 Build Your Agent
            </button>
          </Link>
        </div>
      </div>
    </div>
  )
}

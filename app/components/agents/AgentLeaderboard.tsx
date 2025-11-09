'use client'

/**
 * AGENT LEADERBOARD 🏆
 *
 * Shows top agents by reputation
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAgentIdentityManager, type AgentIdentity } from '@/lib/agent-identity'

export default function AgentLeaderboard() {
  const [leaderboard, setLeaderboard] = useState<AgentIdentity[]>([])

  useEffect(() => {
    const updateLeaderboard = () => {
      try {
        const identityManager = getAgentIdentityManager()
        const top = identityManager.getLeaderboard(10)
        setLeaderboard(top)
      } catch (err) {
        console.error('Failed to load leaderboard:', err)
      }
    }

    updateLeaderboard()
    const interval = setInterval(updateLeaderboard, 5000)

    return () => clearInterval(interval)
  }, [])

  if (leaderboard.length === 0) {
    return (
      <div className="glass p-6 rounded-xl border border-border">
        <h3 className="text-xl font-heading font-bold mb-4 text-white">
          🏆 Leaderboard
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">🏆</div>
          <p className="text-text-secondary text-sm">
            No agents on the leaderboard yet
          </p>
          <p className="text-xs text-text-muted">
            Deploy agents to start competing!
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="glass p-6 rounded-xl border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-heading font-bold text-white">
          🏆 Leaderboard
        </h3>
        <div className="text-xs text-text-muted">
          Top {leaderboard.length} Agents
        </div>
      </div>

      <div className="space-y-2">
        {leaderboard.map((identity, index) => (
          <LeaderboardEntry
            key={identity.id}
            identity={identity}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  )
}

// Leaderboard Entry Component
function LeaderboardEntry({
  identity,
  rank,
}: {
  identity: AgentIdentity
  rank: number
}) {
  const getMedalIcon = (rank: number) => {
    if (rank === 1) return '🥇'
    if (rank === 2) return '🥈'
    if (rank === 3) return '🥉'
    return `#${rank}`
  }

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Legendary': return 'text-yellow-400'
      case 'Elite': return 'text-purple-400'
      case 'Expert': return 'text-blue-400'
      case 'Trusted': return 'text-green-400'
      default: return 'text-gray-400'
    }
  }

  const successRate = identity.stats.totalExecutions > 0
    ? (identity.stats.successfulExecutions / identity.stats.totalExecutions) * 100
    : 0

  return (
    <motion.div
      className="glass-hover p-3 rounded-lg border border-border flex items-center gap-3"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: rank * 0.05 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Rank */}
      <div className="text-2xl font-bold w-12 text-center">
        {getMedalIcon(rank)}
      </div>

      {/* Agent Info */}
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <div className="font-heading font-bold text-white">
            {identity.name}
          </div>
          {identity.isVerified && (
            <div className="text-xs">✓</div>
          )}
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className={`font-semibold ${getLevelColor(identity.reputation.level)}`}>
            {identity.reputation.level}
          </span>
          <span className="text-text-muted">
            {identity.stats.totalExecutions} runs
          </span>
          <span className="text-status-success">
            {successRate.toFixed(0)}% success
          </span>
        </div>
      </div>

      {/* Reputation Score */}
      <div className="text-right">
        <div className="text-xl font-heading font-bold text-gradient">
          {identity.reputation.score}
        </div>
        <div className="text-xs text-text-muted">reputation</div>
      </div>
    </motion.div>
  )
}

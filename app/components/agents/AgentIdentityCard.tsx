'use client'

/**
 * AGENT IDENTITY CARD 🏆
 *
 * Shows agent identity, reputation, and badges
 */

import { motion } from 'framer-motion'
import { AgentIdentity } from '@/lib/agent-identity'

export default function AgentIdentityCard({ identity }: { identity: AgentIdentity }) {
  const { reputation, stats, badges } = identity

  // Get level color
  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Legendary': return 'from-yellow-500 to-orange-500'
      case 'Elite': return 'from-purple-500 to-pink-500'
      case 'Expert': return 'from-blue-500 to-cyan-500'
      case 'Trusted': return 'from-green-500 to-emerald-500'
      default: return 'from-gray-500 to-slate-500'
    }
  }

  const successRate = stats.totalExecutions > 0
    ? (stats.successfulExecutions / stats.totalExecutions) * 100
    : 0

  return (
    <motion.div
      className="glass p-6 rounded-xl border border-border"
      whileHover={{ scale: 1.02 }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <h3 className="text-lg font-heading font-bold text-white">
              {identity.name}
            </h3>
            {identity.isVerified && (
              <div className="text-xs bg-status-success/20 text-status-success px-2 py-0.5 rounded flex items-center gap-1">
                ✓ Verified
              </div>
            )}
          </div>

          {/* Reputation Level */}
          <div className={`inline-block px-3 py-1 rounded-full bg-gradient-to-r ${getLevelColor(reputation.level)} text-white text-sm font-bold`}>
            {reputation.level}
          </div>
        </div>

        {/* Reputation Score */}
        <div className="text-right">
          <div className="text-2xl font-heading font-bold text-white">
            {reputation.score}
          </div>
          <div className="text-xs text-text-muted">Reputation</div>
        </div>
      </div>

      {/* Reputation Breakdown */}
      <div className="grid grid-cols-2 gap-2 mb-4">
        <ReputationBar
          label="Performance"
          value={reputation.performanceScore}
          max={300}
          color="status-success"
        />
        <ReputationBar
          label="Reliability"
          value={reputation.reliabilityScore}
          max={300}
          color="accent-primary"
        />
        <ReputationBar
          label="Efficiency"
          value={reputation.efficiencyScore}
          max={200}
          color="status-warning"
        />
        <ReputationBar
          label="Community"
          value={reputation.communityScore}
          max={200}
          color="accent-secondary"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <StatItem label="Executions" value={stats.totalExecutions.toString()} />
        <StatItem label="Success Rate" value={`${successRate.toFixed(0)}%`} />
        <StatItem label="Savings" value={`$${stats.totalSavings.toFixed(4)}`} />
      </div>

      {/* Badges */}
      {badges.length > 0 && (
        <div>
          <div className="text-xs text-text-secondary mb-2">Badges</div>
          <div className="flex flex-wrap gap-2">
            {badges.map((badge) => (
              <motion.div
                key={badge.id}
                className="glass-hover px-2 py-1 rounded text-xs flex items-center gap-1"
                title={badge.description}
                whileHover={{ scale: 1.1 }}
              >
                <span>{badge.icon}</span>
                <span className="text-white">{badge.name}</span>
              </motion.div>
            ))}
          </div>
        </div>
      )}

      {/* Footer Stats */}
      <div className="mt-4 pt-4 border-t border-border grid grid-cols-2 gap-2 text-xs">
        <div>
          <div className="text-text-muted">Created</div>
          <div className="text-white font-mono">
            {new Date(identity.createdAt).toLocaleDateString()}
          </div>
        </div>
        <div>
          <div className="text-text-muted">Last Active</div>
          <div className="text-white font-mono">
            {new Date(stats.lastActive).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </motion.div>
  )
}

// Reputation Bar Component
function ReputationBar({
  label,
  value,
  max,
  color,
}: {
  label: string
  value: number
  max: number
  color: string
}) {
  const percentage = (value / max) * 100

  return (
    <div>
      <div className="flex items-center justify-between mb-1">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className="text-xs text-white font-mono">{value}/{max}</span>
      </div>
      <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
        <motion.div
          className={`h-full bg-${color}`}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
        />
      </div>
    </div>
  )
}

// Stat Item Component
function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="glass-hover p-2 rounded text-center">
      <div className="text-xs text-text-muted mb-1">{label}</div>
      <div className="text-sm font-bold text-white">{value}</div>
    </div>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { supabase, TransactionDB } from '@/lib/supabase'
import Link from 'next/link'

interface Activity {
  id: string
  type: 'agent_run' | 'agent_deployed' | 'badge_earned' | 'swarm_consensus'
  agentName: string
  cost?: number
  timestamp: number
  txHash?: string
  details?: string
}

export function LiveActivityFeed() {
  const [activities, setActivities] = useState<Activity[]>([])
  const [isLive, setIsLive] = useState(true)

  useEffect(() => {
    // Initial load
    loadActivities()

    // Poll every 3 seconds for updates
    const interval = setInterval(() => {
      if (isLive) {
        loadActivities()
      }
    }, 3000)

    return () => clearInterval(interval)
  }, [isLive])

  const loadActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(10)

      if (error) {
        console.error('Failed to load activities:', error)
        return
      }

      if (data) {
        // Convert transactions to activities
        const acts: Activity[] = data.map((tx: TransactionDB) => ({
          id: tx.id,
          type: 'agent_run',
          agentName: tx.agent_name || 'Unknown Agent',
          cost: tx.cost || 0,
          timestamp: tx.timestamp,
          txHash: tx.tx_hash,
          details: `${tx.provider || 'Parallax'} • ${tx.tokens || 0} tokens`
        }))

        setActivities(acts)
      }
    } catch (err) {
      console.error('Error loading activities:', err)
    }
  }

  const formatTimeAgo = (timestamp: number) => {
    const seconds = Math.floor((Date.now() - timestamp) / 1000)

    if (seconds < 60) return `${seconds}s ago`
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`
    return `${Math.floor(seconds / 86400)}d ago`
  }

  const getActivityIcon = (type: Activity['type']) => {
    switch (type) {
      case 'agent_run': return '⚡'
      case 'agent_deployed': return '🚀'
      case 'badge_earned': return '🏆'
      case 'swarm_consensus': return '🤝'
      default: return '📍'
    }
  }

  const getActivityColor = (type: Activity['type']) => {
    switch (type) {
      case 'agent_run': return 'text-cyan-400'
      case 'agent_deployed': return 'text-green-400'
      case 'badge_earned': return 'text-yellow-400'
      case 'swarm_consensus': return 'text-purple-400'
      default: return 'text-gray-400'
    }
  }

  return (
    <div className="glass border border-cyan-500/30 rounded-xl p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-heading font-bold text-white">⚡ Live Activity</h3>
          {isLive && (
            <div className="flex items-center gap-1">
              <div className="relative">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-xs text-green-400 font-semibold">LIVE</span>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsLive(!isLive)}
          className="text-xs text-gray-400 hover:text-white transition-colors"
        >
          {isLive ? 'Pause' : 'Resume'}
        </button>
      </div>

      {/* Activity List */}
      <div className="space-y-2 max-h-[500px] overflow-y-auto custom-scrollbar">
        <AnimatePresence>
          {activities.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-8 text-gray-500 text-sm"
            >
              <div className="text-3xl mb-2">👀</div>
              <div>Waiting for activity...</div>
              <div className="text-xs mt-1">Run an agent to see it here!</div>
            </motion.div>
          )}

          {activities.map((activity, index) => (
            <motion.div
              key={activity.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ delay: index * 0.05 }}
              className="glass-hover p-3 rounded-lg border border-gray-700/50 hover:border-cyan-500/50 transition-all"
            >
              <div className="flex items-start gap-2">
                <div className="text-lg">{getActivityIcon(activity.type)}</div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className={`text-sm font-semibold truncate ${getActivityColor(activity.type)}`}>
                        {activity.agentName}
                      </div>

                      {activity.details && (
                        <div className="text-xs text-gray-400 truncate">
                          {activity.details}
                        </div>
                      )}

                      {activity.cost !== undefined && (
                        <div className="text-xs font-mono text-green-400 mt-1">
                          ${activity.cost.toFixed(4)}
                        </div>
                      )}
                    </div>

                    <div className="text-xs text-gray-500 whitespace-nowrap">
                      {formatTimeAgo(activity.timestamp)}
                    </div>
                  </div>

                  {activity.txHash && (
                    <Link
                      href={`https://explorer.solana.com/tx/${activity.txHash}?cluster=devnet`}
                      target="_blank"
                      className="text-xs text-cyan-400 hover:text-cyan-300 mt-1 inline-flex items-center gap-1"
                    >
                      <span>View on Solana</span>
                      <span>→</span>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer Stats */}
      {activities.length > 0 && (
        <div className="mt-4 pt-4 border-t border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <div className="text-xl font-bold text-white">{activities.length}</div>
              <div className="text-xs text-gray-400">Recent Events</div>
            </div>
            <div>
              <div className="text-xl font-bold text-green-400">
                ${activities.reduce((sum, a) => sum + (a.cost || 0), 0).toFixed(3)}
              </div>
              <div className="text-xs text-gray-400">Total Spent</div>
            </div>
          </div>
        </div>
      )}

      {/* Pro Tip */}
      <div className="mt-4 p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-lg">
        <div className="text-xs text-cyan-300">
          <span className="font-bold">💡 Pro Tip:</span> All agent executions appear here in real-time. This proves everything is working!
        </div>
      </div>
    </div>
  )
}

// Custom scrollbar styles (add to global CSS if needed)
const styles = `
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: rgba(255, 255, 255, 0.05);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  background: rgba(6, 182, 212, 0.3);
  border-radius: 3px;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  background: rgba(6, 182, 212, 0.5);
}
`

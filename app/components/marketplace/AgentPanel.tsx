'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Agent {
  id: string
  name: string
  type: 'arbitrage' | 'optimizer' | 'whale'
  status: 'active' | 'idle' | 'executing'
  totalTrades: number
  profit: number
  lastAction: string
  lastActionTime: string
  avatar: string
}

const AGENT_TYPES = {
  arbitrage: {
    name: 'Arbitrage Hunter',
    description: 'Finds price differences across providers',
    avatar: '🎯',
    color: '#9945FF',
  },
  optimizer: {
    name: 'Cost Optimizer',
    description: 'Always finds the cheapest provider',
    avatar: '💰',
    color: '#14F195',
  },
  whale: {
    name: 'Whale Trader',
    description: 'Bulk buys at market rates',
    avatar: '🐋',
    color: '#00D4FF',
  },
}

export default function AgentPanel() {
  const [agents, setAgents] = useState<Agent[]>([
    {
      id: 'agent-1',
      name: 'Arbitrage Hunter #1',
      type: 'arbitrage',
      status: 'active',
      totalTrades: 847,
      profit: 127.43,
      lastAction: 'Bought from Node-Alpha at $0.00118',
      lastActionTime: '2s ago',
      avatar: '🎯',
    },
    {
      id: 'agent-2',
      name: 'Cost Optimizer #2',
      type: 'optimizer',
      status: 'executing',
      totalTrades: 1243,
      profit: 189.67,
      lastAction: 'Found 12% cheaper provider',
      lastActionTime: 'just now',
      avatar: '💰',
    },
    {
      id: 'agent-3',
      name: 'Whale Trader #3',
      type: 'whale',
      status: 'idle',
      totalTrades: 523,
      profit: 342.18,
      lastAction: 'Waiting for market conditions',
      lastActionTime: '45s ago',
      avatar: '🐋',
    },
  ])

  const [recentActivity, setRecentActivity] = useState<string[]>([])

  // Simulate live agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      const agentIndex = Math.floor(Math.random() * agents.length)
      const actions = [
        'Executed trade via ParallaxNode-Alpha',
        'Found arbitrage opportunity: +$0.000032',
        'Switched provider for better latency',
        'Bulk purchased 5000 tokens',
        'Optimized route through EU-West',
        'Detected price anomaly, waiting...',
        'Completed x402 payment in 87ms',
      ]

      setAgents((prev) =>
        prev.map((agent, i) =>
          i === agentIndex
            ? {
                ...agent,
                status: Math.random() > 0.5 ? 'executing' : 'active',
                lastAction: actions[Math.floor(Math.random() * actions.length)],
                lastActionTime: 'just now',
                totalTrades: agent.totalTrades + (Math.random() > 0.7 ? 1 : 0),
                profit: agent.profit + Math.random() * 0.5,
              }
            : agent
        )
      )

      setRecentActivity((prev) => [
        `${agents[agentIndex].name}: ${actions[Math.floor(Math.random() * actions.length)]}`,
        ...prev.slice(0, 4),
      ])
    }, 4000)

    return () => clearInterval(interval)
  }, [agents])

  return (
    <motion.div
      className="glass rounded-xl border border-border overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.1 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-heading font-bold text-white">
            Autonomous Agents
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-status-success rounded-full animate-pulse" />
            <span className="text-xs text-status-success font-semibold">
              {agents.filter((a) => a.status !== 'idle').length} ACTIVE
            </span>
          </div>
        </div>
        <p className="text-xs text-text-secondary">
          AI bots trading compute autonomously
        </p>
      </div>

      {/* Agent Cards */}
      <div className="p-4 space-y-3">
        {agents.map((agent, index) => (
          <AgentCard key={agent.id} agent={agent} index={index} />
        ))}
      </div>

      {/* Deploy New Agent Button */}
      <div className="p-4 border-t border-border">
        <button className="w-full glass-hover border border-accent-primary/30 px-4 py-3 rounded-lg font-heading font-semibold text-sm transition-all hover:scale-105 hover:border-accent-primary">
          <span className="text-gradient">+ Deploy New Agent</span>
        </button>
      </div>

      {/* Recent Activity Feed */}
      <div className="p-4 border-t border-border bg-background-secondary/30">
        <div className="text-xs text-text-secondary mb-2 font-semibold">
          RECENT ACTIVITY
        </div>
        <div className="space-y-2 max-h-32 overflow-y-auto">
          <AnimatePresence>
            {recentActivity.map((activity, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 10 }}
                className="text-xs text-text-secondary font-mono leading-relaxed"
              >
                {activity}
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  )
}

interface AgentCardProps {
  agent: Agent
  index: number
}

function AgentCard({ agent, index }: AgentCardProps) {
  const agentType = AGENT_TYPES[agent.type]

  return (
    <motion.div
      className="glass-hover p-3 rounded-lg border border-border relative overflow-hidden"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      {/* Status indicator */}
      {agent.status === 'executing' && (
        <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/10 to-transparent animate-pulse" />
      )}

      <div className="relative z-10">
        {/* Header */}
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center gap-2">
            <div className="text-2xl">{agent.avatar}</div>
            <div>
              <div className="text-sm font-heading font-bold text-white">
                {agent.name}
              </div>
              <div className="text-xs text-text-secondary">
                {agentType.description}
              </div>
            </div>
          </div>

          {/* Status Badge */}
          <div
            className={`px-2 py-1 rounded text-xs font-semibold ${
              agent.status === 'active'
                ? 'bg-status-success/20 text-status-success'
                : agent.status === 'executing'
                ? 'bg-accent-primary/20 text-accent-primary animate-pulse'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            {agent.status === 'executing' ? '⚡ EXECUTING' : agent.status.toUpperCase()}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 mb-2">
          <div>
            <div className="text-xs text-text-secondary">Trades</div>
            <div className="text-sm font-bold text-white">
              {agent.totalTrades}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-secondary">Profit</div>
            <div className="text-sm font-bold text-status-success">
              +${agent.profit.toFixed(2)}
            </div>
          </div>
        </div>

        {/* Last Action */}
        <div className="p-2 rounded bg-background-tertiary/50 border border-border-hover">
          <div className="text-xs text-text-secondary font-mono leading-relaxed">
            {agent.lastAction}
          </div>
          <div className="text-xs text-text-muted mt-1">{agent.lastActionTime}</div>
        </div>
      </div>
    </motion.div>
  )
}

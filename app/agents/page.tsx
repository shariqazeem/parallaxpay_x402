'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'

interface AgentStats {
  id: string
  name: string
  type: 'arbitrage' | 'optimizer' | 'whale'
  status: 'active' | 'idle' | 'executing'
  totalTrades: number
  profit: number
  avgCost: number
  successRate: number
  lastAction: string
  lastActionTime: number
  avatar: string
  color: string
  isReal?: boolean  // NEW: flag to distinguish real vs demo agents
}

interface Trade {
  id: string
  agentName: string
  provider: string
  tokens: number
  cost: number
  timestamp: number
  txHash: string
  isReal?: boolean  // NEW
}

interface DeployedAgent {
  id: string
  name: string
  type: 'arbitrage' | 'optimizer' | 'whale'
  prompt: string
  deployed: number
}

export default function AgentDashboardPage() {
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [deployedAgents, setDeployedAgents] = useState<DeployedAgent[]>([])

  // DEMO AGENTS (for UI showcase)
  const [agents, setAgents] = useState<AgentStats[]>([
    {
      id: 'demo-1',
      name: '[DEMO] Arbitrage Hunter #1',
      type: 'arbitrage',
      status: 'idle',
      totalTrades: 1247,
      profit: 342.67,
      avgCost: 0.00118,
      successRate: 98.4,
      lastAction: 'Demo agent - not running',
      lastActionTime: Date.now() - 2000,
      avatar: '🎯',
      color: '#9945FF',
      isReal: false,
    },
    {
      id: 'demo-2',
      name: '[DEMO] Cost Optimizer #2',
      type: 'optimizer',
      status: 'idle',
      totalTrades: 2134,
      profit: 567.23,
      avgCost: 0.00109,
      successRate: 99.1,
      lastAction: 'Demo agent - not running',
      lastActionTime: Date.now() - 500,
      avatar: '💰',
      color: '#14F195',
      isReal: false,
    },
    {
      id: 'demo-3',
      name: '[DEMO] Whale Trader #3',
      type: 'whale',
      status: 'idle',
      totalTrades: 847,
      profit: 1234.89,
      avgCost: 0.00125,
      successRate: 97.8,
      lastAction: 'Demo agent - not running',
      lastActionTime: Date.now() - 45000,
      avatar: '🐋',
      color: '#00D4FF',
      isReal: false,
    },
  ])

  const [trades, setTrades] = useState<Trade[]>([])
  const [totalVolume, setTotalVolume] = useState(0)

  // Real agents - merged with demo agents for display
  const allAgents = [
    ...agents,  // demo agents
    ...deployedAgents.map((da) => ({
      id: da.id,
      name: da.name,
      type: da.type,
      status: 'active' as const,
      totalTrades: 0,
      profit: 0,
      avgCost: 0.00112,
      successRate: 100,
      lastAction: `Testing prompt: "${da.prompt.substring(0, 40)}..."`,
      lastActionTime: da.deployed,
      avatar: da.type === 'arbitrage' ? '🎯' : da.type === 'optimizer' ? '💰' : '🐋',
      color: da.type === 'arbitrage' ? '#9945FF' : da.type === 'optimizer' ? '#14F195' : '#00D4FF',
      isReal: true,
    }))
  ]

  const totalTrades = allAgents.reduce((sum, a) => sum + a.totalTrades, 0)
  const totalProfit = allAgents.reduce((sum, a) => sum + a.profit, 0)
  const avgSuccessRate = allAgents.length > 0
    ? allAgents.reduce((sum, a) => sum + a.successRate, 0) / allAgents.length
    : 0
  const realAgentsCount = deployedAgents.length

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Deploy Agent Modal */}
      <AnimatePresence>
        {showDeployModal && (
          <DeployAgentModal
            onClose={() => setShowDeployModal(false)}
            onDeploy={(agent) => {
              setDeployedAgents(prev => [...prev, agent])
              setShowDeployModal(false)
            }}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="border-b border-border bg-background-secondary/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <h1 className="text-2xl font-heading font-black cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-gradient">ParallaxPay</span>
                </h1>
              </Link>
              <div className="text-text-muted">/</div>
              <h2 className="text-xl font-heading font-bold text-white">
                Agent Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/marketplace">
                <button className="glass-hover px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all">
                  Marketplace
                </button>
              </Link>
              <button
                onClick={() => setShowDeployModal(true)}
                className="glass-hover neon-border px-6 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all"
              >
                <span className="text-gradient">+ Deploy Agent</span>
              </button>
            </div>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <StatCard label="Real Agents" value={`${realAgentsCount} / ${allAgents.length}`} icon="🤖" color={realAgentsCount > 0 ? 'success' : 'default'} />
            <StatCard label="Total Trades" value={totalTrades.toLocaleString()} icon="⚡" />
            <StatCard label="Total Profit" value={`$${totalProfit.toFixed(2)}`} icon="💰" color="success" />
            <StatCard label="24h Volume" value={`$${totalVolume.toFixed(2)}`} icon="📊" />
            <StatCard label="Success Rate" value={`${avgSuccessRate.toFixed(1)}%`} icon="✓" color="success" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-6">
          {/* Left - Agent Cards */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-heading font-bold text-white">
                  Your Autonomous Agents
                </h3>
                <div className="text-sm text-text-secondary">
                  {realAgentsCount} real • {agents.length} demo
                </div>
              </div>

              {realAgentsCount === 0 && (
                <div className="glass-hover p-6 rounded-xl border border-accent-primary/30 mb-4">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">🚀</div>
                    <div>
                      <div className="font-heading font-bold text-white mb-2">
                        Deploy Your First Real Agent
                      </div>
                      <div className="text-sm text-text-secondary mb-3">
                        Click "Deploy Agent" to create an agent that actually runs AI inference on your local Parallax cluster.
                      </div>
                      <button
                        onClick={() => setShowDeployModal(true)}
                        className="glass-hover neon-border px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all"
                      >
                        <span className="text-gradient">Deploy Now</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {allAgents.map((agent, index) => (
                  <AgentCard key={agent.id} agent={agent} index={index} />
                ))}
              </div>
            </div>

            {/* SDK Example */}
            <SDKExample />
          </div>

          {/* Right - Live Feed */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <LiveTradeFeed trades={trades} />
            <AgentMetrics agents={agents} />
          </div>
        </div>
      </div>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon,
  color = 'default',
}: {
  label: string
  value: string | number
  icon: string
  color?: 'default' | 'success' | 'error'
}) {
  return (
    <div className="glass-hover p-3 rounded-lg">
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs text-text-secondary">{label}</span>
        <span className="text-sm">{icon}</span>
      </div>
      <div
        className={`text-lg font-black ${
          color === 'success'
            ? 'text-status-success'
            : color === 'error'
            ? 'text-status-error'
            : 'text-white'
        }`}
      >
        {value}
      </div>
    </div>
  )
}

function AgentCard({ agent, index }: { agent: AgentStats; index: number }) {
  const timeSince = Math.floor((Date.now() - agent.lastActionTime) / 1000)
  const timeStr =
    timeSince < 5 ? 'just now' : timeSince < 60 ? `${timeSince}s ago` : `${Math.floor(timeSince / 60)}m ago`

  return (
    <motion.div
      className={`glass rounded-xl border overflow-hidden ${
        agent.isReal
          ? 'border-accent-primary/50 bg-accent-primary/5'
          : 'border-border opacity-60'
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
    >
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="text-4xl">{agent.avatar}</div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h4 className="text-xl font-heading font-bold text-white">
                  {agent.name}
                </h4>
                {agent.isReal && (
                  <span className="px-2 py-0.5 rounded bg-status-success/20 text-status-success text-xs font-bold border border-status-success/30">
                    REAL
                  </span>
                )}
              </div>
              <div className="text-sm text-text-secondary capitalize">
                {agent.type} Strategy {!agent.isReal && '(Demo only)'}
              </div>
            </div>
          </div>

          <div
            className={`px-3 py-1.5 rounded-lg text-sm font-semibold ${
              agent.status === 'executing'
                ? 'bg-accent-primary/20 text-accent-primary animate-pulse'
                : agent.status === 'active'
                ? 'bg-status-success/20 text-status-success'
                : 'bg-gray-500/20 text-gray-400'
            }`}
          >
            {agent.status === 'executing' ? '⚡ EXECUTING' : agent.status.toUpperCase()}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-xs text-text-secondary mb-1">Trades</div>
            <div className="text-lg font-bold text-white">
              {agent.totalTrades}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Profit</div>
            <div className="text-lg font-bold text-status-success">
              +${agent.profit.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Avg Cost</div>
            <div className="text-lg font-bold text-white">
              ${agent.avgCost.toFixed(5)}
            </div>
          </div>
          <div>
            <div className="text-xs text-text-secondary mb-1">Success</div>
            <div className="text-lg font-bold text-accent-secondary">
              {agent.successRate}%
            </div>
          </div>
        </div>

        {/* Last Action */}
        <div className="glass-hover p-4 rounded-lg border border-border-hover">
          <div className="text-sm text-white font-medium mb-1">
            {agent.lastAction}
          </div>
          <div className="text-xs text-text-muted">{timeStr}</div>
        </div>
      </div>

      {/* Progress Bar */}
      {agent.status === 'executing' && (
        <div className="h-1 bg-background-tertiary">
          <motion.div
            className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
            initial={{ width: '0%' }}
            animate={{ width: '100%' }}
            transition={{ duration: 3, ease: 'linear' }}
          />
        </div>
      )}
    </motion.div>
  )
}

function LiveTradeFeed({ trades }: { trades: Trade[] }) {
  return (
    <div className="glass rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-bold text-white">
            Live Trade Feed
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-status-success rounded-full animate-pulse" />
            <span className="text-xs text-status-success font-semibold">
              LIVE
            </span>
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[600px] overflow-y-auto">
        <AnimatePresence>
          {trades.map((trade) => (
            <motion.div
              key={trade.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="glass-hover p-3 rounded-lg border border-border-hover"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-medium text-white">
                  {trade.agentName}
                </div>
                <div className="text-xs text-status-success font-bold">
                  +${trade.cost.toFixed(4)}
                </div>
              </div>
              <div className="text-xs text-text-secondary mb-2">
                {trade.provider} • {trade.tokens} tokens
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-text-muted">
                  {trade.txHash}
                </div>
                <div className="text-xs text-text-muted">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {trades.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            <div className="text-4xl mb-3">⏳</div>
            <div className="text-sm">Waiting for trades...</div>
          </div>
        )}
      </div>
    </div>
  )
}

function AgentMetrics({ agents }: { agents: AgentStats[] }) {
  return (
    <div className="glass rounded-xl border border-border p-6">
      <h3 className="text-lg font-heading font-bold text-white mb-4">
        Performance Metrics
      </h3>

      <div className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.id}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>{agent.avatar}</span>
                <span className="text-sm text-white font-medium">
                  {agent.type}
                </span>
              </div>
              <span className="text-sm text-status-success font-bold">
                ${agent.profit.toFixed(0)}
              </span>
            </div>
            <div className="w-full h-2 bg-background-tertiary rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary rounded-full"
                style={{ width: `${agent.successRate}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function SDKExample() {
  return (
    <div className="glass rounded-xl border border-accent-primary/30 overflow-hidden">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-heading font-bold text-white mb-2">
              Build Your Own Agent
            </h3>
            <p className="text-sm text-text-secondary">
              Use our SDK to create custom trading strategies
            </p>
          </div>
          <button className="glass-hover px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all">
            View Docs →
          </button>
        </div>

        <div className="glass-hover p-4 rounded-lg font-mono text-sm overflow-x-auto">
          <pre className="text-text-secondary">
            <span className="text-accent-tertiary">import</span> {'{'}
            <span className="text-accent-secondary"> Agent </span>
            {'}'} <span className="text-accent-tertiary">from</span>{' '}
            <span className="text-accent-primary">'@parallaxpay/sdk'</span>
            {'\n\n'}
            <span className="text-accent-tertiary">const</span> agent ={' '}
            <span className="text-accent-tertiary">new</span>{' '}
            <span className="text-accent-primary">Agent</span>({'{'}
            {'\n  '}strategy: <span className="text-accent-secondary">'arbitrage'</span>,
            {'\n  '}maxBudget: <span className="text-accent-secondary">1000</span>,
            {'\n  '}minReputation: <span className="text-accent-secondary">95</span>
            {'\n}'}){'\n\n'}
            agent.<span className="text-accent-secondary">start</span>()
          </pre>
        </div>
      </div>
    </div>
  )
}

// Deploy Agent Modal Component
function DeployAgentModal({
  onClose,
  onDeploy,
}: {
  onClose: () => void
  onDeploy: (agent: DeployedAgent) => void
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'arbitrage' | 'optimizer' | 'whale'>('arbitrage')
  const [prompt, setPrompt] = useState('Explain quantum computing')
  const [isDeploying, setIsDeploying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  const handleDeploy = async () => {
    if (!name.trim() || !prompt.trim()) {
      setError('Please fill in all fields')
      return
    }

    setIsDeploying(true)
    setError(null)
    setResult(null)

    try {
      // Run REAL Parallax inference to test the agent
      const { createParallaxClient } = await import('@/lib/parallax-client')
      const client = createParallaxClient('http://localhost:3001')

      const response = await client.inference({
        messages: [{ role: 'user', content: prompt }],
        max_tokens: 200,
      })

      // Parse response
      let content = ''
      if (response.choices && response.choices.length > 0) {
        const choice = response.choices[0] as any
        content = choice.message?.content || ''
        if (!content && choice.messages?.content) {
          content = choice.messages.content
        }
        if (!content && choice.text) {
          content = choice.text
        }
      }

      // Clean up <think> tags
      if (content.includes('<think>')) {
        const thinkEnd = content.indexOf('</think>')
        if (thinkEnd !== -1) {
          content = content.substring(thinkEnd + 8).trim()
        } else {
          content = content.replace(/<think>[\s\S]*$/, '').trim()
        }
      }

      if (!content) {
        throw new Error('No response from Parallax. Make sure it\'s running on port 3001.')
      }

      setResult(content)

      // Deploy the agent
      const newAgent: DeployedAgent = {
        id: `real-${Date.now()}`,
        name,
        type,
        prompt,
        deployed: Date.now(),
      }

      // Wait a moment to show the result
      setTimeout(() => {
        onDeploy(newAgent)
      }, 1500)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deploy agent')
      setIsDeploying(false)
      console.error('Agent deployment error:', err)
    }
  }

  return (
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-6"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="glass rounded-xl border border-accent-primary/50 p-6 max-w-lg w-full max-h-[90vh] overflow-y-auto"
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between mb-6">
          <div>
            <h2 className="text-2xl font-heading font-bold text-white mb-2">
              Deploy Real Agent
            </h2>
            <p className="text-sm text-text-secondary">
              This agent will run real AI inference on your Parallax cluster
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-text-secondary hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Agent Name */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Agent Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Trading Agent"
              className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-white placeholder-text-muted focus:border-accent-primary focus:outline-none"
              disabled={isDeploying}
            />
          </div>

          {/* Agent Type */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Strategy Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-white focus:border-accent-primary focus:outline-none"
              disabled={isDeploying}
            >
              <option value="arbitrage">Arbitrage - Find price differences</option>
              <option value="optimizer">Optimizer - Minimize costs</option>
              <option value="whale">Whale - Bulk purchases</option>
            </select>
          </div>

          {/* Test Prompt */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Test Prompt (will run real inference)
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter a prompt to test the agent..."
              className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-white placeholder-text-muted focus:border-accent-primary focus:outline-none resize-none"
              rows={3}
              disabled={isDeploying}
            />
          </div>

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-status-error/10 border border-status-error/30">
              <div className="text-sm text-status-error">{error}</div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="p-4 rounded-lg bg-status-success/10 border border-status-success/30">
              <div className="text-xs text-status-success mb-2">✅ Test Successful! Deploying agent...</div>
              <div className="text-sm text-white whitespace-pre-wrap">{result.substring(0, 200)}...</div>
            </div>
          )}

          {/* Deploy Button */}
          <button
            onClick={handleDeploy}
            disabled={isDeploying || !name.trim() || !prompt.trim() || !!result}
            className="w-full glass-hover neon-border px-6 py-4 rounded-xl font-heading font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {isDeploying ? (
              <span className="text-text-muted">⚡ Testing agent with Parallax...</span>
            ) : result ? (
              <span className="text-status-success">Deploying...</span>
            ) : (
              <span className="text-gradient">Deploy & Test Agent</span>
            )}
          </button>

          <div className="text-xs text-text-muted text-center">
            Make sure Parallax is running on localhost:3001
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

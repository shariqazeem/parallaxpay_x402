'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useX402Payment } from '@/app/hooks/useX402Payment'
import { useProvider } from '@/app/contexts/ProviderContext'

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
  totalRuns: number
  lastRun?: number
  lastResult?: string
  status: 'idle' | 'running'
  provider?: string  // Store which provider this agent uses
}

export default function AgentDashboardPage() {
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [deployedAgents, setDeployedAgents] = useState<DeployedAgent[]>([])
  const [trades, setTrades] = useState<Trade[]>([])

  // Token controls for agent runs
  const [maxTokens, setMaxTokens] = useState(300)
  const fixedCost = 0.001 // Fixed $0.001 per request

  // Wallet connection for user payments
  const { publicKey } = useWallet()
  const { fetchWithPayment, isWalletConnected } = useX402Payment()

  // Global provider state from marketplace
  const { selectedProvider } = useProvider()

  // Convert deployed agents to AgentStats for display
  const allAgents: AgentStats[] = deployedAgents.map((da) => ({
    id: da.id,
    name: da.name,
    type: da.type,
    status: da.status === 'running' ? 'executing' : (da.totalRuns > 0 ? 'active' : 'idle'),
    totalTrades: da.totalRuns,
    profit: da.totalRuns * 0.5, // Simulated profit
    avgCost: 0.00112,
    successRate: 100,
    lastAction: da.lastResult
      ? `Completed: "${da.lastResult.substring(0, 50)}..."`
      : `Ready to run: "${da.prompt.substring(0, 40)}..."`,
    lastActionTime: da.lastRun || da.deployed,
    avatar: da.type === 'arbitrage' ? '🎯' : da.type === 'optimizer' ? '💰' : '🐋',
    color: da.type === 'arbitrage' ? '#9945FF' : da.type === 'optimizer' ? '#14F195' : '#00D4FF',
    isReal: true,
  }))

  // Run an agent's task with REAL x402 PAYMENT using USER WALLET
  const runAgent = async (agentId: string) => {
    const agent = deployedAgents.find(a => a.id === agentId)
    if (!agent) return

    // Check wallet connection
    if (!isWalletConnected) {
      alert('💳 Please connect your wallet to run agents with paid inference')
      return
    }

    // Update status to running
    setDeployedAgents(prev => prev.map(a =>
      a.id === agentId ? { ...a, status: 'running' as const } : a
    ))

    try {
      console.log(`🤖 [${agent.name}] Running agent with YOUR wallet payment...`)
      console.log(`   Wallet: ${publicKey?.toBase58().substring(0, 20)}...`)

      // Call PROTECTED API endpoint with x402 payment using user's wallet
      const response = await fetchWithPayment('/api/inference/paid', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [{ role: 'user', content: agent.prompt }],
          max_tokens: maxTokens, // User-specified token limit
          provider: selectedProvider?.name, // Send selected provider from marketplace
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || errorData.details || 'Request failed')
      }

      const data = await response.json()

      console.log(`✅ [${agent.name}] Payment successful!`)
      console.log(`   TX Hash: ${data.txHash || 'pending'}`)
      console.log(`   Cost: $${data.cost?.toFixed(6) || '0.001000'}`)

      // Update agent stats
      setDeployedAgents(prev => prev.map(a =>
        a.id === agentId
          ? {
              ...a,
              status: 'idle' as const,
              totalRuns: a.totalRuns + 1,
              lastRun: Date.now(),
              lastResult: data.response?.substring(0, 200) || 'Success'
            }
          : a
      ))

      // Add to trade feed with REAL transaction
      const newTrade: Trade = {
        id: `trade-${Date.now()}`,
        agentName: agent.name,
        provider: data.provider || 'Local Parallax Node',
        tokens: data.tokens || 0,
        cost: data.cost || 0.001,
        timestamp: Date.now(),
        txHash: data.txHash || 'pending',
        isReal: true,
      }
      setTrades(prev => [newTrade, ...prev.slice(0, 9)])

      // Store in localStorage for transaction history
      try {
        const stored = localStorage.getItem('parallaxpay_transactions') || '[]'
        const transactions = JSON.parse(stored)
        transactions.push({
          id: newTrade.id,
          timestamp: newTrade.timestamp,
          type: 'agent',
          provider: newTrade.provider,
          tokens: newTrade.tokens,
          cost: newTrade.cost,
          txHash: newTrade.txHash,
          status: 'success',
          network: 'solana-devnet',
        })
        localStorage.setItem('parallaxpay_transactions', JSON.stringify(transactions))
      } catch (e) {
        console.warn('Failed to store transaction:', e)
      }

    } catch (err) {
      console.error('Agent execution error:', err)

      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
      alert(
        `❌ Agent execution failed:\n\n${errorMessage}\n\n` +
        `Troubleshooting:\n` +
        `1. Ensure wallet is connected (Phantom/Solflare)\n` +
        `2. Ensure wallet has devnet USDC (faucet.circle.com)\n` +
        `3. Verify Parallax is running on localhost:3001\n` +
        `4. Check browser console for detailed error logs`
      )

      // Reset status on error
      setDeployedAgents(prev => prev.map(a =>
        a.id === agentId ? { ...a, status: 'idle' as const } : a
      ))
    }
  }

  const totalTrades = allAgents.reduce((sum, a) => sum + a.totalTrades, 0)
  const totalProfit = allAgents.reduce((sum, a) => sum + a.profit, 0)
  const avgSuccessRate = allAgents.length > 0
    ? allAgents.reduce((sum, a) => sum + a.successRate, 0) / allAgents.length
    : 0
  const realAgentsCount = deployedAgents.length
  const totalVolume = trades.reduce((sum, t) => sum + t.cost, 0)

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
              {/* Wallet Connect Button */}
              <WalletMultiButton className="!bg-gradient-to-r !from-accent-primary !to-accent-secondary !rounded-lg !px-4 !py-2 !text-sm !font-bold hover:!scale-105 !transition-transform" />

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
            <StatCard label="Deployed Agents" value={realAgentsCount} icon="🤖" color={realAgentsCount > 0 ? 'success' : 'default'} />
            <StatCard label="Total Runs" value={totalTrades.toLocaleString()} icon="⚡" />
            <StatCard label="Est. Savings" value={`$${totalProfit.toFixed(2)}`} icon="💰" color="success" />
            <StatCard label="Total Cost" value={`$${totalVolume.toFixed(4)}`} icon="📊" />
            <StatCard label="Success Rate" value={`${avgSuccessRate.toFixed(1)}%`} icon="✓" color="success" />
          </div>

          {/* Selected Provider Banner */}
          {selectedProvider && (
            <div className="mt-4 glass-hover p-4 rounded-lg border border-accent-primary/30">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className="text-2xl">{selectedProvider.featured ? '⭐' : '🖥️'}</div>
                  <div className="flex-1">
                    <div className="font-heading font-bold text-white mb-1">
                      Agents will use: {selectedProvider.name}
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1">
                        <span className="text-text-muted">Model:</span>
                        <span className="text-white font-mono">{selectedProvider.model.split('/')[1]}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-text-muted">Latency:</span>
                        <span className="text-status-success font-mono">{selectedProvider.latency}ms</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="text-text-muted">Uptime:</span>
                        <span className="text-accent-secondary font-mono">{selectedProvider.uptime}%</span>
                      </div>
                    </div>
                  </div>
                </div>
                <Link href="/marketplace">
                  <button className="glass-hover border border-border px-4 py-2 rounded-lg text-sm font-heading font-bold text-white hover:scale-105 transition-all">
                    Change Provider
                  </button>
                </Link>
              </div>
            </div>
          )}
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
                {realAgentsCount > 0 && (
                  <div className="text-sm text-status-success font-semibold">
                    {realAgentsCount} deployed
                  </div>
                )}
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
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    index={index}
                    onRun={() => runAgent(agent.id)}
                  />
                ))}
              </div>
            </div>

            {/* SDK Example */}
            <SDKExample />
          </div>

          {/* Right - Live Feed */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <LiveTradeFeed trades={trades} />
            {allAgents.length > 0 && <AgentMetrics agents={allAgents} />}
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

function AgentCard({
  agent,
  index,
  onRun,
}: {
  agent: AgentStats
  index: number
  onRun: () => void
}) {
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
            <div className="flex-1">
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
                {agent.type} Strategy
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
        <div className="glass-hover p-4 rounded-lg border border-border-hover mb-4">
          <div className="text-sm text-white font-medium mb-1">
            {agent.lastAction}
          </div>
          <div className="text-xs text-text-muted">{timeStr}</div>
        </div>

        {/* Run Agent Button */}
        {agent.isReal && (
          <button
            onClick={onRun}
            disabled={agent.status === 'executing'}
            className="w-full glass-hover neon-border px-4 py-3 rounded-lg font-heading font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          >
            {agent.status === 'executing' ? (
              <span className="text-text-muted">⚡ Running...</span>
            ) : (
              <span className="text-gradient">▶ Run Agent</span>
            )}
          </button>
        )}
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
        max_tokens: 300, // Increased from 200 to avoid truncation
      })

      console.log('Agent deployment - Parallax response:', JSON.stringify(response, null, 2))

      // Parse response - handle multiple formats
      let content = ''
      if (response.choices && response.choices.length > 0) {
        const choice = response.choices[0] as any
        console.log('Choice object:', JSON.stringify(choice, null, 2))

        // Try standard OpenAI format
        content = choice.message?.content || ''
        // Try Parallax format (uses "messages" plural)
        if (!content && choice.messages?.content) {
          content = choice.messages.content
        }
        // Try text format
        if (!content && choice.text) {
          content = choice.text
        }
      }

      console.log('Content before <think> cleanup:', content)

      // Clean up <think> tags if present
      if (content.includes('<think>')) {
        const thinkEnd = content.indexOf('</think>')
        if (thinkEnd !== -1) {
          // Found closing tag - remove reasoning, keep answer
          content = content.substring(thinkEnd + 8).trim()
        } else {
          // No closing tag (response truncated) - keep the reasoning but remove tag
          // This happens when max_tokens is too small
          content = content.replace('<think>\n', '').replace('<think>', '').trim()
          // Add a note that this is reasoning
          content = '💭 AI Reasoning:\n\n' + content
        }
      }

      console.log('Content after <think> cleanup:', content)

      if (!content) {
        console.error('Failed to extract content. Full response:', response)
        throw new Error(
          'Could not extract content from Parallax response. ' +
          'Check browser console for details. Response structure: ' +
          JSON.stringify(response).substring(0, 200)
        )
      }

      setResult(content)

      // Deploy the agent
      const newAgent: DeployedAgent = {
        id: `real-${Date.now()}`,
        name,
        type,
        prompt,
        deployed: Date.now(),
        totalRuns: 0,
        status: 'idle',
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

  // Use portal to render modal at document root (avoids z-index stacking issues)
  if (typeof window === 'undefined') return null

  return createPortal(
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-6"
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
    </motion.div>,
    document.body
  )
}

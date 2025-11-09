'use client'

import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useX402Payment } from '@/app/hooks/useX402Payment'
import { useProvider } from '@/app/contexts/ProviderContext'
import { getAgentIdentityManager, AgentIdentity, TrustBadge } from '@/lib/agent-identity'
import { getAutonomousAgentScheduler, AgentSchedule } from '@/lib/autonomous-agent-scheduler'
import { useBadgeAttestation } from '@/lib/use-badge-attestation'

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
  type: 'arbitrage' | 'optimizer' | 'whale' | 'custom' | 'composite'
  prompt: string
  deployed: number
  totalRuns: number
  lastRun?: number
  lastResult?: string
  status: 'idle' | 'running'
  provider?: string  // Store which provider this agent uses
  identityId?: string  // Link to AgentIdentity
  schedule?: AgentSchedule  // Autonomous scheduling config
  workflow?: CompositeWorkflow  // For composite agents
}

interface CompositeWorkflow {
  steps: WorkflowStep[]
}

interface WorkflowStep {
  id: string
  agentName: string  // Name of agent to call
  prompt: string     // Prompt to pass to that agent
  useOutputFrom?: string  // ID of previous step to use output from
}

export default function AgentDashboardPage() {
  const [showDeployModal, setShowDeployModal] = useState(false)
  const [showLeaderboard, setShowLeaderboard] = useState(false)
  const [deployedAgents, setDeployedAgents] = useState<DeployedAgent[]>([])
  const [trades, setTrades] = useState<Trade[]>([])
  const [agentIdentities, setAgentIdentities] = useState<AgentIdentity[]>([])

  // Token controls for agent runs
  const [maxTokens, setMaxTokens] = useState(300)
  const fixedCost = 0.001 // Fixed $0.001 per request

  // Wallet connection for user payments
  const { publicKey } = useWallet()
  const { fetchWithPayment, isWalletConnected } = useX402Payment()

  // Global provider state from marketplace
  const { selectedProvider } = useProvider()

  // Identity and scheduler managers (initialized client-side only)
  const [identityManager, setIdentityManager] = useState<ReturnType<typeof getAgentIdentityManager> | null>(null)
  const [scheduler, setScheduler] = useState<ReturnType<typeof getAutonomousAgentScheduler> | null>(null)

  // Initialize managers on client side only
  useEffect(() => {
    setIdentityManager(getAgentIdentityManager())
    setScheduler(getAutonomousAgentScheduler())
  }, [])

  // Refresh identities when manager changes
  useEffect(() => {
    if (identityManager) {
      setAgentIdentities(identityManager.getAllIdentities())
    }
  }, [identityManager])

  // Check for pending agent deployment from agent builder
  useEffect(() => {
    const checkPendingDeploy = () => {
      try {
        const pendingData = localStorage.getItem('pendingAgentDeploy')
        if (!pendingData) return

        const agentData = JSON.parse(pendingData)

        // Create new agent from builder data
        const newAgent: DeployedAgent = {
          id: `agent-${Date.now()}`,
          name: agentData.name || 'Generated Agent',
          type: 'optimizer', // Default type for AI-generated agents
          prompt: agentData.prompt || agentData.description,
          deployed: Date.now(),
          totalRuns: 0,
          status: 'idle',
        }

        // Add to deployed agents
        setDeployedAgents(prev => [...prev, newAgent])

        // Clear the pending deployment
        localStorage.removeItem('pendingAgentDeploy')

        // Show success message
        console.log('✅ Agent deployed successfully:', newAgent.name)
      } catch (error) {
        console.error('Failed to deploy pending agent:', error)
      }
    }

    checkPendingDeploy()
  }, []) // Run once on mount

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
    avatar: da.type === 'arbitrage' ? '🎯' : da.type === 'optimizer' ? '💰' : da.type === 'whale' ? '🐋' : da.type === 'composite' ? '🔗' : '🤖',
    color: da.type === 'arbitrage' ? '#9945FF' : da.type === 'optimizer' ? '#14F195' : da.type === 'whale' ? '#00D4FF' : da.type === 'composite' ? '#FF6B9D' : '#00B4FF',
    isReal: true,
  }))

  // Run an agent's task with REAL x402 PAYMENT using USER WALLET
  const runAgent = async (agentId: string) => {
    const agent = deployedAgents.find(a => a.id === agentId)
    if (!agent || !identityManager) return

    // Check wallet connection
    if (!isWalletConnected) {
      alert('💳 Please connect your wallet to run agents with paid inference')
      return
    }

    // Update status to running
    setDeployedAgents(prev => prev.map(a =>
      a.id === agentId ? { ...a, status: 'running' as const } : a
    ))

    const startTime = Date.now()

    try {
      // COMPOSITE AGENT: Orchestrate multiple agent calls
      if (agent.type === 'composite' && agent.workflow) {
        console.log(`🔗 [${agent.name}] Running COMPOSITE agent with workflow...`)
        console.log(`   Steps: ${agent.workflow.steps.length}`)
        console.log(`   Wallet: ${publicKey?.toBase58().substring(0, 20)}...`)

        // Call composite agent endpoint
        const response = await fetch('/api/runCompositeAgent', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            workflow: agent.workflow,
            initialInput: agent.prompt,
            provider: selectedProvider?.name,
          }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.error || 'Composite execution failed')
        }

        const data = await response.json()
        const latency = Date.now() - startTime

        console.log(`✅ [${agent.name}] Composite workflow completed!`)
        console.log(`   Total Steps: ${data.completedSteps}/${data.totalSteps}`)
        console.log(`   Total Cost: $${data.totalCost.toFixed(6)}`)
        console.log(`   Total Latency: ${latency}ms`)

        // Record execution in identity manager (using total cost)
        if (agent.identityId) {
          identityManager.recordExecution(
            agent.identityId,
            data.success,
            data.totalCost,
            latency,
            selectedProvider?.name || 'Parallax',
            0.0001 * data.completedSteps // Estimated savings per step
          )
          setAgentIdentities(identityManager.getAllIdentities())
        }

        // Update agent stats
        setDeployedAgents(prev => prev.map(a =>
          a.id === agentId
            ? {
                ...a,
                status: 'idle' as const,
                totalRuns: a.totalRuns + 1,
                lastRun: Date.now(),
                lastResult: data.finalOutput?.substring(0, 200) || 'Workflow completed',
                provider: selectedProvider?.name || 'Parallax'
              }
            : a
        ))

        // Add each step to trade feed
        data.executionTrail.forEach((step: any, index: number) => {
          const stepTrade: Trade = {
            id: `trade-${Date.now()}-step-${index}`,
            agentName: `${agent.name} → ${step.agentName}`,
            provider: step.provider,
            tokens: step.tokens,
            cost: step.cost,
            timestamp: Date.now() + index, // Offset timestamps slightly
            txHash: step.txHash || 'pending',
            isReal: true,
          }
          setTrades(prev => [stepTrade, ...prev.slice(0, 9)])
        })

        // Store composite execution in localStorage
        try {
          const stored = localStorage.getItem('parallaxpay_transactions') || '[]'
          const transactions = JSON.parse(stored)
          transactions.push({
            id: `composite-${Date.now()}`,
            timestamp: Date.now(),
            type: 'composite',
            agentName: agent.name,
            steps: data.executionTrail.length,
            totalCost: data.totalCost,
            status: 'success',
            network: 'solana-devnet',
          })
          localStorage.setItem('parallaxpay_transactions', JSON.stringify(transactions))
        } catch (e) {
          console.warn('Failed to store transaction:', e)
        }

        return
      }

      // REGULAR AGENT: Single inference call
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

      const latency = Date.now() - startTime

      console.log(`✅ [${agent.name}] Payment successful!`)
      console.log(`   TX Hash: ${data.txHash || 'pending'}`)
      console.log(`   Cost: $${data.cost?.toFixed(6) || '0.001000'}`)
      console.log(`   Latency: ${latency}ms`)

      // Record execution in identity manager
      if (agent.identityId) {
        identityManager.recordExecution(
          agent.identityId,
          true, // success
          data.cost || 0.001,
          latency,
          data.provider || selectedProvider?.name || 'Parallax',
          0.0001 // Estimated savings (could calculate from baseline)
        )
        // Refresh identities to show updated reputation
        setAgentIdentities(identityManager.getAllIdentities())
      }

      // Update agent stats
      setDeployedAgents(prev => prev.map(a =>
        a.id === agentId
          ? {
              ...a,
              status: 'idle' as const,
              totalRuns: a.totalRuns + 1,
              lastRun: Date.now(),
              lastResult: data.response?.substring(0, 200) || 'Success',
              provider: data.provider
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

      const latency = Date.now() - startTime
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'

      // Record failed execution in identity manager
      if (agent.identityId && identityManager) {
        identityManager.recordExecution(
          agent.identityId,
          false, // failure
          0.001, // Estimated cost
          latency,
          selectedProvider?.name || 'Parallax',
          0
        )
        // Refresh identities
        setAgentIdentities(identityManager.getAllIdentities())
      }

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
              // Refresh identities
              if (identityManager) {
                setAgentIdentities(identityManager.getAllIdentities())
              }
            }}
            walletAddress={publicKey?.toBase58()}
          />
        )}
      </AnimatePresence>

      {/* Header - Only title bar is sticky */}
      <div className="sticky top-0 z-50 border-b border-border bg-background-secondary/50 backdrop-blur-xl">
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
        </div>
      </div>

      {/* Stats and Provider Section - NOT sticky, scrolls away */}
      <div className="border-b border-border bg-background-secondary/30">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-4">
            <StatCard label="Deployed Agents" value={realAgentsCount} icon="🤖" color={realAgentsCount > 0 ? 'success' : 'default'} />
            <StatCard label="Total Runs" value={totalTrades.toLocaleString()} icon="⚡" />
            <StatCard label="Est. Savings" value={`$${totalProfit.toFixed(2)}`} icon="💰" color="success" />
            <StatCard label="Total Cost" value={`$${totalVolume.toFixed(4)}`} icon="📊" />
            <StatCard label="Success Rate" value={`${avgSuccessRate.toFixed(1)}%`} icon="✓" color="success" />
          </div>

          {/* Provider Banner - Always Show */}
          <div>
            {selectedProvider ? (
              <motion.div
                className="glass-hover neon-border p-4 rounded-xl"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">{selectedProvider.featured ? '⭐' : '🖥️'}</div>
                    <div className="flex-1">
                      <div className="font-heading font-bold text-white mb-1 text-lg">
                        ✅ Agents using: {selectedProvider.name}
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-text-muted">Model:</span>
                          <span className="text-accent-secondary font-mono font-bold">{selectedProvider.model.split('/')[1]}</span>
                        </div>
                        <span className="text-text-muted">•</span>
                        <div className="flex items-center gap-1">
                          <span className="text-text-muted">Latency:</span>
                          <span className="text-status-success font-mono font-bold">{selectedProvider.latency}ms</span>
                        </div>
                        <span className="text-text-muted">•</span>
                        <div className="flex items-center gap-1">
                          <span className="text-text-muted">Uptime:</span>
                          <span className="text-accent-primary font-mono font-bold">{selectedProvider.uptime}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href="/marketplace">
                    <button className="glass-hover border border-border px-4 py-2 rounded-lg text-sm font-heading font-bold text-white hover:scale-105 transition-all">
                      Change Provider →
                    </button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="glass-hover p-4 rounded-xl border border-status-error/50 bg-status-error/5"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">⚠️</div>
                    <div className="flex-1">
                      <div className="font-heading font-bold text-status-error mb-1 text-lg">
                        No Provider Selected
                      </div>
                      <div className="text-xs text-text-secondary">
                        Select a Parallax provider to run your agents. Agents need a compute provider for AI inference.
                      </div>
                    </div>
                  </div>
                  <Link href="/marketplace">
                    <button className="glass-hover neon-border px-6 py-3 rounded-lg text-sm font-heading font-bold hover:scale-105 transition-all">
                      <span className="text-gradient">Select Provider →</span>
                    </button>
                  </Link>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1920px] mx-auto px-6 py-8 pt-4">
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
                {allAgents.map((agent, index) => {
                  // Find corresponding deployed agent to get identity ID
                  const deployedAgent = deployedAgents.find(da => da.id === agent.id)
                  const identity = deployedAgent?.identityId
                    ? agentIdentities.find(id => id.id === deployedAgent.identityId)
                    : undefined

                  return (
                    <AgentCard
                      key={agent.id}
                      agent={agent}
                      index={index}
                      onRun={() => runAgent(agent.id)}
                      identity={identity}
                    />
                  )
                })}
              </div>
            </div>

            {/* SDK Example */}
            <SDKExample />
          </div>

          {/* Right - Live Feed */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <LiveTradeFeed trades={trades} />
            {agentIdentities.length > 0 && identityManager && (
              <AgentLeaderboard identities={identityManager.getLeaderboard(5)} />
            )}
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
  identity,
}: {
  agent: AgentStats
  index: number
  onRun: () => void
  identity?: AgentIdentity
}) {
  const { attestBadge, attesting } = useBadgeAttestation()
  const [showAttestModal, setShowAttestModal] = useState(false)
  const identityManager = getAgentIdentityManager()

  const timeSince = Math.floor((Date.now() - agent.lastActionTime) / 1000)
  const timeStr =
    timeSince < 5 ? 'just now' : timeSince < 60 ? `${timeSince}s ago` : `${Math.floor(timeSince / 60)}m ago`

  // Get badges that need attestation
  const unAttestedBadges = identity ? identity.badges.filter(b => !b.attestation) : []

  // Handle badge attestation
  const handleAttestBadge = async (badge: TrustBadge) => {
    if (!identity) return

    const result = await attestBadge({
      badgeType: badge.type,
      agentId: identity.id,
      agentName: identity.name,
      walletAddress: identity.walletAddress,
      reputationScore: identity.reputation.score,
      timestamp: Date.now(),
      metadata: {
        badgeName: badge.name,
        description: badge.description,
        earnedAt: badge.earnedAt,
      },
    })

    if (result.success && result.signature && result.explorerUrl) {
      // Record attestation in identity manager
      identityManager.recordBadgeAttestation(
        identity.id,
        badge.id,
        result.signature,
        result.explorerUrl
      )

      alert(`✅ Badge "${badge.name}" attested on-chain!\n\nTransaction: ${result.signature}\n\nView on explorer: ${result.explorerUrl}`)
      setShowAttestModal(false)
    } else {
      alert(`❌ Attestation failed: ${result.error}`)
    }
  }

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
                {identity?.isVerified && (
                  <span className="text-accent-secondary text-sm" title="Wallet Verified">
                    ✓
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-text-secondary capitalize">
                  {agent.type} Strategy
                </div>
                {identity && (
                  <>
                    <span className="text-text-muted">•</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-accent-secondary">
                        {identity.reputation.level}
                      </span>
                      <span className="text-xs text-text-muted">
                        ({identity.reputation.score})
                      </span>
                    </div>
                  </>
                )}
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

        {/* Trust Badges */}
        {identity && identity.badges.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-text-secondary font-semibold">Trust Badges</div>
              {identity.badges.some(b => b.attestation) && (
                <div className="text-xs text-status-success flex items-center gap-1">
                  <span>⛓️</span>
                  <span>On-chain verified</span>
                </div>
              )}
            </div>
            <div className="flex flex-wrap gap-2">
              {identity.badges.slice(0, 4).map(badge => (
                <div
                  key={badge.id}
                  className={`group relative px-2 py-1 rounded-lg text-xs font-semibold ${
                    badge.attestation
                      ? 'bg-status-success/10 border border-status-success/30 text-status-success'
                      : 'bg-accent-primary/10 border border-accent-primary/30 text-accent-primary'
                  }`}
                  title={badge.description}
                >
                  <span className="flex items-center gap-1">
                    {badge.icon} {badge.name}
                    {badge.attestation && (
                      <a
                        href={badge.attestation.explorerUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-status-success hover:text-accent-secondary ml-0.5"
                        onClick={(e) => e.stopPropagation()}
                        title="View on Solana Explorer"
                      >
                        ⛓️
                      </a>
                    )}
                  </span>
                </div>
              ))}
              {identity.badges.length > 4 && (
                <div className="px-2 py-1 rounded-lg bg-background-tertiary text-xs text-text-muted">
                  +{identity.badges.length - 4} more
                </div>
              )}
            </div>
          </div>
        )}

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
            className="w-full glass-hover neon-border px-4 py-3 rounded-lg font-heading font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mb-3"
          >
            {agent.status === 'executing' ? (
              <span className="text-text-muted">⚡ Running...</span>
            ) : (
              <span className="text-gradient">▶ Run Agent</span>
            )}
          </button>
        )}

        {/* Badge Attestation Button */}
        {agent.isReal && unAttestedBadges.length > 0 && (
          <button
            onClick={() => setShowAttestModal(true)}
            className="w-full glass-hover border border-status-success/30 px-4 py-2 rounded-lg font-heading text-sm font-semibold transition-all hover:scale-105 text-status-success"
          >
            ⛓️ Attest {unAttestedBadges.length} Badge{unAttestedBadges.length > 1 ? 's' : ''} On-Chain
          </button>
        )}
      </div>

      {/* Badge Attestation Modal */}
      {showAttestModal && typeof window !== 'undefined' && createPortal(
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowAttestModal(false)}
        >
          <motion.div
            className="glass rounded-xl border border-status-success/50 p-6 max-w-md w-full"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-heading font-bold text-white mb-2">
                  ⛓️ Attest Badges On-Chain
                </h3>
                <p className="text-sm text-text-secondary">
                  Create permanent, verifiable records of your agent's achievements on Solana blockchain.
                </p>
              </div>
              <button
                onClick={() => setShowAttestModal(false)}
                className="text-text-secondary hover:text-white transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {unAttestedBadges.map(badge => (
                <div
                  key={badge.id}
                  className="glass-hover p-4 rounded-lg border border-border-hover"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-white">{badge.name}</div>
                        <div className="text-xs text-text-secondary">{badge.description}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAttestBadge(badge)}
                    disabled={attesting}
                    className="w-full glass-hover neon-border px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 mt-2"
                  >
                    {attesting ? (
                      <span className="text-text-muted">⏳ Attesting...</span>
                    ) : (
                      <span className="text-gradient">Attest This Badge</span>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="glass-hover p-3 rounded-lg border border-accent-primary/30 bg-accent-primary/5">
              <div className="text-xs text-text-secondary">
                <div className="font-bold text-accent-primary mb-1">ℹ️ What is attestation?</div>
                Attestation creates a permanent record on Solana blockchain proving your agent earned this badge. Anyone can verify it via the transaction signature.
              </div>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}

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

function AgentLeaderboard({ identities }: { identities: AgentIdentity[] }) {
  return (
    <div className="glass rounded-xl border border-border overflow-hidden">
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-bold text-white">
            🏆 Top Agents
          </h3>
          <div className="text-xs text-text-secondary">
            by Reputation
          </div>
        </div>
      </div>

      <div className="p-4 space-y-3 max-h-[400px] overflow-y-auto">
        {identities.map((identity, index) => (
          <motion.div
            key={identity.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="glass-hover p-3 rounded-lg border border-border-hover"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl font-bold text-accent-primary">
                #{index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-sm font-bold text-white">
                    {identity.name}
                  </div>
                  {identity.isVerified && (
                    <span className="text-accent-secondary text-xs">✓</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-accent-secondary">
                    {identity.reputation.level}
                  </span>
                  <span className="text-xs text-text-muted">•</span>
                  <span className="text-xs text-text-muted">
                    {identity.reputation.score} pts
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-text-secondary">Executions</div>
                <div className="text-sm font-bold text-white">
                  {identity.stats.totalExecutions}
                </div>
              </div>
            </div>

            {/* Top Badge */}
            {identity.badges.length > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-accent-primary">
                  {identity.badges[0].icon}
                </span>
                <span className="text-text-muted">
                  {identity.badges[0].name}
                </span>
              </div>
            )}

            {/* Reputation Breakdown */}
            <div className="grid grid-cols-4 gap-1 mt-2">
              <div className="text-center">
                <div className="text-xs text-text-muted">Perf</div>
                <div className="text-xs font-bold text-status-success">
                  {identity.reputation.performanceScore}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-text-muted">Rel</div>
                <div className="text-xs font-bold text-accent-secondary">
                  {identity.reputation.reliabilityScore}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-text-muted">Eff</div>
                <div className="text-xs font-bold text-accent-primary">
                  {identity.reputation.efficiencyScore}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-text-muted">Com</div>
                <div className="text-xs font-bold text-text-secondary">
                  {identity.reputation.communityScore}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {identities.length === 0 && (
          <div className="text-center py-12 text-text-secondary">
            <div className="text-4xl mb-3">🏆</div>
            <div className="text-sm">No agents yet</div>
            <div className="text-xs text-text-muted mt-1">
              Deploy an agent to appear on the leaderboard
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

// Deploy Agent Modal Component
function DeployAgentModal({
  onClose,
  onDeploy,
  walletAddress,
}: {
  onClose: () => void
  onDeploy: (agent: DeployedAgent) => void
  walletAddress?: string
}) {
  const [name, setName] = useState('')
  const [type, setType] = useState<'arbitrage' | 'optimizer' | 'whale' | 'custom' | 'composite'>('custom')
  const [prompt, setPrompt] = useState('Explain quantum computing')
  const [isDeploying, setIsDeploying] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<string | null>(null)

  // For composite agents
  const [workflowSteps, setWorkflowSteps] = useState<WorkflowStep[]>([
    { id: 'step-1', agentName: '', prompt: '' }
  ])

  // Prevent body scroll when modal is open
  useEffect(() => {
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [])

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

      // Create agent identity
      const identityManager = getAgentIdentityManager()
      const identity = identityManager.createIdentity(
        walletAddress || 'anonymous',
        name,
        type
      )

      // Deploy the agent
      const newAgent: DeployedAgent = {
        id: `real-${Date.now()}`,
        name,
        type,
        prompt,
        deployed: Date.now(),
        totalRuns: 0,
        status: 'idle',
        identityId: identity.id,
        // Include workflow for composite agents
        ...(type === 'composite' && { workflow: { steps: workflowSteps } }),
      }

      console.log('🎉 Agent deployed with identity:', identity.id)
      console.log('   Reputation Score:', identity.reputation.score)
      console.log('   Wallet:', identity.walletAddress)
      if (type === 'composite') {
        console.log('   Workflow Steps:', workflowSteps.length)
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
    <>
      {/* Backdrop */}
      <motion.div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        {/* Centered Modal with fixed height and internal scroll */}
        <motion.div
          className="glass border border-accent-primary/50 rounded-2xl z-[100000] w-full max-w-2xl h-[85vh] flex flex-col"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Fixed Header */}
          <div className="flex items-start justify-between p-6 pb-4 border-b border-border flex-shrink-0">
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
              className="text-text-secondary hover:text-white transition-colors text-2xl leading-none"
            >
              ✕
            </button>
          </div>

          {/* Scrollable Content Area - ALWAYS shows scrollbar */}
          <div className="overflow-y-scroll flex-1 min-h-0 p-6 scrollbar-custom">
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
              Agent Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-white focus:border-accent-primary focus:outline-none"
              disabled={isDeploying}
            >
              <option value="custom">Custom - General purpose AI agent</option>
              <option value="composite">🔗 Composite - Orchestrates multiple agents</option>
              <option value="arbitrage">Arbitrage - Find price differences</option>
              <option value="optimizer">Optimizer - Minimize costs</option>
              <option value="whale">Whale - Bulk purchases</option>
            </select>
          </div>

          {/* Conditional UI based on type */}
          {type === 'composite' ? (
            /* Workflow Builder for Composite Agents */
            <div>
              <label className="text-sm text-text-secondary mb-2 block">
                Workflow Steps (Agent-to-Agent Calls)
              </label>
              <div className="space-y-3">
                {workflowSteps.map((step, index) => (
                  <div key={step.id} className="glass-hover p-3 rounded-lg border border-border">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="px-2 py-1 bg-accent-primary/20 text-accent-primary text-xs font-bold rounded">
                        Step {index + 1}
                      </div>
                      {workflowSteps.length > 1 && (
                        <button
                          onClick={() => setWorkflowSteps(steps => steps.filter(s => s.id !== step.id))}
                          className="ml-auto text-status-error text-xs hover:scale-110 transition-transform"
                        >
                          ✕ Remove
                        </button>
                      )}
                    </div>
                    <input
                      placeholder="Agent name to call (e.g., 'Research Agent')"
                      value={step.agentName}
                      onChange={(e) => {
                        setWorkflowSteps(steps => steps.map(s =>
                          s.id === step.id ? { ...s, agentName: e.target.value } : s
                        ))
                      }}
                      className="w-full px-3 py-2 mb-2 bg-background-secondary border border-border rounded text-sm text-white placeholder-text-muted focus:border-accent-primary focus:outline-none"
                    />
                    <textarea
                      placeholder="Prompt for this agent..."
                      value={step.prompt}
                      onChange={(e) => {
                        setWorkflowSteps(steps => steps.map(s =>
                          s.id === step.id ? { ...s, prompt: e.target.value } : s
                        ))
                      }}
                      rows={2}
                      className="w-full px-3 py-2 bg-background-secondary border border-border rounded text-sm text-white placeholder-text-muted focus:border-accent-primary focus:outline-none resize-none"
                    />
                  </div>
                ))}
                <button
                  onClick={() => setWorkflowSteps(steps => [...steps, { id: `step-${Date.now()}`, agentName: '', prompt: '' }])}
                  className="w-full glass-hover border border-accent-primary/50 px-3 py-2 rounded-lg text-sm font-semibold text-accent-primary hover:scale-105 transition-all"
                >
                  + Add Step
                </button>
              </div>
              <div className="mt-2 text-xs text-text-muted">
                💡 Composite agents orchestrate other agents with x402 payments
              </div>
            </div>
          ) : (
            /* Regular Prompt for Other Agent Types */
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
          )}

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
            </div>
          </div>

          {/* Fixed Footer with Deploy Button */}
          <div className="border-t border-border p-6 pt-4 flex-shrink-0">
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

            <div className="text-xs text-text-muted text-center mt-3">
              Make sure Parallax is running on localhost:3001
            </div>
          </div>
        </motion.div>
      </motion.div>
    </>,
    document.body
  )
}

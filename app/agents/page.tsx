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
import { supabase, DeployedAgentDB, TransactionDB } from '@/lib/supabase'
import { LiveActivityFeed } from '@/components/LiveActivityFeed'
import { AutonomousSchedulerPanel } from '@/components/AutonomousSchedulerPanel'

interface AgentStats {
  id: string
  name: string
  type: 'arbitrage' | 'optimizer' | 'whale' | 'custom' | 'composite'
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
  wallet_address?: string  // Owner's wallet address
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

  // Set execution callback for autonomous scheduler
  useEffect(() => {
    if (scheduler) {
      scheduler.setExecutionCallback(runAgent)
      console.log('✅ Autonomous scheduler execution callback set')
    }
  }, [scheduler, deployedAgents, identityManager, isWalletConnected, publicKey, selectedProvider])

  // Load deployed agents from Supabase on mount
  useEffect(() => {
    const loadAgents = async () => {
      try {
        console.log('📥 Loading deployed agents from Supabase...')

        // Fetch from Supabase
        const { data, error } = await supabase
          .from('agents')
          .select('*')
          .order('deployed', { ascending: false })

        if (error) {
          console.error('Supabase fetch error:', error)
          // Fallback to localStorage if Supabase fails
          const stored = localStorage.getItem('parallaxpay_deployed_agents')
          if (stored) {
            const agents = JSON.parse(stored) as DeployedAgent[]
            setDeployedAgents(agents)
            console.log(`📦 Loaded ${agents.length} deployed agents from localStorage (Supabase unavailable)`)
          }
          return
        }

        if (data && data.length > 0) {
          // Convert DB format to app format
          const agents: DeployedAgent[] = data.map((db: DeployedAgentDB) => ({
            id: db.id,
            name: db.name,
            type: db.type as DeployedAgent['type'],
            prompt: db.prompt,
            deployed: db.deployed,
            totalRuns: db.total_runs,
            lastRun: db.last_run,
            lastResult: db.last_result,
            status: db.status as DeployedAgent['status'],
            provider: db.provider,
            identityId: db.identity_id,
            workflow: db.workflow,
          }))

          setDeployedAgents(agents)
          console.log(`✅ Loaded ${agents.length} deployed agents from Supabase`)

          // Also save to localStorage as backup
          localStorage.setItem('parallaxpay_deployed_agents', JSON.stringify(agents))
        } else {
          // No data in Supabase, try localStorage
          const stored = localStorage.getItem('parallaxpay_deployed_agents')
          if (stored) {
            const agents = JSON.parse(stored) as DeployedAgent[]
            setDeployedAgents(agents)
            console.log(`📦 Loaded ${agents.length} deployed agents from localStorage (Supabase empty)`)
          }
        }
      } catch (error) {
        console.error('Failed to load deployed agents from Supabase:', error)
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem('parallaxpay_deployed_agents')
          if (stored) {
            const agents = JSON.parse(stored) as DeployedAgent[]
            setDeployedAgents(agents)
            console.log(`📦 Loaded ${agents.length} deployed agents from localStorage (Supabase error)`)
          }
        } catch (localError) {
          console.error('Failed to load from localStorage:', localError)
        }
      }
    }

    loadAgents()
  }, [])

  // Save deployed agents to Supabase whenever they change
  useEffect(() => {
    const saveAgents = async () => {
      if (deployedAgents.length === 0) return

      try {
        console.log(`💾 Saving ${deployedAgents.length} deployed agents to Supabase...`)

        // Convert app format to DB format
        const dbAgents: DeployedAgentDB[] = deployedAgents.map(agent => ({
          id: agent.id,
          name: agent.name,
          type: agent.type,
          prompt: agent.prompt,
          deployed: agent.deployed,
          total_runs: agent.totalRuns,
          status: agent.status,
          identity_id: agent.identityId,
          last_run: agent.lastRun,
          last_result: agent.lastResult,
          provider: agent.provider,
          wallet_address: publicKey?.toBase58(),
          workflow: agent.workflow,
        }))

        // Upsert to Supabase (insert or update)
        const { error } = await supabase
          .from('agents')
          .upsert(dbAgents, { onConflict: 'id' })

        if (error) {
          console.error('Supabase upsert error:', error)
          // Fallback to localStorage if Supabase fails
          localStorage.setItem('parallaxpay_deployed_agents', JSON.stringify(deployedAgents))
          console.log(`💾 Saved ${deployedAgents.length} deployed agents to localStorage (Supabase unavailable)`)
        } else {
          console.log(`✅ Saved ${deployedAgents.length} deployed agents to Supabase`)
          // Also save to localStorage as backup
          localStorage.setItem('parallaxpay_deployed_agents', JSON.stringify(deployedAgents))
        }
      } catch (error) {
        console.error('Failed to save deployed agents to Supabase:', error)
        // Fallback to localStorage
        try {
          localStorage.setItem('parallaxpay_deployed_agents', JSON.stringify(deployedAgents))
          console.log(`💾 Saved ${deployedAgents.length} deployed agents to localStorage (Supabase error)`)
        } catch (localError) {
          console.error('Failed to save to localStorage:', localError)
        }
      }
    }

    saveAgents()
  }, [deployedAgents, publicKey])

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

  // Load trades from Supabase on mount (PUBLIC FEED - all users' trades)
  useEffect(() => {
    const loadTrades = async () => {
      try {
        console.log('📥 Loading trades from Supabase (public feed)...')

        // Fetch from Supabase - get latest 50 trades from ALL users
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(50)

        if (error) {
          console.error('Supabase fetch error (trades):', error)
          // Fallback to localStorage if Supabase fails
          const stored = localStorage.getItem('parallaxpay_transactions')
          if (stored) {
            const localTrades = JSON.parse(stored)
            // Convert to Trade format
            const tradesFromLocal = localTrades.slice(0, 10).map((t: any) => ({
              id: t.id,
              agentName: t.agentName || t.agent_name || 'Unknown Agent',
              provider: t.provider || 'Unknown Provider',
              tokens: t.tokens || 0,
              cost: t.cost || t.total_cost || 0,
              timestamp: t.timestamp,
              txHash: t.tx_hash || t.txHash || 'pending',
              isReal: true,
            }))
            setTrades(tradesFromLocal)
            console.log(`📦 Loaded ${tradesFromLocal.length} trades from localStorage (Supabase unavailable)`)
          }
          return
        }

        if (data && data.length > 0) {
          // Convert DB format to app format
          const tradesFromDB: Trade[] = data.slice(0, 10).map((db: TransactionDB) => ({
            id: db.id,
            agentName: db.agent_name || 'Unknown Agent',
            provider: db.provider || 'Unknown Provider',
            tokens: db.tokens || 0,
            cost: db.cost || db.total_cost || 0,
            timestamp: db.timestamp,
            txHash: db.tx_hash || 'pending',
            isReal: true,
          }))

          setTrades(tradesFromDB)
          console.log(`✅ Loaded ${tradesFromDB.length} trades from Supabase (public feed)`)
        }
      } catch (error) {
        console.error('Failed to load trades from Supabase:', error)
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem('parallaxpay_transactions')
          if (stored) {
            const localTrades = JSON.parse(stored)
            const tradesFromLocal = localTrades.slice(0, 10).map((t: any) => ({
              id: t.id,
              agentName: t.agentName || t.agent_name || 'Unknown Agent',
              provider: t.provider || 'Unknown Provider',
              tokens: t.tokens || 0,
              cost: t.cost || t.total_cost || 0,
              timestamp: t.timestamp,
              txHash: t.tx_hash || t.txHash || 'pending',
              isReal: true,
            }))
            setTrades(tradesFromLocal)
            console.log(`📦 Loaded ${tradesFromLocal.length} trades from localStorage (Supabase error)`)
          }
        } catch (localError) {
          console.error('Failed to load from localStorage:', localError)
        }
      }
    }

    loadTrades()
  }, [])

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
      ? `Completed: "${da.lastResult.substring(0, 200)}..."`
      : `Ready to run: "${da.prompt.substring(0, 100)}..."`,
    lastActionTime: da.lastRun || da.deployed,
    avatar: da.type === 'arbitrage' ? '🎯' : da.type === 'optimizer' ? '💰' : da.type === 'whale' ? '🐋' : da.type === 'composite' ? '🔗' : '🤖',
    color: da.type === 'arbitrage' ? '#9945FF' : da.type === 'optimizer' ? '#14F195' : da.type === 'whale' ? '#00D4FF' : da.type === 'composite' ? '#FF6B9D' : '#00B4FF',
    isReal: true,
  }))

  // Run an agent's task with REAL x402 PAYMENT using USER WALLET
  const runAgent = async (agentId: string): Promise<{ success: boolean; cost: number; error?: string }> => {
    const agent = deployedAgents.find(a => a.id === agentId)
    if (!agent || !identityManager) {
      return { success: false, cost: 0, error: 'Agent not found or identity manager not initialized' }
    }

    // Check wallet connection
    if (!isWalletConnected) {
      return { success: false, cost: 0, error: 'Wallet not connected' }
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

        // Call composite agent endpoint with x402 payment
        const response = await fetchWithPayment('/api/runCompositeAgent', {
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

        // Store composite execution in Supabase (PUBLIC - visible to all users)
        try {
          const txData: TransactionDB = {
            id: `composite-${Date.now()}`,
            timestamp: Date.now(),
            type: 'composite',
            agent_name: agent.name,
            steps: data.executionTrail.length,
            total_cost: data.totalCost,
            status: 'success',
            network: 'solana-devnet',
            wallet_address: publicKey?.toBase58(),
          }

          const { error } = await supabase
            .from('transactions')
            .insert([txData])

          if (error) {
            console.error('Supabase insert error (transaction):', error)
            // Fallback to localStorage
            const stored = localStorage.getItem('parallaxpay_transactions') || '[]'
            const transactions = JSON.parse(stored)
            transactions.push({
              id: txData.id,
              timestamp: txData.timestamp,
              type: txData.type,
              agentName: txData.agent_name,
              steps: txData.steps,
              totalCost: txData.total_cost,
              status: txData.status,
              network: txData.network,
            })
            localStorage.setItem('parallaxpay_transactions', JSON.stringify(transactions))
            console.log('💾 Saved transaction to localStorage (Supabase unavailable)')
          } else {
            console.log('✅ Saved transaction to Supabase (public feed)')
            // Also save to localStorage as backup
            const stored = localStorage.getItem('parallaxpay_transactions') || '[]'
            const transactions = JSON.parse(stored)
            transactions.push({
              id: txData.id,
              timestamp: txData.timestamp,
              type: txData.type,
              agentName: txData.agent_name,
              steps: txData.steps,
              totalCost: txData.total_cost,
              status: txData.status,
              network: txData.network,
            })
            localStorage.setItem('parallaxpay_transactions', JSON.stringify(transactions))
          }
        } catch (e) {
          console.warn('Failed to store transaction:', e)
        }

        return { success: data.success, cost: data.totalCost, error: data.success ? undefined : 'Composite workflow failed' }
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

      // Store in Supabase for transaction history (PUBLIC - visible to all users)
      try {
        const txData: TransactionDB = {
          id: newTrade.id,
          timestamp: newTrade.timestamp,
          type: 'agent',
          agent_name: agent.name,
          provider: newTrade.provider,
          tokens: newTrade.tokens,
          cost: newTrade.cost,
          tx_hash: newTrade.txHash,
          status: 'success',
          network: 'solana-devnet',
          wallet_address: publicKey?.toBase58(),
        }

        const { error } = await supabase
          .from('transactions')
          .insert([txData])

        if (error) {
          console.error('Supabase insert error (transaction):', error)
          // Fallback to localStorage
          const stored = localStorage.getItem('parallaxpay_transactions') || '[]'
          const transactions = JSON.parse(stored)
          transactions.push({
            id: txData.id,
            timestamp: txData.timestamp,
            type: txData.type,
            agentName: txData.agent_name,
            provider: txData.provider,
            tokens: txData.tokens,
            cost: txData.cost,
            txHash: txData.tx_hash,
            status: txData.status,
            network: txData.network,
          })
          localStorage.setItem('parallaxpay_transactions', JSON.stringify(transactions))
          console.log('💾 Saved transaction to localStorage (Supabase unavailable)')
        } else {
          console.log('✅ Saved transaction to Supabase (public feed)')
          // Also save to localStorage as backup
          const stored = localStorage.getItem('parallaxpay_transactions') || '[]'
          const transactions = JSON.parse(stored)
          transactions.push({
            id: txData.id,
            timestamp: txData.timestamp,
            type: txData.type,
            agentName: txData.agent_name,
            provider: txData.provider,
            tokens: txData.tokens,
            cost: txData.cost,
            txHash: txData.tx_hash,
            status: txData.status,
            network: txData.network,
          })
          localStorage.setItem('parallaxpay_transactions', JSON.stringify(transactions))
        }
      } catch (e) {
        console.warn('Failed to store transaction:', e)
      }

      return { success: true, cost: data.cost || 0.001 }

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

      return { success: false, cost: 0.001, error: errorMessage }
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
    <div className="min-h-screen bg-white">
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
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
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
                Agent Dashboard
              </h2>
            </div>

            <div className="flex items-center gap-3">
              {/* Wallet Connect Button */}
              <WalletMultiButton className="!bg-black !text-white !rounded-lg !px-4 !py-2 !text-sm !font-bold hover:!bg-gray-800 !transition-all" />

              <Link href="/marketplace">
                <button className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-black transition-all border border-gray-200 hover:border-gray-400">
                  Marketplace
                </button>
              </Link>
              <button
                onClick={() => setShowDeployModal(true)}
                className="bg-black text-white px-6 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all"
              >
                + Deploy Agent
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats and Provider Section - NOT sticky, scrolls away */}
      <div className="border-b border-gray-200 bg-gray-50">
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
                className="bg-white p-4 rounded-xl border-2 border-green-200 shadow-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">{selectedProvider.featured ? '⭐' : '🖥️'}</div>
                    <div className="flex-1">
                      <div className="font-bold text-black mb-1 text-lg">
                        ✅ Agents using: {selectedProvider.name}
                      </div>
                      <div className="flex items-center gap-4 text-xs">
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Model:</span>
                          <span className="text-black font-mono font-bold">{selectedProvider.model.split('/')[1]}</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Latency:</span>
                          <span className="text-green-600 font-mono font-bold">{selectedProvider.latency}ms</span>
                        </div>
                        <span className="text-gray-400">•</span>
                        <div className="flex items-center gap-1">
                          <span className="text-gray-600">Uptime:</span>
                          <span className="text-blue-600 font-mono font-bold">{selectedProvider.uptime}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <Link href="/marketplace">
                    <button className="border-2 border-gray-200 px-4 py-2 rounded-lg text-sm font-bold text-black hover:border-black hover:bg-gray-50 transition-all">
                      Change Provider →
                    </button>
                  </Link>
                </div>
              </motion.div>
            ) : (
              <motion.div
                className="bg-white p-4 rounded-xl border-2 border-red-200 shadow-sm"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-3xl">⚠️</div>
                    <div className="flex-1">
                      <div className="font-bold text-red-600 mb-1 text-lg">
                        No Provider Selected
                      </div>
                      <div className="text-xs text-gray-600">
                        Select a Parallax provider to run your agents. Agents need a compute provider for AI inference.
                      </div>
                    </div>
                  </div>
                  <Link href="/marketplace">
                    <button className="bg-black text-white px-6 py-3 rounded-lg text-sm font-bold hover:bg-gray-800 transition-all">
                      Select Provider →
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
            {/* MY AGENTS SECTION */}
            {publicKey && (() => {
              const myAgents = deployedAgents.filter(a =>
                a.wallet_address === publicKey.toBase58()
              );
              return myAgents.length > 0 && (
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-2xl font-bold text-black">
                      💼 My Agents
                    </h3>
                    <div className="text-sm text-green-600 font-semibold">
                      {myAgents.length} active
                    </div>
                  </div>

                  <div className="space-y-4">
                    {myAgents.map((agent, index) => {
                      const identity = agent.identityId
                        ? agentIdentities.find(id => id.id === agent.identityId)
                        : undefined

                      // Convert to AgentStats format for AgentCard
                      const agentStats: AgentStats = {
                        id: agent.id,
                        name: agent.name,
                        type: agent.type as any,
                        status: agent.status === 'running' ? 'executing' : 'idle',
                        totalTrades: agent.totalRuns,
                        profit: 0,
                        avgCost: 0.001,
                        successRate: 100,
                        lastAction: agent.lastResult || 'Ready',
                        lastActionTime: agent.lastRun || agent.deployed,
                        avatar: '🤖',
                        color: 'cyan',
                        isReal: true
                      }

                      return (
                        <AgentCard
                          key={agent.id}
                          agent={agentStats}
                          index={index}
                          onRun={() => runAgent(agent.id)}
                          identity={identity}
                        />
                      )
                    })}
                  </div>
                </div>
              );
            })()}

            {/* EMPTY STATE - Show when wallet connected but no agents */}
            {publicKey && deployedAgents.filter(a =>
              a.wallet_address === publicKey.toBase58()
            ).length === 0 && (
              <div className="bg-white p-6 rounded-xl border-2 border-blue-200 mb-4 shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="text-3xl">🚀</div>
                  <div>
                    <div className="font-bold text-black mb-2">
                      Deploy Your First Agent
                    </div>
                    <div className="text-sm text-gray-600 mb-3">
                      Create an autonomous AI agent that runs on Gradient Parallax and pays for itself with x402 micropayments.
                    </div>
                    <button
                      onClick={() => setShowDeployModal(true)}
                      className="bg-black text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-gray-800 transition-all"
                    >
                      Deploy First Agent
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PUBLIC MARKETPLACE SECTION */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-2xl font-bold text-black">
                  🌐 Public Marketplace
                </h3>
                {deployedAgents.length > 0 && (
                  <div className="text-sm text-gray-600">
                    {deployedAgents.length} agents available
                  </div>
                )}
              </div>

              {!publicKey && (
                <div className="bg-white p-4 rounded-xl border-2 border-gray-200 mb-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="text-2xl">👛</div>
                    <div className="flex-1">
                      <div className="font-semibold text-black mb-1">Connect Wallet to Deploy</div>
                      <div className="text-sm text-gray-600">
                        Connect your Solana wallet to deploy and run agents
                      </div>
                    </div>
                    <WalletMultiButton className="!bg-black !text-white !rounded-lg !px-4 !py-2 !text-sm !font-bold hover:!bg-gray-800" />
                  </div>
                </div>
              )}

              {deployedAgents.length === 0 && (
                <div className="bg-white p-6 rounded-xl border-2 border-gray-200 text-center shadow-sm">
                  <div className="text-4xl mb-3">📭</div>
                  <div className="font-semibold text-gray-600 mb-2">No Public Agents Yet</div>
                  <div className="text-sm text-gray-500">
                    Be the first to deploy an agent to the marketplace!
                  </div>
                </div>
              )}

              <div className="space-y-4">
                {deployedAgents.map((agent, index) => {
                  const identity = agent.identityId
                    ? agentIdentities.find(id => id.id === agent.identityId)
                    : undefined

                  // Convert to AgentStats format
                  const agentStats: AgentStats = {
                    id: agent.id,
                    name: agent.name,
                    type: agent.type as any,
                    status: agent.status === 'running' ? 'executing' : 'idle',
                    totalTrades: agent.totalRuns,
                    profit: 0,
                    avgCost: 0.001,
                    successRate: 100,
                    lastAction: agent.lastResult || 'Ready',
                    lastActionTime: agent.lastRun || agent.deployed,
                    avatar: '🌐',
                    color: 'purple',
                    isReal: true
                  }

                  const isMyAgent = publicKey && agent.wallet_address === publicKey.toBase58()

                  return (
                    <div key={agent.id} className="relative">
                      {isMyAgent && (
                        <div className="absolute -top-2 -right-2 z-10 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                          Yours
                        </div>
                      )}
                      <AgentCard
                        agent={agentStats}
                        index={index}
                        onRun={() => runAgent(agent.id)}
                        identity={identity}
                      />
                    </div>
                  )
                })}
              </div>
            </div>

            {/* SDK Example */}
            <SDKExample />
          </div>

          {/* Right - Live Feed */}
          <div className="col-span-12 lg:col-span-4 space-y-6">
            <LiveActivityFeed />
            {agentIdentities.length > 0 && identityManager && (
              <AgentLeaderboard identities={identityManager.getLeaderboard(5)} />
            )}
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
    <div className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm">
      <div className="flex items-start justify-between mb-1">
        <span className="text-xs text-gray-600">{label}</span>
        <span className="text-sm">{icon}</span>
      </div>
      <div
        className={`text-lg font-black ${
          color === 'success'
            ? 'text-green-600'
            : color === 'error'
            ? 'text-red-600'
            : 'text-black'
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
  const [showScheduleModal, setShowScheduleModal] = useState(false)
  const identityManager = getAgentIdentityManager()

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (showScheduleModal || showAttestModal) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [showScheduleModal, showAttestModal])

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
      className={`bg-white rounded-xl border-2 overflow-hidden shadow-sm ${
        agent.isReal
          ? 'border-blue-200'
          : 'border-gray-200 opacity-60'
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
                <h4 className="text-xl font-bold text-black">
                  {agent.name}
                </h4>
                {agent.isReal && (
                  <span className="px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-bold border border-green-300">
                    REAL
                  </span>
                )}
                {identity?.isVerified && (
                  <span className="text-blue-600 text-sm" title="Wallet Verified">
                    ✓
                  </span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <div className="text-sm text-gray-600 capitalize">
                  {agent.type} Strategy
                </div>
                {identity && (
                  <>
                    <span className="text-gray-400">•</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-blue-600">
                        {identity.reputation.level}
                      </span>
                      <span className="text-xs text-gray-500">
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
                ? 'bg-blue-100 text-blue-700 animate-pulse'
                : agent.status === 'active'
                ? 'bg-green-100 text-green-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {agent.status === 'executing' ? '⚡ EXECUTING' : agent.status.toUpperCase()}
          </div>
        </div>

        {/* Trust Badges */}
        {identity && identity.badges.length > 0 && (
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs text-gray-600 font-semibold">Trust Badges</div>
              {identity.badges.some(b => b.attestation) && (
                <div className="text-xs text-green-600 flex items-center gap-1">
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
                      ? 'bg-green-100 border border-green-300 text-green-700'
                      : 'bg-blue-100 border border-blue-300 text-blue-700'
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
                        className="text-green-700 hover:text-blue-600 ml-0.5"
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
                <div className="px-2 py-1 rounded-lg bg-gray-100 text-xs text-gray-600">
                  +{identity.badges.length - 4} more
                </div>
              )}
            </div>
          </div>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-4 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-600 mb-1">Trades</div>
            <div className="text-lg font-bold text-black">
              {agent.totalTrades}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Profit</div>
            <div className="text-lg font-bold text-green-600">
              +${agent.profit.toFixed(0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Avg Cost</div>
            <div className="text-lg font-bold text-black">
              ${agent.avgCost.toFixed(5)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-600 mb-1">Success</div>
            <div className="text-lg font-bold text-blue-600">
              {agent.successRate}%
            </div>
          </div>
        </div>

        {/* Last Action */}
        <div className="bg-gray-50 p-4 rounded-lg border border-gray-200 mb-4">
          <div className="text-sm text-black font-medium mb-1">
            {agent.lastAction}
          </div>
          <div className="text-xs text-gray-500">{timeStr}</div>
        </div>

        {/* Action Buttons */}
        {agent.isReal && (
          <div className="space-y-2">
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={onRun}
                disabled={agent.status === 'executing'}
                className="bg-black text-white px-4 py-3 rounded-lg font-semibold transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-black"
              >
                {agent.status === 'executing' ? (
                  <span>⚡ Running...</span>
                ) : (
                  <span>▶ Run</span>
                )}
              </button>

              <button
                onClick={() => setShowScheduleModal(true)}
                className="border-2 border-purple-200 px-4 py-3 rounded-lg font-semibold transition-all hover:border-purple-400 hover:bg-purple-50 text-purple-700"
              >
                🤖 Schedule
              </button>
            </div>

            {/* Badge Attestation Button */}
            {unAttestedBadges.length > 0 && (
              <button
                onClick={() => setShowAttestModal(true)}
                className="w-full border-2 border-green-200 px-4 py-2 rounded-lg text-sm font-semibold transition-all hover:border-green-400 hover:bg-green-50 text-green-700"
              >
                ⛓️ Attest {unAttestedBadges.length} Badge{unAttestedBadges.length > 1 ? 's' : ''} On-Chain
              </button>
            )}
          </div>
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
            className="bg-white rounded-xl border-2 border-green-200 p-6 max-w-md w-full shadow-xl"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between mb-6">
              <div>
                <h3 className="text-xl font-heading font-bold text-black mb-2">
                  ⛓️ Attest Badges On-Chain
                </h3>
                <p className="text-sm text-gray-600">
                  Create permanent, verifiable records of your agent's achievements on Solana blockchain.
                </p>
              </div>
              <button
                onClick={() => setShowAttestModal(false)}
                className="text-gray-600 hover:text-black transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 mb-6">
              {unAttestedBadges.map(badge => (
                <div
                  key={badge.id}
                  className="bg-gray-50 p-4 rounded-lg border-2 border-gray-200 hover:border-gray-300 transition-all"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-2xl">{badge.icon}</span>
                      <div>
                        <div className="text-sm font-bold text-black">{badge.name}</div>
                        <div className="text-xs text-gray-600">{badge.description}</div>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => handleAttestBadge(badge)}
                    disabled={attesting}
                    className="w-full bg-black text-white px-3 py-2 rounded-lg text-xs font-semibold transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                  >
                    {attesting ? (
                      <span>⏳ Attesting...</span>
                    ) : (
                      <span>Attest This Badge</span>
                    )}
                  </button>
                </div>
              ))}
            </div>

            <div className="bg-blue-50 p-3 rounded-lg border-2 border-blue-200">
              <div className="text-xs text-gray-600">
                <div className="font-bold text-blue-600 mb-1">ℹ️ What is attestation?</div>
                Attestation creates a permanent record on Solana blockchain proving your agent earned this badge. Anyone can verify it via the transaction signature.
              </div>
            </div>
          </motion.div>
        </motion.div>,
        document.body
      )}

      {/* Autonomous Scheduler Modal */}
      {showScheduleModal && typeof window !== 'undefined' && createPortal(
        <motion.div
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-start justify-center p-4 overflow-y-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => setShowScheduleModal(false)}
        >
          <motion.div
            className="max-w-2xl w-full my-8"
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            onClick={(e) => e.stopPropagation()}
          >
            <AutonomousSchedulerPanel
              agentId={agent.id}
              agentName={agent.name}
              onScheduleChange={() => {
                // Modal will close manually when user clicks close button
              }}
            />
            <button
              onClick={() => setShowScheduleModal(false)}
              className="mt-4 w-full bg-black text-white px-4 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all"
            >
              Close
            </button>
          </motion.div>
        </motion.div>,
        document.body
      )}

      {/* Progress Bar */}
      {agent.status === 'executing' && (
        <div className="h-1 bg-gray-200">
          <motion.div
            className="h-full bg-blue-600"
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
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">
            Live Trade Feed
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs text-green-600 font-semibold">
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
              className="bg-gray-50 p-3 rounded-lg border border-gray-200"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="text-sm font-medium text-black">
                  {trade.agentName}
                </div>
                <div className="text-xs text-green-600 font-bold">
                  +${trade.cost.toFixed(4)}
                </div>
              </div>
              <div className="text-xs text-gray-600 mb-2">
                {trade.provider} • {trade.tokens} tokens
              </div>
              <div className="flex items-center justify-between">
                <div className="text-xs font-mono text-gray-500">
                  {trade.txHash}
                </div>
                <div className="text-xs text-gray-500">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {trades.length === 0 && (
          <div className="text-center py-12 text-gray-600">
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
    <div className="bg-white rounded-xl border-2 border-gray-200 p-6 shadow-sm">
      <h3 className="text-lg font-bold text-black mb-4">
        Performance Metrics
      </h3>

      <div className="space-y-4">
        {agents.map((agent) => (
          <div key={agent.id}>
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <span>{agent.avatar}</span>
                <span className="text-sm text-black font-medium">
                  {agent.type}
                </span>
              </div>
              <span className="text-sm text-green-600 font-bold">
                ${agent.profit.toFixed(0)}
              </span>
            </div>
            <div className="w-full h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-blue-600 rounded-full"
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
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
      <div className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="text-xl font-bold text-black mb-2">
              Build Your Own Agent
            </h3>
            <p className="text-sm text-gray-600">
              Use our SDK to create custom trading strategies
            </p>
          </div>
          <button className="px-4 py-2 rounded-lg text-sm font-semibold border border-gray-200 hover:border-black transition-all">
            View Docs →
          </button>
        </div>

        <div className="bg-gray-50 p-4 rounded-lg font-mono text-sm overflow-x-auto border border-gray-200">
          <pre className="text-gray-700">
            <span className="text-purple-600">import</span> {'{'}
            <span className="text-blue-600"> Agent </span>
            {'}'} <span className="text-purple-600">from</span>{' '}
            <span className="text-green-600">'@parallaxpay/sdk'</span>
            {'\n\n'}
            <span className="text-purple-600">const</span> agent ={' '}
            <span className="text-purple-600">new</span>{' '}
            <span className="text-blue-600">Agent</span>({'{'}
            {'\n  '}strategy: <span className="text-green-600">'arbitrage'</span>,
            {'\n  '}maxBudget: <span className="text-orange-600">1000</span>,
            {'\n  '}minReputation: <span className="text-orange-600">95</span>
            {'\n}'}){'\n\n'}
            agent.<span className="text-blue-600">start</span>()
          </pre>
        </div>
      </div>
    </div>
  )
}

function AgentLeaderboard({ identities }: { identities: AgentIdentity[] }) {
  return (
    <div className="bg-white rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-black">
            🏆 Top Agents
          </h3>
          <div className="text-xs text-gray-600">
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
            className="bg-gray-50 p-3 rounded-lg border border-gray-200"
          >
            <div className="flex items-center gap-3 mb-2">
              <div className="text-2xl font-bold text-blue-600">
                #{index + 1}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="text-sm font-bold text-black">
                    {identity.name}
                  </div>
                  {identity.isVerified && (
                    <span className="text-blue-600 text-xs">✓</span>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-blue-600">
                    {identity.reputation.level}
                  </span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-xs text-gray-500">
                    {identity.reputation.score} pts
                  </span>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xs text-gray-600">Executions</div>
                <div className="text-sm font-bold text-black">
                  {identity.stats.totalExecutions}
                </div>
              </div>
            </div>

            {/* Top Badge */}
            {identity.badges.length > 0 && (
              <div className="flex items-center gap-1 text-xs">
                <span className="text-blue-600">
                  {identity.badges[0].icon}
                </span>
                <span className="text-gray-500">
                  {identity.badges[0].name}
                </span>
              </div>
            )}

            {/* Reputation Breakdown */}
            <div className="grid grid-cols-4 gap-1 mt-2">
              <div className="text-center">
                <div className="text-xs text-gray-500">Perf</div>
                <div className="text-xs font-bold text-green-600">
                  {identity.reputation.performanceScore}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Rel</div>
                <div className="text-xs font-bold text-blue-600">
                  {identity.reputation.reliabilityScore}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Eff</div>
                <div className="text-xs font-bold text-purple-600">
                  {identity.reputation.efficiencyScore}
                </div>
              </div>
              <div className="text-center">
                <div className="text-xs text-gray-500">Com</div>
                <div className="text-xs font-bold text-gray-600">
                  {identity.reputation.communityScore}
                </div>
              </div>
            </div>
          </motion.div>
        ))}

        {identities.length === 0 && (
          <div className="text-center py-12 text-gray-600">
            <div className="text-4xl mb-3">🏆</div>
            <div className="text-sm">No agents yet</div>
            <div className="text-xs text-gray-500 mt-1">
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
    // Validate based on agent type
    if (!name.trim()) {
      setError('Please enter an agent name')
      return
    }

    if (type === 'composite') {
      // For composite agents, validate workflow steps
      if (workflowSteps.length === 0 || workflowSteps.some(s => !s.agentName.trim() || !s.prompt.trim())) {
        setError('Please fill in all workflow steps (agent name and prompt required for each)')
        return
      }
    } else {
      // For regular agents, validate prompt
      if (!prompt.trim()) {
        setError('Please enter a test prompt')
        return
      }
    }

    setIsDeploying(true)
    setError(null)
    setResult(null)

    try {
      let content = ''

      // For composite agents, skip the test and show workflow summary
      if (type === 'composite') {
        content = `Composite Workflow Ready:\n\n${workflowSteps.map((s, i) => `${i + 1}. ${s.agentName}: "${s.prompt.substring(0, 50)}..."${s.useOutputFrom ? ` (uses output from Step ${i})` : ''}`).join('\n')}\n\nReady to orchestrate ${workflowSteps.length} agents!`
      } else {
        // Run REAL Parallax inference to test regular agents
        const { createParallaxClient } = await import('@/lib/parallax-client')
        const client = createParallaxClient('http://localhost:3001')

        const response = await client.inference({
          messages: [{ role: 'user', content: prompt }],
          max_tokens: 300, // Increased from 200 to avoid truncation
        })

        console.log('Agent deployment - Parallax response:', JSON.stringify(response, null, 2))

        // Parse response - handle multiple formats
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
        prompt: type === 'composite'
          ? `Workflow: ${workflowSteps.map(s => s.agentName).join(' → ')}`
          : prompt,
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
    <motion.div
      className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[99999] flex items-start justify-center p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      {/* Centered Modal - scrolls with backdrop */}
      <motion.div
        className="bg-white border-2 border-gray-200 rounded-2xl w-full max-w-3xl my-8 shadow-xl"
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between p-6 pb-4 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-heading font-bold text-black mb-2">
              Deploy Real Agent
            </h2>
            <p className="text-sm text-gray-600">
              This agent will run real AI inference on your Parallax cluster
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-600 hover:text-black transition-colors text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="space-y-4">
          {/* Agent Name */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Agent Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="My Trading Agent"
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:border-accent-primary focus:outline-none"
              disabled={isDeploying}
            />
          </div>

          {/* Agent Type */}
          <div>
            <label className="text-sm text-gray-600 mb-2 block">
              Agent Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-black focus:border-accent-primary focus:outline-none"
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
              <label className="text-sm text-gray-600 mb-2 block">
                Workflow Steps (Agent-to-Agent Calls)
              </label>
              <div className="space-y-3">
                {workflowSteps.map((step, index) => (
                  <div key={step.id} className="bg-gray-50 p-3 rounded-lg border-2 border-gray-200">
                    <div className="flex items-start gap-2 mb-2">
                      <div className="px-2 py-1 bg-purple-100 text-accent-primary text-xs font-bold rounded">
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
                      className="w-full px-3 py-2 mb-2 bg-white border-2 border-gray-200 rounded text-sm text-black placeholder-gray-400 focus:border-accent-primary focus:outline-none"
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
                      className="w-full px-3 py-2 mb-2 bg-white border-2 border-gray-200 rounded text-sm text-black placeholder-gray-400 focus:border-accent-primary focus:outline-none resize-none"
                    />

                    {/* Use output from previous step */}
                    {index > 0 && (
                      <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={step.useOutputFrom === workflowSteps[index - 1]?.id}
                          onChange={(e) => {
                            setWorkflowSteps(steps => steps.map(s =>
                              s.id === step.id
                                ? { ...s, useOutputFrom: e.target.checked ? workflowSteps[index - 1]?.id : undefined }
                                : s
                            ))
                          }}
                          className="rounded border-gray-200 bg-white text-accent-primary focus:ring-accent-primary focus:ring-2"
                        />
                        <span>Use output from Step {index}</span>
                      </label>
                    )}
                  </div>
                ))}
                <button
                  onClick={() => setWorkflowSteps(steps => [...steps, { id: `step-${Date.now()}`, agentName: '', prompt: '' }])}
                  className="w-full bg-gray-50 border-2 border-gray-200 px-3 py-2 rounded-lg text-sm font-semibold text-accent-primary hover:bg-gray-100 hover:border-gray-300 transition-all"
                >
                  + Add Step
                </button>
              </div>
              <div className="mt-2 text-xs text-gray-500">
                💡 Composite agents orchestrate other agents with x402 payments
              </div>
            </div>
          ) : (
            /* Regular Prompt for Other Agent Types */
            <div>
              <label className="text-sm text-gray-600 mb-2 block">
                Test Prompt (will run real inference)
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter a prompt to test the agent..."
                className="w-full px-4 py-3 bg-white border-2 border-gray-200 rounded-lg text-black placeholder-gray-400 focus:border-accent-primary focus:outline-none resize-none"
                rows={3}
                disabled={isDeploying}
              />
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="p-3 rounded-lg bg-red-50 border-2 border-red-200">
              <div className="text-sm text-red-600">{error}</div>
            </div>
          )}

          {/* Result */}
          {result && (
            <div className="p-4 rounded-lg bg-green-50 border-2 border-green-200">
              <div className="text-xs text-green-600 mb-2">✅ Test Successful! Deploying agent...</div>
              <div className="text-sm text-black whitespace-pre-wrap">{result.substring(0, 200)}...</div>
            </div>
          )}
          </div>

          {/* Deploy Button */}
          <button
            onClick={handleDeploy}
            disabled={
              isDeploying ||
              !name.trim() ||
              (type === 'composite'
                ? (workflowSteps.length === 0 || workflowSteps.some(s => !s.agentName.trim() || !s.prompt.trim()))
                : !prompt.trim()
              ) ||
              !!result
            }
            className="w-full bg-black text-white px-6 py-4 rounded-xl font-heading font-bold transition-all hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isDeploying ? (
              <span>⚡ Testing agent with Parallax...</span>
            ) : result ? (
              <span className="text-green-400">Deploying...</span>
            ) : (
              <span className="text-gradient">Deploy & Test Agent</span>
            )}
          </button>

          <div className="text-xs text-gray-500 text-center mt-3">
            Make sure Parallax is running on localhost:3001
          </div>
        </div>
      </motion.div>
    </motion.div>,
    document.body
  )
}

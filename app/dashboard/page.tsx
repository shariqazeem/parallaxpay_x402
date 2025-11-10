'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { supabase, DeployedAgentDB, TransactionDB } from '@/lib/supabase'
import { LiveActivityFeed } from '@/components/LiveActivityFeed'

interface DashboardStats {
  totalAgents: number
  totalExecutions: number
  totalCost: number
  reputationScore: number
}

export default function DashboardPage() {
  const { publicKey } = useWallet()
  const [stats, setStats] = useState<DashboardStats>({
    totalAgents: 0,
    totalExecutions: 0,
    totalCost: 0,
    reputationScore: 0
  })
  const [recentAgents, setRecentAgents] = useState<DeployedAgentDB[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadDashboardData()
  }, [publicKey])

  const loadDashboardData = async () => {
    try {
      setLoading(true)

      // Load agents
      const { data: agents, error: agentsError } = await supabase
        .from('deployed_agents')
        .select('*')
        .order('deployed', { ascending: false })

      if (agentsError) {
        console.error('Failed to load agents:', agentsError)
        return
      }

      // Load transactions
      const { data: transactions, error: txError } = await supabase
        .from('transactions')
        .select('*')

      if (txError) {
        console.error('Failed to load transactions:', txError)
        return
      }

      // Calculate stats
      const totalAgents = agents?.length || 0
      const totalExecutions = transactions?.length || 0
      const totalCost = transactions?.reduce((sum: number, tx: TransactionDB) => sum + (tx.cost || 0), 0) || 0
      const totalRuns = agents?.reduce((sum, agent) => sum + (agent.total_runs || 0), 0) || 0
      const reputationScore = totalRuns * 10 + totalAgents * 50 // Simple reputation calculation

      setStats({
        totalAgents,
        totalExecutions,
        totalCost,
        reputationScore
      })

      setRecentAgents(agents?.slice(0, 5) || [])
      setLoading(false)
    } catch (err) {
      console.error('Error loading dashboard:', err)
      setLoading(false)
    }
  }

  const quickActions = [
    {
      title: 'Deploy Agent',
      description: 'Create and deploy a new autonomous AI agent',
      icon: '🚀',
      href: '/agents',
      color: 'border-blue-200 hover:border-blue-400'
    },
    {
      title: 'View Marketplace',
      description: 'Browse available Parallax providers',
      icon: '🏪',
      href: '/marketplace',
      color: 'border-green-200 hover:border-green-400'
    },
    {
      title: 'Check Leaderboard',
      description: 'See top performers and earn badges',
      icon: '🏆',
      href: '/leaderboard',
      color: 'border-yellow-200 hover:border-yellow-400'
    },
    {
      title: 'Build Swarm',
      description: 'Create collaborative agent swarms',
      icon: '🤝',
      href: '/swarm',
      color: 'border-purple-200 hover:border-purple-400'
    }
  ]

  if (!publicKey) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">🔐</div>
          <h1 className="text-3xl font-black text-black mb-4">Connect Your Wallet</h1>
          <p className="text-gray-600 mb-8">
            Please connect your Solana wallet to access the dashboard and manage your autonomous agents.
          </p>
          <Link href="/">
            <button className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all">
              Go to Home
            </button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <Link href="/">
              <h1 className="text-2xl font-bold text-black cursor-pointer hover:opacity-70 transition-opacity">
                ParallaxPay
              </h1>
            </Link>

            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-semibold text-black">
                Dashboard
              </Link>
              <Link href="/agents" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                Agents
              </Link>
              <Link href="/marketplace" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                Marketplace
              </Link>
              <Link href="/leaderboard" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                Leaderboard
              </Link>
            </nav>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h1 className="text-5xl font-black text-black mb-3">
            Welcome back
          </h1>
          <p className="text-xl text-gray-600">
            Here's what's happening with your autonomous agents
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-4 gap-6 mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">🤖</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Agents</div>
            </div>
            <div className="text-4xl font-black text-black mb-1">
              {loading ? '...' : stats.totalAgents}
            </div>
            <div className="text-sm text-gray-600">Total deployed</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">⚡</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Executions</div>
            </div>
            <div className="text-4xl font-black text-black mb-1">
              {loading ? '...' : stats.totalExecutions}
            </div>
            <div className="text-sm text-gray-600">Successful runs</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">💰</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Spent</div>
            </div>
            <div className="text-4xl font-black text-black mb-1">
              {loading ? '...' : `$${stats.totalCost.toFixed(3)}`}
            </div>
            <div className="text-sm text-gray-600">Micropayments via x402</div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="text-3xl">🏆</div>
              <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Reputation</div>
            </div>
            <div className="text-4xl font-black text-black mb-1">
              {loading ? '...' : stats.reputationScore}
            </div>
            <div className="text-sm text-gray-600">Your ranking score</div>
          </motion.div>
        </div>

        {/* Quick Actions */}
        <div className="mb-12">
          <h2 className="text-3xl font-black text-black mb-6">Quick Actions</h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
              >
                <Link href={action.href}>
                  <div className={`bg-white rounded-xl p-6 border-2 ${action.color} transition-all hover:shadow-lg cursor-pointer h-full`}>
                    <div className="text-4xl mb-4">{action.icon}</div>
                    <h3 className="text-lg font-bold text-black mb-2">{action.title}</h3>
                    <p className="text-sm text-gray-600">{action.description}</p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          {/* Recent Agents */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-sm">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-black text-black">Recent Agents</h2>
                <Link href="/agents" className="text-sm font-semibold text-black hover:opacity-70 transition-opacity">
                  View All →
                </Link>
              </div>

              {loading ? (
                <div className="text-center py-12 text-gray-500">
                  <div className="text-4xl mb-3">⏳</div>
                  <div>Loading agents...</div>
                </div>
              ) : recentAgents.length === 0 ? (
                <div className="text-center py-12">
                  <div className="text-5xl mb-4">🤖</div>
                  <h3 className="text-xl font-bold text-black mb-2">No agents yet</h3>
                  <p className="text-gray-600 mb-6">Deploy your first autonomous agent to get started</p>
                  <Link href="/agents">
                    <button className="px-6 py-3 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all">
                      Deploy Agent
                    </button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentAgents.map((agent) => (
                    <div
                      key={agent.id}
                      className="p-4 rounded-lg border border-gray-200 hover:border-gray-400 transition-all"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="text-lg font-bold text-black truncate">{agent.name}</h3>
                            <span className="px-2 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded">
                              {agent.status}
                            </span>
                          </div>
                          <p className="text-sm text-gray-600 mb-2 line-clamp-2">{agent.prompt}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <span>🔄 {agent.total_runs || 0} runs</span>
                            <span>📅 {new Date(agent.deployed).toLocaleDateString()}</span>
                            {agent.provider && <span>⚡ {agent.provider}</span>}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Live Activity Feed */}
          <div className="lg:col-span-1">
            <LiveActivityFeed />
          </div>
        </div>

        {/* Feature Cards */}
        <div className="mt-12">
          <h2 className="text-3xl font-black text-black mb-6">Explore Features</h2>
          <div className="grid md:grid-cols-3 gap-6">
            <Link href="/swarm">
              <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-purple-400 hover:shadow-lg transition-all cursor-pointer">
                <div className="text-5xl mb-4">🤝</div>
                <h3 className="text-xl font-bold text-black mb-2">Agent Swarms</h3>
                <p className="text-gray-600">
                  Create collaborative agent swarms that work together to solve complex tasks through consensus.
                </p>
              </div>
            </Link>

            <Link href="/builder">
              <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-blue-400 hover:shadow-lg transition-all cursor-pointer">
                <div className="text-5xl mb-4">🔧</div>
                <h3 className="text-xl font-bold text-black mb-2">Workflow Builder</h3>
                <p className="text-gray-600">
                  Build complex multi-step workflows with visual tools and automated execution pipelines.
                </p>
              </div>
            </Link>

            <Link href="/leaderboard">
              <div className="bg-white rounded-xl p-8 border-2 border-gray-200 hover:border-yellow-400 hover:shadow-lg transition-all cursor-pointer">
                <div className="text-5xl mb-4">🏆</div>
                <h3 className="text-xl font-bold text-black mb-2">Leaderboard</h3>
                <p className="text-gray-600">
                  Compete with other users, earn badges, and build verifiable on-chain reputation.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

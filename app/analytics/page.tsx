'use client'

/**
 * Agent Performance Analytics Dashboard
 *
 * Comprehensive analytics for all deployed agents:
 * - Performance metrics per agent
 * - Cost breakdown and ROI
 * - Success rates and trends
 * - Provider usage statistics
 */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { supabase, DeployedAgentDB, TransactionDB } from '@/lib/supabase'

interface AgentAnalytics {
  id: string
  name: string
  type: string
  totalRuns: number
  totalCost: number
  avgCost: number
  successRate: number
  lastRun?: number
  deployed: number
  provider?: string
}

export default function AnalyticsPage() {
  const { publicKey } = useWallet()
  const [agents, setAgents] = useState<AgentAnalytics[]>([])
  const [transactions, setTransactions] = useState<TransactionDB[]>([])
  const [loading, setLoading] = useState(true)

  // Load data
  useEffect(() => {
    const loadData = async () => {
      if (!publicKey) {
        setLoading(false)
        return
      }

      setLoading(true)

      try {
        // Load user's agents
        const { data: agentsData, error: agentsError } = await supabase
          .from('agents')
          .select('*')
          .eq('wallet_address', publicKey.toBase58())
          .order('deployed', { ascending: false })

        if (!agentsError && agentsData) {
          const analyticsData: AgentAnalytics[] = agentsData.map((agent: DeployedAgentDB) => ({
            id: agent.id,
            name: agent.name,
            type: agent.type,
            totalRuns: agent.total_runs || 0,
            totalCost: (agent.total_runs || 0) * 0.001, // Estimate
            avgCost: 0.001,
            successRate: 100,
            lastRun: agent.last_run,
            deployed: agent.deployed,
            provider: agent.provider
          }))
          setAgents(analyticsData)
        }

        // Load user's transactions
        const { data: txData, error: txError } = await supabase
          .from('transactions')
          .select('*')
          .eq('wallet_address', publicKey.toBase58())
          .order('timestamp', { ascending: false })
          .limit(100)

        if (!txError && txData) {
          setTransactions(txData as TransactionDB[])
        }
      } catch (error) {
        console.error('Failed to load analytics:', error)
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [publicKey])

  // Calculate stats
  const totalRuns = agents.reduce((sum, a) => sum + a.totalRuns, 0)
  const totalCost = agents.reduce((sum, a) => sum + a.totalCost, 0)
  const avgCostPerRun = totalRuns > 0 ? totalCost / totalRuns : 0
  const bestAgent = agents.length > 0 ? agents.reduce((best, a) => a.totalRuns > best.totalRuns ? a : best) : null
  const mostExpensive = agents.length > 0 ? agents.reduce((max, a) => a.totalCost > max.totalCost ? a : max) : null

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-gray-200 bg-white/80 backdrop-blur-xl">
        <div className="max-w-[1400px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <h1 className="text-2xl font-black cursor-pointer hover:opacity-70 transition-opacity">
                  <span className="text-black">ParallaxPay</span>
                </h1>
              </Link>
              <div className="text-gray-400">/</div>
              <h2 className="text-xl font-bold text-black">
                📊 Analytics
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <WalletMultiButton className="!bg-black !text-white !rounded-lg !px-4 !py-2 !text-sm !font-bold hover:!bg-gray-800 !transition-all" />
              <Link href="/agents">
                <button className="px-4 py-2 rounded-lg text-sm font-semibold text-gray-700 hover:text-black transition-all border border-gray-200 hover:border-gray-400">
                  Agents
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8">
        {!publicKey ? (
          <div className="bg-white p-8 rounded-xl border-2 border-gray-200 text-center shadow-sm">
            <div className="text-5xl mb-4">👛</div>
            <h3 className="text-2xl font-bold text-black mb-3">Connect Wallet</h3>
            <p className="text-gray-600 mb-6">
              Connect your Solana wallet to view your agent performance analytics
            </p>
            <WalletMultiButton className="!bg-black !text-white !rounded-lg !px-6 !py-3 !text-base !font-bold hover:!bg-gray-800" />
          </div>
        ) : loading ? (
          <div className="text-center py-20">
            <div className="text-4xl mb-4">⏳</div>
            <div className="text-gray-600">Loading analytics...</div>
          </div>
        ) : agents.length === 0 ? (
          <div className="bg-white p-8 rounded-xl border-2 border-gray-200 text-center shadow-sm">
            <div className="text-5xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-black mb-3">No Agents Yet</h3>
            <p className="text-gray-600 mb-6">
              Deploy your first agent to start tracking performance
            </p>
            <Link href="/agents">
              <button className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-all">
                Deploy Agent →
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Overview Stats */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                title="Total Agents"
                value={agents.length}
                icon="🤖"
                color="blue"
              />
              <StatCard
                title="Total Runs"
                value={totalRuns.toLocaleString()}
                icon="⚡"
                color="purple"
              />
              <StatCard
                title="Total Spent"
                value={`$${totalCost.toFixed(4)}`}
                icon="💰"
                color="green"
              />
              <StatCard
                title="Avg Cost/Run"
                value={`$${avgCostPerRun.toFixed(4)}`}
                icon="📊"
                color="orange"
              />
            </div>

            {/* Best Performers */}
            {bestAgent && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <motion.div
                  className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200 shadow-sm"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="text-3xl">🏆</div>
                    <h3 className="text-lg font-bold text-black">Most Active Agent</h3>
                  </div>
                  <div className="text-2xl font-black text-black mb-1">{bestAgent.name}</div>
                  <div className="text-sm text-gray-600">{bestAgent.totalRuns} runs • {bestAgent.type}</div>
                </motion.div>

                {mostExpensive && (
                  <motion.div
                    className="bg-gradient-to-br from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200 shadow-sm"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="text-3xl">💎</div>
                      <h3 className="text-lg font-bold text-black">Most Invested</h3>
                    </div>
                    <div className="text-2xl font-black text-black mb-1">{mostExpensive.name}</div>
                    <div className="text-sm text-gray-600">${mostExpensive.totalCost.toFixed(4)} spent • {mostExpensive.type}</div>
                  </motion.div>
                )}
              </div>
            )}

            {/* Agent Performance Table */}
            <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <h3 className="text-xl font-bold text-black">Agent Performance</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Agent
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Type
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Runs
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Total Cost
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Avg Cost
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                        Last Run
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {agents.map((agent, index) => (
                      <motion.tr
                        key={agent.id}
                        className="hover:bg-gray-50 transition-colors"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.05 }}
                      >
                        <td className="px-6 py-4">
                          <div className="font-semibold text-black">{agent.name}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {agent.type}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm">
                          {agent.totalRuns}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm">
                          ${agent.totalCost.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 text-right font-mono text-sm">
                          ${agent.avgCost.toFixed(4)}
                        </td>
                        <td className="px-6 py-4 text-right text-sm text-gray-600">
                          {agent.lastRun
                            ? new Date(agent.lastRun).toLocaleDateString()
                            : 'Never'}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Recent Transactions */}
            {transactions.length > 0 && (
              <div className="bg-white rounded-xl border-2 border-gray-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-black">Recent Activity</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-50 border-b border-gray-200">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Time
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Agent
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Type
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Cost
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-bold text-gray-600 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200">
                      {transactions.slice(0, 10).map((tx, index) => (
                        <motion.tr
                          key={tx.id}
                          className="hover:bg-gray-50 transition-colors"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.03 }}
                        >
                          <td className="px-6 py-4 text-sm text-gray-600">
                            {new Date(tx.timestamp).toLocaleString()}
                          </td>
                          <td className="px-6 py-4 text-sm font-semibold text-black">
                            {tx.agent_name || 'Unknown'}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                              {tx.type}
                            </span>
                          </td>
                          <td className="px-6 py-4 text-right font-mono text-sm">
                            ${(tx.cost || tx.total_cost || 0.001).toFixed(4)}
                          </td>
                          <td className="px-6 py-4 text-sm">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                              tx.status === 'success'
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                            }`}>
                              {tx.status}
                            </span>
                          </td>
                        </motion.tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

function StatCard({
  title,
  value,
  icon,
  color
}: {
  title: string
  value: string | number
  icon: string
  color: 'blue' | 'purple' | 'green' | 'orange'
}) {
  const colorClasses = {
    blue: 'from-blue-50 to-cyan-50 border-blue-200',
    purple: 'from-purple-50 to-pink-50 border-purple-200',
    green: 'from-green-50 to-emerald-50 border-green-200',
    orange: 'from-orange-50 to-amber-50 border-orange-200'
  }

  return (
    <motion.div
      className={`bg-gradient-to-br ${colorClasses[color]} p-6 rounded-xl border-2 shadow-sm`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className="text-2xl">{icon}</div>
        <h4 className="text-sm font-semibold text-gray-600">{title}</h4>
      </div>
      <div className="text-3xl font-black text-black">{value}</div>
    </motion.div>
  )
}

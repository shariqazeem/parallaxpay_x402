'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { supabase, TransactionDB } from '@/lib/supabase'

interface Transaction {
  id: string
  timestamp: number
  type: 'inference' | 'agent' | 'marketplace' | 'composite'
  provider: string
  tokens: number
  cost: number
  txHash: string
  status: 'success' | 'pending' | 'failed'
  network: 'solana-devnet' | 'solana'
  agentName?: string
  steps?: number
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all')
  const [network, setNetwork] = useState<'all' | 'solana-devnet' | 'solana'>('all')

  // Load transactions from Supabase (PUBLIC FEED - all users' transactions)
  useEffect(() => {
    const loadTransactions = async () => {
      try {
        console.log('📥 Loading transactions from Supabase (public feed)...')

        // Fetch from Supabase - get ALL transactions from ALL users
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .order('timestamp', { ascending: false })

        if (error) {
          console.error('Supabase fetch error (transactions):', error)
          // Fallback to localStorage
          const stored = localStorage.getItem('parallaxpay_transactions')
          if (stored) {
            const parsed = JSON.parse(stored)
            const mapped = parsed.map((tx: any) => ({
              id: tx.id,
              timestamp: tx.timestamp,
              type: tx.type || 'agent',
              provider: tx.provider || 'Unknown',
              tokens: tx.tokens || 0,
              cost: tx.cost || tx.total_cost || 0,
              txHash: tx.txHash || tx.tx_hash || 'pending',
              status: tx.status || 'success',
              network: tx.network || 'solana-devnet',
              agentName: tx.agentName || tx.agent_name,
              steps: tx.steps,
            }))
            setTransactions(mapped)
            console.log(`📦 Loaded ${mapped.length} transactions from localStorage (Supabase unavailable)`)
          }
          return
        }

        if (data) {
          // Convert DB format to app format
          const txs: Transaction[] = data.map((db: TransactionDB) => ({
            id: db.id,
            timestamp: db.timestamp,
            type: (db.type as any) || 'agent',
            provider: db.provider || 'Unknown',
            tokens: db.tokens || 0,
            cost: db.cost || db.total_cost || 0,
            txHash: db.tx_hash || 'pending',
            status: (db.status as any) || 'success',
            network: (db.network as any) || 'solana-devnet',
            agentName: db.agent_name,
            steps: db.steps,
          }))

          setTransactions(txs)
          console.log(`✅ Loaded ${txs.length} transactions from Supabase (public feed)`)
        }
      } catch (error) {
        console.error('Failed to load transactions from Supabase:', error)
        // Fallback to localStorage
        try {
          const stored = localStorage.getItem('parallaxpay_transactions')
          if (stored) {
            const parsed = JSON.parse(stored)
            const mapped = parsed.map((tx: any) => ({
              id: tx.id,
              timestamp: tx.timestamp,
              type: tx.type || 'agent',
              provider: tx.provider || 'Unknown',
              tokens: tx.tokens || 0,
              cost: tx.cost || tx.total_cost || 0,
              txHash: tx.txHash || tx.tx_hash || 'pending',
              status: tx.status || 'success',
              network: tx.network || 'solana-devnet',
              agentName: tx.agentName || tx.agent_name,
              steps: tx.steps,
            }))
            setTransactions(mapped)
            console.log(`📦 Loaded ${mapped.length} transactions from localStorage (Supabase error)`)
          }
        } catch (localError) {
          console.error('Failed to load from localStorage:', localError)
        }
      }
    }

    loadTransactions()

    // Reload every 10 seconds for live updates
    const interval = setInterval(loadTransactions, 10000)
    return () => clearInterval(interval)
  }, [])

  // Filter transactions
  const filteredTransactions = transactions.filter(tx => {
    if (filter !== 'all' && tx.status !== filter) return false
    if (network !== 'all' && tx.network !== network) return false
    return true
  })

  // Calculate stats
  const stats = {
    total: transactions.length,
    successful: transactions.filter(tx => tx.status === 'success').length,
    pending: transactions.filter(tx => tx.status === 'pending').length,
    failed: transactions.filter(tx => tx.status === 'failed').length,
    totalSpent: transactions
      .filter(tx => tx.status === 'success')
      .reduce((sum, tx) => sum + tx.cost, 0),
    totalTokens: transactions
      .filter(tx => tx.status === 'success')
      .reduce((sum, tx) => sum + tx.tokens, 0),
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="border-b-2 border-purple-200 bg-white/95 backdrop-blur-xl sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <h1 className="text-2xl font-heading font-black cursor-pointer hover:opacity-80 transition-opacity">
                  <span className="text-purple-600">ParallaxPay</span>
                </h1>
              </Link>
              <div className="text-gray-400">/</div>
              <h2 className="text-xl font-heading font-bold text-black">
                Transaction History
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/marketplace">
                <button className="bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-md px-4 py-2 rounded-lg text-sm font-semibold transition-all text-purple-700 hover:text-purple-900">
                  💰 Marketplace
                </button>
              </Link>
              <Link href="/agents">
                <button className="bg-white border-2 border-blue-200 hover:border-blue-400 hover:shadow-md px-4 py-2 rounded-lg text-sm font-semibold transition-all text-blue-700 hover:text-blue-900">
                  🤖 Agents
                </button>
              </Link>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
            <StatCard label="Total" value={stats.total} icon="📊" />
            <StatCard label="Successful" value={stats.successful} icon="✅" color="success" />
            <StatCard label="Pending" value={stats.pending} icon="⏳" color="warning" />
            <StatCard label="Failed" value={stats.failed} icon="❌" color="error" />
            <StatCard label="Total Spent" value={`$${stats.totalSpent.toFixed(4)}`} icon="💰" color="success" />
            <StatCard label="Total Tokens" value={stats.totalTokens.toLocaleString()} icon="🔢" />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Filters */}
        <div className="bg-gradient-to-br from-purple-50 to-blue-50 p-6 rounded-xl border-2 border-purple-200 mb-6 shadow-lg">
          <div className="flex flex-wrap items-center gap-6">
            <div>
              <label className="text-sm text-purple-700 mb-2 block font-semibold">Status</label>
              <div className="flex gap-2">
                {['all', 'success', 'pending', 'failed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
                      filter === f
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:text-black hover:bg-gray-50 border-2 border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-purple-700 mb-2 block font-semibold">Network</label>
              <div className="flex gap-2">
                {['all', 'solana-devnet', 'solana'].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNetwork(n as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-sm ${
                      network === n
                        ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                        : 'bg-white text-gray-700 hover:text-black hover:bg-gray-50 border-2 border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    {n === 'all' ? 'All' : n === 'solana-devnet' ? 'Devnet' : 'Mainnet'}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Transactions Table */}
        {filteredTransactions.length === 0 ? (
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-12 rounded-xl border-2 border-purple-200 text-center shadow-lg">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-heading font-bold text-black mb-2">
              No Transactions Yet
            </h3>
            <p className="text-gray-700 mb-6 font-medium">
              Make your first paid inference request to see transactions here
            </p>
            <Link href="/inference">
              <button className="bg-gradient-to-r from-purple-500 to-blue-500 text-white px-6 py-3 rounded-lg font-heading font-bold hover:from-purple-600 hover:to-blue-600 hover:shadow-lg transition-all">
                ✨ Start Inference
              </button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredTransactions.map((tx, index) => (
              <TransactionCard key={tx.id} transaction={tx} index={index} />
            ))}
          </div>
        )}
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
  color?: 'default' | 'success' | 'warning' | 'error'
}) {
  const getColorScheme = () => {
    if (color === 'success') return {
      bg: 'bg-gradient-to-br from-green-50 to-emerald-50',
      border: 'border-green-300',
      text: 'text-green-700',
      value: 'text-green-600'
    }
    if (color === 'warning') return {
      bg: 'bg-gradient-to-br from-orange-50 to-amber-50',
      border: 'border-orange-300',
      text: 'text-orange-700',
      value: 'text-orange-600'
    }
    if (color === 'error') return {
      bg: 'bg-gradient-to-br from-red-50 to-rose-50',
      border: 'border-red-300',
      text: 'text-red-700',
      value: 'text-red-600'
    }
    return {
      bg: 'bg-gradient-to-br from-purple-50 to-blue-50',
      border: 'border-purple-300',
      text: 'text-purple-700',
      value: 'text-black'
    }
  }

  const colors = getColorScheme()

  return (
    <motion.div
      className={`${colors.bg} p-3 rounded-lg border-2 ${colors.border} hover:shadow-lg transition-all shadow-md`}
      whileHover={{ scale: 1.05, y: -2 }}
    >
      <div className="flex items-start justify-between mb-1">
        <span className={`text-xs font-bold uppercase tracking-wider ${colors.text}`}>{label}</span>
        <span className="text-lg">{icon}</span>
      </div>
      <div className={`text-xl font-black ${colors.value}`}>
        {value}
      </div>
    </motion.div>
  )
}

function TransactionCard({
  transaction,
  index,
}: {
  transaction: Transaction
  index: number
}) {
  const getExplorerUrl = (txHash: string, network: string) => {
    const cluster = network === 'solana-devnet' ? '?cluster=devnet' : ''
    return `https://explorer.solana.com/tx/${txHash}${cluster}`
  }

  const statusColors = {
    success: 'text-status-success bg-status-success/20 border-status-success/30',
    pending: 'text-status-warning bg-status-warning/20 border-status-warning/30',
    failed: 'text-status-error bg-status-error/20 border-status-error/30',
  }

  const statusIcons = {
    success: '✅',
    pending: '⏳',
    failed: '❌',
  }

  return (
    <motion.div
      className="bg-white rounded-xl border-2 border-purple-200 p-6 hover:border-purple-400 hover:shadow-lg transition-all shadow-md"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      whileHover={{ scale: 1.01 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="text-4xl">{statusIcons[transaction.status]}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-heading font-bold text-black">
                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction
              </h3>
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold border-2 shadow-sm ${
                  statusColors[transaction.status]
                }`}
              >
                {transaction.status.toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-gray-700 font-medium">
              {new Date(transaction.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="text-right bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border-2 border-green-200">
          <div className="text-2xl font-black text-green-600">
            ${transaction.cost.toFixed(4)}
          </div>
          <div className="text-xs text-green-700 font-semibold">
            {transaction.tokens.toLocaleString()} tokens
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border-2 border-blue-200">
          <div className="text-xs text-blue-700 mb-1 font-semibold">Provider</div>
          <div className="text-sm font-bold text-black">{transaction.provider}</div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border-2 border-purple-200">
          <div className="text-xs text-purple-700 mb-1 font-semibold">Network</div>
          <div className="text-sm font-bold text-black">
            {transaction.network === 'solana-devnet' ? 'Devnet' : 'Mainnet'}
          </div>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-amber-50 p-3 rounded-lg border-2 border-orange-200">
          <div className="text-xs text-orange-700 mb-1 font-semibold">Cost per 1K</div>
          <div className="text-sm font-bold text-black">
            ${((transaction.cost / transaction.tokens) * 1000).toFixed(4)}
          </div>
        </div>
        <div className="bg-gradient-to-br from-gray-50 to-slate-50 p-3 rounded-lg border-2 border-gray-200">
          <div className="text-xs text-gray-700 mb-1 font-semibold">Transaction ID</div>
          <div className="text-sm font-mono text-gray-700 font-bold">
            {transaction.id.substring(0, 16)}...
          </div>
        </div>
      </div>

      {/* Transaction Hash */}
      <div className="bg-gradient-to-br from-cyan-50 to-blue-50 p-4 rounded-lg border-2 border-cyan-200 hover:border-cyan-400 hover:shadow-md transition-all">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs text-cyan-700 mb-1 font-semibold">Solana Transaction Hash</div>
            <div className="text-sm font-mono text-blue-600 break-all font-bold">
              {transaction.txHash}
            </div>
          </div>
          <a
            href={getExplorerUrl(transaction.txHash, transaction.network)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white px-4 py-2 rounded-lg text-sm font-bold hover:from-purple-600 hover:to-blue-600 hover:shadow-lg transition-all whitespace-nowrap"
          >
            View on Explorer →
          </a>
        </div>
      </div>
    </motion.div>
  )
}

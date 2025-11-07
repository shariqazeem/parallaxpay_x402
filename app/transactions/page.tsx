'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'

interface Transaction {
  id: string
  timestamp: number
  type: 'inference' | 'agent' | 'marketplace'
  provider: string
  tokens: number
  cost: number
  txHash: string
  status: 'success' | 'pending' | 'failed'
  network: 'solana-devnet' | 'solana'
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [filter, setFilter] = useState<'all' | 'success' | 'pending' | 'failed'>('all')
  const [network, setNetwork] = useState<'all' | 'solana-devnet' | 'solana'>('all')

  // Load transactions from localStorage
  useEffect(() => {
    const loadTransactions = () => {
      try {
        const stored = localStorage.getItem('parallaxpay_transactions')
        if (stored) {
          const parsed = JSON.parse(stored)
          setTransactions(parsed)
        }
      } catch (error) {
        console.error('Failed to load transactions:', error)
      }
    }

    loadTransactions()

    // Reload every 5 seconds
    const interval = setInterval(loadTransactions, 5000)
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
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <div className="border-b border-border bg-background-secondary/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <Link href="/">
                <h1 className="text-2xl font-heading font-black cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-gradient">ParallaxPay</span>
                </h1>
              </Link>
              <div className="text-text-muted">/</div>
              <h2 className="text-xl font-heading font-bold text-white">
                Transaction History
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Link href="/marketplace">
                <button className="glass-hover px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all">
                  Marketplace
                </button>
              </Link>
              <Link href="/agents">
                <button className="glass-hover px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all">
                  Agents
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
        <div className="glass p-6 rounded-xl border border-border mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="text-sm text-text-secondary mb-2 block">Status</label>
              <div className="flex gap-2">
                {['all', 'success', 'pending', 'failed'].map((f) => (
                  <button
                    key={f}
                    onClick={() => setFilter(f as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      filter === f
                        ? 'glass-hover neon-border text-gradient'
                        : 'glass text-text-secondary hover:text-white'
                    }`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm text-text-secondary mb-2 block">Network</label>
              <div className="flex gap-2">
                {['all', 'solana-devnet', 'solana'].map((n) => (
                  <button
                    key={n}
                    onClick={() => setNetwork(n as any)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                      network === n
                        ? 'glass-hover neon-border text-gradient'
                        : 'glass text-text-secondary hover:text-white'
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
          <div className="glass p-12 rounded-xl border border-border text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-heading font-bold text-white mb-2">
              No Transactions Yet
            </h3>
            <p className="text-text-secondary mb-6">
              Make your first paid inference request to see transactions here
            </p>
            <Link href="/inference">
              <button className="glass-hover neon-border px-6 py-3 rounded-lg font-heading font-bold hover:scale-105 transition-all">
                <span className="text-gradient">Start Inference</span>
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
            : color === 'warning'
            ? 'text-status-warning'
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
      className="glass rounded-xl border border-border p-6 hover:border-accent-primary/50 transition-all"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="text-4xl">{statusIcons[transaction.status]}</div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-lg font-heading font-bold text-white">
                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)} Transaction
              </h3>
              <span
                className={`px-2 py-1 rounded text-xs font-bold border ${
                  statusColors[transaction.status]
                }`}
              >
                {transaction.status.toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-text-secondary">
              {new Date(transaction.timestamp).toLocaleString()}
            </div>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold text-status-success">
            ${transaction.cost.toFixed(4)}
          </div>
          <div className="text-xs text-text-secondary">
            {transaction.tokens} tokens
          </div>
        </div>
      </div>

      {/* Details Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
        <div>
          <div className="text-xs text-text-secondary mb-1">Provider</div>
          <div className="text-sm font-medium text-white">{transaction.provider}</div>
        </div>
        <div>
          <div className="text-xs text-text-secondary mb-1">Network</div>
          <div className="text-sm font-medium text-white">
            {transaction.network === 'solana-devnet' ? 'Solana Devnet' : 'Solana Mainnet'}
          </div>
        </div>
        <div>
          <div className="text-xs text-text-secondary mb-1">Cost per 1K</div>
          <div className="text-sm font-medium text-white">
            ${((transaction.cost / transaction.tokens) * 1000).toFixed(4)}
          </div>
        </div>
        <div>
          <div className="text-xs text-text-secondary mb-1">Transaction ID</div>
          <div className="text-sm font-mono text-text-muted">
            {transaction.id.substring(0, 16)}...
          </div>
        </div>
      </div>

      {/* Transaction Hash */}
      <div className="glass-hover p-4 rounded-lg border border-border-hover">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="text-xs text-text-secondary mb-1">Solana Transaction Hash</div>
            <div className="text-sm font-mono text-accent-secondary break-all">
              {transaction.txHash}
            </div>
          </div>
          <a
            href={getExplorerUrl(transaction.txHash, transaction.network)}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 glass-hover neon-border px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all whitespace-nowrap"
          >
            <span className="text-gradient">View on Explorer →</span>
          </a>
        </div>
      </div>
    </motion.div>
  )
}

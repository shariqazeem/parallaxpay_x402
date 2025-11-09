'use client'

/**
 * Live Trade Feed Component
 *
 * Real-time scrolling feed of agent trades with animations
 * Shows: Agent → Action → Provider → Cost → Profit → Tx Hash
 */

import { motion, AnimatePresence } from 'framer-motion'

export interface Trade {
  id: string
  agentName: string
  action: 'buy' | 'sell' | 'switch'
  fromProvider?: string
  toProvider: string
  cost: number
  profit: number
  timestamp: number
  txHash: string
  status: 'success' | 'pending' | 'failed'
}

interface LiveTradeFeedProps {
  trades: Trade[]
  maxItems?: number
}

export default function LiveTradeFeed({ trades, maxItems = 15 }: LiveTradeFeedProps) {
  const displayTrades = trades.slice(0, maxItems)

  return (
    <div className="glass rounded-xl p-6 border border-border">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-heading font-bold flex items-center gap-2">
          <span className="text-2xl">📊</span>
          Live Trade Feed
          {trades.length > 0 && (
            <span className="text-xs px-2 py-1 rounded bg-status-success/20 text-status-success animate-pulse">
              LIVE
            </span>
          )}
        </h3>
        <div className="text-sm text-text-muted">
          {trades.length} trades
        </div>
      </div>

      <div className="space-y-2 max-h-[600px] overflow-y-auto pr-2">
        <AnimatePresence mode="popLayout">
          {displayTrades.map((trade, idx) => (
            <motion.div
              key={trade.id}
              className={`p-4 rounded-lg border ${
                trade.profit > 0
                  ? 'bg-status-success/5 border-status-success/30'
                  : trade.profit < 0
                  ? 'bg-status-error/5 border-status-error/30'
                  : 'bg-background-secondary border-border'
              } relative overflow-hidden`}
              initial={{ opacity: 0, x: -20, scale: 0.95 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: 20, scale: 0.95 }}
              transition={{ delay: idx * 0.05 }}
            >
              {/* Success flash animation */}
              {trade.status === 'success' && idx === 0 && (
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-transparent via-accent-primary/20 to-transparent"
                  initial={{ x: '-100%' }}
                  animate={{ x: '200%' }}
                  transition={{ duration: 1, ease: 'easeOut' }}
                />
              )}

              <div className="relative z-10 grid grid-cols-12 gap-3 items-center">
                {/* Timestamp */}
                <div className="col-span-2 text-xs text-text-muted">
                  {new Date(trade.timestamp).toLocaleTimeString()}
                </div>

                {/* Agent Name */}
                <div className="col-span-3 flex items-center gap-2">
                  <div className="text-sm font-heading font-bold text-white truncate">
                    {trade.agentName}
                  </div>
                </div>

                {/* Action */}
                <div className="col-span-2">
                  <div className={`text-xs px-2 py-1 rounded text-center ${
                    trade.action === 'buy' ? 'bg-status-success/20 text-status-success' :
                    trade.action === 'sell' ? 'bg-status-error/20 text-status-error' :
                    'bg-accent-primary/20 text-accent-primary'
                  }`}>
                    {trade.action === 'switch' ? '→' : trade.action.toUpperCase()}
                  </div>
                </div>

                {/* Provider */}
                <div className="col-span-2 text-xs text-text-secondary truncate">
                  {trade.toProvider}
                </div>

                {/* Cost */}
                <div className="col-span-1 text-xs text-text-muted">
                  ${trade.cost.toFixed(4)}
                </div>

                {/* Profit */}
                <div className={`col-span-1 text-xs font-bold ${
                  trade.profit > 0 ? 'text-status-success' :
                  trade.profit < 0 ? 'text-status-error' :
                  'text-text-muted'
                }`}>
                  {trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(3)}
                </div>

                {/* Tx Hash */}
                <div className="col-span-1">
                  <a
                    href={`https://explorer.solana.com/tx/${trade.txHash}?cluster=devnet`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-accent-primary hover:text-accent-secondary transition-colors"
                  >
                    🔗
                  </a>
                </div>
              </div>

              {/* Status indicator */}
              {trade.status === 'pending' && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-accent-primary animate-pulse" />
              )}
              {trade.status === 'failed' && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-status-error" />
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {trades.length === 0 && (
          <div className="text-center py-12 text-text-muted">
            <div className="text-4xl mb-4">📊</div>
            <div className="text-lg">No trades yet</div>
            <div className="text-sm">Trades will appear here in real-time</div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div className="mt-4 pt-4 border-t border-border flex items-center gap-4 text-xs text-text-muted">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-status-success" />
          <span>Profit</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-status-error" />
          <span>Loss</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-accent-primary" />
          <span>Switch</span>
        </div>
        <div className="flex-1" />
        <div>All transactions verified on Solana devnet</div>
      </div>
    </div>
  )
}

/**
 * Trade Ticker - Horizontal scrolling version
 */
export function TradeTicker({ trades }: { trades: Trade[] }) {
  const recentTrades = trades.slice(0, 10)

  return (
    <div className="glass rounded-lg border border-border overflow-hidden">
      <div className="px-4 py-2 bg-background-secondary border-b border-border flex items-center gap-2">
        <div className="text-xs font-heading font-bold text-white">LIVE TRADES</div>
        <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
      </div>

      <div className="overflow-hidden">
        <motion.div
          className="flex gap-4 py-3 px-4"
          animate={{ x: [0, -1000] }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: 'linear',
          }}
        >
          {[...recentTrades, ...recentTrades].map((trade, idx) => (
            <div
              key={`${trade.id}-${idx}`}
              className="flex items-center gap-3 text-xs whitespace-nowrap"
            >
              <span className="font-heading font-bold text-white">{trade.agentName}</span>
              <span className="text-text-muted">→</span>
              <span className="text-accent-primary">{trade.toProvider}</span>
              <span className={trade.profit > 0 ? 'text-status-success' : 'text-status-error'}>
                {trade.profit > 0 ? '+' : ''}{trade.profit.toFixed(3)}
              </span>
              <span className="text-text-muted">|</span>
            </div>
          ))}
        </motion.div>
      </div>
    </div>
  )
}

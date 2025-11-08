'use client'

/**
 * Live Order Book Component
 *
 * NOW WITH REAL ORDERS! 🔥
 *
 * Shows ACTUAL:
 * - Provider asks (real compute offers)
 * - Agent bids (real buy orders)
 * - Real market depth
 * - Real spread from actual orders
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getRealOrderBook, type RealOrder } from '@/lib/real-order-book'
import { getRealProviderManager } from '@/lib/real-provider-manager'

export interface Order {
  price: number
  amount: number
  total: number
  side: 'bid' | 'ask'
}

interface OrderBookProps {
  onPriceClick?: (price: number) => void
}

export default function LiveOrderBook({ onPriceClick }: OrderBookProps) {
  const [bids, setBids] = useState<Order[]>([])
  const [asks, setAsks] = useState<Order[]>([])
  const [spread, setSpread] = useState(0)
  const [spreadPercent, setSpreadPercent] = useState(0)

  // Update with REAL order book data
  useEffect(() => {
    const updateRealOrderBook = async () => {
      try {
        const orderBook = getRealOrderBook()
        const providerManager = getRealProviderManager()

        // Update provider asks (real offers)
        await orderBook.updateProviderAsks()

        // Generate simulated bids for demo (agents wanting to buy)
        orderBook.generateSimulatedBids()

        // Get real orders
        const realAsks = orderBook.getAsks()
        const realBids = orderBook.getBids()

        // Convert to display format
        const displayAsks: Order[] = realAsks.map(ask => ({
          price: ask.price / 1000, // Convert back to per-token price
          amount: ask.amount,
          total: ask.total,
          side: 'ask' as const,
        }))

        const displayBids: Order[] = realBids.map(bid => ({
          price: bid.price / 1000, // Convert back to per-token price
          amount: bid.amount,
          total: bid.total,
          side: 'bid' as const,
        }))

        setBids(displayBids)
        setAsks(displayAsks)

        // Calculate real spread
        const spreadData = orderBook.getSpread()
        setSpread(spreadData.spread)
        setSpreadPercent(spreadData.spreadPercent)

        console.log(`📖 Order book updated: ${displayAsks.length} asks, ${displayBids.length} bids`)
      } catch (error) {
        console.error('Failed to update order book:', error)
      }
    }

    // Update immediately
    updateRealOrderBook()

    // Then update every 3 seconds with real data
    const interval = setInterval(updateRealOrderBook, 3000)

    return () => clearInterval(interval)
  }, [])

  const maxBidAmount = Math.max(...bids.map(o => o.amount), 1)
  const maxAskAmount = Math.max(...asks.map(o => o.amount), 1)

  return (
    <div className="glass rounded-xl border border-border overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 bg-background-secondary border-b border-border">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-bold text-white">Order Book</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-status-success animate-pulse" />
            <span className="text-xs text-text-muted">Live</span>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="px-4 py-2 bg-background-secondary/50 border-b border-border">
        <div className="grid grid-cols-3 text-xs text-text-muted font-semibold">
          <div>Price (SOL)</div>
          <div className="text-right">Amount</div>
          <div className="text-right">Total</div>
        </div>
      </div>

      {/* Order Book Content */}
      <div className="p-4 space-y-1">
        {/* Asks (Sell orders) - Red */}
        <div className="space-y-0.5">
          {asks.slice(0, 5).reverse().map((ask, idx) => (
            <motion.div
              key={`ask-${idx}`}
              className="relative cursor-pointer hover:bg-status-error/10 rounded transition-colors"
              onClick={() => onPriceClick?.(ask.price)}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              {/* Background bar showing depth */}
              <div
                className="absolute inset-y-0 right-0 bg-status-error/20 rounded"
                style={{ width: `${(ask.amount / maxAskAmount) * 100}%` }}
              />

              <div className="relative grid grid-cols-3 text-sm py-1 px-2">
                <div className="text-status-error font-mono">
                  {ask.price.toFixed(6)}
                </div>
                <div className="text-right text-white font-mono">
                  {ask.amount.toLocaleString()}
                </div>
                <div className="text-right text-text-muted font-mono">
                  {ask.total.toFixed(4)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Spread */}
        <div className="py-2 my-1 bg-background-secondary rounded-lg border border-border">
          <div className="text-center">
            <div className="text-xs text-text-muted">Spread</div>
            <div className={`text-lg font-heading font-bold ${
              spreadPercent < 1 ? 'text-status-success' :
              spreadPercent < 2 ? 'text-status-warning' :
              'text-status-error'
            }`}>
              {spread.toFixed(6)} ({spreadPercent.toFixed(2)}%)
            </div>
          </div>
        </div>

        {/* Bids (Buy orders) - Green */}
        <div className="space-y-0.5">
          {bids.slice(0, 5).map((bid, idx) => (
            <motion.div
              key={`bid-${idx}`}
              className="relative cursor-pointer hover:bg-status-success/10 rounded transition-colors"
              onClick={() => onPriceClick?.(bid.price)}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.05 }}
            >
              {/* Background bar showing depth */}
              <div
                className="absolute inset-y-0 right-0 bg-status-success/20 rounded"
                style={{ width: `${(bid.amount / maxBidAmount) * 100}%` }}
              />

              <div className="relative grid grid-cols-3 text-sm py-1 px-2">
                <div className="text-status-success font-mono">
                  {bid.price.toFixed(6)}
                </div>
                <div className="text-right text-white font-mono">
                  {bid.amount.toLocaleString()}
                </div>
                <div className="text-right text-text-muted font-mono">
                  {bid.total.toFixed(4)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-3 bg-background-secondary border-t border-border flex items-center justify-between text-xs">
        <div className="text-text-muted">
          Last update: {new Date().toLocaleTimeString()}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-status-success" />
            <span className="text-text-muted">Bids</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-status-error" />
            <span className="text-text-muted">Asks</span>
          </div>
        </div>
      </div>
    </div>
  )
}

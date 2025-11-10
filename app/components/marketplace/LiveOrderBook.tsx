'use client'

/**
 * Live Order Book Component
 *
 * NOW WITH ENHANCED REAL ORDERS! 🔥
 *
 * Shows ACTUAL:
 * - Provider asks (real compute offers)
 * - User limit orders (buy & sell)
 * - Real market depth
 * - Real spread from actual orders
 * - Real-time updates via events
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getEnhancedOrderBook, type UserOrder } from '@/lib/enhanced-order-book'

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

  // Update with ENHANCED order book data
  useEffect(() => {
    const updateOrderBook = () => {
      try {
        const orderBook = getEnhancedOrderBook()

        // Get depth (top 10 levels)
        const depth = orderBook.getDepth(10)

        // Convert to display format
        const displayAsks: Order[] = depth.asks.map(ask => ({
          price: ask.price / 1000, // Convert back to per-token price
          amount: ask.remainingAmount, // Show remaining amount
          total: (ask.price * ask.remainingAmount) / 1000,
          side: 'ask' as const,
        }))

        const displayBids: Order[] = depth.bids.map(bid => ({
          price: bid.price / 1000,
          amount: bid.remainingAmount,
          total: (bid.price * bid.remainingAmount) / 1000,
          side: 'bid' as const,
        }))

        setBids(displayBids)
        setAsks(displayAsks)

        // Calculate real spread
        const spreadData = orderBook.getSpread()
        setSpread(spreadData.spread)
        setSpreadPercent(spreadData.spreadPercent)
      } catch (error) {
        console.error('Failed to update order book:', error)
      }
    }

    // Initial update
    updateOrderBook()

    // Listen for order book events
    const orderBook = getEnhancedOrderBook()
    orderBook.on('orderBookUpdated', updateOrderBook)
    orderBook.on('orderPlaced', updateOrderBook)
    orderBook.on('orderCancelled', updateOrderBook)
    orderBook.on('tradeExecuted', updateOrderBook)

    // Also update every 2 seconds
    const interval = setInterval(updateOrderBook, 2000)

    return () => {
      orderBook.off('orderBookUpdated', updateOrderBook)
      orderBook.off('orderPlaced', updateOrderBook)
      orderBook.off('orderCancelled', updateOrderBook)
      orderBook.off('tradeExecuted', updateOrderBook)
      clearInterval(interval)
    }
  }, [])

  const maxBidAmount = Math.max(...bids.map(o => o.amount), 1)
  const maxAskAmount = Math.max(...asks.map(o => o.amount), 1)

  return (
    <div className="bg-white border-2 border-green-200 rounded-xl overflow-hidden shadow-lg">
      {/* Header */}
      <div className="px-4 py-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b-2 border-green-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-heading font-bold text-black">📊 Order Book</h3>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs text-green-600 font-semibold">Live</span>
          </div>
        </div>
      </div>

      {/* Column Headers */}
      <div className="px-4 py-2 bg-gray-50 border-b-2 border-gray-200">
        <div className="grid grid-cols-3 text-xs text-gray-700 font-bold">
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
                className="absolute inset-y-0 right-0 bg-red-100 rounded"
                style={{ width: `${(ask.amount / maxAskAmount) * 100}%` }}
              />

              <div className="relative grid grid-cols-3 text-sm py-1 px-2">
                <div className="text-red-600 font-mono font-bold">
                  {ask.price.toFixed(6)}
                </div>
                <div className="text-right text-black font-mono font-semibold">
                  {ask.amount.toLocaleString()}
                </div>
                <div className="text-right text-gray-600 font-mono">
                  {ask.total.toFixed(4)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Spread */}
        <div className="py-2 my-1 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg border-2 border-blue-200">
          <div className="text-center">
            <div className="text-xs text-blue-600 font-semibold">Spread</div>
            <div className={`text-lg font-heading font-bold ${
              spreadPercent < 1 ? 'text-green-600' :
              spreadPercent < 2 ? 'text-orange-600' :
              'text-red-600'
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
                className="absolute inset-y-0 right-0 bg-green-100 rounded"
                style={{ width: `${(bid.amount / maxBidAmount) * 100}%` }}
              />

              <div className="relative grid grid-cols-3 text-sm py-1 px-2">
                <div className="text-green-600 font-mono font-bold">
                  {bid.price.toFixed(6)}
                </div>
                <div className="text-right text-black font-mono font-semibold">
                  {bid.amount.toLocaleString()}
                </div>
                <div className="text-right text-gray-600 font-mono">
                  {bid.total.toFixed(4)}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Footer Stats */}
      <div className="px-4 py-3 bg-gray-50 border-t-2 border-gray-200 flex items-center justify-between text-xs">
        <div className="text-gray-600 font-medium">
          Last update: {new Date().toLocaleTimeString()}
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-gray-700 font-medium">Bids</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-2 h-2 rounded-full bg-red-500" />
            <span className="text-gray-700 font-medium">Asks</span>
          </div>
        </div>
      </div>
    </div>
  )
}

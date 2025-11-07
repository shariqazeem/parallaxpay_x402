'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface Order {
  price: number
  size: number
  total: number
  provider: string
}

export default function OrderBook({ model }: { model: string }) {
  const [asks, setAsks] = useState<Order[]>([])
  const [bids, setBids] = useState<Order[]>([])
  const [spread, setSpread] = useState(0)
  const [spreadPercent, setSpreadPercent] = useState(0)

  // Initialize order book with realistic data
  useEffect(() => {
    const basePrice = 0.0012

    const generateOrders = (type: 'ask' | 'bid', count: number) => {
      return Array.from({ length: count }, (_, i) => {
        const priceOffset = (i + 1) * 0.00001
        const price =
          type === 'ask'
            ? basePrice + priceOffset
            : basePrice - priceOffset
        const size = Math.floor(Math.random() * 5000) + 1000

        return {
          price,
          size,
          total: price * size,
          provider: `Node-${Math.floor(Math.random() * 100)}`,
        }
      })
    }

    const newAsks = generateOrders('ask', 12)
    const newBids = generateOrders('bid', 12)

    setAsks(newAsks)
    setBids(newBids)

    const newSpread = newAsks[0].price - newBids[0].price
    setSpread(newSpread)
    setSpreadPercent((newSpread / newAsks[0].price) * 100)
  }, [model])

  // Simulate live order book updates
  useEffect(() => {
    const interval = setInterval(() => {
      setAsks((prev) =>
        prev.map((order) => ({
          ...order,
          price: order.price + (Math.random() - 0.5) * 0.000001,
          size: order.size + Math.floor((Math.random() - 0.5) * 100),
        }))
      )
      setBids((prev) =>
        prev.map((order) => ({
          ...order,
          price: order.price + (Math.random() - 0.5) * 0.000001,
          size: order.size + Math.floor((Math.random() - 0.5) * 100),
        }))
      )
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const maxAskSize = Math.max(...asks.map((o) => o.size))
  const maxBidSize = Math.max(...bids.map((o) => o.size))

  return (
    <motion.div
      className="glass rounded-xl border border-border overflow-hidden"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-heading font-bold text-white">
            Order Book
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 bg-status-success rounded-full animate-pulse" />
            <span className="text-xs text-status-success font-semibold">
              LIVE
            </span>
          </div>
        </div>

        <div className="text-xs text-text-secondary">
          Model: <span className="text-white font-mono">{model}</span>
        </div>
      </div>

      {/* Column Headers */}
      <div className="px-4 py-2 bg-background-tertiary/50 grid grid-cols-3 gap-2 text-xs text-text-secondary font-semibold">
        <div className="text-left">Price ($/1K)</div>
        <div className="text-right">Size (req)</div>
        <div className="text-right">Total ($)</div>
      </div>

      <div className="p-4 space-y-4">
        {/* Asks (Sell Orders) */}
        <div className="space-y-1">
          {asks.slice(0, 8).reverse().map((order, i) => (
            <OrderRow
              key={`ask-${i}`}
              order={order}
              type="ask"
              maxSize={maxAskSize}
            />
          ))}
        </div>

        {/* Spread */}
        <div className="glass-hover p-3 rounded-lg border border-accent-primary/30">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-xs text-text-secondary mb-1">Spread</div>
              <div className="text-lg font-black text-accent-primary">
                ${spread.toFixed(6)}
              </div>
            </div>
            <div className="text-right">
              <div className="text-xs text-text-secondary mb-1">%</div>
              <div className="text-lg font-bold text-accent-secondary">
                {spreadPercent.toFixed(3)}%
              </div>
            </div>
          </div>
        </div>

        {/* Bids (Buy Orders) */}
        <div className="space-y-1">
          {bids.slice(0, 8).map((order, i) => (
            <OrderRow
              key={`bid-${i}`}
              order={order}
              type="bid"
              maxSize={maxBidSize}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

interface OrderRowProps {
  order: Order
  type: 'ask' | 'bid'
  maxSize: number
}

function OrderRow({ order, type, maxSize }: OrderRowProps) {
  const fillPercent = (order.size / maxSize) * 100

  return (
    <motion.div
      className="relative grid grid-cols-3 gap-2 text-sm py-1 px-2 rounded hover:bg-background-tertiary/30 transition-colors cursor-pointer"
      whileHover={{ scale: 1.02 }}
    >
      {/* Background fill indicator */}
      <div
        className={`absolute inset-0 rounded ${
          type === 'ask' ? 'bg-status-error/10' : 'bg-status-success/10'
        }`}
        style={{ width: `${fillPercent}%` }}
      />

      {/* Order data */}
      <div className="relative z-10">
        <span
          className={`font-mono font-semibold ${
            type === 'ask' ? 'text-status-error' : 'text-status-success'
          }`}
        >
          {order.price.toFixed(6)}
        </span>
      </div>
      <div className="relative z-10 text-right">
        <span className="font-mono text-text-secondary">
          {order.size.toLocaleString()}
        </span>
      </div>
      <div className="relative z-10 text-right">
        <span className="font-mono text-white">{order.total.toFixed(2)}</span>
      </div>
    </motion.div>
  )
}

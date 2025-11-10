'use client'

/**
 * USER POSITION PANEL - BEAST MODE 🔥
 *
 * Features:
 * - Show open orders with cancel button
 * - Show filled orders
 * - Display P&L (Profit/Loss)
 * - Track trading volume
 * - Real-time updates
 */

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getEnhancedOrderBook, type UserPosition, type UserOrder } from '@/lib/enhanced-order-book'
import { useWallet } from '@solana/wallet-adapter-react'

export default function UserPositionPanel() {
  const { publicKey } = useWallet()
  const [position, setPosition] = useState<UserPosition | null>(null)
  const [activeTab, setActiveTab] = useState<'open' | 'filled'>('open')

  // Update position
  useEffect(() => {
    if (!publicKey) {
      setPosition(null)
      return
    }

    const updatePosition = () => {
      try {
        const orderBook = getEnhancedOrderBook()
        const userId = publicKey.toBase58()
        const userPosition = orderBook.getUserPosition(userId)
        setPosition(userPosition)
      } catch (err) {
        console.error('Failed to get user position:', err)
      }
    }

    updatePosition()

    // Listen for order book updates
    const orderBook = getEnhancedOrderBook()
    orderBook.on('orderBookUpdated', updatePosition)
    orderBook.on('orderPlaced', updatePosition)
    orderBook.on('orderCancelled', updatePosition)
    orderBook.on('tradeExecuted', updatePosition)

    // Also update every 2 seconds
    const interval = setInterval(updatePosition, 2000)

    return () => {
      orderBook.off('orderBookUpdated', updatePosition)
      orderBook.off('orderPlaced', updatePosition)
      orderBook.off('orderCancelled', updatePosition)
      orderBook.off('tradeExecuted', updatePosition)
      clearInterval(interval)
    }
  }, [publicKey])

  const handleCancelOrder = (orderId: string) => {
    if (!publicKey) return

    try {
      const orderBook = getEnhancedOrderBook()
      const userId = publicKey.toBase58()
      const cancelled = orderBook.cancelOrder(orderId, userId)

      if (cancelled) {
        console.log('Order cancelled:', orderId)
      }
    } catch (err) {
      console.error('Failed to cancel order:', err)
    }
  }

  if (!publicKey) {
    return (
      <motion.div
        className="bg-white p-6 rounded-xl border-2 border-orange-200 shadow-lg"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h3 className="text-xl font-heading font-bold mb-4 text-black">
          📊 Your Position
        </h3>
        <div className="text-center py-8">
          <div className="text-4xl mb-3">👤</div>
          <p className="text-gray-700 text-sm font-medium">
            Connect wallet to view your position
          </p>
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className="bg-white p-6 rounded-xl border-2 border-orange-200 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-xl font-heading font-bold text-black mb-1">
          📊 Your Position
        </h3>
        <p className="text-xs text-gray-600">
          Track your orders and trading performance
        </p>
      </div>

      {/* Stats Grid */}
      {position && (
        <div className="grid grid-cols-2 gap-3 mb-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 p-3 rounded-lg border-2 border-blue-200">
            <div className="text-xs text-blue-700 mb-1 font-semibold">Total Volume</div>
            <div className="text-lg font-heading font-bold text-black">
              {position.totalVolume.toLocaleString()}
            </div>
            <div className="text-xs text-gray-600">tokens</div>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-3 rounded-lg border-2 border-purple-200">
            <div className="text-xs text-purple-700 mb-1 font-semibold">Trades</div>
            <div className="text-lg font-heading font-bold text-black">
              {position.tradesCount}
            </div>
            <div className="text-xs text-gray-600">executions</div>
          </div>

          <div className="bg-gradient-to-br from-red-50 to-rose-50 p-3 rounded-lg border-2 border-red-200">
            <div className="text-xs text-red-700 mb-1 font-semibold">Total Spent</div>
            <div className="text-sm font-mono text-red-600 font-bold">
              {position.totalSpent.toFixed(4)} SOL
            </div>
          </div>

          <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-3 rounded-lg border-2 border-green-200">
            <div className="text-xs text-green-700 mb-1 font-semibold">Total Received</div>
            <div className="text-sm font-mono text-green-600 font-bold">
              {position.totalReceived.toFixed(4)} SOL
            </div>
          </div>

          <div className="col-span-2 bg-gradient-to-br from-orange-50 to-amber-50 p-3 rounded-lg border-2 border-orange-300">
            <div className="text-xs text-orange-700 mb-1 font-semibold">Net P&L</div>
            <div className={`text-2xl font-heading font-bold ${
              position.netPnL >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              {position.netPnL >= 0 ? '+' : ''}{position.netPnL.toFixed(4)} SOL
            </div>
            <div className="text-xs text-gray-600 font-medium">
              {position.netPnL >= 0 ? '🚀 Profit' : '📉 Loss'}
            </div>
          </div>
        </div>
      )}

      {/* Tab Selector */}
      <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg mb-4 border border-gray-200">
        <button
          onClick={() => setActiveTab('open')}
          className={`py-2 rounded-lg font-heading font-bold text-sm transition-all ${
            activeTab === 'open'
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
              : 'text-gray-700 hover:text-black hover:bg-gray-100'
          }`}
        >
          Open ({position?.openOrders.length || 0})
        </button>
        <button
          onClick={() => setActiveTab('filled')}
          className={`py-2 rounded-lg font-heading font-bold text-sm transition-all ${
            activeTab === 'filled'
              ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
              : 'text-gray-700 hover:text-black hover:bg-gray-100'
          }`}
        >
          Filled ({position?.filledOrders.length || 0})
        </button>
      </div>

      {/* Orders List */}
      <div className="space-y-2 max-h-96 overflow-y-auto">
        <AnimatePresence mode="wait">
          {activeTab === 'open' && (
            <motion.div
              key="open"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-2"
            >
              {!position || position.openOrders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">📋</div>
                  <p className="text-gray-700 text-sm font-medium">
                    No open orders
                  </p>
                  <p className="text-xs text-gray-600">
                    Place an order to start trading
                  </p>
                </div>
              ) : (
                position.openOrders.map((order) => (
                  <OrderCard
                    key={order.id}
                    order={order}
                    onCancel={handleCancelOrder}
                  />
                ))
              )}
            </motion.div>
          )}

          {activeTab === 'filled' && (
            <motion.div
              key="filled"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-2"
            >
              {!position || position.filledOrders.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-4xl mb-3">✅</div>
                  <p className="text-gray-700 text-sm font-medium">
                    No filled orders yet
                  </p>
                  <p className="text-xs text-gray-600">
                    Your completed trades will appear here
                  </p>
                </div>
              ) : (
                position.filledOrders.slice(0, 10).map((order) => (
                  <OrderCard key={order.id} order={order} />
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}

// Order Card Component
function OrderCard({ order, onCancel }: { order: UserOrder; onCancel?: (orderId: string) => void }) {
  const canCancel = order.status === 'open' || order.status === 'partially_filled'
  const fillPercent = (order.filledAmount / order.amount) * 100

  return (
    <motion.div
      className="bg-white p-3 rounded-lg border-2 border-gray-200 hover:border-purple-300 hover:shadow-md transition-all"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* Order Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
            order.side === 'buy'
              ? 'bg-green-100 text-green-700'
              : 'bg-red-100 text-red-700'
          }`}>
            {order.side.toUpperCase()}
          </span>
          <span className="text-xs font-mono text-gray-600 capitalize font-semibold">
            {order.type}
          </span>
        </div>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${
            order.status === 'filled' ? 'text-green-600' :
            order.status === 'partially_filled' ? 'text-orange-600' :
            order.status === 'cancelled' ? 'text-gray-500' :
            'text-purple-600'
          }`}>
            {order.status === 'partially_filled' ? 'PARTIAL' : order.status.toUpperCase()}
          </span>
          {canCancel && onCancel && (
            <button
              onClick={() => onCancel(order.id)}
              className="text-xs text-red-600 hover:text-red-800 transition-colors font-bold"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Order Details */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700 font-medium">Price</span>
          <span className="text-black font-mono font-semibold">
            {order.type === 'market' ? 'Market' : `${(order.price / 1000).toFixed(6)} SOL`}
          </span>
        </div>
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700 font-medium">Amount</span>
          <span className="text-black font-mono font-semibold">
            {order.amount.toLocaleString()} tokens
          </span>
        </div>
        {order.filledAmount > 0 && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-700 font-medium">Filled</span>
            <span className="text-green-600 font-mono font-bold">
              {order.filledAmount.toLocaleString()} ({fillPercent.toFixed(0)}%)
            </span>
          </div>
        )}
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-700 font-medium">Total</span>
          <span className="text-blue-600 font-mono font-bold">
            {order.total.toFixed(4)} SOL
          </span>
        </div>
      </div>

      {/* Fill Progress Bar */}
      {order.filledAmount > 0 && order.status !== 'filled' && (
        <div className="mt-2">
          <div className="w-full h-1 bg-gray-200 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${fillPercent}%` }}
              transition={{ duration: 0.5 }}
            />
          </div>
        </div>
      )}

      {/* Order ID */}
      <div className="text-xs text-gray-600 mt-2 font-mono">
        ID: {order.id.substring(0, 16)}...
      </div>
    </motion.div>
  )
}

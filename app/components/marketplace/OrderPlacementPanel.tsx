'use client'

/**
 * ORDER PLACEMENT PANEL - BEAST MODE 🔥
 *
 * Features:
 * - Place limit & market orders
 * - Real-time price calculation
 * - Wallet integration
 * - Order type toggle (Buy/Sell)
 * - Instant execution feedback
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getEnhancedOrderBook, type OrderType, type OrderSide } from '@/lib/enhanced-order-book'
import { useWallet } from '@solana/wallet-adapter-react'

export default function OrderPlacementPanel() {
  const { publicKey } = useWallet()
  const [orderType, setOrderType] = useState<OrderType>('limit')
  const [orderSide, setOrderSide] = useState<OrderSide>('buy')
  const [amount, setAmount] = useState<string>('10000')
  const [price, setPrice] = useState<string>('')
  const [estimatedCost, setEstimatedCost] = useState<number>(0)
  const [isPlacing, setIsPlacing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [bestPrice, setBestPrice] = useState<number>(0)

  // Update best price from order book
  useEffect(() => {
    const updateBestPrice = () => {
      try {
        const orderBook = getEnhancedOrderBook()
        const depth = orderBook.getDepth(1)

        if (orderSide === 'buy' && depth.asks.length > 0) {
          setBestPrice(depth.asks[0].price / 1000)
        } else if (orderSide === 'sell' && depth.bids.length > 0) {
          setBestPrice(depth.bids[0].price / 1000)
        }
      } catch (err) {
        console.error('Failed to get best price:', err)
      }
    }

    updateBestPrice()
    const interval = setInterval(updateBestPrice, 1000)
    return () => clearInterval(interval)
  }, [orderSide])

  // Calculate estimated cost
  useEffect(() => {
    const amountNum = parseFloat(amount) || 0
    const priceNum = orderType === 'limit' ? parseFloat(price) || 0 : bestPrice

    if (amountNum > 0 && priceNum > 0) {
      setEstimatedCost((priceNum * amountNum) / 1000) // Price is per 1000 tokens
    } else {
      setEstimatedCost(0)
    }
  }, [amount, price, orderType, bestPrice])

  const handlePlaceOrder = async () => {
    if (!publicKey) {
      setError('Please connect your wallet')
      return
    }

    const amountNum = parseFloat(amount)
    const priceNum = orderType === 'limit' ? parseFloat(price) : undefined

    if (!amountNum || amountNum <= 0) {
      setError('Invalid amount')
      return
    }

    if (orderType === 'limit' && (!priceNum || priceNum <= 0)) {
      setError('Invalid price')
      return
    }

    setIsPlacing(true)
    setError(null)
    setSuccess(null)

    try {
      const orderBook = getEnhancedOrderBook()
      const userId = publicKey.toBase58()

      const order = orderBook.placeOrder(
        userId,
        orderType,
        orderSide,
        amountNum,
        priceNum
      )

      setSuccess(`Order placed! ID: ${order.id.substring(0, 8)}...`)

      // Reset form
      setAmount('10000')
      if (orderType === 'limit') setPrice('')

      // Clear success message after 3 seconds
      setTimeout(() => setSuccess(null), 3000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to place order')
    } finally {
      setIsPlacing(false)
    }
  }

  return (
    <motion.div
      className="bg-white p-6 rounded-xl border-2 border-blue-200 shadow-lg"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-heading font-bold text-black mb-1">
          ⚡ Place Order
        </h3>
        <p className="text-xs text-gray-600">
          Trade compute tokens with limit or market orders
        </p>
      </div>

      {!publicKey ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">💳</div>
          <p className="text-gray-700 text-sm mb-2 font-medium">
            Connect your wallet to trade
          </p>
          <p className="text-xs text-gray-600">
            Start placing orders on the marketplace
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Order Side Toggle */}
          <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <button
              onClick={() => setOrderSide('buy')}
              className={`py-3 rounded-lg font-heading font-bold transition-all ${
                orderSide === 'buy'
                  ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setOrderSide('sell')}
              className={`py-3 rounded-lg font-heading font-bold transition-all ${
                orderSide === 'sell'
                  ? 'bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Order Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-2 bg-gray-50 rounded-lg border border-gray-200">
            <button
              onClick={() => setOrderType('limit')}
              className={`py-3 rounded-lg font-heading font-bold text-sm transition-all ${
                orderType === 'limit'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              Limit Order
            </button>
            <button
              onClick={() => setOrderType('market')}
              className={`py-3 rounded-lg font-heading font-bold text-sm transition-all ${
                orderType === 'market'
                  ? 'bg-gradient-to-r from-purple-500 to-blue-500 text-white shadow-lg'
                  : 'text-gray-600 hover:text-black hover:bg-gray-100'
              }`}
            >
              Market Order
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm text-gray-700 mb-2 block font-semibold">
              Amount (tokens)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:border-purple-500 focus:outline-none font-mono"
            />
          </div>

          {/* Price Input (Limit orders only) */}
          {orderType === 'limit' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-gray-700 font-semibold">
                  Price (SOL per 1000 tokens)
                </label>
                <button
                  onClick={() => setPrice(bestPrice.toFixed(6))}
                  className="text-xs text-purple-600 hover:text-blue-600 transition-colors font-semibold"
                >
                  Use best: {bestPrice.toFixed(6)}
                </button>
              </div>
              <input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                placeholder={bestPrice.toFixed(6)}
                step="0.000001"
                className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:border-purple-500 focus:outline-none font-mono"
              />
            </div>
          )}

          {/* Market Order Info */}
          {orderType === 'market' && (
            <div className="bg-gradient-to-r from-blue-50 to-cyan-50 p-3 rounded-lg border-2 border-blue-200">
              <div className="flex items-center justify-between text-xs">
                <span className="text-gray-700 font-medium">Execution Price</span>
                <span className="text-black font-mono font-bold">{bestPrice.toFixed(6)} SOL</span>
              </div>
              <p className="text-xs text-blue-700 mt-2 font-medium">
                ⚡ Instant execution at best available price
              </p>
            </div>
          )}

          {/* Order Summary */}
          <div className="bg-gradient-to-br from-gray-50 to-blue-50 p-4 rounded-lg border-2 border-gray-200 space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">Order Type</span>
              <span className="text-black font-mono capitalize font-semibold">{orderType}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">Side</span>
              <span className={`font-bold capitalize ${
                orderSide === 'buy' ? 'text-green-600' : 'text-red-600'
              }`}>
                {orderSide}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-700 font-medium">Amount</span>
              <span className="text-black font-mono font-semibold">{parseFloat(amount || '0').toLocaleString()} tokens</span>
            </div>
            <div className="border-t-2 border-gray-300 pt-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-700 text-sm font-medium">Estimated Cost</span>
                <span className="text-lg font-heading font-bold text-blue-600">
                  {estimatedCost.toFixed(4)} SOL
                </span>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacing || !amount || (orderType === 'limit' && !price)}
            className={`w-full px-6 py-4 rounded-xl font-heading font-bold transition-all shadow-lg ${
              orderSide === 'buy'
                ? 'bg-gradient-to-r from-green-500 to-emerald-500 text-white hover:from-green-600 hover:to-emerald-600'
                : 'bg-gradient-to-r from-red-500 to-rose-500 text-white hover:from-red-600 hover:to-rose-600'
            } hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100`}
          >
            {isPlacing ? (
              <span>⚡ Placing Order...</span>
            ) : (
              <span>{orderSide === 'buy' ? '🚀 BUY' : '💰 SELL'} {parseFloat(amount || '0').toLocaleString()} Tokens</span>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <motion.div
              className="p-3 rounded-lg bg-red-50 border-2 border-red-300"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-sm text-red-700 font-semibold">{error}</div>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              className="p-3 rounded-lg bg-green-50 border-2 border-green-300"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-sm text-green-700 font-semibold">{success}</div>
            </motion.div>
          )}

          <div className="text-xs text-gray-600 text-center font-medium">
            Orders are matched instantly with the best available price
          </div>
        </div>
      )}
    </motion.div>
  )
}

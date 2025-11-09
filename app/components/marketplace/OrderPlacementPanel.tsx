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
      className="glass p-6 rounded-xl border border-border"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-xl font-heading font-bold text-white mb-1">
          ⚡ Place Order
        </h3>
        <p className="text-xs text-text-muted">
          Trade compute tokens with limit or market orders
        </p>
      </div>

      {!publicKey ? (
        <div className="text-center py-8">
          <div className="text-4xl mb-3">💳</div>
          <p className="text-text-secondary text-sm mb-2">
            Connect your wallet to trade
          </p>
          <p className="text-xs text-text-muted">
            Start placing orders on the marketplace
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Order Side Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 glass-hover rounded-lg">
            <button
              onClick={() => setOrderSide('buy')}
              className={`py-2 rounded-lg font-heading font-bold transition-all ${
                orderSide === 'buy'
                  ? 'bg-status-success text-white shadow-lg'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Buy
            </button>
            <button
              onClick={() => setOrderSide('sell')}
              className={`py-2 rounded-lg font-heading font-bold transition-all ${
                orderSide === 'sell'
                  ? 'bg-status-error text-white shadow-lg'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Sell
            </button>
          </div>

          {/* Order Type Toggle */}
          <div className="grid grid-cols-2 gap-2 p-1 glass-hover rounded-lg">
            <button
              onClick={() => setOrderType('limit')}
              className={`py-2 rounded-lg font-heading font-bold text-sm transition-all ${
                orderType === 'limit'
                  ? 'bg-accent-primary text-white shadow-lg'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Limit Order
            </button>
            <button
              onClick={() => setOrderType('market')}
              className={`py-2 rounded-lg font-heading font-bold text-sm transition-all ${
                orderType === 'market'
                  ? 'bg-accent-primary text-white shadow-lg'
                  : 'text-text-muted hover:text-white'
              }`}
            >
              Market Order
            </button>
          </div>

          {/* Amount Input */}
          <div>
            <label className="text-sm text-text-secondary mb-2 block">
              Amount (tokens)
            </label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="10000"
              className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-white placeholder-text-muted focus:border-accent-primary focus:outline-none font-mono"
            />
          </div>

          {/* Price Input (Limit orders only) */}
          {orderType === 'limit' && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm text-text-secondary">
                  Price (SOL per 1000 tokens)
                </label>
                <button
                  onClick={() => setPrice(bestPrice.toFixed(6))}
                  className="text-xs text-accent-primary hover:text-accent-secondary transition-colors"
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
                className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-white placeholder-text-muted focus:border-accent-primary focus:outline-none font-mono"
              />
            </div>
          )}

          {/* Market Order Info */}
          {orderType === 'market' && (
            <div className="glass-hover p-3 rounded-lg">
              <div className="flex items-center justify-between text-xs">
                <span className="text-text-secondary">Execution Price</span>
                <span className="text-white font-mono">{bestPrice.toFixed(6)} SOL</span>
              </div>
              <p className="text-xs text-text-muted mt-2">
                ⚡ Instant execution at best available price
              </p>
            </div>
          )}

          {/* Order Summary */}
          <div className="glass-hover p-4 rounded-lg space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Order Type</span>
              <span className="text-white font-mono capitalize">{orderType}</span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Side</span>
              <span className={`font-bold capitalize ${
                orderSide === 'buy' ? 'text-status-success' : 'text-status-error'
              }`}>
                {orderSide}
              </span>
            </div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-text-secondary">Amount</span>
              <span className="text-white font-mono">{parseFloat(amount || '0').toLocaleString()} tokens</span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex items-center justify-between">
                <span className="text-text-secondary text-sm">Estimated Cost</span>
                <span className="text-lg font-heading font-bold text-accent-secondary">
                  {estimatedCost.toFixed(4)} SOL
                </span>
              </div>
            </div>
          </div>

          {/* Place Order Button */}
          <button
            onClick={handlePlaceOrder}
            disabled={isPlacing || !amount || (orderType === 'limit' && !price)}
            className={`w-full px-6 py-4 rounded-xl font-heading font-bold transition-all ${
              orderSide === 'buy'
                ? 'glass-hover border-2 border-status-success text-status-success hover:bg-status-success/10'
                : 'glass-hover border-2 border-status-error text-status-error hover:bg-status-error/10'
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
              className="p-3 rounded-lg bg-status-error/10 border border-status-error/30"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-sm text-status-error">{error}</div>
            </motion.div>
          )}

          {/* Success Message */}
          {success && (
            <motion.div
              className="p-3 rounded-lg bg-status-success/10 border border-status-success/30"
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <div className="text-sm text-status-success">{success}</div>
            </motion.div>
          )}

          <div className="text-xs text-text-muted text-center">
            Orders are matched instantly with the best available price
          </div>
        </div>
      )}
    </motion.div>
  )
}

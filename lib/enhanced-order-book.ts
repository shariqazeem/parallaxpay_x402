/**
 * ENHANCED ORDER BOOK - BEAST MODE 🔥
 *
 * Features:
 * - User limit & market order placement
 * - Real-time order matching engine
 * - Position tracking (P&L, open orders, filled orders)
 * - Trade execution callbacks
 * - Order cancellation
 * - Event-driven architecture for real-time UI updates
 */

import { EventEmitter } from 'events'
import { getRealProviderManager } from './real-provider-manager'

export type OrderType = 'limit' | 'market'
export type OrderSide = 'buy' | 'sell'
export type OrderStatus = 'open' | 'partially_filled' | 'filled' | 'cancelled'

export interface UserOrder {
  id: string
  userId: string // Wallet address
  type: OrderType
  side: OrderSide
  price: number // SOL per 1000 tokens (0 for market orders)
  amount: number // tokens
  filledAmount: number // tokens filled so far
  remainingAmount: number // tokens still open
  total: number // total SOL value
  status: OrderStatus
  timestamp: number
  fills: OrderFill[]
  providerId?: string // For sell orders
}

export interface OrderFill {
  id: string
  orderId: string
  price: number
  amount: number
  timestamp: number
  counterpartyId: string // Provider or user ID
  txHash?: string
}

export interface Trade {
  id: string
  buyOrderId: string
  sellOrderId: string
  buyerId: string
  sellerId: string
  price: number
  amount: number
  timestamp: number
  txHash?: string
}

export interface UserPosition {
  userId: string
  openOrders: UserOrder[]
  filledOrders: UserOrder[]
  totalVolume: number // Total tokens traded
  totalSpent: number // Total SOL spent
  totalReceived: number // Total SOL received
  netPnL: number // Net profit/loss
  tradesCount: number
}

export class EnhancedOrderBook extends EventEmitter {
  private userOrders: Map<string, UserOrder> = new Map() // orderId -> UserOrder
  private userPositions: Map<string, UserPosition> = new Map() // userId -> Position
  private trades: Trade[] = []
  private providerAsks: Map<string, UserOrder> = new Map() // Provider sell orders
  private orderIdCounter = 0

  constructor() {
    super()
    console.log('🚀 ENHANCED ORDER BOOK - BEAST MODE ACTIVATED!')
    this.updateProviderAsks()

    // Auto-update provider asks every 5 seconds
    setInterval(() => this.updateProviderAsks(), 5000)
  }

  /**
   * Update provider asks from real providers
   */
  private async updateProviderAsks(): Promise<void> {
    const providerManager = getRealProviderManager()
    const providers = providerManager.getAllProviders()

    // Update asks from online providers
    providers.forEach((provider) => {
      if (!provider.online) {
        // Remove offline provider orders
        this.providerAsks.delete(provider.id)
        return
      }

      const existingAsk = this.providerAsks.get(provider.id)

      if (existingAsk) {
        // Update existing ask price
        existingAsk.price = provider.price * 1000
        existingAsk.total = (existingAsk.price * existingAsk.amount) / 1000
      } else {
        // Create new ask
        const ask: UserOrder = {
          id: `provider-ask-${provider.id}`,
          userId: provider.id,
          type: 'limit',
          side: 'sell',
          price: provider.price * 1000,
          amount: 50000 + Math.floor(Math.random() * 50000), // Available tokens
          filledAmount: 0,
          remainingAmount: 0,
          total: 0,
          status: 'open',
          timestamp: Date.now(),
          fills: [],
          providerId: provider.id,
        }
        ask.remainingAmount = ask.amount - ask.filledAmount
        ask.total = (ask.price * ask.remainingAmount) / 1000

        this.providerAsks.set(provider.id, ask)
      }
    })

    this.emit('orderBookUpdated')
  }

  /**
   * Place a new user order
   */
  placeOrder(
    userId: string,
    type: OrderType,
    side: OrderSide,
    amount: number,
    price?: number // Required for limit orders
  ): UserOrder {
    // Validate
    if (type === 'limit' && !price) {
      throw new Error('Price required for limit orders')
    }
    if (amount <= 0) {
      throw new Error('Amount must be positive')
    }

    const order: UserOrder = {
      id: `user-order-${this.orderIdCounter++}-${Date.now()}`,
      userId,
      type,
      side,
      price: price ? price * 1000 : 0, // Convert to per 1000 tokens
      amount,
      filledAmount: 0,
      remainingAmount: amount,
      total: 0,
      status: 'open',
      timestamp: Date.now(),
      fills: [],
    }

    // Calculate total
    if (type === 'limit') {
      order.total = (order.price * order.amount) / 1000
    } else {
      // Market order - estimate based on best available price
      const estimatedPrice = this.estimateMarketPrice(side, amount)
      order.total = (estimatedPrice * amount) / 1000
    }

    this.userOrders.set(order.id, order)

    console.log(`📝 Order placed: ${userId} ${side} ${amount} tokens @ ${type === 'market' ? 'market' : (price! * 1000).toFixed(6)}`)

    // Initialize user position if not exists
    if (!this.userPositions.has(userId)) {
      this.userPositions.set(userId, {
        userId,
        openOrders: [],
        filledOrders: [],
        totalVolume: 0,
        totalSpent: 0,
        totalReceived: 0,
        netPnL: 0,
        tradesCount: 0,
      })
    }

    // Try to match immediately
    this.matchOrder(order)

    this.emit('orderPlaced', order)
    this.emit('orderBookUpdated')

    return order
  }

  /**
   * Estimate market price for market orders
   */
  private estimateMarketPrice(side: OrderSide, amount: number): number {
    const orders = side === 'buy' ? this.getAllAsks() : this.getAllBids()

    if (orders.length === 0) return 0.001 * 1000 // Default price

    // Get best available price
    return orders[0].price
  }

  /**
   * Match a user order against the book
   */
  private matchOrder(order: UserOrder): void {
    if (order.status === 'filled' || order.status === 'cancelled') return

    const counterOrders = order.side === 'buy' ? this.getAllAsks() : this.getAllBids()

    for (const counterOrder of counterOrders) {
      if (order.remainingAmount <= 0) break

      // Check if orders can match
      const canMatch = order.type === 'market' ||
        (order.side === 'buy' && order.price >= counterOrder.price) ||
        (order.side === 'sell' && order.price <= counterOrder.price)

      if (!canMatch) {
        // For limit orders, stop if we can't match at this price level
        if (order.type === 'limit') break
        continue
      }

      // Match orders!
      const matchAmount = Math.min(order.remainingAmount, counterOrder.remainingAmount)
      const matchPrice = counterOrder.price // Price taker gets maker's price

      // Create fill records
      const fillId = `fill-${Date.now()}-${Math.random()}`

      const orderFill: OrderFill = {
        id: fillId,
        orderId: order.id,
        price: matchPrice / 1000,
        amount: matchAmount,
        timestamp: Date.now(),
        counterpartyId: counterOrder.userId,
      }

      const counterFill: OrderFill = {
        id: fillId,
        orderId: counterOrder.id,
        price: matchPrice / 1000,
        amount: matchAmount,
        timestamp: Date.now(),
        counterpartyId: order.userId,
      }

      // Update orders
      order.filledAmount += matchAmount
      order.remainingAmount -= matchAmount
      order.fills.push(orderFill)

      counterOrder.filledAmount += matchAmount
      counterOrder.remainingAmount -= matchAmount
      counterOrder.fills.push(counterFill)

      // Update status
      if (order.remainingAmount === 0) {
        order.status = 'filled'
      } else if (order.filledAmount > 0) {
        order.status = 'partially_filled'
      }

      if (counterOrder.remainingAmount === 0) {
        counterOrder.status = 'filled'
      } else if (counterOrder.filledAmount > 0) {
        counterOrder.status = 'partially_filled'
      }

      // Create trade record
      const trade: Trade = {
        id: `trade-${Date.now()}-${this.trades.length}`,
        buyOrderId: order.side === 'buy' ? order.id : counterOrder.id,
        sellOrderId: order.side === 'sell' ? order.id : counterOrder.id,
        buyerId: order.side === 'buy' ? order.userId : counterOrder.userId,
        sellerId: order.side === 'sell' ? order.userId : counterOrder.userId,
        price: matchPrice / 1000,
        amount: matchAmount,
        timestamp: Date.now(),
      }

      this.trades.push(trade)

      // Keep only last 1000 trades
      if (this.trades.length > 1000) {
        this.trades = this.trades.slice(-1000)
      }

      // Update user positions
      this.updateUserPosition(order.userId, order, orderFill)
      this.updateUserPosition(counterOrder.userId, counterOrder, counterFill)

      console.log(`✅ TRADE EXECUTED: ${matchAmount} tokens @ ${(matchPrice / 1000).toFixed(6)} SOL`)

      // Emit trade event for animations!
      this.emit('tradeExecuted', trade)
    }

    this.emit('orderBookUpdated')
  }

  /**
   * Update user position after fill
   */
  private updateUserPosition(userId: string, order: UserOrder, fill: OrderFill): void {
    let position = this.userPositions.get(userId)

    if (!position) {
      position = {
        userId,
        openOrders: [],
        filledOrders: [],
        totalVolume: 0,
        totalSpent: 0,
        totalReceived: 0,
        netPnL: 0,
        tradesCount: 0,
      }
      this.userPositions.set(userId, position)
    }

    // Update volume
    position.totalVolume += fill.amount
    position.tradesCount++

    // Update spent/received
    const fillValue = fill.price * fill.amount
    if (order.side === 'buy') {
      position.totalSpent += fillValue
    } else {
      position.totalReceived += fillValue
    }

    // Update P&L
    position.netPnL = position.totalReceived - position.totalSpent

    this.emit('positionUpdated', userId, position)
  }

  /**
   * Cancel an open order
   */
  cancelOrder(orderId: string, userId: string): boolean {
    const order = this.userOrders.get(orderId)

    if (!order) return false
    if (order.userId !== userId) return false
    if (order.status === 'filled' || order.status === 'cancelled') return false

    order.status = 'cancelled'

    console.log(`❌ Order cancelled: ${orderId}`)

    this.emit('orderCancelled', order)
    this.emit('orderBookUpdated')

    return true
  }

  /**
   * Get all asks (sell orders)
   */
  getAllAsks(): UserOrder[] {
    const asks: UserOrder[] = []

    // Add provider asks
    this.providerAsks.forEach(ask => {
      if (ask.status === 'open' && ask.remainingAmount > 0) {
        asks.push(ask)
      }
    })

    // Add user sell orders
    this.userOrders.forEach(order => {
      if (order.side === 'sell' && order.status === 'open' && order.remainingAmount > 0) {
        asks.push(order)
      }
    })

    // Sort by price (lowest first)
    return asks.sort((a, b) => a.price - b.price)
  }

  /**
   * Get all bids (buy orders)
   */
  getAllBids(): UserOrder[] {
    const bids: UserOrder[] = []

    // Get user buy orders
    this.userOrders.forEach(order => {
      if (order.side === 'buy' && order.status === 'open' && order.remainingAmount > 0) {
        bids.push(order)
      }
    })

    // Sort by price (highest first)
    return bids.sort((a, b) => b.price - a.price)
  }

  /**
   * Get user position
   */
  getUserPosition(userId: string): UserPosition | null {
    const position = this.userPositions.get(userId)
    if (!position) return null

    // Update open and filled orders
    position.openOrders = Array.from(this.userOrders.values()).filter(
      order => order.userId === userId &&
      (order.status === 'open' || order.status === 'partially_filled')
    )

    position.filledOrders = Array.from(this.userOrders.values()).filter(
      order => order.userId === userId && order.status === 'filled'
    )

    return position
  }

  /**
   * Get recent trades
   */
  getRecentTrades(limit: number = 20): Trade[] {
    return this.trades.slice(-limit).reverse()
  }

  /**
   * Get spread
   */
  getSpread(): { spread: number; spreadPercent: number } {
    const bids = this.getAllBids()
    const asks = this.getAllAsks()

    if (bids.length === 0 || asks.length === 0) {
      return { spread: 0, spreadPercent: 0 }
    }

    const bestBid = bids[0].price
    const bestAsk = asks[0].price

    const spread = bestAsk - bestBid
    const spreadPercent = (spread / bestBid) * 100

    return { spread: spread / 1000, spreadPercent }
  }

  /**
   * Get order book depth
   */
  getDepth(levels: number = 10): { bids: UserOrder[]; asks: UserOrder[] } {
    return {
      bids: this.getAllBids().slice(0, levels),
      asks: this.getAllAsks().slice(0, levels),
    }
  }

  /**
   * Get order by ID
   */
  getOrder(orderId: string): UserOrder | null {
    return this.userOrders.get(orderId) || null
  }
}

// Singleton instance
let enhancedOrderBookInstance: EnhancedOrderBook | null = null

export function getEnhancedOrderBook(): EnhancedOrderBook {
  if (!enhancedOrderBookInstance) {
    enhancedOrderBookInstance = new EnhancedOrderBook()
  }
  return enhancedOrderBookInstance
}

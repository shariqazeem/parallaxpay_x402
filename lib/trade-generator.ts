/**
 * Trade Generator
 *
 * Generates realistic-looking trades for demo purposes
 */

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

const AGENT_NAMES = [
  '💰 Cost Hunter',
  '⚡ Speed Demon',
  '⚖️ Balanced Bot',
  '🧠 Smart Trader Alpha',
  '🎯 Smart Trader Beta',
  '🐋 Whale Agent',
  '🔍 Arbitrage Master',
]

const PROVIDERS = [
  '⚡ Parallax Fast',
  '💰 Parallax Cheap',
  '⚖️ Parallax Balanced',
  '🌟 Parallax Premium',
  'Cloud US-East',
  'Cloud EU-West',
  'Asia-SE Node',
]

/**
 * Generate a single random trade
 */
export function generateTrade(): Trade {
  const agent = AGENT_NAMES[Math.floor(Math.random() * AGENT_NAMES.length)]
  const provider = PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)]
  const fromProvider = Math.random() > 0.5 ? PROVIDERS[Math.floor(Math.random() * PROVIDERS.length)] : undefined

  const actions: Array<'buy' | 'sell' | 'switch'> = ['buy', 'sell', 'switch']
  const action = actions[Math.floor(Math.random() * actions.length)]

  const baseCost = 0.001
  const cost = baseCost + (Math.random() * 0.002)

  // Profit is usually positive (85% of the time)
  const profitMultiplier = Math.random() > 0.15 ? 1 : -1
  const profit = (Math.random() * 0.05) * profitMultiplier

  // Generate realistic Solana tx hash
  const txHash = generateTxHash()

  // 98% success rate
  const status = Math.random() > 0.02 ? 'success' : Math.random() > 0.5 ? 'pending' : 'failed'

  return {
    id: `trade-${Date.now()}-${Math.random()}`,
    agentName: agent,
    action,
    fromProvider,
    toProvider: provider,
    cost,
    profit,
    timestamp: Date.now(),
    txHash,
    status: status as 'success' | 'pending' | 'failed',
  }
}

/**
 * Generate multiple trades with time spacing
 */
export function generateTradeHistory(count: number = 20): Trade[] {
  const trades: Trade[] = []
  let timestamp = Date.now() - (count * 60000) // Start count minutes ago

  for (let i = 0; i < count; i++) {
    const trade = generateTrade()
    trade.timestamp = timestamp
    trade.id = `trade-${timestamp}-${i}`
    trades.push(trade)

    // 30-120 seconds between trades
    timestamp += 30000 + Math.random() * 90000
  }

  return trades.sort((a, b) => b.timestamp - a.timestamp)
}

/**
 * Generate realistic Solana transaction hash
 */
function generateTxHash(): string {
  const chars = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
  let hash = ''
  for (let i = 0; i < 88; i++) {
    hash += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return hash
}

/**
 * Calculate statistics from trades
 */
export function calculateTradeStats(trades: Trade[]) {
  const successfulTrades = trades.filter(t => t.status === 'success')

  const totalProfit = successfulTrades.reduce((sum, t) => sum + t.profit, 0)
  const totalCost = successfulTrades.reduce((sum, t) => sum + t.cost, 0)
  const avgProfit = successfulTrades.length > 0 ? totalProfit / successfulTrades.length : 0
  const successRate = trades.length > 0 ? (successfulTrades.length / trades.length) * 100 : 0

  const profitableTrades = successfulTrades.filter(t => t.profit > 0).length
  const winRate = successfulTrades.length > 0 ? (profitableTrades / successfulTrades.length) * 100 : 0

  return {
    totalTrades: trades.length,
    successfulTrades: successfulTrades.length,
    totalProfit,
    totalCost,
    avgProfit,
    successRate,
    winRate,
  }
}

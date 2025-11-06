/**
 * ParallaxPay Agent SDK
 * Build autonomous trading bots that trade AI compute like stocks
 */

export interface Provider {
  id: string
  name: string
  price: number
  latency: number
  uptime: number
  reputation: number
  region: string
  models: string[]
}

export interface MarketData {
  providers: Provider[]
  averagePrice: number
  lowestPrice: number
  highestPrice: number
  spread: number
  volume24h: number
}

export interface TradeRequest {
  providerId: string
  model: string
  tokens: number
  maxPrice?: number
}

export interface TradeResult {
  success: boolean
  transactionId: string
  provider: string
  model: string
  tokens: number
  cost: number
  latency: number
  timestamp: number
}

export interface AgentConfig {
  name: string
  strategy: 'arbitrage' | 'optimizer' | 'whale' | 'custom'
  maxBudget: number
  minReputation: number
  maxLatency: number
  preferredRegions?: string[]
  onTrade?: (result: TradeResult) => void
  onError?: (error: Error) => void
}

/**
 * Base Agent class - extend this to create your own trading strategies
 */
export abstract class Agent {
  protected config: AgentConfig
  protected isRunning: boolean = false
  protected totalTrades: number = 0
  protected totalProfit: number = 0
  protected lastTrade: TradeResult | null = null

  constructor(config: AgentConfig) {
    this.config = config
  }

  /**
   * Start the agent
   */
  async start(): Promise<void> {
    this.isRunning = true
    console.log(`🤖 [${this.config.name}] Agent started`)

    // Main trading loop
    while (this.isRunning) {
      try {
        const marketData = await this.getMarketData()
        const decision = await this.makeDecision(marketData)

        if (decision) {
          const result = await this.executeTrade(decision)
          this.handleTradeResult(result)
        }

        // Wait before next iteration
        await this.sleep(this.getPollingInterval())
      } catch (error) {
        this.handleError(error as Error)
      }
    }
  }

  /**
   * Stop the agent
   */
  stop(): void {
    this.isRunning = false
    console.log(`🛑 [${this.config.name}] Agent stopped`)
  }

  /**
   * Get current market data
   */
  protected async getMarketData(): Promise<MarketData> {
    // In production, this would call real Parallax API
    // For demo, return mock data
    const providers = await this.fetchProviders()

    const prices = providers.map((p) => p.price)
    const averagePrice = prices.reduce((a, b) => a + b, 0) / prices.length
    const lowestPrice = Math.min(...prices)
    const highestPrice = Math.max(...prices)
    const spread = highestPrice - lowestPrice

    return {
      providers,
      averagePrice,
      lowestPrice,
      highestPrice,
      spread,
      volume24h: 127432,
    }
  }

  /**
   * Make trading decision based on strategy
   * Override this in your agent implementation
   */
  protected abstract makeDecision(
    marketData: MarketData
  ): Promise<TradeRequest | null>

  /**
   * Execute a trade
   */
  protected async executeTrade(
    request: TradeRequest
  ): Promise<TradeResult> {
    // In production, this would:
    // 1. Call Gradient Parallax API
    // 2. Process payment via x402
    // 3. Return inference results

    const provider = (await this.fetchProviders()).find(
      (p) => p.id === request.providerId
    )

    if (!provider) {
      throw new Error(`Provider ${request.providerId} not found`)
    }

    const cost = (request.tokens / 1000) * provider.price
    const latency = provider.latency + Math.floor(Math.random() * 20)

    const result: TradeResult = {
      success: true,
      transactionId: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      provider: provider.name,
      model: request.model,
      tokens: request.tokens,
      cost,
      latency,
      timestamp: Date.now(),
    }

    this.totalTrades++
    this.lastTrade = result

    return result
  }

  /**
   * Handle successful trade
   */
  protected handleTradeResult(result: TradeResult): void {
    console.log(
      `✅ [${this.config.name}] Trade executed: ${result.provider} - ${result.tokens} tokens - $${result.cost.toFixed(4)}`
    )

    if (this.config.onTrade) {
      this.config.onTrade(result)
    }
  }

  /**
   * Handle error
   */
  protected handleError(error: Error): void {
    console.error(`❌ [${this.config.name}] Error: ${error.message}`)

    if (this.config.onError) {
      this.config.onError(error)
    }
  }

  /**
   * Get polling interval (how often to check market)
   */
  protected getPollingInterval(): number {
    // Check market every 5 seconds
    return 5000
  }

  /**
   * Sleep utility
   */
  protected sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  /**
   * Fetch available providers
   */
  protected async fetchProviders(): Promise<Provider[]> {
    // In production, this would call Gradient Parallax discovery API
    // For demo, return mock data
    return [
      {
        id: 'node-1',
        name: 'ParallaxNode-Alpha',
        price: 0.00118,
        latency: 42,
        uptime: 99.97,
        reputation: 98.5,
        region: 'US-East',
        models: ['Qwen-2.5-72B', 'Llama-3.3-70B'],
      },
      {
        id: 'node-2',
        name: 'ParallaxNode-Beta',
        price: 0.00122,
        latency: 38,
        uptime: 99.94,
        reputation: 97.2,
        region: 'EU-West',
        models: ['Llama-3.3-70B', 'DeepSeek-V3'],
      },
      {
        id: 'node-3',
        name: 'ParallaxNode-Gamma',
        price: 0.00115,
        latency: 51,
        uptime: 99.89,
        reputation: 96.8,
        region: 'Asia-SE',
        models: ['Qwen-2.5-72B', 'Llama-3.1-8B'],
      },
      {
        id: 'node-4',
        name: 'ParallaxNode-Delta',
        price: 0.00129,
        latency: 47,
        uptime: 99.85,
        reputation: 95.4,
        region: 'US-West',
        models: ['DeepSeek-V3', 'Qwen-2.5-32B'],
      },
      {
        id: 'node-5',
        name: 'ParallaxNode-Epsilon',
        price: 0.00112,
        latency: 55,
        uptime: 99.81,
        reputation: 94.9,
        region: 'EU-Central',
        models: ['Llama-3.3-70B', 'Qwen-2.5-72B'],
      },
    ]
  }

  /**
   * Get agent stats
   */
  getStats() {
    return {
      name: this.config.name,
      strategy: this.config.strategy,
      isRunning: this.isRunning,
      totalTrades: this.totalTrades,
      totalProfit: this.totalProfit,
      lastTrade: this.lastTrade,
    }
  }
}

/**
 * Pre-built strategies
 */

/**
 * Arbitrage Agent - Finds price differences and exploits them
 */
export class ArbitrageAgent extends Agent {
  protected async makeDecision(
    marketData: MarketData
  ): Promise<TradeRequest | null> {
    // Find cheapest and most expensive providers
    const sorted = [...marketData.providers].sort((a, b) => a.price - b.price)
    const cheapest = sorted[0]
    const expensive = sorted[sorted.length - 1]

    // If spread is profitable (>5%), trade
    const spreadPercent = (marketData.spread / marketData.averagePrice) * 100

    if (spreadPercent > 5 && cheapest.reputation > this.config.minReputation) {
      return {
        providerId: cheapest.id,
        model: cheapest.models[0],
        tokens: 1000,
        maxPrice: marketData.averagePrice,
      }
    }

    return null
  }
}

/**
 * Optimizer Agent - Always finds the cheapest provider
 */
export class OptimizerAgent extends Agent {
  protected async makeDecision(
    marketData: MarketData
  ): Promise<TradeRequest | null> {
    // Filter by requirements
    let candidates = marketData.providers.filter(
      (p) =>
        p.reputation >= this.config.minReputation &&
        p.latency <= this.config.maxLatency
    )

    // Filter by region if specified
    if (this.config.preferredRegions?.length) {
      candidates = candidates.filter((p) =>
        this.config.preferredRegions!.includes(p.region)
      )
    }

    if (candidates.length === 0) return null

    // Find cheapest
    const cheapest = candidates.sort((a, b) => a.price - b.price)[0]

    return {
      providerId: cheapest.id,
      model: cheapest.models[0],
      tokens: 500,
      maxPrice: marketData.averagePrice,
    }
  }
}

/**
 * Whale Agent - Bulk buys at market rates
 */
export class WhaleAgent extends Agent {
  protected async makeDecision(
    marketData: MarketData
  ): Promise<TradeRequest | null> {
    // Only trade if market is stable (low spread)
    const spreadPercent = (marketData.spread / marketData.averagePrice) * 100

    if (spreadPercent < 3) {
      // Find provider with best reputation
      const best = [...marketData.providers]
        .filter((p) => p.latency <= this.config.maxLatency)
        .sort((a, b) => b.reputation - a.reputation)[0]

      if (!best) return null

      return {
        providerId: best.id,
        model: best.models[0],
        tokens: 5000, // Bulk order
        maxPrice: marketData.averagePrice * 1.05, // Accept up to 5% above average
      }
    }

    return null
  }
}

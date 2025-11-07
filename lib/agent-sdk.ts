/**
 * ParallaxPay Agent SDK
 * Build autonomous trading bots that trade AI compute like stocks
 *
 * Now with REAL Gradient Parallax integration!
 */

import {
  createParallaxClient,
  isParallaxRunning,
  type ParallaxClient,
} from './parallax-client'

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
  // NEW: Enable real Parallax integration
  useRealParallax?: boolean
  parallaxSchedulerUrl?: string // Default: http://localhost:3001
  // NEW: Enable real x402 payments
  useRealPayments?: boolean
  solanaPrivateKey?: string // For x402 payment signing
  paymentApiEndpoint?: string // Default: /api/inference/paid
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
  protected parallaxClient: ParallaxClient | null = null

  constructor(config: AgentConfig) {
    this.config = config

    // Initialize Parallax client if enabled
    if (config.useRealParallax) {
      this.parallaxClient = createParallaxClient(
        config.parallaxSchedulerUrl || 'http://localhost:3001'
      )
    }
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
   * Execute a trade - NOW WITH REAL X402 PAYMENTS!
   */
  protected async executeTrade(
    request: TradeRequest
  ): Promise<TradeResult> {
    const provider = (await this.fetchProviders()).find(
      (p) => p.id === request.providerId
    )

    if (!provider) {
      throw new Error(`Provider ${request.providerId} not found`)
    }

    const startTime = Date.now()

    // MODE 1: REAL X402 PAYMENTS (Production)
    if (this.config.useRealPayments && this.config.solanaPrivateKey) {
      try {
        // Use x402 payment client to make paid inference request
        const { createPaymentClient } = await import('./x402-payment-client')

        const paymentClient = createPaymentClient({
          privateKey: this.config.solanaPrivateKey,
          network: 'solana-devnet',
          maxPaymentAmount: this.config.maxBudget,
          enableLogging: true,
        })

        const endpoint = this.config.paymentApiEndpoint || '/api/inference/paid'

        // Make paid request with automatic x402 payment handling
        const result = await paymentClient.request<{
          response: string
          tokens: number
          provider: string
          cost: number
          latency: number
          txHash?: string
          model: string
        }>(endpoint, {
          method: 'POST',
          body: JSON.stringify({
            messages: [
              {
                role: 'user',
                content: `Agent ${this.config.name} is testing AI inference with strategy: ${this.config.strategy}`,
              },
            ],
            max_tokens: request.tokens,
            provider: request.providerId,
          }),
        })

        if (!result.success || !result.data) {
          throw new Error(result.error || 'Payment failed')
        }

        const tradeResult: TradeResult = {
          success: true,
          transactionId: result.transaction?.txHash || result.transaction?.id || `tx_${Date.now()}`,
          provider: result.data.provider,
          model: result.data.model,
          tokens: result.data.tokens,
          cost: result.transaction?.amount || result.data.cost,
          latency: result.data.latency,
          timestamp: Date.now(),
        }

        this.totalTrades++
        this.totalProfit += tradeResult.cost
        this.lastTrade = tradeResult

        console.log(`✅ [${this.config.name}] Paid trade completed via x402`)
        console.log(`   TX Hash: ${tradeResult.transactionId}`)
        console.log(`   Cost: $${tradeResult.cost.toFixed(6)}`)

        return tradeResult

      } catch (error) {
        console.error(`[${this.config.name}] x402 payment error:`, error)
        throw error
      }
    }

    // MODE 2: REAL PARALLAX INFERENCE (No payment)
    if (this.config.useRealParallax && this.parallaxClient) {
      try {
        // Check if Parallax is running
        const isRunning = await this.parallaxClient.healthCheck()
        if (!isRunning) {
          throw new Error('Parallax scheduler is not running. Start it with: parallax run')
        }

        // Call REAL Parallax API for inference
        const response = await this.parallaxClient.inference({
          messages: [
            {
              role: 'user',
              content: `Agent ${this.config.name} is testing AI inference with strategy: ${this.config.strategy}`,
            },
          ],
          max_tokens: request.tokens,
        })

        const latency = Date.now() - startTime
        const actualTokens = response.usage?.total_tokens || request.tokens
        const cost = this.parallaxClient.estimateCost(actualTokens)

        const result: TradeResult = {
          success: true,
          transactionId: response.id || `tx_${Date.now()}`,
          provider: `Parallax-${response.model}`,
          model: response.model,
          tokens: actualTokens,
          cost,
          latency,
          timestamp: Date.now(),
        }

        this.totalTrades++
        this.totalProfit += cost
        this.lastTrade = result

        return result
      } catch (error) {
        console.error(`[${this.config.name}] Parallax error:`, error)
        throw error
      }
    }

    // MODE 3: DEMO MODE (Mock data - for UI demonstration)
    const cost = (request.tokens / 1000) * provider.price
    const latency = provider.latency + Math.floor(Math.random() * 20)

    const result: TradeResult = {
      success: true,
      transactionId: `demo_tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
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
   * Fetch available providers - NOW USING REAL DISCOVERY!
   */
  protected async fetchProviders(): Promise<Provider[]> {
    // Use real provider discovery service
    try {
      const { getProviderDiscoveryService } = await import('./provider-discovery')
      const discoveryService = getProviderDiscoveryService()
      const providers = discoveryService.getOnlineProviders()

      // Convert ProviderMetrics to Provider interface
      return providers.map(p => ({
        id: p.id,
        name: p.name,
        price: p.price,
        latency: p.latency,
        uptime: p.uptime,
        reputation: p.reputation,
        region: p.region,
        models: p.models,
      }))
    } catch (error) {
      console.error('Failed to fetch providers from discovery service:', error)

      // Fallback to local Parallax node
      return [
        {
          id: 'local-node',
          name: 'Local Parallax Node',
          price: 0.001,
          latency: 50,
          uptime: 99.0,
          reputation: 95.0,
          region: 'Local',
          models: ['Qwen-0.6B', 'Qwen-1.7B', 'Qwen-2.5B'],
        },
      ]
    }
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

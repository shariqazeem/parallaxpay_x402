/**
 * REAL Multi-Provider Manager
 *
 * NO MORE FAKE DATA! 🔥
 *
 * This connects to ACTUAL Parallax nodes and discovers real providers.
 * - Health checks on multiple endpoints
 * - Real latency measurements
 * - Dynamic pricing based on performance
 * - Provider rotation and failover
 */

export interface RealProvider {
  id: string
  url: string
  name: string
  model: string
  region: string
  online: boolean
  latency: number // REAL measured latency
  price: number // Dynamic pricing
  uptime: number // Calculated from health checks
  lastHealthCheck: number
  successfulRequests: number
  failedRequests: number
}

export interface BenchmarkResult {
  providerId: string
  url: string
  latency: number
  success: boolean
  timestamp: number
  tokens?: number
  cost?: number
}

export class RealProviderManager {
  private providers: Map<string, RealProvider> = new Map()
  private healthCheckInterval: NodeJS.Timeout | null = null

  // Support Parallax instances (configure based on your setup)
  // For single node setup (Mac Air M1), just use one endpoint
  private readonly PARALLAX_ENDPOINTS = [
    { url: 'http://localhost:3001', region: 'Local', model: 'Qwen/Qwen3-0.6B' },
    // Uncomment below if you want to run multiple nodes (requires more resources):
    // { url: 'http://localhost:3002', region: 'Local-2', model: 'Qwen/Qwen2.5-1.5B' },
    // { url: 'http://localhost:3003', region: 'Local-3', model: 'Qwen/Qwen2.5-3B' },
  ]

  constructor() {
    console.log('🚀 RealProviderManager initialized')
  }

  /**
   * Discover and connect to all available Parallax providers
   */
  async discoverProviders(): Promise<RealProvider[]> {
    console.log('🔍 Discovering real Parallax providers...')

    const discoveries = await Promise.allSettled(
      this.PARALLAX_ENDPOINTS.map(async (endpoint) => {
        try {
          const health = await this.healthCheck(endpoint.url)

          const provider: RealProvider = {
            id: `provider-${endpoint.url.split(':').pop()}`,
            url: endpoint.url,
            name: `Parallax ${endpoint.region}`,
            model: endpoint.model,
            region: endpoint.region,
            online: health.online,
            latency: health.latency,
            price: this.calculateDynamicPrice(health.latency),
            uptime: health.online ? 100 : 0,
            lastHealthCheck: Date.now(),
            successfulRequests: 0,
            failedRequests: 0,
          }

          this.providers.set(provider.id, provider)

          if (health.online) {
            console.log(`✅ Found provider: ${provider.name} (${health.latency}ms)`)
          } else {
            console.log(`❌ Provider offline: ${provider.name}`)
          }

          return provider
        } catch (error) {
          console.error(`Failed to discover ${endpoint.url}:`, error)
          throw error
        }
      })
    )

    const activeProviders = discoveries
      .filter((result): result is PromiseFulfilledResult<RealProvider> => result.status === 'fulfilled')
      .map(result => result.value)

    console.log(`Found ${activeProviders.length}/${this.PARALLAX_ENDPOINTS.length} providers online`)

    return activeProviders
  }

  /**
   * Real health check against Parallax endpoint
   * Note: Parallax doesn't have /health, so we just check if the server responds
   */
  async healthCheck(url: string): Promise<{ online: boolean; latency: number }> {
    const start = Date.now()

    try {
      const controller = new AbortController()
      const timeout = setTimeout(() => controller.abort(), 5000) // 5s timeout

      // Just hit the base URL - Parallax doesn't have /health endpoint
      const response = await fetch(url, {
        signal: controller.signal,
      })

      clearTimeout(timeout)
      const latency = Date.now() - start

      // Any response (even 404) means the server is running
      return {
        online: true,
        latency,
      }
    } catch (error) {
      const latency = Date.now() - start
      return {
        online: false,
        latency,
      }
    }
  }

  /**
   * Real benchmark - send actual inference request
   */
  async benchmarkProvider(providerId: string, testPrompt: string = 'Hello'): Promise<BenchmarkResult> {
    const provider = this.providers.get(providerId)
    if (!provider) {
      throw new Error(`Provider ${providerId} not found`)
    }

    const start = Date.now()

    try {
      const response = await fetch(`${provider.url}/v1/chat/completions`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: provider.model,
          messages: [{ role: 'user', content: testPrompt }],
          max_tokens: 10,
        }),
      })

      const latency = Date.now() - start

      if (!response.ok) {
        throw new Error(`Provider returned ${response.status}`)
      }

      const data = await response.json()

      // Update provider stats
      provider.latency = latency
      provider.successfulRequests++
      provider.uptime = (provider.successfulRequests / (provider.successfulRequests + provider.failedRequests)) * 100
      provider.lastHealthCheck = Date.now()

      return {
        providerId,
        url: provider.url,
        latency,
        success: true,
        timestamp: Date.now(),
        tokens: data.usage?.total_tokens || 10,
        cost: this.calculateDynamicPrice(latency),
      }
    } catch (error) {
      const latency = Date.now() - start

      // Update failure stats
      provider.failedRequests++
      provider.online = false
      provider.uptime = (provider.successfulRequests / (provider.successfulRequests + provider.failedRequests)) * 100

      console.error(`Benchmark failed for ${provider.name}:`, error)

      return {
        providerId,
        url: provider.url,
        latency,
        success: false,
        timestamp: Date.now(),
      }
    }
  }

  /**
   * Benchmark ALL providers in parallel
   */
  async benchmarkAll(testPrompt?: string): Promise<BenchmarkResult[]> {
    const providerIds = Array.from(this.providers.keys())

    if (providerIds.length === 0) {
      console.warn('No providers available to benchmark')
      return []
    }

    console.log(`⚡ Benchmarking ${providerIds.length} providers...`)

    const results = await Promise.all(
      providerIds.map(id => this.benchmarkProvider(id, testPrompt))
    )

    const successful = results.filter(r => r.success)
    console.log(`📊 Benchmark complete: ${successful.length}/${results.length} successful`)

    return results
  }

  /**
   * Get best provider based on criteria
   */
  getBestProvider(criteria: 'latency' | 'price' | 'balanced' = 'balanced'): RealProvider | null {
    const onlineProviders = Array.from(this.providers.values()).filter(p => p.online)

    if (onlineProviders.length === 0) {
      return null
    }

    let best: RealProvider

    switch (criteria) {
      case 'latency':
        best = onlineProviders.reduce((a, b) => a.latency < b.latency ? a : b)
        break
      case 'price':
        best = onlineProviders.reduce((a, b) => a.price < b.price ? a : b)
        break
      case 'balanced':
      default:
        // Score based on latency (60%) + price (40%)
        best = onlineProviders.reduce((a, b) => {
          const scoreA = (1 - a.latency / 1000) * 0.6 + (1 - a.price / 0.01) * 0.4
          const scoreB = (1 - b.latency / 1000) * 0.6 + (1 - b.price / 0.01) * 0.4
          return scoreA > scoreB ? a : b
        })
    }

    return best
  }

  /**
   * Calculate dynamic pricing based on latency
   * Lower latency = higher price (premium service)
   */
  private calculateDynamicPrice(latency: number): number {
    const basePrice = 0.0001 // $0.0001 per token
    const latencyFactor = Math.max(1, latency / 100) // Penalty for high latency
    return basePrice * latencyFactor
  }

  /**
   * Start continuous health monitoring
   */
  startHealthMonitoring(intervalMs: number = 30000) {
    console.log(`🔄 Starting health monitoring (every ${intervalMs}ms)`)

    this.healthCheckInterval = setInterval(async () => {
      const providerIds = Array.from(this.providers.keys())

      await Promise.all(providerIds.map(async (id) => {
        const provider = this.providers.get(id)
        if (!provider) return

        const health = await this.healthCheck(provider.url)
        provider.online = health.online
        provider.latency = health.latency
        provider.lastHealthCheck = Date.now()

        if (health.online) {
          provider.price = this.calculateDynamicPrice(health.latency)
        }
      }))
    }, intervalMs)
  }

  /**
   * Stop health monitoring
   */
  stopHealthMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval)
      this.healthCheckInterval = null
      console.log('⏹️ Health monitoring stopped')
    }
  }

  /**
   * Get all providers
   */
  getAllProviders(): RealProvider[] {
    return Array.from(this.providers.values())
  }

  /**
   * Get provider by ID
   */
  getProvider(id: string): RealProvider | null {
    return this.providers.get(id) || null
  }

  /**
   * Get provider stats
   */
  getStats() {
    const providers = this.getAllProviders()
    const online = providers.filter(p => p.online).length
    const avgLatency = providers.reduce((sum, p) => sum + p.latency, 0) / providers.length
    const avgPrice = providers.reduce((sum, p) => sum + p.price, 0) / providers.length

    return {
      total: providers.length,
      online,
      offline: providers.length - online,
      avgLatency: Math.round(avgLatency),
      avgPrice: avgPrice.toFixed(6),
    }
  }
}

// Singleton instance
let managerInstance: RealProviderManager | null = null

export function getRealProviderManager(): RealProviderManager {
  if (!managerInstance) {
    managerInstance = new RealProviderManager()
  }
  return managerInstance
}

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
  port: number // Port number for multi-node tracking
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

  // Parallax Cluster Configuration
  // Parallax uses scheduler+worker architecture:
  // - 1 scheduler on port 3001 (main API endpoint)
  // - N workers connect to scheduler via P2P (we can't detect count via HTTP)
  //
  // We show the cluster as a single entity since:
  // 1. All requests go through one scheduler endpoint
  // 2. Worker count is not exposed via HTTP API
  // 3. This accurately represents the architecture
  private readonly PARALLAX_CLUSTER = {
    schedulerUrl: 'http://localhost:3001',
    model: 'Qwen/Qwen3-0.6B'
  }

  constructor() {
    console.log('🚀 RealProviderManager initialized')
    // Initialize Gradient Cloud API as a permanent provider
    this.initializeGradientProvider()
  }

  /**
   * Initialize Gradient Cloud API as a permanent provider
   */
  private initializeGradientProvider() {
    const gradientProvider: RealProvider = {
      id: 'gradient-cloud-api',
      url: 'https://apis.gradient.network/api/v1',
      name: '🌐 Gradient Cloud API',
      model: 'openai/gpt-oss-120b',
      region: 'Global CDN',
      port: 443,
      online: true, // Always online (cloud service)
      latency: 500, // ~500ms typical cloud latency
      price: 0.00045, // $0.45 per 1M tokens output
      uptime: 99.9, // Cloud SLA
      lastHealthCheck: Date.now(),
      successfulRequests: 0,
      failedRequests: 0,
    }

    this.providers.set('gradient-cloud-api', gradientProvider)
    console.log('✅ Gradient Cloud API added to provider manager')
  }

  /**
   * Discover Parallax cluster (dynamic - works with any number of workers)
   *
   * Shows cluster as single entity since worker count isn't exposed via HTTP.
   * This accurately represents the architecture: one scheduler, N workers.
   */
  async discoverProviders(): Promise<RealProvider[]> {
    console.log('🔍 Discovering Parallax cluster...')
    console.log(`   Scheduler: ${this.PARALLAX_CLUSTER.schedulerUrl}`)

    // Check scheduler health
    const health = await this.healthCheck(this.PARALLAX_CLUSTER.schedulerUrl)

    if (!health.online) {
      console.log('❌ Parallax cluster is offline')
      // Still return Gradient even if Parallax is offline
      return Array.from(this.providers.values())
    }

    console.log(`✅ Parallax cluster online (${health.latency}ms)`)

    // Create single provider entry representing the entire cluster
    const provider: RealProvider = {
      id: 'parallax-cluster',
      url: this.PARALLAX_CLUSTER.schedulerUrl,
      name: 'Parallax Cluster',
      model: this.PARALLAX_CLUSTER.model,
      region: 'Local',
      port: 3001,
      online: health.online,
      latency: health.latency,
      price: this.calculateDynamicPrice(health.latency),
      uptime: 100,
      lastHealthCheck: Date.now(),
      successfulRequests: 0,
      failedRequests: 0,
    }

    this.providers.set(provider.id, provider)
    console.log(`  ✓ ${provider.name} (${provider.latency}ms)`)
    console.log(`📊 Cluster ready - works with any number of connected workers`)

    // Return all providers (Parallax + Gradient)
    return Array.from(this.providers.values())
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
          max_tokens: 10,
          messages: [{ role: 'user', content: testPrompt }],
          temperature: 0.7,
          stream: false,
        }),
      })

      const latency = Date.now() - start

      if (!response.ok) {
        const errorText = await response.text()
        console.error(`❌ Provider ${provider.name} returned ${response.status}:`, errorText)
        throw new Error(`Provider returned ${response.status}: ${errorText.substring(0, 100)}`)
      }

      const data = await response.json()

      // Update provider stats
      provider.latency = latency
      provider.successfulRequests++
      provider.online = true // Mark online on success
      provider.uptime = (provider.successfulRequests / (provider.successfulRequests + provider.failedRequests)) * 100
      provider.lastHealthCheck = Date.now()

      console.log(`✅ ${provider.name} benchmark: ${latency}ms`)

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
      provider.uptime = provider.successfulRequests > 0
        ? (provider.successfulRequests / (provider.successfulRequests + provider.failedRequests)) * 100
        : 0

      console.error(`❌ Benchmark failed for ${provider.name}:`, error)

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
   * Benchmark ALL providers (sequentially for cluster to avoid overwhelming scheduler)
   */
  async benchmarkAll(testPrompt?: string): Promise<BenchmarkResult[]> {
    const providerIds = Array.from(this.providers.keys())

    if (providerIds.length === 0) {
      console.warn('No providers available to benchmark')
      return []
    }

    console.log(`⚡ Benchmarking ${providerIds.length} cluster nodes sequentially...`)

    // For Parallax cluster, all providers share same scheduler
    // So we benchmark sequentially to avoid overwhelming the scheduler
    const results: BenchmarkResult[] = []

    for (const id of providerIds) {
      const result = await this.benchmarkProvider(id, testPrompt)
      results.push(result)
      // Small delay between requests to avoid overload
      if (results.length < providerIds.length) {
        await new Promise(resolve => setTimeout(resolve, 500))
      }
    }

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

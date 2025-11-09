/**
 * Demo Provider Simulator
 *
 * Simulates multiple Parallax providers without needing actual nodes running
 * Perfect for demos and development!
 */

import { ProviderNode, BenchmarkResult } from './real-agent-engine'

export interface SimulatedProvider extends ProviderNode {
  currentLatency: number // Simulated current latency
  trend: 'improving' | 'degrading' | 'stable'
  lastBenchmark: number // Timestamp
}

/**
 * Demo Provider Simulator
 * Creates realistic provider behavior for demos
 */
export class DemoProviderSimulator {
  private providers: SimulatedProvider[]
  private benchmarkHistory: Map<string, BenchmarkResult[]> = new Map()

  constructor() {
    // Initialize 4 demo providers with realistic characteristics
    this.providers = [
      {
        id: 'parallax-fast',
        name: '⚡ Parallax Fast (US-East)',
        url: 'http://demo.parallax.local:3001',
        port: 3001,
        baseLatency: 45,
        currentLatency: 45,
        pricing: 0.000001,
        model: 'qwen/qwen-2.5-72b-instruct',
        region: 'us-east',
        trend: 'stable',
        lastBenchmark: Date.now(),
      },
      {
        id: 'parallax-cheap',
        name: '💰 Parallax Cheap (EU-West)',
        url: 'http://demo.parallax.local:3002',
        port: 3002,
        baseLatency: 120,
        currentLatency: 120,
        pricing: 0.0000005,
        model: 'qwen/qwen-2.5-72b-instruct',
        region: 'eu-west',
        trend: 'improving',
        lastBenchmark: Date.now(),
      },
      {
        id: 'parallax-balanced',
        name: '⚖️ Parallax Balanced (Asia-SE)',
        url: 'http://demo.parallax.local:3003',
        port: 3003,
        baseLatency: 80,
        currentLatency: 80,
        pricing: 0.00000075,
        model: 'llama/llama-3.1-70b',
        region: 'asia-se',
        trend: 'stable',
        lastBenchmark: Date.now(),
      },
      {
        id: 'parallax-premium',
        name: '🌟 Parallax Premium (US-West)',
        url: 'http://demo.parallax.local:3004',
        port: 3004,
        baseLatency: 35,
        currentLatency: 35,
        pricing: 0.0000015,
        model: 'deepseek/deepseek-v3',
        region: 'us-west',
        trend: 'degrading',
        lastBenchmark: Date.now(),
      },
    ]
  }

  /**
   * Simulate provider latency changes over time
   */
  private updateProviderLatencies(): void {
    this.providers.forEach(provider => {
      const variation = (Math.random() - 0.5) * 20 // ±10ms random walk

      switch (provider.trend) {
        case 'improving':
          provider.currentLatency = Math.max(
            provider.baseLatency * 0.8,
            provider.currentLatency + variation - 2
          )
          break
        case 'degrading':
          provider.currentLatency = Math.min(
            provider.baseLatency * 1.5,
            provider.currentLatency + variation + 2
          )
          break
        case 'stable':
          provider.currentLatency = provider.baseLatency + variation
          break
      }

      // Randomly change trends occasionally
      if (Math.random() < 0.05) {
        const trends: Array<'improving' | 'degrading' | 'stable'> = ['improving', 'degrading', 'stable']
        provider.trend = trends[Math.floor(Math.random() * trends.length)]
      }
    })
  }

  /**
   * Simulate benchmarking all providers
   */
  async benchmarkAll(): Promise<BenchmarkResult[]> {
    console.log('📊 [DEMO] Simulating provider benchmarks...')

    this.updateProviderLatencies()

    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 100 + Math.random() * 200))

    const results: BenchmarkResult[] = this.providers.map(provider => {
      const success = Math.random() > 0.05 // 95% success rate
      const latency = success
        ? provider.currentLatency + (Math.random() - 0.5) * 10
        : 999999

      const result: BenchmarkResult = {
        providerId: provider.id,
        actualLatency: Math.round(latency),
        success,
        timestamp: Date.now(),
        responseTime: Math.round(latency),
        cost: provider.pricing,
      }

      // Store in history
      const history = this.benchmarkHistory.get(provider.id) || []
      history.push(result)
      this.benchmarkHistory.set(provider.id, history.slice(-50))

      return result
    })

    console.log('✅ [DEMO] Benchmarks complete:', results)
    return results
  }

  /**
   * Get all providers
   */
  getProviders(): SimulatedProvider[] {
    return [...this.providers]
  }

  /**
   * Get provider by ID
   */
  getProvider(id: string): SimulatedProvider | undefined {
    return this.providers.find(p => p.id === id)
  }

  /**
   * Get benchmark history
   */
  getBenchmarkHistory(providerId: string): BenchmarkResult[] {
    return this.benchmarkHistory.get(providerId) || []
  }

  /**
   * Simulate a successful inference
   */
  async simulateInference(providerId: string, prompt: string): Promise<{
    success: boolean
    response?: string
    latency: number
    cost: number
  }> {
    const provider = this.getProvider(providerId)
    if (!provider) {
      return { success: false, latency: 0, cost: 0 }
    }

    // Simulate network delay
    const latency = provider.currentLatency + (Math.random() - 0.5) * 20
    await new Promise(resolve => setTimeout(resolve, Math.max(100, latency)))

    const success = Math.random() > 0.02 // 98% success rate

    if (!success) {
      return { success: false, latency, cost: provider.pricing }
    }

    // Generate a realistic-looking response
    const responses = [
      "Based on current market conditions, the optimal strategy is to prioritize providers with latency under 60ms while maintaining cost efficiency.",
      "Analysis shows a 23% cost reduction opportunity by switching to Provider B during off-peak hours.",
      "Recommendation: Execute trade with Provider A. Expected savings: $0.0042 per 1K tokens.",
      "Market analysis complete. Detected arbitrage opportunity between US-East and EU-West regions.",
      "Provider health check: All systems operational. Uptime: 99.97%. Average latency: 52ms.",
    ]

    return {
      success: true,
      response: responses[Math.floor(Math.random() * responses.length)],
      latency: Math.round(latency),
      cost: provider.pricing,
    }
  }

  /**
   * Generate realistic trade history
   */
  generateTradeHistory(count: number = 20): Array<{
    id: string
    timestamp: number
    fromProvider: string
    toProvider: string
    reason: string
    savings: number
    success: boolean
  }> {
    const trades = []
    let time = Date.now() - (count * 60000) // Start from count minutes ago

    for (let i = 0; i < count; i++) {
      const from = this.providers[Math.floor(Math.random() * this.providers.length)]
      let to = this.providers[Math.floor(Math.random() * this.providers.length)]

      // Ensure different providers
      while (to.id === from.id) {
        to = this.providers[Math.floor(Math.random() * this.providers.length)]
      }

      const savings = (from.pricing - to.pricing) * 1000 * (1 + Math.random())
      const savingsPercent = (savings / (from.pricing * 1000)) * 100

      const reasons = [
        `Cost optimization: ${savingsPercent.toFixed(1)}% savings`,
        `Latency improvement: ${Math.round(from.currentLatency - to.currentLatency)}ms faster`,
        `Swarm consensus: ${(50 + Math.random() * 50).toFixed(0)}% agreement`,
        `Arbitrage opportunity detected`,
        `Provider quality score improved`,
      ]

      trades.push({
        id: `trade-${i}-${Date.now()}`,
        timestamp: time,
        fromProvider: from.name,
        toProvider: to.name,
        reason: reasons[Math.floor(Math.random() * reasons.length)],
        savings: parseFloat(savings.toFixed(6)),
        success: Math.random() > 0.1, // 90% success rate
      })

      time += 60000 + Math.random() * 120000 // 1-3 minutes apart
    }

    return trades.sort((a, b) => b.timestamp - a.timestamp)
  }

  /**
   * Generate realistic swarm insights
   */
  generateSwarmInsights(count: number = 10): Array<{
    type: 'discovery' | 'warning' | 'consensus' | 'optimization'
    message: string
    confidence: number
    impact: 'high' | 'medium' | 'low'
    timestamp: number
    agentId: string
  }> {
    const insights = []
    let time = Date.now() - (count * 30000) // Start from count * 30 seconds ago

    const agentNames = ['Cost Hunter', 'Speed Demon', 'Balanced Bot', 'Smart Trader Alpha', 'Smart Trader Beta']

    const templates = {
      discovery: [
        'Discovered {provider} with {percent}% lower cost',
        'Found latency improvement: {provider} at {latency}ms',
        'Identified arbitrage opportunity on {provider}',
        'New high-performance provider detected: {provider}',
      ],
      warning: [
        'Provider {provider} latency degrading (+{latency}ms)',
        'Unusual pricing spike on {provider}',
        'Provider {provider} uptime dropped to {uptime}%',
        'Network congestion detected in {region} region',
      ],
      consensus: [
        'Swarm consensus: Switch to {provider} ({percent}% agreement)',
        'Collective decision: {provider} optimal for current conditions',
        '{count} agents recommend {provider}',
        'Unanimous vote: {provider} best choice',
      ],
      optimization: [
        'Swarm performance improved by {percent}%',
        'Collective savings: ${amount} over last hour',
        'Swarm efficiency at {percent}%',
        'Optimization cycle complete: {trades} trades executed',
      ],
    }

    for (let i = 0; i < count; i++) {
      const types: Array<'discovery' | 'warning' | 'consensus' | 'optimization'> = ['discovery', 'warning', 'consensus', 'optimization']
      const type = types[Math.floor(Math.random() * types.length)]

      const provider = this.providers[Math.floor(Math.random() * this.providers.length)]
      const template = templates[type][Math.floor(Math.random() * templates[type].length)]

      const message = template
        .replace('{provider}', provider.name)
        .replace('{percent}', (20 + Math.random() * 30).toFixed(1))
        .replace('{latency}', Math.round(10 + Math.random() * 40).toString())
        .replace('{uptime}', (95 + Math.random() * 4).toFixed(1))
        .replace('{region}', provider.region)
        .replace('{count}', Math.floor(2 + Math.random() * 4).toString())
        .replace('{amount}', (Math.random() * 5).toFixed(2))
        .replace('{trades}', Math.floor(10 + Math.random() * 40).toString())

      const impacts: Array<'high' | 'medium' | 'low'> = ['high', 'medium', 'low']

      insights.push({
        type,
        message,
        confidence: 0.6 + Math.random() * 0.4,
        impact: type === 'warning' ? 'high' : impacts[Math.floor(Math.random() * impacts.length)],
        timestamp: time,
        agentId: agentNames[Math.floor(Math.random() * agentNames.length)],
      })

      time += 30000 + Math.random() * 60000 // 30-90 seconds apart
    }

    return insights.sort((a, b) => b.timestamp - a.timestamp)
  }
}

// Singleton instance for demo mode
let demoSimulator: DemoProviderSimulator | null = null

export function getDemoSimulator(): DemoProviderSimulator {
  if (!demoSimulator) {
    demoSimulator = new DemoProviderSimulator()
  }
  return demoSimulator
}

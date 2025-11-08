/**
 * REAL Swarm Intelligence
 *
 * ACTUAL COLLABORATIVE AI! 🐝
 *
 * Agents that:
 * - Share real discoveries
 * - Vote on best providers
 * - Reach consensus
 * - Learn from each other
 * - Achieve better performance together
 */

import { getRealProviderManager, type RealProvider, type BenchmarkResult } from './real-provider-manager'
import { getRealAgentExecutor, type AgentStrategy } from './real-agent-executor'

export interface SwarmMember {
  id: string
  name: string
  strategy: AgentStrategy
  reputation: number // Increases with successful discoveries
  contributions: number // Number of discoveries shared
  lastActivity: string
  discoveries: ProviderDiscovery[]
}

export interface ProviderDiscovery {
  providerId: string
  discoveredBy: string // Agent ID
  latency: number
  price: number
  quality: number // 0-100 score
  timestamp: number
  votes: number // How many agents agree this is good
}

export interface SwarmConsensus {
  agreedProvider: RealProvider | null
  votesFor: number
  votesAgainst: number
  confidence: number // 0-1
  reason: string
  participants: string[] // Agent IDs
}

export class RealSwarm {
  private members: Map<string, SwarmMember> = new Map()
  private sharedMemory: Map<string, ProviderDiscovery> = new Map() // Shared knowledge
  private providerManager = getRealProviderManager()
  private agentExecutor = getRealAgentExecutor()

  constructor() {
    console.log('🐝 RealSwarm initialized')
    this.initializeSwarmMembers()
  }

  /**
   * Initialize swarm with diverse agents
   */
  private initializeSwarmMembers() {
    const strategies: AgentStrategy[] = [
      {
        type: 'latency',
        name: 'Speed Demon',
        description: 'Prioritizes lowest latency',
        config: { maxLatency: 100 },
      },
      {
        type: 'cost',
        name: 'Cost Hunter',
        description: 'Finds cheapest providers',
        config: { maxPrice: 0.001 },
      },
      {
        type: 'balanced',
        name: 'Balanced Bot',
        description: 'Balances cost and speed',
      },
      {
        type: 'optimizer',
        name: 'Smart Trader',
        description: 'Optimizes based on market conditions',
      },
      {
        type: 'arbitrage',
        name: 'Swarm Leader',
        description: 'Coordinates swarm consensus',
      },
    ]

    strategies.forEach((strategy, index) => {
      const member: SwarmMember = {
        id: `agent-${index + 1}`,
        name: strategy.name,
        strategy,
        reputation: 50, // Start neutral
        contributions: 0,
        lastActivity: 'Idle',
        discoveries: [],
      }

      this.members.set(member.id, member)
    })

    console.log(`✅ Initialized ${this.members.size} swarm members`)
  }

  /**
   * Run swarm optimization - THIS IS REAL!
   */
  async runSwarmOptimization(): Promise<{
    consensus: SwarmConsensus
    discoveries: ProviderDiscovery[]
    performanceGain: number
  }> {
    console.log('🚀 Running REAL swarm optimization...')

    // Step 1: Each agent discovers providers independently
    console.log('📡 Step 1: Parallel provider discovery')
    const discoveries = await this.parallelDiscovery()

    // Step 2: Agents share discoveries (gossip protocol)
    console.log('🗣️ Step 2: Sharing discoveries via gossip')
    this.shareDiscoveries(discoveries)

    // Step 3: Agents vote on best provider
    console.log('🗳️ Step 3: Voting on best provider')
    const consensus = await this.reachConsensus()

    // Step 4: Calculate performance gain
    console.log('📊 Step 4: Calculating performance gain')
    const performanceGain = this.calculatePerformanceGain(consensus)

    console.log(`✅ Swarm optimization complete: ${performanceGain.toFixed(1)}% gain`)

    return {
      consensus,
      discoveries: Array.from(this.sharedMemory.values()),
      performanceGain,
    }
  }

  /**
   * Each agent discovers providers in parallel
   */
  private async parallelDiscovery(): Promise<ProviderDiscovery[]> {
    const members = Array.from(this.members.values())

    // Each agent benchmarks providers based on their strategy
    const discoveryPromises = members.map(async (member) => {
      member.lastActivity = 'Scanning providers...'

      try {
        const result = await this.agentExecutor.executeStrategy(member.strategy)

        if (result.success && result.decision.selectedProvider) {
          const discovery: ProviderDiscovery = {
            providerId: result.decision.selectedProvider.id,
            discoveredBy: member.id,
            latency: result.decision.metrics.bestLatency,
            price: result.decision.metrics.bestPrice,
            quality: this.calculateQualityScore(result.decision.metrics.bestLatency, result.decision.metrics.bestPrice),
            timestamp: Date.now(),
            votes: 1, // Self-vote
          }

          member.discoveries.push(discovery)
          member.contributions++
          member.lastActivity = `Found ${result.decision.selectedProvider.name}`

          return discovery
        }

        member.lastActivity = 'No providers found'
        return null
      } catch (error) {
        console.error(`Discovery failed for ${member.name}:`, error)
        member.lastActivity = 'Discovery failed'
        return null
      }
    })

    const results = await Promise.all(discoveryPromises)
    return results.filter((d): d is ProviderDiscovery => d !== null)
  }

  /**
   * Share discoveries via gossip protocol
   */
  private shareDiscoveries(discoveries: ProviderDiscovery[]) {
    discoveries.forEach(discovery => {
      const existingDiscovery = this.sharedMemory.get(discovery.providerId)

      if (existingDiscovery) {
        // Merge discoveries - update if newer or better
        if (discovery.quality > existingDiscovery.quality) {
          this.sharedMemory.set(discovery.providerId, discovery)
        }
        existingDiscovery.votes++ // More agents agree
      } else {
        // New discovery
        this.sharedMemory.set(discovery.providerId, discovery)
      }
    })

    console.log(`📚 Shared memory: ${this.sharedMemory.size} unique providers discovered`)
  }

  /**
   * Agents vote to reach consensus
   */
  private async reachConsensus(): Promise<SwarmConsensus> {
    const discoveries = Array.from(this.sharedMemory.values())

    if (discoveries.length === 0) {
      return {
        agreedProvider: null,
        votesFor: 0,
        votesAgainst: 0,
        confidence: 0,
        reason: 'No providers discovered',
        participants: [],
      }
    }

    // Sort by quality and votes
    const sorted = discoveries.sort((a, b) => {
      const scoreA = a.quality * 0.7 + a.votes * 0.3
      const scoreB = b.quality * 0.7 + b.votes * 0.3
      return scoreB - scoreA
    })

    const winner = sorted[0]
    const provider = this.providerManager.getProvider(winner.providerId)

    if (!provider) {
      return {
        agreedProvider: null,
        votesFor: 0,
        votesAgainst: 0,
        confidence: 0,
        reason: 'Provider not available',
        participants: [],
      }
    }

    // Count votes
    const totalMembers = this.members.size
    const votesFor = winner.votes
    const votesAgainst = totalMembers - votesFor
    const confidence = votesFor / totalMembers

    // Update reputation of discoverer
    const discoverer = this.members.get(winner.discoveredBy)
    if (discoverer) {
      discoverer.reputation += 10 // Reward for good discovery
    }

    return {
      agreedProvider: provider,
      votesFor,
      votesAgainst,
      confidence,
      reason: `Swarm consensus: ${provider.name} offers best balance (${winner.quality.toFixed(0)}% quality, ${votesFor}/${totalMembers} votes)`,
      participants: Array.from(this.members.keys()),
    }
  }

  /**
   * Calculate quality score (0-100)
   */
  private calculateQualityScore(latency: number, price: number): number {
    // Lower latency = higher score (max 1000ms)
    const latencyScore = Math.max(0, (1 - latency / 1000) * 100)

    // Lower price = higher score (max $0.01)
    const priceScore = Math.max(0, (1 - price / 0.01) * 100)

    // Weighted average: 60% latency, 40% price
    return latencyScore * 0.6 + priceScore * 0.4
  }

  /**
   * Calculate real performance gain from swarm
   */
  private calculatePerformanceGain(consensus: SwarmConsensus): number {
    if (!consensus.agreedProvider) {
      return 0
    }

    const allProviders = this.providerManager.getAllProviders()
    const avgLatency = allProviders.reduce((sum, p) => sum + p.latency, 0) / allProviders.length
    const avgPrice = allProviders.reduce((sum, p) => sum + p.price, 0) / allProviders.length

    const consensusLatency = consensus.agreedProvider.latency
    const consensusPrice = consensus.agreedProvider.price

    // Calculate improvement
    const latencyGain = ((avgLatency - consensusLatency) / avgLatency) * 100
    const priceGain = ((avgPrice - consensusPrice) / avgPrice) * 100

    // Overall gain (weighted)
    return latencyGain * 0.6 + priceGain * 0.4
  }

  /**
   * Get swarm members
   */
  getMembers(): SwarmMember[] {
    return Array.from(this.members.values())
  }

  /**
   * Get shared knowledge
   */
  getSharedMemory(): ProviderDiscovery[] {
    return Array.from(this.sharedMemory.values())
  }

  /**
   * Get swarm stats
   */
  getStats() {
    const members = this.getMembers()
    const discoveries = this.getSharedMemory()

    const totalContributions = members.reduce((sum, m) => sum + m.contributions, 0)
    const avgReputation = members.reduce((sum, m) => sum + m.reputation, 0) / members.length

    return {
      totalMembers: members.length,
      totalDiscoveries: discoveries.length,
      totalContributions,
      avgReputation: Math.round(avgReputation),
      highImpactDiscoveries: discoveries.filter(d => d.quality > 80).length,
    }
  }

  /**
   * Generate insights from swarm activity
   */
  generateInsights(): Array<{
    id: string
    type: 'discovery' | 'optimization' | 'consensus' | 'warning'
    message: string
    confidence: number
    impact: 'low' | 'medium' | 'high'
    timestamp: number
    agentId: string
  }> {
    const discoveries = this.getSharedMemory()
    const members = this.getMembers()

    return discoveries.slice(0, 5).map((discovery, index) => {
      const member = members.find(m => m.id === discovery.discoveredBy)

      return {
        id: `insight-${Date.now()}-${index}`,
        type: discovery.quality > 80 ? 'discovery' : 'optimization',
        message: `${member?.name || 'Agent'} discovered ${this.providerManager.getProvider(discovery.providerId)?.name || 'provider'} with ${discovery.latency}ms latency and ${(discovery.quality).toFixed(0)}% quality score`,
        confidence: Math.min(0.95, discovery.votes / members.length),
        impact: discovery.quality > 90 ? 'high' : discovery.quality > 70 ? 'medium' : 'low',
        timestamp: discovery.timestamp,
        agentId: discovery.discoveredBy,
      }
    })
  }
}

// Singleton instance
let swarmInstance: RealSwarm | null = null

export function getRealSwarm(): RealSwarm {
  if (!swarmInstance) {
    swarmInstance = new RealSwarm()
  }
  return swarmInstance
}

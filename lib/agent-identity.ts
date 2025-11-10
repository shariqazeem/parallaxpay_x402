/**
 * AGENT IDENTITY & REPUTATION SYSTEM 🏆
 *
 * Trustless Agent Implementation for x402 Hackathon
 *
 * Features:
 * - On-chain agent identity (wallet-based)
 * - Reputation scoring based on performance
 * - Trust badges and verification
 * - Performance history tracking
 * - Fraud detection
 */

import { PublicKey } from '@solana/web3.js'

export interface AgentIdentity {
  id: string // Unique agent ID
  walletAddress: string // Owner's wallet (Solana pubkey)
  name: string
  type: 'arbitrage' | 'optimizer' | 'whale' | 'custom' | 'composite'
  createdAt: number

  // Identity verification
  isVerified: boolean
  verificationMethod?: 'wallet' | 'nft' | 'domain'
  verificationTimestamp?: number

  // Reputation metrics
  reputation: AgentReputation

  // Performance metrics
  stats: AgentStats

  // Trust signals
  badges: TrustBadge[]
}

export interface AgentReputation {
  score: number // 0-1000
  level: 'Novice' | 'Trusted' | 'Expert' | 'Elite' | 'Legendary'

  // Breakdown
  performanceScore: number // 0-300
  reliabilityScore: number // 0-300
  efficiencyScore: number // 0-200
  communityScore: number // 0-200

  // History
  scoreHistory: Array<{ timestamp: number; score: number; reason: string }>

  // Penalties
  penalties: number
  lastPenalty?: { timestamp: number; reason: string }
}

export interface AgentStats {
  totalExecutions: number
  successfulExecutions: number
  failedExecutions: number

  totalVolume: number // Total SOL spent
  avgCost: number
  avgLatency: number

  totalSavings: number // Compared to baseline
  bestTrade?: {
    timestamp: number
    savings: number
    provider: string
  }

  uptime: number // Percentage
  lastActive: number

  // Provider diversity
  providersUsed: string[]
  favoriteProvider?: string
}

export interface TrustBadge {
  id: string
  type: 'verified' | 'topPerformer' | 'costSaver' | 'speedDemon' | 'reliable' | 'whale' | 'pioneer'
  name: string
  description: string
  earnedAt: number
  icon: string
  // On-chain attestation
  attestation?: {
    signature: string // Solana transaction signature
    explorerUrl: string
    timestamp: number
  }
}

export class AgentIdentityManager {
  private identities: Map<string, AgentIdentity> = new Map()

  constructor() {
    console.log('🔐 Agent Identity Manager initialized')
    this.loadFromStorage()
  }

  /**
   * Create new agent identity
   */
  createIdentity(
    walletAddress: string,
    name: string,
    type: AgentIdentity['type']
  ): AgentIdentity {
    const id = `agent-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    const identity: AgentIdentity = {
      id,
      walletAddress,
      name,
      type,
      createdAt: Date.now(),
      isVerified: false,

      reputation: {
        score: 100, // Start with base score
        level: 'Novice',
        performanceScore: 25,
        reliabilityScore: 25,
        efficiencyScore: 25,
        communityScore: 25,
        scoreHistory: [{
          timestamp: Date.now(),
          score: 100,
          reason: 'Agent created'
        }],
        penalties: 0,
      },

      stats: {
        totalExecutions: 0,
        successfulExecutions: 0,
        failedExecutions: 0,
        totalVolume: 0,
        avgCost: 0,
        avgLatency: 0,
        totalSavings: 0,
        uptime: 100,
        lastActive: Date.now(),
        providersUsed: [],
      },

      badges: [],
    }

    // Auto-verify if wallet is connected
    if (walletAddress) {
      identity.isVerified = true
      identity.verificationMethod = 'wallet'
      identity.verificationTimestamp = Date.now()

      // Award pioneer badge
      identity.badges.push({
        id: 'pioneer',
        type: 'pioneer',
        name: '🏆 Pioneer',
        description: 'One of the first agents on ParallaxPay',
        earnedAt: Date.now(),
        icon: '🏆',
      })
    }

    this.identities.set(id, identity)
    this.saveToStorage()

    console.log(`✅ Created agent identity: ${name} (${id})`)

    return identity
  }

  /**
   * Update agent stats after execution
   */
  recordExecution(
    agentId: string,
    success: boolean,
    cost: number,
    latency: number,
    provider: string,
    savings?: number
  ): void {
    const identity = this.identities.get(agentId)
    if (!identity) return

    // Update stats
    identity.stats.totalExecutions++
    if (success) {
      identity.stats.successfulExecutions++
    } else {
      identity.stats.failedExecutions++
    }

    identity.stats.totalVolume += cost
    identity.stats.avgCost = identity.stats.totalVolume / identity.stats.totalExecutions
    identity.stats.avgLatency = (identity.stats.avgLatency * (identity.stats.totalExecutions - 1) + latency) / identity.stats.totalExecutions
    identity.stats.lastActive = Date.now()

    if (savings) {
      identity.stats.totalSavings += savings

      // Track best trade
      if (!identity.stats.bestTrade || savings > identity.stats.bestTrade.savings) {
        identity.stats.bestTrade = {
          timestamp: Date.now(),
          savings,
          provider,
        }
      }
    }

    // Track provider diversity
    if (!identity.stats.providersUsed.includes(provider)) {
      identity.stats.providersUsed.push(provider)
    }

    // Update favorite provider
    // (Could track usage count, for now just use most recent)
    identity.stats.favoriteProvider = provider

    // Recalculate reputation
    this.updateReputation(agentId)

    // Check for badge awards
    this.checkBadges(agentId)

    this.saveToStorage()
  }

  /**
   * Update reputation score based on performance
   */
  private updateReputation(agentId: string): void {
    const identity = this.identities.get(agentId)
    if (!identity) return

    const stats = identity.stats

    // Performance score (0-300)
    const successRate = stats.totalExecutions > 0
      ? stats.successfulExecutions / stats.totalExecutions
      : 0
    identity.reputation.performanceScore = Math.floor(successRate * 300)

    // Reliability score (0-300)
    const uptimeScore = Math.floor((stats.uptime / 100) * 200)
    const consistencyScore = stats.totalExecutions >= 10 ? 100 : Math.floor((stats.totalExecutions / 10) * 100)
    identity.reputation.reliabilityScore = uptimeScore + consistencyScore

    // Efficiency score (0-200)
    const savingsScore = Math.min(100, Math.floor(stats.totalSavings * 1000)) // $0.01 = 10 points
    const latencyScore = stats.avgLatency > 0
      ? Math.max(0, 100 - Math.floor(stats.avgLatency / 10)) // <1000ms = 100 points
      : 0
    identity.reputation.efficiencyScore = savingsScore + latencyScore

    // Community score (0-200)
    const diversityScore = Math.min(100, identity.stats.providersUsed.length * 20) // 5 providers = max
    const volumeScore = Math.min(100, Math.floor(stats.totalVolume * 10000)) // $0.01 = 100 points
    identity.reputation.communityScore = diversityScore + volumeScore

    // Calculate total score
    const totalScore =
      identity.reputation.performanceScore +
      identity.reputation.reliabilityScore +
      identity.reputation.efficiencyScore +
      identity.reputation.communityScore -
      (identity.reputation.penalties * 50)

    const oldScore = identity.reputation.score
    identity.reputation.score = Math.max(0, Math.min(1000, totalScore))

    // Update level
    if (identity.reputation.score >= 800) identity.reputation.level = 'Legendary'
    else if (identity.reputation.score >= 600) identity.reputation.level = 'Elite'
    else if (identity.reputation.score >= 400) identity.reputation.level = 'Expert'
    else if (identity.reputation.score >= 200) identity.reputation.level = 'Trusted'
    else identity.reputation.level = 'Novice'

    // Record score change
    if (oldScore !== identity.reputation.score) {
      identity.reputation.scoreHistory.push({
        timestamp: Date.now(),
        score: identity.reputation.score,
        reason: 'Performance update',
      })

      // Keep only last 100 records
      if (identity.reputation.scoreHistory.length > 100) {
        identity.reputation.scoreHistory = identity.reputation.scoreHistory.slice(-100)
      }
    }
  }

  /**
   * Check and award badges based on achievements
   */
  private checkBadges(agentId: string): void {
    const identity = this.identities.get(agentId)
    if (!identity) return

    const hasBadge = (type: TrustBadge['type']) =>
      identity.badges.some(b => b.type === type)

    // Top Performer (100% success rate with 10+ executions)
    if (!hasBadge('topPerformer') &&
        identity.stats.totalExecutions >= 10 &&
        identity.stats.failedExecutions === 0) {
      identity.badges.push({
        id: 'top-performer',
        type: 'topPerformer',
        name: '⭐ Top Performer',
        description: '100% success rate with 10+ executions',
        earnedAt: Date.now(),
        icon: '⭐',
      })
    }

    // Cost Saver (saved $0.10+)
    if (!hasBadge('costSaver') && identity.stats.totalSavings >= 0.1) {
      identity.badges.push({
        id: 'cost-saver',
        type: 'costSaver',
        name: '💰 Cost Saver',
        description: 'Saved $0.10+ through optimization',
        earnedAt: Date.now(),
        icon: '💰',
      })
    }

    // Speed Demon (avg latency < 500ms with 5+ executions)
    if (!hasBadge('speedDemon') &&
        identity.stats.totalExecutions >= 5 &&
        identity.stats.avgLatency < 500) {
      identity.badges.push({
        id: 'speed-demon',
        type: 'speedDemon',
        name: '⚡ Speed Demon',
        description: 'Average latency under 500ms',
        earnedAt: Date.now(),
        icon: '⚡',
      })
    }

    // Reliable (25+ successful executions)
    if (!hasBadge('reliable') && identity.stats.successfulExecutions >= 25) {
      identity.badges.push({
        id: 'reliable',
        type: 'reliable',
        name: '🛡️ Reliable',
        description: '25+ successful executions',
        earnedAt: Date.now(),
        icon: '🛡️',
      })
    }

    // Whale (spent $1+ total)
    if (!hasBadge('whale') && identity.stats.totalVolume >= 1) {
      identity.badges.push({
        id: 'whale',
        type: 'whale',
        name: '🐋 Whale',
        description: 'Spent $1+ on AI inference',
        earnedAt: Date.now(),
        icon: '🐋',
      })
    }
  }

  /**
   * Record on-chain attestation for a badge
   */
  recordBadgeAttestation(
    agentId: string,
    badgeId: string,
    signature: string,
    explorerUrl: string
  ): void {
    const identity = this.identities.get(agentId)
    if (!identity) return

    // Find the badge and add attestation
    const badge = identity.badges.find(b => b.id === badgeId)
    if (badge) {
      badge.attestation = {
        signature,
        explorerUrl,
        timestamp: Date.now(),
      }

      console.log(`✅ [ATTESTATION] Badge "${badge.name}" recorded on-chain`)
      console.log(`   Signature: ${signature}`)
      console.log(`   Explorer: ${explorerUrl}`)

      this.saveToStorage()
    }
  }

  /**
   * Get badges that need attestation (badges without attestation signature)
   */
  getBadgesNeedingAttestation(agentId: string): TrustBadge[] {
    const identity = this.identities.get(agentId)
    if (!identity) return []

    return identity.badges.filter(b => !b.attestation)
  }

  /**
   * Apply penalty to agent (for failures, etc.)
   */
  applyPenalty(agentId: string, reason: string): void {
    const identity = this.identities.get(agentId)
    if (!identity) return

    identity.reputation.penalties++
    identity.reputation.lastPenalty = {
      timestamp: Date.now(),
      reason,
    }

    identity.reputation.scoreHistory.push({
      timestamp: Date.now(),
      score: identity.reputation.score - 50,
      reason: `Penalty: ${reason}`,
    })

    this.updateReputation(agentId)
    this.saveToStorage()
  }

  /**
   * Get agent identity
   */
  getIdentity(agentId: string): AgentIdentity | null {
    return this.identities.get(agentId) || null
  }

  /**
   * Get all identities for a wallet
   */
  getIdentitiesByWallet(walletAddress: string): AgentIdentity[] {
    return Array.from(this.identities.values()).filter(
      identity => identity.walletAddress === walletAddress
    )
  }

  /**
   * Get leaderboard (top agents by reputation)
   */
  getLeaderboard(limit: number = 10): AgentIdentity[] {
    return Array.from(this.identities.values())
      .sort((a, b) => b.reputation.score - a.reputation.score)
      .slice(0, limit)
  }

  /**
   * Get all identities
   */
  getAllIdentities(): AgentIdentity[] {
    return Array.from(this.identities.values())
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = Array.from(this.identities.entries())
      localStorage.setItem('parallaxpay_agent_identities', JSON.stringify(data))
    } catch (err) {
      console.error('Failed to save identities:', err)
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('parallaxpay_agent_identities')
      if (data) {
        const entries = JSON.parse(data)
        this.identities = new Map(entries)
        console.log(`📚 Loaded ${this.identities.size} agent identities`)
      }
    } catch (err) {
      console.error('Failed to load identities:', err)
    }
  }
}

// Singleton
let agentIdentityManagerInstance: AgentIdentityManager | null = null

export function getAgentIdentityManager(): AgentIdentityManager {
  if (!agentIdentityManagerInstance) {
    agentIdentityManagerInstance = new AgentIdentityManager()
  }
  return agentIdentityManagerInstance
}

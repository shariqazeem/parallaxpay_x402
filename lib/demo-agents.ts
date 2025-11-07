/**
 * Demo Agents - Examples of how to use the ParallaxPay Agent SDK
 *
 * These agents demonstrate different trading strategies:
 * 1. Arbitrage Hunter - Exploits price differences
 * 2. Cost Optimizer - Always finds cheapest provider
 * 3. Whale Trader - Bulk buys when market is stable
 */

import {
  ArbitrageAgent,
  OptimizerAgent,
  WhaleAgent,
  type AgentConfig,
  type TradeResult,
} from './agent-sdk'

/**
 * Example 1: Arbitrage Hunter
 *
 * This agent monitors the market for price differences between providers.
 * When it finds a significant spread (>5%), it buys from the cheapest provider.
 *
 * Perfect for: Maximizing profit through market inefficiencies
 */
export function createArbitrageHunter() {
  const config: AgentConfig = {
    name: 'Arbitrage Hunter #1',
    strategy: 'arbitrage',
    maxBudget: 1000, // $1000 max budget
    minReputation: 95, // Only trade with 95%+ reputation
    maxLatency: 100, // Accept up to 100ms latency
    onTrade: (result: TradeResult) => {
      console.log(`💰 Arbitrage trade completed!`)
      console.log(`   Provider: ${result.provider}`)
      console.log(`   Cost: $${result.cost.toFixed(4)}`)
      console.log(`   Latency: ${result.latency}ms`)
    },
    onError: (error: Error) => {
      console.error(`🚨 Arbitrage error: ${error.message}`)
    },
  }

  return new ArbitrageAgent(config)
}

/**
 * Example 2: Cost Optimizer
 *
 * This agent always finds the cheapest provider that meets quality requirements.
 * It filters by reputation, latency, and region before choosing the lowest price.
 *
 * Perfect for: Cost-sensitive workloads with quality guarantees
 */
export function createCostOptimizer() {
  const config: AgentConfig = {
    name: 'Cost Optimizer #2',
    strategy: 'optimizer',
    maxBudget: 500, // $500 max budget
    minReputation: 90, // Accept 90%+ reputation
    maxLatency: 75, // Need low latency (<75ms)
    preferredRegions: ['US-East', 'US-West'], // US providers only
    onTrade: (result: TradeResult) => {
      console.log(`⚡ Optimized trade executed!`)
      console.log(`   Found cheapest provider: ${result.provider}`)
      console.log(`   Saved ~15% vs average price`)
    },
    onError: (error: Error) => {
      console.error(`🚨 Optimizer error: ${error.message}`)
    },
  }

  return new OptimizerAgent(config)
}

/**
 * Example 3: Whale Trader
 *
 * This agent makes large bulk purchases when market conditions are stable.
 * It only trades when spread is low (<3%) and chooses highest reputation providers.
 *
 * Perfect for: Enterprise workloads requiring stability and reliability
 */
export function createWhaleTrader() {
  const config: AgentConfig = {
    name: 'Whale Trader #3',
    strategy: 'whale',
    maxBudget: 5000, // $5000 max budget
    minReputation: 98, // Only the best (98%+ reputation)
    maxLatency: 50, // Need excellent latency (<50ms)
    onTrade: (result: TradeResult) => {
      console.log(`🐋 Whale trade executed!`)
      console.log(`   Bulk order: ${result.tokens} tokens`)
      console.log(`   Total cost: $${result.cost.toFixed(2)}`)
      console.log(`   Provider: ${result.provider}`)
    },
    onError: (error: Error) => {
      console.error(`🚨 Whale error: ${error.message}`)
    },
  }

  return new WhaleAgent(config)
}

/**
 * Example 4: Custom Strategy
 *
 * Build your own agent with custom logic!
 */
export function createCustomAgent() {
  // You can extend the Agent base class to create any strategy you want
  // See agent-sdk.ts for the base class

  // Example custom strategies:
  // - Time-based trader (trade during off-peak hours)
  // - Region-aware trader (route to nearest provider)
  // - Quality-first trader (prioritize reputation over price)
  // - Load balancer (distribute across multiple providers)
  // - Failover trader (switch providers if one goes down)
  // - ML-powered trader (predict best times to trade)

  console.log('💡 Build your own agent by extending the Agent base class!')
  console.log('   See lib/agent-sdk.ts for the full API')
}

/**
 * Start all demo agents
 */
export async function startDemoAgents() {
  console.log('🚀 Starting demo agents...\n')

  const agents = [
    createArbitrageHunter(),
    createCostOptimizer(),
    createWhaleTrader(),
  ]

  // Start all agents
  for (const agent of agents) {
    agent.start().catch((error) => {
      console.error(`Failed to start agent: ${error.message}`)
    })
  }

  console.log('\n✅ All agents running!')
  console.log('   Watch them trade autonomously in real-time')
  console.log('   Press Ctrl+C to stop\n')

  // Keep process alive
  process.on('SIGINT', () => {
    console.log('\n\n🛑 Stopping all agents...')
    agents.forEach((agent) => agent.stop())
    process.exit(0)
  })
}

// Export everything for easy import
export {
  ArbitrageAgent,
  OptimizerAgent,
  WhaleAgent,
} from './agent-sdk'

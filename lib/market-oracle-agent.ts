/**
 * MARKET ORACLE AGENT - The Killer Demo for x402 Solana Hackathon
 *
 * This agent demonstrates:
 * ✅ Autonomous operation (runs on schedule)
 * ✅ x402 micropayments (pay per inference)
 * ✅ Parallax distributed compute (multi-provider consensus)
 * ✅ Reputation building (prediction accuracy tracking)
 * ✅ Real financial value (market predictions)
 */

import { getRealProviderManager } from './real-provider-manager'

export interface MarketPrediction {
  id: string
  timestamp: number
  asset: string
  currentPrice: number
  predictedDirection: 'up' | 'down' | 'neutral'
  confidence: number
  timeframe: '5m' | '15m' | '1h' | '4h' | '24h'
  providers: {
    name: string
    prediction: 'up' | 'down' | 'neutral'
    confidence: number
    cost: number
    latency: number
  }[]
  consensusStrength: number
  totalCost: number
  actualOutcome?: 'up' | 'down' | 'neutral'
  accuracy?: boolean
  reasoning: string
}

export interface OraclePerformance {
  totalPredictions: number
  correctPredictions: number
  accuracy: number
  totalCost: number
  avgCostPerPrediction: number
  reputationScore: number
  trustLevel: 'novice' | 'intermediate' | 'expert' | 'master'
  predictions: MarketPrediction[]
}

export class MarketOracleAgent {
  private predictions: MarketPrediction[] = []
  private isRunning = false
  private intervalId?: NodeJS.Timeout

  constructor() {
    this.loadFromLocalStorage()
  }

  private loadFromLocalStorage() {
    if (typeof window === 'undefined') return

    try {
      const stored = localStorage.getItem('market_oracle_predictions')
      if (stored) {
        this.predictions = JSON.parse(stored)
      }
    } catch (error) {
      console.error('Failed to load predictions:', error)
    }
  }

  private saveToLocalStorage() {
    if (typeof window === 'undefined') return

    try {
      localStorage.setItem('market_oracle_predictions', JSON.stringify(this.predictions))
    } catch (error) {
      console.error('Failed to save predictions:', error)
    }
  }

  async fetchCurrentPrice(asset: string): Promise<number> {
    try {
      // Using CoinGecko API for real price data (free, no auth needed)
      const coinIds: { [key: string]: string } = {
        'BTC': 'bitcoin',
        'ETH': 'ethereum',
        'SOL': 'solana',
        'USDC': 'usd-coin'
      }

      const coinId = coinIds[asset] || 'bitcoin'
      const response = await fetch(
        `https://api.coingecko.com/api/v3/simple/price?ids=${coinId}&vs_currencies=usd`,
        { next: { revalidate: 60 } } // Cache for 60 seconds
      )

      if (!response.ok) {
        throw new Error('Failed to fetch price')
      }

      const data = await response.json()
      return data[coinId]?.usd || 0
    } catch (error) {
      console.error('Price fetch error:', error)
      // Return mock price if API fails
      return 42000 + Math.random() * 1000
    }
  }

  async runPrediction(
    asset: string = 'SOL',
    timeframe: '5m' | '15m' | '1h' | '4h' | '24h' = '1h',
    useMultiProvider = true,
    fetchWithPayment?: typeof fetch
  ): Promise<MarketPrediction> {
    const startTime = Date.now()
    const currentPrice = await this.fetchCurrentPrice(asset)

    const providerManager = getRealProviderManager()
    const allProviders = providerManager.getAllProviders()
    const availableProviders = allProviders.filter(p => p.online)

    if (availableProviders.length === 0) {
      throw new Error('No providers available. Please check marketplace and ensure at least one provider is online.')
    }

    // Dynamic provider selection based on what's available
    const providersToUse = useMultiProvider
      ? availableProviders // Use ALL available providers for consensus
      : [availableProviders[0]] // Use just the first one

    console.log(`🔮 Market Oracle analyzing ${asset} using ${providersToUse.length} provider(s)...`)
    console.log(`   Multi-provider consensus: ${useMultiProvider ? 'ENABLED' : 'DISABLED'}`)

    const providerPredictions = []
    let totalCost = 0

    // Get predictions from each provider
    for (const provider of providersToUse) {
      const predictionStart = Date.now()

      try {
        // Create the market analysis prompt
        const prompt = `You are a crypto market analyst. Analyze ${asset} current price: $${currentPrice}.

Based on market trends, technical indicators, and current market sentiment, predict if the price will go UP, DOWN, or stay NEUTRAL in the next ${timeframe}.

Respond in this EXACT format:
PREDICTION: [UP/DOWN/NEUTRAL]
CONFIDENCE: [0-100]
REASONING: [brief explanation in 1-2 sentences]

Be concise and direct.`

        // Call inference endpoint with x402 payment
        // Use client-side payment if fetchWithPayment provided, otherwise fall back to server-side
        const apiUrl = fetchWithPayment ? '/api/inference/paid' : '/api/oracle/inference'
        const fetchFn = fetchWithPayment || fetch

        const response = await fetchFn(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: prompt }],
            provider: provider.name,
            max_tokens: 200,
          })
        })

        if (!response.ok) {
          throw new Error(`Provider ${provider.name} failed`)
        }

        const result = await response.json()

        // Handle both client-side (/api/inference/paid) and server-side (/api/oracle/inference) responses
        let aiResponse: string
        let latency: number
        let cost: number
        let txHash: string | undefined

        if (fetchWithPayment) {
          // Client-side response from /api/inference/paid
          aiResponse = result.response || ''
          latency = result.latency || (Date.now() - predictionStart)
          cost = result.cost || 0.001
          txHash = result.txHash
        } else {
          // Server-side response from /api/oracle/inference
          if (!result.success) {
            throw new Error(result.error || 'Inference failed')
          }
          const data = result.data
          aiResponse = data.content || data.response || ''
          latency = data.latency || (Date.now() - predictionStart)
          cost = data.cost || 0.001
          txHash = data.txHash
        }

        // Parse AI response
        const predictionMatch = aiResponse.match(/PREDICTION:\s*(UP|DOWN|NEUTRAL)/i)
        const confidenceMatch = aiResponse.match(/CONFIDENCE:\s*(\d+)/i)
        const reasoningMatch = aiResponse.match(/REASONING:\s*(.+?)(?:\n|$)/i)

        const prediction = (predictionMatch?.[1]?.toLowerCase() || 'neutral') as 'up' | 'down' | 'neutral'
        const confidence = parseInt(confidenceMatch?.[1] || '50')
        const reasoning = reasoningMatch?.[1]?.trim() || 'Analysis based on current market conditions'

        providerPredictions.push({
          name: provider.name,
          prediction,
          confidence,
          cost,
          latency,
          reasoning
        })

        totalCost += cost

        console.log(`  ✓ ${provider.name}: ${prediction.toUpperCase()} (${confidence}% confidence, ${latency}ms, $${cost.toFixed(4)})`)
        if (txHash && txHash !== 'pending') {
          console.log(`    💰 TX: https://explorer.solana.com/tx/${txHash}?cluster=devnet`)
        }
      } catch (error) {
        console.error(`  ✗ ${provider.name} failed:`, error)

        // Fallback prediction if provider fails - still count this provider
        providerPredictions.push({
          name: provider.name,
          prediction: 'neutral',
          confidence: 30,
          cost: 0,
          latency: 0,
          reasoning: 'Provider unavailable - connection failed'
        })
      }
    }

    // Calculate consensus
    const upVotes = providerPredictions.filter(p => p.prediction === 'up').length
    const downVotes = providerPredictions.filter(p => p.prediction === 'down').length
    const neutralVotes = providerPredictions.filter(p => p.prediction === 'neutral').length

    let consensusPrediction: 'up' | 'down' | 'neutral'
    let consensusStrength = 0

    if (upVotes > downVotes && upVotes > neutralVotes) {
      consensusPrediction = 'up'
      consensusStrength = (upVotes / providersToUse.length) * 100
    } else if (downVotes > upVotes && downVotes > neutralVotes) {
      consensusPrediction = 'down'
      consensusStrength = (downVotes / providersToUse.length) * 100
    } else {
      consensusPrediction = 'neutral'
      consensusStrength = (neutralVotes / providersToUse.length) * 100
    }

    // Calculate weighted confidence
    const avgConfidence = providerPredictions.reduce((sum, p) => sum + p.confidence, 0) / providerPredictions.length

    // Combine reasoning from all providers
    const combinedReasoning = providerPredictions
      .filter(p => p.reasoning && p.reasoning !== 'Provider unavailable')
      .map(p => p.reasoning)
      .join(' | ')

    const prediction: MarketPrediction = {
      id: `pred_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
      asset,
      currentPrice,
      predictedDirection: consensusPrediction,
      confidence: avgConfidence,
      timeframe,
      providers: providerPredictions.map(({ reasoning, ...rest }) => rest),
      consensusStrength,
      totalCost,
      reasoning: combinedReasoning || 'Market analysis based on current trends and sentiment'
    }

    // Add to predictions array
    this.predictions.unshift(prediction)

    // Keep only last 50 predictions
    if (this.predictions.length > 50) {
      this.predictions = this.predictions.slice(0, 50)
    }

    this.saveToLocalStorage()

    const totalTime = Date.now() - startTime
    console.log(`✅ Prediction complete: ${consensusPrediction.toUpperCase()} (${consensusStrength.toFixed(0)}% consensus, ${totalTime}ms, $${totalCost.toFixed(4)})`)

    return prediction
  }

  async verifyPrediction(predictionId: string): Promise<void> {
    const prediction = this.predictions.find(p => p.id === predictionId)
    if (!prediction) return

    // Fetch current price
    const newPrice = await this.fetchCurrentPrice(prediction.asset)
    const priceChange = ((newPrice - prediction.currentPrice) / prediction.currentPrice) * 100

    // Determine actual outcome based on timeframe
    let actualOutcome: 'up' | 'down' | 'neutral'

    if (Math.abs(priceChange) < 0.5) {
      actualOutcome = 'neutral'
    } else if (priceChange > 0) {
      actualOutcome = 'up'
    } else {
      actualOutcome = 'down'
    }

    prediction.actualOutcome = actualOutcome
    prediction.accuracy = prediction.predictedDirection === actualOutcome

    this.saveToLocalStorage()

    console.log(`🎯 Prediction verified: ${prediction.accuracy ? 'CORRECT ✓' : 'INCORRECT ✗'}`)
  }

  getPerformance(): OraclePerformance {
    const totalPredictions = this.predictions.length
    const verifiedPredictions = this.predictions.filter(p => p.accuracy !== undefined)
    const correctPredictions = verifiedPredictions.filter(p => p.accuracy === true).length
    const accuracy = verifiedPredictions.length > 0
      ? (correctPredictions / verifiedPredictions.length) * 100
      : 0

    const totalCost = this.predictions.reduce((sum, p) => sum + p.totalCost, 0)
    const avgCostPerPrediction = totalPredictions > 0 ? totalCost / totalPredictions : 0

    // Calculate reputation score
    const reputationScore = Math.min(
      1000,
      Math.floor(
        (accuracy * 5) + // Accuracy weight
        (correctPredictions * 10) + // Correct predictions
        (totalPredictions * 2) // Activity
      )
    )

    // Determine trust level
    let trustLevel: 'novice' | 'intermediate' | 'expert' | 'master'
    if (reputationScore >= 750) trustLevel = 'master'
    else if (reputationScore >= 500) trustLevel = 'expert'
    else if (reputationScore >= 250) trustLevel = 'intermediate'
    else trustLevel = 'novice'

    return {
      totalPredictions,
      correctPredictions,
      accuracy,
      totalCost,
      avgCostPerPrediction,
      reputationScore,
      trustLevel,
      predictions: this.predictions
    }
  }

  startAutonomousMode(intervalMinutes: number = 5, fetchWithPayment?: typeof fetch) {
    if (this.isRunning) {
      console.log('⚠️ Oracle already running')
      return
    }

    this.isRunning = true
    console.log(`🚀 Market Oracle starting autonomous mode (every ${intervalMinutes} minutes)`)

    // Run immediately
    this.runPrediction('SOL', '1h', true, fetchWithPayment)

    // Then run on interval
    this.intervalId = setInterval(() => {
      this.runPrediction('SOL', '1h', true, fetchWithPayment)

      // Verify old predictions
      const predictionsToVerify = this.predictions.filter(
        p => !p.actualOutcome && Date.now() - p.timestamp > 60 * 60 * 1000 // 1 hour old
      )

      predictionsToVerify.forEach(p => this.verifyPrediction(p.id))
    }, intervalMinutes * 60 * 1000)
  }

  stopAutonomousMode() {
    if (this.intervalId) {
      clearInterval(this.intervalId)
      this.intervalId = undefined
    }
    this.isRunning = false
    console.log('🛑 Market Oracle stopped')
  }

  isActive(): boolean {
    return this.isRunning
  }

  getPredictions(): MarketPrediction[] {
    return this.predictions
  }

  clearHistory() {
    this.predictions = []
    this.saveToLocalStorage()
  }
}

// Singleton instance
let oracleInstance: MarketOracleAgent | null = null

export function getMarketOracle(): MarketOracleAgent {
  if (!oracleInstance) {
    oracleInstance = new MarketOracleAgent()
  }
  return oracleInstance
}

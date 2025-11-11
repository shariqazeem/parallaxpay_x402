'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { UnifiedNavbar } from '@/components/UnifiedNavbar'
import { CoinSelector } from '@/components/CoinSelector'
import { getMarketOracle, MarketPrediction, OraclePerformance } from '@/lib/market-oracle-agent'
import { useProvider } from '@/app/contexts/ProviderContext'
import { useX402Payment } from '@/app/hooks/useX402Payment'
import { TOTAL_SUPPORTED_COINS, getTopCoins, FEATURED_COINS } from '@/lib/crypto-database'
import toast from 'react-hot-toast'

export default function MarketOraclePageEnhanced() {
  const { publicKey } = useWallet()
  const { providers } = useProvider()
  const { fetchWithPayment, isWalletConnected, isReady } = useX402Payment()
  const [oracle] = useState(() => getMarketOracle())
  const [selectedCoin, setSelectedCoin] = useState('SOL')
  const [timeframe, setTimeframe] = useState<'5m' | '15m' | '1h' | '4h' | '24h'>('1h')
  const [isRunning, setIsRunning] = useState(false)
  const [performance, setPerformance] = useState<OraclePerformance | null>(null)
  const [latestPrediction, setLatestPrediction] = useState<MarketPrediction | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [showCostComparison, setShowCostComparison] = useState(false)

  const onlineProviders = providers.filter(p => p.online)
  const hasProviders = onlineProviders.length > 0

  // Load predictions for current wallet
  useEffect(() => {
    if (publicKey) {
      const walletAddress = publicKey.toBase58()
      console.log('💼 Loading predictions for wallet:', walletAddress)

      oracle.loadPredictionsForWallet(walletAddress).then(() => {
        // Restore autonomous asset and timeframe if they were set
        const autonomousAsset = oracle.getAutonomousAsset()
        const autonomousTimeframe = oracle.getAutonomousTimeframe()

        if (autonomousAsset && autonomousAsset !== 'SOL') {
          setSelectedCoin(autonomousAsset)
        }
        if (autonomousTimeframe && autonomousTimeframe !== '1h') {
          setTimeframe(autonomousTimeframe)
        }

        updatePerformance()

        console.log(`📍 Restored state: ${autonomousAsset} ${autonomousTimeframe}`)
      })
    }
  }, [publicKey, oracle])

  useEffect(() => {
    updatePerformance()
    const interval = setInterval(() => {
      updatePerformance()
      setIsRunning(oracle.isActive())
    }, 2000)
    return () => clearInterval(interval)
  }, [oracle])

  const updatePerformance = () => {
    const perf = oracle.getPerformance()
    setPerformance(perf)
    if (perf.predictions.length > 0) {
      setLatestPrediction(perf.predictions[0])
    }
  }

  const handleRunPrediction = async () => {
    if (!hasProviders) {
      toast.error('No providers available! Visit Marketplace first.')
      return
    }
    if (!isWalletConnected) {
      toast.error('Connect your Solana wallet for x402 payments!')
      return
    }
    if (!isReady) {
      toast.error('Payment client initializing...')
      return
    }

    setIsAnalyzing(true)
    try {
      const useMultiProvider = onlineProviders.length > 1
      const walletAddress = publicKey?.toBase58()
      const prediction = await oracle.runPrediction(selectedCoin, timeframe, useMultiProvider, fetchWithPayment, walletAddress)
      setLatestPrediction(prediction)
      updatePerformance()
      toast.success(`${selectedCoin} prediction complete!`)
    } catch (error) {
      console.error('Prediction failed:', error)
      toast.error(`Failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleStartAutonomous = () => {
    if (!hasProviders || !isWalletConnected || !isReady) {
      toast.error('Please connect wallet and ensure providers are available')
      return
    }
    const walletAddress = publicKey?.toBase58()
    // Pass the selected coin and timeframe to autonomous mode
    oracle.startAutonomousMode(selectedCoin, timeframe, 5, fetchWithPayment, walletAddress)
    setIsRunning(true)
    toast.success(`Autonomous mode started for ${selectedCoin} (${timeframe})!`)
  }

  const handleStopAutonomous = () => {
    oracle.stopAutonomousMode()
    setIsRunning(false)
    toast.success('Autonomous mode stopped')
  }

  const getTrustBadge = (trustLevel: string) => {
    const badges = {
      master: { emoji: '👑', color: 'from-yellow-400 to-orange-500', text: 'Master Oracle' },
      expert: { emoji: '🏆', color: 'from-purple-400 to-pink-500', text: 'Expert' },
      intermediate: { emoji: '⭐', color: 'from-blue-400 to-cyan-500', text: 'Intermediate' },
      novice: { emoji: '🌱', color: 'from-green-400 to-emerald-500', text: 'Novice' }
    }
    return badges[trustLevel as keyof typeof badges] || badges.novice
  }

  const badge = performance ? getTrustBadge(performance.trustLevel) : null

  // Calculate traditional API cost comparison
  const traditionalAPICost = 99 // $99/month for typical market data API
  const predictionsPerMonth = 8640 // Every 5 mins = 288/day * 30 days
  const x402CostPerMonth = performance ? (performance.avgCostPerPrediction * predictionsPerMonth) : 0
  const costSavings = traditionalAPICost - x402CostPerMonth
  const savingsPercentage = traditionalAPICost > 0 ? ((costSavings / traditionalAPICost) * 100) : 0

  return (
    <div className="min-h-screen bg-white">
      <UnifiedNavbar currentPage="oracle" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section with Coin Selector */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-5xl font-black text-black">AI Market Oracle</h1>
                <motion.div
                  animate={{ rotate: isRunning ? 360 : 0 }}
                  transition={{ duration: 2, repeat: isRunning ? Infinity : 0, ease: "linear" }}
                  className="text-4xl"
                >
                  🔮
                </motion.div>
              </div>
              <p className="text-xl text-gray-600">
                <strong>{TOTAL_SUPPORTED_COINS}+ cryptocurrencies</strong> • Gradient Parallax AI • x402 micropayments
              </p>
            </div>

            {/* Status Badge */}
            <div className={`px-6 py-3 rounded-2xl border-2 ${isRunning ? 'bg-green-50 border-green-400' : 'bg-gray-50 border-gray-300'}`}>
              <div className="flex items-center gap-3">
                <motion.div
                  animate={{ scale: isRunning ? [1, 1.2, 1] : 1 }}
                  transition={{ duration: 1, repeat: isRunning ? Infinity : 0 }}
                  className={`w-3 h-3 rounded-full ${isRunning ? 'bg-green-500' : 'bg-gray-400'}`}
                />
                <div>
                  <div className="text-xs font-bold text-gray-600 uppercase">Status</div>
                  <div className="text-lg font-black text-black">
                    {isRunning ? `Running (${selectedCoin})` : 'Idle'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hackathon Feature Banner */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 rounded-2xl p-6 text-white shadow-xl mb-6"
          >
            <div className="flex items-center gap-4">
              <div className="text-5xl">🏆</div>
              <div className="flex-1">
                <h3 className="text-2xl font-black mb-1">x402 Hackathon Demo Feature</h3>
                <p className="text-purple-100">
                  <strong className="text-white">{TOTAL_SUPPORTED_COINS}+ Cryptocurrencies Supported!</strong> Unlike traditional oracles limited to BTC/ETH/SOL, this Oracle covers the entire crypto market - from major coins to DeFi tokens, Layer 1s, Layer 2s, AI tokens, meme coins, and more. Powered by <strong className="text-white">Gradient Parallax</strong> multi-provider consensus + <strong className="text-white">x402 micropayments</strong>.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Coin Selection & Timeframe */}
          <div className="grid md:grid-cols-2 gap-6 mb-6">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Select Cryptocurrency ({TOTAL_SUPPORTED_COINS}+ supported)
              </label>
              <CoinSelector
                selectedCoin={selectedCoin}
                onSelectCoin={setSelectedCoin}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">
                Prediction Timeframe
              </label>
              <div className="flex gap-2">
                {(['5m', '15m', '1h', '4h', '24h'] as const).map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeframe(tf)}
                    className={`flex-1 px-4 py-3 rounded-xl font-bold transition-all ${
                      timeframe === tf
                        ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {tf}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Access Featured Coins */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <div className="text-sm font-bold text-gray-700 mb-2">Quick Access</div>
            <div className="flex flex-wrap gap-2">
              {FEATURED_COINS.map(coin => (
                <button
                  key={coin}
                  onClick={() => setSelectedCoin(coin)}
                  className={`px-4 py-2 rounded-lg font-bold transition-all ${
                    selectedCoin === coin
                      ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                      : 'bg-white border border-gray-300 text-gray-700 hover:border-purple-400'
                  }`}
                >
                  {coin}
                </button>
              ))}
            </div>
          </div>

          {/* Provider Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`mt-6 rounded-2xl p-6 border-2 ${hasProviders ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'} shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-black mb-1">
                  {hasProviders ? `${onlineProviders.length} Parallax Provider${onlineProviders.length !== 1 ? 's' : ''} Online` : 'No Providers Available'}
                </h3>
                <p className="text-sm text-gray-700">
                  {hasProviders
                    ? onlineProviders.length > 1
                      ? `Multi-provider consensus enabled • Distributed AI inference`
                      : 'Single provider mode'
                    : 'Visit Marketplace to enable Gradient Parallax providers'}
                </p>
              </div>
              <Link href="/marketplace">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-black text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all"
                >
                  {hasProviders ? 'Manage Providers' : 'Enable Providers'}
                </motion.button>
              </Link>
            </div>

            {hasProviders && (
              <div className="flex flex-wrap gap-2">
                {onlineProviders.map((provider, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-lg border border-gray-200">
                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                    <span className="text-sm font-semibold text-black">{provider.name}</span>
                    <span className="text-xs text-gray-500">{provider.latency}ms</span>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        </motion.div>

        {/* Control Panel */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRunPrediction}
            disabled={isAnalyzing || isRunning || !hasProviders || !isWalletConnected || !isReady}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <div className="text-4xl mb-3">{isAnalyzing ? '⏳' : '🎯'}</div>
            <div className="text-xl font-black mb-1">
              {isAnalyzing ? `Analyzing ${selectedCoin}...` : `Predict ${selectedCoin} Price`}
            </div>
            <div className="text-sm text-blue-100">
              {!isWalletConnected
                ? '⚠️ Connect wallet for x402 payments'
                : !isReady
                ? '⏳ Initializing...'
                : hasProviders
                ? `${timeframe} forecast • ${onlineProviders.length} provider${onlineProviders.length > 1 ? 's' : ''}`
                : 'Enable providers first'}
            </div>
          </motion.button>

          {!isRunning ? (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStartAutonomous}
              disabled={!hasProviders || !isWalletConnected || !isReady}
              className="bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="text-4xl mb-3">🚀</div>
              <div className="text-xl font-black mb-1">Start Autonomous</div>
              <div className="text-sm text-green-100">
                {!isWalletConnected
                  ? '⚠️ Connect wallet first'
                  : !isReady
                  ? '⏳ Initializing...'
                  : `Auto-track ${selectedCoin} every 5 min`}
              </div>
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleStopAutonomous}
              className="bg-gradient-to-r from-red-500 to-orange-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all"
            >
              <div className="text-4xl mb-3">🛑</div>
              <div className="text-xl font-black mb-1">Stop Autonomous</div>
              <div className="text-sm text-red-100">
                Currently tracking {selectedCoin}
              </div>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowCostComparison(!showCostComparison)}
            className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all"
          >
            <div className="text-4xl mb-3">💰</div>
            <div className="text-xl font-black mb-1">Cost Comparison</div>
            <div className="text-sm text-purple-100">
              x402 vs Traditional APIs
            </div>
          </motion.button>
        </div>

        {/* Cost Comparison Modal */}
        <AnimatePresence>
          {showCostComparison && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="mb-8 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-8 border-2 border-purple-300 shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-black text-black">💰 Cost Efficiency Analysis</h2>
                <button
                  onClick={() => setShowCostComparison(false)}
                  className="text-gray-500 hover:text-black text-2xl"
                >
                  ×
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-6 mb-6">
                <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
                  <div className="text-2xl mb-3">🏦</div>
                  <h3 className="text-xl font-black text-black mb-2">Traditional API</h3>
                  <div className="text-4xl font-black text-red-600 mb-2">${traditionalAPICost}/mo</div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    <li>✗ Fixed subscription cost</li>
                    <li>✗ Rate limits (often 100-1000 calls/day)</li>
                    <li>✗ Pay even when not using</li>
                    <li>✗ Single data source</li>
                    <li>✗ No AI insights included</li>
                  </ul>
                </div>

                <div className="bg-gradient-to-br from-green-100 to-emerald-100 rounded-xl p-6 border-2 border-green-300">
                  <div className="text-2xl mb-3">⚡</div>
                  <h3 className="text-xl font-black text-black mb-2">x402 Oracle (This)</h3>
                  <div className="text-4xl font-black text-green-600 mb-2">
                    ${x402CostPerMonth.toFixed(2)}/mo
                  </div>
                  <ul className="text-sm text-gray-700 space-y-1">
                    <li>✓ Pay-per-prediction micropayments</li>
                    <li>✓ Unlimited API calls</li>
                    <li>✓ Pay only for actual usage</li>
                    <li>✓ Multi-provider consensus (Parallax)</li>
                    <li>✓ AI-powered predictions included</li>
                  </ul>
                </div>
              </div>

              <div className="bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl p-6 text-white">
                <div className="flex items-center gap-4">
                  <div className="text-5xl">🎉</div>
                  <div>
                    <div className="text-3xl font-black mb-1">
                      Save ${costSavings.toFixed(2)}/month ({savingsPercentage.toFixed(1)}%)
                    </div>
                    <p className="text-green-100">
                      Based on {predictionsPerMonth.toLocaleString()} predictions/month (one every 5 minutes). With x402, you pay ~${(performance?.avgCostPerPrediction || 0.001).toFixed(4)} per prediction vs ${(traditionalAPICost / 1000).toFixed(2)} per prediction with traditional APIs.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center text-sm text-gray-600">
                💡 <strong>Perfect for AI Agents:</strong> No subscriptions, no API keys to manage, no rate limits. Just pay-as-you-go micropayments on Solana.
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Performance Stats */}
        {performance && (
          <div className="grid md:grid-cols-5 gap-4 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-6 border-2 border-gray-200 shadow-lg"
            >
              <div className="text-3xl mb-2">📊</div>
              <div className="text-4xl font-black text-black mb-1">
                {performance.totalPredictions}
              </div>
              <div className="text-sm text-gray-600 font-semibold">Total Predictions</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="bg-white rounded-2xl p-6 border-2 border-green-200 shadow-lg"
            >
              <div className="text-3xl mb-2">✅</div>
              <div className="text-4xl font-black text-green-600 mb-1">
                {performance.accuracy.toFixed(1)}%
              </div>
              <div className="text-sm text-gray-600 font-semibold">Accuracy Rate</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white rounded-2xl p-6 border-2 border-blue-200 shadow-lg"
            >
              <div className="text-3xl mb-2">💰</div>
              <div className="text-4xl font-black text-blue-600 mb-1">
                ${performance.totalCost.toFixed(4)}
              </div>
              <div className="text-sm text-gray-600 font-semibold">Total x402 Cost</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white rounded-2xl p-6 border-2 border-purple-200 shadow-lg"
            >
              <div className="text-3xl mb-2">⚡</div>
              <div className="text-4xl font-black text-purple-600 mb-1">
                ${(performance.avgCostPerPrediction * 1000).toFixed(2)}
              </div>
              <div className="text-sm text-gray-600 font-semibold">Per 1K predictions</div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className={`bg-gradient-to-br ${badge?.color} rounded-2xl p-6 border-2 border-yellow-300 shadow-lg`}
            >
              <div className="text-3xl mb-2">{badge?.emoji}</div>
              <div className="text-4xl font-black text-white mb-1">
                {performance.reputationScore}
              </div>
              <div className="text-sm text-white font-semibold">{badge?.text}</div>
            </motion.div>
          </div>
        )}

        {/* Latest Prediction Card */}
        <AnimatePresence mode="wait">
          {latestPrediction && (
            <motion.div
              key={latestPrediction.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="mb-8"
            >
              <h2 className="text-2xl font-black text-black mb-4">Latest Prediction</h2>
              <div className="bg-white rounded-2xl p-8 border-2 border-gray-200 shadow-xl">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Left Side - Prediction Details */}
                  <div>
                    <div className="flex items-center gap-3 mb-6">
                      <div className="text-6xl">
                        {latestPrediction.predictedDirection === 'up' ? '📈' :
                         latestPrediction.predictedDirection === 'down' ? '📉' : '➡️'}
                      </div>
                      <div>
                        <div className="text-sm text-gray-500 font-semibold">
                          {new Date(latestPrediction.timestamp).toLocaleString()}
                        </div>
                        <div className="text-4xl font-black text-black">
                          {latestPrediction.asset} Price Prediction
                        </div>
                        <div className="text-xl text-gray-600">
                          ${latestPrediction.currentPrice.toFixed(2)} → {latestPrediction.predictedDirection.toUpperCase()}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 font-semibold mb-1">Consensus Strength</div>
                        <div className="flex items-center gap-3">
                          <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                            <motion.div
                              initial={{ width: 0 }}
                              animate={{ width: `${latestPrediction.consensusStrength}%` }}
                              className="h-full bg-gradient-to-r from-green-500 to-emerald-500 rounded-full"
                            />
                          </div>
                          <div className="text-2xl font-black text-black">
                            {latestPrediction.consensusStrength.toFixed(0)}%
                          </div>
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 font-semibold mb-1">Confidence Level</div>
                        <div className="text-2xl font-black text-black">
                          {latestPrediction.confidence.toFixed(1)}%
                        </div>
                      </div>

                      <div className="bg-gray-50 rounded-xl p-4">
                        <div className="text-sm text-gray-600 font-semibold mb-2">AI Reasoning</div>
                        <div className="text-sm text-gray-700 leading-relaxed">
                          {latestPrediction.reasoning}
                        </div>
                      </div>

                      {latestPrediction.actualOutcome && (
                        <div className={`rounded-xl p-4 ${latestPrediction.accuracy ? 'bg-green-50 border-2 border-green-400' : 'bg-red-50 border-2 border-red-400'}`}>
                          <div className="flex items-center gap-3">
                            <div className="text-3xl">
                              {latestPrediction.accuracy ? '✅' : '❌'}
                            </div>
                            <div>
                              <div className="text-sm font-semibold text-gray-700">Actual Outcome</div>
                              <div className="text-xl font-black text-black">
                                {latestPrediction.accuracy ? 'CORRECT' : 'INCORRECT'} - Price went {latestPrediction.actualOutcome.toUpperCase()}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right Side - Parallax Multi-Provider Consensus */}
                  <div>
                    <h3 className="text-xl font-black text-black mb-4">
                      🤖 Gradient Parallax Consensus ({latestPrediction.providers.length} Providers)
                    </h3>
                    <div className="space-y-3">
                      {latestPrediction.providers.map((provider, idx) => (
                        <motion.div
                          key={idx}
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: idx * 0.1 }}
                          className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200"
                        >
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-bold text-black">{provider.name}</div>
                            <div className="flex items-center gap-2">
                              <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                provider.prediction === 'up' ? 'bg-green-100 text-green-700' :
                                provider.prediction === 'down' ? 'bg-red-100 text-red-700' :
                                'bg-gray-100 text-gray-700'
                              }`}>
                                {provider.prediction.toUpperCase()}
                              </span>
                              <span className="text-xs text-gray-500">
                                {provider.confidence}%
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-4 text-xs text-gray-600">
                            <span>⏱️ {provider.latency}ms</span>
                            <span>💰 ${provider.cost.toFixed(4)}</span>
                          </div>
                        </motion.div>
                      ))}
                    </div>

                    <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-4 border-2 border-blue-200">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="text-2xl">⚡</div>
                        <div className="text-sm text-blue-700 font-semibold">x402 Micropayment</div>
                      </div>
                      <div className="text-3xl font-black text-black mb-1">
                        ${latestPrediction.totalCost.toFixed(4)} total
                      </div>
                      <div className="text-xs text-gray-600">
                        Paid per inference • Transparent • On-chain • No subscription
                      </div>
                    </div>

                    <div className="mt-4 bg-purple-50 rounded-xl p-4 border border-purple-200">
                      <div className="text-xs text-gray-600 mb-2">
                        💡 <strong>Why This Matters for Hackathon:</strong>
                      </div>
                      <ul className="text-xs text-gray-700 space-y-1">
                        <li>• Distributed AI inference via Gradient Parallax</li>
                        <li>• Real micropayments on Solana (not simulated)</li>
                        <li>• Multi-provider consensus for accuracy</li>
                        <li>• Production-ready for any AI agent to query</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Prediction History */}
        {performance && performance.predictions.length > 1 && (
          <div>
            <h2 className="text-2xl font-black text-black mb-4">Prediction History</h2>
            <div className="space-y-3">
              {performance.predictions.slice(1, 11).map((pred, idx) => (
                <motion.div
                  key={pred.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.05 }}
                  className="bg-white rounded-xl p-4 border-2 border-gray-200 shadow-sm hover:shadow-lg transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-3xl">
                        {pred.predictedDirection === 'up' ? '📈' :
                         pred.predictedDirection === 'down' ? '📉' : '➡️'}
                      </div>
                      <div>
                        <div className="font-bold text-black">
                          {pred.asset} {pred.predictedDirection.toUpperCase()} - ${pred.currentPrice.toFixed(2)}
                        </div>
                        <div className="text-sm text-gray-600">
                          {new Date(pred.timestamp).toLocaleString()} • {pred.consensusStrength.toFixed(0)}% consensus
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      {pred.actualOutcome && (
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          pred.accuracy ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                        }`}>
                          {pred.accuracy ? '✓ CORRECT' : '✗ WRONG'}
                        </span>
                      )}
                      <span className="text-xs text-gray-500">${pred.totalCost.toFixed(4)}</span>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        )}

        {/* No Predictions Yet */}
        {(!performance || performance.predictions.length === 0) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-8xl mb-6">🔮</div>
            <h3 className="text-3xl font-black text-black mb-3">Ready to Predict {selectedCoin}?</h3>
            <p className="text-xl text-gray-600 mb-8">
              Run your first prediction or start autonomous mode to see the Oracle in action! Supports {TOTAL_SUPPORTED_COINS}+ cryptocurrencies.
            </p>
          </motion.div>
        )}

        {/* BUILD YOUR OWN CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 rounded-xl border-2 border-purple-200 shadow-lg"
        >
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🧠</div>
            <h3 className="text-2xl font-black text-black mb-2">
              Deploy Your Own Oracle
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              This Oracle is fully customizable. Deploy your own instance tracking different assets, timeframes, or strategies. Perfect for AI agent ecosystems!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">🎯</div>
              <div className="font-bold text-black text-sm mb-1">{TOTAL_SUPPORTED_COINS}+ Assets</div>
              <div className="text-xs text-gray-600">Track any cryptocurrency market</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">⚡</div>
              <div className="font-bold text-black text-sm mb-1">x402 Powered</div>
              <div className="text-xs text-gray-600">Pay-per-prediction micropayments</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">🤖</div>
              <div className="font-bold text-black text-sm mb-1">Agent-to-Agent</div>
              <div className="text-xs text-gray-600">Other agents can query your Oracle</div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/agents?tab=builder">
              <button className="bg-black text-white px-8 py-4 rounded-xl font-bold transition-all hover:bg-gray-800 hover:scale-105 shadow-lg">
                🚀 Deploy Custom Oracle
              </button>
            </Link>
            <Link href="/marketplace">
              <button className="bg-white text-black border-2 border-gray-300 px-8 py-4 rounded-xl font-bold transition-all hover:border-purple-400 hover:bg-purple-50">
                🏪 Manage Providers
              </button>
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

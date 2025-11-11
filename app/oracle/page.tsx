'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import Navbar from '@/app/components/Navbar'
import { getMarketOracle, MarketPrediction, OraclePerformance } from '@/lib/market-oracle-agent'
import { useProvider } from '@/app/contexts/ProviderContext'
import { useX402Payment } from '@/app/hooks/useX402Payment'

export default function MarketOraclePage() {
  const { publicKey } = useWallet()
  const { providers } = useProvider()
  const { fetchWithPayment, isWalletConnected, isReady } = useX402Payment()
  const [oracle] = useState(() => getMarketOracle())
  const [isRunning, setIsRunning] = useState(false)
  const [performance, setPerformance] = useState<OraclePerformance | null>(null)
  const [latestPrediction, setLatestPrediction] = useState<MarketPrediction | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const onlineProviders = providers.filter(p => p.online)
  const hasProviders = onlineProviders.length > 0

  useEffect(() => {
    // Load initial performance
    updatePerformance()

    // Update every 2 seconds
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
      alert('⚠️ No providers available! Please visit the Marketplace to enable providers first.')
      return
    }

    if (!isWalletConnected) {
      alert('⚠️ Please connect your Solana wallet to make x402 payments!')
      return
    }

    if (!isReady) {
      alert('⚠️ Payment client is initializing. Please wait a moment and try again.')
      return
    }

    setIsAnalyzing(true)
    try {
      const useMultiProvider = onlineProviders.length > 1
      const walletAddress = publicKey?.toBase58()

      // Pass fetchWithPayment for client-side wallet payments (Phantom confirmation) and wallet address
      const prediction = await oracle.runPrediction('SOL', '1h', useMultiProvider, fetchWithPayment, walletAddress)
      setLatestPrediction(prediction)
      updatePerformance()
    } catch (error) {
      console.error('Prediction failed:', error)
      alert(`Prediction failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleStartAutonomous = () => {
    if (!hasProviders) {
      alert('⚠️ No providers available! Please visit the Marketplace to enable providers first.')
      return
    }
    if (!isWalletConnected) {
      alert('⚠️ Please connect your Solana wallet first!')
      return
    }
    if (!isReady) {
      alert('⚠️ Payment client is initializing. Please wait a moment and try again.')
      return
    }
    // Autonomous mode uses client-side wallet payments
    const walletAddress = publicKey?.toBase58()
    oracle.startAutonomousMode(5, fetchWithPayment, walletAddress) // Run every 5 minutes
    setIsRunning(true)
  }

  const handleStopAutonomous = () => {
    oracle.stopAutonomousMode()
    setIsRunning(false)
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

  return (
    <div className="min-h-screen bg-white">
      <Navbar />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
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
                Autonomous AI agent powered by Parallax • x402 micropayments • {hasProviders ? (onlineProviders.length > 1 ? `${onlineProviders.length}-provider consensus` : 'Single provider') : 'Dynamic provider selection'}
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
                    {isRunning ? 'Running Autonomously' : 'Idle'}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Hackathon Banner */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl p-6 text-white shadow-xl"
          >
            <div className="flex items-center gap-4">
              <div className="text-5xl">🏆</div>
              <div>
                <h3 className="text-2xl font-black mb-1">x402 Solana Hackathon Entry</h3>
                <p className="text-purple-100">
                  <strong>Parallax Eco Track:</strong> Demonstrating autonomous AI agents with x402 micropayments,
                  multi-provider consensus, and verifiable reputation building.
                </p>
              </div>
            </div>
          </motion.div>

          {/* Provider Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className={`rounded-2xl p-6 border-2 ${hasProviders ? 'bg-green-50 border-green-300' : 'bg-red-50 border-red-300'} shadow-lg`}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-black text-black mb-1">
                  {hasProviders ? `${onlineProviders.length} Provider${onlineProviders.length !== 1 ? 's' : ''} Available` : 'No Providers Available'}
                </h3>
                <p className="text-sm text-gray-700">
                  {hasProviders
                    ? onlineProviders.length > 1
                      ? `Multi-provider consensus enabled (using all ${onlineProviders.length} providers)`
                      : 'Single provider mode (1 provider available)'
                    : 'Visit Marketplace to enable providers'}
                </p>
              </div>
              <Link href="/marketplace">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-black text-white px-4 py-2 rounded-xl font-bold text-sm hover:bg-gray-800 transition-all"
                >
                  {hasProviders ? 'View Providers' : 'Go to Marketplace'}
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
              {isAnalyzing ? 'Analyzing...' : 'Run Single Prediction'}
            </div>
            <div className="text-sm text-blue-100">
              {!isWalletConnected
                ? '⚠️ Connect wallet to pay with x402'
                : !isReady
                ? '⏳ Initializing payment client...'
                : hasProviders
                ? onlineProviders.length > 1
                  ? `Use all ${onlineProviders.length} providers • x402 payment`
                  : 'Use 1 provider • x402 payment'
                : 'No providers available'}
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
              <div className="text-xl font-black mb-1">Start Autonomous Mode</div>
              <div className="text-sm text-green-100">
                {!isWalletConnected
                  ? '⚠️ Connect wallet first'
                  : !isReady
                  ? '⏳ Initializing...'
                  : hasProviders
                  ? 'Run predictions every 5 min • x402 payments'
                  : 'Requires providers'}
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
              <div className="text-xl font-black mb-1">Stop Autonomous Mode</div>
              <div className="text-sm text-red-100">
                Agent is currently running
              </div>
            </motion.button>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              oracle.clearHistory()
              updatePerformance()
            }}
            className="bg-white border-2 border-gray-200 hover:border-gray-400 rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all"
          >
            <div className="text-4xl mb-3">🗑️</div>
            <div className="text-xl font-black text-black mb-1">Clear History</div>
            <div className="text-sm text-gray-600">
              Reset all predictions and stats
            </div>
          </motion.button>
        </div>

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
              <div className="text-sm text-gray-600 font-semibold">Total Cost (x402)</div>
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
              <div className="text-sm text-gray-600 font-semibold">Cost per 1K predictions</div>
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

                  {/* Right Side - Multi-Provider Consensus */}
                  <div>
                    <h3 className="text-xl font-black text-black mb-4">
                      Multi-Provider Consensus ({latestPrediction.providers.length} Parallax Providers)
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

                    <div className="mt-6 bg-blue-50 rounded-xl p-4 border-2 border-blue-200">
                      <div className="text-sm text-blue-700 font-semibold mb-1">x402 Micropayment</div>
                      <div className="text-2xl font-black text-black">
                        ${latestPrediction.totalCost.toFixed(4)} total
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        Paid per inference • Transparent • On-chain
                      </div>
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
            <h3 className="text-3xl font-black text-black mb-3">No Predictions Yet</h3>
            <p className="text-xl text-gray-600 mb-8">
              Run your first prediction or start autonomous mode to see the AI Market Oracle in action!
            </p>
          </motion.div>
        )}

        {/* BUILD YOUR OWN CTA - Ecosystem Connection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-12 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8 rounded-xl border-2 border-purple-200 shadow-lg"
        >
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🧠</div>
            <h3 className="text-2xl font-black text-black mb-2">
              Build Your Own AI Agent
            </h3>
            <p className="text-gray-600 max-w-2xl mx-auto">
              The Market Oracle is just one example. Create custom agents for your needs with our AI-powered builder - no coding required!
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">📊</div>
              <div className="font-bold text-black text-sm mb-1">Custom Analytics</div>
              <div className="text-xs text-gray-600">Track metrics that matter to you</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">⏰</div>
              <div className="font-bold text-black text-sm mb-1">Autonomous Execution</div>
              <div className="text-xs text-gray-600">Set it and forget it - runs 24/7</div>
            </div>
            <div className="bg-white p-4 rounded-lg border border-purple-200">
              <div className="text-2xl mb-2">💰</div>
              <div className="font-bold text-black text-sm mb-1">Micropayments</div>
              <div className="text-xs text-gray-600">Pay only for what you use</div>
            </div>
          </div>

          <div className="flex justify-center gap-4">
            <Link href="/agents?tab=builder">
              <button className="bg-black text-white px-8 py-4 rounded-xl font-bold transition-all hover:bg-gray-800 hover:scale-105 shadow-lg">
                🚀 Launch Agent Builder
              </button>
            </Link>
            <Link href="/marketplace">
              <button className="bg-white text-black border-2 border-gray-300 px-8 py-4 rounded-xl font-bold transition-all hover:border-purple-400 hover:bg-purple-50">
                🏪 View Cluster Status
              </button>
            </Link>
          </div>

          <div className="mt-4 text-center">
            <Link href="/analytics" className="text-purple-600 hover:text-purple-700 font-semibold text-sm">
              📈 Or view your cost analytics →
            </Link>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

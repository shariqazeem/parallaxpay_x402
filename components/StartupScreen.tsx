'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface StartupScreenProps {
  onComplete: () => void
}

export function StartupScreen({ onComplete }: StartupScreenProps) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])

  const initSteps = [
    { icon: '⚡', text: 'Initializing Parallax Cluster...', duration: 800 },
    { icon: '🔗', text: 'Connecting to Solana Network...', duration: 600 },
    { icon: '🤖', text: 'Loading AI Agent Framework...', duration: 700 },
    { icon: '💰', text: 'Configuring x402 Payments...', duration: 500 },
    { icon: '🌐', text: 'Discovering Provider Nodes...', duration: 600 },
    { icon: '✓', text: 'System Ready!', duration: 400 },
  ]

  useEffect(() => {
    const timer = setTimeout(() => {
      if (step < initSteps.length) {
        // Add log
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${initSteps[step].text}`])

        // Update progress
        setProgress(((step + 1) / initSteps.length) * 100)

        // Move to next step
        setTimeout(() => {
          setStep(step + 1)
        }, initSteps[step].duration)
      } else {
        // Complete after last step
        setTimeout(() => {
          onComplete()
        }, 500)
      }
    }, 100)

    return () => clearTimeout(timer)
  }, [step])

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center"
        style={{ backgroundColor: '#ffffff' }}
      >
        {/* Subtle animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />

        {/* Floating subtle circles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full bg-gradient-to-br from-purple-200 to-blue-200 opacity-20"
              style={{
                width: 100 + Math.random() * 200,
                height: 100 + Math.random() * 200,
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -30, 0],
                x: [0, 15, 0],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: 4 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-lg px-6">
          {/* Logo/Title */}
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <motion.div
              className="inline-block mb-4"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 20,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 flex items-center justify-center text-4xl shadow-xl">
                ⚡
              </div>
            </motion.div>
            <h1 className="text-5xl font-black text-black mb-2">
              ParallaxPay
            </h1>
            <p className="text-gray-600 text-lg">AI Agent Marketplace on Solana</p>
          </motion.div>

          {/* Current Step Display */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-3">
              <motion.div
                className="text-4xl"
                animate={{
                  scale: [1, 1.2, 1],
                }}
                transition={{
                  duration: 0.5,
                  repeat: step === initSteps.length - 1 ? 0 : Infinity,
                }}
              >
                {initSteps[step]?.icon}
              </motion.div>
            </div>
            <p className="text-lg font-semibold text-gray-800">
              {initSteps[step]?.text}
            </p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 shadow-lg"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-600">
              <span className="font-medium">Setting up your experience...</span>
              <span className="font-bold">{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Clean Status List */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="bg-white rounded-xl p-5 border-2 border-gray-200 shadow-lg space-y-2"
          >
            {logs.slice(-4).map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-center gap-3 text-sm"
              >
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                <span className="text-gray-700 font-medium">{log.split('] ')[1]}</span>
              </motion.div>
            ))}
          </motion.div>

          {/* Tech Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="mt-8 grid grid-cols-3 gap-3"
          >
            <div className="bg-white rounded-lg p-4 border-2 border-purple-200 shadow-sm text-center">
              <div className="text-purple-600 font-bold text-xl">3+</div>
              <div className="text-gray-600 text-xs font-medium mt-1">Nodes</div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-pink-200 shadow-sm text-center">
              <div className="text-pink-600 font-bold text-xl">~50ms</div>
              <div className="text-gray-600 text-xs font-medium mt-1">Latency</div>
            </div>
            <div className="bg-white rounded-lg p-4 border-2 border-blue-200 shadow-sm text-center">
              <div className="text-blue-600 font-bold text-xl">$0.001</div>
              <div className="text-gray-600 text-xs font-medium mt-1">Per Request</div>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </AnimatePresence>
  )
}

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
        className="fixed inset-0 z-[100] bg-black flex items-center justify-center"
      >
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-20">
          <div className="absolute inset-0" style={{
            backgroundImage: `
              linear-gradient(rgba(139, 92, 246, 0.2) 1px, transparent 1px),
              linear-gradient(90deg, rgba(139, 92, 246, 0.2) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px',
            animation: 'slideGrid 20s linear infinite'
          }} />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0 overflow-hidden">
          {[...Array(20)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-purple-500 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0
              }}
              animate={{
                y: [null, Math.random() * window.innerHeight],
                opacity: [0, 1, 0]
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random() * 2
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-2xl px-6">
          {/* Logo/Title */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <motion.h1
              className="text-6xl font-black mb-4"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #3B82F6 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundSize: '200% 200%',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%']
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              ParallaxPay
            </motion.h1>
            <p className="text-gray-400 text-lg">Decentralized AI Agent Marketplace</p>
          </motion.div>

          {/* Current Step Display */}
          <motion.div
            key={step}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="text-center mb-8"
          >
            <div className="flex items-center justify-center gap-3 mb-4">
              <motion.span
                className="text-5xl"
                animate={{ rotate: step === initSteps.length - 1 ? 0 : 360 }}
                transition={{ duration: 1, repeat: step === initSteps.length - 1 ? 0 : Infinity, ease: 'linear' }}
              >
                {initSteps[step]?.icon}
              </motion.span>
            </div>
            <motion.p
              className="text-2xl font-bold text-white mb-2"
              animate={{ opacity: [1, 0.7, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              {initSteps[step]?.text}
            </motion.p>
          </motion.div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-800 rounded-full overflow-hidden">
              <motion.div
                className="h-full bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3 }}
              />
            </div>
            <div className="flex justify-between mt-2 text-sm text-gray-500">
              <span>Initializing...</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Terminal/Logs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-gray-900 rounded-lg p-4 border border-gray-800 h-48 overflow-hidden"
          >
            <div className="font-mono text-xs text-green-400 space-y-1">
              {logs.map((log, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  {log}
                </motion.div>
              ))}
              {/* Blinking cursor */}
              {step < initSteps.length && (
                <motion.span
                  animate={{ opacity: [1, 0, 1] }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                  className="inline-block w-2 h-4 bg-green-400 ml-1"
                />
              )}
            </div>
          </motion.div>

          {/* Tech Stats */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-8 grid grid-cols-3 gap-4 text-center"
          >
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
              <div className="text-purple-400 font-bold text-lg">3+</div>
              <div className="text-gray-500 text-xs">Nodes</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
              <div className="text-pink-400 font-bold text-lg">~50ms</div>
              <div className="text-gray-500 text-xs">Latency</div>
            </div>
            <div className="bg-gray-900 rounded-lg p-3 border border-gray-800">
              <div className="text-blue-400 font-bold text-lg">$0.001</div>
              <div className="text-gray-500 text-xs">Per Request</div>
            </div>
          </motion.div>
        </div>

        <style jsx>{`
          @keyframes slideGrid {
            0% { transform: translate(0, 0); }
            100% { transform: translate(50px, 50px); }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  )
}

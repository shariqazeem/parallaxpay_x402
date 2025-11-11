'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

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
        transition={{ duration: 0.5 }}
        className="fixed inset-0 z-[9999] flex items-center justify-center overflow-hidden"
        style={{
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a0b2e 50%, #16213e 100%)'
        }}
      >
        {/* Animated Grid Background */}
        <div className="absolute inset-0 opacity-30">
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `
                linear-gradient(rgba(139, 92, 246, 0.3) 1px, transparent 1px),
                linear-gradient(90deg, rgba(139, 92, 246, 0.3) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
              animation: 'gridMove 20s linear infinite'
            }}
          />
        </div>

        {/* Glowing Orbs */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            className="absolute w-96 h-96 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(139, 92, 246, 0.4) 0%, transparent 70%)',
              top: '10%',
              left: '10%',
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut'
            }}
          />
          <motion.div
            className="absolute w-96 h-96 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(236, 72, 153, 0.4) 0%, transparent 70%)',
              bottom: '10%',
              right: '10%',
            }}
            animate={{
              scale: [1.2, 1, 1.2],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: 8,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 4
            }}
          />
        </div>

        {/* Floating Particles */}
        <div className="absolute inset-0">
          {[...Array(30)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-cyan-400 rounded-full"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -100],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 3,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 w-full max-w-2xl px-6">
          {/* Logo with Glowing Effect */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-center mb-8"
          >
            {/* Logo with Glowing Effect */}
            <motion.div
              className="inline-block mb-6 relative"
              animate={{
                rotate: [0, 360],
              }}
              transition={{
                duration: 30,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              <div className="relative w-28 h-28">
                {/* Outer glow */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-full blur-2xl opacity-75 animate-pulse" />
                {/* Logo container with white background */}
                <div className="relative w-28 h-28 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-2 border-cyan-400/30 overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="ParallaxPay Logo"
                    width={96}
                    height={96}
                    className="object-contain p-2"
                  />
                </div>
              </div>
            </motion.div>

            {/* Title with gradient and glow */}
            <motion.h1
              className="text-6xl md:text-7xl font-black mb-3 relative"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #06B6D4 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 40px rgba(139, 92, 246, 0.5)',
              }}
              animate={{
                backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear'
              }}
            >
              ParallaxPay
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-cyan-300 text-lg font-mono tracking-wider"
            >
              {'>'} Decentralized AI Agent Network
            </motion.p>
          </motion.div>

          {/* Terminal-style Status Display */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-8 bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 shadow-2xl"
          >
            {/* Current Step */}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-4"
            >
              <motion.div
                className="text-3xl"
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: step === initSteps.length - 1 ? 0 : [0, 5, -5, 0],
                }}
                transition={{
                  duration: 0.5,
                  repeat: step === initSteps.length - 1 ? 0 : Infinity,
                }}
              >
                {initSteps[step]?.icon}
              </motion.div>
              <div className="flex-1">
                <p className="text-white font-mono text-sm md:text-base">
                  {initSteps[step]?.text}
                </p>
              </div>
              <motion.div
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"
              />
            </motion.div>

            {/* Progress Bar */}
            <div className="relative">
              <div className="h-2 bg-gray-800 rounded-full overflow-hidden border border-purple-500/20">
                <motion.div
                  className="h-full relative"
                  style={{
                    background: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 50%, #06B6D4 100%)',
                    boxShadow: '0 0 10px rgba(139, 92, 246, 0.8)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {/* Animated shimmer */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </motion.div>
              </div>
              <div className="flex justify-between mt-3 text-xs font-mono">
                <span className="text-cyan-300">INITIALIZING SYSTEM...</span>
                <span className="text-pink-400 font-bold">{Math.round(progress)}%</span>
              </div>
            </div>
          </motion.div>

          {/* Recent Logs */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-black/30 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4 font-mono text-xs space-y-1.5 max-h-32 overflow-hidden"
          >
            {logs.slice(-4).map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-2"
              >
                <span className="text-cyan-400 shrink-0">{'>'}</span>
                <span className="text-gray-300">{log.split('] ')[1]}</span>
              </motion.div>
            ))}
            {/* Blinking cursor */}
            {step < initSteps.length && (
              <motion.div
                className="flex items-center gap-2"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <span className="text-cyan-400">{'>'}</span>
                <span className="inline-block w-2 h-3 bg-cyan-400 shadow-lg shadow-cyan-400/50" />
              </motion.div>
            )}
          </motion.div>

          {/* Network Stats */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-8 grid grid-cols-3 gap-3"
          >
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30 text-center">
              <div className="text-purple-400 font-bold text-xl font-mono">3+</div>
              <div className="text-gray-400 text-xs font-mono mt-1">NODES</div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-pink-500/30 text-center">
              <div className="text-pink-400 font-bold text-xl font-mono">~50ms</div>
              <div className="text-gray-400 text-xs font-mono mt-1">LATENCY</div>
            </div>
            <div className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30 text-center">
              <div className="text-cyan-400 font-bold text-xl font-mono">$0.001</div>
              <div className="text-gray-400 text-xs font-mono mt-1">PER REQ</div>
            </div>
          </motion.div>
        </div>

        <style jsx>{`
          @keyframes gridMove {
            0% { transform: translate(0, 0); }
            100% { transform: translate(60px, 60px); }
          }
        `}</style>
      </motion.div>
    </AnimatePresence>
  )
}

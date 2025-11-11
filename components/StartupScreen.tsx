'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'

interface StartupScreenProps {
  onComplete: () => void
}

const FEATURE_BANNERS = [
  {
    icon: '🌐',
    title: '152+ Cryptocurrencies',
    description: 'From Bitcoin to meme coins - comprehensive market coverage',
    gradient: 'from-purple-500 via-pink-500 to-rose-500',
    glow: 'rgba(139, 92, 246, 0.5)'
  },
  {
    icon: '🤝',
    title: 'Multi-Provider Consensus',
    description: 'Gradient Parallax distributed AI - no single point of failure',
    gradient: 'from-cyan-500 via-blue-500 to-purple-500',
    glow: 'rgba(6, 182, 212, 0.5)'
  },
  {
    icon: '💰',
    title: '92% Cost Savings',
    description: 'x402 micropayments: $0.0008/query vs $99/month subscriptions',
    gradient: 'from-green-500 via-emerald-500 to-teal-500',
    glow: 'rgba(16, 185, 129, 0.5)'
  },
  {
    icon: '🚀',
    title: 'Autonomous 24/7',
    description: 'AI agents that run, pay, and build reputation automatically',
    gradient: 'from-orange-500 via-red-500 to-pink-500',
    glow: 'rgba(249, 115, 22, 0.5)'
  },
  {
    icon: '🔗',
    title: 'Agent-to-Agent Economy',
    description: 'Built for the future of autonomous AI infrastructure',
    gradient: 'from-indigo-500 via-purple-500 to-pink-500',
    glow: 'rgba(99, 102, 241, 0.5)'
  },
]

export function StartupScreen({ onComplete }: StartupScreenProps) {
  const [step, setStep] = useState(0)
  const [progress, setProgress] = useState(0)
  const [logs, setLogs] = useState<string[]>([])
  const [featureBannerIndex, setFeatureBannerIndex] = useState(0)

  const initSteps = [
    { icon: '⚡', text: 'Initializing Parallax Cluster...', duration: 800 },
    { icon: '🔗', text: 'Connecting to Solana Network...', duration: 600 },
    { icon: '🤖', text: 'Loading AI Agent Framework...', duration: 700 },
    { icon: '💰', text: 'Configuring x402 Payments...', duration: 500 },
    { icon: '🌐', text: 'Discovering Provider Nodes...', duration: 600 },
    { icon: '✓', text: 'System Ready!', duration: 400 },
  ]

  // Rotate feature banners
  useEffect(() => {
    const bannerInterval = setInterval(() => {
      setFeatureBannerIndex((prev) => (prev + 1) % FEATURE_BANNERS.length)
    }, 2500)
    return () => clearInterval(bannerInterval)
  }, [])

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

  const currentFeature = FEATURE_BANNERS[featureBannerIndex]

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
          <motion.div
            className="absolute w-96 h-96 rounded-full blur-3xl"
            style={{
              background: 'radial-gradient(circle, rgba(6, 182, 212, 0.3) 0%, transparent 70%)',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)'
            }}
            animate={{
              scale: [1, 1.3, 1],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: 'easeInOut',
              delay: 2
            }}
          />
        </div>

        {/* Floating Particles - More and Varied */}
        <div className="absolute inset-0">
          {[...Array(50)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full"
              style={{
                width: Math.random() > 0.7 ? '2px' : '1px',
                height: Math.random() > 0.7 ? '2px' : '1px',
                backgroundColor: i % 3 === 0 ? '#06B6D4' : i % 3 === 1 ? '#8B5CF6' : '#EC4899',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [-20, -150],
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 3 + Math.random() * 4,
                repeat: Infinity,
                delay: Math.random() * 5,
                ease: 'easeOut'
              }}
            />
          ))}
        </div>

        {/* Neural Network Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20 pointer-events-none">
          {[...Array(8)].map((_, i) => (
            <motion.line
              key={i}
              x1={`${10 + i * 12}%`}
              y1="0%"
              x2={`${90 - i * 8}%`}
              y2="100%"
              stroke="url(#gradient)"
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{ pathLength: 1, opacity: 0.3 }}
              transition={{
                duration: 2,
                delay: i * 0.2,
                repeat: Infinity,
                repeatType: 'reverse',
                ease: 'easeInOut'
              }}
            />
          ))}
          <defs>
            <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5CF6" />
              <stop offset="50%" stopColor="#EC4899" />
              <stop offset="100%" stopColor="#06B6D4" />
            </linearGradient>
          </defs>
        </svg>

        {/* Main Content Container */}
        <div className="relative z-10 w-full max-w-4xl px-6">
          {/* Logo with Enhanced Glowing Effect */}
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.8, type: "spring" }}
            className="text-center mb-8"
          >
            {/* Logo with 3D Effect */}
            <motion.div
              className="inline-block mb-6 relative"
              animate={{
                rotateY: [0, 360],
              }}
              transition={{
                duration: 25,
                repeat: Infinity,
                ease: 'linear'
              }}
              style={{ transformStyle: 'preserve-3d' }}
            >
              <div className="relative w-32 h-32">
                {/* Multiple glow layers */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500 via-pink-500 to-cyan-500 rounded-full blur-3xl opacity-75 animate-pulse" />
                <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500 via-blue-500 to-purple-500 rounded-full blur-2xl opacity-60"
                  style={{ animation: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite' }}
                />
                {/* Logo container */}
                <div className="relative w-32 h-32 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center shadow-2xl border-2 border-cyan-400/30 overflow-hidden">
                  <Image
                    src="/logo.png"
                    alt="ParallaxPay Logo"
                    width={112}
                    height={112}
                    className="object-contain p-2"
                  />
                  {/* Scanning line effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/50 to-transparent"
                    animate={{
                      y: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </div>
              </div>
            </motion.div>

            {/* Title with Enhanced Gradient and Glow */}
            <motion.h1
              className="text-7xl md:text-8xl font-black mb-3 relative"
              style={{
                background: 'linear-gradient(135deg, #8B5CF6 0%, #EC4899 50%, #06B6D4 100%)',
                backgroundSize: '200% 200%',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                textShadow: '0 0 60px rgba(139, 92, 246, 0.7), 0 0 30px rgba(236, 72, 153, 0.5)',
                filter: 'drop-shadow(0 0 20px rgba(139, 92, 246, 0.5))'
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
              className="text-cyan-300 text-xl font-mono tracking-wider flex items-center justify-center gap-2"
            >
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                {'>>>'}
              </motion.span>
              <span>Autonomous AI Agent Network</span>
              <motion.span
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 1.5, repeat: Infinity, delay: 0.75 }}
              >
                {'<<<'}
              </motion.span>
            </motion.p>
          </motion.div>

          {/* Feature Banner Carousel */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-6 relative h-32 overflow-hidden"
          >
            <AnimatePresence mode="wait">
              <motion.div
                key={featureBannerIndex}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -50, scale: 0.9 }}
                transition={{ duration: 0.5, type: 'spring', bounce: 0.4 }}
                className="absolute inset-0"
              >
                <div
                  className="relative h-full bg-gradient-to-br backdrop-blur-xl rounded-2xl border-2 p-6 overflow-hidden group"
                  style={{
                    background: `linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.2) 100%)`,
                    borderColor: currentFeature.glow,
                    boxShadow: `0 0 40px ${currentFeature.glow}, inset 0 0 20px ${currentFeature.glow}`
                  }}
                >
                  {/* Animated background gradient */}
                  <motion.div
                    className={`absolute inset-0 bg-gradient-to-r ${currentFeature.gradient} opacity-20`}
                    animate={{
                      scale: [1, 1.1, 1],
                      opacity: [0.2, 0.3, 0.2]
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'easeInOut'
                    }}
                  />

                  <div className="relative z-10 flex items-center gap-6 h-full">
                    {/* Icon */}
                    <motion.div
                      className="text-6xl"
                      animate={{
                        rotate: [0, 10, -10, 0],
                        scale: [1, 1.1, 1]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: 'easeInOut'
                      }}
                    >
                      {currentFeature.icon}
                    </motion.div>

                    {/* Text */}
                    <div className="flex-1">
                      <h3 className={`text-3xl font-black mb-2 bg-gradient-to-r ${currentFeature.gradient} bg-clip-text text-transparent`}>
                        {currentFeature.title}
                      </h3>
                      <p className="text-gray-300 text-sm font-medium">
                        {currentFeature.description}
                      </p>
                    </div>

                    {/* Indicator Dots */}
                    <div className="flex flex-col gap-2">
                      {FEATURE_BANNERS.map((_, i) => (
                        <motion.div
                          key={i}
                          className={`w-2 h-2 rounded-full transition-all ${
                            i === featureBannerIndex
                              ? 'bg-gradient-to-r from-cyan-400 to-purple-500 w-8'
                              : 'bg-gray-600'
                          }`}
                          animate={i === featureBannerIndex ? {
                            boxShadow: ['0 0 5px rgba(6, 182, 212, 0.5)', '0 0 15px rgba(139, 92, 246, 0.8)', '0 0 5px rgba(6, 182, 212, 0.5)']
                          } : {}}
                          transition={{ duration: 1, repeat: Infinity }}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Shimmer effect */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
                    animate={{
                      x: ['-200%', '200%'],
                    }}
                    transition={{
                      duration: 3,
                      repeat: Infinity,
                      ease: 'linear',
                      repeatDelay: 1
                    }}
                  />
                </div>
              </motion.div>
            </AnimatePresence>
          </motion.div>

          {/* Terminal-style Status Display - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-6 bg-black/40 backdrop-blur-xl rounded-2xl border border-purple-500/30 p-6 shadow-2xl relative overflow-hidden"
          >
            {/* Scanning line effect */}
            <motion.div
              className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
              animate={{
                y: [0, 200],
                opacity: [0.5, 0.8, 0.5]
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: 'linear'
              }}
            />

            {/* Current Step */}
            <motion.div
              key={step}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-4 mb-4 relative z-10"
            >
              <motion.div
                className="text-4xl"
                animate={{
                  scale: [1, 1.2, 1],
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
                <p className="text-white font-mono text-base md:text-lg font-medium">
                  {initSteps[step]?.text}
                </p>
              </div>
              <motion.div
                animate={{
                  opacity: [1, 0.3, 1],
                  scale: [1, 1.2, 1]
                }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-3 h-3 bg-cyan-400 rounded-full shadow-lg"
                style={{ boxShadow: '0 0 20px rgba(6, 182, 212, 0.8)' }}
              />
            </motion.div>

            {/* Progress Bar - Enhanced */}
            <div className="relative">
              <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-purple-500/20 relative">
                <motion.div
                  className="h-full relative"
                  style={{
                    background: 'linear-gradient(90deg, #8B5CF6 0%, #EC4899 50%, #06B6D4 100%)',
                    boxShadow: '0 0 20px rgba(139, 92, 246, 0.8)'
                  }}
                  initial={{ width: 0 }}
                  animate={{ width: `${progress}%` }}
                  transition={{ duration: 0.3, ease: 'easeOut' }}
                >
                  {/* Multiple shimmer effects */}
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 1,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                  <motion.div
                    className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-300/30 to-transparent"
                    animate={{
                      x: ['-100%', '200%'],
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      ease: 'linear',
                      delay: 0.3
                    }}
                  />
                </motion.div>

                {/* Progress indicator dot */}
                <motion.div
                  className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg"
                  style={{
                    left: `${progress}%`,
                    boxShadow: '0 0 15px rgba(255, 255, 255, 0.8)'
                  }}
                  animate={{
                    scale: [1, 1.3, 1],
                  }}
                  transition={{
                    duration: 0.8,
                    repeat: Infinity,
                    ease: 'easeInOut'
                  }}
                />
              </div>
              <div className="flex justify-between mt-3 text-sm font-mono">
                <motion.span
                  className="text-cyan-300 font-bold"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{ duration: 2, repeat: Infinity }}
                >
                  INITIALIZING SYSTEM...
                </motion.span>
                <motion.span
                  className="text-pink-400 font-black text-lg"
                  key={progress}
                  initial={{ scale: 1.3 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', bounce: 0.5 }}
                >
                  {Math.round(progress)}%
                </motion.span>
              </div>
            </div>
          </motion.div>

          {/* System Logs - Enhanced */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="bg-black/30 backdrop-blur-sm rounded-xl border border-cyan-500/20 p-4 font-mono text-xs space-y-1.5 max-h-28 overflow-hidden relative"
          >
            <div className="absolute top-2 right-2 flex gap-1.5">
              <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse" style={{ animationDelay: '0.2s' }} />
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" style={{ animationDelay: '0.4s' }} />
            </div>

            {logs.slice(-4).map((log, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                className="flex items-start gap-2"
              >
                <span className="text-cyan-400 shrink-0 font-bold">{'>'}</span>
                <span className="text-gray-300">{log.split('] ')[1]}</span>
              </motion.div>
            ))}
            {/* Enhanced blinking cursor */}
            {step < initSteps.length && (
              <motion.div
                className="flex items-center gap-2"
                animate={{ opacity: [1, 0.3, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              >
                <span className="text-cyan-400 font-bold">{'>'}</span>
                <motion.span
                  className="inline-block w-2 h-3 bg-cyan-400"
                  style={{ boxShadow: '0 0 10px rgba(6, 182, 212, 0.8)' }}
                  animate={{ scaleX: [1, 0.5, 1] }}
                  transition={{ duration: 0.6, repeat: Infinity }}
                />
              </motion.div>
            )}
          </motion.div>

          {/* Network Stats - Enhanced */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="mt-6 grid grid-cols-4 gap-3"
          >
            <motion.div
              className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-purple-500/30 text-center relative overflow-hidden group"
              whileHover={{ scale: 1.05, borderColor: 'rgba(139, 92, 246, 0.6)' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <motion.div
                className="text-purple-400 font-black text-2xl font-mono relative z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0 }}
              >
                152+
              </motion.div>
              <div className="text-gray-400 text-xs font-mono mt-1 relative z-10">COINS</div>
            </motion.div>

            <motion.div
              className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-pink-500/30 text-center relative overflow-hidden group"
              whileHover={{ scale: 1.05, borderColor: 'rgba(236, 72, 153, 0.6)' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-pink-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <motion.div
                className="text-pink-400 font-black text-2xl font-mono relative z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
              >
                3-5
              </motion.div>
              <div className="text-gray-400 text-xs font-mono mt-1 relative z-10">NODES</div>
            </motion.div>

            <motion.div
              className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-cyan-500/30 text-center relative overflow-hidden group"
              whileHover={{ scale: 1.05, borderColor: 'rgba(6, 182, 212, 0.6)' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <motion.div
                className="text-cyan-400 font-black text-2xl font-mono relative z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1 }}
              >
                ~50ms
              </motion.div>
              <div className="text-gray-400 text-xs font-mono mt-1 relative z-10">LATENCY</div>
            </motion.div>

            <motion.div
              className="bg-black/40 backdrop-blur-sm rounded-lg p-3 border border-green-500/30 text-center relative overflow-hidden group"
              whileHover={{ scale: 1.05, borderColor: 'rgba(16, 185, 129, 0.6)' }}
            >
              <motion.div
                className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <motion.div
                className="text-green-400 font-black text-2xl font-mono relative z-10"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
              >
                92%
              </motion.div>
              <div className="text-gray-400 text-xs font-mono mt-1 relative z-10">SAVINGS</div>
            </motion.div>
          </motion.div>

          {/* Powered By Footer */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1 }}
            className="mt-6 text-center"
          >
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-black/30 backdrop-blur-sm rounded-full border border-purple-500/20">
              <motion.span
                className="text-purple-400 text-xs font-mono font-bold"
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 3, repeat: Infinity }}
              >
                POWERED BY
              </motion.span>
              <span className="text-white text-sm font-bold">Gradient Parallax</span>
              <span className="text-gray-500">•</span>
              <span className="text-white text-sm font-bold">x402</span>
              <span className="text-gray-500">•</span>
              <span className="text-white text-sm font-bold">Solana</span>
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

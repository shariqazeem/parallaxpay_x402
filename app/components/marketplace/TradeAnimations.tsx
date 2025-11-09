'use client'

/**
 * TRADE ANIMATIONS - BEAST MODE 🔥
 *
 * Features:
 * - Particle explosion effects on trade execution
 * - Flash animations
 * - Trade flow visualization
 * - Sound effects (optional)
 * - Confetti for large trades
 */

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getEnhancedOrderBook, type Trade } from '@/lib/enhanced-order-book'

interface TradeNotification {
  id: string
  trade: Trade
  timestamp: number
}

interface Particle {
  id: string
  x: number
  y: number
  color: string
  size: number
  velocityX: number
  velocityY: number
}

export default function TradeAnimations() {
  const [notifications, setNotifications] = useState<TradeNotification[]>([])
  const [particles, setParticles] = useState<Particle[]>([])
  const [flashEffect, setFlashEffect] = useState(false)

  useEffect(() => {
    const orderBook = getEnhancedOrderBook()

    const handleTradeExecuted = (trade: Trade) => {
      // Add notification
      const notification: TradeNotification = {
        id: trade.id,
        trade,
        timestamp: Date.now(),
      }

      setNotifications((prev) => [...prev, notification])

      // Remove notification after 5 seconds
      setTimeout(() => {
        setNotifications((prev) => prev.filter((n) => n.id !== notification.id))
      }, 5000)

      // Trigger flash effect
      setFlashEffect(true)
      setTimeout(() => setFlashEffect(false), 200)

      // Create particle explosion
      createParticleExplosion(trade.amount)

      // Play sound effect (optional - commented out for now)
      // playTradeSound()

      console.log('🎉 TRADE ANIMATION TRIGGERED:', trade)
    }

    orderBook.on('tradeExecuted', handleTradeExecuted)

    return () => {
      orderBook.off('tradeExecuted', handleTradeExecuted)
    }
  }, [])

  const createParticleExplosion = (tradeAmount: number) => {
    const particleCount = Math.min(Math.floor(tradeAmount / 1000), 50) // Max 50 particles
    const newParticles: Particle[] = []

    for (let i = 0; i < particleCount; i++) {
      const angle = (Math.PI * 2 * i) / particleCount
      const velocity = 2 + Math.random() * 3
      const colors = ['#14F195', '#9945FF', '#FFD700', '#00FFFF', '#FF1493']

      newParticles.push({
        id: `particle-${Date.now()}-${i}`,
        x: 50, // Center
        y: 50, // Center
        color: colors[Math.floor(Math.random() * colors.length)],
        size: 4 + Math.random() * 8,
        velocityX: Math.cos(angle) * velocity,
        velocityY: Math.sin(angle) * velocity,
      })
    }

    setParticles(newParticles)

    // Clear particles after animation
    setTimeout(() => setParticles([]), 2000)
  }

  return (
    <>
      {/* Flash Effect Overlay */}
      <AnimatePresence>
        {flashEffect && (
          <motion.div
            className="fixed inset-0 pointer-events-none z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'radial-gradient(circle, rgba(20,241,149,0.3) 0%, rgba(153,69,255,0.1) 50%, transparent 100%)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Particle Effects Container */}
      <div className="fixed inset-0 pointer-events-none z-40 flex items-center justify-center">
        <AnimatePresence>
          {particles.map((particle) => (
            <motion.div
              key={particle.id}
              className="absolute rounded-full"
              style={{
                width: particle.size,
                height: particle.size,
                backgroundColor: particle.color,
                boxShadow: `0 0 ${particle.size * 2}px ${particle.color}`,
              }}
              initial={{
                x: 0,
                y: 0,
                scale: 1,
                opacity: 1,
              }}
              animate={{
                x: particle.velocityX * 100,
                y: particle.velocityY * 100,
                scale: 0,
                opacity: 0,
              }}
              transition={{
                duration: 2,
                ease: 'easeOut',
              }}
            />
          ))}
        </AnimatePresence>
      </div>

      {/* Trade Notifications */}
      <div className="fixed top-20 right-6 z-50 space-y-2 max-w-sm">
        <AnimatePresence>
          {notifications.map((notification) => (
            <TradeNotificationCard
              key={notification.id}
              notification={notification}
            />
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}

// Trade Notification Card
function TradeNotificationCard({ notification }: { notification: TradeNotification }) {
  const { trade } = notification
  const isLargeTrade = trade.amount > 50000

  return (
    <motion.div
      className="glass-hover p-4 rounded-xl border-2 border-accent-primary/50 shadow-2xl backdrop-blur-xl"
      initial={{ opacity: 0, x: 100, scale: 0.8 }}
      animate={{
        opacity: 1,
        x: 0,
        scale: 1,
      }}
      exit={{
        opacity: 0,
        x: 100,
        scale: 0.8,
      }}
      transition={{
        type: 'spring',
        stiffness: 300,
        damping: 25,
      }}
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-2">
        <motion.div
          className="text-2xl"
          animate={{
            rotate: [0, 10, -10, 10, 0],
            scale: [1, 1.2, 1],
          }}
          transition={{
            duration: 0.5,
            repeat: 2,
          }}
        >
          {isLargeTrade ? '🎉' : '✅'}
        </motion.div>
        <div>
          <div className="text-sm font-heading font-bold text-white">
            {isLargeTrade ? 'LARGE TRADE EXECUTED!' : 'Trade Executed'}
          </div>
          <div className="text-xs text-text-muted">
            {new Date(trade.timestamp).toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Trade Details */}
      <div className="space-y-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Amount</span>
          <span className="text-white font-mono font-bold">
            {trade.amount.toLocaleString()} tokens
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Price</span>
          <span className="text-accent-secondary font-mono font-bold">
            {trade.price.toFixed(6)} SOL
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-text-secondary">Total</span>
          <span className="text-status-success font-heading font-bold">
            {(trade.price * trade.amount).toFixed(4)} SOL
          </span>
        </div>
      </div>

      {/* Buyer/Seller */}
      <div className="mt-3 pt-3 border-t border-border/50">
        <div className="flex items-center justify-between text-xs">
          <div>
            <div className="text-text-muted">Buyer</div>
            <div className="text-white font-mono">{trade.buyerId.substring(0, 8)}...</div>
          </div>
          <div className="text-accent-primary">→</div>
          <div>
            <div className="text-text-muted">Seller</div>
            <div className="text-white font-mono">{trade.sellerId.substring(0, 8)}...</div>
          </div>
        </div>
      </div>

      {/* Large Trade Indicator */}
      {isLargeTrade && (
        <motion.div
          className="mt-2 py-1 px-3 bg-status-success/20 rounded-lg text-center"
          animate={{
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
          }}
        >
          <span className="text-xs font-bold text-status-success">
            🔥 WHALE ALERT 🔥
          </span>
        </motion.div>
      )}
    </motion.div>
  )
}

// Optional: Sound effect function
function playTradeSound() {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    const oscillator = audioContext.createOscillator()
    const gainNode = audioContext.createGain()

    oscillator.connect(gainNode)
    gainNode.connect(audioContext.destination)

    oscillator.frequency.value = 800
    oscillator.type = 'sine'

    gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2)

    oscillator.start(audioContext.currentTime)
    oscillator.stop(audioContext.currentTime + 0.2)
  } catch (err) {
    // Sound not supported or user hasn't interacted with page yet
    console.log('Sound effect not played:', err)
  }
}

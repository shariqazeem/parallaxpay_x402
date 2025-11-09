'use client'

/**
 * Streaming Message Component
 *
 * Shows AI response streaming in character-by-character with real-time cost meter
 */

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface StreamingMessageProps {
  fullContent: string
  tokens: number
  cost: number
  latency: number
  onComplete?: () => void
}

export default function StreamingMessage({
  fullContent,
  tokens,
  cost,
  latency,
  onComplete,
}: StreamingMessageProps) {
  const [displayedContent, setDisplayedContent] = useState('')
  const [currentTokens, setCurrentTokens] = useState(0)
  const [currentCost, setCurrentCost] = useState(0)
  const [isComplete, setIsComplete] = useState(false)

  useEffect(() => {
    let currentIndex = 0
    const totalChars = fullContent.length
    const charsPerToken = Math.max(1, totalChars / tokens)

    // Stream characters at ~50 chars/second
    const streamInterval = setInterval(() => {
      if (currentIndex < totalChars) {
        // Add next character
        currentIndex++
        setDisplayedContent(fullContent.substring(0, currentIndex))

        // Update token count and cost proportionally
        const progress = currentIndex / totalChars
        setCurrentTokens(Math.floor(tokens * progress))
        setCurrentCost(cost * progress)
      } else {
        // Streaming complete
        clearInterval(streamInterval)
        setIsComplete(true)
        setCurrentTokens(tokens)
        setCurrentCost(cost)
        onComplete?.()
      }
    }, 20) // 50 chars/second = 20ms per char

    return () => clearInterval(streamInterval)
  }, [fullContent, tokens, cost, onComplete])

  const tokenProgress = (currentTokens / tokens) * 100
  const costPerToken = cost / tokens

  return (
    <motion.div
      className="flex justify-start"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <div className="max-w-[80%] glass border border-border p-4 rounded-xl">
        {/* Header */}
        <div className="flex items-start gap-3 mb-2">
          <div className="text-2xl">🤖</div>
          <div className="flex-1">
            <div className="font-heading font-bold text-white mb-1">
              Parallax AI
              {!isComplete && (
                <span className="ml-2 text-xs px-2 py-1 rounded bg-accent-primary/20 text-accent-primary animate-pulse">
                  STREAMING
                </span>
              )}
            </div>

            {/* Streaming content */}
            <div className="text-white whitespace-pre-wrap">
              {displayedContent}
              {!isComplete && (
                <motion.span
                  className="inline-block w-2 h-4 ml-1 bg-accent-primary"
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                />
              )}
            </div>
          </div>
        </div>

        {/* Real-time cost meter */}
        <div className="mt-4 p-3 rounded-lg bg-background-secondary border border-border-hover">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-text-muted">Token Usage</span>
            <span className="text-xs font-mono font-bold text-accent-secondary">
              {currentTokens} / {tokens}
            </span>
          </div>

          {/* Progress bar */}
          <div className="h-2 bg-background-tertiary rounded-full overflow-hidden mb-2">
            <motion.div
              className="h-full bg-gradient-to-r from-accent-primary to-accent-secondary"
              initial={{ width: 0 }}
              animate={{ width: `${tokenProgress}%` }}
              transition={{ duration: 0.1 }}
            />
          </div>

          {/* Real-time cost */}
          <div className="flex items-center justify-between">
            <span className="text-xs text-text-muted">
              Cost: <span className="font-mono text-white">${costPerToken.toFixed(6)}</span>/token
            </span>
            <span className="text-lg font-black text-status-success">
              ${currentCost.toFixed(5)}
            </span>
          </div>
        </div>

        {/* Final metadata (only show when complete) */}
        {isComplete && (
          <motion.div
            className="mt-3 pt-3 border-t border-border-hover flex flex-wrap gap-4 text-xs"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
          >
            <div className="flex items-center gap-1">
              <span className="text-text-muted">Tokens:</span>
              <span className="text-accent-secondary font-mono font-bold">
                {tokens}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-text-muted">Latency:</span>
              <span className="text-accent-tertiary font-mono font-bold">
                {latency}ms
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-text-muted">Total Cost:</span>
              <span className="text-status-success font-mono font-bold">
                ${cost.toFixed(5)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-text-muted">Speed:</span>
              <span className="text-white font-mono font-bold">
                {Math.round(tokens / (latency / 1000))} tokens/sec
              </span>
            </div>
          </motion.div>
        )}

        {/* Timestamp */}
        <div className="mt-2 text-xs text-text-muted">
          {new Date().toLocaleTimeString()}
        </div>
      </div>
    </motion.div>
  )
}

/**
 * Cost Meter Component - Can be used standalone
 */
export function CostMeter({
  currentTokens,
  maxTokens,
  currentCost,
  estimatedTotalCost,
}: {
  currentTokens: number
  maxTokens: number
  currentCost: number
  estimatedTotalCost: number
}) {
  const progress = (currentTokens / maxTokens) * 100

  return (
    <div className="glass rounded-xl p-4 border border-border">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-heading font-bold text-white">
          💰 Live Cost Meter
        </h3>
        <div className="text-right">
          <div className="text-2xl font-black text-status-success">
            ${currentCost.toFixed(5)}
          </div>
          <div className="text-xs text-text-muted">
            / ${estimatedTotalCost.toFixed(5)}
          </div>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <div className="h-3 bg-background-tertiary rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-status-success to-accent-primary"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </div>

      {/* Token count */}
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">
          {currentTokens.toLocaleString()} / {maxTokens.toLocaleString()} tokens
        </span>
        <span className="text-accent-secondary font-bold">
          {progress.toFixed(1)}%
        </span>
      </div>
    </div>
  )
}

/**
 * Payment Animation Component
 */
export function PaymentAnimation({ amount, provider }: { amount: number; provider: string }) {
  return (
    <motion.div
      className="glass border border-accent-primary/30 rounded-xl p-4 mb-4"
      initial={{ opacity: 0, scale: 0.95, y: -10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: 10 }}
    >
      <div className="flex items-center gap-4">
        {/* Icon */}
        <motion.div
          className="text-4xl"
          animate={{
            rotate: [0, -10, 10, -10, 0],
            scale: [1, 1.1, 1]
          }}
          transition={{ duration: 0.6 }}
        >
          💸
        </motion.div>

        {/* Content */}
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <motion.div
              className="w-2 h-2 rounded-full bg-status-success"
              animate={{ opacity: [1, 0.3, 1] }}
              transition={{ duration: 1, repeat: Infinity }}
            />
            <span className="text-sm font-heading font-bold text-white">
              Processing Payment
            </span>
          </div>
          <div className="text-xs text-text-secondary">
            Sending <span className="font-mono text-accent-primary font-bold">${amount.toFixed(5)}</span> to {provider}
          </div>
        </div>

        {/* Animated bars */}
        <div className="flex items-center gap-1">
          {[0, 0.1, 0.2, 0.3].map((delay, i) => (
            <motion.div
              key={i}
              className="w-1 bg-accent-primary rounded-full"
              animate={{ height: [8, 20, 8] }}
              transition={{
                duration: 0.6,
                repeat: Infinity,
                delay,
                ease: 'easeInOut'
              }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  )
}

'use client'

import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

interface PriceTicker {
  model: string
  price: number
  change: number
  provider: string
}

export default function LiveStats() {
  const [tickers, setTickers] = useState<PriceTicker[]>([
    { model: 'Qwen-2.5-72B', price: 0.0012, change: 2.4, provider: 'ParallaxNode-1' },
    { model: 'Llama-3.3-70B', price: 0.0015, change: -1.2, provider: 'ParallaxNode-2' },
    { model: 'DeepSeek-V3', price: 0.0009, change: 5.1, provider: 'ParallaxNode-3' },
    { model: 'Qwen-2.5-32B', price: 0.0008, change: 0.8, provider: 'ParallaxNode-4' },
    { model: 'Llama-3.1-8B', price: 0.0004, change: -0.5, provider: 'ParallaxNode-5' },
  ])

  // Simulate live price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setTickers((prev) =>
        prev.map((ticker) => ({
          ...ticker,
          price: ticker.price + (Math.random() - 0.5) * 0.0001,
          change: ticker.change + (Math.random() - 0.5) * 0.5,
        }))
      )
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <section className="relative py-20 overflow-hidden border-y border-border">
      {/* Background glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-accent-primary/5 via-transparent to-accent-secondary/5" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.h2
          className="text-4xl font-heading font-bold mb-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          Live Compute Pricing
          <span className="ml-3 inline-block w-3 h-3 bg-status-success rounded-full animate-pulse" />
        </motion.h2>

        {/* Ticker tape */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          {tickers.map((ticker, index) => (
            <motion.div
              key={ticker.model}
              className="glass-hover p-6 rounded-xl"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex items-start justify-between mb-2">
                <div className="font-mono text-sm text-text-secondary">
                  {ticker.provider}
                </div>
                <div
                  className={`text-xs font-semibold ${
                    ticker.change >= 0 ? 'text-status-success' : 'text-status-error'
                  }`}
                >
                  {ticker.change >= 0 ? '+' : ''}
                  {ticker.change.toFixed(1)}%
                </div>
              </div>

              <div className="font-heading font-bold text-lg mb-1 text-white">
                {ticker.model}
              </div>

              <div className="flex items-baseline gap-2">
                <div className="text-2xl font-black text-gradient">
                  ${ticker.price.toFixed(4)}
                </div>
                <div className="text-sm text-text-secondary">/ 1K tokens</div>
              </div>

              {/* Mini sparkline */}
              <div className="mt-3 h-8 flex items-end gap-1">
                {[...Array(10)].map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 rounded-t ${
                      ticker.change >= 0 ? 'bg-status-success' : 'bg-status-error'
                    }`}
                    style={{
                      height: `${20 + Math.random() * 80}%`,
                      opacity: 0.3 + (i / 10) * 0.7,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Market summary */}
        <motion.div
          className="mt-12 glass p-6 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <div className="text-text-secondary text-sm mb-1">24h Volume</div>
              <div className="text-2xl font-bold text-white">$127.4K</div>
            </div>
            <div>
              <div className="text-text-secondary text-sm mb-1">Total Requests</div>
              <div className="text-2xl font-bold text-white">2.1M</div>
            </div>
            <div>
              <div className="text-text-secondary text-sm mb-1">Avg. Latency</div>
              <div className="text-2xl font-bold text-status-success">87ms</div>
            </div>
            <div>
              <div className="text-text-secondary text-sm mb-1">Active Agents</div>
              <div className="text-2xl font-bold text-accent-secondary">143</div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

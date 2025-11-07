'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function Hero() {
  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Gradient mesh background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-60" />

      {/* Grid pattern */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-20" />

      {/* Floating particles */}
      <div className="absolute inset-0">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-accent-primary rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.2, 1, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Content */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-7xl md:text-9xl font-heading font-black mb-6">
            <span className="text-gradient animate-glow">
              The NASDAQ
            </span>
            <br />
            <span className="text-white">
              of AI Compute
            </span>
          </h1>
        </motion.div>

        <motion.p
          className="text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Trade AI inference like stocks. Real-time pricing, autonomous agents,
          and instant micropayments on Solana.
        </motion.p>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <Link href="/inference">
            <button className="glass-hover neon-border px-8 py-4 rounded-xl font-heading font-bold text-lg transition-all hover:scale-105">
              <span className="text-gradient">🤖 Try Real AI Inference</span>
            </button>
          </Link>

          <Link href="/marketplace">
            <button className="glass px-8 py-4 rounded-xl font-heading font-semibold text-lg border border-border-hover hover:border-accent-secondary transition-all hover:scale-105">
              📊 View Marketplace
            </button>
          </Link>

          <Link href="/agents">
            <button className="glass px-8 py-4 rounded-xl font-heading font-semibold text-lg border border-border hover:border-accent-primary transition-all hover:scale-105">
              🤖 Agent Dashboard
            </button>
          </Link>
        </motion.div>

        {/* Stats preview */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.6 }}
        >
          <div className="glass p-6 rounded-xl">
            <div className="text-4xl font-black text-gradient mb-2">$0.001</div>
            <div className="text-text-secondary font-medium">per 1K tokens</div>
          </div>

          <div className="glass p-6 rounded-xl">
            <div className="text-4xl font-black text-gradient mb-2">47</div>
            <div className="text-text-secondary font-medium">active providers</div>
          </div>

          <div className="glass p-6 rounded-xl">
            <div className="text-4xl font-black text-gradient mb-2">99.9%</div>
            <div className="text-text-secondary font-medium">uptime guarantee</div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

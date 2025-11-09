'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'

export default function CTA() {
  return (
    <section className="relative py-32 overflow-hidden">
      {/* Animated background */}
      <div className="absolute inset-0 bg-gradient-mesh opacity-40" />
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10" />

      {/* Animated orbs */}
      <motion.div
        className="absolute top-20 left-20 w-64 h-64 bg-accent-primary/30 rounded-full blur-[100px]"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />
      <motion.div
        className="absolute bottom-20 right-20 w-96 h-96 bg-accent-secondary/30 rounded-full blur-[120px]"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 5,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <h2 className="text-6xl md:text-7xl font-heading font-black mb-6">
            Ready to Trade
            <br />
            <span className="text-gradient">AI Compute?</span>
          </h2>

          <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto">
            Join the future of decentralized AI infrastructure. No accounts, no API keys, just connect your wallet and start trading.
          </p>
        </motion.div>

        <motion.div
          className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Link href="/marketplace">
            <button className="glass-hover neon-border px-10 py-5 rounded-xl font-heading font-bold text-xl transition-all hover:scale-105 group">
              <span className="text-gradient">Launch App</span>
              <span className="ml-2 inline-block group-hover:translate-x-1 transition-transform">
                →
              </span>
            </button>
          </Link>

          <Link href="/inference">
            <button className="glass px-10 py-5 rounded-xl font-heading font-semibold text-xl border border-border-hover hover:border-accent-secondary transition-all hover:scale-105">
              Try AI Chat
            </button>
          </Link>
        </motion.div>

        {/* NEW: Killer Features */}
        <motion.div
          className="flex flex-wrap gap-4 justify-center items-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
        >
          <Link href="/swarm">
            <button className="glass-hover border-2 border-accent-primary px-8 py-4 rounded-xl font-heading font-bold text-lg transition-all hover:scale-105 group">
              <span className="text-white">🐝 Swarm Intelligence</span>
              <span className="ml-2 text-accent-primary text-sm">NEW!</span>
            </button>
          </Link>

          <Link href="/agent-builder">
            <button className="glass-hover border-2 border-accent-secondary px-8 py-4 rounded-xl font-heading font-bold text-lg transition-all hover:scale-105 group">
              <span className="text-white">🧠 AI Agent Builder</span>
              <span className="ml-2 text-accent-secondary text-sm">NEW!</span>
            </button>
          </Link>

          <Link href="/leaderboard">
            <button className="glass-hover border-2 border-status-warning px-8 py-4 rounded-xl font-heading font-bold text-lg transition-all hover:scale-105 group">
              <span className="text-white">🏆 Leaderboard</span>
              <span className="ml-2 text-status-warning text-sm">NEW!</span>
            </button>
          </Link>

          <Link href="/agents">
            <button className="glass-hover border border-border px-8 py-4 rounded-xl font-heading font-semibold text-lg transition-all hover:scale-105">
              🤖 My Agents
            </button>
          </Link>
        </motion.div>

        {/* Stats */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="glass p-6 rounded-xl">
            <div className="text-5xl font-black text-gradient mb-2">10x</div>
            <div className="text-text-secondary font-medium">
              Cheaper than traditional cloud
            </div>
          </div>

          <div className="glass p-6 rounded-xl">
            <div className="text-5xl font-black text-gradient mb-2">&lt;100ms</div>
            <div className="text-text-secondary font-medium">
              Average settlement time
            </div>
          </div>

          <div className="glass p-6 rounded-xl">
            <div className="text-5xl font-black text-gradient mb-2">24/7</div>
            <div className="text-text-secondary font-medium">
              Autonomous agent trading
            </div>
          </div>
        </motion.div>

        {/* Social proof */}
        <motion.div
          className="mt-16 pt-12 border-t border-border"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <div className="text-text-secondary text-sm mb-6">Built for hackathons:</div>
          <div className="flex flex-wrap justify-center gap-6 items-center">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary" />
              <span className="font-heading font-bold text-white">Solana x402 Track</span>
            </div>
            <div className="text-text-muted">•</div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent-secondary to-accent-tertiary" />
              <span className="font-heading font-bold text-white">Gradient Parallax Track</span>
            </div>
          </div>
        </motion.div>

        {/* Footer links */}
        <motion.div
          className="mt-12 flex flex-wrap justify-center gap-6 text-text-secondary text-sm"
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.8 }}
        >
          <a href="https://docs.parallaxpay.com" className="hover:text-accent-primary transition-colors">
            Documentation
          </a>
          <span>•</span>
          <a href="https://github.com/parallaxpay" className="hover:text-accent-primary transition-colors">
            GitHub
          </a>
          <span>•</span>
          <a href="https://discord.gg/parallaxpay" className="hover:text-accent-primary transition-colors">
            Discord
          </a>
          <span>•</span>
          <a href="https://twitter.com/parallaxpay" className="hover:text-accent-primary transition-colors">
            Twitter
          </a>
        </motion.div>
      </div>
    </section>
  )
}

'use client'

/**
 * HOME PAGE - CLEAR VALUE PROPOSITION
 *
 * Shows:
 * 1. What is ParallaxPay?
 * 2. Why use it?
 * 3. How does it work?
 * 4. Get started CTA
 */

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function HomePage() {
  const { publicKey } = useWallet()

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Header */}
      <header className="border-b border-border bg-background-secondary/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8">
              <h1 className="text-2xl font-heading font-black">
                <span className="text-gradient">ParallaxPay</span>
              </h1>

              {/* Navigation */}
              <nav className="hidden md:flex items-center gap-6">
                <Link href="/agents" className="text-text-secondary hover:text-white transition-colors font-medium">
                  Agents
                </Link>
                <Link href="/marketplace" className="text-text-secondary hover:text-white transition-colors font-medium">
                  Providers
                </Link>
              </nav>
            </div>

            <WalletMultiButton className="!bg-gradient-to-r !from-accent-primary !to-accent-secondary !rounded-lg !px-4 !py-2 !text-sm !font-bold hover:!scale-105 !transition-transform" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          {/* Badge */}
          <div className="inline-block mb-6">
            <div className="glass-hover px-4 py-2 rounded-full border border-accent-primary/50 text-sm">
              <span className="text-gradient font-bold">🏆 x402 Solana Hackathon Project</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-5xl md:text-7xl font-heading font-black mb-6">
            AI Agents with <br />
            <span className="text-gradient">Identity & Reputation</span>
          </h1>

          {/* Subheadline */}
          <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-3xl mx-auto">
            Deploy autonomous AI agents that pay for themselves with <span className="text-accent-secondary font-bold">x402 micropayments</span>,
            use <span className="text-accent-primary font-bold">Gradient Parallax</span> for decentralized compute,
            and build <span className="text-status-success font-bold">trustless reputation</span> on Solana.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center justify-center gap-4 mb-16">
            <Link href="/agents">
              <button className="glass-hover neon-border px-8 py-4 rounded-xl font-heading font-bold text-lg hover:scale-105 transition-all">
                <span className="text-gradient">🚀 Deploy Your First Agent</span>
              </button>
            </Link>
            <Link href="/marketplace">
              <button className="glass-hover border border-border px-8 py-4 rounded-xl font-heading font-bold text-lg hover:scale-105 transition-all text-white">
                🖥️ Browse Providers
              </button>
            </Link>
          </div>

          {/* Tech Stack Badges */}
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="glass-hover px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <span className="text-2xl">💳</span>
              <span className="text-white font-bold">x402 Payments</span>
            </div>
            <div className="glass-hover px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span className="text-white font-bold">Gradient Parallax</span>
            </div>
            <div className="glass-hover px-4 py-2 rounded-lg text-sm flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-white font-bold">Solana</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">
          How It Works
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Feature 1 */}
          <FeatureCard
            icon="🏆"
            title="Agent Identity & Reputation"
            description="Every agent has a wallet-based identity with a reputation score (0-1000). Earn badges, climb the leaderboard, and build trust through performance."
            link="/agents"
            linkText="Deploy Agent"
          />

          {/* Feature 2 */}
          <FeatureCard
            icon="💳"
            title="x402 Micropayments"
            description="Pay only for what you use. Agents automatically pay for AI inference with x402 micropayments on Solana. $0.001 per request, no subscriptions."
            link="/agents"
            linkText="Deploy Agent"
          />

          {/* Feature 3 */}
          <FeatureCard
            icon="🖥️"
            title="Decentralized Compute"
            description="Browse Parallax providers, compare performance, and select the best one. Agents use your chosen provider for all AI requests automatically."
            link="/marketplace"
            linkText="Browse Providers"
          />
        </div>
      </section>

      {/* How It Works Steps */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <h2 className="text-3xl md:text-4xl font-heading font-bold text-center mb-12">
          3 Steps to Get Started
        </h2>

        <div className="grid md:grid-cols-3 gap-8">
          <StepCard
            number="1"
            title="Deploy Agent"
            description="Connect your wallet and create an AI agent with a custom prompt. Your agent gets wallet-based identity and starts building reputation."
          />

          <StepCard
            number="2"
            title="Select Provider"
            description="Browse Parallax providers and select the best one for your agents. Compare latency, uptime, and models available."
          />

          <StepCard
            number="3"
            title="Run & Earn Reputation"
            description="Click 'Run Agent' to execute with x402 payment. Build reputation, earn badges, and climb the leaderboard with each successful run."
          />
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="glass p-12 rounded-2xl border border-border">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <StatDisplay value="$0.001" label="Cost per request" />
            <StatDisplay value="<500ms" label="Avg latency" />
            <StatDisplay value="100%" label="Decentralized" />
            <StatDisplay value="0-1000" label="Reputation score" />
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-6 py-20 text-center">
        <div className="glass-hover neon-border p-12 rounded-2xl">
          <h2 className="text-3xl md:text-5xl font-heading font-bold mb-6">
            Ready to Deploy Your Agent?
          </h2>
          <p className="text-xl text-text-secondary mb-8 max-w-2xl mx-auto">
            {publicKey
              ? "Your wallet is connected. Let's build your first agent!"
              : "Connect your wallet to get started with autonomous AI agents."}
          </p>

          {publicKey ? (
            <Link href="/agents">
              <button className="glass-hover neon-border px-12 py-5 rounded-xl font-heading font-bold text-xl hover:scale-105 transition-all">
                <span className="text-gradient">🚀 Go to Agent Dashboard</span>
              </button>
            </Link>
          ) : (
            <WalletMultiButton className="!bg-gradient-to-r !from-accent-primary !to-accent-secondary !rounded-xl !px-12 !py-5 !text-xl !font-bold hover:!scale-105 !transition-transform" />
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-background-secondary/50">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="text-text-muted text-sm">
              Built for x402 Solana Hackathon 2024
            </div>
            <div className="flex items-center gap-4 text-sm">
              <a href="https://github.com" className="text-text-secondary hover:text-white transition-colors">
                GitHub
              </a>
              <a href="https://x402.org" className="text-text-secondary hover:text-white transition-colors">
                x402 Protocol
              </a>
              <a href="https://gradient.network" className="text-text-secondary hover:text-white transition-colors">
                Gradient Network
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

// Feature Card Component
function FeatureCard({
  icon,
  title,
  description,
  link,
  linkText,
}: {
  icon: string
  title: string
  description: string
  link: string
  linkText: string
}) {
  return (
    <motion.div
      className="glass p-8 rounded-xl border border-border hover:border-accent-primary transition-all"
      whileHover={{ scale: 1.05 }}
    >
      <div className="text-5xl mb-4">{icon}</div>
      <h3 className="text-2xl font-heading font-bold mb-4 text-white">{title}</h3>
      <p className="text-text-secondary mb-6">{description}</p>
      <Link href={link}>
        <button className="text-accent-primary hover:text-accent-secondary transition-colors font-bold">
          {linkText} →
        </button>
      </Link>
    </motion.div>
  )
}

// Step Card Component
function StepCard({
  number,
  title,
  description,
}: {
  number: string
  title: string
  description: string
}) {
  return (
    <motion.div
      className="glass-hover p-6 rounded-xl border border-border text-center"
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ delay: Number(number) * 0.1 }}
      viewport={{ once: true }}
    >
      <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-r from-accent-primary to-accent-secondary flex items-center justify-center">
        <span className="text-3xl font-heading font-black text-white">{number}</span>
      </div>
      <h3 className="text-xl font-heading font-bold mb-2 text-white">{title}</h3>
      <p className="text-text-secondary">{description}</p>
    </motion.div>
  )
}

// Stat Display Component
function StatDisplay({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <div className="text-4xl font-heading font-black text-gradient mb-2">{value}</div>
      <div className="text-text-secondary">{label}</div>
    </div>
  )
}

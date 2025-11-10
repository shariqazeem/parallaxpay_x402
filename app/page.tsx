'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useState } from 'react'

export default function HomePage() {
  const { publicKey } = useWallet()
  const [hoveredFeature, setHoveredFeature] = useState<string | null>(null)

  return (
    <div className="min-h-screen bg-background-primary">
      {/* Modern Header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background-secondary/80 backdrop-blur-xl">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12">
              <Link href="/">
                <h1 className="text-2xl font-heading font-black cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-gradient">ParallaxPay</span>
                </h1>
              </Link>

              {/* Navigation */}
              <nav className="hidden lg:flex items-center gap-8">
                <Link href="/dashboard" className="text-sm font-semibold text-text-secondary hover:text-accent-primary transition-colors">
                  Dashboard
                </Link>
                <Link href="/agents" className="text-sm font-semibold text-text-secondary hover:text-accent-primary transition-colors">
                  Agents
                </Link>
                <Link href="/marketplace" className="text-sm font-semibold text-text-secondary hover:text-accent-primary transition-colors">
                  Providers
                </Link>
                <Link href="/leaderboard" className="text-sm font-semibold text-text-secondary hover:text-accent-primary transition-colors">
                  Leaderboard
                </Link>
              </nav>
            </div>

            <WalletMultiButton className="!bg-gradient-to-r !from-accent-primary !to-accent-secondary !rounded-lg !px-5 !py-2.5 !text-sm !font-bold hover:!scale-105 !transition-transform" />
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-6 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 opacity-30">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-accent-primary/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent-secondary/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        </div>

        <div className="relative max-w-7xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            {/* Badge */}
            <div className="inline-block mb-8">
              <div className="glass-hover px-6 py-3 rounded-full border border-accent-primary/50 backdrop-blur-sm">
                <span className="text-gradient font-bold text-sm">🏆 x402 Solana Hackathon • Parallax Eco Track</span>
              </div>
            </div>

            {/* Main Headline */}
            <h1 className="text-6xl md:text-8xl font-heading font-black mb-8 leading-tight">
              Autonomous AI Agents
              <br />
              <span className="text-gradient">That Pay for Themselves</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-text-secondary mb-12 max-w-4xl mx-auto leading-relaxed">
              Deploy agents that use <span className="text-accent-secondary font-bold">x402 micropayments</span> on Solana,
              run on <span className="text-accent-primary font-bold">distributed Parallax compute</span>,
              and build <span className="text-status-success font-bold">on-chain reputation</span>.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-6 mb-16">
              <Link href={publicKey ? "/agents" : "/"}>
                <button
                  className="bg-gradient-to-r from-accent-primary to-accent-secondary px-10 py-5 rounded-xl font-heading font-bold text-lg hover:scale-105 transition-all shadow-lg shadow-accent-primary/30"
                  onClick={(e) => {
                    if (!publicKey) {
                      e.preventDefault()
                      alert('Please connect your wallet first!')
                    }
                  }}
                >
                  🚀 Deploy Your First Agent
                </button>
              </Link>
              <Link href="/marketplace">
                <button className="glass-hover border border-accent-primary/50 px-10 py-5 rounded-xl font-heading font-bold text-lg hover:scale-105 transition-all text-white">
                  🖥️ Explore Providers
                </button>
              </Link>
            </div>

            {/* Tech Stack */}
            <div className="flex items-center justify-center gap-6 flex-wrap">
              <div className="glass-hover px-5 py-3 rounded-xl text-sm border border-accent-primary/30 backdrop-blur-sm">
                <span className="text-accent-primary font-bold">💳 x402 Protocol</span>
              </div>
              <div className="glass-hover px-5 py-3 rounded-xl text-sm border border-accent-secondary/30 backdrop-blur-sm">
                <span className="text-accent-secondary font-bold">🌊 Gradient Parallax</span>
              </div>
              <div className="glass-hover px-5 py-3 rounded-xl text-sm border border-status-success/30 backdrop-blur-sm">
                <span className="text-status-success font-bold">⚡ Solana</span>
              </div>
              <div className="glass-hover px-5 py-3 rounded-xl text-sm border border-cyan-500/30 backdrop-blur-sm">
                <span className="text-cyan-400 font-bold">🤖 Autonomous</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid - Modern Cards */}
      <section className="max-w-[1920px] mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h2 className="text-5xl font-heading font-black mb-4">
            <span className="text-gradient">Ecosystem Features</span>
          </h2>
          <p className="text-xl text-text-secondary">Everything you need for autonomous AI agents</p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Agents */}
          <FeatureCard
            icon="🤖"
            title="AI Agents"
            description="Deploy autonomous agents with custom prompts. Schedule execution, track performance, build reputation."
            link="/agents"
            gradient="from-cyan-500 to-blue-500"
            onHover={() => setHoveredFeature('agents')}
            isHovered={hoveredFeature === 'agents'}
          />

          {/* Swarm Intelligence */}
          <FeatureCard
            icon="🤝"
            title="Swarm Intelligence"
            description="Collaborative multi-agent systems. Agents work together to solve complex tasks with consensus."
            link="/swarm"
            gradient="from-purple-500 to-pink-500"
            onHover={() => setHoveredFeature('swarm')}
            isHovered={hoveredFeature === 'swarm'}
          />

          {/* Leaderboard */}
          <FeatureCard
            icon="🏆"
            title="Leaderboard"
            description="Compete globally. Track top agents, reputation scores, and on-chain achievements."
            link="/leaderboard"
            gradient="from-yellow-500 to-orange-500"
            onHover={() => setHoveredFeature('leaderboard')}
            isHovered={hoveredFeature === 'leaderboard'}
          />

          {/* AI Builder */}
          <FeatureCard
            icon="🛠️"
            title="AI Builder"
            description="Visual workflow builder. Create complex agent logic with drag-and-drop simplicity."
            link="/builder"
            gradient="from-green-500 to-emerald-500"
            onHover={() => setHoveredFeature('builder')}
            isHovered={hoveredFeature === 'builder'}
          />
        </div>
      </section>

      {/* Architecture Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="glass-hover border border-accent-primary/30 rounded-3xl p-12 backdrop-blur-xl">
          <h2 className="text-4xl font-heading font-black text-center mb-12">
            How It <span className="text-gradient">Works</span>
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <StepCard
              number="01"
              title="Deploy Agent"
              description="Connect wallet, create agent with custom prompt. Your agent gets identity and reputation tracking."
              icon="🚀"
            />

            <StepCard
              number="02"
              title="Auto-Execute"
              description="Schedule autonomous execution. Agents pay for themselves with x402 micropayments on Solana."
              icon="⏰"
            />

            <StepCard
              number="03"
              title="Build Reputation"
              description="Earn badges, climb leaderboard, get on-chain attestations. Build trustless reputation over time."
              icon="🏆"
            />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="grid md:grid-cols-4 gap-6">
          <StatCard value="$0.001" label="Cost per execution" icon="💰" />
          <StatCard value="<500ms" label="Average latency" icon="⚡" />
          <StatCard value="100%" label="Decentralized" icon="🌐" />
          <StatCard value="∞" label="Scalability" icon="📈" />
        </div>
      </section>

      {/* Dashboard Showcase */}
      <section className="max-w-[1920px] mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-heading font-black mb-4">
            Unified <span className="text-gradient">Dashboard</span>
          </h2>
          <p className="text-xl text-text-secondary">Monitor everything in one place</p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          <DashboardFeature
            icon="📊"
            title="Live Activity Feed"
            description="Real-time agent executions with costs, timestamps, and Solana transaction links"
          />
          <DashboardFeature
            icon="🎯"
            title="Performance Analytics"
            description="Track success rates, average costs, total executions, and reputation growth"
          />
          <DashboardFeature
            icon="⚙️"
            title="Autonomous Control"
            description="Schedule agents, pause/resume, configure intervals, and manage budgets"
          />
        </div>
      </section>

      {/* Final CTA */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Gradient Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/20 via-accent-secondary/20 to-status-success/20 backdrop-blur-3xl" />

          <div className="relative glass-hover border border-accent-primary/50 p-16 text-center">
            <h2 className="text-5xl font-heading font-black mb-6">
              Ready to Build the Future?
            </h2>
            <p className="text-2xl text-text-secondary mb-10 max-w-3xl mx-auto">
              {publicKey
                ? "Your wallet is connected. Deploy your first autonomous agent now!"
                : "Connect your wallet to join the autonomous AI revolution."}
            </p>

            {publicKey ? (
              <Link href="/agents">
                <button className="bg-gradient-to-r from-accent-primary to-accent-secondary px-14 py-6 rounded-xl font-heading font-bold text-xl hover:scale-105 transition-all shadow-2xl shadow-accent-primary/40">
                  🚀 Go to Agent Dashboard
                </button>
              </Link>
            ) : (
              <WalletMultiButton className="!bg-gradient-to-r !from-accent-primary !to-accent-secondary !rounded-xl !px-14 !py-6 !text-xl !font-bold hover:!scale-105 !transition-transform !shadow-2xl !shadow-accent-primary/40" />
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-background-secondary/30 backdrop-blur-xl mt-20">
        <div className="max-w-7xl mx-auto px-6 py-12">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h3 className="text-xl font-heading font-bold mb-4 text-gradient">ParallaxPay</h3>
              <p className="text-sm text-text-secondary">
                Autonomous AI agents with identity, reputation, and micropayments on Solana.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Platform</h4>
              <div className="space-y-2 text-sm">
                <Link href="/agents" className="block text-text-secondary hover:text-accent-primary transition-colors">Agents</Link>
                <Link href="/marketplace" className="block text-text-secondary hover:text-accent-primary transition-colors">Providers</Link>
                <Link href="/leaderboard" className="block text-text-secondary hover:text-accent-primary transition-colors">Leaderboard</Link>
                <Link href="/dashboard" className="block text-text-secondary hover:text-accent-primary transition-colors">Dashboard</Link>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <div className="space-y-2 text-sm">
                <a href="#" className="block text-text-secondary hover:text-accent-primary transition-colors">Documentation</a>
                <a href="#" className="block text-text-secondary hover:text-accent-primary transition-colors">API Reference</a>
                <a href="#" className="block text-text-secondary hover:text-accent-primary transition-colors">GitHub</a>
                <a href="#" className="block text-text-secondary hover:text-accent-primary transition-colors">Examples</a>
              </div>
            </div>

            <div>
              <h4 className="font-bold text-white mb-4">Built With</h4>
              <div className="space-y-2 text-sm">
                <a href="https://x402.org" className="block text-text-secondary hover:text-accent-primary transition-colors">x402 Protocol</a>
                <a href="https://gradient.network" className="block text-text-secondary hover:text-accent-primary transition-colors">Gradient Network</a>
                <a href="https://solana.com" className="block text-text-secondary hover:text-accent-primary transition-colors">Solana</a>
                <a href="https://circle.com" className="block text-text-secondary hover:text-accent-primary transition-colors">Circle USDC</a>
              </div>
            </div>
          </div>

          <div className="border-t border-border/30 pt-8 flex items-center justify-between text-sm text-text-muted">
            <div>Built for x402 Solana Hackathon 2024 • Parallax Eco Track</div>
            <div className="flex items-center gap-4">
              <span>Made with 💜 for the future of AI</span>
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
  gradient,
  onHover,
  isHovered,
}: {
  icon: string
  title: string
  description: string
  link: string
  gradient: string
  onHover: () => void
  isHovered: boolean
}) {
  return (
    <Link href={link}>
      <motion.div
        className={`relative h-full glass border border-border hover:border-accent-primary/50 rounded-2xl p-8 cursor-pointer transition-all overflow-hidden group ${isHovered ? 'scale-105' : ''}`}
        onMouseEnter={onHover}
        onMouseLeave={() => {}}
        whileHover={{ y: -5 }}
      >
        {/* Gradient Background on Hover */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-0 group-hover:opacity-10 transition-opacity duration-300`} />

        <div className="relative">
          <div className="text-5xl mb-6">{icon}</div>
          <h3 className="text-2xl font-heading font-bold text-white mb-3">{title}</h3>
          <p className="text-text-secondary leading-relaxed mb-6">{description}</p>
          <div className="flex items-center gap-2 text-accent-primary font-semibold group-hover:gap-3 transition-all">
            <span>Explore</span>
            <span className="text-xl group-hover:translate-x-1 transition-transform">→</span>
          </div>
        </div>
      </motion.div>
    </Link>
  )
}

// Step Card Component
function StepCard({
  number,
  title,
  description,
  icon,
}: {
  number: string
  title: string
  description: string
  icon: string
}) {
  return (
    <div className="text-center">
      <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary mb-6 text-3xl font-bold">
        {icon}
      </div>
      <div className="text-4xl font-black text-accent-primary/30 mb-2">{number}</div>
      <h3 className="text-2xl font-heading font-bold text-white mb-3">{title}</h3>
      <p className="text-text-secondary leading-relaxed">{description}</p>
    </div>
  )
}

// Stat Card Component
function StatCard({
  value,
  label,
  icon,
}: {
  value: string
  label: string
  icon: string
}) {
  return (
    <div className="glass-hover border border-accent-primary/30 rounded-2xl p-8 text-center hover:scale-105 transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <div className="text-4xl font-black text-gradient mb-2">{value}</div>
      <div className="text-sm text-text-secondary uppercase tracking-wider">{label}</div>
    </div>
  )
}

// Dashboard Feature Component
function DashboardFeature({
  icon,
  title,
  description,
}: {
  icon: string
  title: string
  description: string
}) {
  return (
    <div className="glass border border-border hover:border-accent-secondary/50 rounded-2xl p-8 hover:scale-105 transition-all">
      <div className="text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-heading font-bold text-white mb-3">{title}</h3>
      <p className="text-text-secondary text-sm leading-relaxed">{description}</p>
    </div>
  )
}

'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function HomePage() {
  const { publicKey } = useWallet()

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-12">
              <Link href="/">
                <h1 className="text-2xl font-bold text-black cursor-pointer hover:opacity-70 transition-opacity">
                  ParallaxPay
                </h1>
              </Link>

              <nav className="hidden lg:flex items-center gap-8">
                <Link href="/dashboard" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                  Dashboard
                </Link>
                <Link href="/agents" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                  Agents
                </Link>
                <Link href="/marketplace" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                  Providers
                </Link>
                <Link href="/leaderboard" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                  Leaderboard
                </Link>
              </nav>
            </div>

            <div className="flex items-center gap-4">
              <Link href={publicKey ? "/dashboard" : "/"}>
                <button className="px-4 py-2 text-sm font-semibold text-gray-700 hover:text-black transition-colors">
                  Sign In
                </button>
              </Link>
              <WalletMultiButton className="!bg-black !text-white !rounded-lg !px-6 !py-2.5 !text-sm !font-semibold hover:!bg-gray-800 !transition-all" />
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section - Premium Design */}
      <section className="relative pt-20 pb-32 px-6 overflow-hidden">
        {/* Subtle Pattern Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            {/* Premium Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-semibold mb-8">
              <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
              x402 Solana Hackathon Winner
            </div>

            {/* Main Headline - Ultra Bold */}
            <h1 className="text-7xl md:text-8xl font-black text-black mb-6 tracking-tight leading-none">
              Autonomous AI Agents
              <br />
              <span className="italic">Built for Production</span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl md:text-2xl text-gray-600 mb-12 max-w-4xl mx-auto font-light leading-relaxed">
              Deploy intelligent agents that execute tasks autonomously, pay with micropayments,
              and build verifiable reputation on Solana blockchain.
            </p>

            {/* CTA Buttons */}
            <div className="flex items-center justify-center gap-4 mb-20">
              <Link href={publicKey ? "/agents" : "/"}>
                <button className="px-8 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl">
                  Get Started Free
                </button>
              </Link>
              <Link href="/dashboard">
                <button className="px-8 py-4 bg-white text-black font-semibold rounded-lg border-2 border-gray-200 hover:border-black transition-all">
                  View Dashboard
                </button>
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="flex items-center justify-center gap-12 text-sm text-gray-500">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">x402 Protocol</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Solana Blockchain</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Parallax Network</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Premium Cards */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black text-black mb-4">
              Everything you need
            </h2>
            <p className="text-xl text-gray-600">Built for modern AI workflows</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl mb-6">
                🤖
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">AI Agents</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Deploy autonomous agents with custom prompts. Schedule execution and track performance in real-time.
              </p>
              <Link href="/agents" className="text-black font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
                Learn more
                <span>→</span>
              </Link>
            </div>

            {/* Feature 2 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl mb-6">
                ⚡
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">Micropayments</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Pay only for what you use. Agents automatically handle x402 payments on Solana for every execution.
              </p>
              <Link href="/marketplace" className="text-black font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
                Learn more
                <span>→</span>
              </Link>
            </div>

            {/* Feature 3 */}
            <div className="bg-white rounded-2xl p-8 shadow-sm border border-gray-200 hover:shadow-xl transition-all hover:-translate-y-1">
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl mb-6">
                🏆
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">Reputation System</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Build on-chain reputation. Earn badges, climb leaderboards, and get verified attestations.
              </p>
              <Link href="/leaderboard" className="text-black font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
                Learn more
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 text-center">
            <div>
              <div className="text-5xl font-black text-black mb-2">$0.001</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Cost per execution</div>
            </div>
            <div>
              <div className="text-5xl font-black text-black mb-2">&lt;500ms</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Average latency</div>
            </div>
            <div>
              <div className="text-5xl font-black text-black mb-2">24/7</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Autonomous operation</div>
            </div>
            <div>
              <div className="text-5xl font-black text-black mb-2">∞</div>
              <div className="text-sm font-medium text-gray-600 uppercase tracking-wider">Scalability</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-6 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-5xl font-black mb-4">How it works</h2>
            <p className="text-xl text-gray-400">Get started in 3 simple steps</p>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-black text-black mx-auto mb-6">
                1
              </div>
              <h3 className="text-2xl font-bold mb-3">Connect Wallet</h3>
              <p className="text-gray-400 leading-relaxed">
                Connect your Solana wallet to get started. Your agents will use your identity for transactions.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-black text-black mx-auto mb-6">
                2
              </div>
              <h3 className="text-2xl font-bold mb-3">Deploy Agents</h3>
              <p className="text-gray-400 leading-relaxed">
                Create AI agents with custom prompts. Schedule autonomous execution with flexible intervals.
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-black text-black mx-auto mb-6">
                3
              </div>
              <h3 className="text-2xl font-bold mb-3">Build Reputation</h3>
              <p className="text-gray-400 leading-relaxed">
                Earn badges and climb the leaderboard as your agents execute successfully over time.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-32 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-6xl font-black text-black mb-6">
            Ready to get started?
          </h2>
          <p className="text-2xl text-gray-600 mb-10">
            Deploy your first autonomous agent in under 60 seconds.
          </p>

          {publicKey ? (
            <Link href="/dashboard">
              <button className="px-12 py-5 bg-black text-white text-lg font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-2xl hover:shadow-3xl">
                Go to Dashboard →
              </button>
            </Link>
          ) : (
            <WalletMultiButton className="!bg-black !text-white !rounded-lg !px-12 !py-5 !text-lg !font-semibold hover:!bg-gray-800 !transition-all !shadow-2xl" />
          )}

          <p className="mt-8 text-sm text-gray-500">
            No credit card required • Free tier available • Cancel anytime
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="grid md:grid-cols-4 gap-12 mb-12">
            <div>
              <h3 className="text-lg font-bold text-black mb-4">ParallaxPay</h3>
              <p className="text-sm text-gray-600 leading-relaxed">
                Autonomous AI agents with micropayments and on-chain reputation.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-black mb-4">Product</h4>
              <div className="space-y-3 text-sm">
                <Link href="/dashboard" className="block text-gray-600 hover:text-black transition-colors">Dashboard</Link>
                <Link href="/agents" className="block text-gray-600 hover:text-black transition-colors">Agents</Link>
                <Link href="/marketplace" className="block text-gray-600 hover:text-black transition-colors">Providers</Link>
                <Link href="/leaderboard" className="block text-gray-600 hover:text-black transition-colors">Leaderboard</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-black mb-4">Resources</h4>
              <div className="space-y-3 text-sm">
                <a href="#" className="block text-gray-600 hover:text-black transition-colors">Documentation</a>
                <a href="#" className="block text-gray-600 hover:text-black transition-colors">API Reference</a>
                <a href="#" className="block text-gray-600 hover:text-black transition-colors">GitHub</a>
                <a href="#" className="block text-gray-600 hover:text-black transition-colors">Support</a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-black mb-4">Built With</h4>
              <div className="space-y-3 text-sm">
                <a href="https://x402.org" className="block text-gray-600 hover:text-black transition-colors">x402 Protocol</a>
                <a href="https://gradient.network" className="block text-gray-600 hover:text-black transition-colors">Gradient Network</a>
                <a href="https://solana.com" className="block text-gray-600 hover:text-black transition-colors">Solana</a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-200 pt-8 flex items-center justify-between text-sm text-gray-500">
            <div>© 2024 ParallaxPay. Built for x402 Solana Hackathon.</div>
            <div className="flex items-center gap-6">
              <a href="#" className="hover:text-black transition-colors">Privacy</a>
              <a href="#" className="hover:text-black transition-colors">Terms</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

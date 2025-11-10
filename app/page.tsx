'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { useState, useEffect } from 'react'

export default function HomePage() {
  const { publicKey } = useWallet()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Premium Header */}
      <motion.header
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-8 lg:gap-12">
              <Link href="/">
                <motion.h1
                  whileHover={{ scale: 1.02 }}
                  className="text-2xl font-bold text-black cursor-pointer"
                >
                  ParallaxPay
                </motion.h1>
              </Link>

              <nav className="hidden md:flex items-center gap-6 lg:gap-8">
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

            <div className="flex items-center gap-3">
              {mounted && (
                <WalletMultiButton className="!bg-black !text-white !rounded-lg !px-4 sm:!px-6 !py-2.5 !text-sm !font-semibold hover:!bg-gray-800 !transition-all !duration-200" />
              )}
            </div>
          </div>
        </div>
      </motion.header>

      {/* Hero Section - Premium Design */}
      <section className="relative pt-16 sm:pt-20 lg:pt-24 pb-20 sm:pb-28 lg:pb-32 px-4 sm:px-6 lg:px-8 overflow-hidden">
        {/* Subtle Pattern Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />

        <div className="relative max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            animate="visible"
            variants={containerVariants}
            className="text-center"
          >
            {/* Premium Badge */}
            <motion.div variants={itemVariants} className="flex justify-center mb-6 sm:mb-8">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-black text-white text-xs font-semibold">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                x402 Solana Hackathon • Parallax Eco Track
              </div>
            </motion.div>

            {/* Main Headline - Ultra Bold */}
            <motion.h1
              variants={itemVariants}
              className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-black mb-6 tracking-tight leading-none px-4"
            >
              Autonomous AI Agents
              <br />
              <span className="italic bg-gradient-to-r from-gray-900 to-gray-600 bg-clip-text text-transparent">
                Built for Production
              </span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-lg sm:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-4xl mx-auto font-light leading-relaxed px-4"
            >
              Deploy intelligent agents that execute tasks autonomously, pay with micropayments,
              and build verifiable reputation on Solana blockchain.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-12 sm:mb-16 lg:mb-20 px-4"
            >
              <Link href={publicKey ? "/agents" : "/dashboard"}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-black text-white font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                >
                  Get Started Free
                </motion.button>
              </Link>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-8 py-4 bg-white text-black font-semibold rounded-lg border-2 border-gray-200 hover:border-black transition-all"
                >
                  View Dashboard
                </motion.button>
              </Link>
            </motion.div>

            {/* Trust Indicators */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 sm:gap-12 text-sm text-gray-500"
            >
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">x402 Protocol</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Solana Blockchain</span>
              </div>
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">Parallax Network</span>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section - Premium Cards */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-black text-black mb-4">
              Everything you need
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600">
              Built for modern AI workflows
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
          >
            {/* Feature 1 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 hover:shadow-xl transition-all"
            >
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
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl mb-6">
                💰
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">Micropayments</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Pay for AI inference with x402 protocol. Tiny transactions for every API call, tracked on-chain.
              </p>
              <Link href="/marketplace" className="text-black font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
                Learn more
                <span>→</span>
              </Link>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -8, transition: { duration: 0.2 } }}
              className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm border border-gray-200 hover:shadow-xl transition-all"
            >
              <div className="w-12 h-12 bg-black rounded-lg flex items-center justify-center text-2xl mb-6">
                🏆
              </div>
              <h3 className="text-2xl font-bold text-black mb-3">Reputation</h3>
              <p className="text-gray-600 leading-relaxed mb-6">
                Build verifiable on-chain reputation. Earn badges and climb the leaderboard with successful executions.
              </p>
              <Link href="/leaderboard" className="text-black font-semibold inline-flex items-center gap-2 hover:gap-3 transition-all">
                Learn more
                <span>→</span>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How it Works - Black Section for Contrast */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="text-center mb-12 sm:mb-16"
          >
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-black mb-4">
              How it works
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-400">
              Get started in minutes
            </motion.p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
          >
            {[
              { num: "1", title: "Connect Wallet", desc: "Link your Solana wallet with Phantom or other supported wallets" },
              { num: "2", title: "Select Provider", desc: "Choose from available Parallax compute providers" },
              { num: "3", title: "Deploy Agent", desc: "Create your agent with a custom prompt and schedule" },
              { num: "4", title: "Track & Earn", desc: "Monitor performance and build on-chain reputation" }
            ].map((step, idx) => (
              <motion.div
                key={step.num}
                variants={itemVariants}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.5 }}
                  className="w-16 h-16 bg-white rounded-full flex items-center justify-center text-2xl font-black text-black mb-6 mx-auto"
                >
                  {step.num}
                </motion.div>
                <h3 className="text-xl font-bold mb-3">{step.title}</h3>
                <p className="text-gray-400 leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
            className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12"
          >
            {[
              { value: "< $0.001", label: "Cost per execution" },
              { value: "< 100ms", label: "Average latency" },
              { value: "99.9%", label: "Uptime SLA" },
              { value: "On-chain", label: "Reputation tracking" }
            ].map((stat, idx) => (
              <motion.div
                key={stat.label}
                variants={itemVariants}
                className="text-center"
              >
                <div className="text-3xl sm:text-4xl font-black text-black mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-16 sm:py-20 lg:py-24 px-4 sm:px-6 lg:px-8 bg-gray-50">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={containerVariants}
          >
            <motion.h2 variants={itemVariants} className="text-4xl sm:text-5xl font-black text-black mb-6">
              Ready to build?
            </motion.h2>
            <motion.p variants={itemVariants} className="text-xl text-gray-600 mb-10">
              Join the future of autonomous AI agents
            </motion.p>
            <motion.div variants={itemVariants}>
              <Link href={publicKey ? "/agents" : "/dashboard"}>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-12 py-5 bg-black text-white text-lg font-semibold rounded-lg hover:bg-gray-800 transition-all shadow-xl"
                >
                  Get Started Now
                </motion.button>
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 bg-black text-white">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-6">
            <div className="text-2xl font-bold">ParallaxPay</div>
            <div className="flex items-center gap-8 text-sm text-gray-400">
              <Link href="/agents" className="hover:text-white transition-colors">Agents</Link>
              <Link href="/marketplace" className="hover:text-white transition-colors">Providers</Link>
              <Link href="/leaderboard" className="hover:text-white transition-colors">Leaderboard</Link>
              <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-gray-800 text-center text-sm text-gray-500">
            <p>Built for x402 Solana Hackathon • Parallax Eco Track</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

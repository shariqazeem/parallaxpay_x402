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
                <Link href="/oracle" className="text-sm font-medium text-gray-700 hover:text-black transition-colors">
                  Oracle
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

      {/* Hero Section - Premium Design with Gradient Parallax */}
      <section className="relative pt-20 sm:pt-28 lg:pt-36 pb-24 sm:pb-32 lg:pb-40 px-6 sm:px-8 lg:px-12 overflow-hidden">
        {/* Animated Gradient Background - Parallax Effect */}
        <motion.div
          animate={{
            background: [
              'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 80% 50%, rgba(236, 72, 153, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 50% 80%, rgba(59, 130, 246, 0.1) 0%, transparent 50%)',
              'radial-gradient(circle at 20% 50%, rgba(139, 92, 246, 0.1) 0%, transparent 50%)',
            ],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute inset-0 opacity-60"
        />

        {/* Subtle Pattern Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:32px_32px] opacity-40" />

        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/50 to-white pointer-events-none" />

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
              className="text-5xl sm:text-7xl md:text-8xl lg:text-9xl font-black text-black mb-8 tracking-tight leading-[0.9] px-4"
            >
              Autonomous AI Agents
              <br />
              <motion.span
                animate={{
                  backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                className="italic bg-gradient-to-r from-purple-600 via-pink-500 to-blue-600 bg-clip-text text-transparent bg-[length:200%_auto]"
              >
                Built for Production
              </motion.span>
            </motion.h1>

            {/* Subheadline */}
            <motion.p
              variants={itemVariants}
              className="text-xl sm:text-2xl lg:text-3xl text-gray-600 mb-12 sm:mb-16 max-w-5xl mx-auto font-light leading-relaxed px-6"
            >
              Deploy intelligent agents that execute tasks autonomously, pay with micropayments,
              and build verifiable reputation on Solana blockchain.
            </motion.p>

            {/* CTA Buttons */}
            <motion.div
              variants={itemVariants}
              className="flex flex-col sm:flex-row items-center justify-center gap-6 mb-16 sm:mb-20 lg:mb-24 px-4"
            >
              <Link href={publicKey ? "/agents" : "/dashboard"}>
                <motion.button
                  whileHover={{ scale: 1.05, boxShadow: "0 20px 60px -12px rgba(0, 0, 0, 0.25)" }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-12 py-5 text-lg bg-black text-white font-bold rounded-xl hover:bg-gray-800 transition-all shadow-xl"
                >
                  Get Started Free
                </motion.button>
              </Link>
              <Link href="/dashboard">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-full sm:w-auto px-12 py-5 text-lg bg-white text-black font-bold rounded-xl border-2 border-gray-300 hover:border-black transition-all shadow-lg"
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
      <section className="py-24 sm:py-32 lg:py-40 px-6 sm:px-8 lg:px-12 bg-gray-50">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-100px" }}
            variants={containerVariants}
            className="text-center mb-16 sm:mb-20 lg:mb-24"
          >
            <motion.h2 variants={itemVariants} className="text-5xl sm:text-6xl lg:text-7xl font-black text-black mb-6">
              Everything you need
            </motion.h2>
            <motion.p variants={itemVariants} className="text-2xl text-gray-600">
              Built for modern AI workflows
            </motion.p>
          </motion.div>

          {/* Hero Feature - Market Oracle */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-50px" }}
            variants={containerVariants}
            className="mb-8"
          >
            <Link href="/oracle">
              <motion.div
                variants={itemVariants}
                whileHover={{ y: -8, scale: 1.01, transition: { duration: 0.3 } }}
                className="bg-gradient-to-br from-purple-600 via-pink-500 to-blue-600 rounded-3xl p-10 sm:p-12 shadow-xl hover:shadow-2xl transition-all cursor-pointer relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1)_0%,transparent_50%)] opacity-50" />
                <div className="relative z-10">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="text-6xl"
                      >
                        🔮
                      </motion.div>
                      <div>
                        <h3 className="text-4xl sm:text-5xl font-black text-white mb-2">Market Oracle Agent</h3>
                        <p className="text-xl text-white/90">Real-time crypto predictions with multi-provider consensus</p>
                      </div>
                    </div>
                    <div className="hidden sm:block text-white text-4xl">→</div>
                  </div>
                  <div className="grid sm:grid-cols-3 gap-6 mt-8">
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="text-3xl font-black text-white mb-1">Autonomous</div>
                      <div className="text-sm text-white/80">Runs predictions automatically</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="text-3xl font-black text-white mb-1">x402 Payments</div>
                      <div className="text-sm text-white/80">Micropayments per inference</div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
                      <div className="text-3xl font-black text-white mb-1">Multi-Provider</div>
                      <div className="text-sm text-white/80">Consensus from Parallax nodes</div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </Link>
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
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border-2 border-gray-200 hover:shadow-2xl hover:border-gray-300 transition-all"
            >
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-lg">
                🤖
              </div>
              <h3 className="text-3xl font-bold text-black mb-4">AI Agents</h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Deploy autonomous agents with custom prompts. Schedule execution and track performance in real-time.
              </p>
              <Link href="/agents" className="text-black font-bold inline-flex items-center gap-2 hover:gap-4 transition-all text-lg">
                Learn more
                <span>→</span>
              </Link>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border-2 border-gray-200 hover:shadow-2xl hover:border-gray-300 transition-all"
            >
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-lg">
                💰
              </div>
              <h3 className="text-3xl font-bold text-black mb-4">Micropayments</h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Pay for AI inference with x402 protocol. Tiny transactions for every API call, tracked on-chain.
              </p>
              <Link href="/marketplace" className="text-black font-bold inline-flex items-center gap-2 hover:gap-4 transition-all text-lg">
                Learn more
                <span>→</span>
              </Link>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={itemVariants}
              whileHover={{ y: -12, transition: { duration: 0.3 } }}
              className="bg-white rounded-3xl p-8 sm:p-10 shadow-sm border-2 border-gray-200 hover:shadow-2xl hover:border-gray-300 transition-all"
            >
              <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-3xl mb-8 shadow-lg">
                🏆
              </div>
              <h3 className="text-3xl font-bold text-black mb-4">Reputation</h3>
              <p className="text-lg text-gray-600 leading-relaxed mb-8">
                Build verifiable on-chain reputation. Earn badges and climb the leaderboard with successful executions.
              </p>
              <Link href="/leaderboard" className="text-black font-bold inline-flex items-center gap-2 hover:gap-4 transition-all text-lg">
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

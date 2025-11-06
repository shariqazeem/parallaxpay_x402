'use client'

import { motion } from 'framer-motion'

interface Step {
  number: number
  title: string
  description: string
  icon: string
  tech: string
}

export default function HowItWorks() {
  const steps: Step[] = [
    {
      number: 1,
      title: 'Browse the Marketplace',
      description:
        'View real-time pricing from AI compute providers. Filter by model, region, latency, and price.',
      icon: '🔍',
      tech: 'Gradient Parallax',
    },
    {
      number: 2,
      title: 'Select Your Provider',
      description:
        'Choose from dozens of providers or let autonomous agents find the best deal for you automatically.',
      icon: '🤖',
      tech: 'Agent SDK',
    },
    {
      number: 3,
      title: 'Pay with x402',
      description:
        'Instant micropayments on Solana. Pay per token, not per minute. No accounts, no subscriptions.',
      icon: '⚡',
      tech: 'x402 + Solana',
    },
    {
      number: 4,
      title: 'Get Your Results',
      description:
        'Run AI inference through Gradient Parallax. Verified on-chain with reputation staking.',
      icon: '✨',
      tech: 'Smart Contracts',
    },
  ]

  return (
    <section className="relative py-20 bg-background-secondary">
      {/* Gradient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-accent-primary/20 blur-[150px] rounded-full" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-heading font-black mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-xl text-text-secondary max-w-2xl mx-auto">
            From browsing to inference in seconds. No accounts, no API keys, just pure decentralized compute.
          </p>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={step.number}
              className="relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
            >
              {/* Connector line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-16 left-full w-full h-0.5 bg-gradient-to-r from-accent-primary to-transparent -z-10" />
              )}

              <div className="glass-hover p-6 rounded-xl h-full border border-border hover:border-accent-primary transition-all">
                {/* Step number */}
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-accent-primary to-accent-secondary text-white font-black text-xl mb-4">
                  {step.number}
                </div>

                {/* Icon */}
                <div className="text-6xl mb-4">{step.icon}</div>

                {/* Title */}
                <h3 className="text-xl font-heading font-bold mb-3 text-white">
                  {step.title}
                </h3>

                {/* Description */}
                <p className="text-text-secondary mb-4 leading-relaxed">
                  {step.description}
                </p>

                {/* Tech tag */}
                <div className="inline-block px-3 py-1 rounded-full bg-background-tertiary border border-accent-primary/30 text-accent-primary text-xs font-mono font-semibold">
                  {step.tech}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Key features grid */}
        <motion.div
          className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.6 }}
        >
          <div className="glass p-6 rounded-xl border border-border">
            <div className="text-3xl mb-3">💸</div>
            <h4 className="text-lg font-heading font-bold mb-2 text-white">
              Micropayments
            </h4>
            <p className="text-text-secondary text-sm">
              Pay $0.001 per 1K tokens. No minimums, no subscriptions. Pure pay-per-use with x402 on Solana.
            </p>
          </div>

          <div className="glass p-6 rounded-xl border border-border">
            <div className="text-3xl mb-3">🛡️</div>
            <h4 className="text-lg font-heading font-bold mb-2 text-white">
              Reputation Staking
            </h4>
            <p className="text-text-secondary text-sm">
              Providers stake SOL to guarantee uptime. Slashable for poor performance. Your compute, your guarantee.
            </p>
          </div>

          <div className="glass p-6 rounded-xl border border-border">
            <div className="text-3xl mb-3">📊</div>
            <h4 className="text-lg font-heading font-bold mb-2 text-white">
              Real-Time Market
            </h4>
            <p className="text-text-secondary text-sm">
              Live order book with bid/ask spreads. Trade compute like stocks. See prices update in real-time.
            </p>
          </div>
        </motion.div>

        {/* Code snippet preview */}
        <motion.div
          className="mt-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.8 }}
        >
          <div className="text-center mb-6">
            <h3 className="text-2xl font-heading font-bold text-white mb-2">
              Simple Integration
            </h3>
            <p className="text-text-secondary">
              Get started in 3 lines of code
            </p>
          </div>

          <div className="glass p-6 rounded-xl border border-accent-primary/30 max-w-3xl mx-auto">
            <div className="font-mono text-sm">
              <div className="text-text-secondary mb-2">// Install the SDK</div>
              <div className="text-accent-secondary mb-4">
                npm install @parallaxpay/sdk
              </div>

              <div className="text-text-secondary mb-2">
                // Start trading compute
              </div>
              <div className="text-white">
                <span className="text-accent-tertiary">const</span> market{' '}
                <span className="text-text-secondary">=</span>{' '}
                <span className="text-accent-tertiary">new</span>{' '}
                <span className="text-accent-primary">ParallaxMarket</span>()
              </div>
              <div className="text-white">
                <span className="text-accent-tertiary">const</span> result{' '}
                <span className="text-text-secondary">=</span>{' '}
                <span className="text-accent-tertiary">await</span> market.
                <span className="text-accent-secondary">inference</span>(prompt)
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

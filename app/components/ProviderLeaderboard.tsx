'use client'

import { motion } from 'framer-motion'

interface Provider {
  rank: number
  name: string
  reputation: number
  uptime: number
  latency: number
  totalRequests: string
  revenue: string
  models: string[]
  region: string
}

export default function ProviderLeaderboard() {
  const providers: Provider[] = [
    {
      rank: 1,
      name: 'ParallaxNode-Alpha',
      reputation: 98.5,
      uptime: 99.97,
      latency: 42,
      totalRequests: '847K',
      revenue: '$12.4K',
      models: ['Qwen-2.5-72B', 'Llama-3.3-70B', 'DeepSeek-V3'],
      region: 'US-East',
    },
    {
      rank: 2,
      name: 'ParallaxNode-Beta',
      reputation: 97.2,
      uptime: 99.94,
      latency: 38,
      totalRequests: '723K',
      revenue: '$10.8K',
      models: ['Llama-3.3-70B', 'Qwen-2.5-32B'],
      region: 'EU-West',
    },
    {
      rank: 3,
      name: 'ParallaxNode-Gamma',
      reputation: 96.8,
      uptime: 99.89,
      latency: 51,
      totalRequests: '614K',
      revenue: '$9.2K',
      models: ['DeepSeek-V3', 'Llama-3.1-8B'],
      region: 'Asia-SE',
    },
    {
      rank: 4,
      name: 'ParallaxNode-Delta',
      reputation: 95.4,
      uptime: 99.85,
      latency: 47,
      totalRequests: '558K',
      revenue: '$8.1K',
      models: ['Qwen-2.5-72B', 'Llama-3.1-8B'],
      region: 'US-West',
    },
    {
      rank: 5,
      name: 'ParallaxNode-Epsilon',
      reputation: 94.9,
      uptime: 99.81,
      latency: 55,
      totalRequests: '492K',
      revenue: '$7.3K',
      models: ['Llama-3.3-70B', 'DeepSeek-V3'],
      region: 'EU-Central',
    },
  ]

  const getMedalEmoji = (rank: number) => {
    switch (rank) {
      case 1:
        return '🥇'
      case 2:
        return '🥈'
      case 3:
        return '🥉'
      default:
        return `#${rank}`
    }
  }

  return (
    <section className="relative py-20">
      {/* Grid background */}
      <div className="absolute inset-0 bg-grid-pattern bg-grid opacity-10" />

      <div className="relative z-10 max-w-7xl mx-auto px-6">
        <motion.div
          className="text-center mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <h2 className="text-5xl font-heading font-black mb-4">
            Top <span className="text-gradient">Providers</span>
          </h2>
          <p className="text-xl text-text-secondary">
            The most reliable and performant compute nodes on the network
          </p>
        </motion.div>

        {/* Leaderboard */}
        <div className="space-y-4">
          {providers.map((provider, index) => (
            <motion.div
              key={provider.name}
              className="glass-hover p-6 rounded-xl border border-border hover:border-accent-primary transition-all"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
                {/* Rank & Name */}
                <div className="lg:col-span-3 flex items-center gap-4">
                  <div className="text-3xl font-black">
                    {getMedalEmoji(provider.rank)}
                  </div>
                  <div>
                    <div className="font-heading font-bold text-xl text-white">
                      {provider.name}
                    </div>
                    <div className="text-sm text-text-secondary flex items-center gap-2">
                      <span className="w-2 h-2 bg-status-success rounded-full animate-pulse" />
                      {provider.region}
                    </div>
                  </div>
                </div>

                {/* Stats */}
                <div className="lg:col-span-6 grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <div className="text-xs text-text-secondary mb-1">Reputation</div>
                    <div className="text-lg font-bold text-gradient">
                      {provider.reputation}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary mb-1">Uptime</div>
                    <div className="text-lg font-bold text-status-success">
                      {provider.uptime}%
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary mb-1">Latency</div>
                    <div className="text-lg font-bold text-accent-tertiary">
                      {provider.latency}ms
                    </div>
                  </div>
                  <div>
                    <div className="text-xs text-text-secondary mb-1">Requests</div>
                    <div className="text-lg font-bold text-white">
                      {provider.totalRequests}
                    </div>
                  </div>
                </div>

                {/* Models & Revenue */}
                <div className="lg:col-span-3">
                  <div className="text-xs text-text-secondary mb-2">Models</div>
                  <div className="flex flex-wrap gap-2 mb-2">
                    {provider.models.map((model) => (
                      <span
                        key={model}
                        className="text-xs px-2 py-1 rounded bg-background-tertiary border border-border text-text-secondary"
                      >
                        {model}
                      </span>
                    ))}
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-text-secondary">24h Revenue</div>
                    <div className="text-lg font-bold text-accent-secondary">
                      {provider.revenue}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* View all providers CTA */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.5 }}
        >
          <button className="glass-hover neon-border px-8 py-4 rounded-xl font-heading font-semibold text-lg transition-all hover:scale-105">
            View All 47 Providers →
          </button>
        </motion.div>
      </div>
    </section>
  )
}

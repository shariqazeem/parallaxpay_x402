import Link from 'next/link'

export default function PremiumContentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-900 via-orange-900 to-red-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border-2 border-amber-500/30">
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
            <p className="text-green-200 font-semibold">✅ Payment Verified!</p>
            <p className="text-green-100">You paid $0.25 USDC via x402</p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-500 to-orange-600 rounded-full text-white text-sm font-semibold mb-4">
            <span className="animate-pulse">👑</span>
            Premium Tier
            <span className="animate-pulse">👑</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-6">
            Premium AI Inference - Maximum Power!
          </h1>

          <div className="bg-black/30 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-amber-300 mb-4">
              Advanced Model Suite Access
            </h2>
            <p className="text-gray-200 mb-4">
              Welcome to the Premium tier! You have access to our most powerful
              AI models with maximum token limits and priority processing.
            </p>
            <ul className="space-y-2 text-gray-300">
              <li>👑 512 tokens per request (5x more than Basic)</li>
              <li>👑 Access to multiple model architectures</li>
              <li>👑 Highest quality outputs</li>
              <li>👑 Dedicated GPU allocation</li>
              <li>👑 Lowest latency routing</li>
              <li>👑 Advanced reasoning & creativity</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500 rounded-lg p-4 mb-6">
            <h3 className="text-amber-300 font-semibold mb-2">
              Enterprise-Grade Performance
            </h3>
            <p className="text-amber-100 text-sm">
              Premium tier provides dedicated GPU resources through Gradient Parallax's
              highest-performance nodes. Perfect for production workloads, complex
              reasoning tasks, and professional content generation.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">512</div>
              <div className="text-xs text-gray-400">Max Tokens</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">&lt;100ms</div>
              <div className="text-xs text-gray-400">Avg Latency</div>
            </div>
            <div className="bg-black/20 rounded-lg p-3 text-center">
              <div className="text-2xl font-bold text-amber-400">99.9%</div>
              <div className="text-xs text-gray-400">Uptime SLA</div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-colors"
            >
              ← Back to Home
            </Link>
            <Link
              href="/"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white rounded-lg font-semibold transition-opacity"
            >
              Explore More →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
import Link from 'next/link'

export default function StandardContentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-pink-900 to-purple-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border-2 border-purple-500/30">
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
            <p className="text-green-200 font-semibold">✅ Payment Verified!</p>
            <p className="text-green-100">You paid $0.05 USDC via x402</p>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 bg-purple-500 rounded-full text-white text-sm font-semibold mb-4">
            <span className="animate-pulse">⭐</span>
            Standard Tier
            <span className="animate-pulse">⭐</span>
          </div>

          <h1 className="text-4xl font-bold text-white mb-6">
            Standard AI Inference - Activated!
          </h1>

          <div className="bg-black/30 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">
              Qwen 1.7B Model Access
            </h2>
            <p className="text-gray-200 mb-4">
              Welcome to the Standard tier! You now have access to our more powerful
              Qwen 1.7B parameter model with enhanced capabilities.
            </p>
            <ul className="space-y-2 text-gray-300">
              <li>⭐ 256 tokens per request (2.5x more than Basic)</li>
              <li>⭐ Better quality for creative writing</li>
              <li>⭐ Enhanced reasoning capabilities</li>
              <li>⭐ Multi-node GPU processing</li>
              <li>⭐ Priority queue access</li>
            </ul>
          </div>

          <div className="bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500 rounded-lg p-4 mb-6">
            <h3 className="text-purple-300 font-semibold mb-2">
              Gradient Parallax Integration
            </h3>
            <p className="text-purple-100 text-sm">
              This tier leverages distributed GPU nodes across the Gradient Parallax
              network, ensuring optimal performance while maintaining cost efficiency
              through micropayment batching.
            </p>
          </div>

          <div className="flex justify-between items-center">
            <Link
              href="/"
              className="px-6 py-3 bg-white/20 hover:bg-white/30 text-white rounded-lg font-semibold transition-colors"
            >
              ← Back to Home
            </Link>
            <Link
              href="/content/premium"
              className="px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 hover:opacity-90 text-white rounded-lg font-semibold transition-opacity"
            >
              Try Premium ($0.25) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
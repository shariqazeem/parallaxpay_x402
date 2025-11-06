import Link from 'next/link'

export default function BasicContentPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl">
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-4 mb-6">
            <p className="text-green-200 font-semibold">✅ Payment Verified!</p>
            <p className="text-green-100">You paid $0.01 USDC via x402</p>
          </div>

          <h1 className="text-4xl font-bold text-white mb-6">
            Basic AI Inference - Unlocked!
          </h1>

          <div className="bg-black/30 rounded-lg p-6 mb-6">
            <h2 className="text-2xl font-semibold text-purple-300 mb-4">
              Qwen 0.6B Model Access
            </h2>
            <p className="text-gray-200 mb-4">
              Welcome to the Basic tier! You now have access to our fast, efficient
              Qwen 0.6B parameter model through the Gradient Parallax distributed
              GPU network.
            </p>
            <ul className="space-y-2 text-gray-300">
              <li>✓ 100 tokens per request</li>
              <li>✓ ~200ms average response time</li>
              <li>✓ Perfect for quick queries and testing</li>
              <li>✓ Powered by Solana micropayments</li>
            </ul>
          </div>

          <div className="bg-purple-500/20 border border-purple-500 rounded-lg p-4 mb-6">
            <h3 className="text-purple-300 font-semibold mb-2">
              How x402 Protocol Works
            </h3>
            <p className="text-purple-100 text-sm">
              Your payment was processed instantly on Solana devnet using the x402
              protocol. The transaction was verified on-chain, and access was
              granted automatically - no accounts or subscriptions needed!
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
              href="/content/standard"
              className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:opacity-90 text-white rounded-lg font-semibold transition-opacity"
            >
              Try Standard ($0.05) →
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
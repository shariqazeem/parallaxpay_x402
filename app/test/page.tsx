export default function TestPage() {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">Test Payment Page</h1>
          <p className="text-gray-400 mb-8">
            This page requires $0.01 USDC payment via x402
          </p>
          <div className="bg-green-500/20 border border-green-500 rounded-lg p-6">
            <p className="text-green-300">
              If you see this, payment was successful!
            </p>
          </div>
        </div>
      </div>
    )
  }
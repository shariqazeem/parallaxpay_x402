'use client'

import { useState } from 'react'

export default function TestPaymentPage() {
  const [tier, setTier] = useState<'basic' | 'standard' | 'premium'>('basic')
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const prices = {
    basic: '$0.01',
    standard: '$0.05',
    premium: '$0.25'
  }

  const handlePayment = async () => {
    setLoading(true)
    setError(null)
    setResponse(null)

    try {
      // First request will return 402 Payment Required
      const res = await fetch(`/api/content/${tier}`)
      
      if (res.status === 402) {
        const paymentData = await res.json()
        console.log('Payment required:', paymentData)
        
        // Show payment requirements
        setError(`Payment Required: ${prices[tier]} USDC on Solana Devnet`)
        
        // In a real app, you would handle the payment here
        // For testing, the browser or wallet extension should handle it
      } else if (res.ok) {
        const data = await res.json()
        setResponse(data)
      } else {
        throw new Error(`Request failed: ${res.statusText}`)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">x402 Payment Test - Solana Devnet</h1>
        
        <div className="bg-gray-800 rounded-lg p-6 mb-6">
          <h2 className="text-2xl mb-4">Select Tier</h2>
          <div className="grid grid-cols-3 gap-4">
            {(['basic', 'standard', 'premium'] as const).map((t) => (
              <button
                key={t}
                onClick={() => setTier(t)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  tier === t 
                    ? 'border-purple-500 bg-purple-500/20' 
                    : 'border-gray-600 hover:border-purple-400'
                }`}
              >
                <div className="font-bold capitalize">{t}</div>
                <div className="text-2xl mt-2">{prices[t]}</div>
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-4 bg-purple-500 hover:bg-purple-600 disabled:bg-gray-600 rounded-lg font-bold text-lg transition-all"
        >
          {loading ? 'Processing...' : `Access ${tier} Content (${prices[tier]})`}
        </button>

        {error && (
          <div className="mt-6 p-4 bg-red-500/20 border border-red-500 rounded-lg">
            <h3 className="font-bold mb-2">Payment Required</h3>
            <p>{error}</p>
            <p className="mt-2 text-sm opacity-75">
              The x402 protocol has detected a payment requirement. 
              Connect your Solana wallet with devnet USDC to proceed.
            </p>
          </div>
        )}

        {response && (
          <div className="mt-6 p-4 bg-green-500/20 border border-green-500 rounded-lg">
            <h3 className="font-bold mb-2">✅ Payment Successful!</h3>
            <pre className="mt-2 text-sm overflow-auto">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-500/20 border border-blue-500 rounded-lg">
          <h3 className="font-bold mb-2">How x402 Works on Solana</h3>
          <ol className="list-decimal list-inside space-y-2 text-sm">
            <li>Click "Access Content" to request the protected endpoint</li>
            <li>Server returns HTTP 402 Payment Required with Solana payment details</li>
            <li>Your wallet (Phantom/Solflare) handles the USDC payment on devnet</li>
            <li>Payment is verified by the facilitator</li>
            <li>Content is delivered after successful payment</li>
          </ol>
        </div>
      </div>
    </div>
  )
}
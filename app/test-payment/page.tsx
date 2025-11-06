'use client'

import { useState } from 'react'
import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import WalletButton from '../components/WalletButton'
import {
  Transaction,
  PublicKey,
  SystemProgram,
  LAMPORTS_PER_SOL
} from '@solana/web3.js'
import {
  getAssociatedTokenAddress,
  createTransferInstruction,
  TOKEN_PROGRAM_ID,
  ASSOCIATED_TOKEN_PROGRAM_ID
} from '@solana/spl-token'

export default function TestPaymentPage() {
  const wallet = useWallet()
  const { publicKey, signTransaction, sendTransaction, signMessage } = wallet
  const { connection } = useConnection()
  const [tier, setTier] = useState<'basic' | 'standard' | 'premium'>('basic')
  const [response, setResponse] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [paymentInfo, setPaymentInfo] = useState<any>(null)

  const prices = {
    basic: '$0.01',
    standard: '$0.05',
    premium: '$0.25'
  }

  const handlePayment = async () => {
    if (!publicKey) {
      setError('Please connect your wallet first!')
      return
    }

    if (!signMessage) {
      setError('Your wallet does not support message signing. Please use Phantom or Solflare wallet.')
      return
    }

    setLoading(true)
    setError(null)
    setResponse(null)
    setPaymentInfo(null)

    try {
      // Import the payment handler dynamically
      const { fetchWithPayment } = await import('../lib/x402-payment')

      // Use the x402 payment handler - it will automatically handle 402 responses
      const data = await fetchWithPayment(
        `/api/content/${tier}`,
        wallet,
        { method: 'GET' }
      )

      setResponse(data)

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'

      // Check if it's a 402 payment required error
      if (errorMessage.includes('402') || errorMessage.includes('Payment')) {
        setError(`Payment Required: ${prices[tier]} USDC on Solana Devnet. ${errorMessage}`)
      } else {
        setError(errorMessage)
      }

      console.error('Payment error:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">x402 Payment Test - Solana Devnet</h1>
          <WalletButton />
        </div>

        {!publicKey && (
          <div className="mb-6 p-4 bg-yellow-500/20 border border-yellow-500 rounded-lg">
            <h3 className="font-bold mb-2">⚠️ Wallet Not Connected</h3>
            <p>Please connect your Solana wallet (Phantom, Solflare, etc.) to test x402 payments.</p>
          </div>
        )}

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
'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import WalletButton from '../components/WalletButton'
import Link from 'next/link'

export default function TestPaymentPage() {
  const { publicKey } = useWallet()

  const tiers = [
    {
      name: 'basic',
      price: '$0.01',
      path: '/content/basic',
      description: 'Qwen 0.6B - 100 tokens',
      color: 'from-blue-500 to-purple-600'
    },
    {
      name: 'standard',
      price: '$0.05',
      path: '/content/standard',
      description: 'Qwen 1.7B - 256 tokens',
      color: 'from-purple-500 to-pink-600'
    },
    {
      name: 'premium',
      price: '$0.25',
      path: '/content/premium',
      description: 'Advanced - 512 tokens',
      color: 'from-amber-500 to-orange-600'
    }
  ]

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold">x402 Payment Test - Solana Devnet</h1>
          <WalletButton />
        </div>

        <div className="mb-8 p-6 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500 rounded-lg">
          <h2 className="text-2xl font-bold mb-4">🚀 How to Test x402 Payments</h2>
          <ol className="space-y-2 text-sm">
            <li>✅ <strong>Connect your Solana wallet</strong> (Phantom or Solflare) using the button above</li>
            <li>✅ <strong>Make sure you're on Devnet</strong> in your wallet settings</li>
            <li>✅ <strong>Get devnet USDC</strong> from <a href="https://faucet.circle.com" target="_blank" className="text-blue-400 underline">faucet.circle.com</a></li>
            <li>✅ <strong>Click a tier below</strong> to access protected content</li>
            <li>✅ <strong>The x402 payment UI</strong> will handle the payment automatically</li>
          </ol>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold mb-4">Select a Payment Tier</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {tiers.map((tier) => (
              <Link
                key={tier.name}
                href={tier.path}
                className="block group"
              >
                <div className={`h-full p-6 rounded-xl border-2 border-gray-700 hover:border-purple-500 bg-gradient-to-br ${tier.color} bg-opacity-10 transition-all transform hover:scale-105`}>
                  <div className="flex justify-between items-start mb-4">
                    <h3 className="text-xl font-bold capitalize">{tier.name}</h3>
                    <div className="px-3 py-1 bg-black/30 rounded-full text-sm font-bold">
                      {tier.price}
                    </div>
                  </div>
                  <p className="text-gray-300 text-sm mb-4">{tier.description}</p>
                  <div className="flex items-center text-sm text-purple-400 group-hover:text-purple-300">
                    <span>Access Content</span>
                    <svg className="w-4 h-4 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        <div className="mt-8 p-6 bg-blue-500/20 border border-blue-500 rounded-lg">
          <h3 className="text-xl font-bold mb-4">💡 How x402 Works</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-semibold mb-2 text-blue-300">For You (The User):</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Click a tier above</li>
                <li>x402 detects payment requirement</li>
                <li>Payment UI appears automatically</li>
                <li>Approve with your wallet</li>
                <li>Access granted instantly!</li>
              </ol>
            </div>
            <div>
              <h4 className="font-semibold mb-2 text-blue-300">Behind the Scenes:</h4>
              <ol className="list-decimal list-inside space-y-1">
                <li>Server returns HTTP 402</li>
                <li>Payment details sent to browser</li>
                <li>Wallet signs payment (no fees)</li>
                <li>Facilitator verifies on Solana</li>
                <li>Content delivered</li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-6 p-4 bg-gray-800 rounded-lg">
          <h4 className="font-semibold mb-2">Need Help?</h4>
          <ul className="text-sm space-y-1">
            <li>• <strong>No USDC?</strong> Get devnet tokens from <a href="https://faucet.circle.com" target="_blank" className="text-blue-400">Circle's faucet</a></li>
            <li>• <strong>No wallet?</strong> Install <a href="https://phantom.app" target="_blank" className="text-blue-400">Phantom</a> or <a href="https://solflare.com" target="_blank" className="text-blue-400">Solflare</a></li>
            <li>• <strong>Wrong network?</strong> Switch to Devnet in your wallet settings</li>
            <li>• <strong>Need SOL?</strong> Get it from <a href="https://faucet.solana.com" target="_blank" className="text-blue-400">Solana faucet</a> (for transaction fees)</li>
          </ul>
        </div>
      </div>
    </div>
  )
}
'use client'

import Link from 'next/link'
import WalletButton from './components/WalletButton'
import { useWallet } from '@solana/wallet-adapter-react'

export default function HomePage() {
  const { publicKey } = useWallet()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">
      <div className="container mx-auto px-6 py-20">
        <div className="flex justify-end mb-8">
          <WalletButton />
        </div>
        <div className="text-center">
          <h1 className="text-6xl font-bold text-white mb-4">
            ParallaxPay
          </h1>
          <p className="text-2xl text-gray-300 mb-8">
            AI Micropayments on Solana with x402 Protocol
          </p>
          
          <div className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-500 rounded-full mb-12">
            <span className="w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
            <span className="text-green-400">Live on Solana Devnet</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mb-12">
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-2">Basic</h3>
              <div className="text-3xl font-bold text-purple-400 mb-2">$0.01</div>
              <p className="text-gray-400">100 tokens • Qwen 0.6B</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-purple-500">
              <h3 className="text-xl font-bold text-white mb-2">Standard</h3>
              <div className="text-3xl font-bold text-purple-400 mb-2">$0.05</div>
              <p className="text-gray-400">256 tokens • Qwen 1.7B</p>
            </div>
            <div className="bg-white/10 backdrop-blur rounded-xl p-6 border border-white/20">
              <h3 className="text-xl font-bold text-white mb-2">Premium</h3>
              <div className="text-3xl font-bold text-purple-400 mb-2">$0.25</div>
              <p className="text-gray-400">512 tokens • Advanced</p>
            </div>
          </div>

          <Link
            href="/test-payment"
            className="inline-block px-8 py-4 bg-purple-500 hover:bg-purple-600 text-white font-bold rounded-lg transition-all transform hover:scale-105"
          >
            Test x402 Payments →
          </Link>
        </div>
      </div>
    </div>
  )
}
'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

interface UnifiedNavbarProps {
  currentPage?: string
  showExtraButtons?: boolean
}

export function UnifiedNavbar({ currentPage, showExtraButtons = false }: UnifiedNavbarProps) {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-white/90 backdrop-blur-xl border-b border-gray-200"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8 lg:gap-12">
            <Link href="/">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-3 cursor-pointer"
              >
                <Image
                  src="/logo.png"
                  alt="ParallaxPay Logo"
                  width={48}
                  height={48}
                  className="w-12 h-12 object-contain"
                />
                <h1 className="text-2xl font-bold text-black">
                  ParallaxPay
                </h1>
              </motion.div>
            </Link>

            <nav className="hidden md:flex items-center gap-6 lg:gap-8">
              <Link
                href="/agents"
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'agents'
                    ? 'text-black font-bold'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                Agents
              </Link>
              <Link
                href="/oracle"
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'oracle'
                    ? 'text-black font-bold'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                Oracle
              </Link>
              <Link
                href="/analytics"
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'analytics'
                    ? 'text-black font-bold'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                Analytics
              </Link>
              <Link
                href="/marketplace"
                className={`text-sm font-medium transition-colors ${
                  currentPage === 'marketplace'
                    ? 'text-black font-bold'
                    : 'text-gray-700 hover:text-black'
                }`}
              >
                Marketplace
              </Link>
            </nav>
          </div>

          <div className="flex items-center gap-3">
            {/* Extra buttons for specific pages (like Agents) */}
            {showExtraButtons && currentPage === 'agents' && (
              <>
                <Link href="/agents?tab=builder">
                  <button className="hidden sm:flex px-4 py-2 rounded-lg text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 transition-all">
                    + Deploy Agent
                  </button>
                </Link>
              </>
            )}

            {mounted && (
              <WalletMultiButton className="!bg-black !text-white !rounded-lg !px-4 sm:!px-6 !py-2.5 !text-sm !font-semibold hover:!bg-gray-800 !transition-all !duration-200" />
            )}
          </div>
        </div>
      </div>
    </motion.header>
  )
}

'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

export default function Navbar() {
  const [mounted, setMounted] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()

  useEffect(() => {
    setMounted(true)
  }, [])

  // Close mobile menu when route changes
  useEffect(() => {
    setIsOpen(false)
  }, [pathname])

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/oracle', label: '🔮 Oracle', highlight: true },
    { href: '/agents', label: 'Agents' },
    { href: '/marketplace', label: 'Providers' },
    { href: '/swarm', label: 'Swarm' },
    { href: '/leaderboard', label: 'Leaderboard' },
  ]

  const isActive = (href: string) => pathname === href

  return (
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="flex items-center gap-3 cursor-pointer"
            >
              <div className="w-8 h-8 bg-gradient-to-br from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-lg font-bold">P</span>
              </div>
              <h1 className="text-xl font-bold text-black">
                ParallaxPay
              </h1>
            </motion.div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link key={link.href} href={link.href}>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold transition-all ${
                    isActive(link.href)
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                      : link.highlight
                      ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-2 border-orange-300'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                  }`}
                >
                  {link.label}
                </motion.div>
              </Link>
            ))}
          </nav>

          {/* Desktop Wallet Button */}
          <div className="hidden md:flex items-center gap-3">
            {mounted && (
              <WalletMultiButton className="!bg-gradient-to-r !from-purple-600 !to-pink-600 !text-white !rounded-xl !px-6 !py-2.5 !text-sm !font-bold hover:!opacity-90 !transition-all !duration-200 !shadow-lg hover:!shadow-xl" />
            )}
          </div>

          {/* Mobile Menu Button */}
          <motion.button
            whileTap={{ scale: 0.95 }}
            onClick={() => setIsOpen(!isOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Toggle menu"
          >
            <div className="w-6 h-5 relative flex flex-col justify-between">
              <motion.span
                animate={isOpen ? { rotate: 45, y: 8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-black rounded-full origin-left transition-all"
              />
              <motion.span
                animate={isOpen ? { opacity: 0 } : { opacity: 1 }}
                className="w-full h-0.5 bg-black rounded-full transition-all"
              />
              <motion.span
                animate={isOpen ? { rotate: -45, y: -8 } : { rotate: 0, y: 0 }}
                className="w-full h-0.5 bg-black rounded-full origin-left transition-all"
              />
            </div>
          </motion.button>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden border-t border-gray-200 bg-white overflow-hidden"
          >
            <div className="px-4 py-4 space-y-2">
              {navLinks.map((link, index) => (
                <motion.div
                  key={link.href}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Link href={link.href}>
                    <div
                      className={`block px-4 py-3 rounded-lg text-sm font-semibold transition-all ${
                        isActive(link.href)
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 text-purple-700'
                          : link.highlight
                          ? 'bg-gradient-to-r from-yellow-100 to-orange-100 text-orange-700 border-2 border-orange-300'
                          : 'text-gray-700 hover:bg-gray-100 hover:text-black'
                      }`}
                    >
                      {link.label}
                    </div>
                  </Link>
                </motion.div>
              ))}

              {/* Mobile Wallet Button */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: navLinks.length * 0.05 }}
                className="pt-2"
              >
                {mounted && (
                  <WalletMultiButton className="!w-full !bg-gradient-to-r !from-purple-600 !to-pink-600 !text-white !rounded-xl !px-6 !py-3 !text-sm !font-bold hover:!opacity-90 !transition-all !duration-200 !shadow-lg" />
                )}
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  )
}

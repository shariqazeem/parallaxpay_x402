'use client'

import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  CRYPTO_DATABASE,
  CRYPTO_CATEGORIES,
  getCoinsByCategory,
  searchCoins,
  getTopCoins,
  FEATURED_COINS,
  getAllCategories,
  TOTAL_SUPPORTED_COINS,
  type CryptoAsset
} from '../lib/crypto-database'

interface CoinSelectorProps {
  selectedCoin: string
  onSelectCoin: (symbol: string) => void
  className?: string
}

export function CoinSelector({ selectedCoin, onSelectCoin, className = '' }: CoinSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL')

  const categories = getAllCategories()

  // Filter coins based on search and category
  const filteredCoins = useMemo(() => {
    // If searching, search across all coins (ignore category filter)
    if (searchQuery.trim()) {
      return searchCoins(searchQuery)
    }

    // Otherwise, apply category filter
    if (selectedCategory !== 'ALL') {
      return getCoinsByCategory(selectedCategory as any)
    }

    // Default: show all coins
    return CRYPTO_DATABASE
  }, [searchQuery, selectedCategory])

  const selectedCoinData = CRYPTO_DATABASE.find(c => c.symbol === selectedCoin)

  return (
    <div className={`relative ${className}`}>
      {/* Selected Coin Display */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-4 py-3 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border-2 border-purple-500/30 rounded-xl hover:border-purple-400/50 transition-all duration-200"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center font-bold text-white">
            {selectedCoinData?.symbol || '?'}
          </div>
          <div className="text-left">
            <div className="font-bold text-white">{selectedCoinData?.name || 'Select Coin'}</div>
            <div className="text-xs text-gray-400">
              {selectedCoinData?.category ? CRYPTO_CATEGORIES[selectedCoinData.category as keyof typeof CRYPTO_CATEGORIES] : 'Choose from 150+ coins'}
            </div>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-purple-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown Modal */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />

            {/* Dropdown Content */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              className="absolute top-full mt-2 left-0 right-0 bg-gray-900/95 backdrop-blur-xl border-2 border-purple-500/30 rounded-2xl shadow-2xl z-50 max-h-[600px] overflow-hidden flex flex-col"
            >
              {/* Header */}
              <div className="p-4 border-b border-purple-500/20">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-bold text-white">Select Cryptocurrency</h3>
                  <div className="text-xs text-purple-400 bg-purple-500/20 px-3 py-1 rounded-full">
                    {TOTAL_SUPPORTED_COINS} coins
                  </div>
                </div>

                {/* Search Bar */}
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name or symbol..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      // Reset category when searching to search across all coins
                      if (e.target.value.trim()) {
                        setSelectedCategory('ALL')
                      }
                    }}
                    className="w-full px-4 py-2 pl-10 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/50"
                  />
                  <svg
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Featured Coins (only show when no search) */}
              {!searchQuery && (
                <div className="p-4 border-b border-purple-500/20">
                  <div className="text-xs text-gray-400 mb-2">FEATURED</div>
                  <div className="flex flex-wrap gap-2">
                    {FEATURED_COINS.map(symbol => {
                      const coin = CRYPTO_DATABASE.find(c => c.symbol === symbol)
                      if (!coin) return null
                      return (
                        <button
                          key={symbol}
                          onClick={() => {
                            onSelectCoin(symbol)
                            setIsOpen(false)
                          }}
                          className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                            selectedCoin === symbol
                              ? 'bg-purple-500 text-white'
                              : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                          }`}
                        >
                          {symbol}
                        </button>
                      )
                    })}
                  </div>
                </div>
              )}

              {/* Category Tabs (only show when no search) */}
              {!searchQuery && (
                <div className="p-4 border-b border-purple-500/20 overflow-x-auto">
                  <div className="flex gap-2 min-w-max">
                    <button
                      onClick={() => setSelectedCategory('ALL')}
                      className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                        selectedCategory === 'ALL'
                          ? 'bg-purple-500 text-white'
                          : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                      }`}
                    >
                      All ({CRYPTO_DATABASE.length})
                    </button>
                    {categories.map(cat => (
                      <button
                        key={cat.key}
                        onClick={() => setSelectedCategory(cat.key)}
                        className={`px-3 py-1.5 rounded-lg text-sm whitespace-nowrap ${
                          selectedCategory === cat.key
                            ? 'bg-purple-500 text-white'
                            : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                        }`}
                      >
                        {cat.label} ({cat.count})
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Coin List */}
              <div className="flex-1 overflow-y-auto p-2">
                {filteredCoins.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <div className="font-medium">No coins found</div>
                    <div className="text-sm mt-1">Try a different search query</div>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {filteredCoins.map(coin => (
                      <button
                        key={coin.coinGeckoId}
                        onClick={() => {
                          onSelectCoin(coin.symbol)
                          setIsOpen(false)
                          setSearchQuery('')
                        }}
                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all ${
                          selectedCoin === coin.symbol
                            ? 'bg-purple-500/30 border border-purple-500/50'
                            : 'hover:bg-gray-800/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                            selectedCoin === coin.symbol
                              ? 'bg-gradient-to-br from-purple-400 to-pink-400 text-white'
                              : 'bg-gray-700 text-gray-300'
                          }`}>
                            {coin.symbol}
                          </div>
                          <div className="text-left">
                            <div className="font-medium text-white text-sm">{coin.name}</div>
                            <div className="text-xs text-gray-500">{coin.symbol}</div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {coin.marketCapRank && coin.marketCapRank <= 50 && (
                            <div className="text-xs text-purple-400 bg-purple-500/20 px-2 py-0.5 rounded">
                              #{coin.marketCapRank}
                            </div>
                          )}
                          <div className="text-xs text-gray-500">
                            {CRYPTO_CATEGORIES[coin.category as keyof typeof CRYPTO_CATEGORIES]}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="p-3 border-t border-purple-500/20 bg-gray-900/50">
                <div className="text-xs text-center text-gray-500">
                  Powered by CoinGecko API • Real-time market data for {TOTAL_SUPPORTED_COINS}+ cryptocurrencies
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

// Compact version for smaller spaces
export function CoinSelectorCompact({ selectedCoin, onSelectCoin, className = '' }: CoinSelectorProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  const filteredCoins = useMemo(() => {
    if (!searchQuery.trim()) {
      return getTopCoins(20)
    }
    return searchCoins(searchQuery)
  }, [searchQuery])

  const selectedCoinData = CRYPTO_DATABASE.find(c => c.symbol === selectedCoin)

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-purple-500/20 border border-purple-500/30 rounded-lg hover:border-purple-400/50 transition-all"
      >
        <span className="font-bold text-white">{selectedCoinData?.symbol || '?'}</span>
        <svg className={`w-4 h-4 text-purple-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 z-40"
            />

            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="absolute top-full mt-2 left-0 min-w-[300px] bg-gray-900/95 backdrop-blur-xl border-2 border-purple-500/30 rounded-xl shadow-2xl z-50 max-h-[400px] overflow-hidden flex flex-col"
            >
              <div className="p-3 border-b border-purple-500/20">
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-800/50 border border-purple-500/30 rounded-lg text-white text-sm placeholder-gray-500 focus:outline-none focus:border-purple-400/50"
                />
              </div>

              <div className="flex-1 overflow-y-auto p-2">
                {filteredCoins.map(coin => (
                  <button
                    key={coin.coinGeckoId}
                    onClick={() => {
                      onSelectCoin(coin.symbol)
                      setIsOpen(false)
                      setSearchQuery('')
                    }}
                    className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-all text-sm ${
                      selectedCoin === coin.symbol
                        ? 'bg-purple-500/30 border border-purple-500/50'
                        : 'hover:bg-gray-800/50'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                      selectedCoin === coin.symbol ? 'bg-purple-400 text-white' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {coin.symbol.slice(0, 2)}
                    </div>
                    <span className="font-medium text-white">{coin.name}</span>
                    <span className="text-gray-500 ml-auto">{coin.symbol}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  )
}

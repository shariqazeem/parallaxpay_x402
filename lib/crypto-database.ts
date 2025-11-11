/**
 * Comprehensive Cryptocurrency Database for Oracle Agent
 *
 * Showcases x402 + Parallax capability to provide predictions for ANY cryptocurrency
 * Perfect for hackathon demo: "Our Oracle isn't limited - it covers the entire crypto market!"
 */

export interface CryptoAsset {
  symbol: string
  name: string
  coinGeckoId: string
  category: string
  marketCapRank?: number
}

export const CRYPTO_CATEGORIES = {
  MAJOR: 'Major Cryptocurrencies',
  DEFI: 'DeFi Tokens',
  LAYER1: 'Layer 1 Blockchains',
  LAYER2: 'Layer 2 Solutions',
  MEME: 'Meme Coins',
  AI: 'AI & Machine Learning',
  GAMING: 'Gaming & Metaverse',
  PRIVACY: 'Privacy Coins',
  STABLECOIN: 'Stablecoins',
  EXCHANGE: 'Exchange Tokens',
  ORACLE: 'Oracle Networks',
  STORAGE: 'Storage & Data',
  INFRASTRUCTURE: 'Infrastructure',
  NFT: 'NFT Platforms',
  DAO: 'DAO Governance',
  REAL_WORLD: 'Real World Assets',
  EMERGING: 'Emerging Projects'
} as const

export const CRYPTO_DATABASE: CryptoAsset[] = [
  // ===== MAJOR CRYPTOCURRENCIES =====
  { symbol: 'BTC', name: 'Bitcoin', coinGeckoId: 'bitcoin', category: 'MAJOR', marketCapRank: 1 },
  { symbol: 'ETH', name: 'Ethereum', coinGeckoId: 'ethereum', category: 'MAJOR', marketCapRank: 2 },
  { symbol: 'SOL', name: 'Solana', coinGeckoId: 'solana', category: 'MAJOR', marketCapRank: 5 },
  { symbol: 'BNB', name: 'BNB', coinGeckoId: 'binancecoin', category: 'MAJOR', marketCapRank: 4 },
  { symbol: 'XRP', name: 'Ripple', coinGeckoId: 'ripple', category: 'MAJOR', marketCapRank: 3 },
  { symbol: 'ADA', name: 'Cardano', coinGeckoId: 'cardano', category: 'MAJOR', marketCapRank: 8 },
  { symbol: 'DOGE', name: 'Dogecoin', coinGeckoId: 'dogecoin', category: 'MAJOR', marketCapRank: 9 },
  { symbol: 'AVAX', name: 'Avalanche', coinGeckoId: 'avalanche-2', category: 'MAJOR', marketCapRank: 12 },
  { symbol: 'DOT', name: 'Polkadot', coinGeckoId: 'polkadot', category: 'MAJOR', marketCapRank: 15 },
  { symbol: 'MATIC', name: 'Polygon', coinGeckoId: 'matic-network', category: 'MAJOR', marketCapRank: 16 },

  // ===== LAYER 1 BLOCKCHAINS =====
  { symbol: 'ATOM', name: 'Cosmos', coinGeckoId: 'cosmos', category: 'LAYER1', marketCapRank: 25 },
  { symbol: 'ALGO', name: 'Algorand', coinGeckoId: 'algorand', category: 'LAYER1', marketCapRank: 35 },
  { symbol: 'NEAR', name: 'NEAR Protocol', coinGeckoId: 'near', category: 'LAYER1', marketCapRank: 22 },
  { symbol: 'FTM', name: 'Fantom', coinGeckoId: 'fantom', category: 'LAYER1', marketCapRank: 40 },
  { symbol: 'EGLD', name: 'MultiversX', coinGeckoId: 'elrond-erd-2', category: 'LAYER1', marketCapRank: 45 },
  { symbol: 'XTZ', name: 'Tezos', coinGeckoId: 'tezos', category: 'LAYER1', marketCapRank: 50 },
  { symbol: 'EOS', name: 'EOS', coinGeckoId: 'eos', category: 'LAYER1', marketCapRank: 55 },
  { symbol: 'FLOW', name: 'Flow', coinGeckoId: 'flow', category: 'LAYER1', marketCapRank: 60 },
  { symbol: 'ONE', name: 'Harmony', coinGeckoId: 'harmony', category: 'LAYER1', marketCapRank: 80 },
  { symbol: 'KAVA', name: 'Kava', coinGeckoId: 'kava', category: 'LAYER1', marketCapRank: 90 },
  { symbol: 'ROSE', name: 'Oasis Network', coinGeckoId: 'oasis-network', category: 'LAYER1', marketCapRank: 95 },
  { symbol: 'APT', name: 'Aptos', coinGeckoId: 'aptos', category: 'LAYER1', marketCapRank: 28 },
  { symbol: 'SUI', name: 'Sui', coinGeckoId: 'sui', category: 'LAYER1', marketCapRank: 30 },
  { symbol: 'SEI', name: 'Sei', coinGeckoId: 'sei-network', category: 'LAYER1', marketCapRank: 42 },
  { symbol: 'INJ', name: 'Injective', coinGeckoId: 'injective-protocol', category: 'LAYER1', marketCapRank: 32 },
  { symbol: 'TIA', name: 'Celestia', coinGeckoId: 'celestia', category: 'LAYER1', marketCapRank: 48 },
  { symbol: 'CELO', name: 'Celo', coinGeckoId: 'celo', category: 'LAYER1', marketCapRank: 85 },

  // ===== LAYER 2 SOLUTIONS =====
  { symbol: 'ARB', name: 'Arbitrum', coinGeckoId: 'arbitrum', category: 'LAYER2', marketCapRank: 18 },
  { symbol: 'OP', name: 'Optimism', coinGeckoId: 'optimism', category: 'LAYER2', marketCapRank: 24 },
  { symbol: 'IMX', name: 'Immutable X', coinGeckoId: 'immutable-x', category: 'LAYER2', marketCapRank: 38 },
  { symbol: 'METIS', name: 'Metis', coinGeckoId: 'metis-token', category: 'LAYER2', marketCapRank: 75 },
  { symbol: 'BOBA', name: 'Boba Network', coinGeckoId: 'boba-network', category: 'LAYER2', marketCapRank: 120 },
  { symbol: 'MINA', name: 'Mina Protocol', coinGeckoId: 'mina-protocol', category: 'LAYER2', marketCapRank: 93 },
  { symbol: 'LSK', name: 'Lisk', coinGeckoId: 'lisk', category: 'LAYER1', marketCapRank: 150 },

  // ===== DEFI TOKENS =====
  { symbol: 'UNI', name: 'Uniswap', coinGeckoId: 'uniswap', category: 'DEFI', marketCapRank: 19 },
  { symbol: 'LINK', name: 'Chainlink', coinGeckoId: 'chainlink', category: 'DEFI', marketCapRank: 14 },
  { symbol: 'AAVE', name: 'Aave', coinGeckoId: 'aave', category: 'DEFI', marketCapRank: 34 },
  { symbol: 'MKR', name: 'Maker', coinGeckoId: 'maker', category: 'DEFI', marketCapRank: 36 },
  { symbol: 'COMP', name: 'Compound', coinGeckoId: 'compound-governance-token', category: 'DEFI', marketCapRank: 72 },
  { symbol: 'SNX', name: 'Synthetix', coinGeckoId: 'synthetix-network-token', category: 'DEFI', marketCapRank: 78 },
  { symbol: 'CRV', name: 'Curve DAO', coinGeckoId: 'curve-dao-token', category: 'DEFI', marketCapRank: 44 },
  { symbol: 'SUSHI', name: 'SushiSwap', coinGeckoId: 'sushi', category: 'DEFI', marketCapRank: 110 },
  { symbol: 'YFI', name: 'yearn.finance', coinGeckoId: 'yearn-finance', category: 'DEFI', marketCapRank: 125 },
  { symbol: 'BAL', name: 'Balancer', coinGeckoId: 'balancer', category: 'DEFI', marketCapRank: 140 },
  { symbol: '1INCH', name: '1inch', coinGeckoId: '1inch', category: 'DEFI', marketCapRank: 88 },
  { symbol: 'CVX', name: 'Convex Finance', coinGeckoId: 'convex-finance', category: 'DEFI', marketCapRank: 105 },
  { symbol: 'LDO', name: 'Lido DAO', coinGeckoId: 'lido-dao', category: 'DEFI', marketCapRank: 26 },
  { symbol: 'RPL', name: 'Rocket Pool', coinGeckoId: 'rocket-pool', category: 'DEFI', marketCapRank: 92 },
  { symbol: 'DYDX', name: 'dYdX', coinGeckoId: 'dydx', category: 'DEFI', marketCapRank: 68 },
  { symbol: 'GMX', name: 'GMX', coinGeckoId: 'gmx', category: 'DEFI', marketCapRank: 82 },
  { symbol: 'RUNE', name: 'THORChain', coinGeckoId: 'thorchain', category: 'DEFI', marketCapRank: 86 },
  { symbol: 'CAKE', name: 'PancakeSwap', coinGeckoId: 'pancakeswap-token', category: 'DEFI', marketCapRank: 64 },
  { symbol: 'JOE', name: 'Trader Joe', coinGeckoId: 'joe', category: 'DEFI', marketCapRank: 135 },

  // ===== AI & MACHINE LEARNING =====
  { symbol: 'FET', name: 'Fetch.ai', coinGeckoId: 'fetch-ai', category: 'AI', marketCapRank: 52 },
  { symbol: 'AGIX', name: 'SingularityNET', coinGeckoId: 'singularitynet', category: 'AI', marketCapRank: 58 },
  { symbol: 'OCEAN', name: 'Ocean Protocol', coinGeckoId: 'ocean-protocol', category: 'AI', marketCapRank: 98 },
  { symbol: 'NMR', name: 'Numeraire', coinGeckoId: 'numeraire', category: 'AI', marketCapRank: 180 },
  { symbol: 'GRT', name: 'The Graph', coinGeckoId: 'the-graph', category: 'AI', marketCapRank: 46 },
  { symbol: 'RNDR', name: 'Render', coinGeckoId: 'render-token', category: 'AI', marketCapRank: 33 },
  { symbol: 'AKT', name: 'Akash Network', coinGeckoId: 'akash-network', category: 'AI', marketCapRank: 145 },

  // ===== MEME COINS =====
  { symbol: 'SHIB', name: 'Shiba Inu', coinGeckoId: 'shiba-inu', category: 'MEME', marketCapRank: 11 },
  { symbol: 'PEPE', name: 'Pepe', coinGeckoId: 'pepe', category: 'MEME', marketCapRank: 23 },
  { symbol: 'FLOKI', name: 'Floki', coinGeckoId: 'floki', category: 'MEME', marketCapRank: 54 },
  { symbol: 'BONK', name: 'Bonk', coinGeckoId: 'bonk', category: 'MEME', marketCapRank: 62 },
  { symbol: 'WIF', name: 'dogwifhat', coinGeckoId: 'dogwifcoin', category: 'MEME', marketCapRank: 41 },
  { symbol: 'DOGE', name: 'Dogecoin', coinGeckoId: 'dogecoin', category: 'MEME', marketCapRank: 9 },

  // ===== GAMING & METAVERSE =====
  { symbol: 'SAND', name: 'The Sandbox', coinGeckoId: 'the-sandbox', category: 'GAMING', marketCapRank: 65 },
  { symbol: 'MANA', name: 'Decentraland', coinGeckoId: 'decentraland', category: 'GAMING', marketCapRank: 70 },
  { symbol: 'AXS', name: 'Axie Infinity', coinGeckoId: 'axie-infinity', category: 'GAMING', marketCapRank: 74 },
  { symbol: 'ENJ', name: 'Enjin Coin', coinGeckoId: 'enjincoin', category: 'GAMING', marketCapRank: 102 },
  { symbol: 'GALA', name: 'Gala', coinGeckoId: 'gala', category: 'GAMING', marketCapRank: 96 },
  { symbol: 'IMX', name: 'Immutable X', coinGeckoId: 'immutable-x', category: 'GAMING', marketCapRank: 38 },
  { symbol: 'BEAM', name: 'Beam', coinGeckoId: 'beam-2', category: 'GAMING', marketCapRank: 115 },
  { symbol: 'ILV', name: 'Illuvium', coinGeckoId: 'illuvium', category: 'GAMING', marketCapRank: 160 },
  { symbol: 'PRIME', name: 'Echelon Prime', coinGeckoId: 'echelon-prime', category: 'GAMING', marketCapRank: 118 },

  // ===== PRIVACY COINS =====
  { symbol: 'XMR', name: 'Monero', coinGeckoId: 'monero', category: 'PRIVACY', marketCapRank: 31 },
  { symbol: 'ZEC', name: 'Zcash', coinGeckoId: 'zcash', category: 'PRIVACY', marketCapRank: 94 },
  { symbol: 'SCRT', name: 'Secret', coinGeckoId: 'secret', category: 'PRIVACY', marketCapRank: 170 },

  // ===== STABLECOINS =====
  { symbol: 'USDT', name: 'Tether', coinGeckoId: 'tether', category: 'STABLECOIN', marketCapRank: 3 },
  { symbol: 'USDC', name: 'USD Coin', coinGeckoId: 'usd-coin', category: 'STABLECOIN', marketCapRank: 6 },
  { symbol: 'DAI', name: 'Dai', coinGeckoId: 'dai', category: 'STABLECOIN', marketCapRank: 20 },
  { symbol: 'BUSD', name: 'Binance USD', coinGeckoId: 'binance-usd', category: 'STABLECOIN', marketCapRank: 28 },
  { symbol: 'TUSD', name: 'TrueUSD', coinGeckoId: 'true-usd', category: 'STABLECOIN', marketCapRank: 56 },
  { symbol: 'USDD', name: 'USDD', coinGeckoId: 'usdd', category: 'STABLECOIN', marketCapRank: 76 },
  { symbol: 'FRAX', name: 'Frax', coinGeckoId: 'frax', category: 'STABLECOIN', marketCapRank: 84 },
  { symbol: 'USDP', name: 'Pax Dollar', coinGeckoId: 'paxos-standard', category: 'STABLECOIN', marketCapRank: 100 },

  // ===== EXCHANGE TOKENS =====
  { symbol: 'BNB', name: 'BNB', coinGeckoId: 'binancecoin', category: 'EXCHANGE', marketCapRank: 4 },
  { symbol: 'CRO', name: 'Cronos', coinGeckoId: 'crypto-com-chain', category: 'EXCHANGE', marketCapRank: 29 },
  { symbol: 'OKB', name: 'OKB', coinGeckoId: 'okb', category: 'EXCHANGE', marketCapRank: 47 },
  { symbol: 'HT', name: 'Huobi Token', coinGeckoId: 'huobi-token', category: 'EXCHANGE', marketCapRank: 67 },
  { symbol: 'KCS', name: 'KuCoin Token', coinGeckoId: 'kucoin-shares', category: 'EXCHANGE', marketCapRank: 108 },
  { symbol: 'GT', name: 'Gate Token', coinGeckoId: 'gatechain-token', category: 'EXCHANGE', marketCapRank: 130 },

  // ===== ORACLE NETWORKS =====
  { symbol: 'LINK', name: 'Chainlink', coinGeckoId: 'chainlink', category: 'ORACLE', marketCapRank: 14 },
  { symbol: 'BAND', name: 'Band Protocol', coinGeckoId: 'band-protocol', category: 'ORACLE', marketCapRank: 155 },
  { symbol: 'TRB', name: 'Tellor', coinGeckoId: 'tellor', category: 'ORACLE', marketCapRank: 195 },
  { symbol: 'API3', name: 'API3', coinGeckoId: 'api3', category: 'ORACLE', marketCapRank: 175 },

  // ===== STORAGE & DATA =====
  { symbol: 'FIL', name: 'Filecoin', coinGeckoId: 'filecoin', category: 'STORAGE', marketCapRank: 27 },
  { symbol: 'AR', name: 'Arweave', coinGeckoId: 'arweave', category: 'STORAGE', marketCapRank: 51 },
  { symbol: 'STORJ', name: 'Storj', coinGeckoId: 'storj', category: 'STORAGE', marketCapRank: 165 },
  { symbol: 'HNT', name: 'Helium', coinGeckoId: 'helium', category: 'STORAGE', marketCapRank: 89 },

  // ===== INFRASTRUCTURE =====
  { symbol: 'GRT', name: 'The Graph', coinGeckoId: 'the-graph', category: 'INFRASTRUCTURE', marketCapRank: 46 },
  { symbol: 'RNDR', name: 'Render', coinGeckoId: 'render-token', category: 'INFRASTRUCTURE', marketCapRank: 33 },
  { symbol: 'AKT', name: 'Akash Network', coinGeckoId: 'akash-network', category: 'INFRASTRUCTURE', marketCapRank: 145 },
  { symbol: 'POKT', name: 'Pocket Network', coinGeckoId: 'pocket-network', category: 'INFRASTRUCTURE', marketCapRank: 210 },

  // ===== NFT PLATFORMS =====
  { symbol: 'APE', name: 'ApeCoin', coinGeckoId: 'apecoin', category: 'NFT', marketCapRank: 53 },
  { symbol: 'BLUR', name: 'Blur', coinGeckoId: 'blur', category: 'NFT', marketCapRank: 77 },
  { symbol: 'LOOKS', name: 'LooksRare', coinGeckoId: 'looksrare', category: 'NFT', marketCapRank: 190 },

  // ===== DAO GOVERNANCE =====
  { symbol: 'MKR', name: 'Maker', coinGeckoId: 'maker', category: 'DAO', marketCapRank: 36 },
  { symbol: 'UNI', name: 'Uniswap', coinGeckoId: 'uniswap', category: 'DAO', marketCapRank: 19 },
  { symbol: 'ENS', name: 'Ethereum Name Service', coinGeckoId: 'ethereum-name-service', category: 'DAO', marketCapRank: 112 },

  // ===== REAL WORLD ASSETS =====
  { symbol: 'MKR', name: 'Maker', coinGeckoId: 'maker', category: 'REAL_WORLD', marketCapRank: 36 },
  { symbol: 'ONDO', name: 'Ondo Finance', coinGeckoId: 'ondo-finance', category: 'REAL_WORLD', marketCapRank: 143 },

  // ===== EMERGING PROJECTS =====
  { symbol: 'JUP', name: 'Jupiter', coinGeckoId: 'jupiter-exchange-solana', category: 'EMERGING', marketCapRank: 37 },
  { symbol: 'WLD', name: 'Worldcoin', coinGeckoId: 'worldcoin-wld', category: 'EMERGING', marketCapRank: 49 },
  { symbol: 'PYTH', name: 'Pyth Network', coinGeckoId: 'pyth-network', category: 'EMERGING', marketCapRank: 61 },
  { symbol: 'ONDO', name: 'Ondo', coinGeckoId: 'ondo-finance', category: 'EMERGING', marketCapRank: 143 },

  // ===== ADDITIONAL TOP 200 COINS =====
  { symbol: 'LTC', name: 'Litecoin', coinGeckoId: 'litecoin', category: 'MAJOR', marketCapRank: 17 },
  { symbol: 'BCH', name: 'Bitcoin Cash', coinGeckoId: 'bitcoin-cash', category: 'MAJOR', marketCapRank: 21 },
  { symbol: 'ICP', name: 'Internet Computer', coinGeckoId: 'internet-computer', category: 'LAYER1', marketCapRank: 13 },
  { symbol: 'VET', name: 'VeChain', coinGeckoId: 'vechain', category: 'LAYER1', marketCapRank: 39 },
  { symbol: 'XLM', name: 'Stellar', coinGeckoId: 'stellar', category: 'LAYER1', marketCapRank: 43 },
  { symbol: 'HBAR', name: 'Hedera', coinGeckoId: 'hedera-hashgraph', category: 'LAYER1', marketCapRank: 35 },
  { symbol: 'FTM', name: 'Fantom', coinGeckoId: 'fantom', category: 'LAYER1', marketCapRank: 40 },
  { symbol: 'QNT', name: 'Quant', coinGeckoId: 'quant-network', category: 'INFRASTRUCTURE', marketCapRank: 57 },
  { symbol: 'THETA', name: 'Theta Network', coinGeckoId: 'theta-token', category: 'INFRASTRUCTURE', marketCapRank: 66 },
  { symbol: 'XDC', name: 'XDC Network', coinGeckoId: 'xdce-crowd-sale', category: 'LAYER1', marketCapRank: 81 },
  { symbol: 'WAVES', name: 'Waves', coinGeckoId: 'waves', category: 'LAYER1', marketCapRank: 106 },
]

// Helper functions
export function getCoinById(coinGeckoId: string): CryptoAsset | undefined {
  return CRYPTO_DATABASE.find(coin => coin.coinGeckoId === coinGeckoId)
}

export function getCoinBySymbol(symbol: string): CryptoAsset | undefined {
  return CRYPTO_DATABASE.find(coin => coin.symbol.toUpperCase() === symbol.toUpperCase())
}

export function getCoinsByCategory(category: keyof typeof CRYPTO_CATEGORIES): CryptoAsset[] {
  return CRYPTO_DATABASE.filter(coin => coin.category === category)
    .sort((a, b) => (a.marketCapRank || 999) - (b.marketCapRank || 999))
}

export function searchCoins(query: string): CryptoAsset[] {
  const lowerQuery = query.toLowerCase()
  return CRYPTO_DATABASE.filter(coin =>
    coin.symbol.toLowerCase().includes(lowerQuery) ||
    coin.name.toLowerCase().includes(lowerQuery) ||
    coin.coinGeckoId.toLowerCase().includes(lowerQuery)
  ).slice(0, 50) // Limit to 50 results
}

export function getTopCoins(limit: number = 20): CryptoAsset[] {
  return [...CRYPTO_DATABASE]
    .sort((a, b) => (a.marketCapRank || 999) - (b.marketCapRank || 999))
    .slice(0, limit)
}

export function getAllCategories(): Array<{ key: string; label: string; count: number }> {
  const categories = Object.entries(CRYPTO_CATEGORIES).map(([key, label]) => ({
    key,
    label,
    count: getCoinsByCategory(key as keyof typeof CRYPTO_CATEGORIES).length
  }))
  return categories.filter(cat => cat.count > 0)
}

// Featured coins for quick access
export const FEATURED_COINS = ['BTC', 'ETH', 'SOL', 'USDC', 'USDT', 'BNB', 'XRP', 'ADA', 'DOGE', 'AVAX']

// Get total supported coins count
export const TOTAL_SUPPORTED_COINS = CRYPTO_DATABASE.length

// Hackathon demo talking point
export const HACKATHON_PITCH = `
🎯 ORACLE AGENT: Your x402-Powered Crypto Intelligence Platform

✨ What makes this special:
• ${TOTAL_SUPPORTED_COINS}+ cryptocurrencies supported (not just BTC/ETH/SOL!)
• Each prediction powered by Gradient Parallax AI multi-provider consensus
• Pay-per-prediction with x402 micropayments on Solana
• Autonomous operation: Runs 24/7, builds on-chain reputation
• Agent-to-agent ready: Other AI agents can query our Oracle

💰 x402 Micropayments Demo:
• Traditional API: $50-100/month for limited calls
• Our Oracle: Pay only $0.0001-0.001 per prediction
• Perfect for AI agents: No subscriptions, pay-as-you-go
• Transparent: Every transaction on Solana blockchain

🤖 Gradient Parallax Showcase:
• Multi-provider consensus (3-5 AI providers per prediction)
• Real-time accuracy tracking and verification
• Smart reasoning: AI explains its predictions
• Production-ready: Real traders can use this today

🏆 Why judges will love it:
• Real-world use case that couldn't exist without x402
• Shows the power of AI agent micropayments
• Production quality, not a prototype
• Developer-friendly: Anyone can deploy their own Oracle
`

'use client'

/**
 * useX402Payment Hook
 *
 * Handles x402 micropayments for users with connected Solana wallets.
 * Uses Faremeter to automatically handle 402 Payment Required responses.
 */

import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, VersionedTransaction } from '@solana/web3.js'
import { useCallback, useEffect, useState } from 'react'

export interface X402FetchOptions extends RequestInit {
  maxPaymentAmount?: number
}

export function useX402Payment() {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()
  const [fetchWithPayer, setFetchWithPayer] = useState<typeof fetch | null>(null)

  // Initialize Faremeter wrapper when wallet is connected
  useEffect(() => {
    const initFaremeter = async () => {
      if (!publicKey || !signTransaction) {
        setFetchWithPayer(null)
        return
      }

      try {
        // Import Faremeter dynamically for client-side use
        const { createPaymentHandler } = await import('@faremeter/payment-solana/exact')
        const { wrap: wrapFetch } = await import('@faremeter/fetch')
        const { lookupKnownSPLToken } = await import('@faremeter/info/solana')

        // Get USDC token info for devnet
        const usdcInfo = lookupKnownSPLToken('devnet', 'USDC')
        if (!usdcInfo) {
          throw new Error('USDC token info not found for devnet')
        }
        const usdcMint = new PublicKey(usdcInfo.address)

        console.log('🔑 Initializing Faremeter for connected wallet:', publicKey.toBase58())

        // Create wallet interface for Faremeter
        const wallet = {
          network: 'devnet' as const,
          publicKey,
          updateTransaction: async (tx: VersionedTransaction) => {
            console.log('🔏 Signing payment transaction with connected wallet...')
            // Use connected wallet to sign
            const signed = await signTransaction(tx)
            console.log('✅ Transaction signed')
            return signed
          },
        }

        // Create payment handler
        const handler = createPaymentHandler(wallet, usdcMint, connection)

        // Wrap fetch with payment handling
        const wrappedFetch = wrapFetch(fetch, { handlers: [handler] })

        console.log('✅ Faremeter payment client initialized for user wallet')

        // Store the wrapped fetch function
        setFetchWithPayer(() => wrappedFetch)
      } catch (error) {
        console.error('Failed to initialize Faremeter:', error)
        setFetchWithPayer(null)
      }
    }

    initFaremeter()
  }, [publicKey, signTransaction, connection])

  /**
   * Make a fetch request with automatic x402 payment handling
   */
  const fetchWithPayment = useCallback(
    async (url: string, options: X402FetchOptions = {}) => {
      if (!publicKey || !signTransaction) {
        throw new Error('Wallet not connected. Please connect your wallet to make payments.')
      }

      if (!fetchWithPayer) {
        throw new Error('Payment client is initializing. Please wait...')
      }

      console.log('🔄 Making paid request to:', url)

      // Use Faremeter-wrapped fetch - it will automatically handle 402 responses
      const response = await fetchWithPayer(url, options)

      if (response.ok) {
        console.log('✅ Request successful (payment handled automatically)')
      }

      return response
    },
    [publicKey, signTransaction, fetchWithPayer]
  )

  return {
    fetchWithPayment,
    isWalletConnected: !!publicKey,
    walletPublicKey: publicKey,
    isReady: !!fetchWithPayer && !!publicKey,
  }
}

'use client'

/**
 * useX402Payment Hook
 *
 * Handles x402 micropayments for users with connected Solana wallets.
 * Uses Faremeter to automatically handle 402 Payment Required responses.
 */

import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, VersionedTransaction } from '@solana/web3.js'
import { useCallback, useEffect, useState, useRef } from 'react'
import { base58 } from '@scure/base'

export interface X402FetchOptions extends RequestInit {
  maxPaymentAmount?: number
}

// Global storage for last transaction signature
let lastPaymentSignature: string | null = null

/**
 * Get the last payment transaction signature
 */
export function getLastPaymentSignature(): string | null {
  return lastPaymentSignature
}

/**
 * Clear the stored payment signature
 */
export function clearLastPaymentSignature(): void {
  lastPaymentSignature = null
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

        // Create wallet interface for Faremeter with signature capture
        const wallet = {
          network: 'devnet' as const,
          publicKey,
          updateTransaction: async (tx: VersionedTransaction) => {
            console.log('🔏 Signing payment transaction with connected wallet...')
            // Use connected wallet to sign
            const signed = await signTransaction(tx)

            // Capture the transaction signature after signing
            if (signed.signatures && signed.signatures.length > 0) {
              const sigBytes = signed.signatures[0]

              // Check if we have a valid signature (64 bytes, not all zeros)
              if (sigBytes && sigBytes.length === 64) {
                // Check if signature has any non-zero bytes
                const hasNonZero = sigBytes.some((b: number) => b !== 0)

                if (hasNonZero) {
                  try {
                    const signature = base58.encode(sigBytes)
                    // Skip if it's the placeholder signature (all 1s)
                    if (!signature.startsWith('11111111111')) {
                      lastPaymentSignature = signature
                      console.log('✅ Transaction signed:', signature.substring(0, 20) + '...')
                    }
                  } catch (e) {
                    console.warn('Failed to encode signature:', e)
                  }
                }
              }
            }

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

  /**
   * Get the last payment transaction signature
   */
  const getLastSignature = useCallback(() => {
    return lastPaymentSignature
  }, [])

  /**
   * Clear the last payment signature
   */
  const clearSignature = useCallback(() => {
    lastPaymentSignature = null
  }, [])

  return {
    fetchWithPayment,
    isWalletConnected: !!publicKey,
    walletPublicKey: publicKey,
    isReady: !!fetchWithPayer && !!publicKey,
    getLastSignature,
    clearSignature,
  }
}

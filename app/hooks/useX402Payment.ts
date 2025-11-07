'use client'

/**
 * useX402Payment Hook
 *
 * Handles x402 micropayments for users with connected Solana wallets.
 * Automatically handles 402 Payment Required responses and retries with payment.
 */

import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { PublicKey, VersionedTransaction } from '@solana/web3.js'
import { useCallback } from 'react'

export interface X402FetchOptions extends RequestInit {
  maxPaymentAmount?: number
}

export interface PaymentTransaction {
  txHash: string
  amount: number
  timestamp: number
}

export function useX402Payment() {
  const { publicKey, signTransaction } = useWallet()
  const { connection } = useConnection()

  /**
   * Make a fetch request with automatic x402 payment handling
   */
  const fetchWithPayment = useCallback(
    async (url: string, options: X402FetchOptions = {}) => {
      if (!publicKey || !signTransaction) {
        throw new Error('Wallet not connected. Please connect your wallet to make payments.')
      }

      // Try initial request
      console.log('🔄 Making request to:', url)
      const initialResponse = await fetch(url, options)

      // If not 402, return response as-is
      if (initialResponse.status !== 402) {
        return initialResponse
      }

      // Handle 402 Payment Required
      console.log('💳 Payment required, processing x402 payment...')

      // Get payment info from 402 response
      const paymentInfo = await initialResponse.json()
      console.log('Payment info:', paymentInfo)

      // x402-next middleware returns payment info in this format
      if (!paymentInfo.paymentRequest) {
        throw new Error('Invalid payment response from server')
      }

      try {
        // Import Faremeter dynamically for client-side use
        const { createPaymentHandler } = await import('@faremeter/payment-solana/exact')
        const { wrap: wrapFetch } = await import('@faremeter/fetch')
        const { lookupKnownSPLToken } = await import('@faremeter/info/solana')

        // Get USDC token info for devnet
        const usdcInfo = lookupKnownSPLToken('devnet', 'USDC')
        const usdcMint = new PublicKey(usdcInfo.address)

        // Create wallet interface for Faremeter
        const wallet = {
          network: 'devnet',
          publicKey,
          updateTransaction: async (tx: VersionedTransaction) => {
            // Use connected wallet to sign
            const signed = await signTransaction(tx)
            return signed
          },
        }

        // Create payment handler
        const handler = createPaymentHandler(wallet, usdcMint, connection)

        // Wrap fetch with payment handling
        const fetchWithPayer = wrapFetch(fetch, { handlers: [handler] })

        // Retry request with payment handling
        console.log('🔄 Retrying request with payment...')
        const paidResponse = await fetchWithPayer(url, options)

        console.log('✅ Payment successful!')

        return paidResponse
      } catch (error) {
        console.error('Payment failed:', error)
        throw new Error(`Payment failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    },
    [publicKey, signTransaction, connection]
  )

  return {
    fetchWithPayment,
    isWalletConnected: !!publicKey,
    walletPublicKey: publicKey,
  }
}

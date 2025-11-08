/**
 * x402 Payment Button Component
 *
 * Handles x402 payment flow on the client side
 */

'use client'

import { useState } from 'react'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'

interface X402PaymentButtonProps {
  endpoint: string
  amount: string
  onSuccess: (data: any) => void
  onError: (error: Error) => void
  disabled?: boolean
  children: React.ReactNode
}

export function X402PaymentButton({
  endpoint,
  amount,
  onSuccess,
  onError,
  disabled,
  children,
}: X402PaymentButtonProps) {
  const { publicKey, signMessage } = useWallet()
  const [isPaying, setIsPaying] = useState(false)

  const handlePayment = async () => {
    if (!publicKey || !signMessage) {
      onError(new Error('Wallet not connected'))
      return
    }

    setIsPaying(true)

    try {
      // Step 1: Get payment requirements (402 response)
      const initialResponse = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (initialResponse.status !== 402) {
        // Not a paid endpoint or payment already processed
        const data = await initialResponse.json()
        onSuccess(data)
        setIsPaying(false)
        return
      }

      // Step 2: Parse payment requirements
      const paymentRequirements = await initialResponse.json()
      console.log('Payment required:', paymentRequirements)

      // Step 3: Create payment payload (simplified for demo)
      // In production, this would use x402-fetch or similar
      const paymentPayload = {
        // Payment payload would be created here
        // For now, we'll show an error asking to use agents
        error: 'Browser-based x402 payments require wallet signature. Use Agent dashboard for automated payments.',
      }

      onError(new Error('Please use the Agent dashboard (/agents) for automated x402 payments, or enable DEV_MODE for testing.'))
    } catch (error) {
      onError(error as Error)
    } finally {
      setIsPaying(false)
    }
  }

  if (!publicKey) {
    return <WalletMultiButton />
  }

  return (
    <button
      onClick={handlePayment}
      disabled={disabled || isPaying}
      className="w-full glass-hover neon-border px-6 py-4 rounded-xl font-heading font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
    >
      {isPaying ? (
        <span className="text-text-muted">⚡ Processing Payment...</span>
      ) : (
        <span className="text-gradient">{children}</span>
      )}
    </button>
  )
}

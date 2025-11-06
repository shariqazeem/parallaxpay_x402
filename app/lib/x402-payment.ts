import { WalletContextState } from '@solana/wallet-adapter-react'
import { Transaction, VersionedTransaction } from '@solana/web3.js'

/**
 * x402 Payment Handler for Solana
 *
 * This handles the complete x402 payment flow:
 * 1. Detect 402 Payment Required response
 * 2. Get payment details from response headers
 * 3. Sign payment with wallet
 * 4. Submit to facilitator
 * 5. Retry original request with payment proof
 */

export interface PaymentRequired {
  status: 402
  headers: Record<string, string>
  body: any
}

export async function handleX402Payment(
  url: string,
  wallet: WalletContextState,
  options: RequestInit = {}
): Promise<Response> {
  // Make initial request
  const response = await fetch(url, options)

  // If not 402, return response as-is
  if (response.status !== 402) {
    return response
  }

  // Payment is required - extract payment details
  const paymentDetails = await response.json()
  console.log('x402 Payment Required:', paymentDetails)

  // Check if wallet is connected
  if (!wallet.publicKey || !wallet.signTransaction) {
    throw new Error('Wallet not connected. Please connect your Solana wallet to make payments.')
  }

  // The x402 protocol provides payment instructions in the response
  // The facilitator URL and payment details are in the response headers/body
  const facilitatorUrl = response.headers.get('x-payment-facilitator')
  const paymentToken = response.headers.get('x-payment-token')

  if (!facilitatorUrl || !paymentToken) {
    throw new Error('Missing payment facilitator information in response')
  }

  // For Solana x402, the payment is handled by the facilitator
  // The client needs to sign a payment message and send it back

  // Create payment proof using wallet signature
  const message = `x402-payment:${paymentToken}:${wallet.publicKey.toBase58()}`
  const encodedMessage = new TextEncoder().encode(message)

  let signature: Uint8Array

  if (wallet.signMessage) {
    // Use signMessage if available (preferred for off-chain messages)
    signature = await wallet.signMessage(encodedMessage)
  } else {
    throw new Error('Wallet does not support message signing. Please use a compatible wallet like Phantom or Solflare.')
  }

  // Convert signature to base64
  const signatureBase64 = Buffer.from(signature).toString('base64')

  // Create payment header
  const paymentHeader = JSON.stringify({
    publicKey: wallet.publicKey.toBase58(),
    signature: signatureBase64,
    token: paymentToken,
  })

  // Retry the original request with payment proof
  const retryResponse = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'X-Payment': paymentHeader,
    },
  })

  return retryResponse
}

/**
 * Simpler wrapper that automatically handles x402 payments
 */
export async function fetchWithPayment(
  url: string,
  wallet: WalletContextState,
  options: RequestInit = {}
): Promise<any> {
  const response = await handleX402Payment(url, wallet, options)

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`Request failed: ${response.status} ${response.statusText}\n${error}`)
  }

  return response.json()
}

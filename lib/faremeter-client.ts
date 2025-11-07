/**
 * Faremeter/Corbits Payment Client for ParallaxPay
 *
 * Uses the modern Faremeter SDK for x402 payments on Solana
 */

import { Keypair, PublicKey, VersionedTransaction, Connection } from '@solana/web3.js'
import { createPaymentHandler } from '@faremeter/payment-solana/exact'
import { wrap as wrapFetch } from '@faremeter/fetch'
import { lookupKnownSPLToken } from '@faremeter/info/solana'
import { base58 } from '@scure/base'

export interface FaremeterPaymentConfig {
  privateKey: string
  network?: 'devnet' | 'mainnet-beta'
  asset?: 'USDC' | 'SOL'
  rpcUrl?: string
  enableLogging?: boolean
}

export interface PaymentResult<T = any> {
  success: boolean
  data?: T
  error?: string
  txHash?: string
}

// Store last transaction signature globally (per client instance)
let lastTxSignature: string | null = null

/**
 * Get the last transaction signature from the most recent payment
 */
export function getLastTxSignature(): string | null {
  return lastTxSignature
}

/**
 * Clear the stored transaction signature
 */
export function clearLastTxSignature(): void {
  lastTxSignature = null
}

/**
 * Creates a fetch function with Faremeter payment handling
 */
export async function createFaremeterFetch(config: FaremeterPaymentConfig): Promise<typeof fetch> {
  const {
    privateKey,
    network = 'devnet',
    asset = 'USDC',
    rpcUrl,
    enableLogging = true,
  } = config

  try {
    // Load keypair from private key
    const secretKey = base58.decode(privateKey)
    const keypair = Keypair.fromSecretKey(secretKey)

    // Create connection
    const connection = new Connection(
      rpcUrl || (network === 'devnet'
        ? 'https://api.devnet.solana.com'
        : 'https://api.mainnet-beta.solana.com')
    )

    // Get asset mint address
    const assetInfo = lookupKnownSPLToken(network, asset)
    const assetMint = new PublicKey(assetInfo.address)

    if (enableLogging) {
      console.log('🔑 Faremeter wallet initialized')
      console.log(`   Public key: ${keypair.publicKey.toBase58()}`)
      console.log(`   Network: ${network}`)
      console.log(`   Asset: ${asset}`)
    }

    // Create wallet interface for Faremeter with signature capture
    const wallet = {
      network,
      publicKey: keypair.publicKey,
      updateTransaction: async (tx: VersionedTransaction) => {
        // Sign the transaction
        tx.sign([keypair])

        // Try to capture the signature after signing
        // Note: Faremeter will handle sending the transaction, we just sign it
        if (tx.signatures && tx.signatures.length > 0) {
          const sigBytes = tx.signatures[0]

          if (enableLogging) {
            console.log(`🔏 Signature bytes length: ${sigBytes?.length}`)
            console.log(`   First 10 bytes: ${sigBytes ? Array.from(sigBytes.slice(0, 10)) : 'none'}`)
          }

          // Check if signature is valid (not all zeros)
          if (sigBytes && sigBytes.length === 64) {
            const signature = base58.encode(sigBytes)

            // Skip if it's the zero signature (encodes to "111...")
            if (!signature.startsWith('11111111111')) {
              lastTxSignature = signature
              if (enableLogging) {
                console.log(`🔏 Transaction signed: ${signature}`)
              }
            } else {
              if (enableLogging) {
                console.warn(`⚠️  Signature appears to be all zeros - this may be a placeholder`)
              }
            }
          }
        }

        return tx
      },
    }

    // Create payment handler
    const handler = createPaymentHandler(wallet, assetMint, connection)

    // Wrap fetch with payment handling
    const fetchWithPayer = wrapFetch(fetch, {
      handlers: [handler],
    })

    if (enableLogging) {
      console.log('✅ Faremeter payment client initialized')
    }

    return fetchWithPayer
  } catch (error) {
    console.error('Failed to initialize Faremeter client:', error)
    throw new Error(`Faremeter initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/**
 * Make a paid request using Faremeter
 */
export async function makePaidRequest<T = any>(
  privateKey: string,
  url: string,
  options?: RequestInit,
  config?: Partial<FaremeterPaymentConfig>
): Promise<PaymentResult<T>> {
  try {
    const fetchWithPayment = await createFaremeterFetch({
      privateKey,
      ...config,
    })

    const response = await fetchWithPayment(url, options)

    if (!response.ok && response.status !== 402) {
      throw new Error(`Request failed with status ${response.status}`)
    }

    const data = await response.json()

    // Extract transaction hash from headers if available
    const txHash = response.headers.get('x-payment-tx') ||
                   response.headers.get('x-transaction-hash')

    return {
      success: true,
      data,
      txHash: txHash || undefined,
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Example usage:
 *
 * ```typescript
 * // Create fetch with payment handling
 * const fetchWithPayment = await createFaremeterFetch({
 *   privateKey: process.env.SOLANA_PRIVATE_KEY!,
 *   network: 'devnet',
 *   asset: 'USDC',
 * })
 *
 * // Make paid API request
 * const response = await fetchWithPayment('http://localhost:3000/api/inference/paid', {
 *   method: 'POST',
 *   headers: { 'Content-Type': 'application/json' },
 *   body: JSON.stringify({
 *     messages: [{ role: 'user', content: 'Hello!' }],
 *   }),
 * })
 *
 * const data = await response.json()
 * console.log(data)
 * ```
 */

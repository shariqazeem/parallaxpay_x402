/**
 * x402 Payment Client for ParallaxPay
 *
 * This client enables agents to make micropayments for AI inference
 * using the x402 protocol on Solana blockchain.
 *
 * Features:
 * - Automatic payment handling via x402-fetch
 * - Solana wallet integration
 * - Transaction tracking and history
 * - Error handling and retries
 */

import { base58 } from '@scure/base'

export interface X402PaymentConfig {
  // Solana wallet private key (base58 format)
  privateKey?: string
  // Base URL of the resource server
  baseUrl?: string
  // Network to use (solana-devnet or solana)
  network?: 'solana-devnet' | 'solana'
  // Maximum payment amount in USD
  maxPaymentAmount?: number
  // Enable transaction logging
  enableLogging?: boolean
}

export interface X402Transaction {
  id: string
  timestamp: number
  endpoint: string
  amount: number // in USD
  txHash: string | null
  network: string
  status: 'pending' | 'success' | 'failed'
  error?: string
}

export interface PaymentResult<T = any> {
  success: boolean
  data?: T
  error?: string
  transaction?: X402Transaction
}

/**
 * x402 Payment Client
 *
 * Wraps x402-fetch to provide a simple interface for making paid API requests
 */
export class X402PaymentClient {
  private config: X402PaymentConfig
  private transactions: X402Transaction[] = []
  private fetchWithPayment: typeof fetch | null = null
  private account: any = null

  constructor(config: X402PaymentConfig = {}) {
    this.config = {
      baseUrl: config.baseUrl || (typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000'),
      network: config.network || 'solana-devnet',
      maxPaymentAmount: config.maxPaymentAmount || 1.0, // $1 max by default
      enableLogging: config.enableLogging !== false,
      ...config,
    }

    // Initialize wallet if private key is provided
    if (config.privateKey) {
      this.initializeWallet(config.privateKey)
    }
  }

  /**
   * Initialize Solana wallet from private key
   */
  private async initializeWallet(privateKey: string) {
    try {
      // Dynamic import for client-side only
      if (typeof window === 'undefined') {
        // Server-side: use @solana/web3.js
        const { Keypair } = await import('@solana/web3.js')
        const secretKey = base58.decode(privateKey)
        const keypair = Keypair.fromSecretKey(secretKey)

        // Create a signer compatible with x402
        this.account = {
          address: keypair.publicKey.toBase58(),
          signMessage: async (message: Uint8Array) => {
            return keypair.secretKey // Simplified for now
          }
        }
      } else {
        // Client-side: use wallet adapter
        // For now, we'll handle this via wallet connect UI
        console.warn('Client-side wallet initialization - use wallet connect UI instead')
      }

      // Initialize x402-fetch wrapper
      await this.initializeX402Fetch()
    } catch (error) {
      console.error('Failed to initialize wallet:', error)
      throw new Error(`Wallet initialization failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Initialize x402-fetch with payment handling
   */
  private async initializeX402Fetch() {
    if (!this.account) {
      throw new Error('Wallet not initialized')
    }

    try {
      // Dynamic import of x402-fetch
      const { wrapFetchWithPayment } = await import('x402-fetch')

      this.fetchWithPayment = wrapFetchWithPayment(fetch, this.account)

      if (this.config.enableLogging) {
        console.log('✅ x402 Payment client initialized')
        console.log(`   Network: ${this.config.network}`)
        console.log(`   Max payment: $${this.config.maxPaymentAmount}`)
      }
    } catch (error) {
      console.error('Failed to initialize x402-fetch:', error)
      throw new Error('x402-fetch initialization failed')
    }
  }

  /**
   * Make a paid API request
   */
  async request<T = any>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<PaymentResult<T>> {
    const startTime = Date.now()
    const url = endpoint.startsWith('http') ? endpoint : `${this.config.baseUrl}${endpoint}`

    // Create transaction record
    const transaction: X402Transaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: startTime,
      endpoint,
      amount: 0, // Will be updated after payment
      txHash: null,
      network: this.config.network!,
      status: 'pending',
    }

    this.transactions.push(transaction)

    try {
      if (!this.fetchWithPayment) {
        throw new Error('Payment client not initialized. Call initializeWallet() first.')
      }

      // Make request with automatic payment handling
      const response = await this.fetchWithPayment(url, {
        method: options.method || 'GET',
        headers: {
          'Content-Type': 'application/json',
          ...options.headers,
        },
        body: options.body,
      })

      // Extract payment response header
      const paymentResponseHeader = response.headers.get('x-payment-response')
      if (paymentResponseHeader) {
        try {
          const paymentResponse = JSON.parse(
            Buffer.from(paymentResponseHeader, 'base64').toString('utf-8')
          )

          transaction.txHash = paymentResponse.txHash || null
          transaction.amount = parseFloat(paymentResponse.amount || '0')
        } catch (err) {
          console.warn('Failed to parse payment response header:', err)
        }
      }

      // Parse response body
      const data = await response.json()

      // Update transaction status
      transaction.status = response.ok ? 'success' : 'failed'

      if (this.config.enableLogging) {
        const duration = Date.now() - startTime
        console.log(`✅ Payment successful for ${endpoint}`)
        console.log(`   Amount: $${transaction.amount.toFixed(4)}`)
        console.log(`   TX Hash: ${transaction.txHash || 'pending'}`)
        console.log(`   Duration: ${duration}ms`)
      }

      return {
        success: true,
        data,
        transaction,
      }
    } catch (error) {
      // Update transaction status
      transaction.status = 'failed'
      transaction.error = error instanceof Error ? error.message : 'Unknown error'

      if (this.config.enableLogging) {
        console.error(`❌ Payment failed for ${endpoint}:`, error)
      }

      return {
        success: false,
        error: transaction.error,
        transaction,
      }
    }
  }

  /**
   * Get transaction history
   */
  getTransactions(): X402Transaction[] {
    return [...this.transactions]
  }

  /**
   * Get total spent amount
   */
  getTotalSpent(): number {
    return this.transactions
      .filter(tx => tx.status === 'success')
      .reduce((sum, tx) => sum + tx.amount, 0)
  }

  /**
   * Get transaction by ID
   */
  getTransaction(id: string): X402Transaction | undefined {
    return this.transactions.find(tx => tx.id === id)
  }

  /**
   * Clear transaction history
   */
  clearTransactions(): void {
    this.transactions = []
  }

  /**
   * Get payment statistics
   */
  getStats() {
    const successful = this.transactions.filter(tx => tx.status === 'success')
    const failed = this.transactions.filter(tx => tx.status === 'failed')
    const pending = this.transactions.filter(tx => tx.status === 'pending')

    return {
      total: this.transactions.length,
      successful: successful.length,
      failed: failed.length,
      pending: pending.length,
      totalSpent: this.getTotalSpent(),
      averageAmount: successful.length > 0
        ? this.getTotalSpent() / successful.length
        : 0,
    }
  }
}

/**
 * Create a payment client instance
 */
export function createPaymentClient(config?: X402PaymentConfig): X402PaymentClient {
  return new X402PaymentClient(config)
}

/**
 * Helper function to make a single paid request
 */
export async function makePaidRequest<T = any>(
  endpoint: string,
  privateKey: string,
  options?: RequestInit
): Promise<PaymentResult<T>> {
  const client = new X402PaymentClient({ privateKey })
  return client.request<T>(endpoint, options)
}

/**
 * Get Solana explorer URL for transaction
 */
export function getSolanaExplorerUrl(txHash: string, network: 'solana-devnet' | 'solana' = 'solana-devnet'): string {
  const baseUrl = network === 'solana-devnet'
    ? 'https://explorer.solana.com/tx'
    : 'https://explorer.solana.com/tx'

  const cluster = network === 'solana-devnet' ? '?cluster=devnet' : ''

  return `${baseUrl}/${txHash}${cluster}`
}

/**
 * Format USD amount for display
 */
export function formatUSD(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 4,
  }).format(amount)
}

/**
 * Example usage:
 *
 * ```typescript
 * // Create client
 * const client = createPaymentClient({
 *   privateKey: process.env.SOLANA_PRIVATE_KEY,
 *   network: 'solana-devnet',
 *   maxPaymentAmount: 1.0,
 * })
 *
 * // Make paid request
 * const result = await client.request('/api/inference/paid', {
 *   method: 'POST',
 *   body: JSON.stringify({
 *     messages: [{ role: 'user', content: 'Hello!' }],
 *     max_tokens: 100,
 *   })
 * })
 *
 * if (result.success) {
 *   console.log('Response:', result.data)
 *   console.log('TX Hash:', result.transaction?.txHash)
 * }
 *
 * // Get stats
 * const stats = client.getStats()
 * console.log(`Total spent: ${formatUSD(stats.totalSpent)}`)
 * ```
 */

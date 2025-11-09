/**
 * On-Chain Badge Attestation System
 *
 * This system creates verifiable on-chain records of badge awards using
 * Solana's memo program. Each badge is recorded as a transaction with
 * structured metadata in the memo field.
 *
 * Benefits:
 * - Fully verifiable on-chain (anyone can verify via transaction lookup)
 * - Cost-effective (just a memo transaction, ~0.000005 SOL)
 * - Simple implementation (no complex NFT minting)
 * - Production-ready (uses standard Solana primitives)
 *
 * This is Phase 3.1 of the hackathon implementation for the "Trustless Agent" track.
 */

import {
  Connection,
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Keypair,
  sendAndConfirmTransaction,
} from '@solana/web3.js'

export interface BadgeAttestation {
  badgeType: string // e.g., "Pioneer", "Top Performer", "Speed Demon"
  agentId: string
  agentName: string
  walletAddress: string
  reputationScore: number
  timestamp: number
  metadata?: Record<string, any> // Additional context (e.g., milestone details)
}

export interface AttestationResult {
  success: boolean
  signature?: string
  error?: string
  explorerUrl?: string
}

/**
 * Badge Attestation Manager
 *
 * Manages on-chain badge attestations using Solana memo program
 */
export class BadgeAttestationManager {
  private connection: Connection
  private network: 'devnet' | 'mainnet-beta'

  constructor(network: 'devnet' | 'mainnet-beta' = 'devnet') {
    this.network = network
    const rpcUrl =
      network === 'devnet'
        ? 'https://api.devnet.solana.com'
        : 'https://api.mainnet-beta.solana.com'

    this.connection = new Connection(rpcUrl, 'confirmed')
  }

  /**
   * Create an on-chain attestation for a badge award
   *
   * This creates a Solana transaction with the badge data in a memo,
   * creating a permanent, verifiable record on the blockchain.
   */
  async attestBadge(
    attestation: BadgeAttestation,
    payerKeypair: Keypair
  ): Promise<AttestationResult> {
    try {
      console.log(`\n🏆 [BADGE ATTESTATION] Creating on-chain record...`)
      console.log(`   Badge: ${attestation.badgeType}`)
      console.log(`   Agent: ${attestation.agentName}`)
      console.log(`   Wallet: ${attestation.walletAddress}`)

      // Create structured memo data
      const memoData = {
        type: 'BADGE_ATTESTATION',
        version: '1.0',
        badge: attestation.badgeType,
        agentId: attestation.agentId,
        agentName: attestation.agentName,
        wallet: attestation.walletAddress,
        reputation: attestation.reputationScore,
        timestamp: attestation.timestamp,
        ...(attestation.metadata && { metadata: attestation.metadata }),
      }

      const memoText = JSON.stringify(memoData)

      // Memo program ID (same on all Solana networks)
      const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')

      // Create memo instruction
      const memoInstruction = new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memoText, 'utf-8'),
      })

      // Create transaction
      const transaction = new Transaction()

      // Add a tiny transfer to make the transaction show up in explorers
      // (some explorers filter out pure memo transactions)
      const recipient = new PublicKey(attestation.walletAddress)
      transaction.add(
        SystemProgram.transfer({
          fromPubkey: payerKeypair.publicKey,
          toPubkey: recipient,
          lamports: 1, // 0.000000001 SOL
        })
      )

      // Add memo instruction
      transaction.add(memoInstruction)

      // Get recent blockhash
      const { blockhash, lastValidBlockHeight } = await this.connection.getLatestBlockhash()
      transaction.recentBlockhash = blockhash
      transaction.feePayer = payerKeypair.publicKey

      console.log(`   📝 Memo data (${memoText.length} bytes):`)
      console.log(`      ${memoText.substring(0, 100)}...`)

      // Send and confirm transaction
      console.log(`   📤 Sending transaction...`)
      const signature = await sendAndConfirmTransaction(
        this.connection,
        transaction,
        [payerKeypair],
        {
          commitment: 'confirmed',
          preflightCommitment: 'confirmed',
        }
      )

      const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=${this.network}`

      console.log(`   ✅ Badge attestation recorded on-chain!`)
      console.log(`      Signature: ${signature}`)
      console.log(`      Explorer: ${explorerUrl}`)

      return {
        success: true,
        signature,
        explorerUrl,
      }
    } catch (error) {
      console.error('Badge attestation error:', error)

      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }
    }
  }

  /**
   * Verify a badge by looking up the attestation transaction
   */
  async verifyBadge(signature: string): Promise<BadgeAttestation | null> {
    try {
      console.log(`\n🔍 [BADGE VERIFICATION] Looking up transaction...`)
      console.log(`   Signature: ${signature}`)

      const tx = await this.connection.getTransaction(signature, {
        commitment: 'confirmed',
        maxSupportedTransactionVersion: 0,
      })

      if (!tx || !tx.meta) {
        console.log(`   ❌ Transaction not found`)
        return null
      }

      // Find memo instruction in the transaction
      const memoInstruction = tx.transaction.message.compiledInstructions.find((ix) => {
        const programId = tx.transaction.message.staticAccountKeys[ix.programIdIndex]
        return programId.toString() === 'MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr'
      })

      if (!memoInstruction) {
        console.log(`   ❌ No memo found in transaction`)
        return null
      }

      // Decode memo data
      const memoText = Buffer.from(memoInstruction.data).toString('utf-8')
      const memoData = JSON.parse(memoText)

      if (memoData.type !== 'BADGE_ATTESTATION') {
        console.log(`   ❌ Not a badge attestation`)
        return null
      }

      console.log(`   ✅ Badge verified!`)
      console.log(`      Badge: ${memoData.badge}`)
      console.log(`      Agent: ${memoData.agentName}`)

      const attestation: BadgeAttestation = {
        badgeType: memoData.badge,
        agentId: memoData.agentId,
        agentName: memoData.agentName,
        walletAddress: memoData.wallet,
        reputationScore: memoData.reputation,
        timestamp: memoData.timestamp,
        metadata: memoData.metadata,
      }

      return attestation
    } catch (error) {
      console.error('Badge verification error:', error)
      return null
    }
  }

  /**
   * Get all badge attestations for a wallet address
   */
  async getBadgesForWallet(walletAddress: string): Promise<BadgeAttestation[]> {
    try {
      console.log(`\n🔍 [BADGE LOOKUP] Searching for badges...`)
      console.log(`   Wallet: ${walletAddress}`)

      // Get all transactions for the wallet
      const pubkey = new PublicKey(walletAddress)
      const signatures = await this.connection.getSignaturesForAddress(pubkey, {
        limit: 100, // Last 100 transactions
      })

      console.log(`   Found ${signatures.length} transactions to check`)

      const badges: BadgeAttestation[] = []

      // Check each transaction for badge attestations
      for (const sig of signatures) {
        const badge = await this.verifyBadge(sig.signature)
        if (badge) {
          badges.push(badge)
        }
      }

      console.log(`   ✅ Found ${badges.length} badge(s)`)

      return badges
    } catch (error) {
      console.error('Badge lookup error:', error)
      return []
    }
  }
}

/**
 * Helper function to create a badge attestation manager
 */
export function createBadgeAttestationManager(
  network: 'devnet' | 'mainnet-beta' = 'devnet'
): BadgeAttestationManager {
  return new BadgeAttestationManager(network)
}

/**
 * Singleton instance for the app
 */
let managerInstance: BadgeAttestationManager | null = null

export function getBadgeAttestationManager(): BadgeAttestationManager {
  if (!managerInstance) {
    managerInstance = createBadgeAttestationManager('devnet')
  }
  return managerInstance
}

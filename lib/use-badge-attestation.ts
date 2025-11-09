/**
 * React Hook for Badge Attestation
 *
 * This hook provides client-side badge attestation functionality
 * that works with Solana wallet adapters.
 *
 * Usage:
 * ```tsx
 * const { attestBadge, verifying } = useBadgeAttestation()
 *
 * // When a badge is earned
 * const result = await attestBadge({
 *   badgeType: "Pioneer",
 *   agentId: "agent-123",
 *   agentName: "My Agent",
 *   ...
 * })
 * ```
 */

import { useWallet, useConnection } from '@solana/wallet-adapter-react'
import { useState, useCallback } from 'react'
import {
  Transaction,
  TransactionInstruction,
  SystemProgram,
  PublicKey,
} from '@solana/web3.js'
import type { BadgeAttestation, AttestationResult } from './badge-attestation'

export function useBadgeAttestation() {
  const { publicKey, sendTransaction } = useWallet()
  const { connection } = useConnection()
  const [attesting, setAttesting] = useState(false)

  const attestBadge = useCallback(
    async (attestation: BadgeAttestation): Promise<AttestationResult> => {
      if (!publicKey || !sendTransaction) {
        return {
          success: false,
          error: 'Wallet not connected',
        }
      }

      setAttesting(true)

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

        // Memo program ID
        const MEMO_PROGRAM_ID = new PublicKey('MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr')

        // Create memo instruction
        const memoInstruction = new TransactionInstruction({
          keys: [],
          programId: MEMO_PROGRAM_ID,
          data: Buffer.from(memoText, 'utf-8'),
        })

        // Create transaction
        const transaction = new Transaction()

        // Add a tiny transfer to make the transaction visible in explorers
        const recipient = new PublicKey(attestation.walletAddress)
        transaction.add(
          SystemProgram.transfer({
            fromPubkey: publicKey,
            toPubkey: recipient,
            lamports: 1, // 0.000000001 SOL
          })
        )

        // Add memo instruction
        transaction.add(memoInstruction)

        // Get recent blockhash
        const { blockhash } = await connection.getLatestBlockhash()
        transaction.recentBlockhash = blockhash
        transaction.feePayer = publicKey

        console.log(`   📝 Memo size: ${memoText.length} bytes`)
        console.log(`   📤 Sending transaction...`)

        // Send transaction via wallet
        const signature = await sendTransaction(transaction, connection, {
          preflightCommitment: 'confirmed',
        })

        // Wait for confirmation
        console.log(`   ⏳ Awaiting confirmation...`)
        await connection.confirmTransaction(signature, 'confirmed')

        const network = connection.rpcEndpoint.includes('devnet') ? 'devnet' : 'mainnet-beta'
        const explorerUrl = `https://explorer.solana.com/tx/${signature}?cluster=${network}`

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
      } finally {
        setAttesting(false)
      }
    },
    [publicKey, sendTransaction, connection]
  )

  return {
    attestBadge,
    attesting,
    canAttest: !!publicKey && !!sendTransaction,
  }
}

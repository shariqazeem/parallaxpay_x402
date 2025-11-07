/**
 * Server-side Agent Runner with Faremeter/Corbits
 *
 * This endpoint runs agents server-side using Faremeter for x402 payments.
 * This is the CORRECT way to do autonomous agents with real blockchain payments.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createFaremeterFetch } from '@/lib/faremeter-client'

export interface RunAgentRequest {
  agentId: string
  agentName: string
  prompt: string
}

export interface RunAgentResponse {
  success: boolean
  data?: {
    response: string
    tokens: number
    cost: number
    provider: string
    txHash: string
  }
  error?: string
}

/**
 * POST /api/agents/run
 *
 * Runs an agent server-side with real Faremeter/Corbits x402 payments
 */
export async function POST(request: NextRequest) {
  try {
    const body: RunAgentRequest = await request.json()

    // Get private key from server environment
    const privateKey = process.env.SOLANA_PRIVATE_KEY || process.env.NEXT_PUBLIC_SOLANA_PRIVATE_KEY

    if (!privateKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'SOLANA_PRIVATE_KEY not configured on server. Add to .env.local and restart.',
        },
        { status: 500 }
      )
    }

    console.log(`🤖 [${body.agentName}] Running agent with Faremeter payment...`)

    // Create Faremeter fetch with payment handling
    const fetchWithPayment = await createFaremeterFetch({
      privateKey,
      network: 'devnet',
      asset: 'USDC',
      enableLogging: true,
    })

    console.log(`💳 [${body.agentName}] Making x402 payment via Faremeter...`)

    // Make paid request to inference API
    const response = await fetchWithPayment(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/inference/paid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: [{ role: 'user', content: body.prompt }],
        max_tokens: 300,
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      throw new Error(`Inference API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()

    // Extract transaction hash from headers
    const txHash = response.headers.get('x-payment-tx') ||
                   response.headers.get('x-transaction-hash') ||
                   data.txHash ||
                   'pending'

    console.log(`✅ [${body.agentName}] Payment successful!`)
    console.log(`   TX Hash: ${txHash}`)
    console.log(`   Cost: $${data.cost || '0.001000'}`)

    return NextResponse.json({
      success: true,
      data: {
        response: data.response || data.result || 'Success',
        tokens: data.tokens || 0,
        cost: data.cost || 0.001,
        provider: data.provider || 'Local Parallax Node',
        txHash,
      },
    })
  } catch (error) {
    console.error('Agent execution error:', error)

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

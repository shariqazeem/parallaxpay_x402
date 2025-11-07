/**
 * Server-side Agent Runner
 *
 * This endpoint runs agents server-side where x402-fetch works properly
 * with private keys. This is the CORRECT way to do autonomous agents.
 */

import { NextRequest, NextResponse } from 'next/server'

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
 * Runs an agent server-side with real x402 payments
 */
export async function POST(request: NextRequest) {
  try {
    const body: RunAgentRequest = await request.json()

    // Get private key from server environment
    const privateKey = process.env.NEXT_PUBLIC_SOLANA_PRIVATE_KEY || process.env.SOLANA_PRIVATE_KEY

    if (!privateKey) {
      return NextResponse.json(
        {
          success: false,
          error: 'SOLANA_PRIVATE_KEY not configured on server. Add to .env.local and restart.',
        },
        { status: 500 }
      )
    }

    console.log(`🤖 [${body.agentName}] Running agent server-side...`)

    // Import x402-payment-client
    const { createPaymentClient } = await import('@/lib/x402-payment-client')

    // Create payment client (server-side - this should work!)
    const paymentClient = createPaymentClient({
      privateKey,
      network: 'solana-devnet',
      maxPaymentAmount: 1.0,
      enableLogging: true,
    })

    console.log(`💳 [${body.agentName}] Making x402 payment...`)

    // Make paid request to inference API
    const result = await paymentClient.request('/api/inference/paid', {
      method: 'POST',
      body: JSON.stringify({
        messages: [{ role: 'user', content: body.prompt }],
        max_tokens: 300,
      }),
    })

    if (!result.success || !result.data) {
      throw new Error(result.error || 'Payment failed')
    }

    console.log(`✅ [${body.agentName}] Payment successful!`)
    console.log(`   TX Hash: ${result.transaction?.txHash}`)
    console.log(`   Cost: $${result.transaction?.amount.toFixed(6)}`)

    return NextResponse.json({
      success: true,
      data: {
        response: result.data.response,
        tokens: result.data.tokens,
        cost: result.transaction?.amount || 0,
        provider: result.data.provider || 'Local Parallax Node',
        txHash: result.transaction?.txHash || 'pending',
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

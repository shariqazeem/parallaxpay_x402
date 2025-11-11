/**
 * Server-side Market Oracle Inference with Faremeter/x402
 *
 * This endpoint runs Market Oracle predictions server-side using Faremeter for x402 payments.
 * Enables autonomous operation with real blockchain micropayments.
 */

import { NextRequest, NextResponse } from 'next/server'
import { createFaremeterFetch, getLastTxSignature, clearLastTxSignature } from '@/lib/faremeter-client'

export interface OracleInferenceRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  provider: string
  max_tokens?: number
}

export interface OracleInferenceResponse {
  success: boolean
  data?: {
    content: string
    tokens: number
    cost: number
    provider: string
    txHash: string
    latency: number
  }
  error?: string
}

/**
 * POST /api/oracle/inference
 *
 * Runs inference for Market Oracle with real Faremeter/Corbits x402 payments
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    const body: OracleInferenceRequest = await request.json()

    // Get private key from server environment
    const privateKey = process.env.SOLANA_PRIVATE_KEY || process.env.NEXT_PUBLIC_SOLANA_PRIVATE_KEY

    if (!privateKey) {
      console.warn('⚠️ SOLANA_PRIVATE_KEY not configured - using demo mode')
      // In demo mode, return a mock prediction without actual payment
      return NextResponse.json(
        {
          success: true,
          data: {
            content: `PREDICTION: ${Math.random() > 0.5 ? 'UP' : 'DOWN'}
CONFIDENCE: ${Math.floor(Math.random() * 30 + 60)}
REASONING: Demo mode prediction based on market sentiment analysis. Configure SOLANA_PRIVATE_KEY for real x402 payments.`,
            tokens: 150,
            cost: 0.001,
            provider: body.provider,
            txHash: 'demo-mode-no-payment',
            latency: 250,
          },
        },
        { status: 200 }
      )
    }

    console.log(`🔮 [Market Oracle] Running inference with Faremeter payment...`)
    console.log(`   Provider: ${body.provider}`)

    // Create Faremeter fetch with payment handling
    const fetchWithPayment = await createFaremeterFetch({
      privateKey,
      network: 'devnet',
      asset: 'USDC',
      enableLogging: false, // Reduce noise for autonomous mode
    })

    // Clear any previous transaction signature
    clearLastTxSignature()

    // Make paid request to inference API
    const response = await fetchWithPayment(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/inference/paid`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messages: body.messages,
        max_tokens: body.max_tokens || 2000, // Increased to ensure complete oracle predictions
      }),
    })

    if (!response.ok) {
      const errorText = await response.text()
      console.error(`❌ Inference API error (${response.status}):`, errorText)

      // If Parallax isn't running, return a helpful error with demo prediction
      if (response.status === 503 || errorText.includes('Parallax')) {
        return NextResponse.json(
          {
            success: true,
            data: {
              content: `PREDICTION: ${Math.random() > 0.5 ? 'UP' : 'DOWN'}
CONFIDENCE: ${Math.floor(Math.random() * 30 + 60)}
REASONING: Demo prediction - Parallax node not running. Start with: parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --port 3001`,
              tokens: 150,
              cost: 0.001,
              provider: body.provider + ' (Demo)',
              txHash: 'demo-parallax-offline',
              latency: 200,
            },
          },
          { status: 200 }
        )
      }

      throw new Error(`Inference API returned ${response.status}: ${errorText}`)
    }

    const data = await response.json()
    const latency = Date.now() - startTime

    // Extract transaction signature
    let txHash = getLastTxSignature()

    // Fallback to checking response headers or body
    if (!txHash) {
      txHash = response.headers.get('x-payment-tx') ||
               response.headers.get('x-transaction-hash') ||
               data.txHash ||
               null
    }

    // Filter out invalid signatures (all zeros)
    if (txHash && txHash.startsWith('11111111111')) {
      txHash = null
    }

    // Log payment success
    console.log(`✅ [Market Oracle] x402 payment successful!`)
    if (txHash) {
      console.log(`   TX: https://explorer.solana.com/tx/${txHash}?cluster=devnet`)
    }
    console.log(`   Cost: $${data.cost || '0.001000'}`)
    console.log(`   Latency: ${latency}ms`)

    return NextResponse.json({
      success: true,
      data: {
        content: data.response || data.result || '',
        tokens: data.tokens || 0,
        cost: data.cost || 0.001,
        provider: body.provider,
        txHash: txHash || 'pending',
        latency,
      },
    })
  } catch (error) {
    console.error('🔮 [Market Oracle] Inference error:', error)

    const latency = Date.now() - startTime

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        latency,
      },
      { status: 500 }
    )
  }
}

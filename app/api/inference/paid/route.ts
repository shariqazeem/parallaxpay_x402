/**
 * Paid AI Inference API Endpoint
 *
 * This endpoint is protected by x402 payment middleware.
 * Clients must include X-PAYMENT header with valid payment to access.
 *
 * Flow:
 * 1. Client requests inference
 * 2. Middleware returns 402 Payment Required
 * 3. Client creates payment and retries with X-PAYMENT header
 * 4. Middleware verifies payment via facilitator
 * 5. This handler runs inference on Parallax
 * 6. Response includes inference result + X-PAYMENT-RESPONSE header with tx details
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClusterClient } from '@/lib/parallax-cluster'
import { getProviderDiscoveryService } from '@/lib/provider-discovery'

export interface InferenceRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  max_tokens?: number
  temperature?: number
  provider?: string // Optional: specific Parallax provider ID
}

export interface InferenceResponse {
  response: string
  tokens: number
  provider: string
  cost: number
  latency: number
  txHash?: string
  model: string
}

/**
 * POST /api/inference/paid
 *
 * Protected endpoint for AI inference with x402 micropayments
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request body
    const body: InferenceRequest = await request.json()

    // Validate request
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      )
    }

    // Create cluster client (automatically load-balances across available nodes)
    const clusterClient = createClusterClient()

    // Check if any Parallax nodes are available
    const discovery = getProviderDiscoveryService()
    let onlineProviders = discovery.getOnlineProviders()

    // If no providers found, trigger immediate re-discovery
    if (onlineProviders.length === 0) {
      console.log('⚠️  No providers found, triggering immediate discovery...')
      await discovery.discoverProviders()
      onlineProviders = discovery.getOnlineProviders()

      // If still no providers after re-discovery, return error
      if (onlineProviders.length === 0) {
        const clusterUrls = process.env.PARALLAX_CLUSTER_URLS || process.env.PARALLAX_SCHEDULER_URL || 'http://localhost:3001'
        return NextResponse.json(
          {
            error: 'No Parallax nodes available',
            details: `Please start Parallax cluster: ./scripts/start-parallax-cluster.sh\nOr manually: parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0`,
            clusterUrls: clusterUrls.split(','),
          },
          { status: 503 }
        )
      } else {
        console.log(`✅ Discovery successful! Found ${onlineProviders.length} provider(s)`)
      }
    }

    // Run inference with automatic load balancing
    const strategy = (process.env.PARALLAX_LOAD_BALANCING as any) || 'latency-based'
    const maxRetries = parseInt(process.env.CLUSTER_MAX_RETRIES || '3')

    const inferenceResponse = await clusterClient.inference(
      {
        messages: body.messages,
        max_tokens: body.max_tokens || 2000, // Increased to ensure complete responses
        temperature: body.temperature || 0.7,
      },
      {
        strategy,
        maxRetries,
        fallbackToAny: true,
      }
    )

    const latency = Date.now() - startTime

    // Calculate cost
    const tokens = inferenceResponse.usage?.total_tokens || 0
    const pricePerToken = 0.000001 // $0.001 per 1K tokens
    const cost = tokens * pricePerToken

    // Parse response content
    let content = ''
    if (inferenceResponse.choices && inferenceResponse.choices.length > 0) {
      const choice = inferenceResponse.choices[0] as any
      content = choice.message?.content || choice.messages?.content || choice.text || ''

      // Clean up <think> tags if present
      if (content.includes('<think>')) {
        const thinkEnd = content.indexOf('</think>')
        if (thinkEnd !== -1) {
          content = content.substring(thinkEnd + 8).trim()
        } else {
          content = content.replace(/<think>\\n?/g, '').trim()
        }
      }
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Empty response from Parallax' },
        { status: 500 }
      )
    }

    // Get provider info from cluster
    const clusterStatus = clusterClient.getClusterStatus()
    const selectedProvider = clusterStatus.providers.find(p => p.status === 'online')
    const provider = selectedProvider?.name || body.provider || 'Parallax Cluster'
    const model = inferenceResponse.model || 'Qwen-0.5B'

    // Extract payment transaction hash from request headers if available
    // This will be set by the x402 middleware after payment settlement
    const txHash = request.headers.get('x-payment-response')
      ? JSON.parse(
          Buffer.from(request.headers.get('x-payment-response')!, 'base64').toString('utf-8')
        ).txHash
      : undefined

    // Prepare response
    const response: InferenceResponse = {
      response: content,
      tokens,
      provider,
      cost,
      latency,
      model,
      ...(txHash && { txHash }),
    }

    // Log successful inference
    if (process.env.ENABLE_TX_LOGGING !== 'false') {
      console.log(`✅ Paid inference completed`)
      console.log(`   Tokens: ${tokens}`)
      console.log(`   Cost: $${cost.toFixed(6)}`)
      console.log(`   Latency: ${latency}ms`)
      console.log(`   Provider: ${provider}`)
      if (txHash) {
        console.log(`   TX Hash: ${txHash}`)
      }
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Paid inference error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const latency = Date.now() - startTime

    return NextResponse.json(
      {
        error: 'Inference failed',
        details: errorMessage,
        latency,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/inference/paid
 *
 * Returns endpoint information (also protected by x402 payment)
 */
export async function GET(request: NextRequest) {
  return NextResponse.json({
    endpoint: '/api/inference/paid',
    description: 'AI Inference API with x402 micropayments',
    price: '$0.001 per 1000 tokens',
    network: process.env.X402_NETWORK || 'solana-devnet',
    method: 'POST',
    body: {
      messages: [
        {
          role: 'user',
          content: 'Your prompt here',
        },
      ],
      max_tokens: 2000,
      temperature: 0.7,
      provider: 'optional-provider-id',
    },
    response: {
      response: 'AI generated response',
      tokens: 'number of tokens used',
      provider: 'provider that fulfilled the request',
      cost: 'cost in USD',
      latency: 'response time in ms',
      txHash: 'Solana transaction hash',
    },
  })
}

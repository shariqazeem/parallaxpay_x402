/**
 * Paid AI Inference API Endpoint
 *
 * This endpoint is protected by x402 payment middleware.
 * Clients must include X-PAYMENT header with valid payment to access.
 *
 * Supports multiple AI backends:
 * - Parallax Cluster (local distributed compute)
 * - Gradient Cloud API (cloud fallback when Parallax unavailable)
 *
 * Flow:
 * 1. Client requests inference
 * 2. Middleware returns 402 Payment Required
 * 3. Client creates payment and retries with X-PAYMENT header
 * 4. Middleware verifies payment via facilitator (x402 Solana micropayment)
 * 5. This handler routes to appropriate backend (Parallax or Gradient Cloud)
 * 6. Response includes inference result + X-PAYMENT-RESPONSE header with tx details
 */

import { NextRequest, NextResponse } from 'next/server'
import { createClusterClient } from '@/lib/parallax-cluster'
import { getProviderDiscoveryService } from '@/lib/provider-discovery'
import { getRealProviderManager } from '@/lib/real-provider-manager'

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

    // Check if requesting a specific provider (e.g., Gradient Cloud)
    const providerManager = getRealProviderManager()

    // Ensure providers are discovered before trying to get a specific one
    let allProviders = providerManager.getAllProviders()
    if (allProviders.length === 0) {
      console.log('🔍 No providers in cache, discovering...')
      await providerManager.discoverProviders()
      allProviders = providerManager.getAllProviders()
    }

    // Get requested provider by ID or name
    let requestedProvider = body.provider ? providerManager.getProvider(body.provider) : null

    // If not found by ID, try matching by name
    if (!requestedProvider && body.provider) {
      requestedProvider = allProviders.find(p => p.name === body.provider) || null
    }

    console.log(`📋 Request details:`)
    console.log(`   Requested provider: ${body.provider || 'auto-select'}`)
    console.log(`   Found provider: ${requestedProvider ? `${requestedProvider.name} (${requestedProvider.id}, type: ${requestedProvider.type || 'N/A'})` : 'none'}`)
    console.log(`   Available providers: ${allProviders.map(p => `${p.name} (${p.id})`).join(', ')}`)

    let inferenceResponse: any
    let providerName: string
    let modelName: string

    // Route to appropriate backend based on provider type
    if (requestedProvider && requestedProvider.type === 'gradient-cloud') {
      // ==========================================
      // GRADIENT CLOUD API PATH (with x402 payment)
      // ==========================================
      console.log('🌐 Using Gradient Cloud API backend (x402 payment applied)')

      const apiKey = process.env.NEXT_PUBLIC_GRADIENT_API_KEY || process.env.GRADIENT_API_KEY
      if (!apiKey) {
        return NextResponse.json(
          {
            error: 'Gradient Cloud API not configured',
            details: 'Set GRADIENT_API_KEY in environment variables',
          },
          { status: 503 }
        )
      }

      // Call Gradient Cloud API
      const gradientResponse = await fetch('https://apis.gradient.network/api/v1/ai/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: requestedProvider.model || 'openai/gpt-4o-mini',
          messages: body.messages,
          max_tokens: body.max_tokens || 512,
          temperature: body.temperature || 0.7,
          performance_type: 0,
          stream: false,
        }),
      })

      if (!gradientResponse.ok) {
        const errorText = await gradientResponse.text()
        console.error('❌ Gradient Cloud API error:', errorText)
        return NextResponse.json(
          {
            error: 'Gradient Cloud API request failed',
            details: errorText,
          },
          { status: gradientResponse.status }
        )
      }

      inferenceResponse = await gradientResponse.json()
      providerName = requestedProvider.name
      modelName = requestedProvider.model
    } else {
      // ==========================================
      // PARALLAX CLUSTER PATH (with x402 payment)
      // ==========================================
      console.log('💻 Using Parallax Cluster backend (x402 payment applied)')

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
              error: 'No providers available',
              details: `No Parallax nodes or Gradient Cloud configured. Start Parallax: ./scripts/start-parallax-cluster.sh\nOr set GRADIENT_API_KEY for cloud fallback`,
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

      inferenceResponse = await clusterClient.inference(
        {
          messages: body.messages,
          max_tokens: 512, // Balanced for M1 8GB RAM
          temperature: body.temperature || 0.7,
        },
        {
          strategy,
          maxRetries,
          fallbackToAny: true,
        }
      )

      // Get provider info from cluster
      const clusterStatus = clusterClient.getClusterStatus()
      const selectedProvider = clusterStatus.providers.find(p => p.status === 'online')
      providerName = selectedProvider?.name || body.provider || 'Parallax Cluster'
      modelName = inferenceResponse.model || 'Qwen-0.5B'
    }

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
        { error: 'Empty response from AI provider' },
        { status: 500 }
      )
    }

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
      provider: providerName,
      cost,
      latency,
      model: modelName,
      ...(txHash && { txHash }),
    }

    // Log successful inference
    if (process.env.ENABLE_TX_LOGGING !== 'false') {
      console.log(`✅ Paid inference completed (x402 payment verified)`)
      console.log(`   Tokens: ${tokens}`)
      console.log(`   Cost: $${cost.toFixed(6)}`)
      console.log(`   Latency: ${latency}ms`)
      console.log(`   Provider: ${providerName}`)
      console.log(`   Model: ${modelName}`)
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
  const providerManager = getRealProviderManager()
  const allProviders = providerManager.getAllProviders()
  const providerList = allProviders.map(p => ({
    id: p.id,
    name: p.name,
    type: p.type,
    model: p.model,
    online: p.online,
  }))

  return NextResponse.json({
    endpoint: '/api/inference/paid',
    description: 'AI Inference API with x402 Solana micropayments',
    price: '$0.001 per request (covers ~1000 tokens)',
    network: process.env.X402_NETWORK || 'solana-devnet',
    providers: providerList,
    method: 'POST',
    body: {
      messages: [
        {
          role: 'user',
          content: 'Your prompt here',
        },
      ],
      max_tokens: 512,
      temperature: 0.7,
      provider: 'optional-provider-id (e.g., "parallax-cluster" or "gradient-cloud")',
    },
    response: {
      response: 'AI generated response',
      tokens: 'number of tokens used',
      provider: 'provider that fulfilled the request',
      cost: 'cost in USD',
      latency: 'response time in ms',
      txHash: 'Solana transaction hash (x402 payment proof)',
    },
  })
}

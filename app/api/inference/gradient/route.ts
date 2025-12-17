/**
 * Gradient Cloud AI Inference API Endpoint
 *
 * This endpoint uses Gradient Cloud API with API key authentication.
 * NO x402 payment required - uses cloud API billing instead.
 *
 * Flow:
 * 1. Client requests inference with Gradient Cloud provider
 * 2. Server uses API key to call Gradient Cloud API
 * 3. Response includes inference result
 */

import { NextRequest, NextResponse } from 'next/server'

export interface GradientInferenceRequest {
  messages: Array<{
    role: 'user' | 'assistant' | 'system'
    content: string
  }>
  max_tokens?: number
  temperature?: number
  model?: string
}

export interface GradientInferenceResponse {
  response: string
  tokens: number
  provider: string
  cost: number
  latency: number
  model: string
}

/**
 * POST /api/inference/gradient
 *
 * Gradient Cloud API inference - no x402 payment required
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request body
    const body: GradientInferenceRequest = await request.json()

    // Validate request
    if (!body.messages || !Array.isArray(body.messages) || body.messages.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: messages array is required' },
        { status: 400 }
      )
    }

    // Get Gradient API key
    const apiKey = process.env.NEXT_PUBLIC_GRADIENT_API_KEY || process.env.GRADIENT_API_KEY

    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'Gradient Cloud API not configured',
          details: 'Set GRADIENT_API_KEY or NEXT_PUBLIC_GRADIENT_API_KEY in .env',
        },
        { status: 503 }
      )
    }

    // Call Gradient Cloud API
    const model = body.model || 'openai/gpt-4o-mini'
    const gradientResponse = await fetch('https://apis.gradient.network/api/v1/ai/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages: body.messages,
        max_tokens: body.max_tokens || 512,
        temperature: body.temperature || 0.7,
        performance_type: 0,
        stream: false, // Use non-streaming for simpler response handling
      }),
    })

    if (!gradientResponse.ok) {
      const errorText = await gradientResponse.text()
      console.error('❌ Gradient Cloud API error:', errorText)
      return NextResponse.json(
        {
          error: 'Gradient Cloud API request failed',
          details: errorText,
          status: gradientResponse.status,
        },
        { status: gradientResponse.status }
      )
    }

    const data = await gradientResponse.json()
    const latency = Date.now() - startTime

    // Parse Gradient response
    let content = ''
    if (data.choices && data.choices.length > 0) {
      content = data.choices[0].message?.content || ''
    }

    if (!content) {
      return NextResponse.json(
        { error: 'Empty response from Gradient Cloud API' },
        { status: 500 }
      )
    }

    // Calculate tokens and cost
    const tokens = data.usage?.total_tokens || 0
    const pricePerToken = 0.0000002 // Gradient Cloud pricing estimate
    const cost = tokens * pricePerToken

    // Prepare response
    const response: GradientInferenceResponse = {
      response: content,
      tokens,
      provider: '🌐 Gradient Cloud API',
      cost,
      latency,
      model,
    }

    // Log successful inference
    if (process.env.ENABLE_TX_LOGGING !== 'false') {
      console.log(`✅ Gradient Cloud inference completed`)
      console.log(`   Tokens: ${tokens}`)
      console.log(`   Cost: $${cost.toFixed(6)}`)
      console.log(`   Latency: ${latency}ms`)
      console.log(`   Model: ${model}`)
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Gradient Cloud inference error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const latency = Date.now() - startTime

    return NextResponse.json(
      {
        error: 'Gradient Cloud inference failed',
        details: errorMessage,
        latency,
      },
      { status: 500 }
    )
  }
}

/**
 * GET /api/inference/gradient
 *
 * Returns endpoint information
 */
export async function GET(request: NextRequest) {
  const apiKey = process.env.NEXT_PUBLIC_GRADIENT_API_KEY || process.env.GRADIENT_API_KEY

  return NextResponse.json({
    endpoint: '/api/inference/gradient',
    description: 'Gradient Cloud AI Inference API',
    authentication: 'API Key (configured via environment variables)',
    configured: !!apiKey,
    pricing: 'Cloud API billing (no x402 payment required)',
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
      model: 'openai/gpt-4o-mini',
    },
    response: {
      response: 'AI generated response',
      tokens: 'number of tokens used',
      provider: 'Gradient Cloud API',
      cost: 'cost in USD',
      latency: 'response time in ms',
    },
  })
}

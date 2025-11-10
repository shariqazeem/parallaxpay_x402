import { paymentMiddleware, Resource, Network } from 'x402-next'
import { NextRequest, NextResponse } from 'next/server'

/**
 * x402 Payment Middleware Configuration for ParallaxPay
 *
 * This middleware enables real micropayments for AI inference services
 * using the x402 protocol on Solana blockchain.
 *
 * Flow:
 * 1. Client requests protected endpoint
 * 2. Middleware returns 402 Payment Required
 * 3. Client creates payment payload and signs with wallet
 * 4. Client retries with X-PAYMENT header
 * 5. Middleware verifies payment via facilitator
 * 6. On success, returns resource with X-PAYMENT-RESPONSE header
 */

// =============================================================================
// CONFIGURATION
// =============================================================================

// Development mode - bypass payments for local testing
// Set NEXT_PUBLIC_DEV_MODE=true in .env.local ONLY for development
// For hackathon demo and production, this should be FALSE
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

if (DEV_MODE) {
  console.warn('⚠️  [WARNING] DEV_MODE is enabled - payments are bypassed!')
  console.warn('⚠️  Set NEXT_PUBLIC_DEV_MODE=false in .env.local for real payments')
}

// Your Solana wallet address that receives payments
const address = (process.env.SOLANA_WALLET_ADDRESS || '9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y') as any

// Network configuration
const network = (process.env.X402_NETWORK || 'solana-devnet') as Network

// Facilitator configuration
// Use CDP facilitator if credentials are available, otherwise use x402.org
let facilitatorUrl: Resource
let facilitatorOptions: any = undefined

if (process.env.CDP_API_KEY_ID && process.env.CDP_API_KEY_SECRET) {
  // Use CDP facilitator with authentication
  console.log('🔐 Using Coinbase CDP facilitator with authentication')
  const { createFacilitatorConfig } = require('@coinbase/x402')
  const cdpConfig = createFacilitatorConfig(
    process.env.CDP_API_KEY_ID,
    process.env.CDP_API_KEY_SECRET
  )
  facilitatorUrl = cdpConfig.url
  facilitatorOptions = cdpConfig
} else {
  // Use public x402.org facilitator for testnet
  console.log('🌐 Using public x402.org facilitator (testnet)')
  facilitatorUrl = (process.env.X402_FACILITATOR_URL || 'https://x402.org/facilitator') as Resource
}

// CDP Client Key for better wallet UI
const cdpClientKey = process.env.NEXT_PUBLIC_CDP_CLIENT_KEY || ''

// Pricing configuration
const PRICE_BASIC = process.env.PRICE_BASIC || '$0.01'
const PRICE_STANDARD = process.env.PRICE_STANDARD || '$0.05'
const PRICE_PREMIUM = process.env.PRICE_PREMIUM || '$0.25'

// =============================================================================
// x402 PAYMENT ROUTES
// =============================================================================

const x402PaymentMiddleware = paymentMiddleware(
  address,
  {
    // Test endpoint
    '/test': {
      price: '$0.01',
      config: {
        description: 'Test x402 payment endpoint',
        mimeType: 'text/html',
      },
      network,
    },

    // AI Inference Payment Tiers
    '/content/basic': {
      price: PRICE_BASIC,
      config: {
        description: 'Basic AI Inference - Qwen 0.6B model (100 tokens)',
        mimeType: 'application/json',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'User prompt for inference' },
          },
          required: ['prompt'],
        } as any,
        outputSchema: {
          type: 'object',
          properties: {
            result: { type: 'string', description: 'AI generated response' },
            tokens: { type: 'number', description: 'Number of tokens used' },
            cost: { type: 'number', description: 'Cost in USD' },
          },
        },
      },
      network,
    },

    '/content/standard': {
      price: PRICE_STANDARD,
      config: {
        description: 'Standard AI Inference - Qwen 1.7B model (256 tokens)',
        mimeType: 'application/json',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'User prompt for inference' },
            max_tokens: { type: 'number', description: 'Maximum tokens to generate' },
          },
          required: ['prompt'],
        },
        outputSchema: {
          type: 'object',
          properties: {
            result: { type: 'string', description: 'AI generated response' },
            tokens: { type: 'number', description: 'Number of tokens used' },
            cost: { type: 'number', description: 'Cost in USD' },
          },
        },
      },
      network,
    },

    '/content/premium': {
      price: PRICE_PREMIUM,
      config: {
        description: 'Premium AI Inference - Advanced Qwen 2.5B model (512 tokens)',
        mimeType: 'application/json',
        inputSchema: {
          type: 'object',
          properties: {
            prompt: { type: 'string', description: 'User prompt for inference' },
            max_tokens: { type: 'number', description: 'Maximum tokens to generate' },
            temperature: { type: 'number', description: 'Sampling temperature' },
          },
          required: ['prompt'],
        },
        outputSchema: {
          type: 'object',
          properties: {
            result: { type: 'string', description: 'AI generated response' },
            tokens: { type: 'number', description: 'Number of tokens used' },
            cost: { type: 'number', description: 'Cost in USD' },
            latency: { type: 'number', description: 'Response latency in ms' },
          },
        },
      },
      network,
    },

    // API endpoint for composite agent execution
    '/api/runCompositeAgent': {
      price: '$0.003', // Fixed price per composite workflow (covers multiple steps)
      config: {
        description: 'Composite Agent Workflow - Fixed $0.003 per workflow',
        mimeType: 'application/json',
        inputSchema: {
          type: 'object',
          properties: {
            workflow: {
              type: 'object',
              description: 'Workflow definition with multiple agent steps',
            },
            initialInput: { type: 'string', description: 'Optional initial input' },
            provider: { type: 'string', description: 'Preferred Parallax provider' },
          },
          required: ['workflow'],
        },
        outputSchema: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            finalOutput: { type: 'string' },
            totalCost: { type: 'number' },
            executionTrail: { type: 'array' },
          },
        },
      },
      network,
    },

    // API endpoint for agent inference payments
    '/api/inference/paid': {
      price: '$0.001', // Fixed price per request (covers ~1000 tokens average)
      config: {
        description: 'AI Inference API - Fixed $0.001 per request',
        mimeType: 'application/json',
        inputSchema: {
          type: 'object',
          properties: {
            messages: {
              type: 'array',
              description: 'Chat messages for inference',
              items: {
                type: 'object',
                properties: {
                  role: { type: 'string', enum: ['user', 'assistant', 'system'] },
                  content: { type: 'string' },
                },
              },
            },
            max_tokens: { type: 'number', description: 'Maximum tokens to generate (controls response length)' },
            provider: { type: 'string', description: 'Preferred Parallax provider ID' },
          },
          required: ['messages'],
        },
        outputSchema: {
          type: 'object',
          properties: {
            response: { type: 'string', description: 'AI generated response' },
            tokens: { type: 'number', description: 'Total tokens used' },
            provider: { type: 'string', description: 'Provider used for inference' },
            cost: { type: 'number', description: 'Fixed cost: $0.001 per request' },
            txHash: { type: 'string', description: 'Solana transaction hash' },
          },
        },
      },
      network,
    },
  },
  facilitatorOptions || {
    url: facilitatorUrl,
  },
  cdpClientKey ? {
    cdpClientKey,
    appName: 'ParallaxPay',
    appLogo: '/logo.png',
  } : undefined
)

// =============================================================================
// MIDDLEWARE HANDLER
// =============================================================================

export const middleware = (req: NextRequest) => {
  // Log payment requests for debugging
  const pathname = req.nextUrl.pathname

  // In dev mode, bypass x402 payments for easy testing
  if (DEV_MODE) {
    console.log(`🔓 [DEV MODE] Bypassing x402 payment for: ${pathname}`)
    return NextResponse.next()
  }

  // Production mode - enforce x402 payments
  console.log(`💳 [x402] Processing payment request for: ${pathname}`)

  const delegate = x402PaymentMiddleware as unknown as (
    request: NextRequest,
  ) => ReturnType<typeof x402PaymentMiddleware>

  return delegate(req)
}

// =============================================================================
// ROUTE MATCHING
// =============================================================================

export const config = {
  matcher: [
    '/content/:path*',
    '/test',
    '/test-payment',
    '/api/inference/paid',
    '/api/runCompositeAgent', // Protect composite agent endpoint with x402
  ],
}
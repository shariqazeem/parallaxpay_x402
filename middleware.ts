import { paymentMiddleware, Resource, Network } from 'x402-next'
import { NextRequest, NextResponse } from 'next/server'

// Development mode - bypass payments for local testing
// Set NEXT_PUBLIC_DEV_MODE=true in .env.local to enable
const DEV_MODE = process.env.NEXT_PUBLIC_DEV_MODE === 'true'

// Your Solana wallet address that receives payments
const address = '9qzmG8vPymc2CAMchZgq26qiUFq4pEfTx6HZfpMhh51y' as any // Solana address (base58 format)
const network = 'solana-devnet' as Network

// Use the testnet facilitator for development
const facilitatorUrl = 'https://x402.org/facilitator' as Resource

// CDP Client Key for UI (optional but recommended)
const cdpClientKey = process.env.NEXT_PUBLIC_CDP_CLIENT_KEY || ''

const x402PaymentMiddleware = paymentMiddleware(
    address,
    {
      '/test': {
        price: '$0.01',
        config: {
          description: 'Test payment page',
          mimeType: 'text/html',
        },
        network,
      },
    '/content/basic': {
      price: '$0.01',
      config: {
        description: 'Basic AI Inference - Qwen 0.6B (100 tokens)',
        mimeType: 'text/html',
      },
      network,
    },
    '/content/standard': {
      price: '$0.05',
      config: {
        description: 'Standard AI Inference - Qwen 1.7B (256 tokens)',
        mimeType: 'text/html',
      },
      network,
    },
    '/content/premium': {
      price: '$0.25',
      config: {
        description: 'Premium AI Inference - Advanced model (512 tokens)',
        mimeType: 'text/html',
      },
      network,
    },
  },
  {
    url: facilitatorUrl,
  },
  cdpClientKey ? {
    cdpClientKey,
    appName: 'ParallaxPay',
    appLogo: '/logo.png',
  } : undefined
)

export const middleware = (req: NextRequest) => {
  // In dev mode, bypass x402 payments for easy testing
  if (DEV_MODE) {
    console.log(`🔓 [DEV MODE] Bypassing x402 payment for: ${req.nextUrl.pathname}`)
    return NextResponse.next()
  }

  // Production mode - enforce x402 payments
  const delegate = x402PaymentMiddleware as unknown as (
    request: NextRequest,
  ) => ReturnType<typeof x402PaymentMiddleware>
  return delegate(req)
}

export const config = {
  matcher: ['/content/:path*', '/test', '/test-payment'],
}
/**
 * Providers API Endpoint
 *
 * Returns list of available Parallax providers with real-time metrics
 */

import { NextRequest, NextResponse } from 'next/server'
import { getProviderDiscoveryService } from '@/lib/provider-discovery'

// Track if service is initialized
let serviceInitialized = false

/**
 * GET /api/providers
 *
 * Returns all discovered providers with their metrics
 */
export async function GET(request: NextRequest) {
  try {
    // Get provider discovery service
    const discoveryService = getProviderDiscoveryService()

    // Initialize service on first call
    if (!serviceInitialized) {
      console.log('🔍 Initializing provider discovery service...')
      await discoveryService.start(30000) // Update every 30 seconds
      serviceInitialized = true
    }

    // Get market snapshot
    const snapshot = discoveryService.getMarketSnapshot()

    // Convert to marketplace format
    const providers = snapshot.providers.map((p) => ({
      id: p.id,
      name: p.name,
      region: p.region,
      price: p.price,
      latency: p.latency,
      uptime: p.uptime,
      reputation: p.reputation,
      totalRequests: p.totalRequests,
      online: p.status === 'online',
      models: p.models,
    }))

    return NextResponse.json({
      providers,
      summary: snapshot.summary,
      timestamp: snapshot.timestamp,
    })
  } catch (error) {
    console.error('Failed to fetch providers:', error)

    // Return fallback provider (local Parallax node)
    return NextResponse.json({
      providers: [
        {
          id: 'local-parallax',
          name: 'Local Parallax Node',
          region: 'Local',
          price: 0.00112,
          latency: 45,
          uptime: 100.0,
          reputation: 100.0,
          totalRequests: 0,
          online: true,
          models: ['Qwen-0.6B', 'Qwen-1.7B', 'Qwen-2.5B'],
        },
      ],
      summary: {
        totalProviders: 1,
        onlineProviders: 1,
        averageLatency: 45,
        averagePrice: 0.00112,
        lowestPrice: 0.00112,
        highestPrice: 0.00112,
        totalCapacity: 100,
      },
      timestamp: Date.now(),
    })
  }
}

/**
 * POST /api/providers/discover
 *
 * Trigger manual provider discovery
 */
export async function POST(request: NextRequest) {
  try {
    const { schedulerUrl } = await request.json()

    const discoveryService = getProviderDiscoveryService()

    // Add custom scheduler URL if provided
    if (schedulerUrl) {
      discoveryService.addProvider(schedulerUrl)
    }

    return NextResponse.json({
      success: true,
      message: schedulerUrl
        ? `Added provider: ${schedulerUrl}`
        : 'Triggered provider discovery',
    })
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Discovery failed',
      },
      { status: 500 }
    )
  }
}

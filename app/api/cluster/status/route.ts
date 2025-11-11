/**
 * Cluster Status API Endpoint
 *
 * Returns real-time status of the Parallax cluster including:
 * - All discovered providers
 * - Health metrics (latency, uptime, reputation)
 * - Load balancing statistics
 */

import { NextResponse } from 'next/server'
import { getProviderDiscoveryService } from '@/lib/provider-discovery'

export async function GET() {
  try {
    const discoveryService = getProviderDiscoveryService()
    const snapshot = discoveryService.getMarketSnapshot()

    return NextResponse.json(snapshot, { status: 200 })
  } catch (error) {
    console.error('Failed to get cluster status:', error)

    return NextResponse.json(
      {
        error: 'Failed to get cluster status',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}

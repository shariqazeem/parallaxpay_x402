/**
 * Health Check API Endpoint
 *
 * Simple health check for Docker container monitoring.
 * Returns 200 if the server is responding, 503 if unhealthy.
 */

import { NextResponse } from 'next/server'

// Track startup time for uptime calculation
const startTime = Date.now()

// Simple memory check to detect memory leaks
function checkMemoryHealth(): { healthy: boolean; usage: number } {
  if (typeof process !== 'undefined' && process.memoryUsage) {
    const usage = process.memoryUsage()
    const heapUsedMB = usage.heapUsed / 1024 / 1024
    const heapTotalMB = usage.heapTotal / 1024 / 1024
    const usagePercent = (heapUsedMB / heapTotalMB) * 100

    // Unhealthy if using >90% of heap
    return {
      healthy: usagePercent < 90,
      usage: Math.round(usagePercent),
    }
  }
  return { healthy: true, usage: 0 }
}

export async function GET() {
  try {
    const memoryHealth = checkMemoryHealth()
    const uptimeSeconds = Math.floor((Date.now() - startTime) / 1000)

    const healthData = {
      status: memoryHealth.healthy ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      uptime: uptimeSeconds,
      memory: {
        healthy: memoryHealth.healthy,
        usagePercent: memoryHealth.usage,
      },
    }

    // Return 503 if memory is unhealthy (triggers container restart)
    const statusCode = memoryHealth.healthy ? 200 : 503

    return NextResponse.json(healthData, { status: statusCode })
  } catch (error) {
    // If health check itself fails, return unhealthy
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 503 }
    )
  }
}

/**
 * Next.js Instrumentation File
 *
 * This file runs once when the Next.js server starts.
 * Perfect for initializing services like provider discovery.
 *
 * @see https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server-side
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    console.log('🚀 Initializing ParallaxPay server...')

    try {
      // Dynamic import to avoid bundling client-side
      const { initializeProviderDiscovery } = await import('./lib/provider-discovery')

      // Get cluster URLs from environment
      const clusterUrls = process.env.PARALLAX_CLUSTER_URLS?.split(',').map(url => url.trim()).filter(Boolean)
      const singleUrl = process.env.PARALLAX_SCHEDULER_URL
      const urls = clusterUrls || (singleUrl ? [singleUrl] : undefined)

      // Initialize provider discovery
      const intervalMs = parseInt(process.env.PROVIDER_DISCOVERY_INTERVAL || '30000')
      const discovery = await initializeProviderDiscovery(urls, intervalMs)

      console.log('✅ Provider discovery initialized')

      // Log cluster status after a short delay
      setTimeout(() => {
        const snapshot = discovery.getMarketSnapshot()
        console.log(`📊 Cluster Status:`)
        console.log(`   • Total Providers: ${snapshot.summary.totalProviders}`)
        console.log(`   • Online Providers: ${snapshot.summary.onlineProviders}`)
        console.log(`   • Average Latency: ${Math.round(snapshot.summary.averageLatency)}ms`)

        if (snapshot.summary.onlineProviders === 0) {
          console.warn('⚠️  No Parallax nodes detected!')
          console.warn('   Run: ./scripts/start-parallax-cluster.sh')
        }
      }, 5000)

    } catch (error) {
      console.error('❌ Failed to initialize provider discovery:', error)
      console.warn('   Parallax functionality may be limited')
    }

    console.log('🎉 ParallaxPay server ready!')
  }
}

/**
 * Parallax Cluster Client with Gradient Fallback
 *
 * Intelligent client that:
 * 1. Load-balances across multiple Parallax nodes (when available)
 * 2. Automatically falls back to Gradient Cloud API when Parallax is unavailable
 *
 * Uses provider discovery to select the best node for each inference request
 */

import { createParallaxClient, type ParallaxInferenceRequest, type ParallaxInferenceResponse } from './parallax-client'
import { getProviderDiscoveryService, type LoadBalancingStrategy } from './provider-discovery'
import { createUnifiedInferenceClient, type UnifiedInferenceRequest } from './unified-inference-client'

export interface ClusterInferenceOptions {
  strategy?: LoadBalancingStrategy
  fallbackToAny?: boolean // If no ideal provider found, use any available
  maxRetries?: number // Retry on different nodes if one fails
}

/**
 * Parallax Cluster Client
 *
 * Automatically distributes inference requests across multiple Parallax nodes
 */
export class ParallaxClusterClient {
  private discoveryService = getProviderDiscoveryService()
  private defaultStrategy: LoadBalancingStrategy = 'latency-based'
  private unifiedClient = createUnifiedInferenceClient()

  /**
   * Perform inference with automatic load balancing
   */
  async inference(
    request: ParallaxInferenceRequest,
    options: ClusterInferenceOptions = {}
  ): Promise<ParallaxInferenceResponse> {
    const {
      strategy = this.defaultStrategy,
      fallbackToAny = true,
      maxRetries = 2,
    } = options

    let lastError: Error | null = null
    let excludedProviders: string[] = []

    // Try up to maxRetries times
    for (let attempt = 0; attempt < maxRetries; attempt++) {
      try {
        // Select best provider
        const provider = this.discoveryService.selectBestProvider({
          strategy,
          excludeProviders: excludedProviders,
          minReputation: 0, // Allow any reputation on retries
        })

        if (!provider) {
          if (fallbackToAny) {
            // Try first online provider
            const onlineProviders = this.discoveryService.getOnlineProviders()
            if (onlineProviders.length > 0) {
              const fallbackProvider = onlineProviders[0]
              console.log(`⚠️  No ideal provider, falling back to: ${fallbackProvider.name}`)
              return await this.performInference(fallbackProvider.address, request, fallbackProvider.id)
            }
          }
          throw new Error('No Parallax providers available')
        }

        // Perform inference
        const startTime = Date.now()
        const response = await this.performInference(provider.address, request, provider.id)
        const latency = Date.now() - startTime

        // Record success
        this.discoveryService.recordRequest(provider.id, true, latency)

        return response

      } catch (error) {
        lastError = error as Error

        // If we have a provider, mark it as failed and exclude from next attempt
        const failedProvider = this.discoveryService.selectBestProvider({
          strategy,
          excludeProviders: excludedProviders,
        })

        if (failedProvider) {
          this.discoveryService.recordRequest(failedProvider.id, false, 0)
          excludedProviders.push(failedProvider.id)
          console.warn(`❌ Provider ${failedProvider.name} failed, trying next...`)
        }

        // If this is not the last attempt, continue to retry
        if (attempt < maxRetries - 1) {
          continue
        }
      }
    }

    // All attempts failed
    throw new Error(`Cluster inference failed after ${maxRetries} attempts: ${lastError?.message}`)
  }

  /**
   * Perform inference on specific provider (Parallax or Gradient)
   */
  private async performInference(
    schedulerUrl: string,
    request: ParallaxInferenceRequest,
    providerId: string
  ): Promise<ParallaxInferenceResponse> {
    // Check if this is Gradient Cloud API provider
    if (providerId === 'gradient-cloud-api') {
      console.log('🌐 Using Gradient Cloud API (selected from marketplace)')

      const unifiedRequest: UnifiedInferenceRequest = {
        messages: request.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        maxTokens: request.max_tokens,
        temperature: request.temperature,
        stream: request.stream,
      }

      const response = await this.unifiedClient.inference(unifiedRequest)
      return response as ParallaxInferenceResponse
    }

    // Try Parallax provider
    try {
      const client = createParallaxClient(schedulerUrl)
      return await client.inference(request)
    } catch (error) {
      // If Parallax fails, try unified client as fallback
      console.log(`⚠️  Parallax provider ${providerId} failed, attempting Gradient fallback...`)

      const unifiedRequest: UnifiedInferenceRequest = {
        messages: request.messages.map(msg => ({
          role: msg.role,
          content: msg.content,
        })),
        maxTokens: request.max_tokens,
        temperature: request.temperature,
        stream: request.stream,
      }

      const response = await this.unifiedClient.inference(unifiedRequest)

      if (response.provider === 'gradient') {
        console.log('✅ Successfully fell back to Gradient Cloud API')
      }

      return response as ParallaxInferenceResponse
    }
  }

  /**
   * Get cluster status
   */
  getClusterStatus() {
    return this.discoveryService.getMarketSnapshot()
  }

  /**
   * Set default load balancing strategy
   */
  setDefaultStrategy(strategy: LoadBalancingStrategy) {
    this.defaultStrategy = strategy
    console.log(`🔧 Cluster strategy set to: ${strategy}`)
  }
}

/**
 * Create cluster client instance
 */
export function createClusterClient(): ParallaxClusterClient {
  return new ParallaxClusterClient()
}

/**
 * Example usage:
 *
 * ```typescript
 * // Initialize provider discovery first (on server startup)
 * await initializeProviderDiscovery([
 *   'http://localhost:3001',
 *   'http://localhost:3002',
 * ])
 *
 * // Use cluster client
 * const cluster = createClusterClient()
 *
 * // Automatically load-balances across available nodes
 * const response = await cluster.inference({
 *   messages: [{ role: 'user', content: 'Hello!' }]
 * }, {
 *   strategy: 'latency-based', // or 'round-robin' or 'random'
 *   maxRetries: 3
 * })
 * ```
 */

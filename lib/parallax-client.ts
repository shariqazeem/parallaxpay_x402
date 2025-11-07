/**
 * Gradient Parallax API Client
 *
 * Connects to your local Parallax scheduler to perform real AI inference
 * across your distributed GPU cluster.
 */

export interface ParallaxConfig {
  schedulerUrl: string // Default: http://localhost:3001
  timeout?: number // Request timeout in ms
}

export interface ParallaxMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface ParallaxInferenceRequest {
  messages: ParallaxMessage[]
  max_tokens?: number
  temperature?: number
  stream?: boolean
  model?: string // Optional: specific model name
}

export interface ParallaxInferenceResponse {
  id: string
  object: string
  created: number
  model: string
  choices: Array<{
    index: number
    message: {
      role: string
      content: string
    }
    finish_reason: string
  }>
  usage: {
    prompt_tokens: number
    completion_tokens: number
    total_tokens: number
  }
}

export interface ParallaxProvider {
  id: string
  address: string
  status: 'online' | 'offline'
  model: string
  gpu: string
  latency?: number
}

/**
 * Parallax API Client
 */
export class ParallaxClient {
  private config: ParallaxConfig

  constructor(config: ParallaxConfig) {
    this.config = {
      timeout: 120000, // 120 seconds (2 minutes) - first inference is slow!
      ...config,
    }
  }

  /**
   * Perform AI inference using your Parallax cluster
   */
  async inference(
    request: ParallaxInferenceRequest
  ): Promise<ParallaxInferenceResponse> {
    const url = `${this.config.schedulerUrl}/v1/chat/completions`

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          max_tokens: request.max_tokens || 1024,
          messages: request.messages,
          temperature: request.temperature || 0.7,
          stream: request.stream || false,
        }),
        signal: AbortSignal.timeout(this.config.timeout!),
      })

      if (!response.ok) {
        throw new Error(
          `Parallax API error: ${response.status} ${response.statusText}`
        )
      }

      const data = await response.json()
      return data as ParallaxInferenceResponse
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Failed to connect to Parallax: ${error.message}`)
      }
      throw error
    }
  }

  /**
   * Get list of available providers in your cluster
   * Note: Parallax doesn't expose this endpoint yet, so we mock it
   */
  async getProviders(): Promise<ParallaxProvider[]> {
    // TODO: Once Parallax exposes a provider discovery endpoint, use it here
    // For now, we return a message that tells users how to check their cluster

    console.log('💡 To see your Parallax cluster nodes:')
    console.log('   1. Open http://localhost:3001 (Parallax scheduler UI)')
    console.log('   2. View the connected nodes in the setup interface')

    // Return empty array for now
    return []
  }

  /**
   * Check if Parallax scheduler is running
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(this.config.schedulerUrl, {
        method: 'GET',
        signal: AbortSignal.timeout(5000),
      })
      return response.ok
    } catch (error) {
      return false
    }
  }

  /**
   * Get estimated cost for inference
   * Based on typical Parallax token pricing
   */
  estimateCost(tokens: number): number {
    // Parallax is FREE when you run your own cluster!
    // But for marketplace simulation, we estimate based on cloud pricing
    const pricePerThousandTokens = 0.001 // $0.001 per 1K tokens
    return (tokens / 1000) * pricePerThousandTokens
  }
}

/**
 * Create a Parallax client instance
 */
export function createParallaxClient(
  schedulerUrl: string = 'http://localhost:3001'
): ParallaxClient {
  return new ParallaxClient({ schedulerUrl })
}

/**
 * Helper: Check if Parallax is running locally
 */
export async function isParallaxRunning(
  schedulerUrl: string = 'http://localhost:3001'
): Promise<boolean> {
  const client = createParallaxClient(schedulerUrl)
  return await client.healthCheck()
}

/**
 * Example usage:
 *
 * ```typescript
 * const client = createParallaxClient()
 *
 * const response = await client.inference({
 *   messages: [
 *     { role: 'user', content: 'Hello, how are you?' }
 *   ],
 *   max_tokens: 100
 * })
 *
 * console.log(response.choices[0].message.content)
 * ```
 */

/**
 * Unified Inference Client with Automatic Fallback
 *
 * This client provides a seamless experience by:
 * 1. First trying to use local Parallax (when available on Mac)
 * 2. Automatically falling back to Gradient Cloud API when Parallax is unavailable
 *
 * Perfect for deployments where Parallax isn't running (like Linux VMs)
 * while still using Parallax in local development.
 */

import {
  ParallaxClient,
  ParallaxInferenceRequest,
  ParallaxInferenceResponse,
  createParallaxClient,
} from './parallax-client';
import {
  GradientClient,
  GradientInferenceRequest,
  GradientInferenceResponse,
  createGradientClient,
} from './gradient-client';

export interface UnifiedInferenceConfig {
  // Parallax configuration (primary)
  parallaxSchedulerUrl?: string;
  parallaxTimeout?: number;

  // Gradient configuration (fallback)
  gradientApiKey?: string;
  gradientModel?: string;
  gradientBaseUrl?: string;

  // Fallback behavior
  enableFallback?: boolean; // Default: true
  preferredProvider?: 'parallax' | 'gradient' | 'auto'; // Default: 'auto'
  logFallback?: boolean; // Log when fallback occurs, default: true
}

export interface UnifiedInferenceRequest {
  messages: Array<{
    role: 'system' | 'user' | 'assistant';
    content: string;
  }>;
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface UnifiedInferenceResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  provider: 'parallax' | 'gradient'; // Which provider was actually used
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class UnifiedInferenceClient {
  private parallaxClient: ParallaxClient | null = null;
  private gradientClient: GradientClient | null = null;
  private config: Required<UnifiedInferenceConfig>;

  // Cache health check results to avoid repeated checks
  private parallaxHealthy: boolean | null = null;
  private gradientHealthy: boolean | null = null;
  private lastHealthCheck: number = 0;
  private healthCheckInterval: number = 30000; // 30 seconds

  constructor(config: UnifiedInferenceConfig = {}) {
    this.config = {
      parallaxSchedulerUrl:
        config.parallaxSchedulerUrl ||
        process.env.PARALLAX_SCHEDULER_URL ||
        'http://localhost:3001',
      parallaxTimeout: config.parallaxTimeout || 120000,
      gradientApiKey:
        config.gradientApiKey ||
        process.env.GRADIENT_API_KEY ||
        'ak-f5a93640ff449cd3d44457a5be3172d212355e56fdc0709f0bd5d1a042bc0d89',
      gradientModel:
        config.gradientModel ||
        process.env.GRADIENT_MODEL ||
        'openai/gpt-oss-120b',
      gradientBaseUrl:
        config.gradientBaseUrl ||
        process.env.GRADIENT_BASE_URL ||
        'https://apis.gradient.network/api/v1',
      enableFallback: config.enableFallback ?? true,
      preferredProvider: config.preferredProvider || 'auto',
      logFallback: config.logFallback ?? true,
    };

    this.initialize();
  }

  private initialize() {
    // Initialize Parallax client if URL is provided
    if (this.config.parallaxSchedulerUrl) {
      this.parallaxClient = createParallaxClient(this.config.parallaxSchedulerUrl);
    }

    // Initialize Gradient client if API key is provided
    if (this.config.gradientApiKey) {
      this.gradientClient = createGradientClient(
        this.config.gradientApiKey,
        this.config.gradientModel
      );
    }

    if (!this.parallaxClient && !this.gradientClient) {
      console.warn(
        '⚠️  No inference providers configured. Please provide either Parallax URL or Gradient API key.'
      );
    }
  }

  /**
   * Check health of both providers and cache results
   */
  private async checkProviderHealth(): Promise<void> {
    const now = Date.now();
    const needsCheck = now - this.lastHealthCheck > this.healthCheckInterval;

    if (!needsCheck && this.parallaxHealthy !== null && this.gradientHealthy !== null) {
      return; // Use cached results
    }

    // Check Parallax health
    if (this.parallaxClient) {
      try {
        this.parallaxHealthy = await this.parallaxClient.healthCheck();
      } catch {
        this.parallaxHealthy = false;
      }
    } else {
      this.parallaxHealthy = false;
    }

    // Check Gradient health
    if (this.gradientClient && this.config.enableFallback) {
      try {
        this.gradientHealthy = await this.gradientClient.healthCheck();
      } catch {
        this.gradientHealthy = false;
      }
    } else {
      this.gradientHealthy = this.gradientClient !== null;
    }

    this.lastHealthCheck = now;
  }

  /**
   * Determine which provider to use based on configuration and health
   */
  private async selectProvider(): Promise<'parallax' | 'gradient' | null> {
    await this.checkProviderHealth();

    // If user specified a preferred provider, try that first
    if (this.config.preferredProvider === 'parallax') {
      if (this.parallaxHealthy) return 'parallax';
      if (this.config.enableFallback && this.gradientHealthy) {
        if (this.config.logFallback) {
          console.log('🔄 Parallax unavailable, falling back to Gradient Cloud');
        }
        return 'gradient';
      }
      return null;
    }

    if (this.config.preferredProvider === 'gradient') {
      if (this.gradientHealthy) return 'gradient';
      if (this.parallaxHealthy) {
        if (this.config.logFallback) {
          console.log('🔄 Gradient unavailable, using Parallax');
        }
        return 'parallax';
      }
      return null;
    }

    // Auto mode: prefer Parallax (local) over Gradient (cloud)
    if (this.parallaxHealthy) {
      return 'parallax';
    }

    if (this.config.enableFallback && this.gradientHealthy) {
      if (this.config.logFallback) {
        console.log('🌐 Parallax not available, using Gradient Cloud API as fallback');
      }
      return 'gradient';
    }

    return null;
  }

  /**
   * Convert unified request to provider-specific format
   */
  private toParallaxRequest(request: UnifiedInferenceRequest): ParallaxInferenceRequest {
    return {
      messages: request.messages.map((msg) => ({
        role: msg.role as 'user' | 'assistant' | 'system',
        content: msg.content,
      })),
      max_tokens: request.maxTokens,
      temperature: request.temperature,
      stream: request.stream,
    };
  }

  private toGradientRequest(request: UnifiedInferenceRequest): GradientInferenceRequest {
    return {
      messages: request.messages,
      maxTokens: request.maxTokens,
      temperature: request.temperature,
      stream: request.stream,
    };
  }

  /**
   * Perform inference with automatic provider selection and fallback
   */
  async inference(request: UnifiedInferenceRequest): Promise<UnifiedInferenceResponse> {
    const provider = await this.selectProvider();

    if (!provider) {
      throw new Error(
        'No inference providers available. Please ensure either Parallax is running or Gradient API key is configured.'
      );
    }

    try {
      if (provider === 'parallax' && this.parallaxClient) {
        const response = await this.parallaxClient.inference(
          this.toParallaxRequest(request)
        );
        return {
          ...response,
          provider: 'parallax',
        };
      }

      if (provider === 'gradient' && this.gradientClient) {
        const response = await this.gradientClient.inference(
          this.toGradientRequest(request)
        );
        return {
          ...response,
          provider: 'gradient',
        };
      }

      throw new Error(`Provider ${provider} is not properly initialized`);
    } catch (error) {
      // If primary provider fails and fallback is enabled, try the other provider
      if (this.config.enableFallback) {
        const fallbackProvider = provider === 'parallax' ? 'gradient' : 'parallax';
        const fallbackHealthy =
          fallbackProvider === 'parallax' ? this.parallaxHealthy : this.gradientHealthy;

        if (fallbackHealthy) {
          if (this.config.logFallback) {
            console.warn(
              `⚠️  ${provider} inference failed, falling back to ${fallbackProvider}`,
              error instanceof Error ? error.message : error
            );
          }

          try {
            if (fallbackProvider === 'parallax' && this.parallaxClient) {
              const response = await this.parallaxClient.inference(
                this.toParallaxRequest(request)
              );
              return {
                ...response,
                provider: 'parallax',
              };
            }

            if (fallbackProvider === 'gradient' && this.gradientClient) {
              const response = await this.gradientClient.inference(
                this.toGradientRequest(request)
              );
              return {
                ...response,
                provider: 'gradient',
              };
            }
          } catch (fallbackError) {
            if (this.config.logFallback) {
              console.error(
                `❌ Fallback to ${fallbackProvider} also failed:`,
                fallbackError instanceof Error ? fallbackError.message : fallbackError
              );
            }
            throw fallbackError;
          }
        }
      }

      throw error;
    }
  }

  /**
   * Get the status of both providers
   */
  async getProvidersStatus(): Promise<{
    parallax: { available: boolean; url?: string };
    gradient: { available: boolean; model?: string };
  }> {
    await this.checkProviderHealth();

    return {
      parallax: {
        available: this.parallaxHealthy || false,
        url: this.config.parallaxSchedulerUrl,
      },
      gradient: {
        available: this.gradientHealthy || false,
        model: this.config.gradientModel,
      },
    };
  }

  /**
   * Force refresh health check
   */
  async refreshHealthCheck(): Promise<void> {
    this.lastHealthCheck = 0; // Reset cache
    await this.checkProviderHealth();
  }
}

/**
 * Create a unified inference client with default configuration
 */
export function createUnifiedInferenceClient(
  config?: UnifiedInferenceConfig
): UnifiedInferenceClient {
  return new UnifiedInferenceClient(config);
}

/**
 * Check if any inference provider is available
 */
export async function isInferenceAvailable(): Promise<boolean> {
  const client = createUnifiedInferenceClient();
  const status = await client.getProvidersStatus();
  return status.parallax.available || status.gradient.available;
}

/**
 * Example usage:
 *
 * ```typescript
 * // Automatically uses Parallax if available, falls back to Gradient
 * const client = createUnifiedInferenceClient();
 *
 * const response = await client.inference({
 *   messages: [
 *     { role: 'user', content: 'Hello, how are you?' }
 *   ],
 *   maxTokens: 100
 * });
 *
 * console.log(response.choices[0].message.content);
 * console.log('Used provider:', response.provider); // 'parallax' or 'gradient'
 * ```
 *
 * ```typescript
 * // Force use of Gradient only
 * const client = createUnifiedInferenceClient({
 *   preferredProvider: 'gradient',
 *   enableFallback: false
 * });
 * ```
 */

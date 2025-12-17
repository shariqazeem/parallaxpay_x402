/**
 * Gradient Cloud API Client
 * Fallback LLM provider when Parallax is unavailable
 *
 * Gradient Cloud provides OpenAI-compatible API endpoints
 * powered by distributed AI infrastructure.
 */

export interface GradientConfig {
  apiKey: string;
  baseUrl?: string;
  model?: string;
  timeout?: number;
}

export interface GradientMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

export interface GradientInferenceRequest {
  messages: GradientMessage[];
  maxTokens?: number;
  temperature?: number;
  stream?: boolean;
}

export interface GradientChoice {
  index: number;
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
}

export interface GradientInferenceResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: GradientChoice[];
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class GradientClient {
  private config: Required<GradientConfig>;

  constructor(config: GradientConfig) {
    this.config = {
      apiKey: config.apiKey,
      baseUrl: config.baseUrl || 'https://apis.gradient.network/api/v1',
      model: config.model || 'openai/gpt-4o-mini',
      timeout: config.timeout || 30000,
    };
  }

  /**
   * Perform inference using Gradient Cloud API
   */
  async inference(request: GradientInferenceRequest): Promise<GradientInferenceResponse> {
    const url = `${this.config.baseUrl}/ai/chat/completions`;

    const body = {
      model: this.config.model,
      messages: request.messages,
      max_tokens: request.maxTokens || 1024,
      temperature: request.temperature ?? 0.7,
      stream: request.stream ?? false,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(
          `Gradient API request failed: ${response.status} ${response.statusText}\n${errorText}`
        );
      }

      const data = await response.json();
      return data as GradientInferenceResponse;
    } catch (error) {
      clearTimeout(timeoutId);

      if (error instanceof Error) {
        if (error.name === 'AbortError') {
          throw new Error(`Gradient API request timeout after ${this.config.timeout}ms`);
        }
        throw error;
      }
      throw new Error('Unknown error in Gradient API request');
    }
  }

  /**
   * Check if Gradient Cloud API is available
   */
  async healthCheck(): Promise<boolean> {
    try {
      const url = `${this.config.baseUrl}/ai/models`;

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);

      const response = await fetch(url, {
        method: 'GET',
        signal: controller.signal,
      });

      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get available models from Gradient Cloud
   */
  async getModels(): Promise<string[]> {
    try {
      const url = `${this.config.baseUrl}/ai/models`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch models: ${response.status}`);
      }

      const data = await response.json();
      return data.data?.map((model: any) => model.id) || [];
    } catch (error) {
      console.error('Error fetching Gradient models:', error);
      return [];
    }
  }
}

/**
 * Create a Gradient client with default configuration
 */
export function createGradientClient(apiKey?: string, model?: string): GradientClient | null {
  const key = apiKey || process.env.GRADIENT_API_KEY;

  if (!key) {
    console.warn('Gradient API key not provided. Fallback to Gradient will not be available.');
    return null;
  }

  return new GradientClient({
    apiKey: key,
    model: model || process.env.GRADIENT_MODEL || 'openai/gpt-4o-mini',
  });
}

/**
 * Check if Gradient Cloud is configured and available
 */
export async function isGradientAvailable(): Promise<boolean> {
  const client = createGradientClient();
  if (!client) return false;

  return await client.healthCheck();
}

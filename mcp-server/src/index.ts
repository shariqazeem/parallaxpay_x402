/**
 * ParallaxPay MCP Server
 *
 * Model Context Protocol server that enables AI agents to:
 * 1. Discover available AI inference services
 * 2. Make paid inference requests via x402
 * 3. Track transaction history
 *
 * This is a BONUS feature for the MCP Server track!
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js'
import { base58 } from '@scure/base'
import * as dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '../.env.local' })

interface Transaction {
  id: string
  timestamp: number
  service: string
  cost: number
  txHash: string | null
  status: 'success' | 'failed' | 'pending'
}

class ParallaxPayMCPServer {
  private server: Server
  private baseUrl: string
  private privateKey: string | null
  private transactions: Transaction[] = []

  constructor() {
    this.baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'
    this.privateKey = process.env.SOLANA_PRIVATE_KEY || null

    // Initialize MCP server
    this.server = new Server(
      {
        name: 'parallaxpay-mcp-server',
        version: '1.0.0',
      },
      {
        capabilities: {
          tools: {},
        },
      }
    )

    this.setupHandlers()
  }

  private setupHandlers() {
    // List available tools
    this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
      tools: [
        {
          name: 'discover_services',
          description: 'Discover available AI inference services on ParallaxPay with pricing and capabilities',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
        {
          name: 'get_ai_inference',
          description: 'Get AI inference from ParallaxPay with automatic x402 payment',
          inputSchema: {
            type: 'object',
            properties: {
              prompt: {
                type: 'string',
                description: 'The prompt for AI inference',
              },
              max_tokens: {
                type: 'number',
                description: 'Maximum tokens to generate (default: 256)',
              },
              tier: {
                type: 'string',
                enum: ['basic', 'standard', 'premium'],
                description: 'Service tier: basic ($0.01), standard ($0.05), premium ($0.25)',
              },
            },
            required: ['prompt'],
          },
        },
        {
          name: 'get_transaction_history',
          description: 'Get transaction history of all x402 payments made',
          inputSchema: {
            type: 'object',
            properties: {
              limit: {
                type: 'number',
                description: 'Maximum number of transactions to return (default: 10)',
              },
            },
          },
        },
        {
          name: 'get_market_status',
          description: 'Get current market status including available providers and pricing',
          inputSchema: {
            type: 'object',
            properties: {},
          },
        },
      ],
    }))

    // Handle tool calls
    this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
      const { name, arguments: args } = request.params

      try {
        switch (name) {
          case 'discover_services':
            return await this.discoverServices()

          case 'get_ai_inference':
            return await this.getAIInference(args as any)

          case 'get_transaction_history':
            return await this.getTransactionHistory(args as any)

          case 'get_market_status':
            return await this.getMarketStatus()

          default:
            throw new Error(`Unknown tool: ${name}`)
        }
      } catch (error) {
        return {
          content: [
            {
              type: 'text',
              text: `Error: ${error instanceof Error ? error.message : 'Unknown error'}`,
            },
          ],
          isError: true,
        }
      }
    })
  }

  /**
   * Discover available AI inference services
   */
  private async discoverServices() {
    const services = [
      {
        name: 'ParallaxPay Basic AI',
        endpoint: `${this.baseUrl}/content/basic`,
        description: 'Basic AI Inference - Qwen 0.6B model (100 tokens)',
        price: '$0.01',
        capabilities: ['text-generation', 'question-answering'],
        network: 'solana-devnet',
      },
      {
        name: 'ParallaxPay Standard AI',
        endpoint: `${this.baseUrl}/content/standard`,
        description: 'Standard AI Inference - Qwen 1.7B model (256 tokens)',
        price: '$0.05',
        capabilities: ['text-generation', 'question-answering', 'code-generation'],
        network: 'solana-devnet',
      },
      {
        name: 'ParallaxPay Premium AI',
        endpoint: `${this.baseUrl}/content/premium`,
        description: 'Premium AI Inference - Advanced Qwen 2.5B model (512 tokens)',
        price: '$0.25',
        capabilities: ['text-generation', 'question-answering', 'code-generation', 'reasoning'],
        network: 'solana-devnet',
      },
      {
        name: 'ParallaxPay Agent API',
        endpoint: `${this.baseUrl}/api/inference/paid`,
        description: 'AI Inference API for autonomous agents - Pay per token',
        price: '$0.001 per 1K tokens',
        capabilities: ['text-generation', 'streaming', 'provider-selection'],
        network: 'solana-devnet',
      },
    ]

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              services,
              total: services.length,
              network: 'solana-devnet',
              facilitator: 'https://x402.org/facilitator',
            },
            null,
            2
          ),
        },
      ],
    }
  }

  /**
   * Get AI inference with automatic x402 payment
   */
  private async getAIInference(args: {
    prompt: string
    max_tokens?: number
    tier?: 'basic' | 'standard' | 'premium'
  }) {
    if (!this.privateKey) {
      throw new Error('SOLANA_PRIVATE_KEY not configured. Set it in .env.local')
    }

    const tier = args.tier || 'standard'
    const endpoint = `${this.baseUrl}/content/${tier}`

    console.log(`🤖 Making paid inference request to ${tier} tier...`)

    // Create transaction record
    const transaction: Transaction = {
      id: `mcp_tx_${Date.now()}`,
      timestamp: Date.now(),
      service: `AI Inference (${tier})`,
      cost: 0,
      txHash: null,
      status: 'pending',
    }

    this.transactions.push(transaction)

    try {
      // Dynamic import of x402 client
      const { wrapFetchWithPayment } = await import('x402-fetch')

      // Create Solana signer (simplified for MCP)
      const { Keypair } = await import('@solana/web3.js')
      const secretKey = base58.decode(this.privateKey)
      const keypair = Keypair.fromSecretKey(secretKey)

      // Create account for x402
      const account = {
        address: keypair.publicKey.toBase58(),
        signMessage: async (message: Uint8Array) => keypair.sign(message),
      } as any

      // Wrap fetch with payment handling
      const fetchWithPayment = wrapFetchWithPayment(fetch, account)

      // Make paid request
      const response = await fetchWithPayment(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt: args.prompt,
          max_tokens: args.max_tokens || 256,
        }),
      })

      // Extract payment response
      const paymentResponseHeader = response.headers.get('x-payment-response')
      if (paymentResponseHeader) {
        const paymentResponse = JSON.parse(
          Buffer.from(paymentResponseHeader, 'base64').toString('utf-8')
        )
        transaction.txHash = paymentResponse.txHash || null
        transaction.cost = parseFloat(paymentResponse.amount || '0')
      }

      // Get response data
      const data = await response.json()

      transaction.status = 'success'

      console.log(`✅ Inference complete!`)
      console.log(`   Cost: $${transaction.cost.toFixed(4)}`)
      console.log(`   TX Hash: ${transaction.txHash || 'pending'}`)

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                result: data.result || data.response || 'No result',
                tokens: data.tokens || 0,
                cost: transaction.cost,
                txHash: transaction.txHash,
                transactionId: transaction.id,
                tier,
                timestamp: new Date(transaction.timestamp).toISOString(),
              },
              null,
              2
            ),
          },
        ],
      }
    } catch (error) {
      transaction.status = 'failed'
      throw error
    }
  }

  /**
   * Get transaction history
   */
  private async getTransactionHistory(args: { limit?: number }) {
    const limit = args.limit || 10
    const recentTransactions = this.transactions.slice(-limit).reverse()

    const totalSpent = this.transactions
      .filter((tx) => tx.status === 'success')
      .reduce((sum, tx) => sum + tx.cost, 0)

    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify(
            {
              transactions: recentTransactions,
              summary: {
                total: this.transactions.length,
                successful: this.transactions.filter((tx) => tx.status === 'success').length,
                failed: this.transactions.filter((tx) => tx.status === 'failed').length,
                totalSpent: totalSpent.toFixed(4),
              },
            },
            null,
            2
          ),
        },
      ],
    }
  }

  /**
   * Get market status
   */
  private async getMarketStatus() {
    try {
      // Try to fetch from local API
      const response = await fetch(`${this.baseUrl}/api/market/status`)
      const data = await response.json()

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(data, null, 2),
          },
        ],
      }
    } catch (error) {
      // Return mock data if API not available
      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                providers: 1,
                averageLatency: 45,
                averagePrice: 0.001,
                network: 'solana-devnet',
                status: 'operational',
              },
              null,
              2
            ),
          },
        ],
      }
    }
  }

  async start() {
    const transport = new StdioServerTransport()
    await this.server.connect(transport)
    console.log('🚀 ParallaxPay MCP Server started')
    console.log('   Connect this server to Claude Desktop or any MCP-compatible client')
  }
}

// Start server
const server = new ParallaxPayMCPServer()
server.start().catch((error) => {
  console.error('Failed to start MCP server:', error)
  process.exit(1)
})

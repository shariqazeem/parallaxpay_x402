/**
 * Composite Agent Execution API Endpoint
 *
 * This endpoint orchestrates multiple agent calls in sequence,
 * demonstrating agent-to-agent economy with x402 micropayments.
 *
 * Flow:
 * 1. Receives workflow definition (array of steps)
 * 2. For each step:
 *    - Executes agent call with x402 payment
 *    - Passes output from previous step (if specified)
 *    - Tracks payment and execution details
 * 3. Returns aggregated results with full execution trail
 *
 * This is Phase 2.3 of the hackathon implementation.
 */

import { NextRequest, NextResponse } from 'next/server'
import { InferenceRequest, InferenceResponse } from '@/app/api/inference/paid/route'
import { createClusterClient } from '@/lib/parallax-cluster'

export interface WorkflowStep {
  id: string
  agentName: string // Name of the agent to call
  prompt: string // Base prompt for the agent
  useOutputFrom?: string // ID of previous step whose output should be used
}

export interface CompositeWorkflow {
  steps: WorkflowStep[]
}

export interface CompositeAgentRequest {
  workflow: CompositeWorkflow
  initialInput?: string // Optional initial input for the first step
  provider?: string // Parallax provider to use
}

export interface StepExecutionResult {
  stepId: string
  agentName: string
  prompt: string
  response: string
  cost: number
  latency: number
  txHash?: string
  tokens: number
  provider: string
  model: string
  timestamp: string
}

export interface CompositeAgentResponse {
  success: boolean
  totalSteps: number
  completedSteps: number
  executionTrail: StepExecutionResult[]
  finalOutput: string
  totalCost: number
  totalLatency: number
  error?: string
}

/**
 * POST /api/runCompositeAgent
 *
 * Execute a composite agent workflow with multiple orchestrated steps
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now()

  try {
    // Parse request body
    const body: CompositeAgentRequest = await request.json()

    // Validate request
    if (!body.workflow || !body.workflow.steps || body.workflow.steps.length === 0) {
      return NextResponse.json(
        { error: 'Invalid request: workflow with steps is required' },
        { status: 400 }
      )
    }

    console.log(`\n🔗 [COMPOSITE AGENT] Starting workflow with ${body.workflow.steps.length} steps`)
    console.log(`   Payment validated by x402 middleware`)

    const executionTrail: StepExecutionResult[] = []
    const stepOutputs = new Map<string, string>() // Store outputs by step ID
    let totalCost = 0

    // Execute each step in sequence
    for (let i = 0; i < body.workflow.steps.length; i++) {
      const step = body.workflow.steps[i]
      const stepStartTime = Date.now()

      console.log(`\n   🤖 [Step ${i + 1}/${body.workflow.steps.length}] Calling agent: ${step.agentName}`)

      // Build the prompt for this step
      let finalPrompt = step.prompt

      // If this step uses output from a previous step, inject it
      if (step.useOutputFrom && stepOutputs.has(step.useOutputFrom)) {
        const previousOutput = stepOutputs.get(step.useOutputFrom)!
        finalPrompt = `${step.prompt}\n\nContext from previous step:\n${previousOutput}`
        console.log(`      📝 Using output from step: ${step.useOutputFrom}`)
      } else if (i === 0 && body.initialInput) {
        // First step can use initial input if provided
        finalPrompt = `${step.prompt}\n\nInput: ${body.initialInput}`
      }

      console.log(`      💬 Prompt: ${finalPrompt.substring(0, 100)}...`)

      try {
        // Call Parallax cluster with automatic load balancing
        console.log(`      🤖 Calling Parallax cluster...`)

        const clusterClient = createClusterClient()
        const parallaxResponse = await clusterClient.inference(
          {
            messages: [
              {
                role: 'user',
                content: finalPrompt,
              },
            ],
            max_tokens: 512, // Increased to ensure complete composite agent responses
            temperature: 0.7,
          },
          {
            strategy: 'round-robin', // Distribute composite steps across nodes
            maxRetries: 2,
          }
        )

        // Extract response content (handle multiple Parallax response formats)
        let content = ''
        if (parallaxResponse.choices && parallaxResponse.choices.length > 0) {
          const choice = parallaxResponse.choices[0] as any
          content = choice.message?.content || choice.messages?.content || choice.text || ''

          // Clean up <think> tags if present
          if (content.includes('<think>')) {
            const thinkEnd = content.indexOf('</think>')
            if (thinkEnd !== -1) {
              content = content.substring(thinkEnd + 8).trim()
            } else {
              content = content.replace(/<think>\n?/g, '').trim()
            }
          }
        }

        if (!content) {
          console.error(`      ❌ Empty response from Parallax`)
          console.error(`         Full response:`, JSON.stringify(parallaxResponse, null, 2))
          throw new Error(`No response from Parallax for step ${i + 1}`)
        }

        // Create result object matching expected format
        const result: InferenceResponse = {
          response: content,
          tokens: 256, // Estimated
          provider: body.provider || 'Parallax Local',
          cost: 0.001, // Fixed cost per step
          latency: 0, // Will be calculated below
          model: 'Qwen/Qwen3-0.6B',
        }
        const stepLatency = Date.now() - stepStartTime

        console.log(`      ✅ Agent response received`)
        console.log(`         Cost: $${result.cost.toFixed(6)}`)
        console.log(`         Latency: ${stepLatency}ms`)
        console.log(`         Response: ${result.response.substring(0, 100)}...`)

        // Store output for potential use by next steps
        stepOutputs.set(step.id, result.response)

        // Record execution details
        const stepResult: StepExecutionResult = {
          stepId: step.id,
          agentName: step.agentName,
          prompt: finalPrompt,
          response: result.response,
          cost: result.cost,
          latency: stepLatency,
          txHash: result.txHash,
          tokens: result.tokens,
          provider: result.provider,
          model: result.model,
          timestamp: new Date().toISOString(),
        }

        executionTrail.push(stepResult)
        totalCost += result.cost
      } catch (error) {
        console.error(`      ❌ Step ${i + 1} failed:`, error)

        // Return partial results with error
        return NextResponse.json(
          {
            success: false,
            totalSteps: body.workflow.steps.length,
            completedSteps: i,
            executionTrail,
            finalOutput: '',
            totalCost,
            totalLatency: Date.now() - startTime,
            error: error instanceof Error ? error.message : 'Unknown error',
          } as CompositeAgentResponse,
          { status: 500 }
        )
      }
    }

    // Get final output (from last step)
    const finalOutput = executionTrail[executionTrail.length - 1]?.response || ''
    const totalLatency = Date.now() - startTime

    console.log(`\n✅ [COMPOSITE AGENT] Workflow completed successfully`)
    console.log(`   Total Steps: ${body.workflow.steps.length}`)
    console.log(`   Total Cost: $${totalCost.toFixed(6)}`)
    console.log(`   Total Latency: ${totalLatency}ms`)
    console.log(`   Final Output: ${finalOutput.substring(0, 100)}...\n`)

    // Return success response
    const response: CompositeAgentResponse = {
      success: true,
      totalSteps: body.workflow.steps.length,
      completedSteps: body.workflow.steps.length,
      executionTrail,
      finalOutput,
      totalCost,
      totalLatency,
    }

    return NextResponse.json(response, { status: 200 })
  } catch (error) {
    console.error('Composite agent execution error:', error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    const totalLatency = Date.now() - startTime

    return NextResponse.json(
      {
        success: false,
        totalSteps: 0,
        completedSteps: 0,
        executionTrail: [],
        finalOutput: '',
        totalCost: 0,
        totalLatency,
        error: errorMessage,
      } as CompositeAgentResponse,
      { status: 500 }
    )
  }
}

/**
 * GET /api/runCompositeAgent
 *
 * Returns endpoint information
 */
export async function GET() {
  return NextResponse.json({
    endpoint: '/api/runCompositeAgent',
    description: 'Composite Agent Orchestration with x402 micropayments',
    method: 'POST',
    body: {
      workflow: {
        steps: [
          {
            id: 'step-1',
            agentName: 'Research Agent',
            prompt: 'Research the topic',
            useOutputFrom: undefined,
          },
          {
            id: 'step-2',
            agentName: 'Analysis Agent',
            prompt: 'Analyze the research',
            useOutputFrom: 'step-1',
          },
        ],
      },
      initialInput: 'Optional initial input for first step',
      provider: 'Optional provider ID',
    },
    response: {
      success: true,
      totalSteps: 2,
      completedSteps: 2,
      executionTrail: [
        {
          stepId: 'step-1',
          agentName: 'Research Agent',
          response: 'Research results...',
          cost: 0.001,
          latency: 1234,
          txHash: 'abc123...',
        },
      ],
      finalOutput: 'Final aggregated result',
      totalCost: 0.002,
      totalLatency: 2468,
    },
  })
}

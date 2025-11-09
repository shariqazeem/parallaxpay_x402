/**
 * AUTONOMOUS AGENT SCHEDULER 🤖
 *
 * Makes agents run automatically on schedules
 *
 * Features:
 * - Scheduled execution (cron-like)
 * - Auto-retry on failure
 * - Rate limiting
 * - Budget management
 * - Performance monitoring
 */

import { getAgentIdentityManager } from './agent-identity'

export interface AgentSchedule {
  agentId: string
  enabled: boolean

  // Schedule config
  interval: number // milliseconds
  maxExecutionsPerHour?: number
  maxBudgetPerHour?: number // SOL

  // Execution tracking
  lastExecution?: number
  nextExecution?: number
  executionsThisHour: number
  spentThisHour: number

  // Auto-retry config
  retryOnFailure: boolean
  maxRetries: number
  retryCount: number
}

export interface ScheduledExecution {
  id: string
  agentId: string
  scheduledAt: number
  executedAt?: number
  success?: boolean
  cost?: number
  error?: string
}

export class AutonomousAgentScheduler {
  private schedules: Map<string, AgentSchedule> = new Map()
  private timers: Map<string, NodeJS.Timeout> = new Map()
  private executionHistory: ScheduledExecution[] = []
  private executionCallback?: (agentId: string) => Promise<{
    success: boolean
    cost: number
    error?: string
  }>

  constructor() {
    console.log('⏰ Autonomous Agent Scheduler initialized')
    this.loadFromStorage()
    this.startHourlyReset()
  }

  /**
   * Set the execution callback (how to run an agent)
   */
  setExecutionCallback(
    callback: (agentId: string) => Promise<{
      success: boolean
      cost: number
      error?: string
    }>
  ): void {
    this.executionCallback = callback
  }

  /**
   * Schedule an agent for autonomous execution
   */
  scheduleAgent(
    agentId: string,
    interval: number, // in milliseconds
    options?: {
      maxExecutionsPerHour?: number
      maxBudgetPerHour?: number
      retryOnFailure?: boolean
      maxRetries?: number
    }
  ): void {
    // Stop existing schedule if any
    this.stopAgent(agentId)

    const schedule: AgentSchedule = {
      agentId,
      enabled: true,
      interval,
      maxExecutionsPerHour: options?.maxExecutionsPerHour,
      maxBudgetPerHour: options?.maxBudgetPerHour,
      executionsThisHour: 0,
      spentThisHour: 0,
      retryOnFailure: options?.retryOnFailure ?? true,
      maxRetries: options?.maxRetries ?? 3,
      retryCount: 0,
    }

    this.schedules.set(agentId, schedule)
    this.startSchedule(agentId)
    this.saveToStorage()

    console.log(`⏰ Scheduled agent ${agentId} to run every ${interval}ms`)
  }

  /**
   * Start executing a schedule
   */
  private startSchedule(agentId: string): void {
    const schedule = this.schedules.get(agentId)
    if (!schedule || !schedule.enabled) return

    // Check if we've hit limits
    if (schedule.maxExecutionsPerHour && schedule.executionsThisHour >= schedule.maxExecutionsPerHour) {
      console.log(`⏸️ Agent ${agentId} hit execution limit (${schedule.maxExecutionsPerHour}/hour)`)
      return
    }

    if (schedule.maxBudgetPerHour && schedule.spentThisHour >= schedule.maxBudgetPerHour) {
      console.log(`⏸️ Agent ${agentId} hit budget limit ($${schedule.maxBudgetPerHour}/hour)`)
      return
    }

    // Execute now
    this.executeAgent(agentId)

    // Schedule next execution
    const timer = setTimeout(() => {
      this.startSchedule(agentId)
    }, schedule.interval)

    this.timers.set(agentId, timer)

    // Update next execution time
    schedule.nextExecution = Date.now() + schedule.interval
    this.saveToStorage()
  }

  /**
   * Execute an agent
   */
  private async executeAgent(agentId: string): Promise<void> {
    const schedule = this.schedules.get(agentId)
    if (!schedule) return

    console.log(`🤖 [AUTO] Executing agent ${agentId}...`)

    const execution: ScheduledExecution = {
      id: `exec-${Date.now()}-${agentId}`,
      agentId,
      scheduledAt: Date.now(),
    }

    schedule.lastExecution = Date.now()

    try {
      if (!this.executionCallback) {
        throw new Error('No execution callback set')
      }

      // Execute the agent
      const result = await this.executionCallback(agentId)

      execution.executedAt = Date.now()
      execution.success = result.success
      execution.cost = result.cost
      execution.error = result.error

      if (result.success) {
        schedule.executionsThisHour++
        schedule.spentThisHour += result.cost
        schedule.retryCount = 0 // Reset retry count on success

        console.log(`✅ [AUTO] Agent ${agentId} executed successfully (cost: $${result.cost.toFixed(6)})`)

        // Update agent identity
        const identityManager = getAgentIdentityManager()
        identityManager.recordExecution(
          agentId,
          true,
          result.cost,
          100, // latency (would be tracked in real execution)
          'autonomous', // provider
          0 // savings
        )
      } else {
        console.error(`❌ [AUTO] Agent ${agentId} failed:`, result.error)

        // Handle retry
        if (schedule.retryOnFailure && schedule.retryCount < schedule.maxRetries) {
          schedule.retryCount++
          console.log(`🔄 Retrying agent ${agentId} (attempt ${schedule.retryCount}/${schedule.maxRetries})`)

          // Retry in 30 seconds
          setTimeout(() => this.executeAgent(agentId), 30000)
        } else {
          // Apply penalty for failure
          const identityManager = getAgentIdentityManager()
          identityManager.applyPenalty(agentId, 'Execution failed')
        }
      }
    } catch (err) {
      console.error(`❌ [AUTO] Agent ${agentId} execution error:`, err)

      execution.executedAt = Date.now()
      execution.success = false
      execution.error = err instanceof Error ? err.message : 'Unknown error'
    }

    this.executionHistory.push(execution)

    // Keep only last 1000 executions
    if (this.executionHistory.length > 1000) {
      this.executionHistory = this.executionHistory.slice(-1000)
    }

    this.saveToStorage()
  }

  /**
   * Stop a scheduled agent
   */
  stopAgent(agentId: string): void {
    const timer = this.timers.get(agentId)
    if (timer) {
      clearTimeout(timer)
      this.timers.delete(agentId)
    }

    const schedule = this.schedules.get(agentId)
    if (schedule) {
      schedule.enabled = false
      this.saveToStorage()
    }

    console.log(`⏹️ Stopped agent ${agentId}`)
  }

  /**
   * Resume a stopped agent
   */
  resumeAgent(agentId: string): void {
    const schedule = this.schedules.get(agentId)
    if (!schedule) return

    schedule.enabled = true
    this.startSchedule(agentId)
    this.saveToStorage()

    console.log(`▶️ Resumed agent ${agentId}`)
  }

  /**
   * Delete a schedule
   */
  deleteSchedule(agentId: string): void {
    this.stopAgent(agentId)
    this.schedules.delete(agentId)
    this.saveToStorage()

    console.log(`🗑️ Deleted schedule for agent ${agentId}`)
  }

  /**
   * Get schedule for an agent
   */
  getSchedule(agentId: string): AgentSchedule | null {
    return this.schedules.get(agentId) || null
  }

  /**
   * Get all schedules
   */
  getAllSchedules(): AgentSchedule[] {
    return Array.from(this.schedules.values())
  }

  /**
   * Get execution history for an agent
   */
  getExecutionHistory(agentId: string, limit: number = 20): ScheduledExecution[] {
    return this.executionHistory
      .filter(e => e.agentId === agentId)
      .slice(-limit)
      .reverse()
  }

  /**
   * Get all execution history
   */
  getAllExecutionHistory(limit: number = 100): ScheduledExecution[] {
    return this.executionHistory.slice(-limit).reverse()
  }

  /**
   * Get stats
   */
  getStats(): {
    totalScheduled: number
    activeSchedules: number
    totalExecutions: number
    successfulExecutions: number
    failedExecutions: number
    totalSpent: number
  } {
    const schedules = Array.from(this.schedules.values())
    const executions = this.executionHistory

    return {
      totalScheduled: schedules.length,
      activeSchedules: schedules.filter(s => s.enabled).length,
      totalExecutions: executions.length,
      successfulExecutions: executions.filter(e => e.success).length,
      failedExecutions: executions.filter(e => !e.success).length,
      totalSpent: executions.reduce((sum, e) => sum + (e.cost || 0), 0),
    }
  }

  /**
   * Reset hourly counters
   */
  private startHourlyReset(): void {
    setInterval(() => {
      this.schedules.forEach(schedule => {
        schedule.executionsThisHour = 0
        schedule.spentThisHour = 0
      })

      this.saveToStorage()
      console.log('🔄 Reset hourly limits for all agents')
    }, 60 * 60 * 1000) // Every hour
  }

  /**
   * Save to localStorage
   */
  private saveToStorage(): void {
    try {
      const data = {
        schedules: Array.from(this.schedules.entries()),
        executionHistory: this.executionHistory.slice(-100), // Only save last 100
      }
      localStorage.setItem('parallaxpay_agent_schedules', JSON.stringify(data))
    } catch (err) {
      console.error('Failed to save schedules:', err)
    }
  }

  /**
   * Load from localStorage
   */
  private loadFromStorage(): void {
    try {
      const data = localStorage.getItem('parallaxpay_agent_schedules')
      if (data) {
        const parsed = JSON.parse(data)

        this.schedules = new Map(parsed.schedules || [])
        this.executionHistory = parsed.executionHistory || []

        console.log(`📚 Loaded ${this.schedules.size} agent schedules`)

        // Restart active schedules
        this.schedules.forEach((schedule, agentId) => {
          if (schedule.enabled) {
            this.startSchedule(agentId)
          }
        })
      }
    } catch (err) {
      console.error('Failed to load schedules:', err)
    }
  }

  /**
   * Stop all schedules (cleanup)
   */
  stopAll(): void {
    this.timers.forEach((timer, agentId) => {
      clearTimeout(timer)
      this.stopAgent(agentId)
    })
    console.log('⏹️ Stopped all agent schedules')
  }
}

// Singleton
let autonomousAgentSchedulerInstance: AutonomousAgentScheduler | null = null

export function getAutonomousAgentScheduler(): AutonomousAgentScheduler {
  if (!autonomousAgentSchedulerInstance) {
    autonomousAgentSchedulerInstance = new AutonomousAgentScheduler()
  }
  return autonomousAgentSchedulerInstance
}

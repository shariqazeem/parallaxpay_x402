'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAutonomousAgentScheduler, AgentSchedule, ScheduledExecution } from '@/lib/autonomous-agent-scheduler'

interface AutonomousSchedulerPanelProps {
  agentId: string
  agentName: string
  onScheduleChange?: () => void
}

export function AutonomousSchedulerPanel({
  agentId,
  agentName,
  onScheduleChange
}: AutonomousSchedulerPanelProps) {
  const [schedule, setSchedule] = useState<AgentSchedule | null>(null)
  const [isScheduling, setIsScheduling] = useState(false)
  const [nextRunCountdown, setNextRunCountdown] = useState<string>('')
  const [executionHistory, setExecutionHistory] = useState<ScheduledExecution[]>([])

  // Interval options
  const intervalOptions = [
    { label: 'Every 1 minute', value: 60 * 1000 },
    { label: 'Every 5 minutes', value: 5 * 60 * 1000 },
    { label: 'Every 15 minutes', value: 15 * 60 * 1000 },
    { label: 'Every 30 minutes', value: 30 * 60 * 1000 },
    { label: 'Every hour', value: 60 * 60 * 1000 },
  ]

  const [selectedInterval, setSelectedInterval] = useState(intervalOptions[1].value) // 5 min default

  useEffect(() => {
    loadSchedule()

    // Update countdown every second
    const countdownInterval = setInterval(() => {
      updateCountdown()
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [agentId])

  const loadSchedule = () => {
    const scheduler = getAutonomousAgentScheduler()
    const current = scheduler.getSchedule(agentId)
    setSchedule(current)

    if (current) {
      const history = scheduler.getExecutionHistory(agentId, 10)
      setExecutionHistory(history)
    }
  }

  const updateCountdown = () => {
    if (!schedule || !schedule.enabled || !schedule.nextExecution) {
      setNextRunCountdown('')
      return
    }

    const now = Date.now()
    const timeUntilNext = schedule.nextExecution - now

    if (timeUntilNext <= 0) {
      setNextRunCountdown('Running now...')
      return
    }

    const minutes = Math.floor(timeUntilNext / 60000)
    const seconds = Math.floor((timeUntilNext % 60000) / 1000)

    setNextRunCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`)
  }

  const enableSchedule = async () => {
    setIsScheduling(true)
    try {
      const scheduler = getAutonomousAgentScheduler()

      scheduler.scheduleAgent(agentId, selectedInterval, {
        maxExecutionsPerHour: 60, // Safety limit
        retryOnFailure: true,
        maxRetries: 3
      })

      loadSchedule()
      onScheduleChange?.()
    } catch (error) {
      console.error('Failed to schedule agent:', error)
      alert('Failed to schedule agent. Check console for details.')
    } finally {
      setIsScheduling(false)
    }
  }

  const disableSchedule = () => {
    const scheduler = getAutonomousAgentScheduler()
    scheduler.stopAgent(agentId)
    loadSchedule()
    onScheduleChange?.()
  }

  const resumeSchedule = () => {
    const scheduler = getAutonomousAgentScheduler()
    scheduler.resumeAgent(agentId)
    loadSchedule()
    onScheduleChange?.()
  }

  const deleteSchedule = () => {
    if (!confirm(`Remove autonomous schedule for "${agentName}"?`)) return

    const scheduler = getAutonomousAgentScheduler()
    scheduler.deleteSchedule(agentId)
    setSchedule(null)
    setExecutionHistory([])
    onScheduleChange?.()
  }

  return (
    <div className="glass border border-purple-500/30 rounded-xl p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="text-3xl">🤖</div>
          <div>
            <h3 className="text-xl font-heading font-bold text-white">Autonomous Execution</h3>
            <p className="text-sm text-gray-400">Let this agent run itself on a schedule</p>
          </div>
        </div>

        {schedule?.enabled && (
          <div className="flex items-center gap-2">
            <div className="relative">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-2 h-2 bg-green-500 rounded-full animate-ping opacity-75" />
            </div>
            <span className="text-sm font-semibold text-green-400">ACTIVE</span>
          </div>
        )}
      </div>

      {/* No schedule - Setup */}
      {!schedule && (
        <div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Run Frequency
            </label>
            <select
              value={selectedInterval}
              onChange={(e) => setSelectedInterval(Number(e.target.value))}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-3 text-white font-mono"
            >
              {intervalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={enableSchedule}
            disabled={isScheduling}
            className="w-full glass-hover neon-border px-6 py-4 rounded-xl font-bold hover:scale-105 transition-all disabled:opacity-50"
          >
            {isScheduling ? (
              <span>⏳ Setting up...</span>
            ) : (
              <span className="text-gradient">⏰ Enable Autonomous Execution</span>
            )}
          </button>

          <div className="mt-4 p-4 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="text-xs text-purple-300">
              <span className="font-bold">💡 How it works:</span> Once enabled, this agent will execute automatically
              on the selected schedule. It will pay for itself with x402 micropayments and build reputation over time.
            </div>
          </div>
        </div>
      )}

      {/* Active schedule */}
      {schedule && (
        <div className="space-y-4">
          {/* Status */}
          <div className="grid grid-cols-2 gap-4">
            <div className="glass-hover p-4 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Status</div>
              <div className={`text-lg font-bold ${schedule.enabled ? 'text-green-400' : 'text-yellow-400'}`}>
                {schedule.enabled ? '🟢 Active' : '⏸️ Paused'}
              </div>
            </div>

            <div className="glass-hover p-4 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Next Run</div>
              <div className="text-lg font-bold font-mono text-cyan-400">
                {schedule.enabled && nextRunCountdown ? nextRunCountdown : '—'}
              </div>
            </div>

            <div className="glass-hover p-4 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Runs This Hour</div>
              <div className="text-lg font-bold text-white">
                {schedule.executionsThisHour}
                {schedule.maxExecutionsPerHour && <span className="text-gray-500">/{schedule.maxExecutionsPerHour}</span>}
              </div>
            </div>

            <div className="glass-hover p-4 rounded-lg">
              <div className="text-xs text-gray-400 mb-1">Spent This Hour</div>
              <div className="text-lg font-bold text-green-400">
                ${schedule.spentThisHour.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-2">
            {schedule.enabled ? (
              <button
                onClick={disableSchedule}
                className="flex-1 glass-hover px-4 py-3 rounded-lg font-semibold hover:scale-105 transition-all"
              >
                ⏸️ Pause
              </button>
            ) : (
              <button
                onClick={resumeSchedule}
                className="flex-1 glass-hover neon-border px-4 py-3 rounded-lg font-semibold hover:scale-105 transition-all"
              >
                <span className="text-gradient">▶️ Resume</span>
              </button>
            )}

            <button
              onClick={deleteSchedule}
              className="flex-1 glass-hover border border-red-500/50 px-4 py-3 rounded-lg font-semibold hover:scale-105 transition-all text-red-400"
            >
              🗑️ Remove
            </button>
          </div>

          {/* Execution History */}
          {executionHistory.length > 0 && (
            <div className="mt-6">
              <h4 className="text-sm font-bold text-white mb-3">Recent Autonomous Runs</h4>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {executionHistory.map((exec) => (
                  <div
                    key={exec.id}
                    className="glass-hover p-3 rounded-lg flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="text-lg">
                        {exec.success ? '✅' : '❌'}
                      </div>
                      <div>
                        <div className="text-sm text-white">
                          {new Date(exec.scheduledAt).toLocaleTimeString()}
                        </div>
                        {exec.error && (
                          <div className="text-xs text-red-400">{exec.error}</div>
                        )}
                      </div>
                    </div>

                    {exec.cost && (
                      <div className="text-sm font-mono text-green-400">
                        ${exec.cost.toFixed(4)}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

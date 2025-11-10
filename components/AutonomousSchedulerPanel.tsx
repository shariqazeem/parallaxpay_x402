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

    // Reload schedule every second to get updated nextExecution time
    const reloadInterval = setInterval(() => {
      loadSchedule()
    }, 1000)

    return () => clearInterval(reloadInterval)
  }, [agentId])

  // Update countdown whenever schedule changes
  useEffect(() => {
    updateCountdown()
  }, [schedule])

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
    <div className="bg-white border-2 border-purple-200 rounded-xl overflow-hidden shadow-sm">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 border-b border-purple-200 p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="text-4xl">🤖</div>
            <div>
              <h3 className="text-2xl font-heading font-bold text-black mb-1">Autonomous Execution</h3>
              <p className="text-sm text-purple-600">Let this agent run itself on a schedule</p>
            </div>
          </div>

          {schedule?.enabled && (
            <div className="flex items-center gap-2 bg-green-500/20 border border-green-500/50 px-3 py-1.5 rounded-full">
              <div className="relative">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <div className="absolute inset-0 w-2 h-2 bg-green-400 rounded-full animate-ping opacity-75" />
              </div>
              <span className="text-xs font-bold text-green-400 uppercase tracking-wider">Active</span>
            </div>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">

      {/* No schedule - Setup */}
      {!schedule && (
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-bold text-black mb-3">
              ⏱️ Run Frequency
            </label>
            <select
              value={selectedInterval}
              onChange={(e) => setSelectedInterval(Number(e.target.value))}
              className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-3 text-black font-mono text-sm hover:border-purple-300 focus:border-purple-500 focus:outline-none transition-colors"
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
            className="w-full bg-black text-white px-6 py-4 rounded-xl font-bold hover:bg-gray-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isScheduling ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Setting up...
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                ⏰ Enable Autonomous Execution
              </span>
            )}
          </button>

          <div className="bg-purple-50 border-2 border-purple-200 rounded-xl p-4">
            <div className="flex gap-3">
              <div className="text-2xl">💡</div>
              <div className="text-xs text-gray-700 leading-relaxed">
                <span className="font-bold text-purple-600">How it works:</span> Once enabled, this agent will execute automatically
                on the selected schedule. It will pay for itself with x402 micropayments and build reputation over time.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Active schedule */}
      {schedule && (
        <div className="space-y-6">
          {/* Status Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-gray-900/50 to-gray-800/50 border border-purple-500/20 p-4 rounded-xl">
              <div className="text-xs font-semibold text-purple-300 mb-2 uppercase tracking-wider">Status</div>
              <div className={`text-lg font-bold ${schedule.enabled ? 'text-green-400' : 'text-yellow-400'}`}>
                {schedule.enabled ? '🟢 Active' : '⏸️ Paused'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/30 p-4 rounded-xl">
              <div className="text-xs font-semibold text-cyan-300 mb-2 uppercase tracking-wider">Next Run</div>
              <div className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                {schedule.enabled && nextRunCountdown ? nextRunCountdown : '—'}
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 p-4 rounded-xl">
              <div className="text-xs font-semibold text-purple-300 mb-2 uppercase tracking-wider">Runs This Hour</div>
              <div className="text-lg font-bold text-white">
                {schedule.executionsThisHour}
                {schedule.maxExecutionsPerHour && <span className="text-gray-500 text-sm">/{schedule.maxExecutionsPerHour}</span>}
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 p-4 rounded-xl">
              <div className="text-xs font-semibold text-green-300 mb-2 uppercase tracking-wider">Spent This Hour</div>
              <div className="text-lg font-bold text-green-400 font-mono">
                ${schedule.spentThisHour.toFixed(4)}
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex gap-3">
            {schedule.enabled ? (
              <button
                onClick={disableSchedule}
                className="flex-1 bg-yellow-600/20 hover:bg-yellow-600/30 border border-yellow-500/50 px-4 py-3 rounded-xl font-bold text-yellow-400 hover:scale-105 transition-all"
              >
                ⏸️ Pause
              </button>
            ) : (
              <button
                onClick={resumeSchedule}
                className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 px-4 py-3 rounded-xl font-bold text-white hover:scale-105 transition-all shadow-lg shadow-green-500/20"
              >
                ▶️ Resume
              </button>
            )}

            <button
              onClick={deleteSchedule}
              className="flex-1 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 px-4 py-3 rounded-xl font-bold text-red-400 hover:scale-105 transition-all"
            >
              🗑️ Remove
            </button>
          </div>

          {/* Execution History */}
          {executionHistory.length > 0 && (
            <div className="border-t border-purple-500/20 pt-6">
              <h4 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
                <span>📊</span>
                <span>Recent Autonomous Runs</span>
                <span className="text-xs font-normal text-gray-400">({executionHistory.length})</span>
              </h4>
              <div className="space-y-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                {executionHistory.map((exec) => (
                  <div
                    key={exec.id}
                    className={`bg-gradient-to-r ${
                      exec.success
                        ? 'from-green-900/10 to-emerald-900/10 border-green-500/20'
                        : 'from-red-900/10 to-orange-900/10 border-red-500/20'
                    } border p-3 rounded-lg flex items-center justify-between hover:scale-[1.02] transition-transform`}
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <div className="text-xl flex-shrink-0">
                        {exec.success ? '✅' : '❌'}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-semibold text-white">
                          {new Date(exec.scheduledAt).toLocaleTimeString()}
                        </div>
                        {exec.error && (
                          <div className="text-xs text-red-400 truncate">{exec.error}</div>
                        )}
                      </div>
                    </div>

                    {exec.cost !== undefined && (
                      <div className={`text-sm font-mono font-bold flex-shrink-0 ${
                        exec.success ? 'text-green-400' : 'text-red-400'
                      }`}>
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
    </div>
  )
}

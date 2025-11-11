'use client'

/**
 * Agent Builder Tab Component
 *
 * Natural language agent builder that integrates into the unified Agents Hub
 */

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { NLAgentBuilder, type GeneratedStrategy } from '@/lib/nl-agent-builder'
import toast from 'react-hot-toast'

interface AgentBuilderTabProps {
  onDeploy?: (agentData: {
    name: string
    prompt: string
    description: string
    code?: string
    confidence?: number
    estimatedPerformance?: any
  }) => void
}

export function AgentBuilderTab({ onDeploy }: AgentBuilderTabProps) {
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [strategy, setStrategy] = useState<GeneratedStrategy | null>(null)
  const [testResult, setTestResult] = useState<{
    success: boolean
    result?: any
    error?: string
  } | null>(null)
  const [isTesting, setIsTesting] = useState(false)

  const builder = new NLAgentBuilder()
  const examplePrompts = builder.getExamplePrompts()

  const generateAgent = async () => {
    if (!prompt.trim() || isGenerating) return

    setIsGenerating(true)
    setStrategy(null)
    setTestResult(null)

    try {
      const generated = await builder.generateStrategy(prompt)
      setStrategy(generated)
    } catch (error) {
      console.error('Generation failed:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const testAgent = async () => {
    if (!strategy || isTesting) return

    setIsTesting(true)
    setTestResult(null)

    try {
      const result = await builder.testStrategy(strategy)
      setTestResult(result)
    } catch (error) {
      console.error('Test failed:', error)
      setTestResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      })
    } finally {
      setIsTesting(false)
    }
  }

  const useExample = (example: string) => {
    setPrompt(example)
  }

  const downloadCode = () => {
    if (!strategy) return

    const blob = new Blob([strategy.code], { type: 'text/typescript' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${strategy.name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}.ts`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleDeploy = () => {
    if (!strategy) return

    const agentData = {
      name: strategy.name,
      prompt: prompt,
      description: strategy.description,
      code: strategy.code,
      confidence: strategy.confidence,
      estimatedPerformance: strategy.estimatedPerformance,
    }

    if (onDeploy) {
      onDeploy(agentData)
    } else {
      // Fallback to localStorage method
      localStorage.setItem('pendingAgentDeploy', JSON.stringify(agentData))
      toast.success('Agent ready to deploy! Switch to "My Agents" tab.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div className="bg-gradient-to-br from-purple-50 to-blue-50 rounded-xl p-8 border-2 border-purple-200 shadow-sm">
        <h2 className="text-3xl font-black mb-3">
          <span className="text-purple-600">Build Agents with Natural Language</span> 🧠
        </h2>
        <p className="text-lg text-gray-600 mb-6 max-w-3xl">
          Describe your agent in plain English. AI (powered by Parallax) generates production-ready code.
          No coding required! 🚀
        </p>

        {/* Input Section */}
        <div className="space-y-4">
          <div>
            <label className="text-sm text-gray-600 mb-2 block font-semibold">
              Describe your agent strategy
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Example: Create an agent that finds the cheapest provider but only if latency is under 100ms..."
              className="w-full px-4 py-3 bg-white border-2 border-gray-300 rounded-lg text-black placeholder-gray-400 focus:border-purple-500 focus:outline-none resize-none"
              rows={4}
              disabled={isGenerating}
            />
          </div>

          <button
            onClick={generateAgent}
            disabled={!prompt.trim() || isGenerating}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 text-white px-6 py-4 rounded-xl font-bold transition-all hover:from-purple-700 hover:to-blue-700 hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isGenerating ? (
              <span>🧠 Generating strategy...</span>
            ) : (
              <span>✨ Generate Agent Strategy</span>
            )}
          </button>
        </div>
      </div>

      {/* Example Prompts */}
      <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
        <h3 className="text-lg font-bold mb-4">💡 Example Prompts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {examplePrompts.slice(0, 6).map((example, idx) => (
            <button
              key={idx}
              onClick={() => useExample(example)}
              className="bg-gradient-to-br from-blue-50 to-purple-50 p-3 rounded-lg border-2 border-blue-200 hover:border-purple-400 text-left text-sm transition-all hover:shadow-md"
            >
              <div className="text-black">"{example}"</div>
            </button>
          ))}
        </div>
      </div>

      {/* Generated Strategy */}
      <AnimatePresence>
        {strategy && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-6"
          >
            {/* Strategy Info */}
            <div className="bg-white rounded-xl p-6 border-2 border-green-200 shadow-md">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-black mb-2">
                    ✅ Strategy Generated!
                  </h3>
                  <p className="text-gray-600">{strategy.description}</p>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-600 mb-1">Confidence</div>
                  <div className="text-3xl font-black text-purple-600">
                    {(strategy.confidence * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Performance Estimates */}
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">Expected Savings</div>
                  <div className="text-2xl font-bold text-green-600">
                    {strategy.estimatedPerformance.expectedSavings}%
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">Risk Level</div>
                  <div className={`text-2xl font-bold ${
                    strategy.estimatedPerformance.riskLevel === 'low' ? 'text-green-600' :
                    strategy.estimatedPerformance.riskLevel === 'medium' ? 'text-yellow-600' :
                    'text-red-600'
                  }`}>
                    {strategy.estimatedPerformance.riskLevel}
                  </div>
                </div>
                <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                  <div className="text-sm text-gray-600 mb-1">Complexity</div>
                  <div className="text-2xl font-bold text-black">
                    {strategy.estimatedPerformance.complexity}
                  </div>
                </div>
              </div>

              {/* Warnings */}
              {strategy.warnings.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                  <div className="text-sm font-bold text-yellow-700 mb-2">
                    ⚠️ Warnings
                  </div>
                  <ul className="text-sm text-gray-600 space-y-1">
                    {strategy.warnings.map((warning, idx) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3">
                <button
                  onClick={testAgent}
                  disabled={isTesting}
                  className="bg-white border-2 border-purple-200 hover:border-purple-400 hover:shadow-md px-6 py-3 rounded-lg font-bold text-black transition-all disabled:opacity-50"
                >
                  {isTesting ? '🧪 Testing...' : '🧪 Test Strategy'}
                </button>
                <button
                  onClick={downloadCode}
                  className="bg-white hover:shadow-md border-2 border-gray-200 px-6 py-3 rounded-lg font-bold text-black transition-all"
                >
                  📥 Download Code
                </button>
                <button
                  onClick={handleDeploy}
                  className="bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-gray-800 transition-all flex-1"
                >
                  🚀 Deploy to My Agents
                </button>
              </div>
            </div>

            {/* Test Results */}
            {testResult && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-6 border-2 shadow-lg ${
                  testResult.success ? 'border-green-300 bg-green-50' : 'border-red-300 bg-red-50'
                }`}
              >
                <h3 className={`text-xl font-bold mb-4 ${
                  testResult.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {testResult.success ? '✅ Test Passed!' : '❌ Test Failed'}
                </h3>
                {testResult.success ? (
                  <div className="space-y-2">
                    <div className="text-sm text-gray-600">Test result:</div>
                    <pre className="bg-white p-4 rounded-lg text-xs overflow-x-auto border-2 border-green-200 text-black">
                      {JSON.stringify(testResult.result, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="text-sm text-red-600">
                    {testResult.error}
                  </div>
                )}
              </motion.div>
            )}

            {/* Generated Code */}
            <div className="bg-white rounded-xl p-6 border-2 border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-black">📄 Generated Code</h3>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(strategy.code)
                    toast.success('Code copied to clipboard!')
                  }}
                  className="text-sm bg-white hover:bg-purple-50 px-4 py-2 rounded-lg border-2 border-purple-200 hover:border-purple-400 transition-all text-purple-700 font-semibold"
                >
                  📋 Copy
                </button>
              </div>
              <pre className="bg-gray-50 p-6 rounded-lg text-sm overflow-x-auto border-2 border-gray-200">
                <code className="text-purple-700 font-mono">{strategy.code}</code>
              </pre>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* How It Works */}
      <div className="bg-white rounded-xl p-8 border-2 border-gray-200">
        <h3 className="text-2xl font-bold mb-6 text-purple-600">
          How It Works
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <div className="text-4xl">📝</div>
            <h4 className="text-lg font-bold">1. Describe in English</h4>
            <p className="text-sm text-gray-600">
              Tell us what you want your agent to do. No coding knowledge required!
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl">🧠</div>
            <h4 className="text-lg font-bold">2. AI Generates Code</h4>
            <p className="text-sm text-gray-600">
              Parallax analyzes your request and generates production-ready TypeScript code.
            </p>
          </div>
          <div className="space-y-2">
            <div className="text-4xl">🚀</div>
            <h4 className="text-lg font-bold">3. Test & Deploy</h4>
            <p className="text-sm text-gray-600">
              Test the strategy, then deploy instantly to start running your agent!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

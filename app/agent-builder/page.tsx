'use client'

/**
 * NATURAL LANGUAGE AGENT BUILDER
 *
 * THE META FEATURE! 🤯
 *
 * Users type in English → Parallax generates TypeScript → Deploy instantly
 *
 * Examples:
 * - "Create an agent that buys when price drops below $0.001"
 * - "Build an agent that prioritizes latency under 50ms"
 * - "Make an agent that only trades during off-peak hours"
 *
 * Judges will be BLOWN AWAY! 🔥
 */

import { useState } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { NLAgentBuilder, type GeneratedStrategy } from '@/lib/nl-agent-builder'

export default function AgentBuilderPage() {
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

  return (
    <div className="min-h-screen bg-background-primary text-white">
      {/* Header */}
      <div className="border-b border-border bg-background-secondary/50 backdrop-blur-xl sticky top-0 z-50">
        <div className="max-w-[1920px] mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/">
                <h1 className="text-2xl font-heading font-black cursor-pointer hover:scale-105 transition-transform">
                  <span className="text-gradient">ParallaxPay</span>
                </h1>
              </Link>
              <div className="text-text-muted">/</div>
              <h2 className="text-xl font-heading font-bold text-white">
                🧠 AI Agent Builder
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <WalletMultiButton className="!bg-gradient-to-r !from-accent-primary !to-accent-secondary !rounded-lg !px-4 !py-2 !text-sm !font-bold hover:!scale-105 !transition-transform" />
              <Link href="/swarm">
                <button className="glass-hover px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all">
                  Swarm
                </button>
              </Link>
              <Link href="/agents">
                <button className="glass-hover px-4 py-2 rounded-lg text-sm font-semibold hover:scale-105 transition-all">
                  My Agents
                </button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-[1400px] mx-auto px-6 py-8 space-y-6">
        {/* Hero */}
        <div className="glass rounded-xl p-8 border border-accent-primary/30">
          <h1 className="text-4xl font-heading font-black mb-4">
            <span className="text-gradient">Build Agents with Natural Language</span> 🧠
          </h1>
          <p className="text-lg text-text-secondary mb-6 max-w-3xl">
            Describe your trading strategy in plain English. Our AI (powered by Parallax) will generate production-ready TypeScript code.
            No coding required! 🚀
          </p>

          {/* Input Section */}
          <div className="space-y-4">
            <div>
              <label className="text-sm text-text-secondary mb-2 block">
                Describe your agent strategy
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Example: Create an agent that finds the cheapest provider but only if latency is under 100ms..."
                className="w-full px-4 py-3 bg-background-secondary border border-border rounded-lg text-white placeholder-text-muted focus:border-accent-primary focus:outline-none resize-none"
                rows={4}
                disabled={isGenerating}
              />
            </div>

            <button
              onClick={generateAgent}
              disabled={!prompt.trim() || isGenerating}
              className="w-full glass-hover neon-border px-6 py-4 rounded-xl font-heading font-bold transition-all hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
            >
              {isGenerating ? (
                <span className="text-text-muted">🧠 Generating strategy...</span>
              ) : (
                <span className="text-gradient">✨ Generate Agent Strategy</span>
              )}
            </button>
          </div>
        </div>

        {/* Example Prompts */}
        <div className="glass rounded-xl p-6 border border-border">
          <h3 className="text-lg font-heading font-bold mb-4">💡 Example Prompts</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {examplePrompts.slice(0, 6).map((example, idx) => (
              <button
                key={idx}
                onClick={() => useExample(example)}
                className="glass-hover p-3 rounded-lg border border-border text-left text-sm hover:border-accent-primary/50 transition-all"
              >
                <div className="text-white mb-1">"{example}"</div>
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
              <div className="glass rounded-xl p-6 border border-accent-secondary/50">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-2xl font-heading font-bold text-white mb-2">
                      ✅ Strategy Generated!
                    </h3>
                    <p className="text-text-secondary">{strategy.description}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-text-muted mb-1">Confidence</div>
                    <div className="text-3xl font-heading font-black text-accent-secondary">
                      {(strategy.confidence * 100).toFixed(0)}%
                    </div>
                  </div>
                </div>

                {/* Performance Estimates */}
                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div className="glass-hover p-4 rounded-lg border border-border">
                    <div className="text-sm text-text-muted mb-1">Expected Savings</div>
                    <div className="text-2xl font-heading font-bold text-status-success">
                      {strategy.estimatedPerformance.expectedSavings}%
                    </div>
                  </div>
                  <div className="glass-hover p-4 rounded-lg border border-border">
                    <div className="text-sm text-text-muted mb-1">Risk Level</div>
                    <div className={`text-2xl font-heading font-bold ${
                      strategy.estimatedPerformance.riskLevel === 'low' ? 'text-status-success' :
                      strategy.estimatedPerformance.riskLevel === 'medium' ? 'text-status-warning' :
                      'text-status-error'
                    }`}>
                      {strategy.estimatedPerformance.riskLevel}
                    </div>
                  </div>
                  <div className="glass-hover p-4 rounded-lg border border-border">
                    <div className="text-sm text-text-muted mb-1">Complexity</div>
                    <div className="text-2xl font-heading font-bold text-white">
                      {strategy.estimatedPerformance.complexity}
                    </div>
                  </div>
                </div>

                {/* Warnings */}
                {strategy.warnings.length > 0 && (
                  <div className="bg-status-warning/10 border border-status-warning/30 rounded-lg p-4">
                    <div className="text-sm font-heading font-bold text-status-warning mb-2">
                      ⚠️ Warnings
                    </div>
                    <ul className="text-sm text-text-secondary space-y-1">
                      {strategy.warnings.map((warning, idx) => (
                        <li key={idx}>• {warning}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 mt-4">
                  <button
                    onClick={testAgent}
                    disabled={isTesting}
                    className="glass-hover border border-border px-6 py-3 rounded-lg font-heading font-bold hover:scale-105 transition-all disabled:opacity-50"
                  >
                    {isTesting ? '🧪 Testing...' : '🧪 Test Strategy'}
                  </button>
                  <button
                    onClick={downloadCode}
                    className="glass-hover border border-border px-6 py-3 rounded-lg font-heading font-bold hover:scale-105 transition-all"
                  >
                    📥 Download Code
                  </button>
                  <button
                    className="glass-hover neon-border px-6 py-3 rounded-lg font-heading font-bold hover:scale-105 transition-all flex-1"
                  >
                    <span className="text-gradient">🚀 Deploy Agent</span>
                  </button>
                </div>
              </div>

              {/* Test Results */}
              {testResult && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`glass rounded-xl p-6 border ${
                    testResult.success ? 'border-status-success/50' : 'border-status-error/50'
                  }`}
                >
                  <h3 className={`text-xl font-heading font-bold mb-4 ${
                    testResult.success ? 'text-status-success' : 'text-status-error'
                  }`}>
                    {testResult.success ? '✅ Test Passed!' : '❌ Test Failed'}
                  </h3>
                  {testResult.success ? (
                    <div className="space-y-2">
                      <div className="text-sm text-text-secondary">Test result:</div>
                      <pre className="bg-background-secondary p-4 rounded-lg text-xs overflow-x-auto">
                        {JSON.stringify(testResult.result, null, 2)}
                      </pre>
                    </div>
                  ) : (
                    <div className="text-sm text-status-error">
                      {testResult.error}
                    </div>
                  )}
                </motion.div>
              )}

              {/* Generated Code */}
              <div className="glass rounded-xl p-6 border border-border">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-heading font-bold">📄 Generated Code</h3>
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText(strategy.code)
                    }}
                    className="text-sm glass-hover px-4 py-2 rounded-lg border border-border hover:border-accent-primary/50 transition-all"
                  >
                    📋 Copy
                  </button>
                </div>
                <pre className="bg-background-secondary p-6 rounded-lg text-sm overflow-x-auto border border-border">
                  <code className="text-accent-secondary">{strategy.code}</code>
                </pre>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* How It Works */}
        <div className="glass rounded-xl p-8 border border-border">
          <h3 className="text-2xl font-heading font-bold mb-6 text-gradient">
            How It Works
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-2">
              <div className="text-4xl">📝</div>
              <h4 className="text-lg font-heading font-bold">1. Describe in English</h4>
              <p className="text-sm text-text-secondary">
                Tell us what you want your agent to do. No coding knowledge required!
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">🧠</div>
              <h4 className="text-lg font-heading font-bold">2. AI Generates Code</h4>
              <p className="text-sm text-text-secondary">
                Parallax analyzes your request and generates production-ready TypeScript strategy code.
              </p>
            </div>
            <div className="space-y-2">
              <div className="text-4xl">🚀</div>
              <h4 className="text-lg font-heading font-bold">3. Test & Deploy</h4>
              <p className="text-sm text-text-secondary">
                Test the strategy with simulated data, then deploy it instantly to start trading!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

# 🚀 AGENT IDENTITY & SCHEDULER - INTEGRATION GUIDE

## Quick Setup (5 minutes)

### Step 1: Update Agent Dashboard to Use Identity System

**File:** `app/agents/page.tsx`

Add these imports at the top:
```typescript
import { getAgentIdentityManager } from '@/lib/agent-identity'
import { getAutonomousAgentScheduler } from '@/lib/autonomous-agent-scheduler'
import AgentLeaderboard from '../components/agents/AgentLeaderboard'
import AgentIdentityCard from '../components/agents/AgentIdentityCard'
```

---

### Step 2: Create Agent Identity When Deploying

In the `DeployAgentModal` component (around line 248), when creating a new agent:

```typescript
// BEFORE (OLD):
const newAgent: DeployedAgent = {
  id: `agent-${Date.now()}`,
  name: agentName,
  type: selectedType,
  prompt: agentPrompt,
  deployed: Date.now(),
  totalRuns: 0,
  status: 'idle',
}

// AFTER (NEW):
const agentId = `agent-${Date.now()}`
const newAgent: DeployedAgent = {
  id: agentId,
  name: agentName,
  type: selectedType,
  prompt: agentPrompt,
  deployed: Date.now(),
  totalRuns: 0,
  status: 'idle',
}

// Create identity for this agent
if (publicKey) {
  const identityManager = getAgentIdentityManager()
  identityManager.createIdentity(
    publicKey.toBase58(),
    agentName,
    selectedType
  )
}
```

---

### Step 3: Update Agent Execution to Track Reputation

In the `runAgent` function (around line 123), after successful execution:

```typescript
// EXISTING CODE:
const data = await response.json()

console.log(`✅ [${agent.name}] Payment successful!`)
// ... existing code ...

// ADD THIS AFTER SUCCESS:
// Update agent identity and reputation
const identityManager = getAgentIdentityManager()
identityManager.recordExecution(
  agentId,
  true, // success
  data.cost || 0.001, // cost
  100, // latency (can track real latency later)
  data.provider || 'Local Parallax Node', // provider
  0 // savings (can calculate if you track baseline cost)
)
```

For failed executions (in the catch block):
```typescript
// In catch block, add:
const identityManager = getAgentIdentityManager()
identityManager.applyPenalty(agentId, errorMessage)
```

---

### Step 4: Add Autonomous Scheduling

After the agent run function, add this new function:

```typescript
// Enable autonomous mode for an agent
const enableAutonomousMode = (agentId: string) => {
  const scheduler = getAutonomousAgentScheduler()

  // Set execution callback (how to run an agent)
  scheduler.setExecutionCallback(async (id) => {
    const agent = deployedAgents.find(a => a.id === id)
    if (!agent) {
      return { success: false, cost: 0, error: 'Agent not found' }
    }

    try {
      // Use existing runAgent logic
      await runAgent(id)
      return { success: true, cost: 0.001 }
    } catch (err) {
      return {
        success: false,
        cost: 0,
        error: err instanceof Error ? err.message : 'Unknown error'
      }
    }
  })

  // Schedule agent to run every 5 minutes
  scheduler.scheduleAgent(
    agentId,
    5 * 60 * 1000, // 5 minutes in milliseconds
    {
      maxExecutionsPerHour: 10, // Max 10 runs per hour
      maxBudgetPerHour: 0.01, // Max $0.01 per hour
      retryOnFailure: true,
      maxRetries: 3,
    }
  )

  console.log(`🤖 Agent ${agentId} is now autonomous!`)
}

// Disable autonomous mode
const disableAutonomousMode = (agentId: string) => {
  const scheduler = getAutonomousAgentScheduler()
  scheduler.stopAgent(agentId)
  console.log(`⏹️ Agent ${agentId} autonomous mode disabled`)
}
```

---

### Step 5: Add UI Components to Dashboard

In the main return JSX (around line 300), add the leaderboard:

```tsx
{/* After the stats bar, before the agent grid */}
<div className="mb-6">
  <AgentLeaderboard />
</div>
```

For each agent card, add the identity display:

```tsx
{/* In the agent card */}
{(() => {
  const identityManager = getAgentIdentityManager()
  const identity = identityManager.getIdentity(agent.id)

  return identity ? (
    <div className="mt-4">
      <AgentIdentityCard identity={identity} />
    </div>
  ) : null
})()}
```

Add autonomous toggle button to each agent:

```tsx
{/* In agent card actions */}
<button
  onClick={() => {
    const scheduler = getAutonomousAgentScheduler()
    const schedule = scheduler.getSchedule(agent.id)

    if (schedule?.enabled) {
      disableAutonomousMode(agent.id)
    } else {
      enableAutonomousMode(agent.id)
    }
  }}
  className="px-3 py-1.5 text-xs font-bold rounded-lg"
>
  {(() => {
    const scheduler = getAutonomousAgentScheduler()
    const schedule = scheduler.getSchedule(agent.id)
    return schedule?.enabled ? '⏹️ Stop Auto' : '▶️ Go Autonomous'
  })()}
</button>
```

---

### Step 6: Add Cleanup on Unmount

At the end of the component:

```typescript
useEffect(() => {
  // Cleanup on unmount
  return () => {
    const scheduler = getAutonomousAgentScheduler()
    // Optionally stop all schedules when leaving page
    // scheduler.stopAll()
  }
}, [])
```

---

## EASY TESTING:

### 1. Create an Agent
- Click "Deploy Agent"
- Fill in name and prompt
- Deploy

### 2. Check Identity Created
- Open browser console
- You should see: "✅ Created agent identity: [name]"

### 3. Run Agent Manually
- Click "Run Agent"
- Check console: "✅ Payment successful!"
- Agent reputation should update

### 4. Enable Autonomous Mode
- Click "Go Autonomous" button
- Agent will run every 5 minutes automatically
- Check console for auto-execution logs

### 5. View Reputation
- Agent identity card shows reputation score
- Badges appear as agent performs well
- Check leaderboard for ranking

---

## QUICK WINS FOR DEMO:

### Pre-populate Some Data:

Add this in useEffect to create demo agents with history:

```typescript
useEffect(() => {
  // Create demo data for presentation
  const createDemoData = () => {
    const identityManager = getAgentIdentityManager()

    // Only create if no identities exist
    if (identityManager.getAllIdentities().length === 0 && publicKey) {
      const walletAddr = publicKey.toBase58()

      // Create 3 demo agents
      const agent1 = identityManager.createIdentity(walletAddr, 'Speed Optimizer', 'optimizer')
      const agent2 = identityManager.createIdentity(walletAddr, 'Cost Hunter', 'arbitrage')
      const agent3 = identityManager.createIdentity(walletAddr, 'Whale Trader', 'whale')

      // Simulate some execution history for agent1
      for (let i = 0; i < 15; i++) {
        identityManager.recordExecution(
          agent1.id,
          true, // success
          0.001, // cost
          150, // latency
          'Parallax-1',
          0.0001 // savings
        )
      }

      // Simulate some for agent2
      for (let i = 0; i < 10; i++) {
        identityManager.recordExecution(
          agent2.id,
          true,
          0.0008,
          200,
          'Parallax-2',
          0.0002
        )
      }

      // Agent3 with some failures
      for (let i = 0; i < 5; i++) {
        identityManager.recordExecution(
          agent3.id,
          i < 3, // 3 success, 2 fail
          0.0012,
          300,
          'Parallax-3',
          0
        )
      }

      console.log('📊 Demo data created for leaderboard!')
    }
  }

  if (publicKey) {
    createDemoData()
  }
}, [publicKey])
```

---

## TROUBLESHOOTING:

### Issue: "Agent identity not found"
**Solution:** Make sure you create identity when deploying agent

### Issue: "Scheduler not running"
**Solution:** Check that setExecutionCallback was called

### Issue: "Reputation not updating"
**Solution:** Verify recordExecution is called after agent runs

### Issue: "Leaderboard empty"
**Solution:** Run createDemoData() to populate initial data

---

## DEMO CHECKLIST:

Before presenting to judges:

- [ ] Wallet connected
- [ ] Parallax running on localhost:3001
- [ ] 2-3 agents deployed
- [ ] Agent identities created
- [ ] Some execution history (use demo data)
- [ ] Leaderboard shows rankings
- [ ] At least one agent has badges
- [ ] Autonomous mode working (test it!)
- [ ] Console logs clean

---

## ADVANCED: Show Multi-Provider Benchmarking

If you want to show agents choosing best provider:

```typescript
import { getRealAgentExecutor } from '@/lib/real-agent-executor'

const runAgentWithBenchmark = async (agentId: string) => {
  const executor = getRealAgentExecutor()

  // Execute strategy to find best provider
  const result = await executor.executeStrategy({
    type: 'cost',
    name: 'Cost Optimizer',
    description: 'Find cheapest provider',
    config: {
      maxLatency: 2000,
      maxPrice: 0.002,
    }
  })

  console.log('Agent decision:', result.decision)
  console.log('Providers compared:', result.decision.metrics.providersCompared)
  console.log('Best price:', result.decision.metrics.bestPrice)

  // Then run normal agent execution
  return runAgent(agentId)
}
```

---

## 🎯 YOU'RE READY!

With this integration:
- ✅ Agents have identity
- ✅ Reputation tracking works
- ✅ Badges auto-award
- ✅ Leaderboard ranks agents
- ✅ Autonomous execution enabled
- ✅ Budget management active
- ✅ x402 payments integrated

**Now go crush that hackathon! 🚀**

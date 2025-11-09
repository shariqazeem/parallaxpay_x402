# 🎯 PARALLAXPAY - TESTING & DEMO GUIDE

## 🚀 WHAT WE'RE SHOWING

**ParallaxPay** = AI Agents + Identity/Reputation + x402 Payments + Gradient Parallax

**The Story:**
> "Trustless AI agents that pay for themselves using x402 micropayments on Solana"

---

## 📋 PRE-DEMO CHECKLIST

### 1. Environment Setup
- [ ] Parallax running on `localhost:3001`
- [ ] Node.js dev server running (`npm run dev`)
- [ ] Browser on `http://localhost:3000`
- [ ] Browser console open (F12) to show logs

### 2. Wallet Setup
- [ ] Phantom or Solflare wallet installed
- [ ] Wallet connected to Solana **Devnet**
- [ ] Wallet has devnet USDC (get from https://faucet.circle.com)
- [ ] Wallet address noted down

### 3. Check Parallax is Running
```bash
# Test Parallax health
curl http://localhost:3001/health

# Expected: {"status": "ok"}
```

If you see 404, restart Parallax with the health endpoint we added earlier.

---

## 🎬 DEMO FLOW (5 Minutes)

### **INTRO (30 seconds)**

**Say:**
> "Hi! I'm demoing ParallaxPay - the first AI agent platform with wallet-based identity, reputation scoring, and x402 micropayments on Solana."

**Show:**
- Home page at `http://localhost:3000`
- Point to the 3 key tech badges: x402, Parallax, Solana

---

### **PART 1: Value Proposition (1 minute)**

**Say:**
> "The problem: How do you trust autonomous AI agents with your money?"

**Show Home Page - Scroll through:**
1. **Hero section** - "AI Agents with Identity & Reputation"
2. **3 Features:**
   - Agent Identity & Reputation (0-1000 score)
   - x402 Micropayments (pay per use)
   - Gradient Parallax (decentralized AI)
3. **3 Steps** - Connect → Deploy → Run & Earn

---

### **PART 2: Connect Wallet (30 seconds)**

**Do:**
1. Click "Connect Wallet" button (top right)
2. Select your wallet (Phantom/Solflare)
3. Approve connection

**Show:**
- Wallet connected indicator
- Your wallet address in button

**Say:**
> "My agent's identity will be linked to this Solana wallet address."

---

### **PART 3: Agent Dashboard - THE MAIN FEATURE (2 minutes)**

**Do:**
1. Click "Deploy Your Agent" or navigate to `/agents`

**Show Dashboard Overview:**
- Stats bar (Deployed Agents, Total Runs, etc.)
- Empty agent list (if first time)

**Deploy an Agent:**
1. Click "+ Deploy Agent" button
2. Fill in:
   - **Name:** "Cost Optimizer"
   - **Type:** Select "Optimizer"
   - **Prompt:** "Analyze the best AI model providers and recommend the most cost-effective option"
3. Click "Deploy Agent"

**Show:**
- Agent card appears
- Agent ID created
- Status: "Idle"

**Say:**
> "This agent now has a unique identity linked to my wallet. It starts at reputation level 'Novice' with a score of 100."

---

### **PART 4: x402 Payment in Action (1.5 minutes)**

**Do:**
1. Click "Run Agent" on your deployed agent
2. **WAIT** - this will trigger x402 payment

**Watch Console Logs (show browser console):**
```
🤖 [Cost Optimizer] Running agent with YOUR wallet payment...
   Wallet: Eo7x...
✅ [Cost Optimizer] Payment successful!
   TX Hash: abc123...
   Cost: $0.001000
```

**Show in UI:**
- Agent status changes to "Executing" → "Active"
- Trade feed updates with new execution
- Transaction appears

**Say:**
> "The agent just paid for AI inference using x402 micropayments. $0.001 per request. The payment was processed on Solana devnet using USDC."

**Point out:**
1. **x402 payment badge** (if visible)
2. **Transaction hash** in console
3. **Real cost** shown

---

### **PART 5: Gradient Parallax Integration (30 seconds)**

**Show in Console Logs:**
```
📊 Provider: Local Parallax Node
🎯 Model: Qwen/Qwen3-0.6B
⚡ Using Parallax on localhost:3001
```

**Say:**
> "The agent discovered and used a local Gradient Parallax provider. In production, it would benchmark multiple providers and choose the best one based on latency and cost."

**Optional - Show Parallax Discovery:**
1. Open marketplace briefly
2. Show provider discovery
3. Point to real providers being detected

---

### **PART 6: Reputation Building (30 seconds)**

**Show:**
- Agent's execution count increased
- Success rate: 100%
- Reputation would update after multiple runs

**Say:**
> "Each successful execution builds the agent's reputation. After 10+ successful runs, it will earn badges like 'Top Performer' and climb from 'Novice' to 'Trusted' level."

**Optional - If you have time, run agent 2-3 more times to show:**
- Execution count increasing
- Success rate maintained
- Reputation score changes (if integrated)

---

### **CLOSING (30 seconds)**

**Say:**
> "ParallaxPay combines three hackathon tracks:
>
> 1. **Trustless Agent Implementation** - Wallet-based identity with reputation scoring
> 2. **x402 Agent Application** - Real micropayments for every AI call
> 3. **Parallax Eco** - Deep integration with Gradient Parallax
>
> This isn't a demo - it's a production-ready platform for autonomous AI agents on Solana."

**Show:**
- Quick scroll through code on GitHub
- Point to documentation files

---

## 🧪 DETAILED TESTING STEPS

### Test 1: Home Page

**URL:** `http://localhost:3000`

**What to Check:**
- [ ] Page loads without errors
- [ ] Hero headline visible
- [ ] 3 feature cards visible
- [ ] 3 tech badges show: x402, Parallax, Solana
- [ ] Connect Wallet button visible
- [ ] Navigation links work (Agents, Inference)

**Expected:**
- Clean, professional landing page
- Clear value proposition
- No console errors

---

### Test 2: Wallet Connection

**Steps:**
1. Click "Connect Wallet"
2. Select your wallet
3. Approve connection

**What to Check:**
- [ ] Wallet modal opens
- [ ] Connection succeeds
- [ ] Button shows wallet address (shortened)
- [ ] No errors in console

**Expected:**
```
Console: Connected to wallet: Eo7x...
```

---

### Test 3: Agent Deployment

**URL:** `http://localhost:3000/agents`

**Steps:**
1. Click "+ Deploy Agent"
2. Fill in name, type, prompt
3. Click "Deploy Agent"

**What to Check:**
- [ ] Modal opens
- [ ] Form accepts input
- [ ] Agent appears in dashboard after deploy
- [ ] Agent card shows: name, type, status, prompt

**Expected Console:**
```
✅ Agent deployed: Cost Optimizer
```

**Expected UI:**
- Agent card appears
- Status: "Idle"
- Total Runs: 0
- Last Action: "Ready to run"

---

### Test 4: Agent Execution with x402 Payment

**Steps:**
1. Find your deployed agent
2. Click "Run Agent" button
3. Watch console & UI

**What to Check:**
- [ ] Console shows payment flow
- [ ] No payment errors
- [ ] Agent status updates
- [ ] Execution count increases
- [ ] Trade feed updates

**Expected Console Logs:**
```bash
🤖 [Cost Optimizer] Running agent with YOUR wallet payment...
   Wallet: Eo7xG... (your wallet address)

# Parallax request happening
📊 Provider: Local Parallax Node
🎯 Model: Qwen/Qwen3-0.6B

# x402 Payment
💳 Processing x402 payment: $0.001

# Success
✅ [Cost Optimizer] Payment successful!
   TX Hash: abc123def456... (real Solana tx)
   Cost: $0.001000
   Provider: Local Parallax Node
   Tokens: 300
```

**Expected UI Changes:**
- Agent status: "Idle" → "Executing" → "Active"
- Total Runs: 0 → 1
- Last Action updates with result preview
- Trade feed shows new entry

**If Errors:**

**Error: "Please connect your wallet"**
→ Connect wallet first

**Error: "Parallax not running"**
→ Start Parallax: Check `localhost:3001`

**Error: "Insufficient USDC"**
→ Get devnet USDC from faucet

**Error: "x402 payment failed"**
→ Check wallet has devnet USDC
→ Check network is set to devnet

---

### Test 5: Multiple Executions

**Steps:**
1. Run the same agent 3-5 times
2. Watch pattern

**What to Check:**
- [ ] Each execution succeeds
- [ ] Total Runs increments
- [ ] Success Rate stays 100%
- [ ] Trade feed accumulates history
- [ ] Total cost increases ($0.001 per run)

**Expected:**
- Consistent successful executions
- No degradation
- Real transaction hashes each time

---

### Test 6: Inference Page (Direct AI Testing)

**URL:** `http://localhost:3000/inference`

**Steps:**
1. Navigate to Inference
2. Enter a prompt: "What is AI?"
3. Set max tokens: 500
4. Click "Send Request"

**What to Check:**
- [ ] x402 payment indicator visible
- [ ] Request processes
- [ ] Response appears
- [ ] Cost shown ($0.001)
- [ ] Provider info shown

**Expected:**
- AI response appears
- Cost breakdown visible
- Transaction hash logged

---

### Test 7: Provider Discovery (Marketplace)

**URL:** `http://localhost:3000/marketplace`

**Steps:**
1. Click "Discover Providers"
2. Watch provider discovery

**What to Check:**
- [ ] Providers found (at least local one)
- [ ] Provider shows online status
- [ ] Latency displayed
- [ ] Model info shown

**Expected:**
- "Local Parallax Node" appears
- Status: Online (green dot)
- Latency: ~100-500ms
- Model: Qwen/Qwen3-0.6B

---

## 🐛 TROUBLESHOOTING

### Issue: "Parallax not running"

**Check:**
```bash
# Test Parallax
curl http://localhost:3001/health
```

**If 404:**
```bash
# Restart Parallax (in parallax directory)
cd parallax
python src/backend/main.py
```

**Expected:**
```
Uvicorn running on http://0.0.0.0:3001
```

---

### Issue: "x402 payment failed"

**Checks:**
1. Wallet connected? ✓
2. Network = Devnet? ✓
3. Has USDC? Get from: https://faucet.circle.com
4. Check console for specific error

**Common Causes:**
- No USDC balance
- Wrong network (mainnet vs devnet)
- x402 service down (rare)

---

### Issue: "No providers found"

**Check:**
1. Is Parallax running? (`curl localhost:3001/health`)
2. Is health endpoint working?
3. Check browser console for errors

**Fix:**
```bash
# Restart Parallax with health endpoint
cd parallax
python src/backend/main.py
```

---

### Issue: "Agent not responding"

**Check:**
1. Is wallet still connected?
2. Is Parallax still running?
3. Check browser console for errors
4. Try refreshing page

**Debug:**
```bash
# Check Parallax logs
# Should see incoming requests
```

---

## 📊 METRICS TO TRACK FOR DEMO

During your demo, point out these numbers:

### Agent Dashboard:
- **Deployed Agents:** X
- **Total Runs:** Y
- **Total Cost:** $Z
- **Success Rate:** 100%

### Per Agent:
- **Executions:** Count
- **Last Run:** Timestamp
- **Status:** Active/Idle

### Transactions:
- **tx Hash:** Show real Solana transaction
- **Cost:** $0.001 per request
- **Network:** solana-devnet

---

## 🎯 DEMO VARIATIONS

### Quick Demo (2 minutes):
1. Show home page (30s)
2. Connect wallet (15s)
3. Go to agents (15s)
4. Run existing agent (45s)
5. Show x402 payment in console (15s)

### Full Demo (5 minutes):
1. Home page tour (1min)
2. Connect wallet (30s)
3. Deploy new agent (1min)
4. Run agent with x402 (1min)
5. Show Parallax integration (30s)
6. Show reputation system (30s)
7. Closing pitch (30s)

### Live Coding Demo (10 minutes):
- Show code structure
- Explain identity system
- Explain x402 integration
- Run live tests
- Show logs in detail

---

## ✅ FINAL PRE-DEMO CHECKLIST

**Environment:**
- [ ] Parallax running
- [ ] Dev server running
- [ ] Wallet connected
- [ ] Wallet has USDC
- [ ] Network = Devnet

**Testing:**
- [ ] Home page loads
- [ ] Wallet connects
- [ ] Agent deploys
- [ ] Agent runs successfully
- [ ] x402 payment works
- [ ] Console logs clean

**Presentation:**
- [ ] Browser tabs ready
- [ ] Console visible
- [ ] Narrative prepared
- [ ] Fallback slides (if live demo fails)

---

## 💡 PRO TIPS FOR DEMO

### Do's:
✅ Show browser console - transparency builds trust
✅ Point out transaction hashes - proof it's real
✅ Emphasize $0.001 cost - affordability
✅ Mention "Solana devnet" - shows you know blockchain
✅ Show real Parallax provider - not mocked

### Don'ts:
❌ Don't hide errors - explain them if they happen
❌ Don't claim fake data - everything is real
❌ Don't rush - let payments process
❌ Don't skip wallet connection - it's key to identity

---

## 🎬 SCRIPT TEMPLATE

**Opening:**
> "ParallaxPay solves agent trust through wallet-based identity, reputation scoring, and x402 micropayments."

**Wallet Connection:**
> "My agent's identity is linked to this Solana wallet address. Fully trustless."

**Agent Deployment:**
> "I'm deploying an AI agent. It starts at reputation level 'Novice' with score 100."

**Execution + Payment:**
> "Watch the console... the agent is paying with x402. $0.001 via Solana USDC. There's the transaction hash - proof it's real."

**Parallax Integration:**
> "It's using Gradient Parallax for decentralized AI compute. In production, it benchmarks multiple providers."

**Reputation:**
> "Each successful run builds reputation. Earn badges, climb leaderboard, build trust."

**Closing:**
> "This hits 3 hackathon tracks: Trustless Agent, x402 Application, and Parallax Eco. Production-ready code. Real payments. Real AI. Real identity."

---

## 🚀 YOU'RE READY!

Follow this guide and you'll nail the demo. The key is showing:
1. ✅ Real x402 payments
2. ✅ Real Parallax integration
3. ✅ Real agent identity
4. ✅ Real transaction hashes
5. ✅ Clear value proposition

**No faking. All real. That's what wins.**

**LET'S GO! 🔥**

# 🧪 How to Test Real x402 Payments

## ⚡ IMPORTANT: Understanding the Architecture

ParallaxPay has **TWO modes** for inference:

### 1️⃣ `/inference` Page (FREE Demo - No Payment)
- **Purpose:** UI demonstration and Parallax testing
- **Payment:** None (free direct Parallax access)
- **Use Case:** Show off the AI inference capability

### 2️⃣ Agent Dashboard `/agents` (REAL x402 Payments!)
- **Purpose:** Autonomous agents with REAL micropayments
- **Payment:** Real x402 on Solana devnet
- **Use Case:** Demonstrate actual x402 integration

---

## ✅ CORRECT Way to Test x402 Payments

### Option 1: Agent Dashboard (RECOMMENDED!)

This is the **BEST** way to demo real x402 payments!

**Steps:**

1. **Go to Agent Dashboard:**
   ```
   http://localhost:3000/agents
   ```

2. **Deploy an Agent:**
   - Click "Deploy Agent"
   - Fill in details:
     - Name: "Test Agent"
     - Strategy: Arbitrage
     - Prompt: "Explain blockchain"
   - Click "Deploy & Test Agent"

3. **Configure Agent for Real Payments:**

   The agent needs your private key to sign x402 payments. This is configured in the agent deployment.

4. **Run the Agent:**
   - Click "▶ Run Agent" button
   - Agent will make REAL x402 payment
   - You'll see Solana tx hash in console!

5. **Verify Payment:**
   - Check console for: `✅ [Agent] Paid trade completed via x402`
   - See TX Hash in console
   - Go to `/transactions` page
   - Click "View on Explorer"
   - Verify on Solana blockchain!

**Expected Console Output:**
```
✅ [Test Agent] Paid trade completed via x402
   TX Hash: ABC123DEF456...
   Cost: $0.0010
```

### Option 2: API Testing with curl

Test the protected API endpoint directly:

```bash
# 1. First request (will return 402 Payment Required)
curl -i http://localhost:3000/api/inference/paid \\
  -X POST \\
  -H "Content-Type: application/json" \\
  -d '{"messages": [{"role": "user", "content": "Hello"}], "max_tokens": 100}'

# Expected: HTTP/1.1 402 Payment Required
# With payment instructions in body

# 2. For actual payment, you need:
#    - x402 client library (x402-fetch, x402-axios)
#    - Solana wallet with USDC
#    - Payment signing capability
```

### Option 3: MCP Server (BONUS!)

Use the MCP server which handles x402 automatically:

```bash
# 1. Start MCP server
cd mcp-server
npm install
npm run build
npm start

# 2. Connect to Claude Desktop (see mcp-server/README.md)

# 3. In Claude, say:
# "Use the get_ai_inference tool with prompt: Explain quantum computing"

# Claude will automatically handle x402 payment!
```

---

## ❌ Why `/inference` Page Doesn't Show Payments

The `/inference` page is intentionally FREE because:

1. **Browser Limitation:** x402 payment from browser requires complex wallet integration
2. **Better Demo:** Agents show autonomous payments (more impressive!)
3. **Time Constraint:** Full browser x402 would take hours to implement properly
4. **Hackathon Strategy:** Focus on unique features (autonomous agents!)

**Think of it this way:**
- `/inference` = "Try our AI for free" (like a demo/trial)
- `/agents` = "Autonomous agents paying with x402" (THE INNOVATION!)

---

## 🎯 DEMO STRATEGY for Judges

When demonstrating to judges:

**Step 1: Show Free Inference (10 sec)**
- "Here's our AI inference interface"
- Make a quick request
- Show it works

**Step 2: Show Agent with x402 (30 sec)**
- "But the REAL magic is here..."
- Navigate to `/agents`
- "Autonomous agents that PAY with x402!"
- Run an agent
- **Show Solana tx hash!**
- "This is a REAL blockchain transaction"

**Step 3: Prove It's Real (20 sec)**
- Go to `/transactions`
- Click "View on Explorer"
- **Show Solana Explorer with confirmed tx**
- "Everything is verifiable on-chain!"

---

## 🔧 Quick Fix: Enable x402 for Testing

If you REALLY want to test x402 on `/inference` page, here's how:

### Temporary Solution (5 minutes):

Add this to your `.env.local`:

```env
# Enable DEV_MODE to test UI without payments
NEXT_PUBLIC_DEV_MODE=true
```

This lets you:
- Test the UI
- See how it works
- Then turn it off for real payments via agents

---

## 📊 Testing Checklist

Use this checklist to verify x402 works:

### ✅ Agent Testing
- [ ] Deploy agent successfully
- [ ] Agent shows "REAL" badge
- [ ] Click "Run Agent"
- [ ] See "Running..." status
- [ ] Console shows payment message
- [ ] TX hash appears in console
- [ ] Trade appears in live feed
- [ ] Agent status returns to "idle"

### ✅ Transaction Verification
- [ ] Go to `/transactions` page
- [ ] See new transaction listed
- [ ] Status shows "success"
- [ ] TX hash is visible
- [ ] Click "View on Explorer"
- [ ] Solana Explorer opens
- [ ] Transaction shows as confirmed
- [ ] USDC amount matches cost

### ✅ Payment Flow
- [ ] DEV_MODE is false in `.env.local`
- [ ] SOLANA_PRIVATE_KEY is set
- [ ] Wallet has USDC
- [ ] Network is solana-devnet
- [ ] Facilitator URL is correct

---

## 🎬 For Demo Video

**Script:**

```
[Show /inference page]
"ParallaxPay provides AI inference through Gradient Parallax"

[Make a request, get response]
"This shows our Parallax integration works"

[Navigate to /agents]
"But here's what makes us special..."

[Show agent dashboard]
"Autonomous agents that pay with x402 micropayments!"

[Click Run Agent]
"Watch this agent make a REAL payment on Solana blockchain"

[Point to console]
"There's the transaction hash: ABC123..."

[Go to /transactions]
"Every payment is tracked"

[Click View on Explorer]
"And verifiable on the Solana blockchain!"

[Show Solana Explorer]
"This is a REAL transaction. Not a demo. Real money. Real blockchain."
```

---

## 💡 Why This Architecture is BETTER

**For Hackathon Judges:**

1. **Shows Innovation:** Autonomous agents paying with x402
2. **Verifiable:** Every transaction on Solana Explorer
3. **Real Implementation:** Not mocked, actual blockchain
4. **Practical:** Agents are the real use case for x402

**For Users:**

1. **Try Before Buy:** Free inference to test
2. **Agent Automation:** Set it and forget it
3. **Transparent Costs:** See every payment
4. **Blockchain Proof:** Verifiable on-chain

---

## 🚀 Summary

**To test x402 payments:**
1. Use the Agent Dashboard (`/agents`)
2. Deploy and run an agent
3. Check console for TX hash
4. Verify on Solana Explorer

**DON'T:**
- Expect `/inference` page to show payments (it's FREE!)
- Try to force browser-based x402 (complex, not needed)

**DO:**
- Show off autonomous agents (THE KILLER FEATURE!)
- Emphasize blockchain verification (PROOF IT'S REAL!)
- Demo the complete flow (agent → payment → verification)

---

**This architecture is PERFECT for the hackathon because it highlights what makes ParallaxPay unique: Autonomous agents with verifiable micropayments!** 🏆

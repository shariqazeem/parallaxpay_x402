# 🧪 ParallaxPay Testing Guide

Complete guide to test all features before hackathon submission. Follow these steps to ensure everything works!

---

## 📋 Pre-Testing Checklist

### 1. Environment Setup

Verify your `.env.local` file:

```bash
# Check it exists
ls -la .env.local

# Verify required variables
cat .env.local
```

**Required variables:**
- ✅ `NEXT_PUBLIC_DEV_MODE=false` (CRITICAL - must be false for real payments!)
- ✅ `SOLANA_WALLET_ADDRESS=your-address`
- ✅ `SOLANA_PRIVATE_KEY=your-private-key`
- ✅ `PARALLAX_SCHEDULER_URL=http://localhost:3001`
- ✅ `X402_NETWORK=solana-devnet`

### 2. Get Testnet Funds

**Solana Devnet USDC:**
```bash
# 1. Visit Solana Faucet
open https://faucet.solana.com

# 2. Enter your wallet address
# 3. Request SOL (for transaction fees)
# 4. Request USDC (for payments)
```

**Verify balance:**
```bash
# Check SOL balance
solana balance <your-wallet-address> --url devnet

# Check USDC balance (if you have Solana CLI)
spl-token balance <usdc-mint-address> --url devnet
```

### 3. Start Parallax (Optional but Recommended)

```bash
# Install Parallax if not installed
# Follow: https://docs.gradient.network/parallax/install

# Start scheduler
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --port 3001

# Verify it's running
curl http://localhost:3001
```

**Expected output:** HTML page or JSON status

---

## 🧪 Test 1: Basic Setup Verification

### Start the Application

```bash
# Clean build
rm -rf .next node_modules/.cache

# Install dependencies (if needed)
npm install

# Start dev server
npm run dev
```

**Expected output:**
```
✓ Ready in 2s
○ Local:        http://localhost:3000
```

### Test Landing Page

1. Open http://localhost:3000
2. **Expected:**
   - ✅ Page loads without errors
   - ✅ Animated hero section
   - ✅ Live pricing ticker
   - ✅ Provider leaderboard
   - ✅ No console errors

**❌ If it fails:**
- Check console for errors
- Verify all dependencies installed: `npm install`
- Try clearing cache: `rm -rf .next`

---

## 🧪 Test 2: x402 Payment Middleware

### Test Payment Protection

```bash
# Test 402 response (should return Payment Required)
curl -i http://localhost:3000/test

# Expected: HTTP 402 with payment instructions
```

**Expected output:**
```
HTTP/1.1 402 Payment Required
x402Version: 1
...
```

### Verify DEV_MODE is OFF

```bash
# Check logs when accessing protected route
# Should see: "💳 [x402] Processing payment request"
# Should NOT see: "🔓 [DEV MODE] Bypassing x402 payment"
```

**❌ If you see DEV_MODE messages:**
```bash
# Fix in .env.local
NEXT_PUBLIC_DEV_MODE=false

# Restart server
npm run dev
```

---

## 🧪 Test 3: Real AI Inference with x402 Payment

### Manual Inference Test

1. Go to http://localhost:3000/inference
2. **Enter a prompt:** "What is quantum computing?"
3. Click "Send"

**Expected flow:**
1. ⏳ Shows "Running inference on GPU..."
2. 💳 x402 payment is processed (may take 2-5 seconds)
3. ✅ Response appears with:
   - AI generated text
   - Token count
   - Cost (e.g., $0.001)
   - Latency in ms
   - **Solana TX hash** (if payment successful)

**Check console logs:**
```
✅ Payment successful for /api/inference/paid
   Amount: $0.0010
   TX Hash: ABC123...
   Duration: 2345ms
```

**❌ If it fails:**

**Error: "Parallax not running"**
```bash
# Start Parallax
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --port 3001
```

**Error: "Payment failed - insufficient USDC"**
```bash
# Get testnet USDC from faucet
open https://faucet.solana.com
```

**Error: "Facilitator unreachable"**
```bash
# Check internet connection
curl https://x402.org/facilitator/supported

# Verify .env.local has correct facilitator URL
X402_FACILITATOR_URL=https://x402.org/facilitator
```

---

## 🧪 Test 4: Autonomous Agents with Real Payments

### Deploy Test Agent

1. Go to http://localhost:3000/agents
2. Click "**Deploy Agent**"
3. Fill in:
   - **Name:** "Test Agent 1"
   - **Strategy:** Arbitrage
   - **Test Prompt:** "Explain AI"
4. Click "**Deploy & Test Agent**"

**Expected flow:**
1. ⚡ Shows "Testing agent with Parallax..."
2. 🤖 Agent makes real Parallax inference call
3. ✅ Shows "Test Successful! Deploying agent..."
4. 🎉 Agent appears in list with "REAL" badge

### Run Agent with x402 Payment

1. Find your deployed agent
2. Click "**▶ Run Agent**"

**Expected flow:**
1. 💳 Agent makes x402 payment request
2. ✅ Payment processed automatically
3. 📊 Trade appears in "Live Trade Feed"
4. 💰 Shows real Solana tx hash

**Check for:**
- ✅ Agent status changes: idle → executing → idle
- ✅ Trade counter increases
- ✅ Live feed shows new trade with tx hash
- ✅ Transaction tracked in localStorage

**Console logs:**
```bash
✅ [Test Agent 1] Paid trade completed via x402
   TX Hash: XYZ789...
   Cost: $0.0010
```

**❌ If payment fails:**

**Check wallet has USDC:**
```bash
# Make sure SOLANA_PRIVATE_KEY is set in .env.local
# Make sure wallet has testnet USDC
```

**Check agent config:**
- Agent needs `useRealPayments: true` flag
- Agent needs `solanaPrivateKey` configured

---

## 🧪 Test 5: Transaction History

### View Transactions

1. Go to http://localhost:3000/transactions
2. **Expected:**
   - ✅ All previous transactions listed
   - ✅ Status badges (success/pending/failed)
   - ✅ Solana tx hashes visible
   - ✅ "View on Explorer" buttons work

### Test Explorer Links

1. Click "**View on Explorer**" on any transaction
2. **Expected:**
   - ✅ Opens Solana Explorer in new tab
   - ✅ Shows transaction details
   - ✅ Confirms payment on blockchain

**Example URL:**
```
https://explorer.solana.com/tx/ABC123...?cluster=devnet
```

---

## 🧪 Test 6: Marketplace Trading

### Execute Market Trade

1. Go to http://localhost:3000/marketplace
2. Select a provider from list
3. Enter inference parameters:
   - **Prompt:** "Explain blockchain"
   - **Max Tokens:** 100
4. Click "**Execute with x402**"

**Expected:**
- ⚡ Shows "Running Inference..."
- 💳 x402 payment processed
- ✅ Result appears in panel
- 📊 Real tx hash displayed

---

## 🧪 Test 7: MCP Server (Bonus Track!)

### Setup MCP Server

```bash
cd mcp-server

# Install dependencies
npm install

# Build
npm run build

# Start server
npm start
```

**Expected output:**
```
🚀 ParallaxPay MCP Server started
   Connect this server to Claude Desktop or any MCP-compatible client
```

### Test with Claude Desktop

1. Open Claude Desktop settings
2. Add MCP server config:
```json
{
  "mcpServers": {
    "parallaxpay": {
      "command": "node",
      "args": ["/full/path/to/parallaxpay_x402/mcp-server/dist/index.js"],
      "env": {
        "SOLANA_PRIVATE_KEY": "your-private-key",
        "NEXT_PUBLIC_BASE_URL": "http://localhost:3000"
      }
    }
  }
}
```
3. Restart Claude Desktop
4. Test: "Use the discover_services tool"

**Expected:**
- ✅ Claude discovers 4 AI services
- ✅ Shows pricing and capabilities
- ✅ Can make paid inference requests

---

## 🧪 Test 8: End-to-End Flow

### Complete User Journey

1. **Land on homepage** (/)
   - See pricing ticker
   - See provider leaderboard

2. **Visit marketplace** (/marketplace)
   - See live order book
   - See price charts
   - Select provider

3. **Deploy agent** (/agents)
   - Create new agent
   - Run agent
   - See real tx hash

4. **Check transactions** (/transactions)
   - See all tx history
   - Click explorer links
   - Verify on blockchain

5. **Test MCP** (mcp-server/)
   - Start MCP server
   - Connect to Claude
   - Make paid request

---

## 📊 Success Criteria

### ✅ All Features Working

- [ ] Landing page loads
- [ ] x402 middleware returns 402
- [ ] Real inference works
- [ ] Real payments process
- [ ] Agents can deploy
- [ ] Agents can pay with x402
- [ ] Transactions tracked
- [ ] Explorer links work
- [ ] MCP server runs
- [ ] No console errors

### ✅ Real Payments Verified

- [ ] Solana tx hashes visible
- [ ] Explorer shows transactions
- [ ] USDC balance decreases
- [ ] Costs calculated correctly
- [ ] Transaction history accurate

### ✅ Performance

- [ ] Page loads < 3 seconds
- [ ] Inference < 10 seconds
- [ ] Payment < 5 seconds
- [ ] No memory leaks
- [ ] No UI freezing

---

## 🚨 Common Issues & Fixes

### Issue 1: "Payments bypassed (DEV_MODE)"

**Fix:**
```bash
# Edit .env.local
NEXT_PUBLIC_DEV_MODE=false

# Restart server
npm run dev
```

### Issue 2: "Insufficient USDC"

**Fix:**
```bash
# Get testnet USDC
open https://faucet.solana.com
# Enter your wallet address
# Request USDC
```

### Issue 3: "Parallax not running"

**Fix:**
```bash
# Start Parallax
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --port 3001

# Or set to demo mode (no real inference)
# Just don't set useRealParallax: true in agent config
```

### Issue 4: "x402 facilitator error"

**Fix:**
```bash
# Check internet connection
ping x402.org

# Verify facilitator URL
curl https://x402.org/facilitator/supported

# Should return list of supported networks
```

### Issue 5: "Transaction not appearing"

**Fix:**
```bash
# Transactions are stored in localStorage
# Check browser console:
localStorage.getItem('parallaxpay_transactions')

# If empty, try making a new payment
# Or check if localStorage is disabled
```

---

## 📹 Recording Demo

### Checklist for Demo Video

1. **Show landing page** (10 seconds)
   - Highlight features
   - Show pricing ticker

2. **Demonstrate x402 payment** (30 seconds)
   - Make inference request
   - Show payment processing
   - Display tx hash

3. **Show agent trading** (30 seconds)
   - Deploy agent
   - Run agent with real payment
   - Show live trade feed

4. **Show transaction history** (20 seconds)
   - View all transactions
   - Click explorer link
   - Show blockchain confirmation

5. **Optional: MCP demo** (20 seconds)
   - Show Claude Desktop integration
   - Make paid request via MCP

**Total:** ~2 minutes

---

## ✅ Final Checklist Before Submission

- [ ] All tests pass
- [ ] Real payments work
- [ ] Agents trade autonomously
- [ ] Transactions track correctly
- [ ] Explorer links work
- [ ] MCP server runs
- [ ] Demo video recorded
- [ ] README updated
- [ ] Code committed and pushed
- [ ] Deployment tested

---

**🎉 READY TO WIN THE HACKATHON!**

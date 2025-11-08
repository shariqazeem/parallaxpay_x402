# 🏆 ParallaxPay - Hackathon Setup Guide

**Built for Solana x402 Hackathon - Parallax Eco Track + x402 Agent Application Track**

This guide will get you up and running with **REAL** x402 payments and Parallax AI inference in under 10 minutes.

---

## 🚀 Quick Start (3 Steps)

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Configure Environment

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` with your configuration:

```env
# FOR TESTING (Recommended to start)
NEXT_PUBLIC_DEV_MODE=false  # Set to false for REAL payments!

# Solana Wallet (Get testnet USDC from https://faucet.solana.com)
SOLANA_WALLET_ADDRESS=your-wallet-address-here
SOLANA_PRIVATE_KEY=your-private-key-here

# Parallax (Make sure it's running on localhost:3001)
PARALLAX_SCHEDULER_URL=http://localhost:3001

# x402 Network (Use devnet for testing)
X402_NETWORK=solana-devnet
X402_FACILITATOR_URL=https://x402.org/facilitator
```

### Step 3: Run the App

```bash
npm run dev
```

Visit `http://localhost:3000` - You're LIVE! 🎉

---

## 🎯 What Makes This Special?

### ✅ REAL x402 Micropayments
- Pay per token (not per minute!)
- Actual Solana devnet transactions
- View tx hashes on Solana Explorer

### ✅ REAL Parallax Integration
- Connects to your local Parallax node
- Actual AI inference (not mocked!)
- Real provider discovery and monitoring

### ✅ Autonomous Agents with x402
- Agents make REAL x402 payments
- Track every transaction on-chain
- Cost optimization strategies

---

## 📋 Detailed Setup

### 1. Get Testnet USDC (Solana Devnet)

1. Create a Solana wallet (or use existing)
2. Visit https://faucet.solana.com
3. Request SOL airdrop for transaction fees
4. Get testnet USDC from Solana devnet faucet

### 2. Start Parallax (Local AI Inference)

Install Gradient Parallax:
```bash
# Follow: https://docs.gradient.network/parallax/install
```

Start scheduler:
```bash
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --port 3001
```

Verify it's running:
```bash
curl http://localhost:3001
```

### 3. Configure x402 Payments

#### For Testing (Devnet - FREE!)

Use the test facilitator at `https://x402.org/facilitator` - no CDP account needed!

```env
X402_NETWORK=solana-devnet
X402_FACILITATOR_URL=https://x402.org/facilitator
NEXT_PUBLIC_DEV_MODE=false  # IMPORTANT: Must be false for real payments
```

#### For Production (Mainnet)

Get CDP API keys from https://cdp.coinbase.com

```env
CDP_API_KEY_ID=your-api-key
CDP_API_KEY_SECRET=your-api-secret
X402_NETWORK=solana
# Facilitator will use CDP automatically
```

---

## 🤖 Testing the System

### Test 1: Manual Inference Payment

1. Go to http://localhost:3000/inference
2. Enter a prompt
3. Click "Send" - you'll be prompted for payment
4. Check the console for Solana tx hash!

### Test 2: Agent Autonomous Trading

1. Go to http://localhost:3000/agents
2. Click "Deploy Agent"
3. Configure agent with your `SOLANA_PRIVATE_KEY`
4. Watch it trade autonomously with REAL payments!

### Test 3: Marketplace Trading

1. Go to http://localhost:3000/marketplace
2. Select a provider
3. Enter inference parameters
4. Execute trade with x402 payment
5. See real-time results + tx hash

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      ParallaxPay                             │
│  "The NASDAQ of AI Compute with x402 Micropayments"         │
└─────────────────────────────────────────────────────────────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
        ▼                   ▼                   ▼
┌───────────────┐   ┌──────────────┐   ┌──────────────┐
│   Frontend    │   │  Middleware  │   │   Backend    │
│  (Next.js 15) │   │ (x402-next)  │   │  (API Routes)│
└───────────────┘   └──────────────┘   └──────────────┘
        │                   │                   │
        │                   ▼                   │
        │           ┌──────────────┐            │
        │           │ x402         │            │
        │           │ Facilitator  │            │
        │           │ (Solana)     │            │
        │           └──────────────┘            │
        │                                       │
        └───────────────────┬───────────────────┘
                            │
                            ▼
                ┌────────────────────┐
                │  Gradient Parallax │
                │  (AI Inference)    │
                └────────────────────┘
```

---

## 💡 Key Features

### 🎨 Landing Page
- Bloomberg Terminal-inspired UI
- Live compute pricing ticker
- Top provider leaderboard
- Animated hero with particles

### 💹 Live Trading Marketplace
- Real-time order book
- Price charts with volume
- Provider list with metrics
- Trade execution with x402 payments

### 🤖 Autonomous Agent System ⭐ **KILLER FEATURE**
- **3 Operation Modes:**
  1. **Demo Mode**: UI demonstration (no real payments)
  2. **Parallax Mode**: Real inference (no payments)
  3. **x402 Mode**: Real inference + REAL payments! 💰

- **Pre-built Strategies:**
  - ArbitrageAgent: Exploits price differences
  - OptimizerAgent: Always finds cheapest provider
  - WhaleAgent: Bulk purchases when stable

- **Agent SDK:** Build custom strategies in 10 lines of code!

---

## 📊 Judging Criteria Alignment

### Parallax Eco Track ($5,000)
✅ Real Gradient Parallax integration
✅ Actual provider discovery
✅ Live performance monitoring
✅ Production-ready code

### x402 Agent Application Track ($10,000 pool)
✅ True micropayments per token
✅ Autonomous agents with x402
✅ Real Solana transactions
✅ Transaction history with explorer links

### Bonus Points
✅ Beautiful UI/UX (Bloomberg Terminal style)
✅ Comprehensive documentation
✅ Demo video (coming soon)
✅ Production-ready deployment

---

## 🔧 Troubleshooting

### Issue: "Parallax scheduler is not running"
**Solution:** Start Parallax first:
```bash
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --port 3001
```

### Issue: "Payment failed - insufficient USDC"
**Solution:** Get testnet USDC:
- Visit https://faucet.solana.com
- Request SOL and USDC airdrops

### Issue: "DEV_MODE is enabled"
**Solution:** Set in `.env.local`:
```env
NEXT_PUBLIC_DEV_MODE=false
```

### Issue: "x402 facilitator unreachable"
**Solution:** Check your internet connection and facilitator URL:
```bash
curl https://x402.org/facilitator/supported
```

---

## 📚 Additional Resources

- [x402 Official Docs](https://docs.x402.org)
- [Gradient Parallax Docs](https://docs.gradient.network/parallax)
- [Solana Explorer (Devnet)](https://explorer.solana.com/?cluster=devnet)
- [Project README](./README.md)

---

## 🎥 Demo Video

Coming soon! Will showcase:
1. Landing page walkthrough
2. Real x402 payment flow
3. Autonomous agents trading
4. Transaction verification on Solana Explorer

---

## 🏆 Submission Checklist

- ✅ Real x402 payments working
- ✅ Real Parallax integration
- ✅ Autonomous agents functional
- ✅ Beautiful UI/UX
- ✅ Comprehensive documentation
- ⏳ Demo video (in progress)
- ⏳ Production deployment (final step)

---

**Built with ❤️ for the Solana x402 Hackathon**

Let's revolutionize AI compute payments! 🚀

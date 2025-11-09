# 🚀 Quick Start - ParallaxPay

Get ParallaxPay running in **2 minutes** on your Mac Air M1!

## Prerequisites

- Parallax installed (`pip install parallax`)
- Node.js and npm installed
- This repo cloned

## Setup (2 Commands)

### Terminal 1: Start Parallax
```bash
python3 -m parallax.launch \
  --model-path Qwen/Qwen3-0.6B \
  --port 3001 \
  --max-batch-size 8
```

Wait for: `"Ready to serve traffic"` or startup messages

### Terminal 2: Start App
```bash
npm run dev
```

## Demo Flow (Show to Judges)

### 1. Marketplace - Real Provider Discovery (30 seconds)
- Open http://localhost:3000/marketplace
- Click **"🔍 Discover"** button
- Watch console: `✅ Found provider: Parallax Local (45ms)`
- Point out: **Green dot = online, real latency, dynamic pricing**

### 2. Swarm Intelligence - Real Collaboration (1 minute)
- Open http://localhost:3000/swarm
- Click **"🚀 Run Swarm Optimization"**
- Watch console: 5 agents discovering, benchmarking, voting
- Point out: **Real gossip protocol, actual API calls, consensus**

### 3. AI Builder - Natural Language Agent (1 minute)
- Open http://localhost:3000/agent-builder
- Type: `"Find providers with latency under 100ms"`
- Click **"Generate Strategy"**
- Click **"Test Strategy"** (runs real code!)
- Click **"🚀 Deploy Agent"**

### 4. Show the Code (30 seconds)
- Open `lib/real-swarm.ts` in editor
- Point to `parallelDiscovery()` - 5 agents in parallel
- Point to `shareDiscoveries()` - gossip protocol
- Point to `reachConsensus()` - voting with confidence scores

## Key Talking Points

✅ **"Everything is REAL"**
- Not simulated - actual Parallax API calls
- Real latency measurements
- Real agent decisions
- Real swarm collaboration

✅ **"Built for Solana x402"**
- Micropayments for AI inference
- Pay per token, no subscriptions
- x402 protocol integration

✅ **"Swarm Intelligence"**
- 5 agents with different strategies
- Gossip protocol for knowledge sharing
- Consensus voting
- Distributed decision making

## Troubleshooting

**"No providers available"**
→ Check Terminal 1 - Is Parallax running?
→ Check port 3001: `lsof -i :3001`

**"Model downloading"**
→ First run takes time (model download)
→ Wait 1-2 minutes, then click "Discover" again

**"Slow performance"**
→ Normal on Mac Air M1
→ Close other apps
→ First inference is slowest (loading)

## What Makes This Win

1. **Real Execution** - Not faked, judges can verify
2. **Swarm Intelligence** - Actual distributed AI
3. **Beautiful UI** - Bloomberg Terminal aesthetic
4. **x402 Integration** - Real Solana payments
5. **Works on M1** - Demo-ready on limited hardware

---

**Need detailed docs?** See `REAL_EXECUTION_SETUP.md`

**Ready to demo?** You got this! 🔥

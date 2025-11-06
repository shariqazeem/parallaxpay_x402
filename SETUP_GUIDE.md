# 🚀 ParallaxPay Setup Guide

**Complete guide to run ParallaxPay with REAL Gradient Parallax integration!**

---

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Quick Start (Demo Mode)](#quick-start-demo-mode)
3. [Full Setup (Real Parallax Integration)](#full-setup-real-parallax-integration)
4. [How to Use the App](#how-to-use-the-app)
5. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### For Demo Mode (UI only):
- Node.js 18+
- npm or yarn

### For Real Parallax Integration:
- Node.js 18+
- Python 3.11-3.13
- GPU (NVIDIA) or Apple Silicon (M1/M2/M3)
- At least 8GB VRAM for small models (Qwen-0.6B)
- 16GB+ VRAM for larger models (Llama-3-8B, Qwen-3-7B)

---

## Quick Start (Demo Mode)

**Just want to see the UI? Run this:**

```bash
# 1. Clone the repo
git clone https://github.com/shariqazeem/parallaxpay_x402
cd parallaxpay_x402

# 2. Install dependencies
npm install

# 3. Run the app
npm run dev

# 4. Open your browser
# - http://localhost:3000              (Landing Page)
# - http://localhost:3000/marketplace  (Trading Terminal)
# - http://localhost:3000/agents       (Agent Dashboard)
```

**That's it!** You'll see the beautiful UI with demo data.

---

## Full Setup (Real Parallax Integration)

### Step 1: Install Gradient Parallax

Choose your operating system:

#### **macOS (Apple Silicon)**

```bash
# Clone Parallax
git clone https://github.com/GradientHQ/parallax.git
cd parallax

# Create virtual environment
python3 -m venv ./venv
source ./venv/bin/activate

# Install for Mac
pip install -e '.[mac]'

# Grant network permissions
# System Settings → Privacy & Security → Local Network
# Enable for Terminal/iTerm/VS Code
```

#### **Linux (NVIDIA GPU)**

```bash
# Clone Parallax
git clone https://github.com/GradientHQ/parallax.git
cd parallax

# Install for GPU
pip install -e '.[gpu]'
```

#### **Windows**

```bash
# Download installer from: https://github.com/GradientHQ/parallax/releases

# Run as administrator
# Right-click Start → Windows Terminal (Admin)

# Install dependencies
parallax install
```

### Step 2: Start Parallax Scheduler

In your Parallax directory:

```bash
# Activate venv (macOS/Linux only)
source ./venv/bin/activate  # or: .\venv\Scripts\activate on Windows

# Start scheduler with web UI
parallax run --host 0.0.0.0

# Or start without UI (faster)
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0
```

You should see:
```
🚀 Parallax scheduler running at http://localhost:3001
✨ Scheduler ID: 12D3KooW...
```

**Keep this terminal open!**

### Step 3: Connect Worker Nodes (Optional)

If you have multiple GPUs/computers, add more nodes:

```bash
# On each additional computer:
parallax join -s <SCHEDULER_ID_FROM_STEP_2>

# Example:
parallax join -s 12D3KooWLX7MWuzi1Txa5LyZS4eTQ2tPaJijheH8faHggB9SxnBu
```

### Step 4: Verify Parallax is Running

```bash
# Test the API
curl http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "max_tokens": 100,
    "messages": [{"role": "user", "content": "Hello!"}]
  }'
```

You should get a JSON response with AI-generated text!

### Step 5: Run ParallaxPay

In a **NEW terminal** (keep Parallax running):

```bash
# Go to ParallaxPay directory
cd /path/to/parallaxpay_x402

# Install dependencies
npm install

# Start the app
npm run dev
```

### Step 6: Enable Real Parallax Mode

The app automatically detects if Parallax is running at `http://localhost:3001`.

To manually enable it in your agents:

```typescript
// In your agent code
const agent = new ArbitrageAgent({
  name: 'My Agent',
  strategy: 'arbitrage',
  maxBudget: 1000,
  minReputation: 95,
  maxLatency: 100,
  // ⭐ Enable real Parallax
  useRealParallax: true,
  parallaxSchedulerUrl: 'http://localhost:3001'
})
```

---

## How to Use the App

### 1. Landing Page (/)

**What you'll see:**
- Animated hero section
- Live pricing ticker
- Top provider leaderboard
- How it works guide
- Call to action

**Try this:**
- Click "Enter Marketplace" → Go to trading terminal
- Click "Try Demo" → Go to test payment page
- Scroll down to see all features

### 2. Trading Terminal (/marketplace)

**What you'll see:**
- Live order book (left column)
- Price chart with volume (center)
- Provider list (center-bottom)
- Trade execution panel (right)
- Agent activity panel (left-bottom)

**Try this:**
1. **Order Book**: Watch real-time bid/ask spreads update
2. **Chart**: Switch timeframes (1H, 24H, 7D, 30D)
3. **Provider List**:
   - Sort by price/latency/reputation
   - Filter by region
   - Click a provider to select
4. **Trade Panel**:
   - Enter a prompt
   - Adjust max tokens slider
   - Click "Execute with x402"
5. **Agents**: Watch 3 bots trading automatically

### 3. Agent Dashboard (/agents) ⭐ **THE STAR**

**What you'll see:**
- 3 live autonomous agents:
  - 🎯 Arbitrage Hunter
  - 💰 Cost Optimizer
  - 🐋 Whale Trader
- Real-time trade feed
- Performance metrics
- Live profit tracking
- SDK code example

**Try this:**
1. Watch agents make trades every 3-5 seconds
2. See live trade feed update
3. View profit accumulation
4. Copy SDK code and create your own agent!

**When Parallax is running:**
- Agents will make REAL API calls
- You'll see actual latency
- Real token counts
- Actual inference results

**When Parallax is NOT running:**
- Agents use demo data
- Still looks great for demos!

### 4. Test Payment Page (/test-payment)

**What you'll see:**
- x402 payment tiers
- Wallet connection
- Payment simulation

**Try this:**
1. Connect your Solana wallet (Phantom)
2. Click a tier (Basic/Standard/Premium)
3. See x402 payment request
4. Approve in wallet

---

## Understanding the Data Modes

### Demo Mode (Default)

**When:**
- Parallax is NOT running
- `useRealParallax: false` (or not set)

**What happens:**
- Beautiful UI with mock data
- Simulated trades and prices
- Perfect for presentations!
- No GPU required

**How to tell:**
- Agent trades complete instantly (<100ms)
- Provider names are "ParallaxNode-Alpha", "ParallaxNode-Beta", etc.

### Real Parallax Mode

**When:**
- Parallax scheduler is running at `localhost:3001`
- `useRealParallax: true` in agent config

**What happens:**
- Agents make REAL inference calls
- Actual GPU usage
- Real latency measurements
- Genuine token counts
- True AI responses

**How to tell:**
- Agent trades take 500ms-5000ms (real inference time)
- Provider names are "Parallax-Qwen3-0.6B", "Parallax-Llama-3-8B", etc.
- You can see GPU activity in your system monitor

---

## Recommended Models for Testing

### Small (Fast, Low VRAM):
- `Qwen/Qwen3-0.6B` - 8GB VRAM
- `Qwen/Qwen3-1.7B` - 8GB VRAM

### Medium (Balanced):
- `Qwen/Qwen3-7B` - 16GB VRAM
- `meta-llama/Llama-3.2-3B` - 12GB VRAM

### Large (High Quality):
- `meta-llama/Llama-3.1-8B` - 24GB VRAM
- `Qwen/Qwen2.5-14B` - 32GB VRAM

**Start small!** Use Qwen3-0.6B for testing, then scale up.

---

## Troubleshooting

### Problem: "Parallax scheduler is not running"

**Solution:**
```bash
# Start Parallax
cd /path/to/parallax
source ./venv/bin/activate  # macOS/Linux
parallax run --host 0.0.0.0

# Keep terminal open!
```

### Problem: "Module not found: parallax-client"

**Solution:**
```bash
# Rebuild the app
cd /path/to/parallaxpay_x402
npm run build
```

### Problem: Agents not making real calls

**Check:**
1. Is Parallax running? → `curl http://localhost:3001`
2. Is `useRealParallax: true`? → Check agent config
3. Any errors in console? → Check browser DevTools

### Problem: Out of memory / CUDA errors

**Solution:**
- Use a smaller model (Qwen3-0.6B)
- Close other GPU applications
- Reduce batch size in Parallax config

### Problem: Slow inference (>10 seconds)

**This is normal for:**
- First inference (model loading)
- Large models on limited VRAM
- CPU-only mode (no GPU)

**Speed it up:**
- Use smaller models
- Enable GPU acceleration
- Increase batch size

### Problem: Port 3000 or 3001 already in use

**Solution:**
```bash
# ParallaxPay (Next.js)
PORT=3010 npm run dev

# Parallax scheduler
parallax run --port 3002
```

Update `parallaxSchedulerUrl` in your agent config.

---

## Performance Tips

### For Demos:
1. Use **Demo Mode** (no Parallax needed)
2. Everything looks great, runs fast
3. Perfect for showing judges!

### For Real Testing:
1. Start with **Qwen3-0.6B** (fastest)
2. Use **1 node** initially
3. Enable `useRealParallax: true`
4. Watch agents make real inference calls!

### For Production:
1. Use **multiple GPUs** across nodes
2. Enable **pipeline parallelism**
3. Configure **load balancing**
4. Set up **reputation staking** on Solana

---

## Quick Command Reference

```bash
# ParallaxPay
npm run dev          # Start dev server
npm run build        # Build for production
npm start            # Run production build

# Parallax (macOS/Linux)
source ./venv/bin/activate   # Activate venv
parallax run                 # Start scheduler
parallax join               # Join cluster
parallax chat               # Open chat interface

# Parallax (Windows)
parallax run                # Start scheduler
parallax join               # Join cluster
parallax install            # Install dependencies

# Testing
curl http://localhost:3001                    # Test Parallax
curl http://localhost:3000                    # Test ParallaxPay
curl http://localhost:3001/v1/chat/completions  # Test inference
```

---

## What to Show Judges

**5-Minute Demo Script:**

1. **Start**: "This is ParallaxPay - The NASDAQ of AI Compute"

2. **Landing Page** (30s):
   - Show hero animation
   - Point out live ticker
   - Scroll to leaderboard

3. **Marketplace** (2min):
   - Show live order book
   - Switch chart timeframes
   - Filter providers by region
   - Point out agent panel with live activity

4. **Agent Dashboard** (2min) ⭐ **THE WOW MOMENT**:
   - Show 3 agents trading automatically
   - Watch live trade feed
   - Point out profit tracking
   - Show SDK code example
   - **If Parallax running**: "These are REAL AI inference calls!"
   - **If demo mode**: "Imagine this with real GPU clusters!"

5. **Wrap up** (30s):
   - "Autonomous agents trading AI compute like stocks"
   - "Built on Solana x402 + Gradient Parallax"
   - "Production-ready SDK in 10 lines of code"

---

## Next Steps

**After setup:**
1. ✅ Run the app in demo mode
2. ✅ Show judges the UI
3. ✅ Install Parallax locally
4. ✅ Enable real inference
5. ✅ Watch agents trade with real GPU!

**For hackathon:**
- Record demo video
- Take screenshots
- Deploy to Vercel
- Share GitHub repo

---

**You're ready to WIN! 🏆**

Any issues? Check:
- [Parallax Docs](https://github.com/GradientHQ/parallax)
- [x402 Docs](https://docs.x402.org)
- [Our README](./README_AGENTS.md)

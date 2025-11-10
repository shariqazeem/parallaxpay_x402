# 🚀 ParallaxPay Quick Start Guide

## 🎯 What You Discovered (IMPORTANT!)

The `parallax run -n X` flag does **NOT** auto-spawn workers!

**Wrong assumption:**
```bash
parallax run -n 3  # ❌ This doesn't create 3 workers automatically
```

**Correct setup:**
- Terminal 1: Scheduler (`parallax run`)
- Terminal 2+: Workers (`parallax join`)

---

## ⚡ Quick Start (2 Terminals)

### Terminal 1 - Scheduler:
```bash
./start-parallax-cluster.sh
```

**Wait for:**
```
INFO: Uvicorn running on http://0.0.0.0:3001
```

### Terminal 2 - Worker:
```bash
parallax join --port 3002
```

**Wait for:**
```
Successfully loaded model shard (layers [0-28]), memory usage: 1.400 GB
```

### Test It Works:
```bash
curl http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{"max_tokens":10,"messages":[{"role":"user","content":"Hi"}],"temperature":0.7,"stream":false}'
```

**Expected:** JSON completion (not `{"error":"Server is not ready"}`)

---

## 📊 Architecture Diagram

```
┌─────────────────────────────┐
│   Terminal 1: Scheduler     │
│   parallax run -n 1         │
│   Port: 3001 (HTTP API)     │
└──────────────┬──────────────┘
               │
               │ P2P Connection
               │
┌──────────────▼──────────────┐
│   Terminal 2: Worker        │
│   parallax join --port 3002 │
│   (Loads actual model)      │
└─────────────────────────────┘
```

**Key Points:**
- ✅ Scheduler provides HTTP API (port 3001)
- ✅ Workers load model and do computation
- ✅ Workers connect via P2P (not HTTP)
- ✅ All API requests go to port 3001

---

## 🔧 Adding More Workers

Want 3 workers total? Run in separate terminals:

**Terminal 3:**
```bash
parallax join --port 3003
```

**Terminal 4:**
```bash
parallax join --port 3004
```

Each worker will auto-discover the scheduler and connect!

---

## 🎮 Full Demo Setup

### 1. Start Parallax (2 terminals):

**Terminal 1:**
```bash
./start-parallax-cluster.sh
# Wait for: "Uvicorn running on http://0.0.0.0:3001"
```

**Terminal 2:**
```bash
parallax join --port 3002
# Wait for: "Successfully loaded model shard"
```

### 2. Start the App:

**Terminal 3:**
```bash
npm run dev
```

### 3. Test the Flow:
1. Open `http://localhost:3000`
2. Go to `/marketplace` → See cluster discovered
3. Click "Benchmark All" → All nodes green ✅
4. Go to `/agents` → Deploy an agent
5. Click "Schedule" → Select "Every 1 minute"
6. Watch autonomous execution! 🤖

---

## 🐛 Troubleshooting

### Problem: "Server is not ready"

**Cause:** No workers connected

**Fix:**
```bash
# In a new terminal:
parallax join --port 3002
```

### Problem: curl returns 500 error

**Symptoms:**
```bash
curl http://localhost:3001/v1/chat/completions ...
# Returns 500 Internal Server Error
```

**Cause:** Worker connected but request format wrong

**Fix:** Use the exact format from the Quick Start above (must include `stream: false`)

### Problem: Workers won't connect

**Check scheduler logs for:**
```
Stored scheduler peer id: 12D3KooW...
```

**Then workers should show:**
```
Found scheduler peer id: 12D3KooW...
```

If not matching, restart both.

---

## 📝 Recommended Setup for Hackathon

**Best stability:** 1 scheduler + 1 worker

**Impressive demo:** 1 scheduler + 3 workers

**Commands:**
```bash
# Terminal 1
./start-parallax-cluster.sh

# Terminal 2
parallax join --port 3002

# Terminal 3 (optional)
parallax join --port 3003

# Terminal 4 (optional)
parallax join --port 3004

# Terminal 5 (app)
npm run dev
```

---

## 🏆 For Judges

**What to say:**
> "We're running a distributed Parallax cluster with 1 scheduler and 3 workers.
> All inference requests are load-balanced across workers via the scheduler.
> Payments flow through x402 for every execution. This demonstrates production-ready
> distributed AI infrastructure with micropayments."

**Why it's impressive:**
- ✅ Real distributed compute (not simulated)
- ✅ Proper scheduler-worker architecture
- ✅ Load balancing across multiple workers
- ✅ Production-ready patterns
- ✅ Autonomous agent execution

---

## 📚 Scripts Available

- `./start-parallax-cluster.sh` - Start scheduler (step 1)
- `./start-parallax-multi.sh` - Detailed multi-terminal guide
- `./start-parallax.sh` - Old direct method (single node, no scheduler)

**Recommended:** Use `start-parallax-cluster.sh` + manual `parallax join` commands

---

## ✨ Success Indicators

When everything is working:

- ✅ Scheduler logs show: "Uvicorn running on http://0.0.0.0:3001"
- ✅ Worker logs show: "Successfully loaded model shard"
- ✅ curl returns JSON completion (not errors)
- ✅ App marketplace shows all nodes green
- ✅ Benchmark completes successfully
- ✅ Agents can execute and schedule
- ✅ Live Activity Feed updates in real-time

If all checkboxes pass → You're ready for the hackathon! 🎉

# 🔧 Parallax Troubleshooting Guide

## Issue: 500 Internal Server Error on Inference

### Symptoms:
```
INFO: GET / HTTP/1.1" 200 OK  ✅ Health check works
INFO: POST /v1/chat/completions HTTP/1.1" 500 Internal Server Error  ❌ Inference fails
```

### Root Cause:
The scheduler is online but **workers aren't connected** or model isn't loaded.

---

## Solution 1: Verify Parallax is Running Correctly

### Check your terminal output when you run:
```bash
./start-parallax-cluster.sh
```

**You should see:**
```
🌊 Starting Parallax...
✅ Model loaded: Qwen/Qwen3-0.6B
✅ Worker 1 connected
✅ Worker 2 connected
✅ Worker 3 connected
🚀 Scheduler listening on http://0.0.0.0:3001
```

**If you see errors like:**
- ❌ `KeyError` - Workers failed to connect
- ❌ `No workers connected` - Scheduler has no workers
- ❌ `Model not found` - Model didn't download

---

## Solution 2: Fresh Install

If you're getting errors, try a clean restart:

```bash
# 1. Stop any running Parallax (Ctrl+C in all terminals)

# 2. Clear any cached state
rm -rf ~/.cache/parallax 2>/dev/null || true

# 3. Run the cluster script
./start-parallax-cluster.sh
```

**Wait for these messages before testing:**
- ✅ Model downloaded/loaded
- ✅ Workers connected
- ✅ Scheduler ready

---

## Solution 3: Check What's Actually Running

```bash
# Check if Parallax is listening on port 3001
lsof -i :3001

# Should show:
# COMMAND   PID   USER   FD   TYPE  DEVICE  SIZE/OFF  NODE  NAME
# python3   1234  user   5u   IPv4  0x...   0t0       TCP   *:3001 (LISTEN)
```

If nothing is listening on 3001, Parallax isn't running!

---

## Solution 4: Test Parallax Directly

```bash
# Test with curl
curl -X POST http://localhost:3001/v1/chat/completions \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [{"role": "user", "content": "Hello"}],
    "max_tokens": 10
  }'

# Expected: JSON response with completion
# If you get 500: Workers not connected or model not loaded
```

---

## Solution 5: Run Parallax with Verbose Logging

```bash
# Stop current instance (Ctrl+C)

# Run with more logging
parallax run -m Qwen/Qwen3-0.6B -n 3 --host 0.0.0.0 --log-level debug
```

Look for these in the logs:
- ✅ `Model loaded successfully`
- ✅ `Worker connected: <peer-id>`
- ✅ `Scheduler started on port 3001`

---

## Common Issues & Fixes

### Issue: "No workers connected"
**Cause:** Workers failed to spawn
**Fix:**
```bash
# Try running with just 1 worker first
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0
```

### Issue: "Model download failed"
**Cause:** Network issues or disk space
**Fix:**
```bash
# Check disk space
df -h

# Manually download model
huggingface-cli download Qwen/Qwen3-0.6B
```

### Issue: "KeyError" or "Address already in use"
**Cause:** Old Parallax process still running
**Fix:**
```bash
# Kill old processes
pkill -f parallax

# Wait 5 seconds
sleep 5

# Start fresh
./start-parallax-cluster.sh
```

---

## For the Hackathon:

If you keep getting 500 errors and need a quick fix:

**Option A: Reduce worker count**
```bash
# Edit start-parallax-cluster.sh, change -n 3 to -n 1
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0
```

**Option B: Use direct mode (no scheduler)**
```bash
# This bypasses the scheduler entirely
./start-parallax.sh
```

Then update `lib/real-provider-manager.ts` PARALLAX_CLUSTER.workers to 1.

---

## Verification Checklist

Before running the app, verify:

- [ ] Parallax terminal shows "Scheduler started"
- [ ] Parallax terminal shows "N workers connected"
- [ ] curl test returns valid JSON (not 500)
- [ ] Port 3001 is listening (`lsof -i :3001`)
- [ ] No error messages in Parallax logs

If all checkboxes pass, the app should work! ✅

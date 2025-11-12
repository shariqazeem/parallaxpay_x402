#!/bin/bash

# ParallaxPay - Multi-Terminal Parallax Setup
# This is the CORRECT way to run Parallax based on actual testing

echo "🌊 Parallax Multi-Terminal Setup Guide"
echo "======================================"
echo ""
echo "⚠️  IMPORTANT: You need TWO terminals to run Parallax!"
echo ""
echo "The -n flag in 'parallax run' does NOT auto-spawn workers."
echo "You MUST manually run 'parallax join' in a second terminal."
echo ""
echo "Here's the correct setup:"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 TERMINAL 1 - Scheduler:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --port 3001"
echo ""
echo "  Wait for: 'Uvicorn running on http://0.0.0.0:3001'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 TERMINAL 2 - Worker (loads the model):"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  parallax join --port 3002"
echo ""
echo "  Wait for: 'Successfully loaded model shard'"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📌 TERMINAL 3 (Optional) - More Workers:"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  parallax join --port 3003"
echo "  parallax join --port 3004"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "After both are running, test with:"
echo ""
echo "  curl http://localhost:3001/v1/chat/completions \\"
echo "    -H 'Content-Type: application/json' \\"
echo "    -d '{\"max_tokens\":10,\"messages\":[{\"role\":\"user\",\"content\":\"Hi\"}],\"temperature\":0.7,\"stream\":false}'"
echo ""
echo "Should return a completion (not \"Server is not ready\")"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Press Enter to start Terminal 1 (Scheduler) in this window, or Ctrl+C to exit..."
echo ""

# Kill old processes
pkill -9 parallax 2>/dev/null || true
sleep 2

echo "Starting scheduler..."
echo "After this starts, open a NEW terminal and run: parallax join --port 3002"
echo ""

# Start scheduler
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --port 3001

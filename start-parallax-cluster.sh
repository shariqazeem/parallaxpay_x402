#!/bin/bash

# ParallaxPay - Parallax Scheduler (Step 1 of 2)
# This starts the scheduler. You MUST run workers in separate terminals!

echo "🚀 Starting Parallax Scheduler (Step 1 of 2)"
echo "=============================================="
echo ""
echo "⚠️  IMPORTANT: This only starts the SCHEDULER!"
echo ""
echo "After this starts, you MUST open a NEW terminal and run:"
echo ""
echo "  parallax join --port 3002"
echo ""
echo "The scheduler alone will return 'Server is not ready'"
echo "You need at least 1 worker to actually run inference!"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
read -p "Press Enter to start scheduler, or Ctrl+C to use the multi-terminal guide (./start-parallax-multi.sh)..."
echo ""

# Kill any old Parallax processes to avoid conflicts
echo "Cleaning up old processes..."
pkill -9 parallax 2>/dev/null || true
sleep 2

echo ""
echo "Starting Parallax Scheduler on port 3001..."
echo "Model: Qwen/Qwen3-0.6B"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "⏳ Waiting for scheduler to start..."
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start Parallax scheduler
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --port 3001

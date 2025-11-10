#!/bin/bash

# ParallaxPay - Manual Multi-Node Setup
# Use this ONLY if you want to manually connect workers
# (The simple script ./start-parallax-cluster.sh is recommended)

echo "🌊 Parallax Multi-Terminal Setup"
echo "================================="
echo ""
echo "This script helps you start Parallax with manually joined workers."
echo ""
echo "You'll need to run these commands IN SEPARATE TERMINALS:"
echo ""
echo "📌 TERMINAL 1 - Scheduler:"
echo "  parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --port 3001"
echo ""
echo "Wait for scheduler to fully start (you'll see: 'Scheduler started on...')"
echo ""
echo "📌 TERMINAL 2 - Worker 1:"
echo "  parallax join"
echo ""
echo "📌 TERMINAL 3 - Worker 2 (optional):"
echo "  parallax join"
echo ""
echo "📌 TERMINAL 4 - Worker 3 (optional):"
echo "  parallax join"
echo ""
echo "Workers will auto-discover the local scheduler and connect."
echo ""
echo "⚠️  IMPORTANT:"
echo "  - Wait for each worker to show 'Connected to scheduler' before adding next"
echo "  - If you get errors, just use ./start-parallax-cluster.sh instead"
echo ""
echo "Press Enter to continue or Ctrl+C to cancel..."
read

echo ""
echo "Starting scheduler in THIS terminal..."
echo "After it starts, open new terminals and run: parallax join"
echo ""

# Kill old processes
pkill -9 parallax 2>/dev/null || true
sleep 1

# Start scheduler
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --port 3001

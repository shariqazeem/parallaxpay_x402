#!/bin/bash

# ParallaxPay - Parallax Cluster Startup Script
# Starts a Parallax scheduler with built-in workers

echo "🚀 Starting Parallax Cluster for ParallaxPay"
echo "=============================================="
echo ""
echo "Method: Scheduler with built-in workers (-n flag)"
echo "Model: Qwen/Qwen3-0.6B"
echo "Workers: 1 (can increase with -n 3 if stable)"
echo "API Port: 3001"
echo ""
echo "⚠️  Note: First run will download model (~600MB)"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Kill any old Parallax processes to avoid conflicts
pkill -9 parallax 2>/dev/null || true
sleep 1

# Start Parallax with scheduler + 1 worker
# Use -n 1 for stability (increase to -n 3 if you want more workers)
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --port 3001

echo ""
echo "✅ Parallax cluster started!"
echo "📡 API endpoint: http://localhost:3001"

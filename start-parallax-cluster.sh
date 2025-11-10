#!/bin/bash

# ParallaxPay - Parallax Cluster Startup Script
# Starts a Parallax scheduler with 3 worker nodes

echo "🚀 Starting Parallax Cluster for ParallaxPay"
echo "=============================================="
echo ""
echo "Architecture: 1 Scheduler + 3 Worker Nodes"
echo "Model: Qwen/Qwen3-0.6B"
echo "API Port: 3001"
echo ""
echo "This is the CORRECT way to run Parallax for distributed compute!"
echo ""
echo "Press Ctrl+C to stop"
echo ""

# Start Parallax with scheduler + 3 workers (all in one command)
parallax run -m Qwen/Qwen3-0.6B -n 3 --host 0.0.0.0

echo ""
echo "✅ Parallax cluster started!"
echo "📡 API endpoint: http://localhost:3001"
echo "🔥 Scheduler + 3 workers running"

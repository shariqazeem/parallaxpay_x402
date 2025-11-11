#!/bin/bash

# Parallax Cluster Startup Script
# This runs the proper two-command sequence for Parallax

set -e

echo "🚀 Starting Parallax Cluster..."
echo "================================"

# Upgrade pip and install parallax
echo "📦 Installing Parallax..."
pip install --upgrade pip --quiet
pip install parallax-gradient --quiet

echo "✅ Parallax installed"

# Step 1: Start Parallax server with model
echo "🤖 Starting Parallax server with Qwen/Qwen3-0.6B..."
parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 &
PARALLAX_PID=$!

# Wait for server to initialize
echo "⏳ Waiting for server to initialize..."
sleep 15

# Step 2: Join the cluster
echo "🔗 Joining Parallax cluster..."
parallax join --port 3002 &
JOIN_PID=$!

echo ""
echo "✅ Parallax Cluster Started!"
echo "   Server PID: $PARALLAX_PID"
echo "   Join PID: $JOIN_PID"
echo ""

# Keep container running
wait

#!/bin/bash

# Parallax Cluster Startup Script
# This runs the proper two-command sequence for Parallax

set -e

echo "🚀 Starting Parallax Cluster..."
echo "================================"

# Install system dependencies
echo "📦 Installing dependencies..."
apt-get update -qq
apt-get install -y git --quiet

echo "📦 Cloning and installing Parallax from GitHub..."
pip install --upgrade pip --quiet

# Remove old clone if exists
rm -rf /tmp/parallax

# Clone and install
cd /tmp
git clone https://github.com/GradientHQ/parallax.git
cd parallax

# Install in editable mode (CPU-only for ARM VM)
echo "📦 Installing Parallax (this may take 2-3 minutes)..."
pip install -e . --quiet

echo "✅ Parallax installed"

# Return to working directory
cd /app

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

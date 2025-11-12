#!/bin/bash

# Parallax Cluster Startup Script
# This runs the proper two-command sequence for Parallax

set -e

echo "🚀 Starting Parallax Cluster..."
echo "================================"

# Install system dependencies including Rust for lattica
echo "📦 Installing dependencies..."
apt-get update -qq
apt-get install -y git curl build-essential --quiet

# Install Rust (needed for lattica compilation)
echo "📦 Installing Rust..."
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh -s -- -y --quiet
source $HOME/.cargo/env

echo "📦 Cloning and building Lattica..."
pip install --upgrade pip --quiet
pip install maturin --quiet

# Build lattica from source
cd /tmp
rm -rf /tmp/lattica
git clone https://github.com/GradientHQ/lattica.git
cd lattica/bindings/python
maturin build --release
pip install target/wheels/*.whl

echo "✅ Lattica built and installed"

# Now install Parallax
echo "📦 Installing Parallax..."
cd /tmp
rm -rf /tmp/parallax
git clone https://github.com/GradientHQ/parallax.git
cd parallax

# Install all dependencies (including torch and dijkstar)
echo "📦 Installing Parallax dependencies..."
pip install msgpack safetensors huggingface-hub numpy pyzmq psutil httpx aiohttp uvicorn fastapi pydantic requests click typer rich torch dijkstar --quiet

# Install Parallax
pip install -e . --no-deps --quiet

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

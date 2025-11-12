#!/bin/bash

# Parallax Cluster Startup Script for Linux (SGLang backend)
# MLX is macOS-only, so we use SGLang on Linux

set -e

echo "🚀 Starting Parallax Cluster (Linux/SGLang)..."
echo "================================"

# Install system dependencies including Rust for lattica
echo "📦 Installing dependencies..."
apt-get update -qq
apt-get install -y git curl build-essential python3-dev --quiet

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

# Install all dependencies including SGLang for Linux
echo "📦 Installing Parallax dependencies (SGLang backend)..."
pip install msgpack safetensors huggingface-hub numpy pyzmq psutil httpx aiohttp uvicorn fastapi pydantic requests click typer rich torch dijkstar --quiet

# Install SGLang for GPU inference on Linux
echo "📦 Installing SGLang backend..."
pip install "sglang[all]" --quiet || echo "⚠️ SGLang installation incomplete, will use CPU fallback"

echo "🔧 Patching Parallax for Linux compatibility..."
# Make MLX imports conditional (macOS only)
find /tmp/parallax -type f -name "*.py" -exec sed -i 's/import mlx.core as mx/try:\n    import mlx.core as mx\nexcept ImportError:\n    mx = None  # MLX not available on non-Apple platforms/g' {} \; 2>/dev/null || true

# Patch server_info.py to handle missing MLX gracefully
cat > /tmp/patch_server_info.py << 'EOPATCH'
import sys
import os

server_info_path = "/tmp/parallax/src/parallax/server/server_info.py"
if os.path.exists(server_info_path):
    with open(server_info_path, 'r') as f:
        content = f.read()

    # Replace MLX import with conditional import
    content = content.replace(
        'import mlx.core as mx',
        '''try:
    import mlx.core as mx
    HAS_MLX = True
except ImportError:
    mx = None
    HAS_MLX = False'''
    )

    with open(server_info_path, 'w') as f:
        f.write(content)
    print("✅ Patched server_info.py for Linux")
EOPATCH

python3 /tmp/patch_server_info.py

# Install Parallax
pip install -e . --no-deps --quiet

echo "✅ Parallax installed with Linux patches"

# Return to working directory
cd /app

# Step 1: Start Parallax server with model (CPU mode for now)
echo "🤖 Starting Parallax server with Qwen/Qwen3-0.6B (CPU mode)..."
echo "⚠️ Note: Running in CPU mode. For GPU, ensure CUDA/ROCm drivers are installed"

parallax run -m Qwen/Qwen3-0.6B -n 1 --host 0.0.0.0 --device cpu &
PARALLAX_PID=$!

# Wait for server to initialize
echo "⏳ Waiting for server to initialize..."
sleep 20

# Step 2: Join the cluster
echo "🔗 Joining Parallax cluster..."
parallax join --port 3002 &
JOIN_PID=$!

echo ""
echo "✅ Parallax Cluster Started!"
echo "   Server PID: $PARALLAX_PID"
echo "   Join PID: $JOIN_PID"
echo "   Backend: SGLang (Linux)"
echo "   Device: CPU (change to 'cuda' for GPU)"
echo ""

# Keep container running
wait

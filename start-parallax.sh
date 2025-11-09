#!/bin/bash

# ParallaxPay - Start Parallax Direct Method
# This bypasses the scheduler/worker P2P system and runs Parallax directly

echo "🌊 Starting Gradient Parallax (Direct Method)"
echo "================================================"
echo ""
echo "This will:"
echo "  1. Run Parallax inference engine on port 3001"
echo "  2. Download Qwen3-0.6B model (first time, ~600MB)"
echo "  3. Start API server for your provider agent"
echo ""
echo "Press Ctrl+C to stop"
echo ""

cd "$(dirname "$0")/parallax"

# Activate venv
if [ -d "venv" ]; then
    source venv/bin/activate
else
    echo "❌ Virtual environment not found!"
    echo "Run: python3 -m venv venv && source venv/bin/activate && pip install -e '.[mac]'"
    exit 1
fi

# Run Parallax directly
# Qwen3-0.6B has 28 layers (0-27 inclusive)
python3 src/parallax/launch.py \
  --model-path Qwen/Qwen3-0.6B \
  --max-batch-size 8 \
  --host 0.0.0.0 \
  --start-layer 0 \
  --end-layer 28
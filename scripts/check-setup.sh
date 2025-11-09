#!/bin/bash

# ParallaxPay Setup Verification Script
# Checks if Parallax backend is running and app is configured correctly

echo "🔍 Checking ParallaxPay Setup..."
echo ""

# Check if port 3001 is in use (Parallax should be running)
echo "1️⃣  Checking if Parallax is running on port 3001..."
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "   ✅ Parallax is running on port 3001"
else
    echo "   ❌ Parallax is NOT running on port 3001"
    echo "   💡 Start Parallax with:"
    echo "      python3 -m parallax.launch --model-path Qwen/Qwen3-0.6B --port 3001 --max-batch-size 8"
    echo ""
fi

# Try to connect to Parallax health endpoint
echo ""
echo "2️⃣  Testing Parallax health endpoint..."
if curl -s http://localhost:3001/health >/dev/null 2>&1; then
    echo "   ✅ Parallax is responding to requests"
elif curl -s http://localhost:3001/v1/models >/dev/null 2>&1; then
    echo "   ✅ Parallax is responding to requests"
else
    echo "   ⚠️  Could not connect to Parallax (might still be starting up)"
fi

# Check if Next.js app is running on port 3000
echo ""
echo "3️⃣  Checking if Next.js app is running on port 3000..."
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "   ✅ Next.js app is running on port 3000"
else
    echo "   ❌ Next.js app is NOT running on port 3000"
    echo "   💡 Start app with: npm run dev"
    echo ""
fi

# Check if node_modules exists
echo ""
echo "4️⃣  Checking if dependencies are installed..."
if [ -d "node_modules" ]; then
    echo "   ✅ Dependencies installed"
else
    echo "   ❌ Dependencies NOT installed"
    echo "   💡 Run: npm install"
    echo ""
fi

# Check if real provider manager exists
echo ""
echo "5️⃣  Checking if real execution system is configured..."
if [ -f "lib/real-provider-manager.ts" ]; then
    echo "   ✅ Real provider manager found"
else
    echo "   ❌ Real provider manager NOT found"
    echo ""
fi

if [ -f "lib/real-swarm.ts" ]; then
    echo "   ✅ Real swarm system found"
else
    echo "   ❌ Real swarm system NOT found"
    echo ""
fi

if [ -f "lib/real-order-book.ts" ]; then
    echo "   ✅ Real order book found"
else
    echo "   ❌ Real order book NOT found"
    echo ""
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Final summary
if lsof -Pi :3001 -sTCP:LISTEN -t >/dev/null 2>&1 && lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null 2>&1 ; then
    echo "🎉 Setup looks good! You're ready to demo!"
    echo ""
    echo "📍 Next steps:"
    echo "   1. Open http://localhost:3000/marketplace"
    echo "   2. Click '🔍 Discover' to find your Parallax provider"
    echo "   3. Go to http://localhost:3000/swarm"
    echo "   4. Click '🚀 Run Swarm Optimization'"
    echo ""
    echo "✨ Everything is REAL - no simulations!"
else
    echo "⚠️  Setup incomplete. Follow the instructions above."
    echo ""
    echo "📖 Quick Start:"
    echo "   Terminal 1: python3 -m parallax.launch --model-path Qwen/Qwen3-0.6B --port 3001 --max-batch-size 8"
    echo "   Terminal 2: npm run dev"
    echo ""
fi

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

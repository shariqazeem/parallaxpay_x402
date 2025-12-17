#!/bin/bash
# Quick fix for Docker deployment with Gradient fallback

echo "🔧 Quick Fix for ParallaxPay Docker Deployment"
echo "==============================================="
echo ""

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "📝 Creating .env.production from example..."
    cp .env.production.example .env.production
    echo "✅ Created .env.production"
    echo ""
    echo "⚠️  IMPORTANT: Edit .env.production and add your SOLANA_PRIVATE_KEY!"
    echo "    nano .env.production"
    echo ""
else
    echo "✅ .env.production exists"
fi

# Check if .env exists (docker-compose.linux.yml might read from this)
if [ ! -f .env ]; then
    echo "📝 Creating .env from example..."
    cp .env.example .env
    echo "✅ Created .env"
else
    echo "✅ .env exists"
fi

echo ""
echo "🔍 Checking critical environment variables..."

# Check if GRADIENT_API_KEY is set
if grep -q "^GRADIENT_API_KEY=" .env 2>/dev/null; then
    echo "✅ GRADIENT_API_KEY found in .env"
elif grep -q "^GRADIENT_API_KEY=" .env.production 2>/dev/null; then
    echo "✅ GRADIENT_API_KEY found in .env.production"
else
    echo "⚠️  GRADIENT_API_KEY not found! Adding default..."
    echo "" >> .env
    echo "# Gradient Cloud API" >> .env
    echo "GRADIENT_API_KEY=ak-f5a93640ff449cd3d44457a5be3172d212355e56fdc0709f0bd5d1a042bc0d89" >> .env
    echo "GRADIENT_MODEL=openai/gpt-4o-mini" >> .env
    echo "✅ Added default Gradient API key to .env"
fi

echo ""
echo "🔄 Restarting Docker containers..."
docker-compose -f docker-compose.linux.yml down
docker-compose -f docker-compose.linux.yml up -d

echo ""
echo "⏳ Waiting for app to start..."
sleep 5

echo ""
echo "🔍 Checking app status..."
docker-compose -f docker-compose.linux.yml ps

echo ""
echo "📋 Recent logs:"
docker-compose -f docker-compose.linux.yml logs --tail=30 app

echo ""
echo "==============================================="
echo "✅ Fix applied! Check the logs above."
echo ""
echo "Test your app:"
echo "  curl http://localhost:3000/api/cluster/status"
echo ""
echo "View logs:"
echo "  docker-compose -f docker-compose.linux.yml logs -f app"

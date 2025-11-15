#!/bin/bash
# Quick diagnostic script for Docker deployment issues

echo "🔍 ParallaxPay Docker Diagnostics"
echo "=================================="
echo ""

echo "1️⃣ Checking Container Status..."
docker-compose -f docker-compose.linux.yml ps
echo ""

echo "2️⃣ Checking Environment Variables in Container..."
echo "GRADIENT_API_KEY:"
docker exec parallaxpay-app printenv GRADIENT_API_KEY 2>/dev/null || echo "❌ Not set!"
echo "GRADIENT_MODEL:"
docker exec parallaxpay-app printenv GRADIENT_MODEL 2>/dev/null || echo "❌ Not set!"
echo "SOLANA_PRIVATE_KEY:"
docker exec parallaxpay-app printenv SOLANA_PRIVATE_KEY 2>/dev/null | cut -c1-20 && echo "..." || echo "❌ Not set!"
echo ""

echo "3️⃣ Testing API Endpoints..."
echo "Cluster Status:"
curl -s http://localhost:3000/api/cluster/status | head -20
echo ""

echo "4️⃣ Recent App Logs (last 20 lines)..."
docker-compose -f docker-compose.linux.yml logs --tail=20 app
echo ""

echo "5️⃣ Checking for Gradient mentions in logs..."
docker-compose -f docker-compose.linux.yml logs app 2>&1 | grep -i "gradient\|fallback" | tail -10
echo ""

echo "=================================="
echo "✅ Diagnostics complete!"
echo ""
echo "Next steps:"
echo "1. If GRADIENT_API_KEY is not set, check your .env.production file"
echo "2. If API works, ignore the 'unhealthy' status - it's just the health check"
echo "3. Run: docker-compose -f docker-compose.linux.yml restart app"

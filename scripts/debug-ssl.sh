#!/bin/bash
# SSL Certificate Debug and Fix Script

echo "🔍 Debugging SSL Certificate Issue"
echo "===================================="
echo ""

# Kill any stuck certbot processes
echo "1️⃣ Stopping any stuck certbot processes..."
docker-compose -f docker-compose.linux.yml stop certbot
docker-compose -f docker-compose.linux.yml rm -f certbot

echo ""
echo "2️⃣ Checking if certificate already exists..."
if docker-compose -f docker-compose.linux.yml run --rm certbot certificates 2>/dev/null | grep -q "parallaxpay.online"; then
    echo "✅ Certificate already exists!"
    echo ""
    echo "Certificate details:"
    docker-compose -f docker-compose.linux.yml run --rm certbot certificates

    echo ""
    echo "Since certificate exists, just updating nginx config..."
else
    echo "❌ No certificate found, will request new one"
fi

echo ""
echo "3️⃣ Testing DNS resolution..."
nslookup parallaxpay.online || echo "⚠️  DNS lookup failed"

echo ""
echo "4️⃣ Testing if domain points to this server..."
DOMAIN_IP=$(dig +short parallaxpay.online | head -n1)
SERVER_IP=$(curl -s ifconfig.me)
echo "Domain points to: $DOMAIN_IP"
echo "Server IP is: $SERVER_IP"

if [ "$DOMAIN_IP" = "$SERVER_IP" ]; then
    echo "✅ DNS is correctly configured"
else
    echo "❌ DNS mismatch! Domain doesn't point to this server"
fi

echo ""
echo "5️⃣ Checking if webroot directory exists..."
if docker-compose -f docker-compose.linux.yml exec nginx ls /var/www/certbot 2>/dev/null; then
    echo "✅ Webroot directory exists"
else
    echo "❌ Webroot directory missing"
    echo "Creating it..."
    docker-compose -f docker-compose.linux.yml exec nginx mkdir -p /var/www/certbot
fi

echo ""
echo "6️⃣ Testing if nginx serves ACME challenge..."
docker-compose -f docker-compose.linux.yml exec nginx sh -c 'echo "test" > /var/www/certbot/test.txt'
TEST_URL="http://parallaxpay.online/.well-known/acme-challenge/test.txt"
echo "Testing: $TEST_URL"
if curl -f "$TEST_URL" 2>/dev/null | grep -q "test"; then
    echo "✅ ACME challenge path is accessible"
else
    echo "❌ ACME challenge path not accessible"
    echo "Checking nginx logs:"
    docker-compose -f docker-compose.linux.yml logs nginx | tail -20
fi

echo ""
echo "===================================="
echo "Debug complete!"
echo ""
echo "Next steps:"
echo "1. If certificate exists: Run the simplified setup"
echo "2. If DNS mismatch: Wait for DNS to propagate"
echo "3. If ACME not accessible: Check firewall and nginx config"

#!/bin/bash
# Quick SSL Fix - Use existing cert or request new one

echo "🔧 Quick SSL Fix for ParallaxPay"
echo "================================="
echo ""

# Step 1: Kill stuck certbot
echo "1️⃣ Stopping stuck certbot process..."
docker-compose -f docker-compose.linux.yml stop certbot 2>/dev/null
docker-compose -f docker-compose.linux.yml rm -f certbot 2>/dev/null
pkill -f certbot 2>/dev/null
echo "✅ Cleaned up"

# Step 2: Check if certificate already exists
echo ""
echo "2️⃣ Checking for existing certificate..."
CERT_EXISTS=$(docker-compose -f docker-compose.linux.yml run --rm certbot certificates 2>/dev/null | grep -c "parallaxpay.online")

if [ $CERT_EXISTS -gt 0 ]; then
    echo "✅ Certificate already exists! No need to request new one."
    SKIP_REQUEST=true
else
    echo "❌ No certificate found"
    SKIP_REQUEST=false
fi

# Step 3: Create HTTPS nginx config (works with or without cert)
echo ""
echo "3️⃣ Creating nginx HTTPS configuration..."

cat > nginx/conf.d/app-https.conf << 'EOF'
# HTTP - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name parallaxpay.online www.parallaxpay.online;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}

# HTTPS - Main site
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name parallaxpay.online www.parallaxpay.online;

    ssl_certificate /etc/letsencrypt/live/parallaxpay.online/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/parallaxpay.online/privkey.pem;

    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_prefer_server_ciphers off;

    add_header Strict-Transport-Security "max-age=31536000" always;

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

echo "✅ HTTPS configuration created"

# Step 4: Backup old config
echo ""
echo "4️⃣ Backing up old config..."
mv nginx/conf.d/app-http-simple.conf nginx/conf.d/app-http-simple.conf.backup 2>/dev/null || echo "No old config to backup"

# Step 5: Request certificate if needed
if [ "$SKIP_REQUEST" = false ]; then
    echo ""
    echo "5️⃣ Requesting new certificate..."
    echo "   This may take a minute..."

    # Try with timeout
    timeout 60 docker-compose -f docker-compose.linux.yml run --rm certbot certonly \
      --webroot \
      --webroot-path=/var/www/certbot \
      --email shariqshaukat786@gmail.com \
      --agree-tos \
      --no-eff-email \
      --non-interactive \
      -d parallaxpay.online \
      -d www.parallaxpay.online

    if [ $? -eq 0 ]; then
        echo "✅ Certificate obtained!"
    elif [ $? -eq 124 ]; then
        echo "⚠️  Request timed out - check DNS and firewall"
        echo ""
        echo "Common issues:"
        echo "  1. DNS not propagated yet"
        echo "  2. Port 80 blocked by firewall"
        echo "  3. Nginx not serving /.well-known/ correctly"
        exit 1
    else
        echo "❌ Certificate request failed"
        exit 1
    fi
else
    echo ""
    echo "5️⃣ Skipping certificate request (already exists)"
fi

# Step 6: Restart nginx
echo ""
echo "6️⃣ Restarting nginx..."
docker-compose -f docker-compose.linux.yml restart nginx

echo ""
echo "================================="
echo "✅ SSL Setup Complete!"
echo ""
echo "Test your site:"
echo "  HTTP:  curl -I http://parallaxpay.online"
echo "  HTTPS: curl -I https://parallaxpay.online"
echo ""

# Test HTTPS
echo "Testing HTTPS..."
sleep 3
if curl -k -I https://parallaxpay.online 2>/dev/null | grep -q "200 OK"; then
    echo "✅ HTTPS is working!"
else
    echo "⚠️  HTTPS may not be working yet"
    echo ""
    echo "Check nginx logs:"
    echo "  docker-compose -f docker-compose.linux.yml logs nginx"
fi

#!/bin/bash
# Simple SSL Fix - Use existing certificates

echo "🔐 Simple SSL Fix - Using Existing Certificates"
echo "==============================================="
echo ""

# Check if certificates exist
echo "1️⃣ Checking for existing SSL certificates..."
if [ -d "./certbot/conf/live/parallaxpay.online" ]; then
    echo "✅ Found existing SSL certificates!"
    ls -la ./certbot/conf/live/parallaxpay.online/
else
    echo "❌ No certificates found in ./certbot/conf/"
    echo ""
    echo "Checking Docker volume..."
    if docker-compose -f docker-compose.linux.yml run --rm certbot certificates 2>/dev/null | grep -q "parallaxpay.online"; then
        echo "✅ Certificates exist in Docker volume!"
    else
        echo "❌ No certificates found anywhere"
        echo ""
        echo "Fix the read-only issue first:"
        echo "  sudo chmod -R 755 ./certbot/www"
        echo "  sudo chown -R \$USER:$USER ./certbot/www"
        exit 1
    fi
fi

echo ""
echo "2️⃣ Creating HTTPS nginx configuration..."

# Backup old config
if [ -f "nginx/conf.d/app-http-simple.conf" ]; then
    mv nginx/conf.d/app-http-simple.conf nginx/conf.d/app-http-simple.conf.backup
    echo "✅ Backed up old HTTP config"
fi

# Create HTTPS config
cat > nginx/conf.d/app-https.conf << 'NGINXEOF'
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
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

    # Proxy to Next.js app
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }
}
NGINXEOF

echo "✅ HTTPS nginx config created"

echo ""
echo "3️⃣ Testing nginx configuration..."
docker-compose -f docker-compose.linux.yml exec nginx nginx -t

if [ $? -eq 0 ]; then
    echo "✅ Nginx config is valid"
else
    echo "❌ Nginx config has errors!"
    echo ""
    echo "This probably means certificates don't exist."
    echo "Restoring old config..."
    mv nginx/conf.d/app-http-simple.conf.backup nginx/conf.d/app-http-simple.conf 2>/dev/null
    rm -f nginx/conf.d/app-https.conf
    exit 1
fi

echo ""
echo "4️⃣ Restarting nginx..."
docker-compose -f docker-compose.linux.yml restart nginx

echo ""
echo "5️⃣ Testing HTTPS..."
sleep 3

if curl -k -I https://parallaxpay.online 2>/dev/null | head -1 | grep -q "200"; then
    echo "✅ HTTPS is working!"
    echo ""
    echo "==============================================="
    echo "🎉 SSL Setup Complete!"
    echo ""
    echo "Your site is now available at:"
    echo "  🌐 https://parallaxpay.online"
    echo ""
    echo "HTTP automatically redirects to HTTPS"
    echo ""
    echo "Test it:"
    echo "  curl -I https://parallaxpay.online"
else
    echo "⚠️  HTTPS might not be working yet"
    echo ""
    echo "Check nginx logs:"
    echo "  docker-compose -f docker-compose.linux.yml logs nginx | tail -20"
    echo ""
    echo "Check if certificates exist:"
    echo "  ls -la ./certbot/conf/live/parallaxpay.online/"
fi

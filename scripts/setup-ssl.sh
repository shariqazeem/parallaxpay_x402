#!/bin/bash
# SSL Certificate Setup Script for ParallaxPay

echo "🔐 Setting up SSL certificates for ParallaxPay"
echo "=============================================="
echo ""

# Configuration
DOMAIN="parallaxpay.online"
EMAIL="admin@parallaxpay.online"  # Change this to your email!

echo "📋 Configuration:"
echo "   Domain: $DOMAIN"
echo "   Email: $EMAIL"
echo ""
echo "⚠️  Make sure:"
echo "   1. DNS points to this server"
echo "   2. Port 80 is accessible"
echo "   3. Docker is running"
echo ""
read -p "Continue? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]
then
    exit 1
fi

# Step 1: Request certificate
echo ""
echo "1️⃣ Requesting SSL certificate from Let's Encrypt..."
docker-compose -f docker-compose.linux.yml run --rm certbot certonly \
  --webroot \
  --webroot-path=/var/www/certbot \
  --email $EMAIL \
  --agree-tos \
  --no-eff-email \
  -d $DOMAIN \
  -d www.$DOMAIN

if [ $? -eq 0 ]; then
    echo "✅ Certificate obtained successfully!"
else
    echo "❌ Certificate request failed!"
    exit 1
fi

echo ""
echo "2️⃣ Creating HTTPS nginx configuration..."

# Backup old config
mv nginx/conf.d/app-http-simple.conf nginx/conf.d/app-http-simple.conf.backup 2>/dev/null

# Create HTTPS config
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
        return 301 https://\$host\$request_uri;
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
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
EOF

echo "✅ HTTPS configuration created"

echo ""
echo "3️⃣ Restarting nginx..."
docker-compose -f docker-compose.linux.yml restart nginx

echo ""
echo "=============================================="
echo "✅ SSL Setup Complete!"
echo ""
echo "Your site is now at: https://parallaxpay.online"

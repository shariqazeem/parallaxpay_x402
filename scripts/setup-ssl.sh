#!/bin/bash

# SSL Setup Script for ParallaxPay
set -e

DOMAIN="parallaxpay.online"
EMAIL="your-email@example.com"  # UPDATE THIS!

echo "🔒 Setting up SSL for $DOMAIN"
echo "================================"

# Step 1: Create HTTP-only nginx config for ACME challenge
echo "📝 Creating temporary HTTP config..."
cat > nginx/conf.d/http-only.conf << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name parallaxpay.online www.parallaxpay.online;

    # ACME challenge for Let's Encrypt
    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    # Temporary: proxy everything else to app
    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
EOF

# Step 2: Start nginx
echo "🚀 Starting nginx..."
docker compose up -d nginx

sleep 5

# Step 3: Obtain SSL certificate
echo "🔐 Obtaining SSL certificate..."
docker run --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d $DOMAIN \
    -d www.$DOMAIN

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate obtained!"

    # Step 4: Switch to HTTPS config
    echo "🔄 Switching to HTTPS configuration..."
    rm nginx/conf.d/http-only.conf

    # The app.conf with SSL is already in place
    docker compose restart nginx

    echo ""
    echo "✅ SSL Setup Complete!"
    echo "Your site is now available at:"
    echo "   https://$DOMAIN"
else
    echo "❌ Failed to obtain SSL certificate"
    echo "Keeping HTTP-only configuration"
fi

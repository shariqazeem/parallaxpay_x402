#!/bin/bash

# Quick SSL Setup for ParallaxPay
set -e

DOMAIN="parallaxpay.online"
EMAIL="shariqazeem@example.com"  # Change this!

echo "🔒 Getting SSL Certificate for $DOMAIN"
echo "========================================"

# Make sure nginx is running with HTTP config that serves ACME challenges
echo "📝 Restarting nginx with ACME challenge support..."
docker compose restart nginx
sleep 3

# Create certbot directories
mkdir -p certbot/conf certbot/www

# Get SSL certificate
echo "🔐 Obtaining SSL certificate from Let's Encrypt..."
docker run --rm \
    -v $(pwd)/certbot/conf:/etc/letsencrypt \
    -v $(pwd)/certbot/www:/var/www/certbot \
    certbot/certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

if [ $? -eq 0 ]; then
    echo "✅ SSL certificate obtained!"

    # Enable HTTPS config
    echo "🔄 Enabling HTTPS configuration..."
    mv nginx/conf.d/app-https.conf.disabled nginx/conf.d/app-https.conf 2>/dev/null || true
    rm -f nginx/conf.d/app-http-simple.conf

    # Restart nginx with HTTPS
    docker compose restart nginx

    echo ""
    echo "✅ SSL Setup Complete!"
    echo "Your site is now available at:"
    echo "   https://$DOMAIN"
    echo ""
    echo "HTTP will automatically redirect to HTTPS"
else
    echo "❌ Failed to obtain SSL certificate"
    echo ""
    echo "Common issues:"
    echo "1. DNS not fully propagated - wait a few minutes"
    echo "2. Firewall blocking port 80 - check Oracle Cloud Security List"
    echo "3. Domain not pointing to this server - verify DNS"
    exit 1
fi

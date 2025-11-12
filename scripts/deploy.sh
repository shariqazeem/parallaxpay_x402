#!/bin/bash

# ParallaxPay Deployment Script for Oracle Cloud VM
# Usage: ./deploy.sh

set -e

echo "🚀 ParallaxPay Deployment Script"
echo "=================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="parallaxpay.online"
EMAIL="your-email@example.com"  # Change this to your email
APP_DIR="/home/ubuntu/parallaxpay_x402"

echo -e "${BLUE}📋 Pre-deployment Checklist${NC}"
echo "1. Domain DNS configured? (A record pointing to this server)"
echo "2. Firewall ports opened? (80, 443)"
echo "3. .env.production configured with real values?"
echo ""
read -p "Press Enter to continue or Ctrl+C to abort..."

# Step 1: System Update
echo -e "\n${BLUE}📦 Step 1: Updating system packages...${NC}"
sudo apt-get update -qq

# Step 2: Install Docker if not installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}Docker not found. Installing Docker...${NC}"
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}✓ Docker installed${NC}"
else
    echo -e "${GREEN}✓ Docker already installed${NC}"
fi

# Step 3: Install Docker Compose if not installed
if ! command -v docker-compose &> /dev/null; then
    echo -e "${YELLOW}Docker Compose not found. Installing...${NC}"
    sudo apt-get install -y docker-compose-plugin
    echo -e "${GREEN}✓ Docker Compose installed${NC}"
else
    echo -e "${GREEN}✓ Docker Compose already installed${NC}"
fi

# Step 4: Create necessary directories
echo -e "\n${BLUE}📁 Step 2: Creating directories...${NC}"
mkdir -p nginx/conf.d
mkdir -p certbot/conf
mkdir -p certbot/www
mkdir -p parallax-data
echo -e "${GREEN}✓ Directories created${NC}"

# Step 5: Check environment file
echo -e "\n${BLUE}🔐 Step 3: Checking environment configuration...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${RED}✗ .env.production not found!${NC}"
    echo "Please create .env.production with your configuration."
    exit 1
fi

# Load environment variables
set -a
source .env.production
set +a

if [[ "$NEXT_PUBLIC_SUPABASE_URL" == *"your_supabase"* ]]; then
    echo -e "${YELLOW}⚠️  Warning: .env.production still has placeholder values${NC}"
    echo "Please update .env.production with real Supabase credentials"
    read -p "Continue anyway? (y/N): " confirm
    if [[ $confirm != "y" ]]; then
        exit 1
    fi
fi
echo -e "${GREEN}✓ Environment file found${NC}"

# Step 6: Initial SSL certificate (HTTP only first)
echo -e "\n${BLUE}🔒 Step 4: Setting up initial Nginx (HTTP only)...${NC}"

# Create temporary HTTP-only nginx config
cat > nginx/conf.d/app-http.conf << 'EOF'
server {
    listen 80;
    listen [::]:80;
    server_name parallaxpay.online www.parallaxpay.online;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        proxy_pass http://app:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF

# Step 7: Start services (HTTP only)
echo -e "\n${BLUE}🐳 Step 5: Starting services (HTTP mode)...${NC}"
docker compose up -d nginx certbot
sleep 5
echo -e "${GREEN}✓ Nginx started in HTTP mode${NC}"

# Step 8: Obtain SSL certificate
echo -e "\n${BLUE}🔐 Step 6: Obtaining SSL certificate from Let's Encrypt...${NC}"
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email $EMAIL \
    --agree-tos \
    --no-eff-email \
    -d $DOMAIN \
    -d www.$DOMAIN

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ SSL certificate obtained successfully${NC}"

    # Replace HTTP config with HTTPS config
    rm nginx/conf.d/app-http.conf
    echo -e "${GREEN}✓ Switched to HTTPS configuration${NC}"
else
    echo -e "${RED}✗ Failed to obtain SSL certificate${NC}"
    echo "Please check:"
    echo "1. Domain DNS is correctly pointing to this server"
    echo "2. Firewall allows ports 80 and 443"
    exit 1
fi

# Step 9: Build and start all services
echo -e "\n${BLUE}🏗️  Step 7: Building application...${NC}"
docker compose build app
echo -e "${GREEN}✓ Application built${NC}"

echo -e "\n${BLUE}🚀 Step 8: Starting all services...${NC}"
docker compose down
docker compose up -d

# Wait for services to be ready
echo -e "\n${BLUE}⏳ Waiting for services to start...${NC}"
sleep 15

# Step 10: Check service status
echo -e "\n${BLUE}📊 Step 9: Checking service status...${NC}"
docker compose ps

# Step 11: Final checks
echo -e "\n${BLUE}🔍 Step 10: Running health checks...${NC}"

# Check if app is responding
if curl -k -f http://localhost:3000 > /dev/null 2>&1; then
    echo -e "${GREEN}✓ App is responding on port 3000${NC}"
else
    echo -e "${RED}✗ App is not responding${NC}"
fi

# Check if Nginx is responding
if curl -k -f https://localhost > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Nginx is responding with HTTPS${NC}"
else
    echo -e "${YELLOW}⚠️  Nginx may still be starting...${NC}"
fi

# Display logs
echo -e "\n${BLUE}📝 Recent logs:${NC}"
docker compose logs --tail=20

# Final success message
echo -e "\n${GREEN}=================================="
echo -e "✓ Deployment Complete!"
echo -e "==================================${NC}"
echo ""
echo -e "${BLUE}🌐 Your app should be available at:${NC}"
echo -e "   https://${DOMAIN}"
echo ""
echo -e "${BLUE}📊 Useful commands:${NC}"
echo "   View logs:        docker compose logs -f"
echo "   View app logs:    docker compose logs -f app"
echo "   View all status:  docker compose ps"
echo "   Restart:          docker compose restart"
echo "   Stop:             docker compose down"
echo "   Rebuild:          docker compose up -d --build"
echo ""
echo -e "${BLUE}🔧 Troubleshooting:${NC}"
echo "   If the site doesn't load, check:"
echo "   1. DNS propagation: dig $DOMAIN"
echo "   2. Firewall: sudo ufw status"
echo "   3. Logs: docker compose logs nginx"
echo ""

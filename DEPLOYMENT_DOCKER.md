# ParallaxPay Docker Deployment Guide

Complete guide to deploy ParallaxPay on your Oracle Cloud VM using Docker Compose.

## 📋 Prerequisites

- Oracle Cloud VM running Ubuntu (VM3: 80.225.209.190)
- Domain: parallaxpay.online (configured on GoDaddy)
- Docker installed (you mentioned you have this)
- Root or sudo access

## 🚀 Quick Deployment (5 Steps)

### Step 1: Configure DNS on GoDaddy

1. Log into GoDaddy
2. Go to DNS Management for `parallaxpay.online`
3. Add/Edit A Records:
   ```
   Type: A
   Name: @
   Value: 80.225.209.190
   TTL: 600

   Type: A
   Name: www
   Value: 80.225.209.190
   TTL: 600
   ```
4. Wait 5-10 minutes for DNS propagation

### Step 2: Configure Firewall on Oracle Cloud

SSH into your VM and run:

```bash
# Allow HTTP and HTTPS
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
sudo ufw allow 8000/tcp  # Parallax API
sudo ufw allow 3002/tcp  # Parallax join port
sudo ufw reload

# Also configure Security List in Oracle Cloud Console:
# 1. Go to your VM instance
# 2. Click on the subnet
# 3. Click on the Security List
# 4. Add Ingress Rules:
#    - Port 80 (TCP) from 0.0.0.0/0
#    - Port 443 (TCP) from 0.0.0.0/0
#    - Port 8000 (TCP) from 0.0.0.0/0
#    - Port 3002 (TCP) from 0.0.0.0/0
```

### Step 3: Clone and Configure

```bash
# Clone your repository
cd ~
git clone https://github.com/shariqazeem/parallaxpay_x402.git
cd parallaxpay_x402

# Checkout the deployment branch
git checkout claude/oracle-agent-deployment-011CV2j64FAb1DxTLJJx72pn

# Copy and edit environment file
cp .env.production .env.production.local
nano .env.production

# Update these values:
# - NEXT_PUBLIC_SUPABASE_URL (your Supabase URL)
# - NEXT_PUBLIC_SUPABASE_ANON_KEY (your Supabase key)
# - Change any other values as needed
```

### Step 4: Run Deployment Script

```bash
# Make deployment script executable
chmod +x deploy.sh

# Edit the EMAIL in deploy.sh
nano deploy.sh
# Change: EMAIL="your-email@example.com"
# To: EMAIL="your-actual-email@example.com"

# Run deployment
./deploy.sh
```

The script will:
1. ✅ Update system packages
2. ✅ Install Docker & Docker Compose (if needed)
3. ✅ Create necessary directories
4. ✅ Configure Nginx for HTTP
5. ✅ Obtain SSL certificate from Let's Encrypt
6. ✅ Build Next.js application
7. ✅ Start Parallax cluster
8. ✅ Start all services with HTTPS

### Step 5: Verify Deployment

```bash
# Check all services are running
docker compose ps

# Should show:
# - parallaxpay-app (running)
# - parallaxpay-parallax (running)
# - parallaxpay-nginx (running)
# - parallaxpay-certbot (running)

# Check logs
docker compose logs -f app

# Test the website
curl https://parallaxpay.online
```

Visit: **https://parallaxpay.online** 🎉

## 🏗️ Architecture

```
                                    ┌─────────────────┐
                                    │   GoDaddy DNS   │
                                    │ parallaxpay.    │
                                    │    online       │
                                    └────────┬────────┘
                                             │
                                             ▼
                                    ┌─────────────────┐
                        ┌───────────│  Oracle Cloud   │
                        │           │   VM (80.x.x.x) │
                        │           └─────────────────┘
                        │
                        ▼
        ┌───────────────────────────────────────┐
        │         Docker Compose                │
        │                                       │
        │  ┌─────────────┐  ┌─────────────┐   │
        │  │   Nginx     │  │  Certbot    │   │
        │  │  (80/443)   │  │   (SSL)     │   │
        │  └──────┬──────┘  └─────────────┘   │
        │         │                             │
        │         ├───────────┬─────────────┐  │
        │         ▼           ▼             ▼  │
        │  ┌─────────┐ ┌──────────┐ ┌──────┐  │
        │  │Next.js  │ │ Parallax │ │ API  │  │
        │  │  App    │ │ Cluster  │ │      │  │
        │  │ (3000)  │ │ (8000)   │ │(3002)│  │
        │  └─────────┘ └──────────┘ └──────┘  │
        └───────────────────────────────────────┘
```

## 🔧 Management Commands

### View Logs
```bash
# All services
docker compose logs -f

# Specific service
docker compose logs -f app
docker compose logs -f parallax
docker compose logs -f nginx

# Last 100 lines
docker compose logs --tail=100
```

### Restart Services
```bash
# Restart all
docker compose restart

# Restart specific service
docker compose restart app
docker compose restart parallax
```

### Update Application
```bash
# Pull latest changes
git pull origin claude/oracle-agent-deployment-011CV2j64FAb1DxTLJJx72pn

# Rebuild and restart
docker compose up -d --build app

# Or restart everything
docker compose down
docker compose up -d --build
```

### Stop Services
```bash
# Stop all services
docker compose down

# Stop and remove volumes
docker compose down -v
```

### Monitor Resources
```bash
# Docker stats
docker stats

# Check disk usage
docker system df

# Clean up unused resources
docker system prune -a
```

## 🐛 Troubleshooting

### Issue: Website not loading

**Check DNS propagation:**
```bash
dig parallaxpay.online
nslookup parallaxpay.online
```

**Check Nginx:**
```bash
docker compose logs nginx
curl -v http://localhost
```

**Check firewall:**
```bash
sudo ufw status
sudo iptables -L -n
```

### Issue: SSL certificate failed

**Retry certificate:**
```bash
docker compose run --rm certbot certonly \
    --webroot \
    --webroot-path=/var/www/certbot \
    --email your-email@example.com \
    --agree-tos \
    --no-eff-email \
    --force-renewal \
    -d parallaxpay.online \
    -d www.parallaxpay.online

docker compose restart nginx
```

### Issue: App container crashing

**Check logs:**
```bash
docker compose logs app
```

**Check environment:**
```bash
docker compose exec app env | grep NEXT_PUBLIC
```

**Rebuild:**
```bash
docker compose up -d --build app
```

### Issue: Parallax not starting

**Check logs:**
```bash
docker compose logs parallax
```

**Restart Parallax:**
```bash
docker compose restart parallax
```

**Check if model is downloading:**
```bash
docker compose exec parallax ls -lh /root/.cache/huggingface
```

### Issue: Out of disk space

**Check disk usage:**
```bash
df -h
docker system df
```

**Clean up:**
```bash
docker system prune -a --volumes
docker compose down -v
docker volume prune
```

## 📊 Monitoring

### Check Service Health
```bash
# All containers
docker compose ps

# Check if app is responding
curl -k https://parallaxpay.online

# Check Parallax API
curl http://localhost:8000/health
```

### Resource Usage
```bash
# Real-time stats
docker stats

# Container resource limits
docker compose config
```

## 🔐 Security

### SSL Certificate Renewal

Certbot automatically renews certificates. To manually renew:

```bash
docker compose run --rm certbot renew
docker compose restart nginx
```

### Environment Variables

Never commit `.env.production` with real values. Keep it on the server only:

```bash
# Back up (encrypted)
tar -czf env-backup.tar.gz .env.production
# Store securely off-server
```

### Firewall

Only allow necessary ports:
```bash
sudo ufw status numbered
sudo ufw delete [number]  # Remove unnecessary rules
```

## 📈 Performance Optimization

### Enable Caching
Add to `nginx/conf.d/app.conf`:
```nginx
location /_next/static/ {
    proxy_pass http://app:3000;
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

### Increase Worker Connections
Edit `nginx/nginx.conf`:
```nginx
events {
    worker_connections 2048;  # Increase from 1024
}
```

### Scale Parallax
Increase node count in `docker-compose.yml`:
```yaml
command: parallax run -m Qwen/Qwen3-0.6B -n 2 --host 0.0.0.0
```

## 🎯 Production Checklist

- [ ] DNS configured and propagated
- [ ] Firewall rules configured
- [ ] `.env.production` with real values
- [ ] SSL certificate obtained
- [ ] All services running
- [ ] Website accessible via HTTPS
- [ ] Parallax cluster operational
- [ ] Monitoring set up
- [ ] Backups configured
- [ ] Auto-updates disabled (for stability)

## 🆘 Emergency Procedures

### Complete Reset
```bash
docker compose down -v
docker system prune -a
rm -rf certbot/conf/*
git pull origin claude/oracle-agent-deployment-011CV2j64FAb1DxTLJJx72pn
./deploy.sh
```

### Quick Rollback
```bash
git log --oneline
git reset --hard [previous-commit-hash]
docker compose up -d --build
```

---

## 📞 Support

If you encounter issues:

1. Check logs: `docker compose logs -f`
2. Verify DNS: `dig parallaxpay.online`
3. Check firewall: `sudo ufw status`
4. Review this guide's troubleshooting section

Good luck with your deployment! 🚀

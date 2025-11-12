# 🚀 Deployment Guide - Oracle Cloud VM + Custom Domain

**Deploy ParallaxPay to production in 30 minutes for hackathon submission**

---

## 📋 Prerequisites

- [ ] Oracle Cloud account (free tier works)
- [ ] Domain name purchased (Namecheap, GoDaddy, etc.)
- [ ] GitHub repository ready
- [ ] Supabase project set up
- [ ] Environment variables documented

---

## ⚡ Quick Deployment (30 Minutes)

### **Step 1: Create Oracle Cloud VM** (5 minutes)

1. **Login to Oracle Cloud**
   - Go to https://cloud.oracle.com
   - Sign in to your account

2. **Create Compute Instance**
   ```
   Navigation: Compute → Instances → Create Instance

   Configuration:
   - Name: parallaxpay-production
   - Image: Ubuntu 22.04
   - Shape: VM.Standard.E2.1.Micro (Free Tier - 1 OCPU, 1GB RAM)
   - Network: Create new VCN (default settings)
   - Add SSH Key: Generate new or upload your public key
   - Boot Volume: 50GB (free tier max)
   ```

3. **Configure Network Security**
   ```
   Navigation: Your Instance → Attached VCNs → Security Lists → Default Security List

   Add Ingress Rules:
   - Source: 0.0.0.0/0, Protocol: TCP, Port: 80 (HTTP)
   - Source: 0.0.0.0/0, Protocol: TCP, Port: 443 (HTTPS)
   - Source: 0.0.0.0/0, Protocol: TCP, Port: 3000 (Next.js dev - temporary)
   ```

4. **Note Your Public IP**
   ```
   Copy the Public IP address from instance details
   Example: 123.45.67.89
   ```

---

### **Step 2: Configure Domain DNS** (5 minutes)

1. **Login to Domain Registrar**
   - Namecheap / GoDaddy / etc.

2. **Add A Record**
   ```
   Type: A Record
   Host: @
   Value: [Your Oracle Cloud VM Public IP]
   TTL: Automatic or 5 minutes

   Example:
   @ → 123.45.67.89
   ```

3. **Add WWW Subdomain (Optional)**
   ```
   Type: A Record
   Host: www
   Value: [Your Oracle Cloud VM Public IP]
   TTL: Automatic

   Example:
   www → 123.45.67.89
   ```

4. **Wait for DNS Propagation**
   - Usually takes 5-30 minutes
   - Check: `nslookup yourdomain.com`

---

### **Step 3: SSH Into VM and Setup Environment** (10 minutes)

1. **SSH Connection**
   ```bash
   ssh ubuntu@YOUR_PUBLIC_IP

   # If using Oracle Cloud generated key:
   ssh -i ~/.ssh/oracle_cloud_key ubuntu@YOUR_PUBLIC_IP
   ```

2. **Update System**
   ```bash
   sudo apt update && sudo apt upgrade -y
   ```

3. **Install Node.js 18+**
   ```bash
   # Install Node Version Manager
   curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash

   # Reload shell
   source ~/.bashrc

   # Install Node.js 18
   nvm install 18
   nvm use 18
   nvm alias default 18

   # Verify
   node --version  # Should show v18.x.x
   npm --version
   ```

4. **Install PM2 (Process Manager)**
   ```bash
   npm install -g pm2
   ```

5. **Install Git**
   ```bash
   sudo apt install git -y
   ```

6. **Install Nginx (for reverse proxy)**
   ```bash
   sudo apt install nginx -y
   ```

---

### **Step 4: Clone and Setup Application** (5 minutes)

1. **Clone Repository**
   ```bash
   cd ~
   git clone https://github.com/shariqazeem/parallaxpay_x402.git
   cd parallaxpay_x402
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Create Environment File**
   ```bash
   nano .env.local
   ```

   **Add these variables:**
   ```bash
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

   # Parallax (if using real API)
   PARALLAX_API_KEY=your_parallax_key

   # x402
   NEXT_PUBLIC_X402_ENABLED=true

   # Optional: Server-side Oracle wallet (for autonomous mode)
   ORACLE_PRIVATE_KEY=your_solana_private_key_base58
   ```

   Save: `Ctrl+X`, then `Y`, then `Enter`

4. **Build Application**
   ```bash
   npm run build
   ```

5. **Test Locally**
   ```bash
   npm start

   # Visit http://YOUR_PUBLIC_IP:3000
   # Should see your app running!
   ```

---

### **Step 5: Configure Nginx Reverse Proxy** (3 minutes)

1. **Create Nginx Config**
   ```bash
   sudo nano /etc/nginx/sites-available/parallaxpay
   ```

   **Paste this configuration:**
   ```nginx
   server {
       listen 80;
       server_name yourdomain.com www.yourdomain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
           proxy_set_header X-Real-IP $remote_addr;
           proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
           proxy_set_header X-Forwarded-Proto $scheme;
       }
   }
   ```

   **Replace:** `yourdomain.com` with your actual domain

   Save: `Ctrl+X`, then `Y`, then `Enter`

2. **Enable Site**
   ```bash
   sudo ln -s /etc/nginx/sites-available/parallaxpay /etc/nginx/sites-enabled/
   sudo rm /etc/nginx/sites-enabled/default  # Remove default site
   ```

3. **Test and Reload Nginx**
   ```bash
   sudo nginx -t  # Should say "syntax is ok"
   sudo systemctl reload nginx
   ```

---

### **Step 6: Setup PM2 for Auto-Restart** (2 minutes)

1. **Start App with PM2**
   ```bash
   cd ~/parallaxpay_x402
   pm2 start npm --name "parallaxpay" -- start
   ```

2. **Configure Auto-Start on Reboot**
   ```bash
   pm2 startup
   # Copy and run the command it gives you (starts with 'sudo env...')

   pm2 save
   ```

3. **Verify**
   ```bash
   pm2 status
   # Should show "parallaxpay" as "online"
   ```

---

### **Step 7: Add SSL Certificate (HTTPS)** (5 minutes)

1. **Install Certbot**
   ```bash
   sudo apt install certbot python3-certbot-nginx -y
   ```

2. **Get SSL Certificate**
   ```bash
   sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com

   # Follow prompts:
   # - Enter email
   # - Agree to terms
   # - Choose option 2: Redirect HTTP to HTTPS (recommended)
   ```

3. **Auto-Renewal Setup**
   ```bash
   sudo certbot renew --dry-run
   # Should succeed without errors
   ```

4. **Test HTTPS**
   ```
   Visit: https://yourdomain.com
   Should show green padlock 🔒
   ```

---

## ✅ Verification Checklist

**After deployment, verify everything works:**

- [ ] **HTTP redirects to HTTPS** - Visit http://yourdomain.com → should redirect
- [ ] **Homepage loads** - See ParallaxPay landing page
- [ ] **Wallet connects** - Phantom wallet connection works
- [ ] **Oracle page works** - Navigate to /oracle, run a prediction
- [ ] **Supabase connected** - Predictions save and reload on page refresh
- [ ] **All pages accessible** - /agents, /marketplace, /analytics, /transactions
- [ ] **Mobile responsive** - Check on phone or browser dev tools
- [ ] **No console errors** - Open browser console, check for errors

---

## 🔧 Useful Commands

### **View Logs**
```bash
# PM2 logs
pm2 logs parallaxpay

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### **Restart Application**
```bash
# After making changes
cd ~/parallaxpay_x402
git pull  # Pull latest changes
npm install  # Install new dependencies
npm run build  # Rebuild
pm2 restart parallaxpay
```

### **Monitor Performance**
```bash
pm2 monit  # Real-time monitoring
htop  # System resources
```

### **Update DNS**
```bash
# If you change IP address
nslookup yourdomain.com  # Check current DNS
```

---

## 🐛 Troubleshooting

### **Issue: Can't access website**
```bash
# Check if Nginx is running
sudo systemctl status nginx

# Check if app is running
pm2 status

# Check firewall
sudo ufw status  # Should allow 80, 443
```

### **Issue: "502 Bad Gateway"**
```bash
# App not running - restart PM2
pm2 restart parallaxpay

# Check PM2 logs for errors
pm2 logs parallaxpay --lines 100
```

### **Issue: "Certificate not valid"**
```bash
# Re-run Certbot
sudo certbot --nginx -d yourdomain.com -d www.yourdomain.com --force-renewal
```

### **Issue: Out of memory**
```bash
# Free tier has limited RAM
# Reduce build processes
export NODE_OPTIONS="--max-old-space-size=768"
npm run build

# Or use swap
sudo fallocate -l 2G /swapfile
sudo chmod 600 /swapfile
sudo mkswap /swapfile
sudo swapon /swapfile
```

---

## 📊 Performance Optimization (Optional)

### **Enable Gzip Compression**
```bash
sudo nano /etc/nginx/nginx.conf

# Add inside http block:
gzip on;
gzip_vary on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

sudo systemctl reload nginx
```

### **Add Caching Headers**
```bash
sudo nano /etc/nginx/sites-available/parallaxpay

# Add inside location block:
location /_next/static {
    proxy_pass http://localhost:3000;
    proxy_cache_valid 200 60m;
    add_header Cache-Control "public, max-age=3600";
}
```

---

## 🔐 Security Hardening (Optional but Recommended)

### **Setup UFW Firewall**
```bash
sudo ufw allow 22/tcp  # SSH
sudo ufw allow 80/tcp  # HTTP
sudo ufw allow 443/tcp  # HTTPS
sudo ufw enable
```

### **Change SSH Port (Optional)**
```bash
sudo nano /etc/ssh/sshd_config
# Change: Port 22 → Port 2222
sudo systemctl restart sshd

# Update firewall
sudo ufw allow 2222/tcp
sudo ufw delete allow 22/tcp
```

### **Disable Root Login**
```bash
sudo nano /etc/ssh/sshd_config
# Change: PermitRootLogin yes → PermitRootLogin no
sudo systemctl restart sshd
```

---

## 📝 Submission Checklist

**Before submitting:**

- [ ] Domain is accessible via HTTPS
- [ ] All features work on production
- [ ] Demo video recorded showing live deployment
- [ ] README updated with deployment URL
- [ ] Submission form filled with:
  - [ ] Deployment URL: https://yourdomain.com
  - [ ] GitHub repo: https://github.com/shariqazeem/parallaxpay_x402
  - [ ] Demo video: [YouTube/Loom link]
  - [ ] Track: Parallax Eco Track

---

## 🎯 Quick Reference

**Your Production URLs:**
- **Main Site:** https://yourdomain.com
- **Oracle:** https://yourdomain.com/oracle
- **Agents:** https://yourdomain.com/agents
- **Analytics:** https://yourdomain.com/analytics
- **Marketplace:** https://yourdomain.com/marketplace

**Server Access:**
```bash
ssh ubuntu@YOUR_PUBLIC_IP
cd ~/parallaxpay_x402
pm2 logs parallaxpay
```

---

## ⏱️ Timeline Estimate

| Task | Time |
|------|------|
| Create Oracle Cloud VM | 5 min |
| Configure DNS | 5 min |
| SSH and install dependencies | 10 min |
| Clone and build app | 5 min |
| Configure Nginx | 3 min |
| Setup PM2 | 2 min |
| Add SSL certificate | 5 min |
| **TOTAL** | **~35 minutes** |

*DNS propagation may add 5-30 minutes wait time*

---

## 🚀 You're Live!

**After deployment, share these in your submission:**

1. **Deployment URL:** https://yourdomain.com
2. **Demo video with live site:** [Record using actual deployment]
3. **GitHub repo:** https://github.com/shariqazeem/parallaxpay_x402

**Judges will appreciate:**
- ✅ Live, working deployment (not just localhost)
- ✅ HTTPS with valid certificate
- ✅ Fast loading times
- ✅ No errors in production

---

**NOW GO DEPLOY AND WIN! 🏆**

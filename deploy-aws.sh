#!/bin/bash
# ====================================================================
# 1-Click Automated AWS Deployment Script for Reviewly Platform
# Tested on Ubuntu 22.04 / 24.04 LTS (Amazon Lightsail or EC2)
# ====================================================================

set -e

echo "🚀 Starting Reviewly AWS Deployment Setup..."

# 1. Update OS packages
sudo apt-get update -y
sudo apt-get upgrade -y
sudo apt-get install -y curl git nginx ufw

# 2. Install Node.js 20 LTS (if not installed)
if ! command -v node &> /dev/null; then
    echo "📦 Installing Node.js 20 LTS..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt-get install -y nodejs
fi

echo "Node version: $(node -v)"
echo "NPM version: $(npm -v)"

# 3. Install PM2 Process Manager globally
sudo npm install -g pm2

# 4. Install Project Dependencies & Build
echo "📦 Installing project packages..."
npm install
npm install --prefix backend
npm install --prefix frontend

echo "🔨 Building frontend and backend for production..."
npm run build --prefix frontend
npm run build --prefix backend

# 5. Copy or link Nginx configuration
echo "🌐 Configuring Nginx reverse proxy..."
if [ -f "nginx.conf" ]; then
    sudo cp nginx.conf /etc/nginx/sites-available/reviewly
    sudo ln -sf /etc/nginx/sites-available/reviewly /etc/nginx/sites-enabled/default
    sudo nginx -t
    sudo systemctl restart nginx
fi

# 6. Configure Firewall (allow HTTP, HTTPS, SSH)
sudo ufw allow 'Nginx Full'
sudo ufw allow 22/tcp
sudo ufw --force enable || true

# 7. Start application via PM2
echo "⚡ Starting Reviewly application with PM2..."
pm2 delete reviewly-api || true
pm2 start backend/dist/server.js --name "reviewly-api" --time

# Save PM2 process list and configure to resurrect on server reboot
pm2 save
pm2 startup | tail -n 1 | bash || true

echo "===================================================="
echo "🎉 Reviewly is successfully deployed on AWS!"
echo "Server is running on port 4000 (proxied via Nginx port 80)."
echo "===================================================="

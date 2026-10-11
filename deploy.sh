#!/usr/bin/env bash
# ====================================================================
# Automated CI/CD Continuous Deployment Script for KindlyReview
# Invoked automatically by GitHub Actions upon commits or push to main
# ====================================================================
set -e

echo "=========================================================="
echo "🚀 [CI/CD] Starting KindlyReview Automated Deployment"
echo "📅 Timestamp: $(date)"
echo "=========================================================="

APP_DIR="/var/www/kindlyreview"
cd "$APP_DIR"

# Configure safe git directory
git config --global --add safe.directory "$APP_DIR"

# 1. Pull latest code from GitHub
echo "📥 1. Pulling latest code from origin main..."
git fetch origin main
git reset --hard origin/main

# 2. Build Backend
echo "⚙️ 2. Building backend..."
cd "$APP_DIR/backend"
npm install --no-audit --no-fund
npm run build

# 3. Build Frontend
echo "🎨 3. Building frontend..."
cd "$APP_DIR/frontend"
npm install --no-audit --no-fund
npm run build

# 4. Restart PM2 Process
echo "🔄 4. Reloading API process in PM2..."
cd "$APP_DIR/backend"
pm2 restart kindlyreview-api --update-env || pm2 start dist/server.js --name kindlyreview-api --cwd "$APP_DIR/backend"
pm2 save

# 5. Reload Nginx
echo "🌐 5. Reloading Nginx..."
sudo systemctl reload nginx

# 6. Verify Health Check
echo "🩺 6. Verifying API health check..."
sleep 2
HEALTH=$(curl -s http://localhost:4000/api/health || echo '{"status":"error"}')
echo "API Health Response: $HEALTH"

echo "=========================================================="
echo "🎉 [CI/CD] Deployment complete! Live at http://16.176.211.119"
echo "=========================================================="

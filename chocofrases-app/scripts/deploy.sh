#!/bin/bash
# ============================================================
# Chocofrases Deployment Script
# Run on the VPS after cloning the repo
# ============================================================
set -e

DOMAIN="YOURDOMAIN.com.ar"
EMAIL="admin@chocofrases.com.ar"

echo "==> Updating system..."
apt-get update -qq && apt-get install -y docker.io docker-compose-plugin certbot python3-certbot-nginx

echo "==> Copying .env file..."
if [ ! -f .env ]; then
  cp .env.example .env
  echo "IMPORTANT: Edit .env with your real credentials before continuing!"
  exit 1
fi

echo "==> Requesting SSL certificates..."
certbot certonly --standalone \
  -d "$DOMAIN" -d "www.$DOMAIN" \
  -d "api.$DOMAIN" \
  -d "panel.$DOMAIN" \
  --email "$EMAIL" --agree-tos --non-interactive

echo "==> Replacing domain in nginx config..."
sed -i "s/YOURDOMAIN.com.ar/$DOMAIN/g" nginx/nginx.conf

echo "==> Building and starting containers..."
docker compose up -d --build

echo "==> Setting up auto-renew for SSL..."
(crontab -l 2>/dev/null; echo "0 12 * * * /usr/bin/certbot renew --quiet && docker compose -f $(pwd)/docker-compose.yml restart nginx") | crontab -

echo ""
echo "==> Deployment complete!"
echo "Landing page:  https://$DOMAIN"
echo "Dashboard:     https://panel.$DOMAIN"
echo "API:           https://api.$DOMAIN"
echo ""
echo "Default admin login:"
echo "  Email:    admin@chocofrases.com.ar"
echo "  Password: changeme123 (CHANGE THIS IMMEDIATELY)"

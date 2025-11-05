#!/bin/bash

# AWS EC2 Deployment Script
# This script should be run on the EC2 instance

set -e

echo "Starting deployment..."

# Navigate to application directory
APP_DIR="/home/ubuntu/kitaab-backend"

# Create directory if it doesn't exist
mkdir -p $APP_DIR
cd $APP_DIR

# Pull latest code (assuming git is set up)
if [ -d .git ]; then
  echo "Pulling latest code..."
  git pull origin main || git pull origin master
else
  echo "Git repository not found. Please set up git manually."
  exit 1
fi

# Install/update dependencies
echo "Installing dependencies..."
npm ci --production

# Restart the application using PM2 (if installed) or systemd
if command -v pm2 &> /dev/null; then
  echo "Restarting application with PM2..."
  if [ -f ecosystem.config.js ]; then
    pm2 restart ecosystem.config.js || pm2 start ecosystem.config.js --env production
  else
    pm2 restart kitaab-backend || pm2 start src/index.js --name kitaab-backend
  fi
  pm2 save
elif systemctl is-active --quiet kitaab-backend.service; then
  echo "Restarting application with systemd..."
  sudo systemctl restart kitaab-backend
else
  echo "No process manager found. Please start the application manually:"
  echo "  cd $APP_DIR && npm start"
fi

echo "Deployment completed successfully!"


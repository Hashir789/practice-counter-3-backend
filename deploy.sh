#!/bin/bash

# AWS EC2 Deployment Script
# This script can be run on the EC2 instance or via SSH from CI/CD

set -e

echo "Starting deployment..."

# Navigate to application directory
APP_DIR="/home/ubuntu/practice-counter-3-backend"

echo "Current directory before change: $(pwd)"
echo "Target directory: $APP_DIR"

# Check if git repository exists in the target directory
if [ -d "$APP_DIR/.git" ]; then
  echo "Git repository found in $APP_DIR"
  cd $APP_DIR
  echo "Current directory: $(pwd)"
  echo "Pulling latest code from git..."
  git pull origin main || git pull origin master || git pull
else
  echo "Git repository not found in $APP_DIR"
  echo "Searching for git repository in common locations..."
  
  # Search for git repository in common locations
  POSSIBLE_LOCATIONS=(
    "/home/ubuntu"
    "/home/$USER"
    "/var/www"
    "/opt"
  )
  
  FOUND_REPO=""
  for location in "${POSSIBLE_LOCATIONS[@]}"; do
    if [ -d "$location/practice-counter-3-backend/.git" ]; then
      FOUND_REPO="$location/practice-counter-3-backend"
      echo "Found git repository at: $FOUND_REPO"
      break
    fi
  done
  
  if [ -n "$FOUND_REPO" ]; then
    echo "Using found repository at $FOUND_REPO"
    cd "$FOUND_REPO"
    echo "Current directory: $(pwd)"
    echo "Pulling latest code from git..."
    git pull origin main || git pull origin master || git pull
    APP_DIR="$FOUND_REPO"
  else
    echo "Directory contents of $APP_DIR:"
    ls -la $APP_DIR 2>/dev/null || echo "Directory does not exist"
    echo ""
    echo "ERROR: Git repository not found."
    echo "Please ensure the repository is cloned in $APP_DIR or update APP_DIR in deploy.sh"
    echo ""
    echo "To clone the repository, run on EC2:"
    echo "  cd /home/ubuntu"
    echo "  git clone <your-repo-url> practice-counter-3-backend"
    exit 1
  fi
fi

# Source profile to ensure PATH is set correctly (for non-interactive shells)
# Use -f flag to force sourcing even in non-interactive shells
if [ -f ~/.bashrc ]; then
  source ~/.bashrc 2>/dev/null || true
fi
if [ -f ~/.profile ]; then
  source ~/.profile 2>/dev/null || true
fi
if [ -f ~/.bash_profile ]; then
  source ~/.bash_profile 2>/dev/null || true
fi

# Find npm in common locations and add to PATH
NPM_PATH=""
if command -v npm &> /dev/null; then
  NPM_PATH=$(command -v npm)
  echo "Found npm at: $NPM_PATH"
else
  # Try to find npm in common installation paths
  for path in /usr/bin/npm /usr/local/bin/npm ~/.nvm/current/bin/npm /home/ubuntu/.nvm/current/bin/npm; do
    if [ -f "$path" ]; then
      NPM_PATH="$path"
      export PATH="$(dirname $path):$PATH"
      echo "Found npm at: $NPM_PATH"
      break
    fi
  done
  
  # Try nvm if available
  if [ -z "$NPM_PATH" ] && [ -f ~/.nvm/nvm.sh ]; then
    export NVM_DIR="$HOME/.nvm"
    [ -s "$NVM_DIR/nvm.sh" ] && source "$NVM_DIR/nvm.sh"
    NPM_PATH=$(command -v npm 2>/dev/null || echo "")
  fi
fi

# Final check
if [ -z "$NPM_PATH" ] && ! command -v npm &> /dev/null; then
  echo "ERROR: npm is not found in PATH"
  echo "Current PATH: $PATH"
  echo ""
  echo "Please ensure npm is installed and accessible."
  echo "You can check with: which npm"
  exit 1
fi

# Verify Node.js and npm versions
echo "Node.js version: $(node --version 2>/dev/null || echo 'not found')"
echo "npm version: $(npm --version 2>/dev/null || echo 'not found')"

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
  echo "No process manager found. Starting application in background..."
  pkill -f "node src/index.js" || true
  nohup node src/index.js > app.log 2>&1 &
fi

echo "Deployment completed successfully!"


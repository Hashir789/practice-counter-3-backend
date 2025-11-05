#!/bin/bash

# AWS EC2 Setup Script
# Run this script once on your EC2 instance to set up the environment

set -e

echo "Setting up EC2 instance for Kitaab Backend..."

# Update system packages
echo "Updating system packages..."
sudo apt-get update
sudo apt-get upgrade -y

# Install Node.js (using NodeSource repository for latest LTS)
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Verify Node.js installation
node --version
npm --version

# Install PM2 for process management
echo "Installing PM2..."
sudo npm install -g pm2

# Install Git if not already installed
echo "Checking Git installation..."
if ! command -v git &> /dev/null; then
  echo "Installing Git..."
  sudo apt-get install -y git
fi

# Create application directory
APP_DIR="/home/ubuntu/kitaab-backend"
echo "Creating application directory at $APP_DIR..."
mkdir -p $APP_DIR
cd $APP_DIR

# Set up PM2 startup script
echo "Setting up PM2 startup script..."
pm2 startup systemd -u ubuntu --hp /home/ubuntu

# Create systemd service file (optional, alternative to PM2)
echo "Creating systemd service file..."
sudo tee /etc/systemd/system/kitaab-backend.service > /dev/null <<EOF
[Unit]
Description=Kitaab Backend API
After=network.target

[Service]
Type=simple
User=ubuntu
WorkingDirectory=$APP_DIR
Environment=NODE_ENV=production
Environment=PORT=3000
ExecStart=/usr/bin/node src/index.js
Restart=on-failure
RestartSec=10

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd (if using systemd instead of PM2)
# sudo systemctl daemon-reload
# sudo systemctl enable kitaab-backend

echo ""
echo "EC2 setup completed successfully!"
echo ""
echo "Next steps:"
echo "1. Clone your repository: git clone <your-repo-url> $APP_DIR"
echo "2. Install dependencies: cd $APP_DIR && npm install"
echo "3. Start the application:"
echo "   - With PM2: pm2 start src/index.js --name kitaab-backend && pm2 save"
echo "   - With systemd: sudo systemctl start kitaab-backend"
echo ""
echo "To view logs:"
echo "   - PM2: pm2 logs kitaab-backend"
echo "   - systemd: sudo journalctl -u kitaab-backend -f"


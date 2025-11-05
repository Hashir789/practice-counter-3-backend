# AWS EC2 Deployment Guide

This guide explains how to deploy the Kitaab Backend application to an AWS EC2 instance.

## Prerequisites

1. An AWS EC2 instance running Ubuntu (or similar Linux distribution)
2. SSH access to the EC2 instance
3. GitHub repository with your code
4. GitHub Secrets configured for CI/CD

## Initial EC2 Setup (One-time)

### Option 1: Automated Setup Script

1. Connect to your EC2 instance:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip
```

2. Copy the setup script to your EC2 instance:
```bash
scp -i your-key.pem scripts/setup-ec2.sh ubuntu@your-ec2-ip:~/
```

3. Run the setup script:
```bash
ssh -i your-key.pem ubuntu@your-ec2-ip 'bash ~/setup-ec2.sh'
```

### Option 2: Manual Setup

1. Install Node.js:
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

2. Install PM2 (process manager):
```bash
sudo npm install -g pm2
pm2 startup systemd
```

3. Clone your repository:
```bash
cd /home/ubuntu
git clone <your-repo-url> kitaab-backend
cd kitaab-backend
npm install --production
```

4. Start the application:
```bash
pm2 start src/index.js --name kitaab-backend
pm2 save
```

## GitHub Secrets Configuration

Configure the following secrets in your GitHub repository:

1. Go to: Repository Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `EC2_HOST`: Your EC2 instance public IP or domain
   - `EC2_USER`: SSH user (usually `ubuntu`)
   - `EC2_SSH_KEY`: Your private SSH key content (the entire key file content)

### How to get your SSH key content:

```bash
cat ~/.ssh/your-key.pem
```

Copy the entire output including `-----BEGIN RSA PRIVATE KEY-----` and `-----END RSA PRIVATE KEY-----`

## CI/CD Pipeline

The GitHub Actions workflow (`.github/workflows/ci-cd.yml`) will:

1. Run tests on every push/PR
2. Check code formatting with Prettier
3. Run ESLint
4. Deploy to EC2 automatically when:
   - Tests pass
   - Code is pushed to `main` or `master` branch

## Manual Deployment

If you need to deploy manually:

1. SSH into your EC2 instance
2. Navigate to the application directory
3. Pull latest changes and restart:

```bash
cd /home/ubuntu/kitaab-backend
git pull origin main
npm ci --production
pm2 restart kitaab-backend
```

## Security Considerations

- Never commit SSH keys to the repository
- Use GitHub Secrets for sensitive information
- Configure security groups to only allow necessary ports (e.g., port 3000 for the API)
- Use environment variables for sensitive configuration
- Consider using AWS Systems Manager Parameter Store or AWS Secrets Manager for production

## Troubleshooting

### Application won't start
- Check logs: `pm2 logs kitaab-backend`
- Verify Node.js is installed: `node --version`
- Check if port 3000 is available: `sudo netstat -tulpn | grep 3000`

### Deployment fails
- Verify SSH key has correct permissions: `chmod 600 deploy_key.pem`
- Check EC2 security group allows SSH (port 22)
- Verify GitHub Secrets are correctly configured

### PM2 not restarting
- Check PM2 status: `pm2 status`
- Save PM2 configuration: `pm2 save`
- Restart PM2: `pm2 restart kitaab-backend`


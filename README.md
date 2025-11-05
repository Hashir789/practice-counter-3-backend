# Kitaab Backend

Simple Node.js application with CI/CD pipeline, unit tests, linting, and AWS EC2 deployment.

## Features

- Express.js server
- Unit tests with Jest
- ESLint for code linting
- Prettier for code formatting
- GitHub Actions CI/CD pipeline
- AWS EC2 deployment scripts

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

```bash
npm install
```

### Running the Application

```bash
npm start
```

The server will start on port 3000 (or the port specified in the PORT environment variable).

### Available Endpoints

- `GET /` - Welcome message
- `GET /health` - Health check endpoint
- `GET /api/add?a=5&b=3` - Add two numbers

### Scripts

- `npm start` - Start the server
- `npm test` - Run tests
- `npm run lint` - Run ESLint
- `npm run lint:fix` - Fix ESLint errors
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check code formatting

## CI/CD Pipeline

The GitHub Actions workflow will:
1. Run unit tests
2. Check code formatting with Prettier
3. Run ESLint
4. Deploy to AWS EC2 instance (if all checks pass)

## AWS EC2 Deployment

The deployment script assumes you have:
- An EC2 instance running
- SSH access configured
- Node.js installed on the EC2 instance

## License

ISC


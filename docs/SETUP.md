# Agent Builder - Complete Setup Guide

This guide will help you set up the Agent Builder application for local development and production deployment.

## Prerequisites

- **Node.js 18+** and npm 8+
- **AWS CLI** configured with appropriate credentials
- **AWS SAM CLI** installed
- **Docker** (for running Lambda functions locally)
- **OpenAI API Key** (for AI agent functionality)
- **Google OAuth Credentials** (for social login)

## Quick Start

### 1. Clone and Install Dependencies

```bash
git clone https://github.com/lequockhanh19521680/Lab-Turtorial.git
cd Lab-Turtorial/agent-builder
npm run install:all
```

### 2. Set Up Environment Variables

#### Backend Environment Variables
The backend uses AWS Systems Manager (SSM) Parameter Store for secure secret management. Set up the following SSM parameters:

```bash
# Replace 'dev' with your environment (dev/staging/prod)
aws ssm put-parameter \
  --name "/agent-builder/dev/openai-api-key" \
  --value "your-openai-api-key-here" \
  --type "SecureString"

# For Google OAuth (optional but recommended)
aws ssm put-parameter \
  --name "/agent-builder/dev/google-oauth-client-id" \
  --value "your-google-oauth-client-id" \
  --type "SecureString"

aws ssm put-parameter \
  --name "/agent-builder/dev/google-oauth-client-secret" \
  --value "your-google-oauth-client-secret" \
  --type "SecureString"
```

#### Frontend Environment Variables
Copy and configure the frontend environment file:

```bash
cp frontend/.env.local.example frontend/.env.local
```

Edit `frontend/.env.local`:
```env
# API Configuration
VITE_API_BASE_URL=http://localhost:3001/api
VITE_APP_NAME=Agent Builder
VITE_APP_VERSION=1.0.0

# AWS Configuration (will be populated after deployment)
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_USER_POOL_DOMAIN=agent-builder-dev-123456789

# WebSocket Configuration (will be populated after deployment)
VITE_WEBSOCKET_ENDPOINT=wss://your-websocket-api-endpoint
```

### 3. Deploy Backend Infrastructure

```bash
# Build the backend
npm run build:backend

# Deploy using SAM
cd backend
sam deploy --guided

# Follow the prompts:
# Stack Name: agent-builder-dev
# AWS Region: us-east-1
# Parameter Environment: dev
# Confirm changes before deploy: Y
# Allow SAM to create IAM roles: Y
# Save parameters to config file: Y
```

### 4. Configure Frontend with Deployment Outputs

After successful deployment, get the outputs:

```bash
aws cloudformation describe-stacks \
  --stack-name agent-builder-dev \
  --query "Stacks[0].Outputs"
```

Update your `frontend/.env.local` with the actual values:
- `VITE_USER_POOL_ID`: From UserPoolId output
- `VITE_USER_POOL_CLIENT_ID`: From UserPoolClientId output
- `VITE_USER_POOL_DOMAIN`: From UserPoolDomain output
- `VITE_WEBSOCKET_ENDPOINT`: From WebSocketApiEndpoint output

### 5. Start Development Environment

```bash
# From the root agent-builder directory
npm run dev
```

This will start:
- Backend: http://localhost:3001 (SAM local API)
- Frontend: http://localhost:3000 (Vite dev server)

## Google OAuth Setup (Optional)

### 1. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Configure authorized redirect URIs:
   - `http://localhost:3000/auth/callback` (for development)
   - `https://your-domain.com/auth/callback` (for production)

### 2. Store Credentials in SSM

```bash
aws ssm put-parameter \
  --name "/agent-builder/dev/google-oauth-client-id" \
  --value "your-google-client-id.apps.googleusercontent.com" \
  --type "SecureString"

aws ssm put-parameter \
  --name "/agent-builder/dev/google-oauth-client-secret" \
  --value "your-google-client-secret" \
  --type "SecureString"
```

### 3. Update Cognito Identity Provider

After deployment, manually update the Google Identity Provider in Cognito with your credentials, or redeploy the stack.

## Production Deployment

### 1. Set Up GitHub Secrets

Configure the following secrets in your GitHub repository:

```
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_ACCOUNT_ID=123456789012
```

### 2. Set Up Production SSM Parameters

```bash
aws ssm put-parameter \
  --name "/agent-builder/prod/openai-api-key" \
  --value "your-production-openai-key" \
  --type "SecureString"

aws ssm put-parameter \
  --name "/agent-builder/prod/google-oauth-client-id" \
  --value "your-production-google-client-id" \
  --type "SecureString"

aws ssm put-parameter \
  --name "/agent-builder/prod/google-oauth-client-secret" \
  --value "your-production-google-client-secret" \
  --type "SecureString"
```

### 3. Deploy via GitHub Actions

1. Push to `main` branch for production deployment
2. Push to `staging` branch for staging deployment
3. The CI/CD pipeline will automatically:
   - Run tests and quality checks
   - Build the application
   - Deploy backend infrastructure
   - Deploy frontend to S3/CloudFront
   - Run health checks

## Architecture Overview

### Backend Services

- **API Gateway**: RESTful API endpoints
- **Lambda Functions**: Serverless compute for business logic
- **DynamoDB**: NoSQL database for data storage
- **SQS**: Queue for agent task processing
- **SNS**: Real-time notifications
- **WebSocket API**: Real-time client updates
- **Cognito**: User authentication and authorization
- **S3**: Static asset storage

### AI Agent Workflow

1. **User Request**: Natural language project description
2. **Orchestrator**: Queues first agent (Product Manager)
3. **Product Manager Agent**: Analyzes requirements using OpenAI
4. **Backend Engineer Agent**: Generates API and database specs
5. **Frontend Engineer Agent**: Creates UI component specifications
6. **DevOps Engineer Agent**: Handles deployment configuration
7. **Real-time Updates**: WebSocket notifications throughout process

### Security Features

- **SSM Parameter Store**: Secure secret management
- **IAM Roles**: Least privilege access for Lambda functions
- **JWT Tokens**: Secure API authentication
- **HTTPS/TLS**: Encrypted data in transit
- **VPC**: Network isolation (optional)
- **OAuth 2.0**: Social login integration

## Development Workflow

### 1. Local Development

```bash
npm run dev         # Start both frontend and backend
npm run dev:backend # Start only backend (SAM local)
npm run dev:frontend # Start only frontend (Vite)
```

### 2. Building

```bash
npm run build          # Build both frontend and backend
npm run build:backend  # Build backend only
npm run build:frontend # Build frontend only
```

### 3. Testing

```bash
npm run test           # Run all tests
npm run test:backend   # Run backend tests
npm run test:frontend  # Run frontend tests
npm run lint          # Run linting for both
```

### 4. Deployment

```bash
npm run deploy  # Deploy backend using SAM
```

## Troubleshooting

### Common Issues

1. **"Module not found" errors**: Run `npm run install:all`
2. **SAM local not working**: Ensure Docker is running and SAM CLI is installed
3. **WebSocket connection failed**: Check if API Gateway WebSocket is deployed and endpoint is correct
4. **Cognito authentication errors**: Verify User Pool ID and Client ID in environment variables
5. **Build failures**: Check that all required environment variables are set

### Logs and Debugging

- **Backend logs**: `sam logs --stack-name agent-builder-dev`
- **Frontend console**: Check browser developer tools
- **CloudWatch logs**: View in AWS Console for production issues
- **WebSocket debugging**: Monitor connections in browser Network tab

## Performance Optimization

### Frontend
- Code splitting with dynamic imports
- Image optimization and lazy loading
- Service worker for caching
- Bundle size optimization

### Backend
- Lambda function warming
- DynamoDB read/write capacity optimization
- CloudFront caching strategies
- API Gateway throttling configuration

## Monitoring and Observability

- **CloudWatch Dashboards**: Application metrics and logs
- **X-Ray Tracing**: Distributed request tracing
- **CloudWatch Alarms**: Automated error alerting
- **Performance Monitoring**: Real-time application performance

## Support

- **Documentation**: [docs.agent-builder.app](https://docs.agent-builder.app)
- **Issues**: [GitHub Issues](https://github.com/lequockhanh19521680/Lab-Turtorial/issues)
- **Email**: support@agent-builder.app

---

For more detailed information, see the individual documentation files:
- [API Documentation](./API.md)
- [Deployment Guide](./DEPLOYMENT.md)
- [Contributing Guide](./CONTRIBUTING.md)
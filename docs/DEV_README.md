# Agent Builder - Development Guide

This guide covers how to set up and run the Agent Builder project for development.

## Prerequisites

- Node.js 18+ and npm 8+
- AWS CLI configured with appropriate credentials
- AWS SAM CLI installed
- Docker (for running Lambda functions locally)

## Quick Start

### Install All Dependencies
```bash
npm run install:all
```

### Start Development Environment
```bash
npm run dev
```

This will start both the backend (SAM local API) and frontend (Vite dev server) concurrently:
- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

### Individual Commands

#### Backend Development
```bash
# Build backend
npm run build:backend

# Start SAM local API only
npm run sam:local

# Deploy to AWS
npm run deploy
```

#### Frontend Development
```bash
# Start frontend dev server only  
npm run dev:frontend

# Build frontend for production
npm run build:frontend
```

## Environment Variables

### Backend (.env or environment variables)
```
OPENAI_API_KEY=your_openai_api_key
```

### Frontend (.env.local)
```
VITE_API_BASE_URL=http://localhost:3001
VITE_WEBSOCKET_ENDPOINT=wss://your-websocket-api-endpoint
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=your_cognito_user_pool_id
VITE_USER_POOL_CLIENT_ID=your_cognito_client_id
```

## Project Structure

```
agent-builder/
├── package.json              # Root package.json with dev scripts
├── backend/                   # AWS SAM backend
│   ├── src/
│   │   ├── handlers/         # API Gateway handlers
│   │   ├── agents/           # AI agent implementations
│   │   └── utils/            # Shared utilities
│   ├── template.yaml         # SAM infrastructure template
│   └── package.json
├── frontend/                  # React frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   ├── pages/           # Page components
│   │   ├── services/        # API and service integrations
│   │   └── store/           # Redux state management
│   └── package.json
└── README.md
```

## Development Workflow

1. **Start Development**: `npm run dev`
2. **Make Changes**: Edit files in backend/src or frontend/src
3. **Backend Changes**: SAM will automatically rebuild and restart
4. **Frontend Changes**: Vite will hot-reload changes automatically
5. **Test**: Use the frontend at http://localhost:3000
6. **Deploy**: `npm run deploy` when ready

## Key Features

### Authentication
- AWS Cognito integration with JWT tokens
- Protected routes and login/register pages
- User session management

### Real-time Updates
- WebSocket connections for live project updates
- SNS notifications for agent task completion
- Automatic fallback to polling if WebSocket fails

### Event-driven Architecture
- SQS-based agent orchestration (no setTimeout)
- Lambda functions for scalable processing
- DynamoDB for persistent storage

## Debugging

### Backend Issues
- Check CloudWatch logs for Lambda functions
- Use `sam logs` for local debugging
- Verify IAM permissions in template.yaml

### Frontend Issues
- Check browser console for JavaScript errors
- Verify environment variables are set correctly
- Check network tab for API request failures

### WebSocket Issues
- Verify WebSocket endpoint in environment variables
- Check browser WebSocket connection in Network tab
- Monitor SNS topic and subscription in AWS console

## Production Deployment

1. **Build**: `npm run build`
2. **Deploy Backend**: `npm run deploy`
3. **Deploy Frontend**: Upload frontend/dist to S3 bucket
4. **Configure Environment**: Set production environment variables
5. **Test**: Verify all services are working correctly

## Contributing

1. Create a feature branch
2. Make your changes
3. Test locally with `npm run dev`
4. Build and test: `npm run build && npm run test`
5. Submit a pull request

## Troubleshooting

### Common Issues

**"Module not found" errors**: Run `npm run install:all`

**SAM local not working**: Ensure Docker is running and SAM CLI is installed

**WebSocket connection failed**: Check if API Gateway WebSocket is deployed and endpoint is correct

**Cognito authentication errors**: Verify User Pool ID and Client ID in environment variables

**Build failures**: Check that all required environment variables are set
# Agent Builder - Autonomous Software Factory

A revolutionary SaaS platform that allows users to create complete web applications through natural language requests using AI agents.

![Agent Builder Dashboard](https://github.com/user-attachments/assets/f89ee208-d8bc-4544-b808-4aa730aa62db)

## 🚀 Overview

Agent Builder transforms natural language descriptions into fully functional web applications. Simply describe what you want to build, and our AI agents will:

1. **Analyze** your requirements and create detailed specifications
2. **Plan** the architecture and technical implementation
3. **Develop** both frontend and backend code
4. **Deploy** your application to the cloud

![Create Project Interface](https://github.com/user-attachments/assets/83ccdf73-7a01-4430-9113-7badc46e98f8)

## ✨ Key Features

- **Natural Language Interface**: Describe your app idea in plain English
- **AI-Powered Development**: Specialized agents handle different aspects of development
- **Real-Time Progress Tracking**: Watch your app being built step by step
- **Complete Stack Generation**: Frontend, backend, database, and deployment
- **Professional Quality**: Production-ready code with best practices
- **Instant Deployment**: Get a live URL for your application
- **User Management**: Complete authentication system with Google OAuth
- **Scalable Architecture**: Serverless AWS infrastructure that scales automatically

![Filled Project Form](https://github.com/user-attachments/assets/666a89ed-80ba-4621-8702-d55b4436c270)

## 🏗️ Architecture

### Serverless Backend (AWS SAM)
- **Nested Stacks**: Modular CloudFormation templates for easier management
- **AWS Lambda**: Serverless compute with Node.js 20.x runtime
- **Amazon DynamoDB**: NoSQL database with global secondary indexes
- **API Gateway**: RESTful APIs with OpenAPI 3.0 specification
- **AWS Cognito**: User authentication and authorization
- **Step Functions**: AI agent orchestration workflow
- **SQS + SNS**: Asynchronous messaging and notifications
- **S3 + CloudFront**: Static asset hosting and CDN

### Frontend
- **React 18** with TypeScript for type safety
- **Tailwind CSS** for responsive, modern design
- **Redux Toolkit** for state management
- **React Router v6** for navigation
- **React Query** for API state management

### AI Agents
- **Orchestrator Agent**: Coordinates the entire process
- **Product Manager Agent**: Creates requirements and specifications
- **Frontend Engineer Agent**: Generates React components and UI
- **Backend Engineer Agent**: Creates APIs and database schemas
- **DevOps Engineer Agent**: Handles deployment and infrastructure

## 🛠️ Technology Stack

### Backend
```json
{
  "runtime": "Node.js 20.x",
  "framework": "AWS SAM",
  "database": "Amazon DynamoDB",
  "api": "AWS API Gateway + OpenAPI 3.0",
  "auth": "AWS Cognito",
  "orchestration": "AWS Step Functions",
  "messaging": "AWS SQS + SNS",
  "storage": "Amazon S3",
  "cdn": "Amazon CloudFront"
}
```

### Frontend
```json
{
  "framework": "React 18 + TypeScript",
  "styling": "Tailwind CSS",
  "state": "Redux Toolkit + React Query",
  "routing": "React Router v6",
  "build": "Vite",
  "testing": "Jest + React Testing Library"
}
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- AWS CLI configured with appropriate permissions
- AWS SAM CLI installed

### 1. Backend Deployment

```bash
cd agent-builder/backend

# Install dependencies
npm install

# Set up SSM parameters (required for AI functionality)
aws ssm put-parameter \
  --name "/agent-builder/dev/openai-api-key" \
  --value "your-openai-api-key" \
  --type "SecureString"

# Deploy to development
./deploy.sh dev

# Deploy to production
./deploy.sh prod
```

### 2. Frontend Development

```bash
cd agent-builder/frontend

# Install dependencies
npm install

# Copy environment template
cp .env.local.example .env.local

# Update .env.local with API endpoint from deployment outputs
# VITE_API_BASE_URL=https://your-api-id.execute-api.us-east-1.amazonaws.com/dev

# Start development server
npm run dev
```

## 📁 Project Structure

```
agent-builder/
├── backend/                  # AWS serverless backend
│   ├── src/
│   │   ├── handlers/        # Lambda function handlers
│   │   ├── agents/          # AI agent implementations
│   │   ├── models/          # Data models and types
│   │   └── utils/           # Utility functions
│   ├── stacks/              # Nested CloudFormation stacks
│   │   ├── database.yaml    # DynamoDB tables
│   │   ├── infrastructure.yaml # S3, SQS, SNS, CloudFront
│   │   └── auth.yaml        # Cognito User Pool
│   ├── template.yaml        # Main SAM template (monolith)
│   ├── template-nested.yaml # Main SAM template (nested stacks)
│   ├── api-spec.yaml        # OpenAPI 3.0 specification
│   ├── samconfig.*.toml     # SAM deployment configurations
│   └── deploy.sh            # Deployment script
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/      # Reusable UI components
│   │   ├── pages/          # Application pages
│   │   ├── services/       # API services
│   │   ├── store/          # Redux store and slices
│   │   └── utils/          # Utility functions
│   └── package.json
├── DEPLOYMENT.md            # Comprehensive deployment guide
└── README.md               # This file
```

## 📖 Documentation

- **[Deployment Guide](DEPLOYMENT.md)** - Complete deployment instructions
- **[API Documentation](backend/api-spec.yaml)** - OpenAPI 3.0 specification
- **[Setup Guide](SETUP.md)** - Detailed setup instructions

## 🤖 AI Agents

### User Management System
- **Complete CRUD operations** for user profiles
- **Google OAuth integration** with Cognito
- **JWT-based authentication** for secure API access
- **Profile management** with customizable fields

### Project Workflow
1. **User Authentication** - Google OAuth or email/password
2. **Project Creation** - Natural language input with AI analysis
3. **Agent Orchestration** - Coordinated AI agent execution
4. **Real-time Updates** - WebSocket notifications for progress
5. **Artifact Generation** - Code, documentation, and deployment assets
6. **Deployment** - Automated cloud deployment with live URLs

## 🔧 Configuration

### Environment Variables (Backend)
```bash
# Automatically configured by CloudFormation
NODE_ENV=production
USERS_TABLE=agent-builder-users-{env}
PROJECTS_TABLE=agent-builder-projects-{env}
TASKS_TABLE=agent-builder-tasks-{env}
ARTIFACTS_TABLE=agent-builder-artifacts-{env}
CONNECTIONS_TABLE=agent-builder-connections-{env}
ARTIFACTS_BUCKET={env}-agent-builder-artifacts-{account}-{region}
AGENT_TASK_QUEUE_URL=https://sqs.{region}.amazonaws.com/{account}/agent-builder-task-queue-{env}
PROJECT_NOTIFICATION_TOPIC_ARN=arn:aws:sns:{region}:{account}:agent-builder-notifications-{env}
WEBSOCKET_API_ENDPOINT={api-id}.execute-api.{region}.amazonaws.com/{env}

# SSM Parameter references (securely stored)
OPENAI_API_KEY_PARAM=/agent-builder/{env}/openai-api-key
GOOGLE_CLIENT_ID_PARAM=/agent-builder/{env}/google-oauth-client-id
GOOGLE_CLIENT_SECRET_PARAM=/agent-builder/{env}/google-oauth-client-secret
```

### Environment Variables (Frontend)
```bash
# API Configuration
VITE_API_BASE_URL=https://your-api-gateway-url
VITE_APP_NAME=Agent Builder
VITE_APP_VERSION=1.0.0

# AWS Configuration (populated after deployment)
VITE_AWS_REGION=us-east-1
VITE_USER_POOL_ID=us-east-1_xxxxxxxxx
VITE_USER_POOL_CLIENT_ID=xxxxxxxxxxxxxxxxxxxxxxxxxx
VITE_USER_POOL_DOMAIN=agent-builder-dev-123456789

# WebSocket Configuration
VITE_WEBSOCKET_ENDPOINT=wss://your-websocket-api-endpoint
```

## 🎯 Supported Application Types

- **Blog Platforms**: Content management systems with user authentication
- **Task Management**: Project and task tracking applications
- **E-commerce**: Online stores with cart, checkout, and payment processing
- **Social Platforms**: User interaction and content sharing features
- **Dashboard Apps**: Data visualization and analytics interfaces
- **CRUD Applications**: Standard create, read, update, delete operations
- **API Services**: RESTful web services with documentation

## 🔒 Security & Best Practices

### Authentication & Authorization
- **AWS Cognito** for user management and JWT tokens
- **Google OAuth** integration for social login
- **Role-based access control** for user permissions
- **API Gateway** authorizers for endpoint protection

### Data Protection
- **DynamoDB encryption** at rest and in transit
- **SSM Parameter Store** for secure secret management
- **S3 bucket policies** for restricted access
- **Point-in-time recovery** enabled for all databases

### Input Validation & Error Handling
- **Comprehensive validation** on all API inputs
- **Structured error responses** with proper HTTP status codes
- **CloudWatch logging** for monitoring and debugging
- **Graceful degradation** for service failures

## 📊 Performance & Scaling

### Infrastructure
- **Auto-scaling serverless** architecture
- **DynamoDB on-demand billing** for cost optimization
- **CloudFront CDN** for global content delivery
- **API Gateway caching** for improved response times

### Monitoring
- **CloudWatch metrics** for all AWS services
- **Custom dashboards** for application monitoring
- **Automated alerts** for error thresholds
- **Performance tracking** for user experience

### Cost Optimization
- **Pay-per-use pricing** model
- **Automatic resource scaling** based on demand
- **S3 lifecycle policies** for storage optimization
- **Reserved capacity** for predictable workloads

## 🧪 Testing

### Backend Testing
```bash
cd agent-builder/backend
npm test                    # Unit tests
npm run test:integration    # Integration tests
npm run test:coverage       # Coverage report
```

### Frontend Testing
```bash
cd agent-builder/frontend
npm test                    # Unit tests
npm run test:e2e           # End-to-end tests
npm run test:coverage      # Coverage report
```

## 🚀 Deployment Options

### Architecture Choices
1. **Nested Stacks** (Recommended)
   - Modular CloudFormation templates
   - Easier management and updates
   - Better separation of concerns
   ```bash
   ./deploy.sh dev nested
   ```

2. **Monolithic Stack**
   - Single CloudFormation template
   - Simpler for small deployments
   ```bash
   ./deploy.sh dev monolith
   ```

### Environment Management
- **Development**: `samconfig.dev.toml` - Fast iterations, auto-confirm changes
- **Production**: `samconfig.prod.toml` - Manual approval, enhanced monitoring

## 📈 Roadmap

### Phase 1 (Completed) ✅
- [x] Core AI agents implementation
- [x] User authentication and management
- [x] Project creation and tracking
- [x] Real-time progress updates
- [x] Basic CRUD app generation
- [x] Nested stacks architecture
- [x] OpenAPI documentation
- [x] Comprehensive deployment guide

### Phase 2 (In Progress) 🚧
- [ ] Advanced UI/UX design capabilities
- [ ] Database migration tools
- [ ] Multi-language support
- [ ] Team collaboration features
- [ ] Enhanced error handling and recovery

### Phase 3 (Planned) 📋
- [ ] Integration with external APIs
- [ ] Advanced deployment options (Docker, Kubernetes)
- [ ] Custom agent creation framework
- [ ] Enterprise features and SLA guarantees
- [ ] Multi-cloud deployment support

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For issues and questions:
- **Documentation**: Review [DEPLOYMENT.md](DEPLOYMENT.md) for setup issues
- **API Reference**: Check [api-spec.yaml](backend/api-spec.yaml) for endpoint details
- **Issues**: [GitHub Issues](https://github.com/lequockhanh19521680/Lab-Turtorial/issues)
- **Discussions**: [GitHub Discussions](https://github.com/lequockhanh19521680/Lab-Turtorial/discussions)

## 🏆 Achievements

This project demonstrates:
- **Serverless best practices** with AWS SAM
- **Microservices architecture** with nested stacks
- **Modern authentication** with Cognito and OAuth
- **Comprehensive API documentation** with OpenAPI 3.0
- **Infrastructure as Code** with CloudFormation
- **DevOps automation** with deployment scripts
- **Security-first design** with encryption and access controls

---

**Made with ❤️ by the Agent Builder Team**

*Transforming ideas into applications through the power of AI*
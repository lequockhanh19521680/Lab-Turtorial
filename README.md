# Lab Tutorial - Autonomous Software Factory

A professional serverless application that transforms natural language descriptions into fully functional web applications using AI agents with real-time collaboration features.

## 🏗️ System Architecture

```
Frontend (React/Vite)
        ↓
   CloudFront (CDN)
        ↓
   API Gateway (REST + WebSocket)
        ↓
   Lambda Functions (Handlers)
        ↓
   Business Logic (Services)
        ↓
   Data Access (Repositories)
        ↓
   DynamoDB + S3 + SQS + SNS
```

### Key Features

- **AI-Powered Development**: Multi-agent system with Product Manager, Backend Engineer, Frontend Engineer, and DevOps Engineer agents
- **Real-time Collaboration**: WebSocket-based live updates and project progress tracking
- **Serverless Architecture**: Fully managed AWS infrastructure with automatic scaling
- **Type-Safe Development**: End-to-end TypeScript with shared type definitions
- **Modern Monorepo**: Turborepo for efficient builds and development workflows

## 🚀 Tech Stack

### Frontend
- **Framework**: React 18 + TypeScript
- **Build Tool**: Vite with HMR
- **Styling**: Tailwind CSS
- **State Management**: Redux Toolkit + React Query
- **Authentication**: AWS Cognito with OAuth (Google)

### Backend
- **Infrastructure**: AWS SAM (Serverless Application Model)
- **Runtime**: Node.js 20.x on AWS Lambda
- **Database**: Amazon DynamoDB with Global Secondary Indexes
- **Storage**: Amazon S3 for artifacts and deployments
- **Messaging**: Amazon SQS for task queues + SNS for notifications
- **Real-time**: API Gateway WebSocket for live updates

### DevOps
- **IaC**: AWS SAM templates for infrastructure as code
- **CI/CD**: GitHub Actions for automated testing and deployment
- **Code Quality**: ESLint, Prettier, Husky with conventional commits
- **Monorepo**: Turborepo for build optimization and caching

## 📁 Project Structure

```
/
├── apps/
│   ├── frontend/                 # React application
│   │   ├── src/
│   │   ├── public/
│   │   └── package.json
│   └── backend/                  # AWS SAM serverless backend
│       ├── src/handlers/         # Lambda function handlers (HTTP layer)
│       ├── src/agents/           # AI agent implementations
│       ├── src/utils/            # Utility functions
│       ├── template.yaml         # SAM infrastructure definition
│       └── package.json
├── packages/
│   ├── infrastructure/           # Business logic layer
│   │   ├── src/services/         # Business logic services
│   │   ├── src/repositories/     # Data access layer
│   │   ├── src/models/           # Domain models and types
│   │   └── package.json
│   ├── shared-types/             # Shared TypeScript definitions
│   ├── eslint-config-custom/     # Shared ESLint configuration
│   └── tsconfig/                 # Shared TypeScript configurations
└── docs/                         # Documentation
```

### Architecture Layers

**3-Layer Architecture (Strict Separation)**:
1. **Handlers** (`apps/backend/src/handlers/`) - HTTP request/response handling only
2. **Services** (`packages/infrastructure/src/services/`) - Business logic and orchestration  
3. **Repositories** (`packages/infrastructure/src/repositories/`) - Data access layer

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+ and npm 8+
- **AWS CLI** configured with appropriate permissions
- **AWS SAM CLI** for local development and deployment
- **Git** for version control

### 1. Clone and Install

```bash
# Clone the repository
git clone https://github.com/lequockhanh19521680/Lab-Turtorial.git
cd Lab-Turtorial

# Install all dependencies
npm install

# Build all packages
npm run build
```

### 2. Local Development

```bash
# Start all applications in development mode
npm run dev

# Or run individual components
cd apps/frontend && npm run dev    # Frontend on http://localhost:3000
cd apps/backend && npm run sam:local  # Backend API on http://localhost:3001
```

### 3. Environment Setup

Create environment files for your deployment:

```bash
# Backend environment variables
cp apps/backend/.env.example apps/backend/.env.local

# Configure AWS resources (optional for local development)
aws ssm put-parameter --name "/agent-builder/dev/openai-api-key" --value "your-openai-key" --type "SecureString"
aws ssm put-parameter --name "/agent-builder/dev/google-oauth-client-id" --value "your-google-client-id" --type "String"
aws ssm put-parameter --name "/agent-builder/dev/google-oauth-client-secret" --value "your-google-secret" --type "SecureString"
```

## 🚀 Deployment

### Backend Deployment (AWS SAM)

```bash
cd apps/backend

# Build the SAM application
npm run build
sam build

# Deploy to development environment
sam deploy --guided --config-file samconfig.dev.toml

# Or deploy to production
sam deploy --config-file samconfig.prod.toml
```

### Frontend Deployment

```bash
cd apps/frontend

# Build for production
npm run build

# Deploy to S3 + CloudFront (configured in SAM template)
aws s3 sync dist/ s3://your-frontend-bucket-name --delete
aws cloudfront create-invalidation --distribution-id YOUR_DISTRIBUTION_ID --paths "/*"
```

### Infrastructure Components

The SAM template creates:
- **API Gateway** (REST + WebSocket APIs)
- **Lambda Functions** (for all handlers and AI agents)
- **DynamoDB Tables** (Users, Projects, Tasks, Artifacts, Connections)
- **S3 Buckets** (Frontend hosting + artifacts storage)
- **CloudFront Distribution** (CDN for frontend)
- **Cognito User Pool** (Authentication)
- **SQS Queues** (Task processing)
- **SNS Topics** (Real-time notifications)

## 🧪 Development Workflow

### Code Quality & Standards

```bash
# Run all quality checks
npm run lint           # ESLint across all packages
npm run type-check     # TypeScript validation
npm run test           # Jest test suites
npm run format         # Prettier code formatting
```

### Git Workflow

Commits must follow conventional commit format (enforced by Husky + Commitlint):

```bash
# Examples of valid commit messages
git commit -m "feat: add real-time project status updates"
git commit -m "fix: resolve WebSocket connection issues"
git commit -m "docs: update deployment instructions"
git commit -m "refactor: consolidate service layer architecture"
```

### Turborepo Benefits

- **Intelligent Caching**: Only rebuilds changed packages
- **Parallel Execution**: Runs tasks across packages simultaneously
- **Dependency Management**: Respects build order automatically

```bash
# Build only changed packages
npm run build

# Run tests with caching
npm run test

# Clean all build outputs
npm run clean
```

## 🤖 AI Agent System

### Agent Types

1. **Product Manager Agent** - Requirements analysis and SRS generation
2. **Backend Engineer Agent** - API design and database schema creation
3. **Frontend Engineer Agent** - UI/UX implementation
4. **DevOps Engineer Agent** - Deployment and infrastructure setup

### Agent Workflow

```
User Request → Orchestrator → Agent Queue (SQS) → Agent Processing → Results → WebSocket Updates
```

### Real-time Features

- **Live Progress Tracking** - See agent work in real-time
- **WebSocket Updates** - Instant notifications and status changes
- **Task Dependencies** - Smart task ordering and execution
- **Artifact Generation** - Downloadable code, documents, and deployments

## 📊 Monitoring & Observability

### Built-in AWS Monitoring

- **CloudWatch Logs** - Centralized logging for all Lambda functions
- **CloudWatch Metrics** - Performance monitoring and alerting
- **X-Ray Tracing** - Distributed request tracing (optional)
- **API Gateway Metrics** - Request/response analytics

### Error Handling

- **Dead Letter Queues** - Failed task recovery
- **Retry Logic** - Automatic retry with exponential backoff
- **Error Boundaries** - Graceful frontend error handling

## 🔒 Security

### Authentication & Authorization

- **AWS Cognito** - User authentication and management
- **JWT Tokens** - Secure API access
- **OAuth Integration** - Google sign-in support
- **API Gateway Authorizers** - Request validation

### Data Security

- **VPC** - Network isolation (optional)
- **IAM Roles** - Least privilege access
- **Parameter Store** - Secure configuration management
- **HTTPS Only** - TLS encryption for all traffic

## 🔧 Troubleshooting

### Common Issues

#### ERR_MODULE_NOT_FOUND Errors

**Issue**: `Cannot find module '/var/utils/validation' imported from /var/task/projects.js`

**Cause**: When using ES Modules (`"module": "ESNext"` in tsconfig.json), Node.js requires file extensions (.js) in relative imports.

**Solution**: This is automatically handled by the build process. The `fix-import-paths.js` script adds `.js` extensions to all import statements during compilation.

```bash
# Verify the build process fixes imports
npm run build
npm run sam:build
npm run sam:local
```

#### Build Failures

**Issue**: TypeScript compilation errors or missing dependencies

**Solution**:
```bash
# Clean and reinstall dependencies
npm run clean
npm install

# Check TypeScript issues
npm run type-check

# Fix linting issues  
npm run lint:fix

# Build packages in correct order
cd packages/infrastructure && npm run build
cd ../../apps/backend && npm run build
```

#### SAM Local Issues

**Issue**: Lambda functions fail to start or import errors

**Solution**:
```bash
# Ensure all packages are built
npm run build

# Clean SAM artifacts
npm run sam:clean

# Rebuild SAM completely
npm run sam:build

# Check logs for specific errors
sam logs --name ProjectsFunction --stack-name agent-builder-sam-dev
```

#### Permission Errors

**Issue**: AWS CLI or deployment permission errors

**Solution**:
```bash
# Check AWS configuration
aws configure list
aws sts get-caller-identity

# Verify required permissions for:
# - Lambda function management
# - API Gateway operations  
# - DynamoDB table operations
# - S3 bucket operations
# - CloudFormation stack operations
```

### Development Tips

- **Use TypeScript strict mode** - Catches errors early
- **Run tests frequently** - `npm run test:watch`
- **Check logs regularly** - CloudWatch provides detailed error information
- **Use sam local** - Test Lambda functions locally before deployment
- **Monitor build output** - Check for warnings in build logs

### Getting Help

1. **Check this troubleshooting section** first
2. **Review CloudWatch logs** for runtime errors
3. **Check GitHub Issues** for known problems
4. **Open new issues** with detailed error information

## 🤝 Contributing

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes following the project structure
4. Ensure all tests pass: `npm run test`
5. Verify code quality: `npm run lint`
6. Commit with conventional format: `git commit -m "feat: add amazing feature"`
7. Push and create a Pull Request

### Code Standards

- **TypeScript** - Strict mode enabled
- **ESLint** - Consistent code style
- **Prettier** - Automatic code formatting
- **Conventional Commits** - Standardized commit messages
- **Test Coverage** - Maintain existing coverage levels

### Adding New Features

1. **Services** - Add business logic in `packages/infrastructure/src/services/`
2. **Handlers** - Create HTTP handlers in `apps/backend/src/handlers/`
3. **Types** - Define shared types in `packages/shared-types/`
4. **Tests** - Add tests alongside implementation
5. **Documentation** - Update relevant documentation

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

**Built with ❤️ using AWS Serverless + Turborepo**

*Transforming ideas into applications through AI-powered development*

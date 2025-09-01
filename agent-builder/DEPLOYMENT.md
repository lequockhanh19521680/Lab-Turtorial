# Agent Builder - Deployment Guide

## Overview

Agent Builder is a serverless AWS application that uses AI agents to automatically generate web applications from natural language descriptions. This guide covers deployment for both development and production environments using AWS SAM.

## Architecture

### Nested Stacks Architecture

The application is organized into modular nested stacks:

- **Main Stack** (`template.yaml`): Orchestrates all nested stacks and Lambda functions
- **Database Stack** (`stacks/database.yaml`): DynamoDB tables for data persistence
- **Infrastructure Stack** (`stacks/infrastructure.yaml`): S3 buckets, SQS queues, SNS topics
- **Auth Stack** (`stacks/auth.yaml`): Cognito User Pool for authentication

### Technology Stack

- **Runtime**: Node.js 20.x
- **Framework**: AWS SAM (Serverless Application Model)
- **Database**: Amazon DynamoDB
- **Authentication**: AWS Cognito
- **API**: AWS API Gateway with OpenAPI 3.0 specification
- **Storage**: Amazon S3
- **Messaging**: Amazon SQS + SNS
- **CDN**: Amazon CloudFront

## Prerequisites

1. **AWS CLI** configured with appropriate permissions
2. **AWS SAM CLI** installed
3. **Node.js 18+** for local development
4. **TypeScript** for code compilation

### Required AWS Permissions

Your AWS IAM user/role needs the following permissions:
- CloudFormation (full access)
- Lambda (full access)
- API Gateway (full access)
- DynamoDB (full access)
- S3 (full access)
- Cognito (full access)
- SQS (full access)
- SNS (full access)
- CloudFront (full access)
- SSM Parameter Store (read/write)

## Environment Setup

### 1. Configure SSM Parameters

Before deploying, set up the required SSM parameters for your environment:

#### Development Environment

```bash
# OpenAI API Key (required for AI agents)
aws ssm put-parameter \
  --name "/agent-builder/dev/openai-api-key" \
  --value "your-openai-api-key-here" \
  --type "SecureString" \
  --description "OpenAI API key for AI agent functionality"

# Google OAuth credentials (optional - for Google login)
aws ssm put-parameter \
  --name "/agent-builder/dev/google-oauth-client-id" \
  --value "your-google-client-id" \
  --type "SecureString" \
  --description "Google OAuth Client ID"

aws ssm put-parameter \
  --name "/agent-builder/dev/google-oauth-client-secret" \
  --value "your-google-client-secret" \
  --type "SecureString" \
  --description "Google OAuth Client Secret"
```

#### Production Environment

```bash
# Production parameters
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

### 2. Build the Application

```bash
cd agent-builder/backend
npm install
npm run build
```

## Deployment

### Development Deployment

```bash
# Deploy to development environment
sam deploy --config-file samconfig.dev.toml

# Or use the default configuration (which points to dev)
sam deploy
```

### Production Deployment

```bash
# Deploy to production environment
sam deploy --config-file samconfig.prod.toml
```

### First-Time Deployment (Guided)

If you're deploying for the first time and need to set up the S3 bucket:

```bash
sam deploy --guided --config-file samconfig.dev.toml
```

This will prompt you to:
1. Create an S3 bucket for deployment artifacts
2. Confirm parameter overrides
3. Review and confirm the changeset

## Configuration Files

### samconfig.toml (Development)

```toml
version = 0.1
[default]
[default.global]
[default.global.parameters]
stack_name = "agent-builder-sam-dev"
s3_bucket = ""  # Will be auto-created
s3_prefix = "agent-builder-dev"
region = "us-east-1"
confirm_changeset = false
capabilities = "CAPABILITY_IAM"
parameter_overrides = [
    "Environment=dev"
]
```

### samconfig.prod.toml (Production)

```toml
version = 0.1
[default]
[default.global]
[default.global.parameters]
stack_name = "agent-builder-sam-prod"
s3_bucket = ""  # Will be auto-created
s3_prefix = "agent-builder-prod"
region = "us-east-1"
confirm_changeset = true  # Require manual confirmation for prod
capabilities = "CAPABILITY_IAM"
parameter_overrides = [
    "Environment=prod"
]
```

## API Documentation

The API is documented using OpenAPI 3.0 specification in `api-spec.yaml`. Key endpoints:

### Authentication
- Uses AWS Cognito User Pools
- JWT tokens required for most endpoints
- Google OAuth integration available

### Core Endpoints

#### Users
- `GET /users/profile` - Get user profile
- `POST /users` - Create/update user (OAuth callback)
- `PATCH /users/profile` - Update profile

#### Projects
- `GET /projects` - List user projects
- `POST /projects` - Create new project
- `GET /projects/{id}` - Get project details
- `PATCH /projects/{id}` - Update project
- `DELETE /projects/{id}` - Delete project

#### Tasks & Status
- `GET /projects/{id}/tasks` - Get project tasks
- `GET /projects/{id}/status` - Get project status

#### Artifacts
- `GET /projects/{id}/artifacts` - Get project artifacts
- `POST /artifacts` - Create artifact

## Database Schema

### Tables Created

1. **Users Table**
   - Primary Key: `userId`
   - Attributes: email, name, provider info, timestamps

2. **Projects Table**
   - Primary Key: `id`
   - GSI: `UserIndex` on `userId`
   - Attributes: projectName, requestPrompt, status, timestamps

3. **Tasks Table**
   - Primary Key: `projectId`, Sort Key: `taskId`
   - Attributes: assignedAgent, status, dependencies, progress

4. **Artifacts Table**
   - Primary Key: `projectId`, Sort Key: `artifactId`
   - Attributes: artifactType, location, version, metadata

5. **Connections Table** (WebSocket)
   - Primary Key: `connectionId`
   - GSI: `ProjectIndex` on `projectId`
   - TTL enabled for automatic cleanup

## Monitoring and Logs

### CloudWatch Logs

All Lambda functions automatically log to CloudWatch. Log groups are named:
- `/aws/lambda/agent-builder-sam-{env}-UsersFunction-{id}`
- `/aws/lambda/agent-builder-sam-{env}-ProjectsFunction-{id}`
- etc.

### Metrics

Monitor these key metrics:
- API Gateway 4xx/5xx errors
- Lambda duration and errors
- DynamoDB throttling
- SQS queue depth

## Troubleshooting

### Common Issues

1. **502 Bad Gateway Errors**
   - Check Lambda function logs
   - Verify environment variables are set correctly
   - Ensure proper IAM permissions

2. **CORS Issues**
   - Verify API Gateway CORS configuration
   - Check that frontend is using correct headers
   - Ensure preflight OPTIONS requests work

3. **Authentication Failures**
   - Verify Cognito User Pool configuration
   - Check JWT token format and expiration
   - Ensure proper scopes are granted

4. **SSM Parameter Errors**
   - Verify parameters exist in correct environment
   - Check IAM permissions for SSM access
   - Ensure parameter names match exactly

### Debug Commands

```bash
# Check stack status
aws cloudformation describe-stacks --stack-name agent-builder-sam-dev

# View recent logs
sam logs -n UsersFunction --stack-name agent-builder-sam-dev --tail

# Local testing
sam local start-api

# Validate template
sam validate
```

## Security Considerations

1. **API Security**
   - All endpoints require authentication except user creation
   - CORS configured to prevent unauthorized origins
   - Input validation on all endpoints

2. **Data Protection**
   - DynamoDB point-in-time recovery enabled
   - SSM parameters encrypted with AWS KMS
   - S3 buckets with appropriate access policies

3. **Access Control**
   - IAM roles follow least privilege principle
   - User isolation through userId filtering
   - Resource-based policies where applicable

## Cleanup

To remove the entire stack:

```bash
# Delete development stack
aws cloudformation delete-stack --stack-name agent-builder-sam-dev

# Delete production stack
aws cloudformation delete-stack --stack-name agent-builder-sam-prod

# Clean up S3 buckets (if not automatically deleted)
aws s3 rb s3://your-artifacts-bucket --force
aws s3 rb s3://your-frontend-bucket --force
```

## Support

For issues and questions:
- Check CloudWatch logs for error details
- Review this deployment guide
- Open GitHub issues for bugs or feature requests
- Contact the development team for production issues

## Environment Variables Reference

### Lambda Environment Variables

All functions automatically receive:

- `NODE_ENV`: "production"
- `USERS_TABLE`: DynamoDB Users table name
- `PROJECTS_TABLE`: DynamoDB Projects table name
- `TASKS_TABLE`: DynamoDB Tasks table name
- `ARTIFACTS_TABLE`: DynamoDB Artifacts table name
- `CONNECTIONS_TABLE`: DynamoDB Connections table name
- `ARTIFACTS_BUCKET`: S3 artifacts bucket name
- `AGENT_TASK_QUEUE_URL`: SQS queue URL
- `PROJECT_NOTIFICATION_TOPIC_ARN`: SNS topic ARN
- `WEBSOCKET_API_ENDPOINT`: WebSocket API endpoint
- `OPENAI_API_KEY_PARAM`: SSM parameter path for OpenAI key
- `GOOGLE_CLIENT_ID_PARAM`: SSM parameter path for Google client ID
- `GOOGLE_CLIENT_SECRET_PARAM`: SSM parameter path for Google client secret

These are automatically configured by the CloudFormation template.
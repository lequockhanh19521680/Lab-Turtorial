# 🚀 Deployment Guide - Lab Tutorial

## Overview

This guide provides comprehensive instructions for deploying Lab Tutorial in development, staging, and production environments. Lab Tutorial uses AWS Serverless architecture with Infrastructure as Code (IaC) principles.

## Prerequisites

### Required Tools

1. **AWS CLI v2** - Latest version recommended
2. **AWS SAM CLI v1.100+** - For serverless application deployment
3. **Node.js 18+** - Runtime for local development and build processes
4. **npm 8+** - Package manager for dependencies
5. **Git** - Version control
6. **Docker** (optional) - For local Lambda testing

### Installation Commands

```bash
# Install AWS CLI (macOS)
brew install awscli

# Install AWS CLI (Linux)
curl "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o "awscliv2.zip"
unzip awscliv2.zip
sudo ./aws/install

# Install SAM CLI
pip install aws-sam-cli

# Verify installations
aws --version
sam --version
node --version
npm --version
```

### AWS Account Setup

1. **AWS Account**: Active AWS account with billing enabled
2. **IAM User**: User with appropriate permissions (see permissions section below)
3. **AWS Profile**: Configured local AWS profile

```bash
# Configure AWS credentials
aws configure
# Enter:
# - AWS Access Key ID
# - AWS Secret Access Key  
# - Default region (e.g., us-east-1)
# - Default output format (json)
```

## Required AWS Permissions

### IAM Policy for Deployment User

Create an IAM policy with the following permissions:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Action": [
        "cloudformation:*",
        "lambda:*",
        "apigateway:*",
        "dynamodb:*",
        "s3:*",
        "cognito-idp:*",
        "sqs:*",
        "sns:*",
        "cloudfront:*",
        "iam:CreateRole",
        "iam:DeleteRole",
        "iam:GetRole",
        "iam:PassRole",
        "iam:AttachRolePolicy",
        "iam:DetachRolePolicy",
        "iam:CreatePolicy",
        "iam:DeletePolicy",
        "iam:GetPolicy",
        "iam:ListPolicyVersions",
        "logs:*",
        "xray:*",
        "ssm:GetParameter",
        "ssm:PutParameter",
        "ssm:DeleteParameter",
        "events:*"
      ],
      "Resource": "*"
    }
  ]
}
```

### Service-Linked Roles

Ensure the following service-linked roles exist:
- `AWSServiceRoleForAPIGateway`
- `AWSServiceRoleForLambda`
- `AWSServiceRoleForDynamoDB`

## Environment Configuration

### Environment Variables

Create environment-specific configuration files:

#### `.env.development`
```bash
# Development Environment
NODE_ENV=development
AWS_REGION=us-east-1
STAGE=dev

# API Configuration
API_DOMAIN=api-dev.labtutorial.com
FRONTEND_URL=https://dev.labtutorial.com
CORS_ORIGINS=https://dev.labtutorial.com,http://localhost:3000

# OpenAI Configuration
OPENAI_API_KEY=sk-your-development-key
OPENAI_MODEL=gpt-3.5-turbo

# Database Configuration
DYNAMODB_TABLE_PREFIX=lab-tutorial-dev

# Authentication
COGNITO_USER_POOL_DOMAIN=lab-tutorial-dev
JWT_SECRET=your-development-jwt-secret

# Storage
S3_BUCKET_PREFIX=lab-tutorial-dev
CLOUDFRONT_DISTRIBUTION_ID=your-dev-distribution-id

# Monitoring
LOG_LEVEL=debug
ENABLE_XRAY=true
```

#### `.env.production`
```bash
# Production Environment
NODE_ENV=production
AWS_REGION=us-east-1
STAGE=prod

# API Configuration
API_DOMAIN=api.labtutorial.com
FRONTEND_URL=https://labtutorial.com
CORS_ORIGINS=https://labtutorial.com

# OpenAI Configuration
OPENAI_API_KEY=sk-your-production-key
OPENAI_MODEL=gpt-4

# Database Configuration
DYNAMODB_TABLE_PREFIX=lab-tutorial-prod

# Authentication
COGNITO_USER_POOL_DOMAIN=lab-tutorial
JWT_SECRET=your-production-jwt-secret

# Storage
S3_BUCKET_PREFIX=lab-tutorial-prod
CLOUDFRONT_DISTRIBUTION_ID=your-prod-distribution-id

# Monitoring
LOG_LEVEL=info
ENABLE_XRAY=true
```

## Development Environment Setup

### Local Development

1. **Clone Repository**
```bash
git clone https://github.com/lequockhanh19521680/Lab-Turtorial.git
cd Lab-Turtorial
```

2. **Install Dependencies**
```bash
npm install
```

3. **Environment Configuration**
```bash
# Copy environment template
cp apps/frontend/.env.local.example apps/frontend/.env.local
cp apps/backend/.env.example apps/backend/.env

# Edit environment files with your values
nano apps/frontend/.env.local
nano apps/backend/.env
```

4. **Start Development Servers**
```bash
# Start all services
npm run dev

# Or start individually
npm run dev:frontend  # Frontend on http://localhost:3000
npm run dev:backend   # Backend API simulation
```

### Local Testing with SAM

1. **Build Application**
```bash
cd apps/backend
sam build
```

2. **Start Local API**
```bash
# Start API Gateway and Lambda locally
sam local start-api --port 3001

# Test with environment variables
sam local start-api --env-vars env.json --port 3001
```

3. **Test Lambda Functions**
```bash
# Test individual function
sam local invoke CreateProjectFunction --event test-events/create-project.json

# Test with debugger
sam local invoke CreateProjectFunction --event test-events/create-project.json --debug-port 5858
```

## Production Deployment

### Step 1: Backend Deployment

1. **Prepare Deployment Package**
```bash
cd apps/backend

# Install production dependencies in Lambda layer
cd layers/common-deps/nodejs
npm ci --only=production
cd ../../..

# Build TypeScript code
npm run build
```

2. **Deploy with SAM**
```bash
# First deployment (guided)
sam deploy --guided

# Subsequent deployments
sam deploy

# Deploy with specific parameters
sam deploy \
  --parameter-overrides \
    Environment=production \
    OpenAIApiKey=sk-your-key \
    DomainName=api.labtutorial.com
```

3. **Deploy to Specific Environment**
```bash
# Deploy to staging
sam deploy --config-env staging

# Deploy to production
sam deploy --config-env production
```

### Step 2: Frontend Deployment

1. **Build Frontend**
```bash
cd apps/frontend

# Install dependencies
npm ci

# Build for production
npm run build
```

2. **Deploy to S3 + CloudFront**
```bash
# Deploy using AWS CLI
aws s3 sync dist/ s3://your-frontend-bucket-name --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation \
  --distribution-id YOUR_DISTRIBUTION_ID \
  --paths "/*"
```

3. **Automated Deployment Script**
```bash
#!/bin/bash
# deploy-frontend.sh

set -e

ENVIRONMENT=${1:-production}
BUCKET_NAME="lab-tutorial-frontend-${ENVIRONMENT}"
DISTRIBUTION_ID=$(aws cloudformation describe-stacks \
  --stack-name lab-tutorial-infrastructure-${ENVIRONMENT} \
  --query 'Stacks[0].Outputs[?OutputKey==`CloudFrontDistributionId`].OutputValue' \
  --output text)

echo "Building frontend for ${ENVIRONMENT}..."
npm run build

echo "Deploying to S3 bucket: ${BUCKET_NAME}..."
aws s3 sync dist/ s3://${BUCKET_NAME} --delete

echo "Invalidating CloudFront distribution: ${DISTRIBUTION_ID}..."
aws cloudfront create-invalidation \
  --distribution-id ${DISTRIBUTION_ID} \
  --paths "/*"

echo "Deployment completed successfully!"
```

### Step 3: Database Setup

1. **Create DynamoDB Tables**
```bash
# Tables are created automatically via SAM template
# Verify table creation
aws dynamodb list-tables --region us-east-1
```

2. **Seed Initial Data** (Optional)
```bash
# Run data seeding script
cd apps/backend
npm run seed:production
```

### Step 4: Domain Configuration

1. **Route 53 Setup**
```bash
# Create hosted zone
aws route53 create-hosted-zone \
  --name labtutorial.com \
  --caller-reference $(date +%s)

# Add DNS records
aws route53 change-resource-record-sets \
  --hosted-zone-id YOUR_ZONE_ID \
  --change-batch file://dns-changes.json
```

2. **SSL Certificate**
```bash
# Request certificate via ACM
aws acm request-certificate \
  --domain-name labtutorial.com \
  --subject-alternative-names "*.labtutorial.com" \
  --validation-method DNS \
  --region us-east-1
```

## CI/CD Pipeline Setup

### GitHub Actions Configuration

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to AWS

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

env:
  AWS_REGION: us-east-1
  NODE_VERSION: 18

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Install dependencies
        run: npm ci
      
      - name: Run tests
        run: npm run test
      
      - name: Run linting
        run: npm run lint
      
      - name: Type checking
        run: npm run type-check

  deploy-backend:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/backend
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Setup SAM CLI
        uses: aws-actions/setup-sam@v2
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Build SAM application
        run: sam build
      
      - name: Deploy to AWS
        run: |
          sam deploy \
            --no-confirm-changeset \
            --no-fail-on-empty-changeset \
            --parameter-overrides \
              Environment=production \
              OpenAIApiKey=${{ secrets.OPENAI_API_KEY }}

  deploy-frontend:
    needs: [test, deploy-backend]
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: apps/frontend
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'npm'
      
      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v2
        with:
          aws-access-key-id: ${{ secrets.AWS_ACCESS_KEY_ID }}
          aws-secret-access-key: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
          aws-region: ${{ env.AWS_REGION }}
      
      - name: Install dependencies
        run: npm ci
      
      - name: Build application
        run: npm run build
        env:
          VITE_API_URL: https://api.labtutorial.com
          VITE_COGNITO_USER_POOL_ID: ${{ secrets.COGNITO_USER_POOL_ID }}
          VITE_COGNITO_CLIENT_ID: ${{ secrets.COGNITO_CLIENT_ID }}
      
      - name: Deploy to S3
        run: |
          aws s3 sync dist/ s3://lab-tutorial-frontend-production --delete
      
      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id ${{ secrets.CLOUDFRONT_DISTRIBUTION_ID }} \
            --paths "/*"
```

### Required GitHub Secrets

Add these secrets to your GitHub repository:

```
AWS_ACCESS_KEY_ID=your-access-key
AWS_SECRET_ACCESS_KEY=your-secret-key
OPENAI_API_KEY=sk-your-openai-key
COGNITO_USER_POOL_ID=us-east-1_xxxxxxx
COGNITO_CLIENT_ID=your-client-id
CLOUDFRONT_DISTRIBUTION_ID=your-distribution-id
```

## Environment-Specific Configurations

### SAM Configuration Files

Create `samconfig.toml` for different environments:

```toml
version = 0.1

[default.deploy.parameters]
stack_name = "lab-tutorial-backend"
s3_bucket = "lab-tutorial-sam-artifacts"
s3_prefix = "lab-tutorial"
region = "us-east-1"
capabilities = "CAPABILITY_IAM"
parameter_overrides = "Environment=development"

[staging.deploy.parameters]
stack_name = "lab-tutorial-backend-staging"
s3_bucket = "lab-tutorial-sam-artifacts-staging"
s3_prefix = "lab-tutorial-staging"
region = "us-east-1"
capabilities = "CAPABILITY_IAM"
parameter_overrides = "Environment=staging"

[production.deploy.parameters]
stack_name = "lab-tutorial-backend-production"
s3_bucket = "lab-tutorial-sam-artifacts-production"
s3_prefix = "lab-tutorial-production"
region = "us-east-1"
capabilities = "CAPABILITY_IAM"
parameter_overrides = "Environment=production"
confirm_changeset = true
```

## Monitoring Setup

### CloudWatch Dashboards

1. **Create Custom Dashboard**
```bash
aws cloudwatch put-dashboard \
  --dashboard-name "LabTutorial-Production" \
  --dashboard-body file://cloudwatch-dashboard.json
```

2. **Dashboard Configuration (cloudwatch-dashboard.json)**
```json
{
  "widgets": [
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/Lambda", "Invocations", "FunctionName", "CreateProjectFunction"],
          ["AWS/Lambda", "Errors", "FunctionName", "CreateProjectFunction"],
          ["AWS/Lambda", "Duration", "FunctionName", "CreateProjectFunction"]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "us-east-1",
        "title": "Lambda Metrics"
      }
    },
    {
      "type": "metric",
      "properties": {
        "metrics": [
          ["AWS/DynamoDB", "ConsumedReadCapacityUnits", "TableName", "lab-tutorial-prod-projects"],
          ["AWS/DynamoDB", "ConsumedWriteCapacityUnits", "TableName", "lab-tutorial-prod-projects"]
        ],
        "period": 300,
        "stat": "Sum",
        "region": "us-east-1",
        "title": "DynamoDB Metrics"
      }
    }
  ]
}
```

### Alerting Setup

1. **Create SNS Topic for Alerts**
```bash
aws sns create-topic --name lab-tutorial-alerts
aws sns subscribe \
  --topic-arn arn:aws:sns:us-east-1:123456789012:lab-tutorial-alerts \
  --protocol email \
  --notification-endpoint alerts@labtutorial.com
```

2. **CloudWatch Alarms**
```bash
# Lambda error rate alarm
aws cloudwatch put-metric-alarm \
  --alarm-name "LabTutorial-Lambda-Errors" \
  --alarm-description "Lambda function error rate too high" \
  --metric-name "Errors" \
  --namespace "AWS/Lambda" \
  --statistic "Sum" \
  --period 300 \
  --threshold 5 \
  --comparison-operator "GreaterThanThreshold" \
  --alarm-actions "arn:aws:sns:us-east-1:123456789012:lab-tutorial-alerts"
```

## Security Configuration

### WAF Setup

1. **Create Web ACL**
```bash
aws wafv2 create-web-acl \
  --name lab-tutorial-waf \
  --scope CLOUDFRONT \
  --default-action Allow={} \
  --rules file://waf-rules.json
```

2. **Associate with CloudFront**
```bash
aws cloudfront update-distribution \
  --id YOUR_DISTRIBUTION_ID \
  --distribution-config file://distribution-config.json
```

### SSL/TLS Configuration

1. **SSL Certificate Validation**
```bash
# Verify certificate status
aws acm describe-certificate \
  --certificate-arn YOUR_CERTIFICATE_ARN \
  --region us-east-1
```

2. **Security Headers**
Add to CloudFront response headers policy:
```json
{
  "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
  "X-Content-Type-Options": "nosniff",
  "X-Frame-Options": "DENY",
  "X-XSS-Protection": "1; mode=block",
  "Referrer-Policy": "strict-origin-when-cross-origin"
}
```

## Backup & Recovery

### DynamoDB Backup

1. **Enable Point-in-Time Recovery**
```bash
aws dynamodb update-continuous-backups \
  --table-name lab-tutorial-prod-projects \
  --point-in-time-recovery-specification PointInTimeRecoveryEnabled=true
```

2. **Create Manual Backup**
```bash
aws dynamodb create-backup \
  --table-name lab-tutorial-prod-projects \
  --backup-name "lab-tutorial-projects-$(date +%Y%m%d)"
```

### S3 Backup

1. **Enable Versioning**
```bash
aws s3api put-bucket-versioning \
  --bucket lab-tutorial-frontend-production \
  --versioning-configuration Status=Enabled
```

2. **Cross-Region Replication**
```bash
aws s3api put-bucket-replication \
  --bucket lab-tutorial-frontend-production \
  --replication-configuration file://replication-config.json
```

## Troubleshooting

### Common Deployment Issues

**SAM Build Failures**
```bash
# Clear SAM cache
sam build --use-container --parallel

# Debug build issues
sam build --debug
```

**CloudFormation Stack Issues**
```bash
# View stack events
aws cloudformation describe-stack-events \
  --stack-name lab-tutorial-backend

# Check stack status
aws cloudformation describe-stacks \
  --stack-name lab-tutorial-backend
```

**Permission Issues**
```bash
# Validate IAM permissions
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::123456789012:user/deployment-user \
  --action-names cloudformation:CreateStack \
  --resource-arns arn:aws:cloudformation:us-east-1:123456789012:stack/lab-tutorial-backend/*
```

### Rollback Procedures

1. **Application Rollback**
```bash
# Rollback to previous version
sam deploy --parameter-overrides Version=previous

# CloudFormation rollback
aws cloudformation cancel-update-stack \
  --stack-name lab-tutorial-backend
```

2. **Database Rollback**
```bash
# Restore from point-in-time
aws dynamodb restore-table-from-backup \
  --target-table-name lab-tutorial-projects-restored \
  --backup-arn arn:aws:dynamodb:us-east-1:123456789012:backup/lab-tutorial-projects
```

### Performance Optimization

1. **Lambda Performance**
```bash
# Enable provisioned concurrency
aws lambda put-provisioned-concurrency-config \
  --function-name CreateProjectFunction \
  --qualifier $LATEST \
  --provisioned-concurrency-units 5
```

2. **DynamoDB Performance**
```bash
# Enable auto-scaling
aws application-autoscaling register-scalable-target \
  --service-namespace dynamodb \
  --resource-id table/lab-tutorial-prod-projects \
  --scalable-dimension dynamodb:table:WriteCapacityUnits \
  --min-capacity 5 \
  --max-capacity 100
```

---

*This deployment guide provides comprehensive instructions for deploying Lab Tutorial across different environments. For additional support, refer to the AWS documentation or contact the development team.*
# Deployment Guide - Lab Tutorial Backend

## Overview

This guide covers the deployment of the Lab Tutorial Backend application using AWS SAM (Serverless Application Model) with Canary deployment strategies for safe production releases.

## Critical Issues Fixed

### ERR_MODULE_NOT_FOUND Resolution

**Issue:** When using ES Modules (`"module": "ESNext"` in tsconfig.json), Node.js requires file extensions (.js) in relative imports.

**Solution:** The build process now automatically adds `.js` extensions to import statements in compiled JavaScript files:
- Fixed imports in handler files to properly reference utils modules  
- Created automated `fix-import-paths.js` script that runs during build
- Ensures ES module compatibility with Node.js runtime

**Verification:** Run `npm run sam:local` - handlers now load successfully without module resolution errors.

## Prerequisites

- AWS CLI installed and configured
- SAM CLI installed (version 1.5+)
- Node.js 18+ 
- Docker installed (for local testing)

## Project Structure

```
apps/backend/
├── src/
│   ├── handlers/          # Lambda function handlers
│   ├── utils/            # Shared utility modules  
│   ├── agents/           # AI agent implementations
│   └── models/           # TypeScript interfaces
├── scripts/              # Build and deployment scripts
├── template.yaml         # SAM template with Canary deployment
├── samconfig.dev.toml    # Development configuration
└── samconfig.prod.toml   # Production configuration
```

## Build Scripts (Simplified)

```json
{
  "build": "tsc && npm run fix-imports",
  "test": "jest", 
  "lint": "eslint src --ext .ts",
  "clean": "rm -rf dist .aws-sam",
  "sam:build": "npm run clean && npm run build && npm run copy-deps && npm run postbuild && sam build",
  "sam:local": "sam local start-api",
  "deploy:dev": "npm run sam:build && sam deploy --config-file samconfig.dev.toml --resolve-s3",
  "deploy:prod": "npm run sam:build && sam deploy --config-file samconfig.prod.toml --resolve-s3"
}
```

## Canary Deployment Strategy

### Configuration

The `ProjectsFunction` is configured with Canary deployment in `template.yaml`:

```yaml
ProjectsFunction:
  Type: AWS::Serverless::Function
  Properties:
    AutoPublishAlias: live
    DeploymentPreference:
      Type: Canary10Percent5Minutes
      Alarms:
        - !Ref AliasErrorMetricGreaterThanZeroAlarm
        - !Ref LatestVersionErrorMetricGreaterThanZeroAlarm
```

### How Canary Deployment Works

1. **Initial Deployment**: 10% of traffic routes to new version
2. **Monitoring Period**: 5 minutes of observation
3. **Health Checks**: CloudWatch alarms monitor error rates
4. **Automatic Rollback**: If errors detected, traffic routes back to previous version
5. **Full Deployment**: If no issues, 100% traffic shifts to new version

### Monitoring Alarms

Two CloudWatch alarms monitor the deployment:

- **AliasErrorMetricGreaterThanZeroAlarm**: Monitors the alias (live) version
- **LatestVersionErrorMetricGreaterThanZeroAlarm**: Monitors the latest deployed version

Both alarms trigger rollback if error rate exceeds threshold.

## Deployment Process

### Development Environment

```bash
# 1. Build and test locally
npm run build
npm run test
npm run lint

# 2. Test with SAM local
npm run sam:local

# 3. Deploy to development
npm run deploy:dev
```

### Production Environment  

```bash
# 1. Ensure all tests pass
npm run test
npm run lint

# 2. Build and deploy with Canary
npm run deploy:prod

# 3. Monitor deployment in AWS Console
# - CloudWatch Alarms
# - Lambda function metrics
# - API Gateway metrics
```

## Monitoring Canary Deployments

### AWS Console Monitoring

1. **Lambda Console**:
   - Go to Lambda → Functions → ProjectsFunction
   - Check "Aliases" tab for traffic distribution
   - Monitor "Monitoring" tab for metrics

2. **CloudWatch Console**:
   - Check alarm status in CloudWatch → Alarms
   - View Lambda metrics: Errors, Duration, Throttles
   - Set up custom dashboards for deployment monitoring

### Key Metrics to Watch

- **Error Rate**: Should remain at 0% during canary period
- **Duration**: Ensure performance doesn't degrade
- **Throttles**: Check for capacity issues
- **Invocations**: Monitor traffic distribution

### Manual Rollback

If needed, manually rollback via AWS CLI:

```bash
# Get current alias configuration
aws lambda get-alias --function-name ProjectsFunction --name live

# Update alias to point to previous version
aws lambda update-alias \
  --function-name ProjectsFunction \
  --name live \
  --function-version <previous-version> \
  --routing-config AdditionalVersionWeights={}
```

## Configuration Files

### samconfig.dev.toml
```toml
version = 0.1
[default]
[default.global]
[default.global.parameters]
stack_name = "agent-builder-sam-dev"
s3_bucket = ""  # Auto-created
s3_prefix = "agent-builder-dev" 
region = "us-east-1"
confirm_changeset = false
capabilities = "CAPABILITY_IAM"
parameter_overrides = ["Environment=dev"]
```

### samconfig.prod.toml
```toml
version = 0.1
[default]
[default.global]
[default.global.parameters]
stack_name = "agent-builder-sam-prod"
s3_bucket = ""  # Auto-created
s3_prefix = "agent-builder-prod"
region = "us-east-1" 
confirm_changeset = true  # Require confirmation
capabilities = "CAPABILITY_IAM"
parameter_overrides = ["Environment=prod"]
```

## Troubleshooting

### Common Issues

#### ERR_MODULE_NOT_FOUND Errors
**Cause**: Missing `.js` extensions in ES module imports  
**Solution**: Run `npm run build` - the fix-import-paths script handles this automatically

#### Build Failures
**Cause**: Missing dependencies or TypeScript errors
**Solution**: 
```bash
npm install
npm run type-check
npm run lint
```

#### SAM Build Failures
**Cause**: Infrastructure package not built
**Solution**:
```bash
cd ../../packages/infrastructure
npm run build
cd ../../apps/backend
npm run sam:build
```

#### Lambda Runtime Errors
**Cause**: Environment variables or permissions issues
**Solution**: Check CloudWatch logs and verify IAM policies

### Debugging Commands

```bash
# Check build output
npm run build
ls -la dist/

# Validate SAM template
sam validate

# Check logs
sam logs --name ProjectsFunction --stack-name agent-builder-sam-dev

# Test specific function locally
sam local invoke ProjectsFunction --event test-events/get-projects.json
```

## Security Considerations

### IAM Permissions
- Functions use least-privilege IAM policies
- DynamoDB access scoped to specific tables
- SSM parameter access restricted by path

### API Security
- Consider adding AWS Cognito authorizers
- Implement rate limiting via API Gateway
- Use HTTPS only in production

### Secrets Management
- Store sensitive data in SSM Parameter Store
- Use SecureString type for encryption
- Rotate credentials regularly

## Best Practices

### Code Quality
- Run linting and tests before deployment
- Use TypeScript for type safety
- Follow consistent coding standards

### Deployment Safety
- Always use Canary deployments for production
- Monitor deployments actively
- Have rollback plans ready
- Test in development environment first

### Performance
- Monitor Lambda cold starts
- Optimize bundle sizes
- Use provisioned concurrency if needed
- Set appropriate timeout values

## Support and Maintenance

### Logging
- All functions log to CloudWatch automatically
- Log groups: `/aws/lambda/agent-builder-sam-{env}-{FunctionName}-{id}`
- Set appropriate log retention periods

### Backups
- DynamoDB tables have point-in-time recovery enabled
- S3 buckets use versioning
- Regular backup testing recommended

### Updates
- Follow semantic versioning
- Update dependencies regularly
- Test updates in development first
- Document breaking changes

## Contact

For deployment issues:
- Check CloudWatch logs first
- Review this deployment guide
- Open GitHub issues for bugs
- Contact development team for production issues
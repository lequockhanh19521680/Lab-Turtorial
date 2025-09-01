# Local Testing Guide

This directory contains sample event files for testing Lambda functions locally using SAM.

## Prerequisites

1. Install AWS SAM CLI: https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/install-sam-cli.html
2. Build the project: `npm run build`
3. Build SAM: `sam build`

## API Gateway Functions

Test API Gateway functions using these sample events:

### Projects API
```bash
# Test getting user projects
sam local invoke ProjectsFunction -e test-events/get-projects.json

# Test creating a new project  
sam local invoke ProjectsFunction -e test-events/create-project.json
```

### Tasks API
```bash
# Test getting project tasks
sam local invoke TasksFunction -e test-events/get-project-tasks.json
```

### Orchestrator API
```bash
# Test starting project orchestration
sam local invoke OrchestratorFunction -e test-events/start-orchestration.json
```

## SQS/SNS Functions

Test queue/notification handlers:

### Agent Worker (SQS)
```bash
# Test agent task processing
sam local invoke AgentWorkerFunction -e test-events/agent-worker-sqs.json
```

### Notification Handler (SNS)
```bash
# Test notification processing
sam local invoke NotificationFunction -e test-events/notification-handler-sns.json
```

## Running Local API Server

Start the entire API locally:

```bash
# Start local API Gateway
sam local start-api

# Test endpoints with curl
curl http://localhost:3000/projects
curl -X POST http://localhost:3000/projects -d '{"projectName":"Test","requestPrompt":"Create a blog"}' -H "Content-Type: application/json"
```

## Notes

- The test events use dummy data and mock authorization tokens
- DynamoDB operations will fail without local DynamoDB or proper AWS credentials
- For full end-to-end testing, set up local DynamoDB or use AWS credentials for a dev environment
- Modify the event JSON files as needed for your specific test scenarios

## Error Handling Verification

These events can be used to verify that the Lambda functions handle errors gracefully and don't crash with unhandled exceptions (which would cause 502 errors).
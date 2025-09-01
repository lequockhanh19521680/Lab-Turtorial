#!/bin/bash

# Agent Builder Deployment Script

set -e

ENVIRONMENT=${1:-dev}
REGION=${2:-us-east-1}

echo "🚀 Deploying Agent Builder to $ENVIRONMENT environment in $REGION"

# Build backend
echo "📦 Building backend..."
cd backend
npm run build

# Deploy backend infrastructure
echo "🏗️ Deploying backend infrastructure..."
sam deploy \
  --parameter-overrides Environment=$ENVIRONMENT \
  --region $REGION \
  --confirm-changeset \
  --resolve-s3

# Get API endpoint
API_ENDPOINT=$(aws cloudformation describe-stacks \
  --stack-name agent-builder-$ENVIRONMENT \
  --region $REGION \
  --query 'Stacks[0].Outputs[?OutputKey==`ApiGatewayEndpoint`].OutputValue' \
  --output text)

echo "✅ Backend deployed: $API_ENDPOINT"

# Build frontend with API endpoint
echo "📦 Building frontend..."
cd ../frontend
export VITE_API_BASE_URL=$API_ENDPOINT
npm run build

# Deploy frontend to S3
echo "🌐 Deploying frontend..."
BUCKET_NAME="agent-builder-frontend-$ENVIRONMENT"

# Create S3 bucket if it doesn't exist
aws s3 mb s3://$BUCKET_NAME --region $REGION 2>/dev/null || true

# Configure bucket for static website hosting
aws s3 website s3://$BUCKET_NAME \
  --index-document index.html \
  --error-document index.html

# Upload files
aws s3 sync dist/ s3://$BUCKET_NAME --delete

# Set public read permissions
aws s3api put-bucket-policy \
  --bucket $BUCKET_NAME \
  --policy '{
    "Version": "2012-10-17",
    "Statement": [{
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::'$BUCKET_NAME'/*"
    }]
  }'

FRONTEND_URL="http://$BUCKET_NAME.s3-website-$REGION.amazonaws.com"

echo "✅ Frontend deployed: $FRONTEND_URL"
echo ""
echo "🎉 Agent Builder deployment complete!"
echo "📱 Frontend: $FRONTEND_URL"
echo "🔗 API: $API_ENDPOINT"
echo ""
echo "Next steps:"
echo "1. Configure custom domain (optional)"
echo "2. Set up CloudFront distribution (recommended)"
echo "3. Configure monitoring and alerts"
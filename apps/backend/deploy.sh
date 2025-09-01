#!/bin/bash

# Agent Builder Deployment Script
# Usage: ./deploy.sh [environment] [architecture]
# environment: dev|prod (default: dev)
# architecture: nested|monolith (default: nested)

set -e

ENVIRONMENT=${1:-dev}
ARCHITECTURE=${2:-nested}

echo "🚀 Deploying Agent Builder"
echo "Environment: $ENVIRONMENT"
echo "Architecture: $ARCHITECTURE"

# Validate inputs
if [[ ! "$ENVIRONMENT" =~ ^(dev|prod)$ ]]; then
    echo "❌ Error: Environment must be 'dev' or 'prod'"
    exit 1
fi

if [[ ! "$ARCHITECTURE" =~ ^(nested|monolith)$ ]]; then
    echo "❌ Error: Architecture must be 'nested' or 'monolith'"
    exit 1
fi

# Set template file based on architecture
if [ "$ARCHITECTURE" = "nested" ]; then
    TEMPLATE_FILE="template-nested.yaml"
else
    TEMPLATE_FILE="template.yaml"
fi

# Set config file based on environment
CONFIG_FILE="samconfig.${ENVIRONMENT}.toml"

echo "📋 Using template: $TEMPLATE_FILE"
echo "📋 Using config: $CONFIG_FILE"

# Check if TypeScript needs to be compiled
if [ ! -d "dist" ] || [ "src" -nt "dist" ]; then
    echo "🔨 Building TypeScript..."
    npm run build
fi

# Validate template
echo "✅ Validating template..."
sam validate --template "$TEMPLATE_FILE" --region us-east-1

# Build SAM application
echo "🔨 Building SAM application..."
sam build --template "$TEMPLATE_FILE"

# Deploy
echo "🚀 Deploying to $ENVIRONMENT..."
if [ "$ENVIRONMENT" = "prod" ]; then
    echo "⚠️  Deploying to PRODUCTION - please review changes carefully"
    sam deploy --config-file "$CONFIG_FILE" --template "$TEMPLATE_FILE"
else
    sam deploy --config-file "$CONFIG_FILE" --template "$TEMPLATE_FILE" --no-confirm-changeset
fi

# Get outputs
echo "📄 Stack outputs:"
aws cloudformation describe-stacks \
    --stack-name "agent-builder-sam-${ENVIRONMENT}" \
    --query 'Stacks[0].Outputs[*].[OutputKey,OutputValue]' \
    --output table

echo "✅ Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Configure frontend environment variables with the API endpoint"
echo "2. Set up Google OAuth provider in Cognito (if using Google login)"
echo "3. Test API endpoints with the provided URLs"
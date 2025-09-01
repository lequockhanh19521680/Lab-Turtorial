#!/usr/bin/env node
import * as cdk from 'aws-cdk-lib';
import { AgentBuilderStack } from './agent-builder-stack';

const app = new cdk.App();

const environment = app.node.tryGetContext('environment') || 'dev';
const stackName = `agent-builder-${environment}`;

new AgentBuilderStack(app, stackName, {
  environment,
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION || 'us-east-1',
  },
});

// Add tags to all resources in the stack
cdk.Tags.of(app).add('Project', 'AgentBuilder');
cdk.Tags.of(app).add('Environment', environment);
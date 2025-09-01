import * as cdk from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as apigatewayv2 from 'aws-cdk-lib/aws-apigatewayv2';
import * as apigatewayv2integrations from 'aws-cdk-lib/aws-apigatewayv2-integrations';
import * as cognito from 'aws-cdk-lib/aws-cognito';
import * as cloudfront from 'aws-cdk-lib/aws-cloudfront';
import * as cloudfrontOrigins from 'aws-cdk-lib/aws-cloudfront-origins';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as sns from 'aws-cdk-lib/aws-sns';
import * as sqs from 'aws-cdk-lib/aws-sqs';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as stepfunctionsTasks from 'aws-cdk-lib/aws-stepfunctions-tasks';
import * as lambdaEventSources from 'aws-cdk-lib/aws-lambda-event-sources';
import { Construct } from 'constructs';

export interface AgentBuilderStackProps extends cdk.StackProps {
  environment: string;
}

export class AgentBuilderStack extends cdk.Stack {
  public readonly userPool: cognito.UserPool;
  public readonly userPoolClient: cognito.UserPoolClient;
  public readonly apiGateway: apigateway.RestApi;
  public readonly webSocketApi: apigatewayv2.WebSocketApi;

  constructor(scope: Construct, id: string, props: AgentBuilderStackProps) {
    super(scope, id, props);

    const { environment } = props;

    // DynamoDB Tables
    const projectsTable = this.createProjectsTable(environment);
    const tasksTable = this.createTasksTable(environment);
    const artifactsTable = this.createArtifactsTable(environment);
    const connectionsTable = this.createConnectionsTable(environment);

    // SQS Queues
    const { agentTaskQueue, agentTaskDLQ } = this.createSQSQueues(environment);

    // SNS Topic
    const notificationTopic = this.createNotificationTopic(environment);

    // S3 Buckets
    const artifactsBucket = this.createArtifactsBucket(environment);
    const frontendBucket = this.createFrontendBucket(environment);

    // Cognito User Pool
    const { userPool, userPoolClient, userPoolDomain } = this.createCognitoResources(environment);
    this.userPool = userPool;
    this.userPoolClient = userPoolClient;

    // Lambda Functions
    const lambdaEnvironment = {
      NODE_ENV: 'production',
      PROJECTS_TABLE: projectsTable.tableName,
      TASKS_TABLE: tasksTable.tableName,
      ARTIFACTS_TABLE: artifactsTable.tableName,
      ARTIFACTS_BUCKET: artifactsBucket.bucketName,
      AGENT_TASK_QUEUE_URL: agentTaskQueue.queueUrl,
      PROJECT_NOTIFICATION_TOPIC_ARN: notificationTopic.topicArn,
      CONNECTIONS_TABLE: connectionsTable.tableName,
    };

    // Create Lambda functions
    const lambdaFunctions = this.createLambdaFunctions(
      environment,
      lambdaEnvironment,
      projectsTable,
      tasksTable,
      artifactsTable,
      connectionsTable,
      artifactsBucket,
      agentTaskQueue,
      notificationTopic
    );

    // API Gateway
    this.apiGateway = this.createAPIGateway(environment, userPool, lambdaFunctions);

    // WebSocket API
    this.webSocketApi = this.createWebSocketAPI(environment, lambdaFunctions, connectionsTable);

    // Step Functions
    this.createStepFunctions(environment, lambdaFunctions);

    // CloudFront Distribution
    this.createCloudFrontDistribution(environment, frontendBucket);

    // Outputs
    this.createOutputs(environment, userPool, userPoolClient, userPoolDomain, frontendBucket);
  }

  private createProjectsTable(environment: string): dynamodb.Table {
    const table = new dynamodb.Table(this, 'ProjectsTable', {
      tableName: `agent-builder-projects-${environment}`,
      partitionKey: { name: 'id', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true }, // Fixed deprecated API
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'UserIndex',
      partitionKey: { name: 'userId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    return table;
  }

  private createTasksTable(environment: string): dynamodb.Table {
    return new dynamodb.Table(this, 'TasksTable', {
      tableName: `agent-builder-tasks-${environment}`,
      partitionKey: { name: 'projectId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'taskId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
  }

  private createArtifactsTable(environment: string): dynamodb.Table {
    return new dynamodb.Table(this, 'ArtifactsTable', {
      tableName: `agent-builder-artifacts-${environment}`,
      partitionKey: { name: 'projectId', type: dynamodb.AttributeType.STRING },
      sortKey: { name: 'artifactId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      pointInTimeRecoverySpecification: { pointInTimeRecoveryEnabled: true },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
  }

  private createConnectionsTable(environment: string): dynamodb.Table {
    const table = new dynamodb.Table(this, 'ConnectionsTable', {
      tableName: `agent-builder-connections-${environment}`,
      partitionKey: { name: 'connectionId', type: dynamodb.AttributeType.STRING },
      billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
      timeToLiveAttribute: 'ttl',
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    table.addGlobalSecondaryIndex({
      indexName: 'ProjectIndex',
      partitionKey: { name: 'projectId', type: dynamodb.AttributeType.STRING },
      projectionType: dynamodb.ProjectionType.ALL,
    });

    return table;
  }

  private createSQSQueues(environment: string) {
    const agentTaskDLQ = new sqs.Queue(this, 'AgentTaskDLQ', {
      queueName: `agent-builder-task-dlq-${environment}`,
      retentionPeriod: cdk.Duration.days(14),
    });

    const agentTaskQueue = new sqs.Queue(this, 'AgentTaskQueue', {
      queueName: `agent-builder-task-queue-${environment}`,
      visibilityTimeout: cdk.Duration.minutes(15),
      retentionPeriod: cdk.Duration.days(14),
      deadLetterQueue: {
        queue: agentTaskDLQ,
        maxReceiveCount: 3,
      },
    });

    return { agentTaskQueue, agentTaskDLQ };
  }

  private createNotificationTopic(environment: string): sns.Topic {
    return new sns.Topic(this, 'ProjectNotificationTopic', {
      topicName: `agent-builder-notifications-${environment}`,
      displayName: 'Agent Builder Project Notifications',
    });
  }

  private createArtifactsBucket(environment: string): s3.Bucket {
    return new s3.Bucket(this, 'ArtifactsBucket', {
      bucketName: `agent-builder-artifacts-${environment}-${this.account}`,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.PUT, s3.HttpMethods.POST, s3.HttpMethods.DELETE, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
        }
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });
  }

  private createFrontendBucket(environment: string): s3.Bucket {
    const bucket = new s3.Bucket(this, 'FrontendBucket', {
      bucketName: `agent-builder-frontend-${environment}-${this.account}`,
      websiteIndexDocument: 'index.html',
      websiteErrorDocument: 'index.html',
      publicReadAccess: true,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ACLS,
      cors: [
        {
          allowedHeaders: ['*'],
          allowedMethods: [s3.HttpMethods.GET, s3.HttpMethods.HEAD],
          allowedOrigins: ['*'],
        }
      ],
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    return bucket;
  }

  private createCognitoResources(environment: string) {
    const userPool = new cognito.UserPool(this, 'UserPool', {
      userPoolName: `agent-builder-users-${environment}`,
      signInAliases: { email: true },
      autoVerify: { email: true },
      passwordPolicy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireDigits: true,
        requireSymbols: false,
      },
      standardAttributes: {
        email: { required: true, mutable: true },
        givenName: { required: false, mutable: true },
        familyName: { required: false, mutable: true },
      },
      removalPolicy: cdk.RemovalPolicy.RETAIN,
    });

    const userPoolClient = new cognito.UserPoolClient(this, 'UserPoolClient', {
      userPool,
      userPoolClientName: `agent-builder-client-${environment}`,
      generateSecret: false,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        userSrp: true,
        custom: false,
      },
      supportedIdentityProviders: [
        cognito.UserPoolClientIdentityProvider.COGNITO,
        cognito.UserPoolClientIdentityProvider.GOOGLE,
      ],
      oAuth: {
        callbackUrls: [
          environment === 'prod' 
            ? 'https://app.agent-builder.app/auth/callback'
            : `https://${environment}.agent-builder.app/auth/callback`,
          'http://localhost:3000/auth/callback',
        ],
        logoutUrls: [
          environment === 'prod' 
            ? 'https://app.agent-builder.app/auth/logout'
            : `https://${environment}.agent-builder.app/auth/logout`,
          'http://localhost:3000/auth/logout',
        ],
        flows: {
          authorizationCodeGrant: true,
          implicitCodeGrant: true,
        },
        scopes: [
          cognito.OAuthScope.EMAIL,
          cognito.OAuthScope.OPENID,
          cognito.OAuthScope.PROFILE,
        ],
      },
    });

    const userPoolDomain = new cognito.UserPoolDomain(this, 'UserPoolDomain', {
      userPool,
      cognitoDomain: {
        domainPrefix: `agent-builder-${environment}-${this.account}`,
      },
    });

    return { userPool, userPoolClient, userPoolDomain };
  }

  private createLambdaFunctions(
    environment: string,
    lambdaEnvironment: Record<string, string>,
    projectsTable: dynamodb.Table,
    tasksTable: dynamodb.Table,
    artifactsTable: dynamodb.Table,
    connectionsTable: dynamodb.Table,
    artifactsBucket: s3.Bucket,
    agentTaskQueue: sqs.Queue,
    notificationTopic: sns.Topic
  ) {
    const runtime = lambda.Runtime.NODEJS_20_X; // Updated to Node.js 20.x as requested
    const timeout = cdk.Duration.minutes(5);
    const memorySize = 1024;

    // Common policies for all Lambda functions
    const ssmPolicy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['ssm:GetParameter', 'ssm:GetParameters'],
      resources: [`arn:aws:ssm:${this.region}:${this.account}:parameter/agent-builder/${environment}/*`],
    });

    // Projects Function
    const projectsFunction = new lambda.Function(this, 'ProjectsFunction', {
      runtime,
      handler: 'projects.handler',
      code: lambda.Code.fromAsset('dist/src/handlers'), // Updated path to new layered structure
      environment: lambdaEnvironment,
      timeout,
      memorySize,
    });

    projectsTable.grantReadWriteData(projectsFunction);
    tasksTable.grantReadWriteData(projectsFunction);
    artifactsTable.grantReadWriteData(projectsFunction);

    // Agent Worker Function
    const agentWorkerFunction = new lambda.Function(this, 'AgentWorkerFunction', {
      runtime,
      handler: 'agentWorker.handler',
      code: lambda.Code.fromAsset('backend/dist/handlers'), // Keep old path for now
      environment: lambdaEnvironment,
      timeout: cdk.Duration.minutes(15),
      memorySize,
    });

    agentWorkerFunction.addEventSource(new lambdaEventSources.SqsEventSource(agentTaskQueue, {
      batchSize: 1,
    }));

    projectsTable.grantReadWriteData(agentWorkerFunction);
    tasksTable.grantReadWriteData(agentWorkerFunction);
    artifactsTable.grantReadWriteData(agentWorkerFunction);
    artifactsBucket.grantReadWrite(agentWorkerFunction);
    agentTaskQueue.grantSendMessages(agentWorkerFunction);
    agentWorkerFunction.addToRolePolicy(ssmPolicy);

    // Task Functions
    const tasksFunction = new lambda.Function(this, 'TasksFunction', {
      runtime,
      handler: 'tasks.handler',
      code: lambda.Code.fromAsset('dist/src/handlers'),
      environment: lambdaEnvironment,
      timeout,
      memorySize,
    });

    tasksTable.grantReadWriteData(tasksFunction);
    projectsTable.grantReadWriteData(tasksFunction);

    // Artifacts Function
    const artifactsFunction = new lambda.Function(this, 'ArtifactsFunction', {
      runtime,
      handler: 'artifacts.handler',
      code: lambda.Code.fromAsset('dist/src/handlers'),
      environment: lambdaEnvironment,
      timeout,
      memorySize,
    });

    artifactsTable.grantReadWriteData(artifactsFunction);
    artifactsBucket.grantReadWrite(artifactsFunction);

    // Orchestrator Function
    const orchestratorFunction = new lambda.Function(this, 'OrchestratorFunction', {
      runtime,
      handler: 'orchestrator.handler',
      code: lambda.Code.fromAsset('backend/dist/handlers'),
      environment: lambdaEnvironment,
      timeout,
      memorySize,
    });

    projectsTable.grantReadWriteData(orchestratorFunction);
    tasksTable.grantReadWriteData(orchestratorFunction);
    agentTaskQueue.grantSendMessages(orchestratorFunction);

    // Resume Execution Function
    const resumeExecutionFunction = new lambda.Function(this, 'ResumeExecutionFunction', {
      runtime,
      handler: 'resumeExecutionHandler.handler',
      code: lambda.Code.fromAsset('backend/dist/handlers'),
      environment: lambdaEnvironment,
      timeout,
      memorySize,
    });

    projectsTable.grantReadWriteData(resumeExecutionFunction);
    tasksTable.grantReadWriteData(resumeExecutionFunction);
    agentTaskQueue.grantSendMessages(resumeExecutionFunction);
    notificationTopic.grantPublish(resumeExecutionFunction);

    // Agent Functions
    const agentFunctions = this.createAgentFunctions(
      runtime,
      lambdaEnvironment,
      timeout,
      memorySize,
      projectsTable,
      tasksTable,
      artifactsTable,
      artifactsBucket,
      agentTaskQueue,
      ssmPolicy
    );

    // WebSocket Functions
    const webSocketFunctions = this.createWebSocketFunctions(
      runtime,
      lambdaEnvironment,
      timeout,
      memorySize,
      connectionsTable,
      notificationTopic
    );

    return {
      projectsFunction,
      agentWorkerFunction,
      tasksFunction,
      artifactsFunction,
      orchestratorFunction,
      resumeExecutionFunction,
      ...agentFunctions,
      ...webSocketFunctions,
    };
  }

  private createAgentFunctions(
    runtime: lambda.Runtime,
    lambdaEnvironment: Record<string, string>,
    timeout: cdk.Duration,
    memorySize: number,
    projectsTable: dynamodb.Table,
    tasksTable: dynamodb.Table,
    artifactsTable: dynamodb.Table,
    artifactsBucket: s3.Bucket,
    agentTaskQueue: sqs.Queue,
    ssmPolicy: iam.PolicyStatement
  ) {
    const agentTimeout = cdk.Duration.minutes(10);
    const agentNames = ['productManager', 'backendEngineer', 'frontendEngineer', 'devopsEngineer'];
    const functions: Record<string, lambda.Function> = {};

    agentNames.forEach(agentName => {
      const functionName = `${agentName.charAt(0).toUpperCase()}${agentName.slice(1)}Function`;
      const func = new lambda.Function(this, functionName, {
        runtime,
        handler: `${agentName}.handler`,
        code: lambda.Code.fromAsset('backend/dist/agents'),
        environment: lambdaEnvironment,
        timeout: agentTimeout,
        memorySize,
      });

      projectsTable.grantReadWriteData(func);
      tasksTable.grantReadWriteData(func);
      artifactsTable.grantReadWriteData(func);
      artifactsBucket.grantReadWrite(func);
      agentTaskQueue.grantSendMessages(func);
      func.addToRolePolicy(ssmPolicy);

      functions[functionName] = func;
    });

    return functions;
  }

  private createWebSocketFunctions(
    runtime: lambda.Runtime,
    lambdaEnvironment: Record<string, string>,
    timeout: cdk.Duration,
    memorySize: number,
    connectionsTable: dynamodb.Table,
    notificationTopic: sns.Topic
  ) {
    const onConnectFunction = new lambda.Function(this, 'OnConnectFunction', {
      runtime,
      handler: 'websocket.onConnect',
      code: lambda.Code.fromAsset('backend/dist/handlers'),
      environment: lambdaEnvironment,
      timeout,
      memorySize,
    });

    const onDisconnectFunction = new lambda.Function(this, 'OnDisconnectFunction', {
      runtime,
      handler: 'websocket.onDisconnect',
      code: lambda.Code.fromAsset('backend/dist/handlers'),
      environment: lambdaEnvironment,
      timeout,
      memorySize,
    });

    const onMessageFunction = new lambda.Function(this, 'OnMessageFunction', {
      runtime,
      handler: 'websocket.onMessage',
      code: lambda.Code.fromAsset('backend/dist/handlers'),
      environment: lambdaEnvironment,
      timeout,
      memorySize,
    });

    const notificationHandlerFunction = new lambda.Function(this, 'NotificationHandlerFunction', {
      runtime,
      handler: 'notificationHandler.handler',
      code: lambda.Code.fromAsset('backend/dist/handlers'),
      environment: lambdaEnvironment,
      timeout,
      memorySize,
    });

    connectionsTable.grantReadWriteData(onConnectFunction);
    connectionsTable.grantReadWriteData(onDisconnectFunction);
    connectionsTable.grantReadWriteData(onMessageFunction);
    connectionsTable.grantReadWriteData(notificationHandlerFunction);

    // Add SNS event source for notification handler
    notificationHandlerFunction.addEventSource(new lambdaEventSources.SnsEventSource(notificationTopic));

    return {
      onConnectFunction,
      onDisconnectFunction,
      onMessageFunction,
      notificationHandlerFunction,
    };
  }

  private createAPIGateway(environment: string, userPool: cognito.UserPool, lambdaFunctions: any): apigateway.RestApi {
    const api = new apigateway.RestApi(this, 'AgentBuilderApi', {
      restApiName: `agent-builder-api-${environment}`,
      description: 'Agent Builder REST API',
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: [
          'Content-Type',
          'X-Amz-Date',
          'Authorization',
          'X-Api-Key',
          'X-Amz-Security-Token'
        ],
      },
    });

    const authorizer = new apigateway.CognitoUserPoolsAuthorizer(this, 'CognitoAuthorizer', {
      cognitoUserPools: [userPool],
    });

    // Projects routes
    const projects = api.root.addResource('projects');
    projects.addMethod('GET', new apigateway.LambdaIntegration(lambdaFunctions.projectsFunction), {
      authorizer,
    });
    projects.addMethod('POST', new apigateway.LambdaIntegration(lambdaFunctions.projectsFunction), {
      authorizer,
    });

    const project = projects.addResource('{id}');
    project.addMethod('GET', new apigateway.LambdaIntegration(lambdaFunctions.projectsFunction), {
      authorizer,
    });
    project.addMethod('PATCH', new apigateway.LambdaIntegration(lambdaFunctions.projectsFunction), {
      authorizer,
    });
    project.addMethod('DELETE', new apigateway.LambdaIntegration(lambdaFunctions.projectsFunction), {
      authorizer,
    });

    // Project tasks routes
    const tasks = project.addResource('tasks');
    tasks.addMethod('GET', new apigateway.LambdaIntegration(lambdaFunctions.tasksFunction), {
      authorizer,
    });

    const status = project.addResource('status');
    status.addMethod('GET', new apigateway.LambdaIntegration(lambdaFunctions.tasksFunction), {
      authorizer,
    });

    const resume = project.addResource('resume');
    resume.addMethod('POST', new apigateway.LambdaIntegration(lambdaFunctions.resumeExecutionFunction), {
      authorizer,
    });

    // Artifacts routes
    const artifacts = project.addResource('artifacts');
    artifacts.addMethod('GET', new apigateway.LambdaIntegration(lambdaFunctions.artifactsFunction), {
      authorizer,
    });

    const artifactsRoot = api.root.addResource('artifacts');
    artifactsRoot.addMethod('POST', new apigateway.LambdaIntegration(lambdaFunctions.artifactsFunction), {
      authorizer,
    });

    // Orchestrator routes
    const agents = api.root.addResource('agents');
    const orchestrator = agents.addResource('orchestrator');
    orchestrator.addMethod('POST', new apigateway.LambdaIntegration(lambdaFunctions.orchestratorFunction), {
      authorizer,
    });

    return api;
  }

  private createWebSocketAPI(environment: string, lambdaFunctions: any, connectionsTable: dynamodb.Table): apigatewayv2.WebSocketApi {
    const webSocketApi = new apigatewayv2.WebSocketApi(this, 'WebSocketApi', {
      apiName: `agent-builder-websocket-${environment}`,
      routeSelectionExpression: '$request.body.action',
    });

    const stage = new apigatewayv2.WebSocketStage(this, 'WebSocketStage', {
      webSocketApi,
      stageName: environment,
      autoDeploy: true,
    });

    // Add WebSocket routes
    webSocketApi.addRoute('$connect', {
      integration: new apigatewayv2integrations.WebSocketLambdaIntegration(
        'ConnectIntegration',
        lambdaFunctions.onConnectFunction
      ),
    });

    webSocketApi.addRoute('$disconnect', {
      integration: new apigatewayv2integrations.WebSocketLambdaIntegration(
        'DisconnectIntegration',
        lambdaFunctions.onDisconnectFunction
      ),
    });

    webSocketApi.addRoute('$default', {
      integration: new apigatewayv2integrations.WebSocketLambdaIntegration(
        'DefaultIntegration',
        lambdaFunctions.onMessageFunction
      ),
    });

    // Grant permissions for WebSocket management
    const policy = new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      actions: ['execute-api:ManageConnections'],
      resources: [`arn:aws:execute-api:${this.region}:${this.account}:${webSocketApi.apiId}/*`],
    });

    lambdaFunctions.notificationHandlerFunction.addToRolePolicy(policy);

    return webSocketApi;
  }

  private createStepFunctions(environment: string, lambdaFunctions: any) {
    const role = new iam.Role(this, 'StepFunctionsRole', {
      assumedBy: new iam.ServicePrincipal('states.amazonaws.com'),
      inlinePolicies: {
        LambdaInvokePolicy: new iam.PolicyDocument({
          statements: [
            new iam.PolicyStatement({
              effect: iam.Effect.ALLOW,
              actions: ['lambda:InvokeFunction'],
              resources: [
                lambdaFunctions.ProductManagerFunction.functionArn,
                lambdaFunctions.BackendEngineerFunction.functionArn,
                lambdaFunctions.FrontendEngineerFunction.functionArn,
                lambdaFunctions.DevopsEngineerFunction.functionArn,
              ],
            }),
          ],
        }),
      },
    });

    const productManagerTask = new stepfunctionsTasks.LambdaInvoke(this, 'ProductManagerTask', {
      lambdaFunction: lambdaFunctions.ProductManagerFunction,
      outputPath: '$.Payload',
    });

    const backendEngineerTask = new stepfunctionsTasks.LambdaInvoke(this, 'BackendEngineerTask', {
      lambdaFunction: lambdaFunctions.BackendEngineerFunction,
      outputPath: '$.Payload',
    });

    const frontendEngineerTask = new stepfunctionsTasks.LambdaInvoke(this, 'FrontendEngineerTask', {
      lambdaFunction: lambdaFunctions.FrontendEngineerFunction,
      outputPath: '$.Payload',
    });

    const devopsEngineerTask = new stepfunctionsTasks.LambdaInvoke(this, 'DevOpsEngineerTask', {
      lambdaFunction: lambdaFunctions.DevopsEngineerFunction,
      outputPath: '$.Payload',
    });

    const definition = productManagerTask
      .next(backendEngineerTask)
      .next(frontendEngineerTask)
      .next(devopsEngineerTask);

    new stepfunctions.StateMachine(this, 'AgentWorkflowStateMachine', {
      stateMachineName: `agent-builder-workflow-${environment}`,
      role,
      definitionBody: stepfunctions.DefinitionBody.fromChainable(definition), // Fixed deprecated API
    });
  }

  private createCloudFrontDistribution(environment: string, frontendBucket: s3.Bucket) {
    return new cloudfront.Distribution(this, 'CloudFrontDistribution', {
      defaultBehavior: {
        origin: cloudfrontOrigins.S3BucketOrigin.withOriginAccessControl(frontendBucket), // Fixed deprecated API
        viewerProtocolPolicy: cloudfront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
        cachePolicy: cloudfront.CachePolicy.CACHING_DISABLED,
        responseHeadersPolicy: cloudfront.ResponseHeadersPolicy.SECURITY_HEADERS,
      },
      defaultRootObject: 'index.html',
      errorResponses: [
        {
          httpStatus: 404,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
        {
          httpStatus: 403,
          responseHttpStatus: 200,
          responsePagePath: '/index.html',
        },
      ],
      comment: `Agent Builder Frontend - ${environment}`,
      priceClass: cloudfront.PriceClass.PRICE_CLASS_100,
    });
  }

  private createOutputs(
    environment: string,
    userPool: cognito.UserPool,
    userPoolClient: cognito.UserPoolClient,
    userPoolDomain: cognito.UserPoolDomain,
    frontendBucket: s3.Bucket
  ) {
    new cdk.CfnOutput(this, 'ApiGatewayEndpoint', {
      value: this.apiGateway.url,
      description: 'API Gateway endpoint URL',
      exportName: `${this.stackName}-ApiEndpoint`,
    });

    new cdk.CfnOutput(this, 'UserPoolId', {
      value: userPool.userPoolId,
      description: 'Cognito User Pool ID',
      exportName: `${this.stackName}-UserPoolId`,
    });

    new cdk.CfnOutput(this, 'UserPoolClientId', {
      value: userPoolClient.userPoolClientId,
      description: 'Cognito User Pool Client ID',
      exportName: `${this.stackName}-UserPoolClientId`,
    });

    new cdk.CfnOutput(this, 'WebSocketApiEndpoint', {
      value: `wss://${this.webSocketApi.apiId}.execute-api.${this.region}.amazonaws.com/${environment}`,
      description: 'WebSocket API endpoint URL',
      exportName: `${this.stackName}-WebSocketEndpoint`,
    });

    new cdk.CfnOutput(this, 'UserPoolDomainOutput', {
      value: userPoolDomain.domainName,
      description: 'Cognito User Pool Domain',
      exportName: `${this.stackName}-UserPoolDomain`,
    });

    new cdk.CfnOutput(this, 'FrontendBucketName', {
      value: frontendBucket.bucketName,
      description: 'Frontend S3 bucket name',
      exportName: `${this.stackName}-FrontendBucket`,
    });
  }
}
# 🏗️ Technical Overview - Lab Tutorial

## System Architecture

Lab Tutorial is built as a modern, scalable, serverless application using AWS cloud services with a React frontend. The system follows microservices architecture patterns with event-driven communication and real-time capabilities.

### High-Level Architecture Diagram

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Web Browser   │    │   Mobile App    │    │   API Clients   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │  CloudFront CDN │
                    └─────────────────┘
                                 │
                    ┌─────────────────┐
                    │  API Gateway    │
                    │  (REST + WS)    │
                    └─────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│ Lambda Functions│    │ Lambda Functions│    │ Lambda Functions│
│   (Auth & User) │    │   (Projects)    │    │  (AI Agents)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
         ┌───────────────────────┼───────────────────────┐
         │                       │                       │
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   DynamoDB      │    │       S3        │    │   SQS + SNS     │
│  (Database)     │    │   (Storage)     │    │  (Messaging)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### Technology Stack

#### Frontend Stack
```typescript
{
  "framework": "React 18",
  "language": "TypeScript 5.2",
  "buildTool": "Vite 4.5",
  "styling": "Tailwind CSS 3.3",
  "components": "Shadcn UI + Radix UI",
  "stateManagement": "Redux Toolkit + RTK Query",
  "routing": "React Router 6",
  "forms": "React Hook Form + Zod",
  "charts": "Recharts",
  "icons": "Lucide React",
  "animations": "Framer Motion",
  "testing": "Jest + React Testing Library"
}
```

#### Backend Stack
```typescript
{
  "runtime": "Node.js 20.x",
  "language": "TypeScript",
  "framework": "AWS SAM",
  "functions": "AWS Lambda",
  "api": "API Gateway (REST + WebSocket)",
  "database": "Amazon DynamoDB",
  "storage": "Amazon S3",
  "messaging": "Amazon SQS + SNS",
  "authentication": "AWS Cognito",
  "monitoring": "AWS CloudWatch + X-Ray",
  "deployment": "AWS CloudFormation"
}
```

#### Infrastructure as Code
```yaml
# SAM Template Structure
template.yaml                 # Main stack orchestration
stacks/
  ├── auth.yaml               # Cognito User Pool
  ├── database.yaml           # DynamoDB tables
  ├── infrastructure.yaml     # S3, SQS, SNS
  └── monitoring.yaml         # CloudWatch, X-Ray
```

## Frontend Architecture

### Component Architecture

The frontend follows a feature-based architecture with shared components:

```
src/
├── components/                # Shared UI components
│   ├── ui/                   # Shadcn base components
│   ├── Layout.tsx            # Main application layout
│   ├── ProtectedRoute.tsx    # Authentication wrapper
│   └── ...
├── features/                 # Feature-specific components
│   ├── auth/                 # Authentication features
│   ├── projects/             # Project management
│   ├── dashboard/            # Dashboard components
│   └── shared/               # Shared feature components
├── pages/                    # Route components
├── services/                 # API and external services
├── store/                    # Redux store configuration
├── hooks/                    # Custom React hooks
├── utils/                    # Utility functions
└── types/                    # TypeScript type definitions
```

### State Management

Redux Toolkit with RTK Query for efficient state management:

```typescript
// Store configuration
export const store = configureStore({
  reducer: {
    auth: authSlice,
    projects: projectsSlice,
    ui: uiSlice,
    api: apiSlice.reducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(apiSlice.middleware),
})

// API slice with RTK Query
export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({
    baseUrl: '/api',
    prepareHeaders: (headers, { getState }) => {
      const token = selectAuthToken(getState())
      if (token) {
        headers.set('authorization', `Bearer ${token}`)
      }
      return headers
    },
  }),
  tagTypes: ['Project', 'User', 'Task'],
  endpoints: (builder) => ({
    // API endpoints defined here
  }),
})
```

### Component Design Patterns

**Compound Components Pattern**
```typescript
// Usage
<Card>
  <Card.Header>
    <Card.Title>Project Dashboard</Card.Title>
  </Card.Header>
  <Card.Content>
    {/* content */}
  </Card.Content>
</Card>
```

**Custom Hooks for Business Logic**
```typescript
// useProject hook
export const useProject = (projectId: string) => {
  const { data: project, isLoading, error } = useGetProjectQuery(projectId)
  const [updateProject] = useUpdateProjectMutation()
  
  return {
    project,
    isLoading,
    error,
    updateProject,
  }
}
```

### Real-time Features

WebSocket integration for live updates:

```typescript
// WebSocket service
class WebSocketService {
  private ws: WebSocket | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5

  connect(token: string) {
    const wsUrl = `${WS_ENDPOINT}?Authorization=${token}`
    this.ws = new WebSocket(wsUrl)
    
    this.ws.onmessage = (event) => {
      const message = JSON.parse(event.data)
      this.handleMessage(message)
    }
    
    this.ws.onclose = () => {
      this.handleReconnect()
    }
  }

  private handleMessage(message: WebSocketMessage) {
    // Dispatch Redux actions based on message type
    switch (message.type) {
      case 'PROJECT_UPDATED':
        store.dispatch(projectUpdated(message.payload))
        break
      case 'TASK_COMPLETED':
        store.dispatch(taskCompleted(message.payload))
        break
    }
  }
}
```

## Backend Architecture

### Lambda Functions Structure

```
src/
├── handlers/                 # Lambda function handlers
│   ├── auth/                # Authentication endpoints
│   ├── projects/            # Project management
│   ├── tasks/               # Task operations
│   ├── websocket/           # WebSocket handlers
│   └── agents/              # AI agent functions
├── services/                # Business logic services
│   ├── AuthService.ts       # Authentication logic
│   ├── ProjectService.ts    # Project operations
│   ├── TaskService.ts       # Task management
│   └── AgentService.ts      # AI agent coordination
├── repositories/            # Data access layer
│   ├── UserRepository.ts    # User data operations
│   ├── ProjectRepository.ts # Project data operations
│   └── TaskRepository.ts    # Task data operations
├── utils/                   # Shared utilities
│   ├── ai.ts               # OpenAI integration
│   ├── validators.ts       # Input validation
│   └── errors.ts           # Error handling
└── types/                   # Shared type definitions
```

### API Design

RESTful API with OpenAPI 3.0 specification:

```yaml
# api-spec.yaml
openapi: 3.0.0
info:
  title: Lab Tutorial API
  version: 1.0.0
  description: AI-powered application builder API

paths:
  /projects:
    get:
      summary: List user projects
      parameters:
        - name: limit
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: List of projects
          content:
            application/json:
              schema:
                type: object
                properties:
                  projects:
                    type: array
                    items:
                      $ref: '#/components/schemas/Project'
```

### Database Design

DynamoDB single-table design with GSIs:

```typescript
// Table structure
interface DynamoDBItem {
  PK: string    // Partition Key
  SK: string    // Sort Key
  GSI1PK?: string
  GSI1SK?: string
  type: string
  data: Record<string, any>
  createdAt: string
  updatedAt: string
}

// Access patterns
const AccessPatterns = {
  // User operations
  getUserById: (userId: string) => ({ PK: `USER#${userId}`, SK: `USER#${userId}` }),
  
  // Project operations
  getProjectById: (projectId: string) => ({ PK: `PROJECT#${projectId}`, SK: `PROJECT#${projectId}` }),
  getUserProjects: (userId: string) => ({ GSI1PK: `USER#${userId}`, GSI1SK: { beginsWith: 'PROJECT#' } }),
  
  // Task operations
  getProjectTasks: (projectId: string) => ({ PK: `PROJECT#${projectId}`, SK: { beginsWith: 'TASK#' } }),
}
```

### AI Agent System

Multi-agent architecture with specialized roles:

```typescript
// Agent interface
interface Agent {
  type: AgentType
  process(input: AgentInput): Promise<AgentOutput>
}

// Product Manager Agent
class ProductManagerAgent implements Agent {
  type = AgentType.PRODUCT_MANAGER

  async process(input: ProjectRequirements): Promise<ProductSpecification> {
    const prompt = this.buildPrompt(input)
    const response = await this.openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: PRODUCT_MANAGER_SYSTEM_PROMPT },
        { role: 'user', content: prompt }
      ]
    })
    
    return this.parseResponse(response.choices[0].message.content)
  }
}

// Agent orchestration
class AgentOrchestrator {
  private agents: Map<AgentType, Agent> = new Map()

  async executeWorkflow(projectId: string, requirements: ProjectRequirements) {
    // 1. Product Manager analyzes requirements
    const specification = await this.agents.get(AgentType.PRODUCT_MANAGER)!
      .process(requirements)
    
    // 2. Backend Engineer designs API
    const backendSpecs = await this.agents.get(AgentType.BACKEND_ENGINEER)!
      .process(specification)
    
    // 3. Frontend Engineer creates UI
    const frontendSpecs = await this.agents.get(AgentType.FRONTEND_ENGINEER)!
      .process({ specification, backendSpecs })
    
    // 4. DevOps Engineer sets up deployment
    const deploymentSpecs = await this.agents.get(AgentType.DEVOPS_ENGINEER)!
      .process({ specification, backendSpecs, frontendSpecs })
    
    return {
      specification,
      backendSpecs,
      frontendSpecs,
      deploymentSpecs
    }
  }
}
```

### Event-Driven Architecture

SQS and SNS for decoupled communication:

```typescript
// Event publisher
class EventPublisher {
  async publishEvent(event: DomainEvent) {
    await this.snsClient.publish({
      TopicArn: process.env.EVENTS_TOPIC_ARN,
      Message: JSON.stringify(event),
      MessageAttributes: {
        eventType: {
          DataType: 'String',
          StringValue: event.type
        }
      }
    }).promise()
  }
}

// Event handlers
const eventHandlers = {
  PROJECT_CREATED: async (event: ProjectCreatedEvent) => {
    // Start AI agent workflow
    await agentOrchestrator.executeWorkflow(event.projectId, event.requirements)
  },
  
  TASK_COMPLETED: async (event: TaskCompletedEvent) => {
    // Update project status and notify users
    await projectService.updateTaskStatus(event.taskId, 'completed')
    await notificationService.notifyUsers(event.projectId, event)
  }
}
```

## Security Architecture

### Authentication & Authorization

AWS Cognito integration with JWT tokens:

```typescript
// JWT verification middleware
export const authMiddleware = async (event: APIGatewayEvent) => {
  const token = event.headers.Authorization?.replace('Bearer ', '')
  
  if (!token) {
    throw new UnauthorizedError('No token provided')
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!)
    return decoded as UserClaims
  } catch (error) {
    throw new UnauthorizedError('Invalid token')
  }
}

// Role-based access control
export const requireRole = (roles: Role[]) => {
  return (user: UserClaims) => {
    if (!roles.includes(user.role)) {
      throw new ForbiddenError('Insufficient permissions')
    }
  }
}
```

### Data Validation

Zod schemas for runtime validation:

```typescript
// Input validation schemas
export const CreateProjectSchema = z.object({
  title: z.string().min(1).max(100),
  description: z.string().min(10).max(5000),
  requirements: z.object({
    features: z.array(z.string()),
    techStack: z.array(z.string()).optional(),
    timeline: z.string().optional()
  }),
  visibility: z.enum(['private', 'public']).default('private')
})

// Validation middleware
export const validateInput = (schema: z.ZodSchema) => {
  return (input: unknown) => {
    try {
      return schema.parse(input)
    } catch (error) {
      if (error instanceof z.ZodError) {
        throw new ValidationError('Invalid input', error.errors)
      }
      throw error
    }
  }
}
```

### Error Handling

Comprehensive error handling with proper HTTP status codes:

```typescript
// Custom error classes
export class AppError extends Error {
  constructor(
    public message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message)
    this.name = this.constructor.name
  }
}

export class ValidationError extends AppError {
  constructor(message: string, public details: any) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}

// Error handler middleware
export const errorHandler = (error: Error) => {
  if (error instanceof AppError) {
    return {
      statusCode: error.statusCode,
      body: JSON.stringify({
        error: {
          code: error.code,
          message: error.message,
          ...(error instanceof ValidationError && { details: error.details })
        }
      })
    }
  }
  
  // Log unexpected errors
  console.error('Unexpected error:', error)
  
  return {
    statusCode: 500,
    body: JSON.stringify({
      error: {
        code: 'INTERNAL_SERVER_ERROR',
        message: 'An unexpected error occurred'
      }
    })
  }
}
```

## Performance Optimization

### Frontend Performance

**Code Splitting and Lazy Loading**
```typescript
// Route-based code splitting
const Dashboard = lazy(() => import('./pages/Dashboard'))
const Projects = lazy(() => import('./pages/Projects'))

// Component in Router
<Route path="/dashboard" element={
  <Suspense fallback={<LoadingSkeleton />}>
    <Dashboard />
  </Suspense>
} />
```

**Virtualization for Large Lists**
```typescript
// Virtual scrolling for project lists
import { FixedSizeList as List } from 'react-window'

const ProjectList = ({ projects }: { projects: Project[] }) => (
  <List
    height={600}
    itemCount={projects.length}
    itemSize={120}
    itemData={projects}
  >
    {ProjectItem}
  </List>
)
```

### Backend Performance

**DynamoDB Optimization**
```typescript
// Batch operations for better performance
const batchGetProjects = async (projectIds: string[]) => {
  const chunks = chunk(projectIds, 25) // DynamoDB batch limit
  
  const results = await Promise.all(
    chunks.map(chunk => 
      dynamodb.batchGet({
        RequestItems: {
          [TABLE_NAME]: {
            Keys: chunk.map(id => ({ PK: `PROJECT#${id}`, SK: `PROJECT#${id}` }))
          }
        }
      }).promise()
    )
  )
  
  return results.flatMap(result => result.Responses?.[TABLE_NAME] || [])
}
```

**Lambda Cold Start Optimization**
```typescript
// Connection pooling outside handler
const dynamodb = new AWS.DynamoDB.DocumentClient({
  httpOptions: {
    agent: new https.Agent({
      keepAlive: true,
      maxSockets: 50
    })
  }
})

// Provisioned concurrency for critical functions
Resources:
  ProjectHandlerFunction:
    Type: AWS::Serverless::Function
    Properties:
      ProvisionedConcurrencyConfig:
        ProvisionedConcurrencyEnabled: true
        ProvisionedConcurrencyUnits: 5
```

## Monitoring & Observability

### Metrics and Logging

**CloudWatch Custom Metrics**
```typescript
// Custom metrics for business logic
class MetricsService {
  async recordProjectCreation(projectType: string) {
    await cloudwatch.putMetricData({
      Namespace: 'LabTutorial/Projects',
      MetricData: [{
        MetricName: 'ProjectCreated',
        Dimensions: [{
          Name: 'ProjectType',
          Value: projectType
        }],
        Value: 1,
        Unit: 'Count'
      }]
    }).promise()
  }
}
```

**Structured Logging**
```typescript
// Winston logger configuration
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.CloudWatchLogs({
      logGroupName: '/aws/lambda/lab-tutorial',
      logStreamName: () => new Date().toISOString().split('T')[0]
    })
  ]
})
```

### Distributed Tracing

X-Ray integration for request tracing:

```typescript
// X-Ray tracing
import AWSXRay from 'aws-xray-sdk-core'

const AWS = AWSXRay.captureAWS(require('aws-sdk'))

// Custom segments
export const traceFunction = (name: string, fn: Function) => {
  return AWSXRay.captureAsyncFunc(name, async (subsegment) => {
    try {
      const result = await fn()
      subsegment?.close()
      return result
    } catch (error) {
      subsegment?.addError(error)
      subsegment?.close(error)
      throw error
    }
  })
}
```

## Testing Strategy

### Frontend Testing

**Unit Tests with Jest and React Testing Library**
```typescript
// Component testing
describe('ProjectCard', () => {
  it('displays project information correctly', () => {
    const mockProject = createMockProject()
    render(<ProjectCard project={mockProject} />)
    
    expect(screen.getByText(mockProject.title)).toBeInTheDocument()
    expect(screen.getByText(mockProject.description)).toBeInTheDocument()
  })
  
  it('handles project selection', async () => {
    const onSelect = jest.fn()
    const mockProject = createMockProject()
    
    render(<ProjectCard project={mockProject} onSelect={onSelect} />)
    
    await user.click(screen.getByRole('button', { name: /select/i }))
    expect(onSelect).toHaveBeenCalledWith(mockProject.id)
  })
})
```

**Integration Tests with MSW**
```typescript
// API mocking with MSW
export const handlers = [
  rest.get('/api/projects', (req, res, ctx) => {
    return res(
      ctx.json({
        projects: [createMockProject(), createMockProject()]
      })
    )
  }),
  
  rest.post('/api/projects', (req, res, ctx) => {
    return res(
      ctx.status(201),
      ctx.json(createMockProject())
    )
  })
]
```

### Backend Testing

**Unit Tests for Lambda Functions**
```typescript
// Handler testing
describe('createProject handler', () => {
  it('creates project successfully', async () => {
    const event = createAPIGatewayEvent({
      body: JSON.stringify({
        title: 'Test Project',
        description: 'Test description'
      })
    })
    
    const result = await createProjectHandler(event)
    
    expect(result.statusCode).toBe(201)
    expect(JSON.parse(result.body)).toMatchObject({
      project: expect.objectContaining({
        title: 'Test Project'
      })
    })
  })
})
```

**Integration Tests with LocalStack**
```typescript
// DynamoDB integration testing
beforeAll(async () => {
  await createTestTable()
})

afterAll(async () => {
  await deleteTestTable()
})

describe('ProjectRepository', () => {
  it('saves and retrieves projects', async () => {
    const project = createMockProject()
    await projectRepository.save(project)
    
    const retrieved = await projectRepository.findById(project.id)
    expect(retrieved).toEqual(project)
  })
})
```

---

*This technical overview provides a comprehensive understanding of the Lab Tutorial system architecture, implementation patterns, and best practices. For specific implementation details, refer to the source code and API documentation.*
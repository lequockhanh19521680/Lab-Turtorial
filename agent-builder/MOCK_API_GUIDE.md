# Agent Builder Mock API Development Guide

This document provides instructions for using the Mock API system for frontend development without requiring a running backend.

## Overview

The Mock API system allows frontend developers to work with realistic data and interactions without needing to deploy or run the actual AWS backend infrastructure. It simulates all backend functionality including:

- User authentication
- Project CRUD operations
- Task management
- WebSocket real-time updates
- Artifact management

## Quick Setup

### 1. Enable Mock API

Copy the environment configuration:

```bash
cd agent-builder/frontend
cp .env.local.example .env.local
```

In `.env.local`, ensure the following setting:

```bash
VITE_USE_MOCK_API=true
```

### 2. Start Development Server

```bash
cd agent-builder
npm run dev:frontend
```

The application will now use mock data instead of making API calls to the backend.

### 3. Demo Login Credentials

Use these credentials to access the mock application:

- **Email**: `demo@agent-builder.app`
- **Password**: `demo123`

## Mock Data Overview

### Sample Projects

The mock API includes 3 pre-configured projects demonstrating different states:

#### 1. E-commerce Platform (COMPLETED)
- **Status**: `COMPLETED`
- **Description**: Modern e-commerce platform with product catalog, shopping cart, and payment processing
- **Features**: User Authentication, Product Catalog, Shopping Cart, Payment Processing, Order Management
- **All tasks completed with artifacts generated**

#### 2. Task Management App (IN_PROGRESS)
- **Status**: `IN_PROGRESS`
- **Description**: Comprehensive task management application with team collaboration
- **Features**: Project Management, Task Creation, Team Collaboration, Progress Tracking, Dashboard
- **Currently on Frontend development phase (65% complete)**

#### 3. Blog Platform (PENDING)
- **Status**: `PENDING`
- **Description**: Simple blog platform with markdown support
- **Features**: Post Creation, Editing, Clean Design, Markdown Support
- **Ready to start development**

### Task States

Each project has 4 standard tasks:

1. **Product Manager Agent**: Analyze requirements and create SRS document
2. **Backend Engineer Agent**: Design database schema and create backend APIs  
3. **Frontend Engineer Agent**: Create React components and user interface
4. **DevOps Engineer Agent**: Deploy application to cloud infrastructure

Tasks progress through states: `TODO` → `IN_PROGRESS` → `DONE`

### Artifacts

Mock artifacts include:

- **SRS Documents**: Software Requirements Specification PDFs
- **Source Code**: GitHub repository links
- **Deployment URLs**: Live application links
- **Test Reports**: Quality assurance reports

## Real-time Simulation

### WebSocket Simulation

When viewing a project in progress, the mock WebSocket system automatically simulates:

- Task progress updates every 2 seconds
- Automatic task completion and progression to next task
- Real-time project status changes
- Progress notifications

### Starting Simulation

1. Navigate to a project with `IN_PROGRESS` status
2. The WebSocket simulation automatically begins
3. Watch tasks progress in real-time
4. Progress is visually updated in the UI

### Simulation Events

The mock WebSocket emits these event types:

```typescript
interface WebSocketMessage {
  type: 'TASK_PROGRESS' | 'TASK_STARTED' | 'PROJECT_COMPLETED'
  projectId: string
  taskId?: string
  progress?: number
  task?: Task
  project?: Project
}
```

## API Compatibility

### Projects API

All project operations are fully simulated:

```typescript
// Create new project
const response = await projectsApi.createProject({
  projectName: "My New App",
  requestPrompt: "Create a todo list application"
})

// Get all projects
const projects = await projectsApi.getProjects()

// Get project details
const project = await projectsApi.getProject(projectId)

// Update project
const updated = await projectsApi.updateProject(projectId, changes)

// Delete project
await projectsApi.deleteProject(projectId)
```

### Authentication API

Mock authentication includes:

```typescript
// Login with demo credentials
const auth = await authService.signIn({
  email: "demo@agent-builder.app",
  password: "demo123"
})

// Register new user (always succeeds in mock)
const registration = await authService.signUp({
  email: "newuser@example.com",
  password: "password123",
  firstName: "John",
  lastName: "Doe"
})

// Get current user
const user = await authService.getCurrentUser()
```

### Task & Artifact APIs

```typescript
// Get project tasks
const tasks = await projectsApi.getProjectTasks(projectId)

// Get project artifacts  
const artifacts = await projectsApi.getProjectArtifacts(projectId)

// Get project status with progress
const status = await projectsApi.getProjectStatus(projectId)
```

## Network Simulation

The mock API simulates realistic network conditions:

- **Default delay**: 1 second for most operations
- **List operations**: 500ms (faster for better UX)
- **Authentication**: 300ms for logout/token refresh
- **Error simulation**: Invalid credentials throw appropriate errors

## Switching Between Mock and Real API

### Development with Mock API

```bash
# .env.local
VITE_USE_MOCK_API=true
```

### Development with Real Backend

```bash
# .env.local  
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=http://localhost:3001/api
VITE_WEBSOCKET_ENDPOINT=wss://your-websocket-endpoint
```

### Production

```bash
# .env.production
VITE_USE_MOCK_API=false
VITE_API_BASE_URL=https://your-api-domain.com/api
VITE_WEBSOCKET_ENDPOINT=wss://your-websocket-domain.com
```

## Customizing Mock Data

### Adding Projects

Edit `frontend/src/services/mock.ts`:

```typescript
const MOCK_PROJECTS: Project[] = [
  // Add your custom project here
  {
    projectId: 'proj-custom',
    userId: 'user-123',
    projectName: 'My Custom Project',
    requestPrompt: 'Create a custom application',
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  // ... existing projects
]
```

### Modifying Task Progression

Adjust the simulation speed in `simulateProjectProgress()`:

```typescript
// Change interval for faster/slower updates
const progressInterval = setInterval(() => {
  // Custom logic here
}, 1000) // 1 second intervals
```

### Custom WebSocket Events

Add custom event handling:

```typescript
callback({
  type: 'CUSTOM_EVENT',
  projectId,
  data: customData
})
```

## Troubleshooting

### Mock API Not Working

1. **Check environment variable**: Ensure `VITE_USE_MOCK_API=true`
2. **Restart dev server**: Changes to `.env.local` require restart
3. **Clear browser cache**: Old API responses may be cached
4. **Check console**: Look for mock API debug messages

### Authentication Issues

1. **Use correct credentials**: `demo@agent-builder.app` / `demo123`
2. **Clear localStorage**: Old tokens may interfere
3. **Check network tab**: Mock API should not make HTTP requests

### WebSocket Simulation Not Starting

1. **Navigate to IN_PROGRESS project**: Only active projects simulate
2. **Check console**: Look for simulation start messages
3. **Refresh page**: Restart the simulation

### Performance Issues

1. **Disable simulation**: Stop WebSocket simulation when not needed
2. **Reduce update frequency**: Increase interval in mock code
3. **Limit concurrent simulations**: Only one project at a time

## Best Practices

### Development Workflow

1. **Start with mock API** for rapid prototyping
2. **Test all UI states** using different mock projects
3. **Verify real-time updates** with WebSocket simulation
4. **Switch to real API** for integration testing
5. **Use mock API for demos** and presentations

### Data Management

1. **Keep mock data realistic** and representative
2. **Include edge cases** (empty states, errors)
3. **Test different user types** and permissions
4. **Simulate network conditions** (delays, failures)

### Performance

1. **Use appropriate delays** (not too fast, not too slow)
2. **Limit real-time updates** when not actively viewing
3. **Clean up simulations** when components unmount
4. **Cache responses** when appropriate

## Integration with Real Backend

When ready to switch to the real backend:

1. **Deploy backend infrastructure** using the CI/CD pipeline
2. **Update environment variables** with real endpoints
3. **Test authentication flow** with real Cognito
4. **Verify WebSocket connections** with real API Gateway
5. **Gradually replace mock data** with real API calls

## Support and Debugging

### Console Messages

The mock API provides detailed console logging:

```
Using mock WebSocket connection
Starting mock WebSocket simulation for project: proj-2
Mock API: getProjects() called
```

### Network Tab

When using mock API, you should see **no network requests** to the backend API endpoints.

### Local Storage

Mock authentication stores tokens in localStorage similar to real authentication.

For additional support, refer to the main development guide or check the mock implementation in `frontend/src/services/mock.ts`.
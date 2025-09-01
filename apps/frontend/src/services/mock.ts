// Mock API service for frontend development
import { Project, Task, Artifact } from '../types/api'

// Network delay simulation
const NETWORK_DELAY = 1000 // 1 second

const delay = (ms: number = NETWORK_DELAY) => 
  new Promise(resolve => setTimeout(resolve, ms))

// Mock data for projects with different states
const MOCK_PROJECTS: Project[] = [
  {
    projectId: 'proj-1',
    userId: 'user-123',
    projectName: 'E-commerce Platform',
    requestPrompt: 'Create a modern e-commerce platform with product catalog, shopping cart, user authentication, and payment processing using Stripe.',
    status: 'COMPLETED',
    createdAt: '2024-01-15T10:00:00.000Z',
    updatedAt: '2024-01-20T14:30:00.000Z'
  },
  {
    projectId: 'proj-2',
    userId: 'user-123',
    projectName: 'Task Management App',
    requestPrompt: 'Build a comprehensive task management application where users can create projects, add tasks with due dates, assign them to team members, and track progress with a dashboard.',
    status: 'IN_PROGRESS',
    createdAt: '2024-01-18T09:15:00.000Z',
    updatedAt: '2024-01-19T16:45:00.000Z'
  },
  {
    projectId: 'proj-3',
    userId: 'user-123',
    projectName: 'Blog Platform',
    requestPrompt: 'Create a simple blog platform where users can create, edit, and delete posts with a clean, modern design and markdown support.',
    status: 'PENDING',
    createdAt: '2024-01-19T14:20:00.000Z',
    updatedAt: '2024-01-19T14:20:00.000Z'
  }
]

// Mock tasks for different projects
const MOCK_TASKS: Task[] = [
  // E-commerce Platform tasks (COMPLETED)
  {
    projectId: 'proj-1',
    taskId: 'task-1-1',
    assignedAgent: 'ProductManagerAgent',
    status: 'DONE',
    dependencies: [],
    description: 'Analyze requirements and create SRS document',
    progress: 100,
    startedAt: '2024-01-15T10:05:00.000Z',
    completedAt: '2024-01-15T12:30:00.000Z'
  },
  {
    projectId: 'proj-1',
    taskId: 'task-1-2',
    assignedAgent: 'BackendEngineerAgent',
    status: 'DONE',
    dependencies: ['task-1-1'],
    description: 'Design database schema and create backend APIs',
    progress: 100,
    startedAt: '2024-01-15T13:00:00.000Z',
    completedAt: '2024-01-17T16:45:00.000Z'
  },
  {
    projectId: 'proj-1',
    taskId: 'task-1-3',
    assignedAgent: 'FrontendEngineerAgent',
    status: 'DONE',
    dependencies: ['task-1-2'],
    description: 'Create React components and user interface',
    progress: 100,
    startedAt: '2024-01-17T17:00:00.000Z',
    completedAt: '2024-01-19T15:20:00.000Z'
  },
  {
    projectId: 'proj-1',
    taskId: 'task-1-4',
    assignedAgent: 'DevOpsEngineerAgent',
    status: 'DONE',
    dependencies: ['task-1-3'],
    description: 'Deploy application to cloud infrastructure',
    progress: 100,
    startedAt: '2024-01-19T15:30:00.000Z',
    completedAt: '2024-01-20T14:30:00.000Z'
  },

  // Task Management App tasks (IN_PROGRESS)
  {
    projectId: 'proj-2',
    taskId: 'task-2-1',
    assignedAgent: 'ProductManagerAgent',
    status: 'DONE',
    dependencies: [],
    description: 'Analyze requirements and create SRS document',
    progress: 100,
    startedAt: '2024-01-18T09:20:00.000Z',
    completedAt: '2024-01-18T14:15:00.000Z'
  },
  {
    projectId: 'proj-2',
    taskId: 'task-2-2',
    assignedAgent: 'BackendEngineerAgent',
    status: 'DONE',
    dependencies: ['task-2-1'],
    description: 'Design database schema and create backend APIs',
    progress: 100,
    startedAt: '2024-01-18T14:30:00.000Z',
    completedAt: '2024-01-19T11:45:00.000Z'
  },
  {
    projectId: 'proj-2',
    taskId: 'task-2-3',
    assignedAgent: 'FrontendEngineerAgent',
    status: 'PENDING_APPROVAL',
    dependencies: ['task-2-2'],
    description: 'Create React components and user interface',
    progress: 100,
    startedAt: '2024-01-19T12:00:00.000Z',
    completedAt: '2024-01-19T16:45:00.000Z'
  },
  {
    projectId: 'proj-2',
    taskId: 'task-2-4',
    assignedAgent: 'DevOpsEngineerAgent',
    status: 'TODO',
    dependencies: ['task-2-3'],
    description: 'Deploy application to cloud infrastructure',
    progress: 0
  },

  // Blog Platform tasks (PENDING)
  {
    projectId: 'proj-3',
    taskId: 'task-3-1',
    assignedAgent: 'ProductManagerAgent',
    status: 'TODO',
    dependencies: [],
    description: 'Analyze requirements and create SRS document',
    progress: 0
  },
  {
    projectId: 'proj-3',
    taskId: 'task-3-2',
    assignedAgent: 'BackendEngineerAgent',
    status: 'TODO',
    dependencies: ['task-3-1'],
    description: 'Design database schema and create backend APIs',
    progress: 0
  },
  {
    projectId: 'proj-3',
    taskId: 'task-3-3',
    assignedAgent: 'FrontendEngineerAgent',
    status: 'TODO',
    dependencies: ['task-3-2'],
    description: 'Create React components and user interface',
    progress: 0
  },
  {
    projectId: 'proj-3',
    taskId: 'task-3-4',
    assignedAgent: 'DevOpsEngineerAgent',
    status: 'TODO',
    dependencies: ['task-3-3'],
    description: 'Deploy application to cloud infrastructure',
    progress: 0
  }
]

// Mock artifacts for projects
const MOCK_ARTIFACTS: Artifact[] = [
  {
    projectId: 'proj-1',
    artifactId: 'artifact-1-1',
    artifactType: 'SRS_DOCUMENT',
    location: 'https://mock-storage.com/srs/proj-1.pdf',
    version: '1.0',
    createdAt: '2024-01-15T12:30:00.000Z',
    title: 'E-commerce Platform - Software Requirements Specification',
    description: 'Detailed requirements and specifications for the e-commerce platform',
    metadata: {
      features: ['User Authentication', 'Product Catalog', 'Shopping Cart', 'Payment Processing', 'Order Management'],
      userStories: ['As a customer, I want to browse products', 'As a customer, I want to add items to cart', 'As a customer, I want to checkout securely'],
      complexity: 'High',
      aiGenerated: true
    }
  },
  {
    projectId: 'proj-1',
    artifactId: 'artifact-1-2',
    artifactType: 'SOURCE_CODE',
    location: 'https://github.com/mock-user/ecommerce-platform',
    version: '1.0',
    createdAt: '2024-01-19T15:20:00.000Z',
    title: 'E-commerce Platform - Source Code',
    description: 'Complete React frontend and Node.js backend source code',
    metadata: {
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe API'],
      aiGenerated: true
    }
  },
  {
    projectId: 'proj-1',
    artifactId: 'artifact-1-3',
    artifactType: 'DEPLOYMENT_URL',
    location: 'https://ecommerce-platform-demo.vercel.app',
    version: '1.0',
    createdAt: '2024-01-20T14:30:00.000Z',
    title: 'E-commerce Platform - Live Application',
    description: 'Deployed application accessible to users',
    metadata: {
      environment: 'production',
      cloudProvider: 'Vercel',
      aiGenerated: true
    }
  },
  {
    projectId: 'proj-2',
    artifactId: 'artifact-2-1',
    artifactType: 'SRS_DOCUMENT',
    location: 'https://mock-storage.com/srs/proj-2.pdf',
    version: '1.0',
    createdAt: '2024-01-18T14:15:00.000Z',
    title: 'Task Management App - Software Requirements Specification',
    description: 'Detailed requirements and specifications for the task management application',
    metadata: {
      features: ['Project Management', 'Task Creation', 'Team Collaboration', 'Progress Tracking', 'Dashboard'],
      userStories: ['As a project manager, I want to create projects', 'As a team member, I want to view my tasks'],
      complexity: 'Medium',
      aiGenerated: true
    }
  }
]

// Mock WebSocket simulation state
let wsCallbacks: Record<string, (data: any) => void> = {}

/**
 * Mock WebSocket progress simulation
 */
export const simulateProjectProgress = (projectId: string, callback: (data: any) => void): void => {
  wsCallbacks[projectId] = callback
  
  // Find the project's current task in progress
  const projectTasks = MOCK_TASKS.filter(task => task.projectId === projectId)
  const inProgressTask = projectTasks.find(task => task.status === 'IN_PROGRESS')
  
  if (!inProgressTask) {
    return
  }
  
  // Simulate progress updates every 2 seconds
  let currentProgress = inProgressTask.progress || 0
  
  const progressInterval = setInterval(() => {
    currentProgress += Math.random() * 10 // Random progress increment
    
    if (currentProgress >= 100) {
      currentProgress = 100
      clearInterval(progressInterval)
      
      // Mark task as done and start next task
      inProgressTask.status = 'DONE'
      inProgressTask.progress = 100
      inProgressTask.completedAt = new Date().toISOString()
      
      // Find next task to start
      const nextTask = projectTasks.find(task => 
        task.status === 'TODO' && 
        task.dependencies.every(depId => 
          projectTasks.find(t => t.taskId === depId)?.status === 'DONE'
        )
      )
      
      if (nextTask) {
        nextTask.status = 'IN_PROGRESS'
        nextTask.startedAt = new Date().toISOString()
        nextTask.progress = 5
        
        callback({
          type: 'TASK_STARTED',
          projectId,
          taskId: nextTask.taskId,
          task: nextTask
        })
        
        // Continue simulation with new task
        setTimeout(() => simulateProjectProgress(projectId, callback), 1000)
      } else {
        // All tasks completed
        const project = MOCK_PROJECTS.find(p => p.projectId === projectId)
        if (project) {
          project.status = 'COMPLETED'
          project.updatedAt = new Date().toISOString()
        }
        
        callback({
          type: 'PROJECT_COMPLETED',
          projectId,
          project
        })
      }
    } else {
      inProgressTask.progress = Math.round(currentProgress)
    }
    
    callback({
      type: 'TASK_PROGRESS',
      projectId,
      taskId: inProgressTask.taskId,
      progress: Math.round(currentProgress),
      task: inProgressTask
    })
  }, 2000)
}

/**
 * Stop WebSocket simulation for a project
 */
export const stopProjectSimulation = (projectId: string): void => {
  delete wsCallbacks[projectId]
}

// Mock API functions
export const mockApi = {
  // Projects
  async createProject(data: { projectName: string; requestPrompt: string }): Promise<{ projectId: string; status: string; message: string }> {
    await delay()
    
    const newProject: Project = {
      projectId: `proj-${Date.now()}`,
      userId: 'user-123',
      projectName: data.projectName,
      requestPrompt: data.requestPrompt,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
    
    MOCK_PROJECTS.push(newProject)
    
    // Create initial tasks
    const agents = ['ProductManagerAgent', 'BackendEngineerAgent', 'FrontendEngineerAgent', 'DevOpsEngineerAgent']
    const descriptions = [
      'Analyze requirements and create SRS document',
      'Design database schema and create backend APIs',
      'Create React components and user interface',
      'Deploy application to cloud infrastructure'
    ]
    
    agents.forEach((agent, index) => {
      const task: Task = {
        projectId: newProject.projectId,
        taskId: `task-${newProject.projectId}-${index + 1}`,
        assignedAgent: agent,
        status: 'TODO',
        dependencies: index > 0 ? [`task-${newProject.projectId}-${index}`] : [],
        description: descriptions[index],
        progress: 0
      }
      MOCK_TASKS.push(task)
    })
    
    return {
      projectId: newProject.projectId,
      status: 'created',
      message: 'Project created successfully'
    }
  },

  async getProjects(): Promise<{ projects: Project[] }> {
    await delay(500) // Faster for list views
    return { projects: MOCK_PROJECTS }
  },

  async getProject(projectId: string): Promise<{ project: Project }> {
    await delay()
    const project = MOCK_PROJECTS.find(p => p.projectId === projectId)
    if (!project) {
      throw new Error('Project not found')
    }
    return { project }
  },

  async updateProject(projectId: string, updates: Partial<Project>): Promise<{ project: Project }> {
    await delay()
    const project = MOCK_PROJECTS.find(p => p.projectId === projectId)
    if (!project) {
      throw new Error('Project not found')
    }
    
    Object.assign(project, updates, { updatedAt: new Date().toISOString() })
    return { project }
  },

  async deleteProject(projectId: string): Promise<{ message: string }> {
    await delay()
    const index = MOCK_PROJECTS.findIndex(p => p.projectId === projectId)
    if (index === -1) {
      throw new Error('Project not found')
    }
    
    MOCK_PROJECTS.splice(index, 1)
    
    // Remove related tasks and artifacts
    MOCK_TASKS.splice(0, MOCK_TASKS.length, ...MOCK_TASKS.filter(t => t.projectId !== projectId))
    MOCK_ARTIFACTS.splice(0, MOCK_ARTIFACTS.length, ...MOCK_ARTIFACTS.filter(a => a.projectId !== projectId))
    
    return { message: 'Project deleted successfully' }
  },

  // Tasks
  async getProjectTasks(projectId: string): Promise<{ tasks: Task[] }> {
    await delay()
    const tasks = MOCK_TASKS.filter(task => task.projectId === projectId)
    return { tasks }
  },

  async getProjectStatus(projectId: string): Promise<{ project: Project; tasks: Task[]; progress: number }> {
    await delay()
    const project = MOCK_PROJECTS.find(p => p.projectId === projectId)
    const tasks = MOCK_TASKS.filter(task => task.projectId === projectId)
    
    if (!project) {
      throw new Error('Project not found')
    }
    
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.status === 'DONE').length
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0
    
    return { project, tasks, progress }
  },

  // Artifacts
  async getProjectArtifacts(projectId: string): Promise<{ artifacts: Artifact[] }> {
    await delay()
    const artifacts = MOCK_ARTIFACTS.filter(artifact => artifact.projectId === projectId)
    return { artifacts }
  }
}

// Mock authentication functions
export const mockAuth = {
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    await delay()
    
    // Simulate login validation
    if (email === 'demo@agent-builder.app' && password === 'demo123') {
      return {
        token: 'mock-jwt-token-' + Date.now(),
        user: {
          id: 'user-123',
          email: 'demo@agent-builder.app',
          name: 'Demo User',
          givenName: 'Demo',
          familyName: 'User'
        }
      }
    }
    
    throw new Error('Invalid credentials')
  },

  async register(userData: any): Promise<{ token: string; user: any }> {
    await delay()
    
    return {
      token: 'mock-jwt-token-' + Date.now(),
      user: {
        id: 'user-' + Date.now(),
        email: userData.email,
        name: `${userData.givenName} ${userData.familyName}`,
        givenName: userData.givenName,
        familyName: userData.familyName
      }
    }
  },

  async logout(): Promise<void> {
    await delay(300)
    // Mock logout (clear local state)
  },

  async getCurrentUser(): Promise<any> {
    await delay(300)
    
    return {
      id: 'user-123',
      email: 'demo@agent-builder.app',
      name: 'Demo User',
      givenName: 'Demo',
      familyName: 'User'
    }
  },

  async refreshToken(): Promise<{ token: string }> {
    await delay(300)
    
    return {
      token: 'mock-refreshed-jwt-token-' + Date.now()
    }
  }
}
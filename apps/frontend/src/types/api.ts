// API types matching backend models
export interface Project {
  projectId: string
  userId: string
  projectName: string
  requestPrompt: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  createdAt: string
  updatedAt: string
}

export interface Task {
  projectId: string
  taskId: string
  assignedAgent: string
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'FAILED' | 'PENDING_APPROVAL'
  dependencies: string[]
  outputArtifactId?: string
  description?: string
  progress?: number
  startedAt?: string
  completedAt?: string
  errorMessage?: string
}

export interface Artifact {
  projectId: string
  artifactId: string
  artifactType: 'SRS_DOCUMENT' | 'SOURCE_CODE' | 'DEPLOYMENT_URL' | 'TEST_REPORT'
  location: string
  version: string
  createdAt: string
  title?: string
  description?: string
  metadata?: Record<string, any>
}

export interface User {
  id: string
  email: string
  name: string
  givenName?: string
  familyName?: string
  role?: 'user' | 'admin'
  profilePicture?: string
  createdAt?: string
  lastLoginAt?: string
}

export interface AuthResponse {
  token: string
  user: User
}

// WebSocket message types
export interface WebSocketMessage {
  type: 'TASK_PROGRESS' | 'TASK_STARTED' | 'TASK_COMPLETED' | 'PROJECT_COMPLETED' | 'ERROR'
  projectId: string
  taskId?: string
  progress?: number
  task?: Task
  project?: Project
  message?: string
  error?: string
}
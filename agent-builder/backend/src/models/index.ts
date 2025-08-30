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
  status: 'TODO' | 'IN_PROGRESS' | 'DONE' | 'FAILED'
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

export interface AgentExecutionContext {
  projectId: string
  taskId: string
  project: Project
  previousArtifacts: Artifact[]
  agentConfig?: Record<string, any>
}

export interface AgentResponse {
  success: boolean
  artifacts: Artifact[]
  nextTasks?: Task[]
  errorMessage?: string
  metadata?: Record<string, any>
}
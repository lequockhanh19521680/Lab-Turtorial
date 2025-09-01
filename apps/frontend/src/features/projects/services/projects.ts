import apiService from './apiWithRetry'
import { mockApi } from './mock'
import { Project, Task, Artifact } from '../store/slices/projectsSlice'

export interface CreateProjectRequest {
  projectName: string
  requestPrompt: string
}

export interface CreateProjectResponse {
  projectId: string
  status: string
  message: string
}

// Check if we should use mock API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

export const projectsApi = {
  // Get all projects for current user
  getProjects: async (): Promise<Project[]> => {
    if (USE_MOCK_API) {
      const response = await mockApi.getProjects()
      return response.projects
    }
    
    const response = await apiService.get('/projects')
    return response.data.projects
  },

  // Get specific project by ID
  getProject: async (projectId: string): Promise<Project> => {
    if (USE_MOCK_API) {
      const response = await mockApi.getProject(projectId)
      return response.project
    }
    
    const response = await apiService.get(`/projects/${projectId}`)
    return response.data.project
  },

  // Create new project
  createProject: async (data: CreateProjectRequest): Promise<CreateProjectResponse> => {
    if (USE_MOCK_API) {
      return await mockApi.createProject(data)
    }
    
    const response = await apiService.post('/projects', data)
    return response.data
  },

  // Update project
  updateProject: async (projectId: string, data: Partial<Project>): Promise<Project> => {
    if (USE_MOCK_API) {
      const response = await mockApi.updateProject(projectId, data)
      return response.project
    }
    
    const response = await apiService.patch(`/projects/${projectId}`, data)
    return response.data.project
  },

  // Delete project
  deleteProject: async (projectId: string): Promise<void> => {
    if (USE_MOCK_API) {
      await mockApi.deleteProject(projectId)
      return
    }
    
    await apiService.delete(`/projects/${projectId}`)
  },

  // Get project tasks
  getProjectTasks: async (projectId: string): Promise<Task[]> => {
    if (USE_MOCK_API) {
      const response = await mockApi.getProjectTasks(projectId)
      return response.tasks
    }
    
    const response = await apiService.get(`/projects/${projectId}/tasks`)
    return response.data.tasks
  },

  // Get project artifacts
  getProjectArtifacts: async (projectId: string): Promise<Artifact[]> => {
    if (USE_MOCK_API) {
      const response = await mockApi.getProjectArtifacts(projectId)
      return response.artifacts
    }
    
    const response = await apiService.get(`/projects/${projectId}/artifacts`)
    return response.data.artifacts
  },

  // Start project orchestration
  startOrchestration: async (projectId: string): Promise<{ message: string }> => {
    if (USE_MOCK_API) {
      // For mock API, we can simulate starting orchestration
      return { message: 'Project orchestration started successfully' }
    }
    
    const response = await apiService.post(`/agents/orchestrator`, { projectId })
    return response.data
  },

  // Get project status and progress
  getProjectStatus: async (projectId: string): Promise<{
    status: string
    progress: number
    currentTask?: string
    estimatedCompletion?: string
    project?: Project
    tasks?: Task[]
  }> => {
    if (USE_MOCK_API) {
      const response = await mockApi.getProjectStatus(projectId)
      return {
        status: response.project.status,
        progress: response.progress,
        currentTask: response.tasks.find(t => t.status === 'IN_PROGRESS')?.description,
        project: response.project,
        tasks: response.tasks
      }
    }
    
    const response = await apiService.get(`/projects/${projectId}/status`)
    return response.data
  },

  // Resume execution after approval
  resumeExecution: async (projectId: string, data?: { taskId?: string, feedback?: string }): Promise<{
    message: string
    currentTask?: any
    nextAgent?: string
    status: string
  }> => {
    if (USE_MOCK_API) {
      // For mock API, simulate approval
      return { 
        message: 'Task approved and next agent queued successfully',
        status: 'IN_PROGRESS' 
      }
    }
    
    const response = await apiService.post(`/projects/${projectId}/resume`, data || {})
    return response.data
  },
}
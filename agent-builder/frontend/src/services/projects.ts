import api from './api'
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

export const projectsApi = {
  // Get all projects for current user
  getProjects: async (): Promise<Project[]> => {
    const response = await api.get('/projects')
    return response.data.projects
  },

  // Get specific project by ID
  getProject: async (projectId: string): Promise<Project> => {
    const response = await api.get(`/projects/${projectId}`)
    return response.data.project
  },

  // Create new project
  createProject: async (data: CreateProjectRequest): Promise<CreateProjectResponse> => {
    const response = await api.post('/projects', data)
    return response.data
  },

  // Update project
  updateProject: async (projectId: string, data: Partial<Project>): Promise<Project> => {
    const response = await api.patch(`/projects/${projectId}`, data)
    return response.data.project
  },

  // Delete project
  deleteProject: async (projectId: string): Promise<void> => {
    await api.delete(`/projects/${projectId}`)
  },

  // Get project tasks
  getProjectTasks: async (projectId: string): Promise<Task[]> => {
    const response = await api.get(`/projects/${projectId}/tasks`)
    return response.data.tasks
  },

  // Get project artifacts
  getProjectArtifacts: async (projectId: string): Promise<Artifact[]> => {
    const response = await api.get(`/projects/${projectId}/artifacts`)
    return response.data.artifacts
  },

  // Start project orchestration
  startOrchestration: async (projectId: string): Promise<{ message: string }> => {
    const response = await api.post(`/agents/orchestrator`, { projectId })
    return response.data
  },

  // Get project status and progress
  getProjectStatus: async (projectId: string): Promise<{
    status: string
    progress: number
    currentTask?: string
    estimatedCompletion?: string
  }> => {
    const response = await api.get(`/projects/${projectId}/status`)
    return response.data
  },
}
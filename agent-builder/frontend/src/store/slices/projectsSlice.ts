import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface Project {
  projectId: string
  userId: string
  projectName: string
  requestPrompt: string
  status: 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED'
  createdAt: string
  updatedAt: string
  artifacts?: Artifact[]
  tasks?: Task[]
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
}

interface ProjectsState {
  projects: Project[]
  currentProject: Project | null
  loading: boolean
  error: string | null
}

const initialState: ProjectsState = {
  projects: [],
  currentProject: null,
  loading: false,
  error: null,
}

const projectsSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload
    },
    addProject: (state, action: PayloadAction<Project>) => {
      state.projects.unshift(action.payload)
    },
    updateProject: (state, action: PayloadAction<Partial<Project> & { projectId: string }>) => {
      const index = state.projects.findIndex(p => p.projectId === action.payload.projectId)
      if (index !== -1) {
        state.projects[index] = { ...state.projects[index], ...action.payload }
      }
      if (state.currentProject?.projectId === action.payload.projectId) {
        state.currentProject = { ...state.currentProject, ...action.payload }
      }
    },
    setCurrentProject: (state, action: PayloadAction<Project | null>) => {
      state.currentProject = action.payload
    },
    updateProjectTasks: (state, action: PayloadAction<{ projectId: string; tasks: Task[] }>) => {
      const { projectId, tasks } = action.payload
      const project = state.projects.find(p => p.projectId === projectId)
      if (project) {
        project.tasks = tasks
      }
      if (state.currentProject?.projectId === projectId) {
        state.currentProject.tasks = tasks
      }
    },
    updateProjectArtifacts: (state, action: PayloadAction<{ projectId: string; artifacts: Artifact[] }>) => {
      const { projectId, artifacts } = action.payload
      const project = state.projects.find(p => p.projectId === projectId)
      if (project) {
        project.artifacts = artifacts
      }
      if (state.currentProject?.projectId === projectId) {
        state.currentProject.artifacts = artifacts
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload
    },
  },
})

export const {
  setProjects,
  addProject,
  updateProject,
  setCurrentProject,
  updateProjectTasks,
  updateProjectArtifacts,
  setLoading,
  setError,
} = projectsSlice.actions

export default projectsSlice.reducer
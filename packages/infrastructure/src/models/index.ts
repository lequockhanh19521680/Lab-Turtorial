export interface User {
  userId: string;
  email: string;
  name?: string;
  givenName?: string;
  familyName?: string;
  picture?: string;
  provider: "google" | "cognito";
  providerUserId: string;
  createdAt: string;
  updatedAt: string;
  lastLoginAt?: string;
}

export interface Project {
  projectId: string;
  userId: string;
  projectName: string;
  requestPrompt: string;
  status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "FAILED";
  createdAt: string;
  updatedAt: string;
}

export interface Task {
  projectId: string;
  taskId: string;
  assignedAgent: string;
  status: "TODO" | "IN_PROGRESS" | "DONE" | "FAILED" | "PENDING_APPROVAL";
  dependencies: string[];
  outputArtifactId?: string;
  description?: string;
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
}

export interface Artifact {
  projectId: string;
  artifactId: string;
  artifactType:
    | "SRS_DOCUMENT"
    | "SOURCE_CODE"
    | "DEPLOYMENT_URL"
    | "TEST_REPORT";
  location: string;
  version: string;
  createdAt: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}

export interface AgentExecutionContext {
  projectId: string;
  taskId: string;
  project: Project;
  previousArtifacts: Artifact[];
  agentConfig?: Record<string, any>;
}

export interface AgentResponse {
  success: boolean;
  artifacts: Artifact[];
  nextTasks?: Task[];
  errorMessage?: string;
  metadata?: Record<string, any>;
}

// Additional types for the layered architecture
export interface CreateProjectRequest {
  userId: string;
  projectName: string;
  requestPrompt: string;
}

export interface UpdateProjectRequest {
  status?: Project['status'];
  updatedAt?: string;
}

export interface CreateTaskRequest {
  projectId: string;
  assignedAgent: string;
  status: Task['status'];
  dependencies: string[];
  description?: string;
}

export interface UpdateTaskRequest {
  status?: Task['status'];
  progress?: number;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  outputArtifactId?: string;
}

export interface CreateArtifactRequest {
  projectId: string;
  artifactType: Artifact['artifactType'];
  location: string;
  version: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}
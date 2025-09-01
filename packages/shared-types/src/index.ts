// User Management Types
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

// Project Management Types
export interface Project {
  id: string;
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

// Agent System Types
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

// API Request/Response Types
export interface CreateProjectRequest {
  projectName: string;
  requestPrompt: string;
}

export interface UpdateProjectRequest {
  projectName?: string;
  status?: Project["status"];
}

export interface CreateTaskRequest {
  assignedAgent: string;
  description?: string;
  dependencies?: string[];
}

export interface UpdateTaskRequest {
  status?: Task["status"];
  progress?: number;
  errorMessage?: string;
}

export interface CreateArtifactRequest {
  artifactType: Artifact["artifactType"];
  location: string;
  version: string;
  title?: string;
  description?: string;
  metadata?: Record<string, any>;
}

// API Response Wrappers
export interface ApiSuccessResponse<T = any> {
  success: true;
  data: T;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  error: string;
  code?: string;
  details?: any;
}

export type ApiResponse<T = any> = ApiSuccessResponse<T> | ApiErrorResponse;

// Pagination Types
export interface PaginationParams {
  limit?: number;
  startKey?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  hasMore: boolean;
  nextStartKey?: string;
  total?: number;
}

// WebSocket Types
export interface WebSocketMessage {
  type: "PROJECT_UPDATE" | "TASK_UPDATE" | "ARTIFACT_CREATED" | "ERROR";
  payload: any;
  timestamp: string;
}

export interface ProjectUpdateMessage extends WebSocketMessage {
  type: "PROJECT_UPDATE";
  payload: {
    projectId: string;
    status: Project["status"];
    progress?: number;
  };
}

export interface TaskUpdateMessage extends WebSocketMessage {
  type: "TASK_UPDATE";
  payload: {
    projectId: string;
    taskId: string;
    status: Task["status"];
    progress?: number;
  };
}

export interface ArtifactCreatedMessage extends WebSocketMessage {
  type: "ARTIFACT_CREATED";
  payload: {
    projectId: string;
    artifact: Artifact;
  };
}

// Authentication Types
export interface AuthUser {
  sub: string;
  email: string;
  email_verified: boolean;
  name?: string;
  given_name?: string;
  family_name?: string;
  picture?: string;
}

export interface AuthContext {
  user: AuthUser;
  token: string;
  tokenExpiry: number;
}

// Database Types
export interface DynamoDBRecord {
  PK: string;
  SK: string;
  GSI1PK?: string;
  GSI1SK?: string;
  createdAt: string;
  updatedAt: string;
}

// Utility Types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

// Status Enums for better type safety
export const ProjectStatus = {
  PENDING: "PENDING",
  IN_PROGRESS: "IN_PROGRESS", 
  COMPLETED: "COMPLETED",
  FAILED: "FAILED"
} as const;

export const TaskStatus = {
  TODO: "TODO",
  IN_PROGRESS: "IN_PROGRESS",
  DONE: "DONE", 
  FAILED: "FAILED",
  PENDING_APPROVAL: "PENDING_APPROVAL"
} as const;

export const ArtifactType = {
  SRS_DOCUMENT: "SRS_DOCUMENT",
  SOURCE_CODE: "SOURCE_CODE",
  DEPLOYMENT_URL: "DEPLOYMENT_URL",
  TEST_REPORT: "TEST_REPORT"
} as const;
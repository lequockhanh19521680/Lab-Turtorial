import { z } from 'zod';

// Core Entity Schemas
// User Management Types with RBAC
export const UserRoleSchema = z.enum(['user', 'admin', 'moderator']);
export type UserRole = z.infer<typeof UserRoleSchema>;

export const UserPermissionSchema = z.string().min(1);
export type UserPermission = z.infer<typeof UserPermissionSchema>;

export const UserSchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  email: z.string().email('Valid email is required'),
  name: z.string().optional(),
  givenName: z.string().optional(),
  familyName: z.string().optional(),
  picture: z.string().url().optional(),
  role: UserRoleSchema.default('user'),
  permissions: z.array(UserPermissionSchema).default([]),
  provider: z.enum(['google', 'cognito', 'local']),
  providerUserId: z.string().min(1, 'Provider user ID is required'),
  isActive: z.boolean().default(true),
  lastLoginAt: z.string().datetime().optional(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export interface User extends z.infer<typeof UserSchema> {}

// Authentication Types
export const LoginRequestSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const RegisterRequestSchema = z.object({
  email: z.string().email('Valid email is required'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  givenName: z.string().min(1, 'Given name is required').max(50),
  familyName: z.string().min(1, 'Family name is required').max(50),
  name: z.string().optional(),
});

export const RefreshTokenRequestSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

export const PasswordResetRequestSchema = z.object({
  email: z.string().email('Valid email is required'),
});

export const PasswordResetConfirmSchema = z.object({
  token: z.string().min(1, 'Reset token is required'),
  newPassword: z.string().min(8, 'Password must be at least 8 characters'),
});

// Authentication Response Types
export interface AuthResponse {
  success: boolean;
  user: User;
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface RefreshTokenResponse {
  success: boolean;
  accessToken: string;
  expiresIn: number;
}

// JWT Claims Interface
export interface JWTClaims {
  userId: string;
  email: string;
  role: UserRole;
  permissions: string[];
  iat?: number;
  exp?: number;
}

// Project Management Types
export const ProjectStatusSchema = z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'FAILED']);

export const ProjectSchema = z.object({
  id: z.string().min(1, 'Project ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  projectName: z.string().min(1, 'Project name is required').max(100, 'Project name too long'),
  requestPrompt: z.string().min(10, 'Request prompt must be at least 10 characters').max(2000, 'Request prompt too long'),
  status: ProjectStatusSchema,
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export interface Project extends z.infer<typeof ProjectSchema> {}

export const TaskStatusSchema = z.enum(['TODO', 'IN_PROGRESS', 'DONE', 'FAILED', 'PENDING_APPROVAL']);

export const TaskSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  taskId: z.string().min(1, 'Task ID is required'),
  assignedAgent: z.enum(['ProductManagerAgent', 'BackendEngineerAgent', 'FrontendEngineerAgent', 'DevOpsEngineerAgent']),
  status: TaskStatusSchema,
  dependencies: z.array(z.string()),
  outputArtifactId: z.string().optional(),
  description: z.string().optional(),
  progress: z.number().min(0).max(100).optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
  errorMessage: z.string().optional(),
});

export interface Task extends z.infer<typeof TaskSchema> {}

export const ArtifactTypeSchema = z.enum(['SRS_DOCUMENT', 'SOURCE_CODE', 'DEPLOYMENT_URL', 'TEST_REPORT']);

export const ArtifactSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  artifactId: z.string().min(1, 'Artifact ID is required'),
  artifactType: ArtifactTypeSchema,
  location: z.string().min(1, 'Location is required'),
  version: z.string().min(1, 'Version is required'),
  createdAt: z.string().datetime(),
  title: z.string().max(200, 'Title too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export interface Artifact extends z.infer<typeof ArtifactSchema> {}

// Agent System Types with Configuration-based Approach
export const AgentTypeSchema = z.enum(['product-manager', 'backend', 'frontend', 'devops']);
export type AgentType = z.infer<typeof AgentTypeSchema>;

export const AgentConfigSchema = z.object({
  type: AgentTypeSchema,
  name: z.string().min(1),
  description: z.string().optional(),
  timeout: z.number().positive().default(300000), // 5 minutes
  retryLimit: z.number().min(0).default(2),
  dependencies: z.array(AgentTypeSchema).default([]),
  capabilities: z.array(z.string()).default([]),
  metadata: z.record(z.string(), z.any()).optional(),
});

export interface AgentConfig extends z.infer<typeof AgentConfigSchema> {}

export interface AgentExecutionContext {
  projectId: string;
  taskId: string;
  project: Project;
  previousArtifacts: Artifact[];
  agentConfig: AgentConfig;
  userContext: {
    userId: string;
    role: UserRole;
    permissions: string[];
  };
  executionId: string;
  attempt: number;
}

export interface AgentResponse {
  success: boolean;
  artifacts: Artifact[];
  nextTasks?: Task[];
  errorMessage?: string;
  executionTime: number;
  tokensUsed?: number;
  metadata?: Record<string, any>;
}

// API Request/Response Types with Zod Schemas
export const CreateProjectRequestSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(100, 'Project name too long').trim(),
  requestPrompt: z.string().min(10, 'Request prompt must be at least 10 characters').max(2000, 'Request prompt too long').trim(),
});

export const UpdateProjectRequestSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(100, 'Project name too long').trim().optional(),
  status: ProjectStatusSchema.optional(),
});

export const CreateTaskRequestSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  assignedAgent: AgentTypeSchema,
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(500, 'Description too long').optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  dependencies: z.array(z.string()).default([]),
  status: TaskStatusSchema.default('TODO'),
  estimatedHours: z.number().positive().optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const UpdateTaskRequestSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long').optional(),
  status: TaskStatusSchema.optional(),
  assignedAgent: AgentTypeSchema.optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).optional(),
  progress: z.number().min(0).max(100).optional(),
  actualHours: z.number().positive().optional(),
  errorMessage: z.string().max(1000, 'Error message too long').optional(),
  startedAt: z.string().datetime().optional(),
  completedAt: z.string().datetime().optional(),
});

export const CreateArtifactRequestSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  artifactType: ArtifactTypeSchema,
  location: z.string().min(1, 'Location is required'),
  version: z.string().min(1, 'Version is required'),
  title: z.string().max(200, 'Title too long').optional(),
  description: z.string().max(1000, 'Description too long').optional(),
  metadata: z.record(z.string(), z.any()).optional(),
});

export const StartOrchestrationRequestSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
});

export const UpdateUserProfileRequestSchema = z.object({
  name: z.string().max(100, 'Name too long').optional(),
  givenName: z.string().max(50, 'Given name too long').optional(),
  familyName: z.string().max(50, 'Family name too long').optional(),
  picture: z.string().url('Invalid picture URL').optional(),
});

// Type inference from Zod schemas
export interface CreateProjectRequest extends z.infer<typeof CreateProjectRequestSchema> {}
export interface UpdateProjectRequest extends z.infer<typeof UpdateProjectRequestSchema> {}
export interface CreateTaskRequest extends z.infer<typeof CreateTaskRequestSchema> {}
export interface UpdateTaskRequest extends z.infer<typeof UpdateTaskRequestSchema> {}
export interface CreateArtifactRequest extends z.infer<typeof CreateArtifactRequestSchema> {}
export interface StartOrchestrationRequest extends z.infer<typeof StartOrchestrationRequestSchema> {}
export interface UpdateUserProfileRequest extends z.infer<typeof UpdateUserProfileRequestSchema> {}

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
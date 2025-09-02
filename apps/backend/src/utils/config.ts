import { z } from 'zod';

/**
 * Configuration schema for environment validation
 */
const ConfigSchema = z.object({
  // Environment
  NODE_ENV: z.enum(['development', 'staging', 'production']).default('development'),
  
  // AWS Configuration
  AWS_REGION: z.string().default('us-east-1'),
  
  // JWT Configuration
  JWT_SECRET: z.string().min(32, 'JWT secret must be at least 32 characters'),
  JWT_REFRESH_SECRET: z.string().optional(),
  JWT_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  // Database Configuration
  DYNAMODB_TABLE_PREFIX: z.string().default('lab-tutorial'),
  USERS_TABLE: z.string().optional(),
  PROJECTS_TABLE: z.string().optional(),
  TASKS_TABLE: z.string().optional(),
  ARTIFACTS_TABLE: z.string().optional(),
  
  // API Configuration
  API_VERSION: z.string().default('v1'),
  API_BASE_URL: z.string().url().optional(),
  
  // CORS Configuration
  CORS_ORIGINS: z.string().default('*'),
  
  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().transform(Number).default(900000), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().transform(Number).default(100),
  
  // OpenAI Configuration
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4'),
  OPENAI_MAX_TOKENS: z.string().transform(Number).default(2048),
  
  // WebSocket Configuration
  WEBSOCKET_ENDPOINT: z.string().url().optional(),
  
  // S3 Configuration
  S3_BUCKET: z.string().optional(),
  S3_REGION: z.string().optional(),
  
  // CloudWatch Configuration
  LOG_LEVEL: z.enum(['debug', 'info', 'warn', 'error']).default('info'),
  ENABLE_METRICS: z.string().transform(v => v === 'true').default(false),
  
  // Security Configuration
  ENABLE_SECURITY_HEADERS: z.string().transform(v => v === 'true').default(true),
  SESSION_TIMEOUT_MINUTES: z.string().transform(Number).default(30),
  
  // Feature Flags
  ENABLE_AI_FEATURES: z.string().transform(v => v === 'true').default(true),
  ENABLE_WEBSOCKET: z.string().transform(v => v === 'true').default(true),
  ENABLE_FILE_UPLOAD: z.string().transform(v => v === 'true').default(true),
});

export type Config = z.infer<typeof ConfigSchema>;

/**
 * Load and validate configuration from environment variables
 */
function loadConfig(): Config {
  try {
    return ConfigSchema.parse(process.env);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const missingVars = error.issues
        .map(issue => `${issue.path.join('.')}: ${issue.message}`)
        .join('\n');
      
      throw new Error(`Configuration validation failed:\n${missingVars}`);
    }
    throw error;
  }
}

// Export singleton configuration instance
export const config = loadConfig();

/**
 * Agent workflow configuration
 */
export const agentWorkflowConfig = {
  defaultOrder: ['product-manager', 'backend', 'frontend', 'devops'] as const,
  dependencies: {
    'product-manager': [] as const,
    'backend': ['product-manager'] as const,
    'frontend': ['product-manager', 'backend'] as const,
    'devops': ['backend', 'frontend'] as const,
  },
  timeouts: {
    'product-manager': 300000, // 5 minutes
    'backend': 600000,         // 10 minutes
    'frontend': 600000,        // 10 minutes
    'devops': 300000,          // 5 minutes
  },
  retryLimits: {
    'product-manager': 2,
    'backend': 3,
    'frontend': 3,
    'devops': 2,
  }
} as const;

/**
 * Database table names with proper prefixes
 */
export const tableNames = {
  users: config.USERS_TABLE || `${config.DYNAMODB_TABLE_PREFIX}-users`,
  projects: config.PROJECTS_TABLE || `${config.DYNAMODB_TABLE_PREFIX}-projects`,
  tasks: config.TASKS_TABLE || `${config.DYNAMODB_TABLE_PREFIX}-tasks`,
  artifacts: config.ARTIFACTS_TABLE || `${config.DYNAMODB_TABLE_PREFIX}-artifacts`,
} as const;

/**
 * API response formats and standards
 */
export const apiConfig = {
  version: config.API_VERSION,
  pagination: {
    defaultLimit: 20,
    maxLimit: 100,
  },
  cache: {
    defaultTtl: 300, // 5 minutes
    longTtl: 3600,   // 1 hour
  },
  rateLimit: {
    windowMs: config.RATE_LIMIT_WINDOW_MS,
    maxRequests: config.RATE_LIMIT_MAX_REQUESTS,
  },
} as const;

/**
 * Security configuration
 */
export const securityConfig = {
  jwt: {
    secret: config.JWT_SECRET,
    refreshSecret: config.JWT_REFRESH_SECRET || config.JWT_SECRET,
    expiresIn: config.JWT_EXPIRES_IN,
    refreshExpiresIn: config.JWT_REFRESH_EXPIRES_IN,
  },
  cors: {
    origins: config.CORS_ORIGINS.split(',').map(origin => origin.trim()),
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    headers: ['Content-Type', 'Authorization', 'X-Requested-With'],
    maxAge: 86400, // 24 hours
  },
  headers: {
    'X-Frame-Options': 'DENY',
    'X-Content-Type-Options': 'nosniff',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
  },
} as const;

/**
 * Feature flags configuration
 */
export const featureFlags = {
  aiFeatures: config.ENABLE_AI_FEATURES,
  websocket: config.ENABLE_WEBSOCKET,
  fileUpload: config.ENABLE_FILE_UPLOAD,
} as const;

/**
 * Logging configuration
 */
export const loggingConfig = {
  level: config.LOG_LEVEL,
  enableMetrics: config.ENABLE_METRICS,
  structured: true,
  includeContext: true,
} as const;
import { APIGatewayEvent, APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { UnauthorizedError, ForbiddenError } from './errors.js';
import { createErrorResponse } from './lambda.js';

export type UserRole = 'user' | 'admin' | 'moderator';

export interface UserClaims extends JwtPayload {
  userId: string;
  email: string;
  role: UserRole;
  permissions?: string[];
  iat?: number;
  exp?: number;
  refreshToken?: string;
}

export interface AuthContext {
  user: UserClaims;
  isAuthenticated: boolean;
}

/**
 * Enhanced JWT verification middleware with role-based access control
 */
export const verifyJwtToken = (token: string): UserClaims => {
  const jwtSecret = process.env.JWT_SECRET;
  if (!jwtSecret) {
    throw new Error('JWT_SECRET environment variable is not set');
  }

  try {
    const decoded = jwt.verify(token, jwtSecret) as UserClaims;
    
    // Validate required claims
    if (!decoded.userId || !decoded.email || !decoded.role) {
      throw new UnauthorizedError('Invalid token claims');
    }

    // Check token expiration (additional validation)
    if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
      throw new UnauthorizedError('Token has expired');
    }

    return decoded;
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Token has expired');
    }
    throw error;
  }
};

/**
 * Extract and verify JWT token from Authorization header
 */
export const extractAuthToken = (event: APIGatewayEvent | APIGatewayProxyEvent): string => {
  const authHeader = event.headers.Authorization || event.headers.authorization;
  
  if (!authHeader) {
    throw new UnauthorizedError('No authorization header provided');
  }

  const token = authHeader.replace(/^Bearer\s+/i, '');
  if (!token || token === authHeader) {
    throw new UnauthorizedError('Invalid authorization header format');
  }

  return token;
};

/**
 * Authentication middleware for Lambda functions
 */
export const authMiddleware = (event: APIGatewayEvent | APIGatewayProxyEvent): UserClaims => {
  try {
    const token = extractAuthToken(event);
    return verifyJwtToken(token);
  } catch (error) {
    if (error instanceof UnauthorizedError) {
      throw error;
    }
    throw new UnauthorizedError('Authentication failed');
  }
};

/**
 * Role-based access control middleware
 */
export const requireRole = (allowedRoles: UserRole[]) => {
  return (user: UserClaims): void => {
    if (!allowedRoles.includes(user.role)) {
      throw new ForbiddenError(`Access denied. Required roles: ${allowedRoles.join(', ')}`);
    }
  };
};

/**
 * Permission-based access control middleware
 */
export const requirePermission = (requiredPermissions: string[]) => {
  return (user: UserClaims): void => {
    const userPermissions = user.permissions || [];
    
    const hasPermission = requiredPermissions.some(permission => 
      userPermissions.includes(permission) || userPermissions.includes('*')
    );

    if (!hasPermission) {
      throw new ForbiddenError(`Access denied. Required permissions: ${requiredPermissions.join(', ')}`);
    }
  };
};

/**
 * Admin-only access middleware
 */
export const requireAdmin = requireRole(['admin']);

/**
 * Admin or moderator access middleware
 */
export const requireAdminOrModerator = requireRole(['admin', 'moderator']);

/**
 * Generate JWT tokens for authentication
 */
export const generateTokens = (user: Omit<UserClaims, 'iat' | 'exp'>): { accessToken: string; refreshToken: string } => {
  const jwtSecret = process.env.JWT_SECRET;
  const refreshSecret = process.env.JWT_REFRESH_SECRET || jwtSecret;
  
  if (!jwtSecret || !refreshSecret) {
    throw new Error('JWT secrets not configured');
  }

  // Access token (short-lived)
  const accessTokenPayload = {
    userId: user.userId,
    email: user.email,
    role: user.role,
    permissions: user.permissions,
  };
  
  const accessTokenOptions: jwt.SignOptions = {
    expiresIn: (process.env.JWT_EXPIRES_IN || '15m') as jwt.SignOptions['expiresIn'],
    issuer: 'lab-tutorial-api',
    audience: 'lab-tutorial-client',
  };
  
  const accessToken = jwt.sign(accessTokenPayload, jwtSecret, accessTokenOptions);

  // Refresh token (long-lived)
  const refreshTokenPayload = {
    userId: user.userId,
    type: 'refresh',
  };
  
  const refreshTokenOptions: jwt.SignOptions = {
    expiresIn: (process.env.JWT_REFRESH_EXPIRES_IN || '7d') as jwt.SignOptions['expiresIn'],
    issuer: 'lab-tutorial-api',
    audience: 'lab-tutorial-client',
  };
  
  const refreshToken = jwt.sign(refreshTokenPayload, refreshSecret, refreshTokenOptions);

  return { accessToken, refreshToken };
};

/**
 * Verify refresh token and generate new access token
 */
export const refreshAccessToken = (refreshToken: string): { accessToken: string; user: UserClaims } => {
  const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET;
  
  if (!refreshSecret) {
    throw new Error('JWT refresh secret not configured');
  }

  try {
    const decoded = jwt.verify(refreshToken, refreshSecret) as any;
    
    if (decoded.type !== 'refresh') {
      throw new UnauthorizedError('Invalid refresh token type');
    }

    // Here you would typically fetch the current user data from the database
    // For now, we'll return a basic structure
    const user: UserClaims = {
      userId: decoded.userId,
      email: decoded.email || '',
      role: decoded.role || 'user',
      permissions: decoded.permissions || [],
    };

    const { accessToken } = generateTokens(user);
    
    return { accessToken, user };
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      throw new UnauthorizedError('Invalid refresh token');
    }
    if (error instanceof jwt.TokenExpiredError) {
      throw new UnauthorizedError('Refresh token has expired');
    }
    throw error;
  }
};

/**
 * Enhanced error handler for authentication errors
 */
export const handleAuthError = (error: any): APIGatewayProxyResult => {
  console.error('Authentication error:', error);

  if (error instanceof UnauthorizedError || error instanceof ForbiddenError) {
    return createErrorResponse(error.statusCode, error.message, {
      code: error.code,
      timestamp: new Date().toISOString(),
    });
  }

  return createErrorResponse(500, 'Internal authentication error', {
    code: 'AUTH_INTERNAL_ERROR',
    timestamp: new Date().toISOString(),
  });
};
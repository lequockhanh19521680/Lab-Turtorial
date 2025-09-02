import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { 
  verifyJwtToken, 
  generateTokens, 
  requireRole, 
  requirePermission 
} from '../utils/auth.js';
import { UnauthorizedError, ForbiddenError } from '../utils/errors.js';

// Mock environment variables
const originalEnv = process.env;

describe('Authentication Utilities', () => {
  beforeEach(() => {
    process.env = {
      ...originalEnv,
      JWT_SECRET: 'test-secret-key-that-is-long-enough-for-testing',
      JWT_REFRESH_SECRET: 'test-refresh-secret-key-that-is-long-enough',
      JWT_EXPIRES_IN: '15m',
      JWT_REFRESH_EXPIRES_IN: '7d',
    };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('generateTokens', () => {
    it('should generate valid access and refresh tokens', () => {
      const user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user' as const,
        permissions: ['read:projects'],
      };

      const tokens = generateTokens(user);

      expect(tokens).toHaveProperty('accessToken');
      expect(tokens).toHaveProperty('refreshToken');
      expect(typeof tokens.accessToken).toBe('string');
      expect(typeof tokens.refreshToken).toBe('string');
      expect(tokens.accessToken.length).toBeGreaterThan(0);
      expect(tokens.refreshToken.length).toBeGreaterThan(0);
    });

    it('should throw error when JWT_SECRET is not set', () => {
      delete process.env.JWT_SECRET;

      const user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user' as const,
        permissions: [],
      };

      expect(() => generateTokens(user)).toThrow('JWT secrets not configured');
    });
  });

  describe('verifyJwtToken', () => {
    it('should verify valid token and return user claims', () => {
      const user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user' as const,
        permissions: ['read:projects'],
      };

      const { accessToken } = generateTokens(user);
      const claims = verifyJwtToken(accessToken);

      expect(claims.userId).toBe(user.userId);
      expect(claims.email).toBe(user.email);
      expect(claims.role).toBe(user.role);
      expect(claims.permissions).toEqual(user.permissions);
    });

    it('should throw UnauthorizedError for invalid token', () => {
      expect(() => verifyJwtToken('invalid-token')).toThrow(UnauthorizedError);
    });

    it('should throw UnauthorizedError for token with missing claims', () => {
      // Create a token without required claims
      const jwt = require('jsonwebtoken');
      const invalidToken = jwt.sign(
        { someField: 'value' }, 
        process.env.JWT_SECRET!
      );

      expect(() => verifyJwtToken(invalidToken)).toThrow(UnauthorizedError);
    });
  });

  describe('requireRole', () => {
    it('should allow user with correct role', () => {
      const user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin' as const,
        permissions: [],
      };

      const checkRole = requireRole(['admin', 'moderator']);
      
      expect(() => checkRole(user)).not.toThrow();
    });

    it('should throw ForbiddenError for user with incorrect role', () => {
      const user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user' as const,
        permissions: [],
      };

      const checkRole = requireRole(['admin']);

      expect(() => checkRole(user)).toThrow(ForbiddenError);
      expect(() => checkRole(user)).toThrow('Access denied. Required roles: admin');
    });
  });

  describe('requirePermission', () => {
    it('should allow user with correct permission', () => {
      const user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user' as const,
        permissions: ['read:projects', 'write:projects'],
      };

      const checkPermission = requirePermission(['read:projects']);
      
      expect(() => checkPermission(user)).not.toThrow();
    });

    it('should allow user with wildcard permission', () => {
      const user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'admin' as const,
        permissions: ['*'],
      };

      const checkPermission = requirePermission(['read:projects']);
      
      expect(() => checkPermission(user)).not.toThrow();
    });

    it('should throw ForbiddenError for user without required permission', () => {
      const user = {
        userId: 'user-123',
        email: 'test@example.com',
        role: 'user' as const,
        permissions: ['read:tasks'],
      };

      const checkPermission = requirePermission(['write:projects']);

      expect(() => checkPermission(user)).toThrow(ForbiddenError);
      expect(() => checkPermission(user)).toThrow('Access denied. Required permissions: write:projects');
    });
  });
});
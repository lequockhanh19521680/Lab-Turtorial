/**
 * Custom error classes for comprehensive error handling
 */

export abstract class AppError extends Error {
  abstract statusCode: number;
  abstract code: string;
  abstract isOperational: boolean;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Error.captureStackTrace(this, this.constructor);
  }
}

export class ValidationError extends AppError {
  statusCode = 400;
  code = 'VALIDATION_ERROR';
  isOperational = true;

  constructor(message: string, public details?: any) {
    super(message);
  }
}

export class UnauthorizedError extends AppError {
  statusCode = 401;
  code = 'UNAUTHORIZED';
  isOperational = true;

  constructor(message: string = 'Unauthorized access') {
    super(message);
  }
}

export class ForbiddenError extends AppError {
  statusCode = 403;
  code = 'FORBIDDEN';
  isOperational = true;

  constructor(message: string = 'Insufficient permissions') {
    super(message);
  }
}

export class NotFoundError extends AppError {
  statusCode = 404;
  code = 'NOT_FOUND';
  isOperational = true;

  constructor(message: string = 'Resource not found') {
    super(message);
  }
}

export class ConflictError extends AppError {
  statusCode = 409;
  code = 'CONFLICT';
  isOperational = true;

  constructor(message: string = 'Resource conflict') {
    super(message);
  }
}

export class RateLimitError extends AppError {
  statusCode = 429;
  code = 'RATE_LIMIT_EXCEEDED';
  isOperational = true;

  constructor(message: string = 'Rate limit exceeded') {
    super(message);
  }
}

export class InternalServerError extends AppError {
  statusCode = 500;
  code = 'INTERNAL_SERVER_ERROR';
  isOperational = false;

  constructor(message: string = 'Internal server error') {
    super(message);
  }
}

export class ServiceUnavailableError extends AppError {
  statusCode = 503;
  code = 'SERVICE_UNAVAILABLE';
  isOperational = true;

  constructor(message: string = 'Service temporarily unavailable') {
    super(message);
  }
}
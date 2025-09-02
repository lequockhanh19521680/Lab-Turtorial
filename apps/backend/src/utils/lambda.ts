import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import jwt from "jsonwebtoken";
import { AppError, UnauthorizedError } from "./errors.js";

export interface LambdaResponse {
  statusCode: number;
  headers?: Record<string, string>;
  body: string;
}

export const createResponse = (
  statusCode: number,
  body: any,
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      "Content-Type": "application/json",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Headers":
        "Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token",
      "Access-Control-Allow-Methods": "GET,POST,PUT,PATCH,DELETE,OPTIONS",
      "Access-Control-Max-Age": "86400", // 24 hours
      "X-Frame-Options": "DENY",
      "X-Content-Type-Options": "nosniff",
      "Strict-Transport-Security": "max-age=31536000; includeSubDomains",
      ...headers,
    },
    body: JSON.stringify(body),
  };
};

export const createSuccessResponse = (data: any): APIGatewayProxyResult => {
  return createResponse(200, { 
    success: true, 
    timestamp: new Date().toISOString(),
    ...data 
  });
};

export const createErrorResponse = (
  statusCode: number,
  message: string,
  error?: any
): APIGatewayProxyResult => {
  const errorResponse: any = {
    success: false,
    message,
    timestamp: new Date().toISOString(),
  };

  if (error) {
    if (typeof error === 'object') {
      errorResponse.error = error;
    } else {
      errorResponse.error = { message: error };
    }
  }

  return createResponse(statusCode, errorResponse);
};

/**
 * Enhanced error handler for Lambda functions
 */
export const handleError = (error: any): APIGatewayProxyResult => {
  console.error('Lambda function error:', error);

  // Handle custom application errors
  if (error instanceof AppError) {
    const errorDetails: any = { code: error.code };
    if (error instanceof Error && error.cause) {
      errorDetails.cause = error.cause;
    }
    
    return createErrorResponse(error.statusCode, error.message, errorDetails);
  }

  // Handle validation errors from Zod or other libraries
  if (error.name === 'ZodError') {
    return createErrorResponse(400, 'Validation failed', {
      code: 'VALIDATION_ERROR',
      details: error.issues,
    });
  }

  // Handle AWS SDK errors
  if (error.name && error.name.includes('AWS') && error.statusCode) {
    return createErrorResponse(error.statusCode, error.message || 'AWS service error', {
      code: error.code || 'AWS_ERROR',
      service: error.serviceName || 'Unknown',
    });
  }

  // Handle JWT errors
  if (error.name === 'JsonWebTokenError') {
    return createErrorResponse(401, 'Invalid token', {
      code: 'INVALID_TOKEN',
    });
  }

  if (error.name === 'TokenExpiredError') {
    return createErrorResponse(401, 'Token has expired', {
      code: 'TOKEN_EXPIRED',
    });
  }

  // Handle generic errors
  return createErrorResponse(500, 'Internal server error', {
    code: 'INTERNAL_SERVER_ERROR',
    ...(process.env.NODE_ENV === 'development' && { 
      stack: error.stack,
      details: error.message 
    }),
  });
};

export const getUserIdFromEvent = (event: APIGatewayProxyEvent): string => {
  // Extract user ID from JWT token in Authorization header
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader) {
    throw new UnauthorizedError("No authorization header");
  }

  // Extract token from "Bearer <token>" format
  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : authHeader;

  try {
    // When using Cognito authorizer, the token is already validated by API Gateway
    // We can decode it without verification to extract claims
    const decoded = jwt.decode(token) as any;

    if (!decoded) {
      throw new Error("Invalid token format");
    }

    // Extract user ID from 'sub' claim (standard JWT claim) or custom claim
    const userId =
      decoded.sub || decoded["cognito:username"] || decoded.username;

    if (!userId) {
      throw new Error("No user ID found in token");
    }

    return userId;
  } catch (error) {
    console.error("Error decoding JWT token:", error);
    throw new Error("Invalid token");
  }
};

export const validateRequired = (data: any, requiredFields: string[]): void => {
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
  }
};

export const parseJSON = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    throw new Error("Invalid JSON format");
  }
};

import { z } from 'zod';
import { APIGatewayProxyResult } from 'aws-lambda';
import { createErrorResponse } from './lambda';

/**
 * Validates request body using Zod schema
 * Returns validation result with parsed data or error response
 */
export function validateRequestBody<T>(
  body: string | null,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: APIGatewayProxyResult } {
  try {
    if (!body) {
      return {
        success: false,
        response: createErrorResponse(400, 'Request body is required')
      };
    }

    const parsedBody = JSON.parse(body);
    const validatedData = schema.parse(parsedBody);
    
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.map((err: z.ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message,
        received: 'received' in err ? err.received : undefined
      }));
      
      return {
        success: false,
        response: createErrorResponse(400, 'Validation failed', {
          errors: validationErrors,
          details: 'Please check the request body format and required fields'
        })
      };
    }
    
    if (error instanceof SyntaxError) {
      return {
        success: false,
        response: createErrorResponse(400, 'Invalid JSON format')
      };
    }
    
    return {
      success: false,
      response: createErrorResponse(400, 'Request validation failed')
    };
  }
}

/**
 * Validates path parameters using Zod schema
 */
export function validatePathParameters<T>(
  pathParameters: Record<string, string> | null,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: APIGatewayProxyResult } {
  try {
    if (!pathParameters) {
      return {
        success: false,
        response: createErrorResponse(400, 'Path parameters are required')
      };
    }

    const validatedData = schema.parse(pathParameters);
    
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.map((err: z.ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return {
        success: false,
        response: createErrorResponse(400, 'Invalid path parameters', {
          errors: validationErrors
        })
      };
    }
    
    return {
      success: false,
      response: createErrorResponse(400, 'Path parameter validation failed')
    };
  }
}

/**
 * Validates query parameters using Zod schema
 */
export function validateQueryParameters<T>(
  queryStringParameters: Record<string, string> | null,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; response: APIGatewayProxyResult } {
  try {
    const validatedData = schema.parse(queryStringParameters || {});
    
    return {
      success: true,
      data: validatedData
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const validationErrors = error.issues.map((err: z.ZodIssue) => ({
        field: err.path.join('.'),
        message: err.message
      }));
      
      return {
        success: false,
        response: createErrorResponse(400, 'Invalid query parameters', {
          errors: validationErrors
        })
      };
    }
    
    return {
      success: false,
      response: createErrorResponse(400, 'Query parameter validation failed')
    };
  }
}
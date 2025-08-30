import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'

export interface LambdaResponse {
  statusCode: number
  headers?: Record<string, string>
  body: string
}

export const createResponse = (
  statusCode: number,
  body: any,
  headers: Record<string, string> = {}
): APIGatewayProxyResult => {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,PATCH,DELETE,OPTIONS',
      ...headers,
    },
    body: JSON.stringify(body),
  }
}

export const createSuccessResponse = (data: any): APIGatewayProxyResult => {
  return createResponse(200, { success: true, ...data })
}

export const createErrorResponse = (statusCode: number, message: string, error?: any): APIGatewayProxyResult => {
  return createResponse(statusCode, {
    success: false,
    message,
    ...(error && { error: error.message || error }),
  })
}

export const getUserIdFromEvent = (event: APIGatewayProxyEvent): string => {
  // Extract user ID from JWT token in Authorization header
  const authHeader = event.headers.Authorization || event.headers.authorization
  if (!authHeader) {
    throw new Error('No authorization header')
  }

  // For MVP, we'll use a mock user ID
  // In production, decode JWT and extract user ID
  return 'user-12345' // Mock user ID for MVP
}

export const validateRequired = (data: any, requiredFields: string[]): void => {
  for (const field of requiredFields) {
    if (!data[field]) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
}

export const parseJSON = (jsonString: string): any => {
  try {
    return JSON.parse(jsonString)
  } catch (error) {
    throw new Error('Invalid JSON format')
  }
}
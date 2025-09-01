import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import jwt from "jsonwebtoken";

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
      ...headers,
    },
    body: JSON.stringify(body),
  };
};

export const createSuccessResponse = (data: any): APIGatewayProxyResult => {
  return createResponse(200, { success: true, ...data });
};

export const createErrorResponse = (
  statusCode: number,
  message: string,
  error?: any
): APIGatewayProxyResult => {
  return createResponse(statusCode, {
    success: false,
    message,
    ...(error && { error: error.message || error }),
  });
};

export const getUserIdFromEvent = (event: APIGatewayProxyEvent): string => {
  // Extract user ID from JWT token in Authorization header
  const authHeader = event.headers.Authorization || event.headers.authorization;
  if (!authHeader) {
    throw new Error("No authorization header");
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

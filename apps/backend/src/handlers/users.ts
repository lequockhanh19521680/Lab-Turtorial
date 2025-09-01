import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { UserService } from "../services/UserService";
import { validateRequestBody } from "../utils/validation";
import {
  createSuccessResponse,
  createErrorResponse,
  getUserIdFromEvent,
  parseJSON,
} from "../utils/lambda";
import jwt from "jsonwebtoken";
import { z } from 'zod';

// Local schema for user profile updates
const UpdateUserProfileRequestSchema = z.object({
  name: z.string().max(100, 'Name too long').optional(),
  givenName: z.string().max(50, 'Given name too long').optional(),
  familyName: z.string().max(50, 'Family name too long').optional(),
  picture: z.string().url('Invalid picture URL').optional(),
});

const userService = new UserService();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Users handler event:", JSON.stringify(event, null, 2));

  try {
    const method = event.httpMethod;
    const path = event.path;

    switch (method) {
      case "GET":
        if (path.includes("/profile")) {
          return await getUserProfile(event);
        }
        return createErrorResponse(404, "Endpoint not found");

      case "POST":
        return await createOrUpdateUser(event);

      case "PATCH":
        if (path.includes("/profile")) {
          return await updateUserProfile(event);
        }
        return createErrorResponse(404, "Endpoint not found");

      default:
        return createErrorResponse(405, "Method not allowed");
    }
  } catch (error) {
    console.error("Error in users handler:", error);
    return createErrorResponse(500, "Internal server error", error);
  }
};

async function getUserProfile(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return createErrorResponse(401, "Unauthorized");
    }

    const user = await userService.getUser(userId);
    if (!user) {
      return createErrorResponse(404, "User not found");
    }

    return createSuccessResponse(user);
  } catch (error) {
    console.error("Error getting user profile:", error);
    return createErrorResponse(500, "Failed to get user profile", error);
  }
}

async function createOrUpdateUser(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    if (!event.body) {
      return createErrorResponse(400, "Request body is required");
    }

    const body = parseJSON(event.body);
    if (!body) {
      return createErrorResponse(400, "Request body is required");
    }

    // Extract user information from JWT token or body
    let userData;
    
    // If this is a Google OAuth callback, extract from token
    if (body.idToken) {
      try {
        const decoded = jwt.decode(body.idToken) as any;
        if (!decoded) {
          return createErrorResponse(400, "Invalid ID token");
        }

        userData = {
          userId: decoded.sub,
          email: decoded.email,
          name: decoded.name,
          givenName: decoded.given_name,
          familyName: decoded.family_name,
          picture: decoded.picture,
          provider: "google" as const,
          providerUserId: decoded.sub,
        };
      } catch (error) {
        console.error("Error decoding ID token:", error);
        return createErrorResponse(400, "Invalid ID token");
      }
    } else {
      // Direct user creation/update
      const { userId, email, name, givenName, familyName, picture, provider, providerUserId } = body;
      
      if (!userId || !email) {
        return createErrorResponse(400, "userId and email are required");
      }

      userData = {
        userId,
        email,
        name,
        givenName,
        familyName,
        picture,
        provider: provider || "cognito",
        providerUserId: providerUserId || userId,
      };
    }

    const user = await userService.createOrUpdateUser(userData);
    return createSuccessResponse(user);
  } catch (error) {
    console.error("Error creating/updating user:", error);
    return createErrorResponse(500, "Failed to create/update user", error);
  }
}

async function updateUserProfile(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
  try {
    const userId = getUserIdFromEvent(event);
    if (!userId) {
      return createErrorResponse(401, "Unauthorized");
    }

    // Validate request body with Zod
    const validation = validateRequestBody(event.body, UpdateUserProfileRequestSchema);
    if (!validation.success) {
      return validation.response;
    }

    const updates = validation.data;

    if (Object.keys(updates).length === 0) {
      return createErrorResponse(400, "No valid fields to update");
    }

    const updatedUser = await userService.updateUser(userId, updates);
    return createSuccessResponse(updatedUser);
  } catch (error) {
    console.error("Error updating user profile:", error);
    return createErrorResponse(500, "Failed to update user profile", error);
  }
}
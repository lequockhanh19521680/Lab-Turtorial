import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { validateRequestBody } from "../utils/validation.js";
import {
  createSuccessResponse,
  createErrorResponse,
  getUserIdFromEvent,
  parseJSON,
} from "../utils/lambda.js";
import { z } from "zod";
import type {
  ProjectService as ProjectServiceType,
  UserService as UserServiceType,
  TaskService as TaskServiceType,
} from "@lab-tutorial/infrastructure";

interface Services {
  ProjectService?: ProjectServiceType;
  UserService?: UserServiceType;
  TaskService?: TaskServiceType;
}

// Local schemas for validation
const CreateProjectRequestSchema = z.object({
  projectName: z
    .string()
    .min(1, "Project name is required")
    .max(100, "Project name too long")
    .trim(),
  requestPrompt: z
    .string()
    .min(10, "Request prompt must be at least 10 characters")
    .max(2000, "Request prompt too long")
    .trim(),
});

let services: Services = {};

const initializeServices = async () => {
  if (!services.ProjectService) {
    const { ProjectService, UserService, TaskService } = await import(
      "@lab-tutorial/infrastructure"
    );
    services.ProjectService = new ProjectService();
    services.UserService = new UserService();
    services.TaskService = new TaskService();
  }
};

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  console.log("Projects handler event:", JSON.stringify(event, null, 2));

  try {
    await initializeServices();
    const method = event.httpMethod;
    const pathParameters = event.pathParameters || {};

    switch (method) {
      case "GET":
        if (pathParameters.id) {
          return await getProject(pathParameters.id);
        } else {
          return await getProjects(event);
        }

      case "POST":
        return await createProject(event);

      case "PATCH":
        if (!pathParameters.id) {
          return createErrorResponse(400, "Project ID is required");
        }
        return await updateProject(pathParameters.id, event);

      case "DELETE":
        if (!pathParameters.id) {
          return createErrorResponse(400, "Project ID is required");
        }
        return await deleteProject(pathParameters.id);

      default:
        return createErrorResponse(405, "Method not allowed");
    }
  } catch (error) {
    console.error("Error in projects handler:", error);
    return createErrorResponse(500, "Internal server error", error);
  }
};

const getProjects = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserIdFromEvent(event);
    const projects = await services.UserService!.getUserProjects(userId);

    return createSuccessResponse({ projects });
  } catch (error) {
    console.error("Error getting projects:", error);
    return createErrorResponse(500, "Failed to get projects", error);
  }
};

const getProject = async (
  projectId: string
): Promise<APIGatewayProxyResult> => {
  try {
    const project = await services.ProjectService!.getProject(projectId);

    if (!project) {
      return createErrorResponse(404, "Project not found");
    }

    return createSuccessResponse({ project });
  } catch (error) {
    console.error("Error getting project:", error);
    return createErrorResponse(500, "Failed to get project", error);
  }
};

const createProject = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const userId = getUserIdFromEvent(event);

    // Validate request body with Zod
    const validation = validateRequestBody(
      event.body,
      CreateProjectRequestSchema
    );
    if (!validation.success) {
      return validation.response;
    }

    const { projectName, requestPrompt } = validation.data;

    const project = await services.ProjectService!.createProject({
      userId,
      projectName,
      requestPrompt,
    });

    return createSuccessResponse({
      projectId: project.projectId,
      status: "created",
      message: "Project created successfully",
    });
  } catch (error) {
    console.error("Error creating project:", error);
    return createErrorResponse(500, "Failed to create project", error);
  }
};

const updateProject = async (
  projectId: string,
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  try {
    const body = parseJSON(event.body || "{}");

    const project = await services.ProjectService!.updateProject(
      projectId,
      body
    );

    return createSuccessResponse({ project });
  } catch (error) {
    console.error("Error updating project:", error);
    return createErrorResponse(500, "Failed to update project", error);
  }
};

const deleteProject = async (
  projectId: string
): Promise<APIGatewayProxyResult> => {
  try {
    await services.ProjectService!.deleteProject(projectId);

    return createSuccessResponse({ message: "Project deleted successfully" });
  } catch (error) {
    console.error("Error deleting project:", error);
    return createErrorResponse(500, "Failed to delete project", error);
  }
};

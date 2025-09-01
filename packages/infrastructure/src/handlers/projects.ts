import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ProjectService } from "../services";
import {
  createSuccessResponse,
  createErrorResponse,
  getUserIdFromEvent,
  validateRequired,
  parseJSON,
} from "../utils/lambda";

/**
 * HTTP handler for Project operations
 * Orchestrates requests between API Gateway and the service layer
 */
export class ProjectHandler {
  private readonly projectService: ProjectService;

  constructor() {
    this.projectService = new ProjectService();
  }

  /**
   * Main Lambda handler entry point
   */
  async handle(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    console.log("Projects handler event:", JSON.stringify(event, null, 2));

    try {
      const method = event.httpMethod;
      const pathParameters = event.pathParameters || {};

      switch (method) {
        case "GET":
          if (pathParameters.id) {
            return await this.getProject(pathParameters.id);
          } else {
            return await this.getProjects(event);
          }

        case "POST":
          return await this.createProject(event);

        case "PATCH":
          if (!pathParameters.id) {
            return createErrorResponse(400, "Project ID is required");
          }
          return await this.updateProject(pathParameters.id, event);

        case "DELETE":
          if (!pathParameters.id) {
            return createErrorResponse(400, "Project ID is required");
          }
          return await this.deleteProject(pathParameters.id);

        default:
          return createErrorResponse(405, "Method not allowed");
      }
    } catch (error) {
      console.error("Projects handler error:", error);
      return createErrorResponse(500, "Internal server error", error);
    }
  }

  /**
   * Get single project by ID
   */
  private async getProject(projectId: string): Promise<APIGatewayProxyResult> {
    try {
      const project = await this.projectService.getProject(projectId);
      
      if (!project) {
        return createErrorResponse(404, "Project not found");
      }

      return createSuccessResponse({ project });
    } catch (error) {
      console.error("Error getting project:", error);
      return createErrorResponse(500, "Failed to get project", error);
    }
  }

  /**
   * Get all projects for the authenticated user
   */
  private async getProjects(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const userId = getUserIdFromEvent(event);
      const projects = await this.projectService.getUserProjects(userId);

      return createSuccessResponse({ 
        projects,
        count: projects.length 
      });
    } catch (error) {
      console.error("Error getting projects:", error);
      return createErrorResponse(500, "Failed to get projects", error);
    }
  }

  /**
   * Create a new project
   */
  private async createProject(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    try {
      const userId = getUserIdFromEvent(event);
      const body = parseJSON(event.body || "{}");

      // Validate required fields
      validateRequired(body, ["projectName", "requestPrompt"]);

      const project = await this.projectService.createProject({
        userId,
        projectName: body.projectName,
        requestPrompt: body.requestPrompt,
      });

      return createSuccessResponse({
        projectId: project.projectId,
        status: "created",
        message: "Project created successfully with initial tasks",
      });
    } catch (error) {
      console.error("Error creating project:", error);
      return createErrorResponse(500, "Failed to create project", error);
    }
  }

  /**
   * Update an existing project
   */
  private async updateProject(
    projectId: string,
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> {
    try {
      const body = parseJSON(event.body || "{}");

      // Only allow certain fields to be updated
      const allowedUpdates = ['status'];
      const updates: any = {};

      for (const field of allowedUpdates) {
        if (body[field] !== undefined) {
          updates[field] = body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return createErrorResponse(400, "No valid fields provided for update");
      }

      const updatedProject = await this.projectService.updateProject(projectId, updates);

      return createSuccessResponse({
        project: updatedProject,
        message: "Project updated successfully",
      });
    } catch (error) {
      console.error("Error updating project:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        return createErrorResponse(404, error.message);
      }
      if (error instanceof Error && error.message.includes("Invalid status transition")) {
        return createErrorResponse(400, error.message);
      }
      return createErrorResponse(500, "Failed to update project", error);
    }
  }

  /**
   * Delete a project and all associated data
   */
  private async deleteProject(projectId: string): Promise<APIGatewayProxyResult> {
    try {
      await this.projectService.deleteProject(projectId);

      return createSuccessResponse({
        message: "Project and all associated data deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting project:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        return createErrorResponse(404, error.message);
      }
      return createErrorResponse(500, "Failed to delete project", error);
    }
  }
}

// Lambda handler function
const projectHandler = new ProjectHandler();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return await projectHandler.handle(event);
};
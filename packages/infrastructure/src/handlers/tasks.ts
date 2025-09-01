import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { TaskService, ProjectService } from "../services";
import {
  createSuccessResponse,
  createErrorResponse,
  getUserIdFromEvent,
  validateRequired,
  parseJSON,
} from "../utils/lambda";

/**
 * HTTP handler for Task operations
 * Orchestrates requests between API Gateway and the service layer
 */
export class TaskHandler {
  private readonly taskService: TaskService;
  private readonly projectService: ProjectService;

  constructor() {
    this.taskService = new TaskService();
    this.projectService = new ProjectService();
  }

  /**
   * Main Lambda handler entry point
   */
  async handle(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    console.log("Tasks handler event:", JSON.stringify(event, null, 2));

    try {
      const method = event.httpMethod;
      const pathParameters = event.pathParameters || {};
      const { id: projectId } = pathParameters;

      if (!projectId) {
        return createErrorResponse(400, "Project ID is required");
      }

      // Validate project exists
      const project = await this.projectService.getProject(projectId);
      if (!project) {
        return createErrorResponse(404, "Project not found");
      }

      switch (method) {
        case "GET":
          // Check if this is a status request
          if (event.path.includes('/status')) {
            return await this.getProjectStatus(projectId);
          } else {
            return await this.getProjectTasks(projectId);
          }

        case "POST":
          return await this.createTask(projectId, event);

        case "PATCH":
          const taskId = event.pathParameters?.taskId;
          if (!taskId) {
            return createErrorResponse(400, "Task ID is required for updates");
          }
          return await this.updateTask(projectId, taskId, event);

        default:
          return createErrorResponse(405, "Method not allowed");
      }
    } catch (error) {
      console.error("Tasks handler error:", error);
      return createErrorResponse(500, "Internal server error", error);
    }
  }

  /**
   * Get all tasks for a project
   */
  private async getProjectTasks(projectId: string): Promise<APIGatewayProxyResult> {
    try {
      const tasks = await this.taskService.getProjectTasks(projectId);

      // Group tasks by status for easier frontend consumption
      const tasksByStatus = {
        TODO: tasks.filter(t => t.status === 'TODO'),
        IN_PROGRESS: tasks.filter(t => t.status === 'IN_PROGRESS'),
        DONE: tasks.filter(t => t.status === 'DONE'),
        FAILED: tasks.filter(t => t.status === 'FAILED'),
        PENDING_APPROVAL: tasks.filter(t => t.status === 'PENDING_APPROVAL'),
      };

      return createSuccessResponse({
        tasks,
        tasksByStatus,
        totalTasks: tasks.length,
      });
    } catch (error) {
      console.error("Error getting project tasks:", error);
      return createErrorResponse(500, "Failed to get project tasks", error);
    }
  }

  /**
   * Get project status with progress information
   */
  private async getProjectStatus(projectId: string): Promise<APIGatewayProxyResult> {
    try {
      const status = await this.projectService.getProjectStatus(projectId);
      const nextTask = await this.taskService.getNextExecutableTask(projectId);

      return createSuccessResponse({
        ...status,
        nextExecutableTask: nextTask,
      });
    } catch (error) {
      console.error("Error getting project status:", error);
      return createErrorResponse(500, "Failed to get project status", error);
    }
  }

  /**
   * Create a new task
   */
  private async createTask(
    projectId: string,
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> {
    try {
      const body = parseJSON(event.body || "{}");

      // Validate required fields
      validateRequired(body, ["assignedAgent", "description"]);

      const task = await this.taskService.createTask({
        projectId,
        assignedAgent: body.assignedAgent,
        status: body.status || "TODO",
        dependencies: body.dependencies || [],
        description: body.description,
      });

      return createSuccessResponse({
        task,
        message: "Task created successfully",
      });
    } catch (error) {
      console.error("Error creating task:", error);
      return createErrorResponse(500, "Failed to create task", error);
    }
  }

  /**
   * Update an existing task
   */
  private async updateTask(
    projectId: string,
    taskId: string,
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> {
    try {
      const body = parseJSON(event.body || "{}");

      // Only allow certain fields to be updated
      const allowedUpdates = ['status', 'progress', 'errorMessage'];
      const updates: any = {};

      for (const field of allowedUpdates) {
        if (body[field] !== undefined) {
          updates[field] = body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return createErrorResponse(400, "No valid fields provided for update");
      }

      const updatedTask = await this.taskService.updateTask(projectId, taskId, updates);

      return createSuccessResponse({
        task: updatedTask,
        message: "Task updated successfully",
      });
    } catch (error) {
      console.error("Error updating task:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        return createErrorResponse(404, error.message);
      }
      if (error instanceof Error && error.message.includes("Invalid status transition")) {
        return createErrorResponse(400, error.message);
      }
      return createErrorResponse(500, "Failed to update task", error);
    }
  }
}

// Lambda handler function
const taskHandler = new TaskHandler();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return await taskHandler.handle(event);
};
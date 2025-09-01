import { Task } from "../models";
import { DatabaseService } from "../utils/database";

/**
 * Service layer for Task business logic
 * Contains task-specific business rules and orchestration
 */
export class TaskService {
  private readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * Create a new task with validation
   */
  async createTask(taskData: {
    projectId: string;
    assignedAgent: string;
    status: "TODO" | "IN_PROGRESS" | "DONE" | "FAILED" | "PENDING_APPROVAL";
    dependencies: string[];
    description?: string;
  }): Promise<Task> {
    // Business logic: validate inputs
    if (!taskData.projectId) {
      throw new Error('Project ID is required');
    }
    if (!taskData.assignedAgent) {
      throw new Error('Assigned agent is required');
    }

    const validAgents = [
      "ProductManagerAgent",
      "BackendEngineerAgent", 
      "FrontendEngineerAgent",
      "DevOpsEngineerAgent"
    ];
    
    if (!validAgents.includes(taskData.assignedAgent)) {
      throw new Error(`Invalid agent: ${taskData.assignedAgent}`);
    }

    return await this.db.createTask(taskData);
  }

  /**
   * Get project tasks with validation
   */
  async getProjectTasks(projectId: string): Promise<Task[]> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    return await this.db.getProjectTasks(projectId);
  }

  /**
   * Update task with business logic validation
   */
  async updateTask(projectId: string, taskId: string, updates: any): Promise<Task> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }
    if (!taskId) {
      throw new Error('Task ID is required');
    }

    // Business logic: validate status transitions
    if (updates.status) {
      const validStatuses = ["TODO", "IN_PROGRESS", "DONE", "FAILED", "PENDING_APPROVAL"];
      if (!validStatuses.includes(updates.status)) {
        throw new Error(`Invalid status: ${updates.status}`);
      }
    }

    return await this.db.updateTask(projectId, taskId, updates);
  }
}
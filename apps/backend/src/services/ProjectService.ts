import { Project, Task } from "../models";
import { DatabaseService } from "../utils/database";

/**
 * Service layer for Project business logic
 * Contains project-specific business rules and orchestration
 */
export class ProjectService {
  private readonly db: DatabaseService;

  constructor() {
    this.db = new DatabaseService();
  }

  /**
   * Create a new project with initial tasks and business validation
   */
  async createProject(
    userId: string,
    projectName: string,
    requestPrompt: string
  ): Promise<Project> {
    // Business logic: validate inputs
    if (!userId) {
      throw new Error('User ID is required');
    }
    if (!projectName || projectName.trim().length === 0) {
      throw new Error('Project name is required');
    }
    if (!requestPrompt || requestPrompt.trim().length < 10) {
      throw new Error('Request prompt must be at least 10 characters long');
    }

    return await this.db.createProject(userId, projectName.trim(), requestPrompt.trim());
  }

  /**
   * Get project by ID with validation
   */
  async getProject(projectId: string): Promise<Project | null> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    return await this.db.getProject(projectId);
  }

  /**
   * Get all projects for a user
   */
  async getUserProjects(userId: string): Promise<Project[]> {
    if (!userId) {
      throw new Error('User ID is required');
    }

    return await this.db.getUserProjects(userId);
  }

  /**
   * Update project with business logic validation
   */
  async updateProject(projectId: string, updates: any): Promise<Project> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Business logic: validate project exists
    const existingProject = await this.db.getProject(projectId);
    if (!existingProject) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Business logic: validate status transitions
    if (updates.status) {
      const validStatuses = ["PENDING", "IN_PROGRESS", "COMPLETED", "FAILED"];
      if (!validStatuses.includes(updates.status)) {
        throw new Error(`Invalid status: ${updates.status}`);
      }
    }

    return await this.db.updateProject(projectId, updates);
  }

  /**
   * Delete project with validation
   */
  async deleteProject(projectId: string): Promise<void> {
    if (!projectId) {
      throw new Error('Project ID is required');
    }

    // Business logic: validate project exists
    const existingProject = await this.db.getProject(projectId);
    if (!existingProject) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Business logic: prevent deletion of active projects
    if (existingProject.status === "IN_PROGRESS") {
      throw new Error('Cannot delete project while it is in progress');
    }

    return await this.db.deleteProject(projectId);
  }
}
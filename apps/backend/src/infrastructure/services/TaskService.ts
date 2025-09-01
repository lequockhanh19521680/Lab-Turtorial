import { TaskRepository } from "../repositories/index.js";
import { Task, CreateTaskRequest, UpdateTaskRequest } from "../models/index.js";

/**
 * Service layer for Task business logic
 * Contains task-specific business rules and orchestration
 */
export class TaskService {
  private readonly taskRepository: TaskRepository;

  constructor() {
    this.taskRepository = new TaskRepository();
  }

  /**
   * Create a new task
   */
  async createTask(request: CreateTaskRequest): Promise<Task> {
    return await this.taskRepository.create(request);
  }

  /**
   * Get task by ID
   */
  async getTask(projectId: string, taskId: string): Promise<Task | null> {
    return await this.taskRepository.findById(projectId, taskId);
  }

  /**
   * Get all tasks for a project
   */
  async getProjectTasks(projectId: string): Promise<Task[]> {
    return await this.taskRepository.findByProjectId(projectId);
  }

  /**
   * Update task with business logic validation
   */
  async updateTask(
    projectId: string,
    taskId: string,
    updates: UpdateTaskRequest
  ): Promise<Task> {
    // Validate task exists
    const existingTask = await this.taskRepository.findById(projectId, taskId);
    if (!existingTask) {
      throw new Error(
        `Task with ID ${taskId} not found in project ${projectId}`
      );
    }

    // Business logic: validate status transitions
    if (updates.status) {
      this.validateStatusTransition(existingTask.status, updates.status);
    }

    // Business logic: automatically set timestamps based on status
    if (updates.status === "IN_PROGRESS" && !updates.startedAt) {
      updates.startedAt = new Date().toISOString();
    }

    if (
      (updates.status === "DONE" || updates.status === "FAILED") &&
      !updates.completedAt
    ) {
      updates.completedAt = new Date().toISOString();
      updates.progress = 100;
    }

    return await this.taskRepository.update(projectId, taskId, updates);
  }

  /**
   * Get tasks by status
   */
  async getTasksByStatus(
    projectId: string,
    status: Task["status"]
  ): Promise<Task[]> {
    return await this.taskRepository.findByStatus(projectId, status);
  }

  /**
   * Get next executable task (with satisfied dependencies)
   */
  async getNextExecutableTask(projectId: string): Promise<Task | null> {
    const allTasks = await this.taskRepository.findByProjectId(projectId);
    const todoTasks = allTasks.filter((task: Task) => task.status === "TODO");

    for (const task of todoTasks) {
      if (await this.areDependenciesSatisfied(task, allTasks)) {
        return task;
      }
    }

    return null;
  }

  /**
   * Check if all dependencies of a task are completed
   */
  private async areDependenciesSatisfied(
    task: Task,
    allTasks: Task[]
  ): Promise<boolean> {
    if (!task.dependencies || task.dependencies.length === 0) {
      return true;
    }

    for (const dependencyId of task.dependencies) {
      const dependencyTask = allTasks.find((t) => t.taskId === dependencyId);
      if (!dependencyTask || dependencyTask.status !== "DONE") {
        return false;
      }
    }

    return true;
  }

  /**
   * Calculate project progress based on tasks
   */
  async calculateProjectProgress(projectId: string): Promise<number> {
    const tasks = await this.taskRepository.findByProjectId(projectId);

    if (tasks.length === 0) {
      return 0;
    }

    const totalProgress = tasks.reduce(
      (sum: number, task: Task) => sum + (task.progress || 0),
      0
    );
    return Math.round(totalProgress / tasks.length);
  }

  /**
   * Mark task as pending approval (for manual review)
   */
  async markForApproval(projectId: string, taskId: string): Promise<Task> {
    return await this.updateTask(projectId, taskId, {
      status: "PENDING_APPROVAL",
      completedAt: new Date().toISOString(),
      progress: 100,
    });
  }

  /**
   * Approve a pending task
   */
  async approveTask(projectId: string, taskId: string): Promise<Task> {
    return await this.updateTask(projectId, taskId, {
      status: "DONE",
    });
  }

  /**
   * Reject a pending task and reset it
   */
  async rejectTask(
    projectId: string,
    taskId: string,
    reason?: string
  ): Promise<Task> {
    return await this.updateTask(projectId, taskId, {
      status: "TODO",
      progress: 0,
      startedAt: undefined,
      completedAt: undefined,
      errorMessage: reason,
    });
  }

  /**
   * Validate status transitions according to business rules
   */
  private validateStatusTransition(
    currentStatus: Task["status"],
    newStatus: Task["status"]
  ): void {
    const validTransitions: Record<Task["status"], Task["status"][]> = {
      TODO: ["IN_PROGRESS"],
      IN_PROGRESS: ["DONE", "FAILED", "PENDING_APPROVAL"],
      DONE: [], // Terminal state
      FAILED: ["TODO"], // Can retry
      PENDING_APPROVAL: ["DONE", "TODO"], // Can approve or reject
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(
        `Invalid status transition from ${currentStatus} to ${newStatus}`
      );
    }
  }
}

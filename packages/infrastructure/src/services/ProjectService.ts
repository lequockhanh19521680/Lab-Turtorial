import { ProjectRepository, TaskRepository, ArtifactRepository } from "../repositories";
import { Project, Task, CreateProjectRequest, UpdateProjectRequest, CreateTaskRequest } from "../models";

/**
 * Service layer for Project business logic
 * Orchestrates operations between repositories and contains business rules
 */
export class ProjectService {
  private readonly projectRepository: ProjectRepository;
  private readonly taskRepository: TaskRepository;
  private readonly artifactRepository: ArtifactRepository;

  constructor() {
    this.projectRepository = new ProjectRepository();
    this.taskRepository = new TaskRepository();
    this.artifactRepository = new ArtifactRepository();
  }

  /**
   * Create a new project with initial tasks
   */
  async createProject(request: CreateProjectRequest): Promise<Project> {
    // Create the project
    const project = await this.projectRepository.create(request);

    // Create initial tasks for the project
    const initialTasks: CreateTaskRequest[] = [
      {
        projectId: project.projectId,
        assignedAgent: "ProductManagerAgent",
        status: "TODO",
        dependencies: [],
        description: "Analyze requirements and create SRS document",
      },
      {
        projectId: project.projectId,
        assignedAgent: "BackendEngineerAgent",
        status: "TODO",
        dependencies: [],
        description: "Design database schema and create backend APIs",
      },
      {
        projectId: project.projectId,
        assignedAgent: "FrontendEngineerAgent",
        status: "TODO",
        dependencies: [],
        description: "Create React components and user interface",
      },
      {
        projectId: project.projectId,
        assignedAgent: "DevOpsEngineerAgent",
        status: "TODO",
        dependencies: [],
        description: "Deploy application to cloud infrastructure",
      },
    ];

    // Create all initial tasks
    for (const taskRequest of initialTasks) {
      await this.taskRepository.create(taskRequest);
    }

    return project;
  }

  /**
   * Get project by ID with validation
   */
  async getProject(projectId: string): Promise<Project | null> {
    return await this.projectRepository.findById(projectId);
  }

  /**
   * Get projects for a user
   */
  async getUserProjects(userId: string): Promise<Project[]> {
    return await this.projectRepository.findByUserId(userId);
  }

  /**
   * Update project status
   */
  async updateProject(projectId: string, updates: UpdateProjectRequest): Promise<Project> {
    // Validate project exists
    const existingProject = await this.projectRepository.findById(projectId);
    if (!existingProject) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Business logic: validate status transitions
    if (updates.status) {
      this.validateStatusTransition(existingProject.status, updates.status);
    }

    return await this.projectRepository.update(projectId, updates);
  }

  /**
   * Delete project and all associated data
   */
  async deleteProject(projectId: string): Promise<void> {
    // Validate project exists
    const existingProject = await this.projectRepository.findById(projectId);
    if (!existingProject) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    // Delete all associated tasks
    const tasks = await this.taskRepository.findByProjectId(projectId);
    for (const task of tasks) {
      await this.taskRepository.delete(projectId, task.taskId);
    }

    // Delete all associated artifacts
    const artifacts = await this.artifactRepository.findByProjectId(projectId);
    for (const artifact of artifacts) {
      await this.artifactRepository.delete(projectId, artifact.artifactId);
    }

    // Finally delete the project
    await this.projectRepository.delete(projectId);
  }

  /**
   * Get project status with progress calculation
   */
  async getProjectStatus(projectId: string): Promise<{
    project: Project;
    tasks: Task[];
    progress: number;
    completedTasks: number;
    totalTasks: number;
  }> {
    const project = await this.projectRepository.findById(projectId);
    if (!project) {
      throw new Error(`Project with ID ${projectId} not found`);
    }

    const tasks = await this.taskRepository.findByProjectId(projectId);
    const completedTasks = tasks.filter(task => task.status === "DONE").length;
    const totalTasks = tasks.length;
    const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    return {
      project,
      tasks,
      progress,
      completedTasks,
      totalTasks,
    };
  }

  /**
   * Validate status transitions according to business rules
   */
  private validateStatusTransition(currentStatus: Project['status'], newStatus: Project['status']): void {
    const validTransitions: Record<Project['status'], Project['status'][]> = {
      'PENDING': ['IN_PROGRESS', 'FAILED'],
      'IN_PROGRESS': ['COMPLETED', 'FAILED'],
      'COMPLETED': [], // Terminal state
      'FAILED': ['PENDING'], // Can restart
    };

    if (!validTransitions[currentStatus].includes(newStatus)) {
      throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
    }
  }
}
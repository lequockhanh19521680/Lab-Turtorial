import { UserRepository, ProjectRepository } from "../repositories/index.js";
import { User, Project } from "../models/index.js";

/**
 * Service layer for User business logic
 * Contains user-specific business rules and orchestration
 */
export class UserService {
  private readonly userRepository: UserRepository;
  private readonly projectRepository: ProjectRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.projectRepository = new ProjectRepository();
  }

  /**
   * Create or update a user with business logic
   */
  async createOrUpdateUser(userData: {
    userId: string;
    email: string;
    name?: string;
    givenName?: string;
    familyName?: string;
    picture?: string;
    provider: "google" | "cognito";
    providerUserId: string;
  }): Promise<User> {
    // Business logic: validate email format
    if (!userData.email || !userData.email.includes("@")) {
      throw new Error("Valid email is required");
    }

    // Business logic: ensure provider is valid
    if (!["google", "cognito"].includes(userData.provider)) {
      throw new Error("Invalid authentication provider");
    }

    return await this.userRepository.createOrUpdate(userData);
  }

  /**
   * Get user by ID
   */
  async getUser(userId: string): Promise<User | null> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    return await this.userRepository.findById(userId);
  }

  /**
   * Update user profile with validation
   */
  async updateUser(
    userId: string,
    updates: Partial<Omit<User, "userId" | "createdAt">>
  ): Promise<User> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Business logic: validate user exists
    const existingUser = await this.userRepository.findById(userId);
    if (!existingUser) {
      throw new Error(`User with ID ${userId} not found`);
    }

    // Business logic: validate email if provided
    if (updates.email && !updates.email.includes("@")) {
      throw new Error("Valid email is required");
    }

    return await this.userRepository.update(userId, updates);
  }

  /**
   * Get all projects for a user (business logic orchestration)
   */
  async getUserProjects(userId: string): Promise<Project[]> {
    if (!userId) {
      throw new Error("User ID is required");
    }

    // Business logic: verify user exists before getting projects
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }

    return await this.projectRepository.findByUserId(userId);
  }
}

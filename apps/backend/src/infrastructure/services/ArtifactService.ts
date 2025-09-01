import { ArtifactRepository } from "../repositories/index.js";
import { Artifact, CreateArtifactRequest } from "../models/index.js";

/**
 * Service layer for Artifact business logic
 * Contains artifact-specific business rules and orchestration
 */
export class ArtifactService {
  private readonly artifactRepository: ArtifactRepository;

  constructor() {
    this.artifactRepository = new ArtifactRepository();
  }

  /**
   * Create a new artifact
   */
  async createArtifact(request: CreateArtifactRequest): Promise<Artifact> {
    // Business logic: validate artifact constraints
    this.validateArtifactRequest(request);

    return await this.artifactRepository.create(request);
  }

  /**
   * Get artifact by ID
   */
  async getArtifact(
    projectId: string,
    artifactId: string
  ): Promise<Artifact | null> {
    return await this.artifactRepository.findById(projectId, artifactId);
  }

  /**
   * Get all artifacts for a project
   */
  async getProjectArtifacts(projectId: string): Promise<Artifact[]> {
    return await this.artifactRepository.findByProjectId(projectId);
  }

  /**
   * Get artifacts by type
   */
  async getArtifactsByType(
    projectId: string,
    artifactType: Artifact["artifactType"]
  ): Promise<Artifact[]> {
    return await this.artifactRepository.findByType(projectId, artifactType);
  }

  /**
   * Update artifact
   */
  async updateArtifact(
    projectId: string,
    artifactId: string,
    updates: Partial<Artifact>
  ): Promise<Artifact> {
    // Validate artifact exists
    const existingArtifact = await this.artifactRepository.findById(
      projectId,
      artifactId
    );
    if (!existingArtifact) {
      throw new Error(
        `Artifact with ID ${artifactId} not found in project ${projectId}`
      );
    }

    // Business logic: prevent changing immutable fields
    const immutableFields = ["projectId", "artifactId", "createdAt"];
    for (const field of immutableFields) {
      if (field in updates) {
        delete updates[field as keyof Artifact];
      }
    }

    return await this.artifactRepository.update(projectId, artifactId, updates);
  }

  /**
   * Delete artifact
   */
  async deleteArtifact(projectId: string, artifactId: string): Promise<void> {
    // Validate artifact exists
    const existingArtifact = await this.artifactRepository.findById(
      projectId,
      artifactId
    );
    if (!existingArtifact) {
      throw new Error(
        `Artifact with ID ${artifactId} not found in project ${projectId}`
      );
    }

    await this.artifactRepository.delete(projectId, artifactId);
  }

  /**
   * Get the latest artifact of a specific type
   */
  async getLatestArtifactByType(
    projectId: string,
    artifactType: Artifact["artifactType"]
  ): Promise<Artifact | null> {
    const artifacts = await this.artifactRepository.findByType(
      projectId,
      artifactType
    );

    if (artifacts.length === 0) {
      return null;
    }

    // Sort by creation date and return the latest
    artifacts.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return artifacts[0];
  }

  /**
   * Get artifact with enriched metadata
   */
  async getArtifactWithMetadata(
    projectId: string,
    artifactId: string
  ): Promise<(Artifact & { enrichedMetadata?: any }) | null> {
    const artifact = await this.artifactRepository.findById(
      projectId,
      artifactId
    );

    if (!artifact) {
      return null;
    }

    // Business logic: enrich metadata based on artifact type
    const enrichedMetadata = await this.enrichArtifactMetadata(artifact);

    return {
      ...artifact,
      enrichedMetadata,
    };
  }

  /**
   * Validate artifact creation request
   */
  private validateArtifactRequest(request: CreateArtifactRequest): void {
    // Business rules validation
    if (!request.location || request.location.trim().length === 0) {
      throw new Error("Artifact location cannot be empty");
    }

    if (!request.version || request.version.trim().length === 0) {
      throw new Error("Artifact version cannot be empty");
    }

    // Validate artifact type specific rules
    switch (request.artifactType) {
      case "SOURCE_CODE":
        if (
          !request.location.includes("github.com") &&
          !request.location.includes("gitlab.com")
        ) {
          // Allow local paths for development
          if (
            !request.location.startsWith("/") &&
            !request.location.startsWith("file://")
          ) {
            console.warn(
              "Source code artifacts should typically be hosted on Git platforms"
            );
          }
        }
        break;
      case "DEPLOYMENT_URL":
        if (!this.isValidUrl(request.location)) {
          throw new Error("Deployment URL must be a valid HTTP/HTTPS URL");
        }
        break;
    }
  }

  /**
   * Enrich artifact metadata based on type
   */
  private async enrichArtifactMetadata(artifact: Artifact): Promise<any> {
    const enriched: any = {
      ...artifact.metadata,
      lastAccessed: new Date().toISOString(),
    };

    switch (artifact.artifactType) {
      case "SOURCE_CODE":
        enriched.language = this.detectLanguageFromLocation(artifact.location);
        break;
      case "DEPLOYMENT_URL":
        enriched.isAccessible = await this.checkUrlAccessibility(
          artifact.location
        );
        break;
    }

    return enriched;
  }

  /**
   * Detect programming language from location
   */
  private detectLanguageFromLocation(location: string): string {
    if (location.includes("typescript") || location.includes(".ts"))
      return "TypeScript";
    if (location.includes("javascript") || location.includes(".js"))
      return "JavaScript";
    if (location.includes("python") || location.includes(".py"))
      return "Python";
    if (location.includes("java") || location.includes(".java")) return "Java";
    return "Unknown";
  }

  /**
   * Check if URL is accessible (simplified check)
   */
  private async checkUrlAccessibility(url: string): Promise<boolean> {
    try {
      // In a real implementation, you might make an HTTP request
      // For now, just validate the URL format
      return this.isValidUrl(url);
    } catch {
      return false;
    }
  }

  /**
   * Validate URL format
   */
  private isValidUrl(string: string): boolean {
    try {
      const url = new URL(string);
      return url.protocol === "http:" || url.protocol === "https:";
    } catch {
      return false;
    }
  }
}

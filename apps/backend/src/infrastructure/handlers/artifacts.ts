import { APIGatewayProxyEvent, APIGatewayProxyResult } from "aws-lambda";
import { ArtifactService, ProjectService } from "../services/index.js";
import {
  createSuccessResponse,
  createErrorResponse,
  getUserIdFromEvent,
  validateRequired,
  parseJSON,
} from "../utils/lambda.js";

/**
 * HTTP handler for Artifact operations
 * Orchestrates requests between API Gateway and the service layer
 */
export class ArtifactHandler {
  private readonly artifactService: ArtifactService;
  private readonly projectService: ProjectService;

  constructor() {
    this.artifactService = new ArtifactService();
    this.projectService = new ProjectService();
  }

  /**
   * Main Lambda handler entry point
   */
  async handle(event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> {
    console.log("Artifacts handler event:", JSON.stringify(event, null, 2));

    try {
      const method = event.httpMethod;
      const pathParameters = event.pathParameters || {};

      switch (method) {
        case "GET":
          if (pathParameters.id) {
            // GET /projects/{id}/artifacts
            return await this.getProjectArtifacts(pathParameters.id);
          } else {
            return createErrorResponse(400, "Project ID is required");
          }

        case "POST":
          // POST /artifacts
          return await this.createArtifact(event);

        case "PATCH":
          const { projectId, artifactId } = pathParameters;
          if (!projectId || !artifactId) {
            return createErrorResponse(
              400,
              "Project ID and Artifact ID are required"
            );
          }
          return await this.updateArtifact(projectId, artifactId, event);

        case "DELETE":
          const { projectId: delProjectId, artifactId: delArtifactId } =
            pathParameters;
          if (!delProjectId || !delArtifactId) {
            return createErrorResponse(
              400,
              "Project ID and Artifact ID are required"
            );
          }
          return await this.deleteArtifact(delProjectId, delArtifactId);

        default:
          return createErrorResponse(405, "Method not allowed");
      }
    } catch (error) {
      console.error("Artifacts handler error:", error);
      return createErrorResponse(500, "Internal server error", error);
    }
  }

  /**
   * Get all artifacts for a project
   */
  private async getProjectArtifacts(
    projectId: string
  ): Promise<APIGatewayProxyResult> {
    try {
      // Validate project exists
      const project = await this.projectService.getProject(projectId);
      if (!project) {
        return createErrorResponse(404, "Project not found");
      }

      const artifacts =
        await this.artifactService.getProjectArtifacts(projectId);

      // Group artifacts by type for easier frontend consumption
      const artifactsByType = {
        SRS_DOCUMENT: artifacts.filter(
          (a) => a.artifactType === "SRS_DOCUMENT"
        ),
        SOURCE_CODE: artifacts.filter((a) => a.artifactType === "SOURCE_CODE"),
        DEPLOYMENT_URL: artifacts.filter(
          (a) => a.artifactType === "DEPLOYMENT_URL"
        ),
        TEST_REPORT: artifacts.filter((a) => a.artifactType === "TEST_REPORT"),
      };

      return createSuccessResponse({
        artifacts,
        artifactsByType,
        totalArtifacts: artifacts.length,
      });
    } catch (error) {
      console.error("Error getting project artifacts:", error);
      return createErrorResponse(500, "Failed to get project artifacts", error);
    }
  }

  /**
   * Create a new artifact
   */
  private async createArtifact(
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> {
    try {
      const body = parseJSON(event.body || "{}");

      // Validate required fields
      validateRequired(body, [
        "projectId",
        "artifactType",
        "location",
        "version",
      ]);

      // Validate project exists
      const project = await this.projectService.getProject(body.projectId);
      if (!project) {
        return createErrorResponse(404, "Project not found");
      }

      const artifact = await this.artifactService.createArtifact({
        projectId: body.projectId,
        artifactType: body.artifactType,
        location: body.location,
        version: body.version,
        title: body.title,
        description: body.description,
        metadata: body.metadata,
      });

      return createSuccessResponse({
        artifact,
        message: "Artifact created successfully",
      });
    } catch (error) {
      console.error("Error creating artifact:", error);
      if (error instanceof Error && error.message.includes("cannot be empty")) {
        return createErrorResponse(400, error.message);
      }
      if (error instanceof Error && error.message.includes("must be a valid")) {
        return createErrorResponse(400, error.message);
      }
      return createErrorResponse(500, "Failed to create artifact", error);
    }
  }

  /**
   * Update an existing artifact
   */
  private async updateArtifact(
    projectId: string,
    artifactId: string,
    event: APIGatewayProxyEvent
  ): Promise<APIGatewayProxyResult> {
    try {
      const body = parseJSON(event.body || "{}");

      // Only allow certain fields to be updated
      const allowedUpdates = ["title", "description", "metadata", "version"];
      const updates: any = {};

      for (const field of allowedUpdates) {
        if (body[field] !== undefined) {
          updates[field] = body[field];
        }
      }

      if (Object.keys(updates).length === 0) {
        return createErrorResponse(400, "No valid fields provided for update");
      }

      const updatedArtifact = await this.artifactService.updateArtifact(
        projectId,
        artifactId,
        updates
      );

      return createSuccessResponse({
        artifact: updatedArtifact,
        message: "Artifact updated successfully",
      });
    } catch (error) {
      console.error("Error updating artifact:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        return createErrorResponse(404, error.message);
      }
      return createErrorResponse(500, "Failed to update artifact", error);
    }
  }

  /**
   * Delete an artifact
   */
  private async deleteArtifact(
    projectId: string,
    artifactId: string
  ): Promise<APIGatewayProxyResult> {
    try {
      await this.artifactService.deleteArtifact(projectId, artifactId);

      return createSuccessResponse({
        message: "Artifact deleted successfully",
      });
    } catch (error) {
      console.error("Error deleting artifact:", error);
      if (error instanceof Error && error.message.includes("not found")) {
        return createErrorResponse(404, error.message);
      }
      return createErrorResponse(500, "Failed to delete artifact", error);
    }
  }
}

// Lambda handler function
const artifactHandler = new ArtifactHandler();

export const handler = async (
  event: APIGatewayProxyEvent
): Promise<APIGatewayProxyResult> => {
  return await artifactHandler.handle(event);
};

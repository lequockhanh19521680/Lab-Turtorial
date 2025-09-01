import { Context } from "aws-lambda";
import { DatabaseService } from "../utils/database.js";
import { queueNextAgent, getNextAgent } from "../utils/sqs.js";
import { generateBackendSpecs } from "../utils/ai.js";
import { AgentExecutionContext, AgentResponse } from "../models/index.js";

const db = new DatabaseService();

export const handler = async (
  event: AgentExecutionContext,
  _context: Context
): Promise<AgentResponse> => {
  console.log(
    "Backend Engineer Agent execution:",
    JSON.stringify(event, null, 2)
  );

  try {
    const { projectId, project, previousArtifacts } = event;

    // Get SRS from previous artifacts
    const srs = previousArtifacts.find(
      (a) => a.artifactType === "SRS_DOCUMENT"
    );
    const requirements = srs?.metadata || {};

    // Generate backend specifications using AI
    const backendSpecs = await generateBackendSpecs(requirements);

    // Create backend source code artifact
    const backendArtifact = await db.createArtifact({
      projectId,
      artifactType: "SOURCE_CODE",
      location: `https://github.com/agent-builder/${projectId}-backend`,
      version: "1.0",
      title: "Backend Source Code",
      description: `Node.js backend with AWS Lambda and DynamoDB for ${project.projectName}`,
      metadata: {
        framework: "Node.js + AWS Lambda",
        database: "Amazon DynamoDB",
        apis: backendSpecs.apis,
        databaseSchema: backendSpecs.database,
        architecture: backendSpecs.architecture,
        authentication: "AWS Cognito",
        generatedAt: new Date().toISOString(),
        aiGenerated: true,
      },
    });

    // Queue the next agent in the sequence
    const nextAgent = getNextAgent("BackendEngineerAgent");
    if (nextAgent) {
      await queueNextAgent(projectId, nextAgent);
    }

    return {
      success: true,
      artifacts: [backendArtifact],
      metadata: {
        apiEndpoints: backendSpecs.apis.length,
        architecture: "Serverless",
        aiGenerated: true,
      },
    };
  } catch (error) {
    console.error("Backend Engineer Agent error:", error);
    return {
      success: false,
      artifacts: [],
      errorMessage: (error as Error).message,
    };
  }
};

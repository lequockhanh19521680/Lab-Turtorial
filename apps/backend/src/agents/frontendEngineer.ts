import { Context } from "aws-lambda";
import { DatabaseService } from "../utils/database.js";
import { queueNextAgent, getNextAgent } from "../utils/sqs.js";
import { generateFrontendSpecs } from "../utils/ai.js";
import { AgentExecutionContext, AgentResponse } from "../models/index.js";

const db = new DatabaseService();

export const handler = async (
  event: AgentExecutionContext,
  _context: Context
): Promise<AgentResponse> => {
  console.log(
    "Frontend Engineer Agent execution:",
    JSON.stringify(event, null, 2)
  );

  try {
    const { projectId, project, previousArtifacts } = event;

    // Get requirements from previous artifacts
    const srs = previousArtifacts.find(
      (a) => a.artifactType === "SRS_DOCUMENT"
    );

    const requirements = srs?.metadata || {};

    // Generate frontend specifications using AI
    const frontendSpecs = await generateFrontendSpecs(requirements);

    // Create frontend source code artifact
    const frontendArtifact = await db.createArtifact({
      projectId,
      artifactType: "SOURCE_CODE",
      location: `https://github.com/agent-builder/${projectId}-frontend`,
      version: "1.0",
      title: "Frontend Source Code",
      description: `React application with TypeScript and Tailwind CSS for ${project.projectName}`,
      metadata: {
        framework: "React 18 + TypeScript",
        styling: frontendSpecs.styling,
        stateManagement: "Redux Toolkit",
        routing: frontendSpecs.routing,
        components: frontendSpecs.components,
        pages: frontendSpecs.pages,
        generatedAt: new Date().toISOString(),
        aiGenerated: true,
      },
    });

    // Queue the next agent in the sequence
    const nextAgent = getNextAgent("FrontendEngineerAgent");
    if (nextAgent) {
      await queueNextAgent(projectId, nextAgent);
    }

    return {
      success: true,
      artifacts: [frontendArtifact],
      metadata: {
        components: frontendSpecs.components.length,
        pages: frontendSpecs.pages.length,
        responsive: true,
        accessibility: "WCAG 2.1 compliant",
        aiGenerated: true,
      },
    };
  } catch (error) {
    console.error("Frontend Engineer Agent error:", error);
    return {
      success: false,
      artifacts: [],
      errorMessage: (error as Error).message,
    };
  }
};

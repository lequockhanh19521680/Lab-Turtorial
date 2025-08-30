import { Context } from 'aws-lambda'
import { DatabaseService } from '../utils/database'
import { queueNextAgent, getNextAgent } from '../utils/sqs'
import { generateRequirements } from '../utils/ai'
import { AgentExecutionContext, AgentResponse } from '../models'

const db = new DatabaseService()

export const handler = async (event: AgentExecutionContext, _context: Context): Promise<AgentResponse> => {
  console.log('Product Manager Agent execution:', JSON.stringify(event, null, 2))

  try {
    const { projectId, project } = event

    // Generate requirements and specifications using AI
    const requirements = await generateRequirements(project.requestPrompt)

    // Create SRS document artifact
    const srsArtifact = await db.createArtifact({
      projectId,
      artifactType: 'SRS_DOCUMENT',
      location: `https://example.com/srs/${projectId}.pdf`,
      version: '1.0',
      title: 'Software Requirements Specification',
      description: `Detailed requirements and specifications for ${project.projectName}`,
      metadata: {
        features: requirements.features,
        userStories: requirements.userStories,
        technicalRequirements: requirements.technicalRequirements,
        architecture: requirements.architecture,
        generatedAt: new Date().toISOString()
      },
    })

    // Queue the next agent in the sequence
    const nextAgent = getNextAgent('ProductManagerAgent')
    if (nextAgent) {
      await queueNextAgent(projectId, nextAgent)
    }

    return {
      success: true,
      artifacts: [srsArtifact],
      metadata: {
        analysis: 'Requirements successfully analyzed and documented using AI',
        complexity: 'Medium',
        estimatedDevelopmentTime: '2-3 weeks',
        aiGenerated: true,
        features: requirements.features.length,
        userStories: requirements.userStories.length
      },
    }
  } catch (error) {
    console.error('Product Manager Agent error:', error)
    return {
      success: false,
      artifacts: [],
      errorMessage: (error as Error).message,
    }
  }
}
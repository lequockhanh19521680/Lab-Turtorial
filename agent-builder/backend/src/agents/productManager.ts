import { Context } from 'aws-lambda'
import { DatabaseService } from '../utils/database'
import { queueNextAgent, getNextAgent } from '../utils/sqs'
import { generateRequirements } from '../utils/ai'
import { AgentExecutionContext, AgentResponse } from '../models'

const db = new DatabaseService()

/**
 * Extract key features from requirements
 */
export const extractFeatures = (requirements: any): string[] => {
  if (!requirements.features || !Array.isArray(requirements.features)) {
    return []
  }
  return requirements.features.filter((feature: any) => 
    typeof feature === 'string' && feature.trim().length > 0
  )
}

/**
 * Generate user stories from requirements
 */
export const generateUserStories = (requirements: any): string[] => {
  if (!requirements.userStories || !Array.isArray(requirements.userStories)) {
    return []
  }
  return requirements.userStories.filter((story: any) => 
    typeof story === 'string' && story.trim().length > 0
  )
}

/**
 * Validate requirements object structure
 */
export const validateRequirements = (requirements: any): boolean => {
  if (!requirements || typeof requirements !== 'object') {
    return false
  }
  
  return (
    Array.isArray(requirements.features) &&
    Array.isArray(requirements.userStories) &&
    Array.isArray(requirements.technicalRequirements) &&
    typeof requirements.architecture === 'string'
  )
}

/**
 * Calculate project complexity based on requirements
 */
export const calculateComplexity = (requirements: any): 'Low' | 'Medium' | 'High' => {
  const features = extractFeatures(requirements)
  const userStories = generateUserStories(requirements)
  
  const totalItems = features.length + userStories.length
  
  if (totalItems <= 5) return 'Low'
  if (totalItems <= 10) return 'Medium'
  return 'High'
}

/**
 * Estimate development time based on complexity and requirements
 */
export const estimateDevelopmentTime = (requirements: any): string => {
  const complexity = calculateComplexity(requirements)
  const features = extractFeatures(requirements)
  
  // Base time estimation
  const baseWeeks = complexity === 'Low' ? 1 : complexity === 'Medium' ? 2 : 4
  const featureWeeks = Math.ceil(features.length * 0.5)
  
  const totalWeeks = baseWeeks + featureWeeks
  
  if (totalWeeks <= 2) return '1-2 weeks'
  if (totalWeeks <= 4) return '2-4 weeks'
  if (totalWeeks <= 8) return '4-8 weeks'
  return '8+ weeks'
}

export const handler = async (event: AgentExecutionContext, _context: Context): Promise<AgentResponse> => {
  console.log('Product Manager Agent execution:', JSON.stringify(event, null, 2))

  try {
    const { projectId, project } = event

    // Generate requirements and specifications using AI
    const requirements = await generateRequirements(project.requestPrompt)

    // Validate the generated requirements
    if (!validateRequirements(requirements)) {
      throw new Error('Generated requirements are invalid or incomplete')
    }

    // Extract and process features and user stories
    const features = extractFeatures(requirements)
    const userStories = generateUserStories(requirements)
    const complexity = calculateComplexity(requirements)
    const estimatedTime = estimateDevelopmentTime(requirements)

    // Create SRS document artifact
    const srsArtifact = await db.createArtifact({
      projectId,
      artifactType: 'SRS_DOCUMENT',
      location: `https://example.com/srs/${projectId}.pdf`,
      version: '1.0',
      title: 'Software Requirements Specification',
      description: `Detailed requirements and specifications for ${project.projectName}`,
      metadata: {
        features,
        userStories,
        technicalRequirements: requirements.technicalRequirements,
        architecture: requirements.architecture,
        complexity,
        estimatedDevelopmentTime: estimatedTime,
        generatedAt: new Date().toISOString(),
        aiGenerated: true,
        totalFeatures: features.length,
        totalUserStories: userStories.length
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
        complexity,
        estimatedDevelopmentTime: estimatedTime,
        aiGenerated: true,
        features: features.length,
        userStories: userStories.length,
        processingTime: Date.now()
      },
    }
  } catch (error) {
    console.error('Product Manager Agent error:', error)
    return {
      success: false,
      artifacts: [],
      errorMessage: (error as Error).message,
      metadata: {
        processingTime: Date.now(),
        errorType: error instanceof Error ? error.constructor.name : 'UnknownError'
      }
    }
  }
}
import { Context } from 'aws-lambda'
import { DatabaseService } from '../utils/database'
import { queueNextAgent, getNextAgent } from '../utils/sqs'
import { AgentExecutionContext, AgentResponse } from '../models'

const db = new DatabaseService()

export const handler = async (event: AgentExecutionContext, _context: Context): Promise<AgentResponse> => {
  console.log('Product Manager Agent execution:', JSON.stringify(event, null, 2))

  try {
    const { projectId, project } = event

    // Simulate PM analysis work
    await new Promise(resolve => setTimeout(resolve, 2000))

    // Create SRS document artifact
    const srsArtifact = await db.createArtifact({
      projectId,
      artifactType: 'SRS_DOCUMENT',
      location: `https://example.com/srs/${projectId}.pdf`,
      version: '1.0',
      title: 'Software Requirements Specification',
      description: `Detailed requirements and specifications for ${project.projectName}`,
      metadata: {
        features: extractFeatures(project.requestPrompt),
        userStories: generateUserStories(project.requestPrompt),
        technicalRequirements: generateTechnicalRequirements(project.requestPrompt),
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
        analysis: 'Requirements successfully analyzed and documented',
        complexity: 'Medium',
        estimatedDevelopmentTime: '2-3 weeks',
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

const extractFeatures = (prompt: string): string[] => {
  // Simple feature extraction based on keywords
  const features = []
  
  if (prompt.toLowerCase().includes('authentication') || prompt.toLowerCase().includes('login')) {
    features.push('User Authentication')
  }
  if (prompt.toLowerCase().includes('dashboard')) {
    features.push('Dashboard')
  }
  if (prompt.toLowerCase().includes('task') || prompt.toLowerCase().includes('project')) {
    features.push('Task Management')
  }
  if (prompt.toLowerCase().includes('notification')) {
    features.push('Real-time Notifications')
  }
  if (prompt.toLowerCase().includes('mobile') || prompt.toLowerCase().includes('responsive')) {
    features.push('Responsive Design')
  }
  if (prompt.toLowerCase().includes('blog') || prompt.toLowerCase().includes('post')) {
    features.push('Content Management')
  }
  if (prompt.toLowerCase().includes('e-commerce') || prompt.toLowerCase().includes('store')) {
    features.push('E-commerce Functionality')
  }

  return features.length > 0 ? features : ['Basic CRUD Operations', 'User Interface', 'Data Management']
}

const generateUserStories = (_prompt: string): string[] => {
  return [
    'As a user, I want to register and login to access the application',
    'As a user, I want to view a dashboard with my data overview',
    'As a user, I want to create, edit, and delete items',
    'As a user, I want to search and filter my data',
    'As a user, I want to receive notifications about important updates',
  ]
}

const generateTechnicalRequirements = (_prompt: string): Record<string, string> => {
  return {
    frontend: 'React 18 with TypeScript and Tailwind CSS',
    backend: 'Node.js with AWS Lambda and DynamoDB',
    authentication: 'AWS Cognito for user management',
    hosting: 'AWS S3 + CloudFront for frontend, API Gateway for backend',
    database: 'Amazon DynamoDB for scalable data storage',
    realtime: 'WebSocket connections for live updates',
  }
}
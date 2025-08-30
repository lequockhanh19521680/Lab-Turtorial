import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import { DatabaseService } from '../utils/database'
import { createSuccessResponse, createErrorResponse, parseJSON, validateRequired } from '../utils/lambda'

const sqsClient = new SQSClient({})
const db = new DatabaseService()

const AGENT_TASK_QUEUE_URL = process.env.AGENT_TASK_QUEUE_URL!

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Orchestrator handler event:', JSON.stringify(event, null, 2))

  try {
    const method = event.httpMethod

    if (method === 'POST') {
      return await startOrchestration(event)
    }

    return createErrorResponse(405, 'Method not allowed')
  } catch (error) {
    console.error('Error in orchestrator handler:', error)
    return createErrorResponse(500, 'Internal server error', error)
  }
}

const startOrchestration = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = parseJSON(event.body || '{}')
    validateRequired(body, ['projectId'])

    const projectId = body.projectId

    // Get the project details
    const project = await db.getProject(projectId)
    if (!project) {
      return createErrorResponse(404, 'Project not found')
    }

    // Update project status to IN_PROGRESS
    await db.updateProject(projectId, { status: 'IN_PROGRESS' })

    // Start the orchestration by sending the first agent task to SQS
    await queueAgentTask(projectId, 'ProductManagerAgent')

    return createSuccessResponse({
      message: 'Orchestration started successfully',
      projectId,
      status: 'IN_PROGRESS',
    })
  } catch (error) {
    console.error('Error starting orchestration:', error)
    return createErrorResponse(500, 'Failed to start orchestration', error)
  }
}

const queueAgentTask = async (projectId: string, agentName: string): Promise<void> => {
  const message = {
    projectId,
    agentName
  }

  try {
    const sendCommand = new SendMessageCommand({
      QueueUrl: AGENT_TASK_QUEUE_URL,
      MessageBody: JSON.stringify(message),
      MessageGroupId: projectId, // For FIFO queue (if needed)
      MessageDeduplicationId: `${projectId}-${agentName}-${Date.now()}` // For FIFO queue (if needed)
    })

    await sqsClient.send(sendCommand)
    console.log(`Queued agent task: ${agentName} for project ${projectId}`)
  } catch (error) {
    console.error(`Failed to queue agent task ${agentName}:`, error)
    throw error
  }
}

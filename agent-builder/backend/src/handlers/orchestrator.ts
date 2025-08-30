import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
// import { SFNClient } from '@aws-sdk/client-sfn'
import { DatabaseService } from '../utils/database'
import { createSuccessResponse, createErrorResponse, parseJSON, validateRequired } from '../utils/lambda'

// const sfnClient = new SFNClient({}) // For future Step Functions integration
const db = new DatabaseService()

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

    // For MVP, we'll simulate the orchestration process without Step Functions
    // In production, this would start the Step Functions state machine
    
    // Start with Product Manager Agent
    setTimeout(async () => {
      await simulateAgentExecution(projectId, 'ProductManagerAgent')
    }, 1000)

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

// Simulate agent execution for MVP
const simulateAgentExecution = async (projectId: string, agentName: string) => {
  try {
    console.log(`Starting ${agentName} for project ${projectId}`)

    // Get tasks for this agent
    const tasks = await db.getProjectTasks(projectId)
    const agentTask = tasks.find(task => task.assignedAgent === agentName)

    if (!agentTask) {
      console.log(`No task found for ${agentName}`)
      return
    }

    // Update task to IN_PROGRESS
    await db.updateTask(projectId, agentTask.taskId, {
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      progress: 0,
    })

    // Simulate work progress
    for (let progress = 10; progress <= 100; progress += 10) {
      setTimeout(async () => {
        await db.updateTask(projectId, agentTask.taskId, { progress })
      }, (progress / 10) * 2000) // 2 seconds per 10% progress
    }

    // Complete the task after 20 seconds
    setTimeout(async () => {
      await db.updateTask(projectId, agentTask.taskId, {
        status: 'DONE',
        completedAt: new Date().toISOString(),
        progress: 100,
      })

      // Create sample artifacts based on agent type
      await createSampleArtifacts(projectId, agentName)

      // Start next agent
      const nextAgent = getNextAgent(agentName)
      if (nextAgent) {
        setTimeout(() => {
          simulateAgentExecution(projectId, nextAgent)
        }, 5000) // 5 second delay between agents
      } else {
        // All agents completed, update project status
        await db.updateProject(projectId, { status: 'COMPLETED' })
      }
    }, 20000)

  } catch (error) {
    console.error(`Error in ${agentName} execution:`, error)
    
    // Mark task as failed
    const tasks = await db.getProjectTasks(projectId)
    const agentTask = tasks.find(task => task.assignedAgent === agentName)
    if (agentTask) {
      await db.updateTask(projectId, agentTask.taskId, {
        status: 'FAILED',
        completedAt: new Date().toISOString(),
        errorMessage: (error as Error).message,
      })
    }

    // Mark project as failed
    await db.updateProject(projectId, { status: 'FAILED' })
  }
}

const getNextAgent = (currentAgent: string): string | null => {
  const agentOrder = [
    'ProductManagerAgent',
    'BackendEngineerAgent',
    'FrontendEngineerAgent',
    'DevOpsEngineerAgent',
  ]

  const currentIndex = agentOrder.indexOf(currentAgent)
  if (currentIndex >= 0 && currentIndex < agentOrder.length - 1) {
    return agentOrder[currentIndex + 1]
  }

  return null
}

const createSampleArtifacts = async (projectId: string, agentName: string) => {
  const project = await db.getProject(projectId)
  if (!project) return

  switch (agentName) {
    case 'ProductManagerAgent':
      await db.createArtifact({
        projectId,
        artifactType: 'SRS_DOCUMENT',
        location: `https://example.com/srs/${projectId}.pdf`,
        version: '1.0',
        title: 'Software Requirements Specification',
        description: 'Detailed requirements and specifications for the project',
      })
      break

    case 'BackendEngineerAgent':
      await db.createArtifact({
        projectId,
        artifactType: 'SOURCE_CODE',
        location: `https://github.com/agent-builder/${projectId}-backend`,
        version: '1.0',
        title: 'Backend Source Code',
        description: 'Node.js backend with AWS Lambda and DynamoDB',
      })
      break

    case 'FrontendEngineerAgent':
      await db.createArtifact({
        projectId,
        artifactType: 'SOURCE_CODE',
        location: `https://github.com/agent-builder/${projectId}-frontend`,
        version: '1.0',
        title: 'Frontend Source Code',
        description: 'React application with TypeScript and Tailwind CSS',
      })
      break

    case 'DevOpsEngineerAgent':
      await db.createArtifact({
        projectId,
        artifactType: 'DEPLOYMENT_URL',
        location: `https://${projectId.toLowerCase()}.agent-builder.app`,
        version: '1.0',
        title: 'Live Application',
        description: 'Deployed application running on AWS',
      })
      
      await db.createArtifact({
        projectId,
        artifactType: 'TEST_REPORT',
        location: `https://example.com/test-reports/${projectId}.html`,
        version: '1.0',
        title: 'Test Report',
        description: 'Automated test results and quality metrics',
      })
      break
  }
}
import { SQSEvent, SQSRecord, Context } from 'aws-lambda'
import { LambdaClient, InvokeCommand } from '@aws-sdk/client-lambda'
import { SQSClient, SendMessageCommand } from '@aws-sdk/client-sqs'
import { SNSClient, PublishCommand } from '@aws-sdk/client-sns'
import { DatabaseService } from '../utils/database'

const lambdaClient = new LambdaClient({})
const sqsClient = new SQSClient({})
const snsClient = new SNSClient({})
const db = new DatabaseService()

const AGENT_TASK_QUEUE_URL = process.env.AGENT_TASK_QUEUE_URL!
const PROJECT_NOTIFICATION_TOPIC_ARN = process.env.PROJECT_NOTIFICATION_TOPIC_ARN!
const FUNCTION_PREFIX = process.env.AWS_LAMBDA_FUNCTION_NAME?.split('-')[0] || 'agent-builder'

interface AgentTaskMessage {
  projectId: string
  agentName: string
  taskId?: string
}

export const handler = async (event: SQSEvent, _context: Context): Promise<void> => {
  console.log('Agent Worker processing SQS event:', JSON.stringify(event, null, 2))

  for (const record of event.Records) {
    await processAgentTask(record)
  }
}

const processAgentTask = async (record: SQSRecord): Promise<void> => {
  try {
    const message: AgentTaskMessage = JSON.parse(record.body)
    const { projectId, agentName } = message

    console.log(`Processing agent task: ${agentName} for project ${projectId}`)

    // Get the project details
    const project = await db.getProject(projectId)
    if (!project) {
      console.error(`Project ${projectId} not found`)
      return
    }

    // Get tasks for this agent
    const tasks = await db.getProjectTasks(projectId)
    const agentTask = tasks.find(task => task.assignedAgent === agentName)

    if (!agentTask) {
      console.error(`No task found for ${agentName} in project ${projectId}`)
      return
    }

    // Update task to IN_PROGRESS
    await db.updateTask(projectId, agentTask.taskId, {
      status: 'IN_PROGRESS',
      startedAt: new Date().toISOString(),
      progress: 0,
    })

    // Invoke the corresponding agent Lambda function
    const functionName = getAgentFunctionName(agentName)
    const agentPayload = {
      projectId,
      project,
      taskId: agentTask.taskId
    }

    try {
      const invokeCommand = new InvokeCommand({
        FunctionName: functionName,
        Payload: new TextEncoder().encode(JSON.stringify(agentPayload)),
        InvocationType: 'RequestResponse'
      })

      const response = await lambdaClient.send(invokeCommand)
      
      if (response.StatusCode === 200 && response.Payload) {
        const result = JSON.parse(new TextDecoder().decode(response.Payload))
        
        if (result.success) {
          // Mark task as completed
          await db.updateTask(projectId, agentTask.taskId, {
            status: 'DONE',
            completedAt: new Date().toISOString(),
            progress: 100,
          })

          // Send notification about task completion
          await sendNotification(projectId, 'task_update', {
            taskId: agentTask.taskId,
            agentName,
            status: 'DONE',
            progress: 100
          })

          console.log(`Agent ${agentName} completed successfully for project ${projectId}`)

          // Queue the next agent in the sequence
          const nextAgent = getNextAgent(agentName)
          if (nextAgent) {
            await queueNextAgent(projectId, nextAgent)
          } else {
            // All agents completed, update project status
            await db.updateProject(projectId, { status: 'COMPLETED' })
            
            // Send notification about project completion
            await sendNotification(projectId, 'project_update', {
              status: 'COMPLETED',
              message: 'All agents completed successfully'
            })
            
            console.log(`All agents completed for project ${projectId}`)
          }
        } else {
          throw new Error(result.errorMessage || 'Agent execution failed')
        }
      } else {
        throw new Error('Agent function invocation failed')
      }
    } catch (agentError) {
      console.error(`Error invoking agent ${agentName}:`, agentError)
      
      // Mark task as failed
      await db.updateTask(projectId, agentTask.taskId, {
        status: 'FAILED',
        completedAt: new Date().toISOString(),
        errorMessage: (agentError as Error).message,
      })

      // Send notification about task failure
      await sendNotification(projectId, 'task_update', {
        taskId: agentTask.taskId,
        agentName,
        status: 'FAILED',
        error: (agentError as Error).message
      })

      // Mark project as failed
      await db.updateProject(projectId, { status: 'FAILED' })
      
      // Send notification about project failure
      await sendNotification(projectId, 'project_update', {
        status: 'FAILED',
        message: `Agent ${agentName} failed`,
        error: (agentError as Error).message
      })
    }

  } catch (error) {
    console.error('Error processing agent task:', error)
    throw error // This will send the message to DLQ after max retries
  }
}

const getAgentFunctionName = (agentName: string): string => {
  const functionMap: Record<string, string> = {
    'ProductManagerAgent': `${FUNCTION_PREFIX}-ProductManagerFunction`,
    'BackendEngineerAgent': `${FUNCTION_PREFIX}-BackendEngineerFunction`,
    'FrontendEngineerAgent': `${FUNCTION_PREFIX}-FrontendEngineerFunction`,
    'DevOpsEngineerAgent': `${FUNCTION_PREFIX}-DevOpsEngineerFunction`
  }

  const functionName = functionMap[agentName]
  if (!functionName) {
    throw new Error(`Unknown agent: ${agentName}`)
  }

  return functionName
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

const queueNextAgent = async (projectId: string, agentName: string): Promise<void> => {
  const message: AgentTaskMessage = {
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
    console.log(`Queued next agent: ${agentName} for project ${projectId}`)
  } catch (error) {
    console.error(`Failed to queue next agent ${agentName}:`, error)
    throw error
  }
}

const sendNotification = async (
  projectId: string, 
  type: 'task_update' | 'project_update' | 'agent_complete', 
  data: any
): Promise<void> => {
  try {
    const message = {
      projectId,
      type,
      data,
      timestamp: new Date().toISOString()
    }

    const command = new PublishCommand({
      TopicArn: PROJECT_NOTIFICATION_TOPIC_ARN,
      Message: JSON.stringify(message),
      Subject: `Agent Builder - ${type} for project ${projectId}`
    })

    await snsClient.send(command)
    console.log(`Notification sent for project ${projectId}, type: ${type}`)
  } catch (error) {
    console.error('Failed to send notification:', error)
    // Don't throw error here to avoid failing the main process
  }
}
import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DatabaseService } from '../utils/database'
import { createSuccessResponse, createErrorResponse } from '../utils/lambda'

const db = new DatabaseService()

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Tasks handler event:', JSON.stringify(event, null, 2))

  try {
    const method = event.httpMethod
    const pathParameters = event.pathParameters || {}

    if (method === 'GET' && event.path.includes('/tasks')) {
      // Get project tasks: /projects/{id}/tasks
      if (!pathParameters.id) {
        return createErrorResponse(400, 'Project ID is required')
      }
      return await getProjectTasks(pathParameters.id)
    }

    if (method === 'GET' && event.path.includes('/status')) {
      // Get project status: /projects/{id}/status
      if (!pathParameters.id) {
        return createErrorResponse(400, 'Project ID is required')
      }
      return await getProjectStatus(pathParameters.id)
    }

    return createErrorResponse(405, 'Method not allowed')
  } catch (error) {
    console.error('Error in tasks handler:', error)
    return createErrorResponse(500, 'Internal server error', error)
  }
}

const getProjectTasks = async (projectId: string): Promise<APIGatewayProxyResult> => {
  try {
    const tasks = await db.getProjectTasks(projectId)

    return createSuccessResponse({ tasks })
  } catch (error) {
    console.error('Error getting project tasks:', error)
    return createErrorResponse(500, 'Failed to get project tasks', error)
  }
}

const getProjectStatus = async (projectId: string): Promise<APIGatewayProxyResult> => {
  try {
    const project = await db.getProject(projectId)
    if (!project) {
      return createErrorResponse(404, 'Project not found')
    }

    const tasks = await db.getProjectTasks(projectId)
    
    // Calculate progress based on task completion
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(task => task.status === 'DONE').length
    const failedTasks = tasks.filter(task => task.status === 'FAILED').length
    const inProgressTasks = tasks.filter(task => task.status === 'IN_PROGRESS')
    
    let progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    let status = project.status
    let currentTask = undefined
    let estimatedCompletion = undefined

    // Find current task
    if (inProgressTasks.length > 0) {
      currentTask = inProgressTasks[0].description || `${inProgressTasks[0].assignedAgent} working...`
      
      // Add task progress to overall progress if available
      if (inProgressTasks[0].progress) {
        const taskContribution = (1 / totalTasks) * 100
        const taskProgress = (inProgressTasks[0].progress / 100) * taskContribution
        progress = ((completedTasks / totalTasks) * 100) + taskProgress
      }

      // Estimate completion time (rough estimate: 5-10 minutes per remaining task)
      const remainingTasks = totalTasks - completedTasks
      const estimatedMinutes = remainingTasks * 7 // 7 minutes average per task
      const completionTime = new Date(Date.now() + estimatedMinutes * 60000)
      estimatedCompletion = completionTime.toLocaleTimeString()
    }

    // Update project status based on task statuses
    if (failedTasks > 0) {
      status = 'FAILED'
    } else if (completedTasks === totalTasks && totalTasks > 0) {
      status = 'COMPLETED'
      progress = 100
    } else if (inProgressTasks.length > 0 || completedTasks > 0) {
      status = 'IN_PROGRESS'
    }

    // Update project status in database if changed
    if (status !== project.status) {
      await db.updateProject(projectId, { status })
    }

    return createSuccessResponse({
      status,
      progress: Math.round(progress),
      currentTask,
      estimatedCompletion,
      taskSummary: {
        total: totalTasks,
        completed: completedTasks,
        inProgress: inProgressTasks.length,
        failed: failedTasks,
        pending: tasks.filter(task => task.status === 'TODO').length,
      },
    })
  } catch (error) {
    console.error('Error getting project status:', error)
    return createErrorResponse(500, 'Failed to get project status', error)
  }
}
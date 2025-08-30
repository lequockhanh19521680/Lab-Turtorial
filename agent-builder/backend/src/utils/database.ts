import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { DynamoDBDocumentClient, PutCommand, GetCommand, UpdateCommand, DeleteCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { v4 as uuidv4 } from 'uuid'
import { Project, Task, Artifact } from '../models'

const client = new DynamoDBClient({})
const docClient = DynamoDBDocumentClient.from(client)

const PROJECTS_TABLE = process.env.PROJECTS_TABLE!
const TASKS_TABLE = process.env.TASKS_TABLE!
const ARTIFACTS_TABLE = process.env.ARTIFACTS_TABLE!

export class DatabaseService {
  // Project operations
  async createProject(userId: string, projectName: string, requestPrompt: string): Promise<Project> {
    const project: Project = {
      projectId: uuidv4(),
      userId,
      projectName,
      requestPrompt,
      status: 'PENDING',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    await docClient.send(new PutCommand({
      TableName: PROJECTS_TABLE,
      Item: project,
    }))

    return project
  }

  async getProject(projectId: string): Promise<Project | null> {
    const result = await docClient.send(new GetCommand({
      TableName: PROJECTS_TABLE,
      Key: { projectId },
    }))

    return result.Item as Project || null
  }

  async updateProject(projectId: string, updates: Partial<Project>): Promise<Project> {
    const updateExpression = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, any> = {}

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'projectId') {
        updateExpression.push(`#${key} = :${key}`)
        expressionAttributeNames[`#${key}`] = key
        expressionAttributeValues[`:${key}`] = value
      }
    }

    updateExpression.push('#updatedAt = :updatedAt')
    expressionAttributeNames['#updatedAt'] = 'updatedAt'
    expressionAttributeValues[':updatedAt'] = new Date().toISOString()

    const result = await docClient.send(new UpdateCommand({
      TableName: PROJECTS_TABLE,
      Key: { projectId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }))

    return result.Attributes as Project
  }

  async getUserProjects(userId: string): Promise<Project[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: PROJECTS_TABLE,
      IndexName: 'UserIndex',
      KeyConditionExpression: 'userId = :userId',
      ExpressionAttributeValues: {
        ':userId': userId,
      },
      ScanIndexForward: false, // Sort by creation date descending
    }))

    return result.Items as Project[] || []
  }

  async deleteProject(projectId: string): Promise<void> {
    await docClient.send(new DeleteCommand({
      TableName: PROJECTS_TABLE,
      Key: { projectId },
    }))
  }

  // Task operations
  async createTask(task: Omit<Task, 'taskId'>): Promise<Task> {
    const newTask: Task = {
      ...task,
      taskId: uuidv4(),
    }

    await docClient.send(new PutCommand({
      TableName: TASKS_TABLE,
      Item: newTask,
    }))

    return newTask
  }

  async updateTask(projectId: string, taskId: string, updates: Partial<Task>): Promise<Task> {
    const updateExpression = []
    const expressionAttributeNames: Record<string, string> = {}
    const expressionAttributeValues: Record<string, any> = {}

    for (const [key, value] of Object.entries(updates)) {
      if (key !== 'projectId' && key !== 'taskId') {
        updateExpression.push(`#${key} = :${key}`)
        expressionAttributeNames[`#${key}`] = key
        expressionAttributeValues[`:${key}`] = value
      }
    }

    const result = await docClient.send(new UpdateCommand({
      TableName: TASKS_TABLE,
      Key: { projectId, taskId },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW',
    }))

    return result.Attributes as Task
  }

  async getProjectTasks(projectId: string): Promise<Task[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: TASKS_TABLE,
      KeyConditionExpression: 'projectId = :projectId',
      ExpressionAttributeValues: {
        ':projectId': projectId,
      },
    }))

    return result.Items as Task[] || []
  }

  // Artifact operations
  async createArtifact(artifact: Omit<Artifact, 'artifactId' | 'createdAt'>): Promise<Artifact> {
    const newArtifact: Artifact = {
      ...artifact,
      artifactId: uuidv4(),
      createdAt: new Date().toISOString(),
    }

    await docClient.send(new PutCommand({
      TableName: ARTIFACTS_TABLE,
      Item: newArtifact,
    }))

    return newArtifact
  }

  async getProjectArtifacts(projectId: string): Promise<Artifact[]> {
    const result = await docClient.send(new QueryCommand({
      TableName: ARTIFACTS_TABLE,
      KeyConditionExpression: 'projectId = :projectId',
      ExpressionAttributeValues: {
        ':projectId': projectId,
      },
    }))

    return result.Items as Artifact[] || []
  }
}
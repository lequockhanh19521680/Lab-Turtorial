import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";
import { v4 as uuidv4 } from "uuid";
import { Task, CreateTaskRequest, UpdateTaskRequest } from "../models";

/**
 * Repository layer for Task entity
 * Handles all DynamoDB operations for tasks
 */
export class TaskRepository {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    const client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.TASKS_TABLE!;
  }

  /**
   * Create a new task
   */
  async create(request: CreateTaskRequest): Promise<Task> {
    const task: Task = {
      taskId: uuidv4(),
      projectId: request.projectId,
      assignedAgent: request.assignedAgent,
      status: request.status,
      dependencies: request.dependencies,
      description: request.description,
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: task,
      })
    );

    return task;
  }

  /**
   * Get task by project ID and task ID
   */
  async findById(projectId: string, taskId: string): Promise<Task | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { projectId, taskId },
      })
    );

    return (result.Item as Task) || null;
  }

  /**
   * Update task
   */
  async update(projectId: string, taskId: string, updates: UpdateTaskRequest): Promise<Task> {
    const updateExpression = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (key !== "projectId" && key !== "taskId") {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    }

    if (updateExpression.length === 0) {
      throw new Error("No valid fields to update");
    }

    const result = await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { projectId, taskId },
        UpdateExpression: `SET ${updateExpression.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
    );

    return result.Attributes as Task;
  }

  /**
   * Get all tasks for a project
   */
  async findByProjectId(projectId: string): Promise<Task[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "projectId = :projectId",
        ExpressionAttributeValues: {
          ":projectId": projectId,
        },
      })
    );

    return (result.Items as Task[]) || [];
  }

  /**
   * Delete task
   */
  async delete(projectId: string, taskId: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { projectId, taskId },
      })
    );
  }

  /**
   * Find tasks by status
   */
  async findByStatus(projectId: string, status: Task['status']): Promise<Task[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "projectId = :projectId",
        FilterExpression: "#status = :status",
        ExpressionAttributeNames: {
          "#status": "status",
        },
        ExpressionAttributeValues: {
          ":projectId": projectId,
          ":status": status,
        },
      })
    );

    return (result.Items as Task[]) || [];
  }
}
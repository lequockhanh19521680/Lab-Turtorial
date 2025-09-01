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
import {
  Project,
  CreateProjectRequest,
  UpdateProjectRequest,
} from "../models/index.js";

/**
 * Repository layer for Project entity
 * Handles all DynamoDB operations for projects
 */
export class ProjectRepository {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    const client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.PROJECTS_TABLE!;
  }

  /**
   * Create a new project
   */
  async create(request: CreateProjectRequest): Promise<Project> {
    const project: Project = {
      projectId: uuidv4(),
      userId: request.userId,
      projectName: request.projectName,
      requestPrompt: request.requestPrompt,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store with 'id' as the primary key for CDK schema compatibility
    const dynamoItem = {
      ...project,
      id: project.projectId, // Use 'id' as primary key in DynamoDB
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: dynamoItem,
      })
    );

    return project;
  }

  /**
   * Get project by ID
   */
  async findById(projectId: string): Promise<Project | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { id: projectId }, // Updated to match CDK schema (primary key is 'id')
      })
    );

    // Map the DynamoDB item back to our Project interface
    const item = result.Item;
    if (!item) return null;

    return {
      projectId: item.id || item.projectId, // Handle both old and new schemas
      userId: item.userId,
      projectName: item.projectName,
      requestPrompt: item.requestPrompt,
      status: item.status,
      createdAt: item.createdAt,
      updatedAt: item.updatedAt,
    } as Project;
  }

  /**
   * Update project
   */
  async update(
    projectId: string,
    updates: UpdateProjectRequest
  ): Promise<Project> {
    const updateExpression = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (key !== "projectId") {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    }

    // Always update the updatedAt timestamp
    updateExpression.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    const result = await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { id: projectId }, // Updated to match CDK schema
        UpdateExpression: `SET ${updateExpression.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
    );

    return result.Attributes as Project;
  }

  /**
   * Get all projects for a user
   */
  async findByUserId(userId: string): Promise<Project[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        IndexName: "UserIndex",
        KeyConditionExpression: "userId = :userId",
        ExpressionAttributeValues: {
          ":userId": userId,
        },
        ScanIndexForward: false, // Sort by creation date descending
      })
    );

    const items = result.Items || [];
    return items.map(
      (item) =>
        ({
          projectId: item.id || item.projectId, // Handle both old and new schemas
          userId: item.userId,
          projectName: item.projectName,
          requestPrompt: item.requestPrompt,
          status: item.status,
          createdAt: item.createdAt,
          updatedAt: item.updatedAt,
        }) as Project
    );
  }

  /**
   * Delete project
   */
  async delete(projectId: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { id: projectId }, // Updated to match CDK schema
      })
    );
  }
}

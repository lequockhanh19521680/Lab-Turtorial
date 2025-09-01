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
import { Artifact, CreateArtifactRequest } from "../models/index.js";

/**
 * Repository layer for Artifact entity
 * Handles all DynamoDB operations for artifacts
 */
export class ArtifactRepository {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    const client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.ARTIFACTS_TABLE!;
  }

  /**
   * Create a new artifact
   */
  async create(request: CreateArtifactRequest): Promise<Artifact> {
    const artifact: Artifact = {
      artifactId: uuidv4(),
      projectId: request.projectId,
      artifactType: request.artifactType,
      location: request.location,
      version: request.version,
      createdAt: new Date().toISOString(),
      title: request.title,
      description: request.description,
      metadata: request.metadata,
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: artifact,
      })
    );

    return artifact;
  }

  /**
   * Get artifact by project ID and artifact ID
   */
  async findById(
    projectId: string,
    artifactId: string
  ): Promise<Artifact | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { projectId, artifactId },
      })
    );

    return (result.Item as Artifact) || null;
  }

  /**
   * Get all artifacts for a project
   */
  async findByProjectId(projectId: string): Promise<Artifact[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "projectId = :projectId",
        ExpressionAttributeValues: {
          ":projectId": projectId,
        },
      })
    );

    return (result.Items as Artifact[]) || [];
  }

  /**
   * Find artifacts by type
   */
  async findByType(
    projectId: string,
    artifactType: Artifact["artifactType"]
  ): Promise<Artifact[]> {
    const result = await this.docClient.send(
      new QueryCommand({
        TableName: this.tableName,
        KeyConditionExpression: "projectId = :projectId",
        FilterExpression: "artifactType = :artifactType",
        ExpressionAttributeValues: {
          ":projectId": projectId,
          ":artifactType": artifactType,
        },
      })
    );

    return (result.Items as Artifact[]) || [];
  }

  /**
   * Update artifact
   */
  async update(
    projectId: string,
    artifactId: string,
    updates: Partial<Artifact>
  ): Promise<Artifact> {
    const updateExpression = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (key !== "projectId" && key !== "artifactId") {
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
        Key: { projectId, artifactId },
        UpdateExpression: `SET ${updateExpression.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
    );

    return result.Attributes as Artifact;
  }

  /**
   * Delete artifact
   */
  async delete(projectId: string, artifactId: string): Promise<void> {
    await this.docClient.send(
      new DeleteCommand({
        TableName: this.tableName,
        Key: { projectId, artifactId },
      })
    );
  }
}

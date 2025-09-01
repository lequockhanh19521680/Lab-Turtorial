import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  GetCommand,
  UpdateCommand,
} from "@aws-sdk/lib-dynamodb";
import { User } from "../models/index.js";

/**
 * Repository layer for User entity
 * Handles all DynamoDB operations for users
 */
export class UserRepository {
  private readonly docClient: DynamoDBDocumentClient;
  private readonly tableName: string;

  constructor() {
    const client = new DynamoDBClient({});
    this.docClient = DynamoDBDocumentClient.from(client);
    this.tableName = process.env.USERS_TABLE!;
  }

  /**
   * Create or update a user
   */
  async createOrUpdate(userData: {
    userId: string;
    email: string;
    name?: string;
    givenName?: string;
    familyName?: string;
    picture?: string;
    provider: "google" | "cognito";
    providerUserId: string;
  }): Promise<User> {
    const now = new Date().toISOString();
    const existingUser = await this.findById(userData.userId);

    const user: User = {
      ...userData,
      createdAt: existingUser?.createdAt || now,
      updatedAt: now,
      lastLoginAt: now,
    };

    await this.docClient.send(
      new PutCommand({
        TableName: this.tableName,
        Item: user,
      })
    );

    return user;
  }

  /**
   * Get user by ID
   */
  async findById(userId: string): Promise<User | null> {
    const result = await this.docClient.send(
      new GetCommand({
        TableName: this.tableName,
        Key: { userId },
      })
    );

    return (result.Item as User) || null;
  }

  /**
   * Update user
   */
  async update(
    userId: string,
    updates: Partial<Omit<User, "userId" | "createdAt">>
  ): Promise<User> {
    const updateExpression = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, any> = {};

    for (const [key, value] of Object.entries(updates)) {
      if (key !== "userId") {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = value;
      }
    }

    updateExpression.push("#updatedAt = :updatedAt");
    expressionAttributeNames["#updatedAt"] = "updatedAt";
    expressionAttributeValues[":updatedAt"] = new Date().toISOString();

    const result = await this.docClient.send(
      new UpdateCommand({
        TableName: this.tableName,
        Key: { userId },
        UpdateExpression: `SET ${updateExpression.join(", ")}`,
        ExpressionAttributeNames: expressionAttributeNames,
        ExpressionAttributeValues: expressionAttributeValues,
        ReturnValues: "ALL_NEW",
      })
    );

    return result.Attributes as User;
  }
}

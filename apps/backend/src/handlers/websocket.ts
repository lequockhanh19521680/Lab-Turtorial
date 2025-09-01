import {
  APIGatewayProxyResult,
  APIGatewayProxyWebsocketEventV2,
} from "aws-lambda";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  PutCommand,
  DeleteCommand,
  QueryCommand,
} from "@aws-sdk/lib-dynamodb";

const client = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(client);

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE!;

interface ConnectionRecord {
  connectionId: string;
  projectId?: string;
  userId?: string;
  connectedAt: string;
  ttl: number;
}

export const onConnect = async (
  event: APIGatewayProxyWebsocketEventV2
): Promise<APIGatewayProxyResult> => {
  console.log("WebSocket connect event:", JSON.stringify(event, null, 2));

  const connectionId = event.requestContext.connectionId;
  // For now, we'll store the connection without project/user binding
  // and update it via messages later
  const projectId = undefined;
  const userId = undefined;

  try {
    // Store connection info in DynamoDB
    const connectionRecord: ConnectionRecord = {
      connectionId,
      projectId,
      userId,
      connectedAt: new Date().toISOString(),
      ttl: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours TTL
    };

    await docClient.send(
      new PutCommand({
        TableName: CONNECTIONS_TABLE,
        Item: connectionRecord,
      })
    );

    console.log(`Connection stored: ${connectionId} for project: ${projectId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Connected successfully" }),
    };
  } catch (error) {
    console.error("Error storing connection:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to connect" }),
    };
  }
};

export const onDisconnect = async (
  event: APIGatewayProxyWebsocketEventV2
): Promise<APIGatewayProxyResult> => {
  console.log("WebSocket disconnect event:", JSON.stringify(event, null, 2));

  const connectionId = event.requestContext.connectionId;

  try {
    // Remove connection from DynamoDB
    await docClient.send(
      new DeleteCommand({
        TableName: CONNECTIONS_TABLE,
        Key: { connectionId },
      })
    );

    console.log(`Connection removed: ${connectionId}`);

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Disconnected successfully" }),
    };
  } catch (error) {
    console.error("Error removing connection:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to disconnect" }),
    };
  }
};

export const onMessage = async (
  event: APIGatewayProxyWebsocketEventV2
): Promise<APIGatewayProxyResult> => {
  console.log("WebSocket message event:", JSON.stringify(event, null, 2));

  const connectionId = event.requestContext.connectionId;
  const body = event.body ? JSON.parse(event.body) : {};

  try {
    const { action, projectId } = body;

    switch (action) {
      case "subscribe":
        // Update connection with projectId for project-specific updates
        if (projectId) {
          await docClient.send(
            new PutCommand({
              TableName: CONNECTIONS_TABLE,
              Item: {
                connectionId,
                projectId,
                connectedAt: new Date().toISOString(),
                ttl: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
              },
            })
          );
          console.log(
            `Connection ${connectionId} subscribed to project ${projectId}`
          );
        }
        break;

      case "unsubscribe":
        // Update connection to remove projectId
        await docClient.send(
          new PutCommand({
            TableName: CONNECTIONS_TABLE,
            Item: {
              connectionId,
              connectedAt: new Date().toISOString(),
              ttl: Math.floor(Date.now() / 1000) + 24 * 60 * 60,
            },
          })
        );
        console.log(
          `Connection ${connectionId} unsubscribed from project updates`
        );
        break;

      default:
        console.log(`Unknown action: ${action}`);
        break;
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ message: "Message processed" }),
    };
  } catch (error) {
    console.error("Error processing message:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to process message" }),
    };
  }
};

export const getConnections = async (projectId: string): Promise<string[]> => {
  try {
    const result = await docClient.send(
      new QueryCommand({
        TableName: CONNECTIONS_TABLE,
        IndexName: "ProjectIndex",
        KeyConditionExpression: "projectId = :projectId",
        ExpressionAttributeValues: {
          ":projectId": projectId,
        },
      })
    );

    return result.Items?.map((item) => item.connectionId) || [];
  } catch (error) {
    console.error("Error getting connections:", error);
    return [];
  }
};

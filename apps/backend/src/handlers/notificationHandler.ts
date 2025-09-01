import { SNSEvent, SNSEventRecord } from "aws-lambda/trigger/sns";
import {
  ApiGatewayManagementApiClient,
  PostToConnectionCommand,
} from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  QueryCommand,
  DeleteCommand,
} from "@aws-sdk/lib-dynamodb";

const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);

const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE!;
const WEBSOCKET_API_ENDPOINT = process.env.WEBSOCKET_API_ENDPOINT!;

// Initialize API Gateway Management API client
const apiGwClient = new ApiGatewayManagementApiClient({
  endpoint: `https://${WEBSOCKET_API_ENDPOINT}`,
});

interface ProjectNotification {
  projectId: string;
  type: "task_update" | "project_update" | "agent_complete";
  data: any;
  timestamp: string;
}

export const handler = async (event: SNSEvent): Promise<void> => {
  console.log("SNS notification event:", JSON.stringify(event, null, 2));

  try {
    for (const record of event.Records) {
      await processNotification(record);
    }
  } catch (error) {
    console.error("Error in notification handler:", error);
    // For SNS handlers, we don't throw to avoid disrupting the notification flow
    // Individual record processing errors are handled in processNotification
  }
};

const processNotification = async (record: SNSEventRecord): Promise<void> => {
  try {
    const notification: ProjectNotification = JSON.parse(record.Sns.Message);
    const { projectId, type, data, timestamp } = notification;

    console.log(
      `Processing notification for project ${projectId}, type: ${type}`
    );

    // Get all connections for this project
    const connectionIds = await getProjectConnections(projectId);

    if (connectionIds.length === 0) {
      console.log(`No connections found for project ${projectId}`);
      return;
    }

    // Prepare message to send to all connections
    const message = {
      type,
      projectId,
      data,
      timestamp,
    };

    // Send message to all connected clients for this project
    const promises = connectionIds.map((connectionId) =>
      sendMessageToConnection(connectionId, message)
    );

    await Promise.allSettled(promises);
  } catch (error) {
    console.error("Error processing notification:", error);
  }
};

const getProjectConnections = async (projectId: string): Promise<string[]> => {
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
    console.error("Error getting project connections:", error);
    return [];
  }
};

const sendMessageToConnection = async (
  connectionId: string,
  message: any
): Promise<void> => {
  try {
    const command = new PostToConnectionCommand({
      ConnectionId: connectionId,
      Data: new TextEncoder().encode(JSON.stringify(message)),
    });

    await apiGwClient.send(command);
    console.log(`Message sent to connection ${connectionId}`);
  } catch (error: any) {
    console.error(
      `Error sending message to connection ${connectionId}:`,
      error
    );

    // If connection is stale (410 error), remove it from the database
    if (error.statusCode === 410) {
      try {
        await docClient.send(
          new DeleteCommand({
            TableName: CONNECTIONS_TABLE,
            Key: { connectionId },
          })
        );
        console.log(`Removed stale connection: ${connectionId}`);
      } catch (deleteError) {
        console.error(
          `Error removing stale connection ${connectionId}:`,
          deleteError
        );
      }
    }
  }
};

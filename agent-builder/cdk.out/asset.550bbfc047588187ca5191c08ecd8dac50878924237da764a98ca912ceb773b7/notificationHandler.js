import { ApiGatewayManagementApiClient, PostToConnectionCommand, } from "@aws-sdk/client-apigatewaymanagementapi";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient, QueryCommand, DeleteCommand, } from "@aws-sdk/lib-dynamodb";
const dynamoClient = new DynamoDBClient({});
const docClient = DynamoDBDocumentClient.from(dynamoClient);
const CONNECTIONS_TABLE = process.env.CONNECTIONS_TABLE;
const WEBSOCKET_API_ENDPOINT = process.env.WEBSOCKET_API_ENDPOINT;
// Initialize API Gateway Management API client
const apiGwClient = new ApiGatewayManagementApiClient({
    endpoint: `https://${WEBSOCKET_API_ENDPOINT}`,
});
export const handler = async (event) => {
    console.log("SNS notification event:", JSON.stringify(event, null, 2));
    for (const record of event.Records) {
        await processNotification(record);
    }
};
const processNotification = async (record) => {
    try {
        const notification = JSON.parse(record.Sns.Message);
        const { projectId, type, data, timestamp } = notification;
        console.log(`Processing notification for project ${projectId}, type: ${type}`);
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
        const promises = connectionIds.map((connectionId) => sendMessageToConnection(connectionId, message));
        await Promise.allSettled(promises);
    }
    catch (error) {
        console.error("Error processing notification:", error);
    }
};
const getProjectConnections = async (projectId) => {
    try {
        const result = await docClient.send(new QueryCommand({
            TableName: CONNECTIONS_TABLE,
            IndexName: "ProjectIndex",
            KeyConditionExpression: "projectId = :projectId",
            ExpressionAttributeValues: {
                ":projectId": projectId,
            },
        }));
        return result.Items?.map((item) => item.connectionId) || [];
    }
    catch (error) {
        console.error("Error getting project connections:", error);
        return [];
    }
};
const sendMessageToConnection = async (connectionId, message) => {
    try {
        const command = new PostToConnectionCommand({
            ConnectionId: connectionId,
            Data: new TextEncoder().encode(JSON.stringify(message)),
        });
        await apiGwClient.send(command);
        console.log(`Message sent to connection ${connectionId}`);
    }
    catch (error) {
        console.error(`Error sending message to connection ${connectionId}:`, error);
        // If connection is stale (410 error), remove it from the database
        if (error.statusCode === 410) {
            try {
                await docClient.send(new DeleteCommand({
                    TableName: CONNECTIONS_TABLE,
                    Key: { connectionId },
                }));
                console.log(`Removed stale connection: ${connectionId}`);
            }
            catch (deleteError) {
                console.error(`Error removing stale connection ${connectionId}:`, deleteError);
            }
        }
    }
};
//# sourceMappingURL=notificationHandler.js.map
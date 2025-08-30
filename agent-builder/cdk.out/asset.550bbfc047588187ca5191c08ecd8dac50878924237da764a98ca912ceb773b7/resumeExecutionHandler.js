import { DatabaseService } from "../utils/database";
import { queueNextAgent, getNextAgent } from "../utils/sqs";
import { createSuccessResponse, createErrorResponse, getUserIdFromEvent, } from "../utils/lambda";
import { SNSClient, PublishCommand } from "@aws-sdk/client-sns";
const db = new DatabaseService();
const snsClient = new SNSClient({});
const PROJECT_NOTIFICATION_TOPIC_ARN = process.env.PROJECT_NOTIFICATION_TOPIC_ARN;
export const handler = async (event) => {
    console.log("Resume execution handler:", JSON.stringify(event, null, 2));
    try {
        const userId = getUserIdFromEvent(event);
        const projectId = event.pathParameters?.id;
        if (!projectId) {
            return createErrorResponse(400, "Project ID is required");
        }
        // Get the request body if provided
        const body = event.body ? JSON.parse(event.body) : {};
        const { taskId, feedback } = body;
        // Get the project to verify ownership
        const project = await db.getProject(projectId);
        if (!project) {
            return createErrorResponse(404, "Project not found");
        }
        if (project.userId !== userId) {
            return createErrorResponse(403, "Access denied");
        }
        // Get all tasks for this project
        const tasks = await db.getProjectTasks(projectId);
        // Find the task that's pending approval
        const pendingTask = taskId
            ? tasks.find((task) => task.taskId === taskId && task.status === "PENDING_APPROVAL")
            : tasks.find((task) => task.status === "PENDING_APPROVAL");
        if (!pendingTask) {
            return createErrorResponse(400, "No task pending approval found");
        }
        // Mark the current task as approved/done
        await db.updateTask(projectId, pendingTask.taskId, {
            status: "DONE",
            ...(feedback && { metadata: { userFeedback: feedback } }),
        });
        // Send notification about task approval
        await sendNotification(projectId, "task_update", {
            taskId: pendingTask.taskId,
            agentName: pendingTask.assignedAgent,
            status: "DONE",
            approved: true,
            feedback,
        });
        // Check if there's a next agent to queue
        const nextAgent = getNextAgent(pendingTask.assignedAgent);
        if (nextAgent) {
            // Queue the next agent in the sequence
            await queueNextAgent(projectId, nextAgent);
            console.log(`Approved task ${pendingTask.taskId} and queued next agent: ${nextAgent} for project ${projectId}`);
            return createSuccessResponse({
                message: "Task approved and next agent queued successfully",
                currentTask: pendingTask,
                nextAgent,
                status: "IN_PROGRESS",
            });
        }
        else {
            // All agents completed, update project status
            await db.updateProject(projectId, { status: "COMPLETED" });
            // Send notification about project completion
            await sendNotification(projectId, "project_update", {
                status: "COMPLETED",
                message: "All agents completed successfully",
            });
            console.log(`All agents completed for project ${projectId}`);
            return createSuccessResponse({
                message: "Task approved and project completed successfully",
                currentTask: pendingTask,
                status: "COMPLETED",
            });
        }
    }
    catch (error) {
        console.error("Error in resume execution handler:", error);
        return createErrorResponse(500, "Internal server error", error);
    }
};
const sendNotification = async (projectId, type, data) => {
    try {
        const message = {
            projectId,
            type,
            data,
            timestamp: new Date().toISOString(),
        };
        const command = new PublishCommand({
            TopicArn: PROJECT_NOTIFICATION_TOPIC_ARN,
            Message: JSON.stringify(message),
            Subject: `Agent Builder - ${type} for project ${projectId}`,
        });
        await snsClient.send(command);
        console.log(`Notification sent for project ${projectId}, type: ${type}`);
    }
    catch (error) {
        console.error("Failed to send notification:", error);
        // Don't throw error here to avoid failing the main process
    }
};
//# sourceMappingURL=resumeExecutionHandler.js.map
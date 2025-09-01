import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs";

const sqsClient = new SQSClient({});
const AGENT_TASK_QUEUE_URL = process.env.AGENT_TASK_QUEUE_URL!;

export interface AgentTaskMessage {
  projectId: string;
  agentName: string;
  taskId?: string;
}

export const queueNextAgent = async (
  projectId: string,
  agentName: string
): Promise<void> => {
  const message: AgentTaskMessage = {
    projectId,
    agentName,
  };

  try {
    const sendCommand = new SendMessageCommand({
      QueueUrl: AGENT_TASK_QUEUE_URL,
      MessageBody: JSON.stringify(message),
      MessageGroupId: projectId, // For FIFO queue (if needed)
      MessageDeduplicationId: `${projectId}-${agentName}-${Date.now()}`, // For FIFO queue (if needed)
    });

    await sqsClient.send(sendCommand);
    console.log(`Queued agent task: ${agentName} for project ${projectId}`);
  } catch (error) {
    console.error(`Failed to queue agent task ${agentName}:`, error);
    throw error;
  }
};

export const getNextAgent = (currentAgent: string): string | null => {
  const agentOrder = [
    "ProductManagerAgent",
    "BackendEngineerAgent",
    "FrontendEngineerAgent",
    "DevOpsEngineerAgent",
  ];

  const currentIndex = agentOrder.indexOf(currentAgent);
  if (currentIndex >= 0 && currentIndex < agentOrder.length - 1) {
    return agentOrder[currentIndex + 1];
  }

  return null;
};

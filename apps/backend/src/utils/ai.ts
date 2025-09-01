import OpenAI from "openai";
import { getOpenAIApiKey } from "./ssm.js";

let openaiClient: OpenAI | null = null;

/**
 * Get or create OpenAI client instance with API key from SSM
 */
export const getOpenAIClient = async (): Promise<OpenAI> => {
  if (!openaiClient) {
    const apiKey = await getOpenAIApiKey();
    openaiClient = new OpenAI({
      apiKey: apiKey,
    });
  }
  return openaiClient;
};

/**
 * Generate requirements and specifications using AI
 */
export const generateRequirements = async (
  prompt: string
): Promise<{
  features: string[];
  userStories: string[];
  technicalRequirements: string[];
  architecture: string;
}> => {
  const client = await getOpenAIClient();

  const systemPrompt = `You are a senior product manager. Generate comprehensive software requirements based on the user's request. Respond with a JSON object containing:
- features: Array of key features (5-10 items)
- userStories: Array of user stories (5-8 items)
- technicalRequirements: Array of technical requirements (5-8 items)
- architecture: Recommended architecture approach (string)`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 1500,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("AI generation error:", error);
    // Fallback to mock data if AI fails
    return generateMockRequirements(prompt);
  }
};

/**
 * Generate backend API specifications using AI
 */
export const generateBackendSpecs = async (
  requirements: any
): Promise<{
  apis: any[];
  database: any;
  architecture: string;
}> => {
  const client = await getOpenAIClient();

  const systemPrompt = `You are a senior backend engineer. Generate backend specifications based on requirements. Respond with JSON containing:
- apis: Array of API endpoint objects with {method, path, description, requestBody, responseBody}
- database: Database schema with tables and relationships
- architecture: Backend architecture description`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(requirements) },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("AI generation error:", error);
    return generateMockBackendSpecs();
  }
};

/**
 * Generate frontend component specifications using AI
 */
export const generateFrontendSpecs = async (
  requirements: any
): Promise<{
  components: any[];
  pages: any[];
  routing: any[];
  styling: string;
}> => {
  const client = await getOpenAIClient();

  const systemPrompt = `You are a senior frontend engineer. Generate frontend specifications based on requirements. Respond with JSON containing:
- components: Array of component objects with {name, description, props, children}
- pages: Array of page objects with {name, route, description, components}
- routing: Array of route configurations
- styling: Recommended styling approach`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: JSON.stringify(requirements) },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("AI generation error:", error);
    return generateMockFrontendSpecs();
  }
};

/**
 * Generate deployment and infrastructure specifications using AI
 */
export const generateDevOpsSpecs = async (
  backendSpecs: any,
  frontendSpecs: any
): Promise<{
  infrastructure: any;
  deployment: any;
  monitoring: any;
  security: any;
}> => {
  const client = await getOpenAIClient();

  const systemPrompt = `You are a senior DevOps engineer. Generate deployment and infrastructure specifications. Respond with JSON containing:
- infrastructure: Infrastructure requirements and setup
- deployment: Deployment pipeline and strategy
- monitoring: Monitoring and logging setup
- security: Security configurations and best practices`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: JSON.stringify({
            backend: backendSpecs,
            frontend: frontendSpecs,
          }),
        },
      ],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No response from OpenAI");
    }

    return JSON.parse(content);
  } catch (error) {
    console.error("AI generation error:", error);
    return generateMockDevOpsSpecs();
  }
};

// Fallback mock functions
function generateMockRequirements(_prompt: string) {
  return {
    features: [
      "User Authentication",
      "Data Management",
      "Real-time Updates",
      "Search Functionality",
      "Export/Import",
    ],
    userStories: [
      "As a user, I want to log in securely",
      "As a user, I want to manage my data",
      "As a user, I want real-time notifications",
      "As a user, I want to search content",
      "As a user, I want to export my data",
    ],
    technicalRequirements: [
      "RESTful API design",
      "Responsive web interface",
      "Database integration",
      "Authentication & authorization",
      "Real-time communication",
    ],
    architecture:
      "Modern serverless architecture with React frontend and AWS Lambda backend",
  };
}

function generateMockBackendSpecs() {
  return {
    apis: [
      {
        method: "GET",
        path: "/api/data",
        description: "Get data",
        requestBody: null,
        responseBody: "Array of data objects",
      },
      {
        method: "POST",
        path: "/api/data",
        description: "Create data",
        requestBody: "Data object",
        responseBody: "Created data object",
      },
    ],
    database: {
      tables: ["users", "data", "sessions"],
      relationships: "Users have many data items",
    },
    architecture: "Serverless REST API with DynamoDB",
  };
}

function generateMockFrontendSpecs() {
  return {
    components: [
      {
        name: "Header",
        description: "App header with navigation",
        props: ["title"],
        children: [],
      },
      {
        name: "DataList",
        description: "List of data items",
        props: ["data"],
        children: ["DataItem"],
      },
    ],
    pages: [
      {
        name: "Home",
        route: "/",
        description: "Homepage",
        components: ["Header", "DataList"],
      },
      {
        name: "Login",
        route: "/login",
        description: "Login page",
        components: ["LoginForm"],
      },
    ],
    routing: [
      { path: "/", component: "Home" },
      { path: "/login", component: "Login" },
    ],
    styling: "Tailwind CSS with responsive design",
  };
}

function generateMockDevOpsSpecs() {
  return {
    infrastructure: {
      platform: "AWS",
      services: ["Lambda", "DynamoDB", "CloudFront", "S3"],
    },
    deployment: {
      strategy: "Blue/Green deployment",
      pipeline: "GitHub Actions CI/CD",
    },
    monitoring: {
      logging: "CloudWatch",
      metrics: "CloudWatch Metrics",
      alerts: "SNS notifications",
    },
    security: {
      authentication: "AWS Cognito",
      authorization: "JWT tokens",
      encryption: "TLS in transit, AES at rest",
    },
  };
}

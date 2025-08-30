import { Context } from 'aws-lambda'
import { DatabaseService } from '../utils/database'
import { AgentExecutionContext, AgentResponse } from '../models'

const db = new DatabaseService()

export const handler = async (event: AgentExecutionContext, _context: Context): Promise<AgentResponse> => {
  console.log('Backend Engineer Agent execution:', JSON.stringify(event, null, 2))

  try {
    const { projectId, project, previousArtifacts } = event

    // Get SRS from previous artifacts
    const srs = previousArtifacts.find(a => a.artifactType === 'SRS_DOCUMENT')
    const features = srs?.metadata?.features || []

    // Simulate backend development work
    await new Promise(resolve => setTimeout(resolve, 3000))

    // Generate database schema
    const schema = generateDatabaseSchema(features)
    
    // Generate API endpoints
    const apiEndpoints = generateAPIEndpoints(features)

    // Create backend source code artifact
    const backendArtifact = await db.createArtifact({
      projectId,
      artifactType: 'SOURCE_CODE',
      location: `https://github.com/agent-builder/${projectId}-backend`,
      version: '1.0',
      title: 'Backend Source Code',
      description: `Node.js backend with AWS Lambda and DynamoDB for ${project.projectName}`,
      metadata: {
        framework: 'Node.js + AWS Lambda',
        database: 'Amazon DynamoDB',
        schema,
        endpoints: apiEndpoints,
        authentication: 'AWS Cognito',
      },
    })

    return {
      success: true,
      artifacts: [backendArtifact],
      metadata: {
        databaseTables: Object.keys(schema).length,
        apiEndpoints: apiEndpoints.length,
        architecture: 'Serverless',
      },
    }
  } catch (error) {
    console.error('Backend Engineer Agent error:', error)
    return {
      success: false,
      artifacts: [],
      errorMessage: (error as Error).message,
    }
  }
}

const generateDatabaseSchema = (features: string[]): Record<string, any> => {
  const schema: Record<string, any> = {
    Users: {
      userId: 'String (PK)',
      email: 'String',
      name: 'String',
      createdAt: 'String',
      updatedAt: 'String',
    }
  }

  if (features.includes('Task Management')) {
    schema.Projects = {
      projectId: 'String (PK)',
      userId: 'String (FK)',
      name: 'String',
      description: 'String',
      status: 'String',
      createdAt: 'String',
      updatedAt: 'String',
    }

    schema.Tasks = {
      taskId: 'String (PK)',
      projectId: 'String (FK)',
      title: 'String',
      description: 'String',
      status: 'String',
      assignedTo: 'String',
      dueDate: 'String',
      createdAt: 'String',
      updatedAt: 'String',
    }
  }

  if (features.includes('Content Management')) {
    schema.Posts = {
      postId: 'String (PK)',
      userId: 'String (FK)',
      title: 'String',
      content: 'String',
      status: 'String',
      publishedAt: 'String',
      createdAt: 'String',
      updatedAt: 'String',
    }
  }

  if (features.includes('E-commerce Functionality')) {
    schema.Products = {
      productId: 'String (PK)',
      name: 'String',
      description: 'String',
      price: 'Number',
      category: 'String',
      stock: 'Number',
      createdAt: 'String',
      updatedAt: 'String',
    }

    schema.Orders = {
      orderId: 'String (PK)',
      userId: 'String (FK)',
      status: 'String',
      total: 'Number',
      items: 'List',
      createdAt: 'String',
      updatedAt: 'String',
    }
  }

  return schema
}

const generateAPIEndpoints = (features: string[]): string[] => {
  const endpoints = [
    'POST /auth/register',
    'POST /auth/login',
    'GET /auth/profile',
    'PUT /auth/profile',
  ]

  if (features.includes('Task Management')) {
    endpoints.push(
      'GET /projects',
      'POST /projects',
      'GET /projects/{id}',
      'PUT /projects/{id}',
      'DELETE /projects/{id}',
      'GET /projects/{id}/tasks',
      'POST /projects/{id}/tasks',
      'PUT /tasks/{id}',
      'DELETE /tasks/{id}'
    )
  }

  if (features.includes('Content Management')) {
    endpoints.push(
      'GET /posts',
      'POST /posts',
      'GET /posts/{id}',
      'PUT /posts/{id}',
      'DELETE /posts/{id}',
      'POST /posts/{id}/publish'
    )
  }

  if (features.includes('E-commerce Functionality')) {
    endpoints.push(
      'GET /products',
      'POST /products',
      'GET /products/{id}',
      'PUT /products/{id}',
      'DELETE /products/{id}',
      'GET /orders',
      'POST /orders',
      'GET /orders/{id}',
      'PUT /orders/{id}/status'
    )
  }

  return endpoints
}
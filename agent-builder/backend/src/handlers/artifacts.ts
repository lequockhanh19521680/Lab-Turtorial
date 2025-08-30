import { APIGatewayProxyEvent, APIGatewayProxyResult } from 'aws-lambda'
import { DatabaseService } from '../utils/database'
import { createSuccessResponse, createErrorResponse, parseJSON, validateRequired } from '../utils/lambda'

const db = new DatabaseService()

export const handler = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  console.log('Artifacts handler event:', JSON.stringify(event, null, 2))

  try {
    const method = event.httpMethod
    const pathParameters = event.pathParameters || {}

    switch (method) {
      case 'GET':
        if (pathParameters.id) {
          // Get project artifacts: /projects/{id}/artifacts
          return await getProjectArtifacts(pathParameters.id)
        }
        return createErrorResponse(400, 'Project ID is required')

      case 'POST':
        return await createArtifact(event)

      default:
        return createErrorResponse(405, 'Method not allowed')
    }
  } catch (error) {
    console.error('Error in artifacts handler:', error)
    return createErrorResponse(500, 'Internal server error', error)
  }
}

const getProjectArtifacts = async (projectId: string): Promise<APIGatewayProxyResult> => {
  try {
    const artifacts = await db.getProjectArtifacts(projectId)

    return createSuccessResponse({ artifacts })
  } catch (error) {
    console.error('Error getting project artifacts:', error)
    return createErrorResponse(500, 'Failed to get project artifacts', error)
  }
}

const createArtifact = async (event: APIGatewayProxyEvent): Promise<APIGatewayProxyResult> => {
  try {
    const body = parseJSON(event.body || '{}')

    validateRequired(body, ['projectId', 'artifactType', 'location', 'version'])

    const artifact = await db.createArtifact({
      projectId: body.projectId,
      artifactType: body.artifactType,
      location: body.location,
      version: body.version,
      title: body.title,
      description: body.description,
      metadata: body.metadata,
    })

    return createSuccessResponse({ artifact })
  } catch (error) {
    console.error('Error creating artifact:', error)
    return createErrorResponse(500, 'Failed to create artifact', error)
  }
}
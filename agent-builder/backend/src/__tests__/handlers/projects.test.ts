import { APIGatewayProxyEvent } from 'aws-lambda'
import { handler } from '../../handlers/projects'
import { DatabaseService } from '../../utils/database'
import { Project } from '../../models'

// Mock dependencies
jest.mock('../../utils/database')

const mockDbService = DatabaseService as jest.MockedClass<typeof DatabaseService>

// Mock getUserIdFromEvent to avoid JWT token requirements in tests
jest.mock('../../utils/lambda', () => ({
  ...jest.requireActual('../../utils/lambda'),
  getUserIdFromEvent: jest.fn()
}))

const { getUserIdFromEvent } = require('../../utils/lambda')
const mockGetUserIdFromEvent = getUserIdFromEvent as jest.MockedFunction<typeof getUserIdFromEvent>

describe('Projects Handler', () => {
  let mockDb: jest.Mocked<DatabaseService>
  
  const createMockEvent = (method: string, body?: any, pathParameters?: any): Partial<APIGatewayProxyEvent> => ({
    httpMethod: method,
    body: body ? JSON.stringify(body) : null,
    pathParameters,
    headers: {
      'Authorization': 'Bearer mock-jwt-token'
    }
  })
  
  beforeEach(() => {
    jest.clearAllMocks()
    mockDb = new mockDbService() as jest.Mocked<DatabaseService>
    mockGetUserIdFromEvent.mockReturnValue('test-user-id')
  })

  describe('createProject', () => {
    it('should create a project successfully', async () => {
      // Arrange
      const event = createMockEvent('POST', {
        projectName: 'Test Project',
        requestPrompt: 'Create a simple blog application'
      })

      const mockProject: Project = {
        projectId: 'test-project-id',
        userId: 'test-user-id',
        projectName: 'Test Project',
        requestPrompt: 'Create a simple blog application',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      mockDb.createProject.mockResolvedValue(mockProject)
      mockDb.createTask.mockResolvedValue({} as any)

      // Act
      const result = await handler(event as APIGatewayProxyEvent)

      // Assert
      expect(result.statusCode).toBe(200)
      expect(JSON.parse(result.body)).toEqual({
        success: true,
        projectId: 'test-project-id',
        status: 'created',
        message: 'Project created successfully'
      })
      
      expect(mockDb.createProject).toHaveBeenCalledWith(
        'test-user-id',
        'Test Project',
        'Create a simple blog application'
      )
      
      // Verify that initial tasks are created
      expect(mockDb.createTask).toHaveBeenCalledTimes(4)
      expect(mockDb.createTask).toHaveBeenCalledWith(
        expect.objectContaining({
          projectId: 'test-project-id',
          assignedAgent: 'ProductManagerAgent',
          status: 'TODO',
          description: 'Analyze requirements and create SRS document'
        })
      )
    })

    it('should return 400 when required fields are missing', async () => {
      // Arrange
      const event = createMockEvent('POST', {
        projectName: 'Test Project'
        // Missing requestPrompt
      })

      // Act
      const result = await handler(event as APIGatewayProxyEvent)

      // Assert
      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body)).toEqual({
        success: false,
        message: 'Missing required field: requestPrompt'
      })
      expect(mockDb.createProject).not.toHaveBeenCalled()
    })

    it('should return 400 when body is invalid JSON', async () => {
      // Arrange
      const event: Partial<APIGatewayProxyEvent> = {
        httpMethod: 'POST',
        body: 'invalid json',
        pathParameters: null,
        headers: { 'Authorization': 'Bearer mock-jwt-token' }
      }

      // Act
      const result = await handler(event as APIGatewayProxyEvent)

      // Assert
      expect(result.statusCode).toBe(400)
      expect(JSON.parse(result.body)).toEqual({
        success: false,
        message: 'Invalid JSON format'
      })
      expect(mockDb.createProject).not.toHaveBeenCalled()
    })

    it('should handle database errors gracefully', async () => {
      // Arrange
      const event = createMockEvent('POST', {
        projectName: 'Test Project',
        requestPrompt: 'Create a simple blog application'
      })

      mockDb.createProject.mockRejectedValue(new Error('Database connection failed'))

      // Act
      const result = await handler(event as APIGatewayProxyEvent)

      // Assert
      expect(result.statusCode).toBe(500)
      expect(JSON.parse(result.body)).toEqual({
        success: false,
        message: 'Failed to create project',
        error: 'Database connection failed'
      })
    })

    it('should create all required initial tasks', async () => {
      // Arrange
      const event = createMockEvent('POST', {
        projectName: 'Test Project',
        requestPrompt: 'Create a simple blog application'
      })

      const mockProject: Project = {
        projectId: 'test-project-id',
        userId: 'test-user-id',
        projectName: 'Test Project',
        requestPrompt: 'Create a simple blog application',
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      mockDb.createProject.mockResolvedValue(mockProject)
      mockDb.createTask.mockResolvedValue({} as any)

      // Act
      await handler(event as APIGatewayProxyEvent)

      // Assert
      const expectedAgents = [
        'ProductManagerAgent',
        'BackendEngineerAgent', 
        'FrontendEngineerAgent',
        'DevOpsEngineerAgent'
      ]

      expectedAgents.forEach(agent => {
        expect(mockDb.createTask).toHaveBeenCalledWith(
          expect.objectContaining({
            projectId: 'test-project-id',
            assignedAgent: agent,
            status: 'TODO',
            dependencies: []
          })
        )
      })
    })
  })

  describe('getProjects', () => {
    it('should return user projects successfully', async () => {
      // Arrange
      const event = createMockEvent('GET')

      const mockProjects: Project[] = [
        {
          projectId: 'project-1',
          userId: 'test-user-id',
          projectName: 'Test Project 1',
          requestPrompt: 'Create a blog',
          status: 'COMPLETED',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          projectId: 'project-2',
          userId: 'test-user-id', 
          projectName: 'Test Project 2',
          requestPrompt: 'Create an e-commerce site',
          status: 'IN_PROGRESS',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]

      mockDb.getUserProjects.mockResolvedValue(mockProjects)

      // Act
      const result = await handler(event as APIGatewayProxyEvent)

      // Assert
      expect(result.statusCode).toBe(200)
      expect(JSON.parse(result.body)).toEqual({
        success: true,
        projects: mockProjects
      })
      expect(mockDb.getUserProjects).toHaveBeenCalledWith('test-user-id')
    })
  })

  describe('getProject', () => {
    it('should return a specific project successfully', async () => {
      // Arrange
      const event = createMockEvent('GET', null, { id: 'test-project-id' })

      const mockProject: Project = {
        projectId: 'test-project-id',
        userId: 'test-user-id',
        projectName: 'Test Project',
        requestPrompt: 'Create a blog',
        status: 'COMPLETED',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      }

      mockDb.getProject.mockResolvedValue(mockProject)

      // Act
      const result = await handler(event as APIGatewayProxyEvent)

      // Assert
      expect(result.statusCode).toBe(200)
      expect(JSON.parse(result.body)).toEqual({
        success: true,
        project: mockProject
      })
      expect(mockDb.getProject).toHaveBeenCalledWith('test-project-id')
    })

    it('should return 404 when project is not found', async () => {
      // Arrange
      const event = createMockEvent('GET', null, { id: 'non-existent-project' })

      mockDb.getProject.mockResolvedValue(null)

      // Act
      const result = await handler(event as APIGatewayProxyEvent)

      // Assert
      expect(result.statusCode).toBe(404)
      expect(JSON.parse(result.body)).toEqual({
        success: false,
        message: 'Project not found'
      })
    })
  })
})
import { simulateProjectProgress, stopProjectSimulation } from './mock'

export interface WebSocketMessage {
  type: 'task_update' | 'project_update' | 'agent_complete' | 'TASK_PROGRESS' | 'TASK_STARTED' | 'PROJECT_COMPLETED'
  projectId: string
  data: any
  timestamp: string
  taskId?: string
  progress?: number
  task?: any
  project?: any
}

export interface WebSocketConnection {
  ws: WebSocket | null
  isConnected: boolean
  projectId: string | null
  onMessage: (message: WebSocketMessage) => void
  onError: (error: Event) => void
  onClose: () => void
}

// Check if we should use mock API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

class WebSocketService {
  private connection: WebSocketConnection | null = null
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 3000
  private reconnectTimer: NodeJS.Timeout | null = null
  private mockSimulationActive = false

  connect(
    endpoint: string, 
    onMessage: (message: WebSocketMessage) => void,
    onError: (error: Event) => void = () => {},
    onClose: () => void = () => {}
  ): void {
    if (this.connection?.isConnected) {
      console.log('WebSocket already connected')
      return
    }

    if (USE_MOCK_API) {
      // For mock API, simulate WebSocket connection
      console.log('Using mock WebSocket connection')
      this.connection = {
        ws: null,
        isConnected: true,
        projectId: null,
        onMessage,
        onError,
        onClose
      }
      return
    }

    try {
      const ws = new WebSocket(endpoint)
      
      this.connection = {
        ws,
        isConnected: false,
        projectId: null,
        onMessage,
        onError,
        onClose
      }

      ws.onopen = (event) => {
        console.log('WebSocket connected', event)
        if (this.connection) {
          this.connection.isConnected = true
        }
        this.reconnectAttempts = 0
        
        // Clear any existing reconnect timer
        if (this.reconnectTimer) {
          clearTimeout(this.reconnectTimer)
          this.reconnectTimer = null
        }
      }

      ws.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data)
          console.log('WebSocket message received:', message)
          onMessage(message)
        } catch (error) {
          console.error('Error parsing WebSocket message:', error)
        }
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
        onError(error)
      }

      ws.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason)
        if (this.connection) {
          this.connection.isConnected = false
        }
        onClose()

        // Attempt to reconnect if not a normal closure
        if (event.code !== 1000 && this.reconnectAttempts < this.maxReconnectAttempts) {
          this.scheduleReconnect(endpoint, onMessage, onError, onClose)
        }
      }

    } catch (error) {
      console.error('Error creating WebSocket connection:', error)
      onError(error as Event)
    }
  }

  private scheduleReconnect(
    endpoint: string,
    onMessage: (message: WebSocketMessage) => void,
    onError: (error: Event) => void,
    onClose: () => void
  ): void {
    this.reconnectAttempts++
    const delay = this.reconnectInterval * Math.pow(2, this.reconnectAttempts - 1) // Exponential backoff
    
    console.log(`Scheduling WebSocket reconnect attempt ${this.reconnectAttempts} in ${delay}ms`)
    
    this.reconnectTimer = setTimeout(() => {
      this.connect(endpoint, onMessage, onError, onClose)
    }, delay)
  }

  subscribe(projectId: string): void {
    if (!this.connection?.isConnected) {
      console.warn('Cannot subscribe: WebSocket not connected')
      return
    }

    if (USE_MOCK_API) {
      // For mock API, start simulation
      console.log(`Starting mock WebSocket simulation for project: ${projectId}`)
      this.mockSimulationActive = true
      this.connection.projectId = projectId
      
      simulateProjectProgress(projectId, (data) => {
        if (this.connection && this.mockSimulationActive) {
          // Convert mock data to WebSocket message format
          const message: WebSocketMessage = {
            type: data.type,
            projectId: data.projectId,
            data: data,
            timestamp: new Date().toISOString(),
            taskId: data.taskId,
            progress: data.progress,
            task: data.task,
            project: data.project
          }
          this.connection.onMessage(message)
        }
      })
      return
    }

    if (!this.connection.ws) {
      console.warn('Cannot subscribe: WebSocket instance not available')
      return
    }

    const message = {
      action: 'subscribe',
      projectId
    }

    this.connection.ws.send(JSON.stringify(message))
    this.connection.projectId = projectId
    console.log(`Subscribed to project updates: ${projectId}`)
  }

  unsubscribe(): void {
    if (!this.connection?.isConnected) {
      console.warn('Cannot unsubscribe: WebSocket not connected')
      return
    }

    if (USE_MOCK_API) {
      // For mock API, stop simulation
      if (this.connection.projectId) {
        console.log(`Stopping mock WebSocket simulation for project: ${this.connection.projectId}`)
        stopProjectSimulation(this.connection.projectId)
        this.mockSimulationActive = false
      }
      this.connection.projectId = null
      return
    }

    if (!this.connection.ws) {
      console.warn('Cannot unsubscribe: WebSocket instance not available')
      return
    }

    const message = {
      action: 'unsubscribe'
    }

    this.connection.ws.send(JSON.stringify(message))
    this.connection.projectId = null
    console.log('Unsubscribed from project updates')
  }

  disconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = null
    }

    if (USE_MOCK_API) {
      if (this.connection?.projectId) {
        stopProjectSimulation(this.connection.projectId)
        this.mockSimulationActive = false
      }
      this.connection = null
      console.log('Mock WebSocket disconnected')
      return
    }

    if (this.connection?.ws) {
      this.connection.ws.close(1000, 'Client disconnecting')
    }

    this.connection = null
    this.reconnectAttempts = 0
    console.log('WebSocket manually disconnected')
  }

  isConnected(): boolean {
    return this.connection?.isConnected || false
  }

  getCurrentProjectId(): string | null {
    return this.connection?.projectId || null
  }
}

// Export singleton instance
export const webSocketService = new WebSocketService()
export default webSocketService
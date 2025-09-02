import { simulateProjectProgress, stopProjectSimulation } from './mock';

export interface WebSocketMessage {
  type: 'task_update' | 'project_update' | 'agent_complete' | 'TASK_PROGRESS' | 'TASK_STARTED' | 'PROJECT_COMPLETED' | 'ping' | 'pong' | 'subscribe' | 'unsubscribe';
  projectId?: string;
  data?: any;
  timestamp?: string;
  taskId?: string;
  progress?: number;
  task?: any;
  project?: any;
  messageId?: string;
}

export interface WebSocketConnection {
  ws: WebSocket | null;
  isConnected: boolean;
  projectId: string | null;
  onMessage: (message: WebSocketMessage) => void;
  onError: (error: Event) => void;
  onClose: () => void;
  connectionId?: string;
  lastPingTime?: number;
  lastPongTime?: number;
}

interface ConnectionMetrics {
  connectTime: number;
  reconnectCount: number;
  messagesSent: number;
  messagesReceived: number;
  avgLatency: number;
  lastLatency: number;
}

// Check if we should use mock API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true';

/**
 * Enhanced WebSocket service with improved reliability and monitoring
 */
class EnhancedWebSocketService {
  private connection: WebSocketConnection | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectInterval = 3000;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingInterval: NodeJS.Timeout | null = null;
  private connectionTimeout: NodeJS.Timeout | null = null;
  private mockSimulationActive = false;
  private metrics: ConnectionMetrics = {
    connectTime: 0,
    reconnectCount: 0,
    messagesSent: 0,
    messagesReceived: 0,
    avgLatency: 0,
    lastLatency: 0,
  };
  private latencyHistory: number[] = [];
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'reconnecting' = 'disconnected';
  private connectionPromise: Promise<void> | null = null;
  private eventListeners: Map<string, ((data: any) => void)[]> = new Map();
  private messageQueue: WebSocketMessage[] = [];
  private maxQueueSize = 100;
  private lastEndpoint = '';

  /**
   * Connect with enhanced connection management
   */
  async connect(
    endpoint: string,
    onMessage: (message: WebSocketMessage) => void,
    onError: (error: Event) => void = () => {},
    onClose: () => void = () => {}
  ): Promise<void> {
    this.lastEndpoint = endpoint;

    // Return existing connection promise if already connecting
    if (this.connectionState === 'connecting' && this.connectionPromise) {
      return this.connectionPromise;
    }

    if (this.connection?.isConnected) {
      console.log('WebSocket already connected');
      return Promise.resolve();
    }

    this.connectionState = 'connecting';
    this.connectionPromise = this.establishConnection(endpoint, onMessage, onError, onClose);
    
    return this.connectionPromise;
  }

  private async establishConnection(
    endpoint: string,
    onMessage: (message: WebSocketMessage) => void,
    onError: (error: Event) => void,
    onClose: () => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      if (USE_MOCK_API) {
        this.setupMockConnection(onMessage, onError, onClose);
        resolve();
        return;
      }

      try {
        const ws = new WebSocket(endpoint);
        const connectionId = `conn-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const connectStartTime = Date.now();

        this.connection = {
          ws,
          isConnected: false,
          projectId: null,
          onMessage,
          onError,
          onClose,
          connectionId,
          lastPingTime: Date.now(),
        };

        // Connection timeout
        this.connectionTimeout = setTimeout(() => {
          if (!this.connection?.isConnected) {
            ws.close();
            reject(new Error('WebSocket connection timeout'));
          }
        }, 10000); // 10 second timeout

        ws.onopen = (event) => {
          if (this.connectionTimeout) {
            clearTimeout(this.connectionTimeout);
            this.connectionTimeout = null;
          }

          console.log('✅ WebSocket connected', { connectionId, endpoint });
          
          if (this.connection) {
            this.connection.isConnected = true;
            this.connectionState = 'connected';
            this.metrics.connectTime = Date.now() - connectStartTime;
            this.reconnectAttempts = 0;
            
            // Start heartbeat
            this.startHeartbeat();
            
            // Send queued messages
            this.sendQueuedMessages();
          }

          resolve();
        };

        ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        ws.onerror = (error) => {
          console.error('❌ WebSocket error:', error);
          this.metrics.reconnectCount++;
          onError(error);
          
          if (this.connectionState === 'connecting') {
            reject(new Error('WebSocket connection failed'));
          }
        };

        ws.onclose = (event) => {
          console.log('🔌 WebSocket disconnected', { 
            code: event.code, 
            reason: event.reason,
            wasClean: event.wasClean 
          });
          
          this.handleDisconnection(event.code !== 1000);
          onClose();
        };

      } catch (error) {
        console.error('Failed to create WebSocket connection:', error);
        reject(error);
      }
    });
  }

  private setupMockConnection(
    onMessage: (message: WebSocketMessage) => void,
    onError: (error: Event) => void,
    onClose: () => void
  ) {
    console.log('🔧 Using mock WebSocket connection');
    
    this.connection = {
      ws: null,
      isConnected: true,
      projectId: null,
      onMessage,
      onError,
      onClose,
      connectionId: `mock-${Date.now()}`,
    };
    
    this.connectionState = 'connected';
    this.metrics.connectTime = 0;
  }

  private handleMessage(event: MessageEvent) {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      message.timestamp = message.timestamp || new Date().toISOString();
      
      this.metrics.messagesReceived++;
      
      // Handle pong responses for latency calculation
      if (message.type === 'pong' && message.data?.pingTime) {
        const latency = Date.now() - message.data.pingTime;
        this.updateLatencyMetrics(latency);
        return;
      }

      console.log('📨 WebSocket message received:', message);
      
      // Emit to specific event listeners
      this.emitToListeners(message.type, message.data);
      
      // Call the main message handler
      this.connection?.onMessage(message);
      
    } catch (error) {
      console.error('❌ Error parsing WebSocket message:', error);
    }
  }

  private startHeartbeat() {
    // Clear existing interval
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
    }

    this.pingInterval = setInterval(() => {
      if (this.connection?.isConnected && this.connection.ws) {
        const pingTime = Date.now();
        this.sendMessage({
          type: 'ping',
          data: { pingTime },
          timestamp: new Date().toISOString(),
        });
        
        if (this.connection) {
          this.connection.lastPingTime = pingTime;
        }
      }
    }, 30000); // Ping every 30 seconds
  }

  private updateLatencyMetrics(latency: number) {
    this.metrics.lastLatency = latency;
    this.latencyHistory.push(latency);
    
    // Keep only last 10 latency measurements
    if (this.latencyHistory.length > 10) {
      this.latencyHistory.shift();
    }
    
    // Calculate average latency
    this.metrics.avgLatency = this.latencyHistory.reduce((a, b) => a + b, 0) / this.latencyHistory.length;
    
    console.log(`🏓 WebSocket latency: ${latency}ms (avg: ${this.metrics.avgLatency.toFixed(1)}ms)`);
  }

  private handleDisconnection(shouldReconnect: boolean) {
    this.stopHeartbeat();
    
    if (this.connection) {
      this.connection.isConnected = false;
    }
    
    this.connectionState = 'disconnected';
    this.connectionPromise = null;

    if (shouldReconnect && this.reconnectAttempts < this.maxReconnectAttempts) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    this.connectionState = 'reconnecting';
    const delay = Math.min(this.reconnectInterval * Math.pow(2, this.reconnectAttempts), 30000);
    
    console.log(`🔄 Scheduling WebSocket reconnection in ${delay}ms (attempt ${this.reconnectAttempts + 1}/${this.maxReconnectAttempts})`);
    
    this.reconnectTimer = setTimeout(async () => {
      this.reconnectAttempts++;
      
      if (this.connection) {
        try {
          await this.establishConnection(
            this.lastEndpoint,
            this.connection.onMessage,
            this.connection.onError,
            this.connection.onClose
          );
        } catch (error) {
          console.error('Reconnection failed:', error);
          this.handleDisconnection(true);
        }
      }
    }, delay);
  }

  private stopHeartbeat() {
    if (this.pingInterval) {
      clearInterval(this.pingInterval);
      this.pingInterval = null;
    }
  }

  /**
   * Send message with queuing support
   */
  sendMessage(message: WebSocketMessage): void {
    if (!message.messageId) {
      message.messageId = `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    }

    if (!this.connection?.isConnected || !this.connection.ws) {
      // Queue message for later delivery
      this.queueMessage(message);
      return;
    }

    try {
      this.connection.ws.send(JSON.stringify(message));
      this.metrics.messagesSent++;
      console.log('📤 WebSocket message sent:', message);
    } catch (error) {
      console.error('❌ Failed to send WebSocket message:', error);
      this.queueMessage(message);
    }
  }

  private queueMessage(message: WebSocketMessage) {
    if (this.messageQueue.length >= this.maxQueueSize) {
      // Remove oldest message
      this.messageQueue.shift();
      console.warn('⚠️ WebSocket message queue full, dropping oldest message');
    }
    
    this.messageQueue.push(message);
    console.log(`📥 Queued WebSocket message (queue size: ${this.messageQueue.length})`);
  }

  private sendQueuedMessages() {
    while (this.messageQueue.length > 0 && this.connection?.isConnected) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }

  /**
   * Event listener system
   */
  addEventListener(event: string, callback: (data: any) => void): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, []);
    }
    this.eventListeners.get(event)!.push(callback);
  }

  removeEventListener(event: string, callback: (data: any) => void): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      const index = listeners.indexOf(callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  private emitToListeners(event: string, data: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in WebSocket event listener for ${event}:`, error);
        }
      });
    }
  }

  /**
   * Project subscription with improved error handling
   */
  subscribe(projectId: string): void {
    this.sendMessage({
      type: 'subscribe',
      projectId,
      timestamp: new Date().toISOString(),
    });

    if (this.connection) {
      this.connection.projectId = projectId;
    }

    if (USE_MOCK_API) {
      simulateProjectProgress(projectId, (message: WebSocketMessage) => {
        this.connection?.onMessage(message);
      });
      this.mockSimulationActive = true;
    }
  }

  unsubscribe(): void {
    if (this.connection?.projectId) {
      this.sendMessage({
        type: 'unsubscribe',
        projectId: this.connection.projectId,
        timestamp: new Date().toISOString(),
      });

      if (USE_MOCK_API && this.mockSimulationActive) {
        stopProjectSimulation(this.connection.projectId);
        this.mockSimulationActive = false;
      }

      this.connection.projectId = null;
    }
  }

  /**
   * Clean disconnect with proper cleanup
   */
  disconnect(): void {
    console.log('🔌 Disconnecting WebSocket...');
    
    // Clear all timers
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    
    if (this.connectionTimeout) {
      clearTimeout(this.connectionTimeout);
      this.connectionTimeout = null;
    }
    
    this.stopHeartbeat();

    // Stop mock simulation
    if (USE_MOCK_API && this.connection?.projectId) {
      stopProjectSimulation(this.connection.projectId);
      this.mockSimulationActive = false;
    }

    // Close WebSocket connection
    if (this.connection?.ws && this.connection.isConnected) {
      this.connection.ws.close(1000, 'Client disconnecting');
    }

    this.connection = null;
    this.reconnectAttempts = 0;
    this.connectionState = 'disconnected';
    this.connectionPromise = null;
    this.messageQueue = [];
    
    console.log('✅ WebSocket disconnected');
  }

  /**
   * Get connection status and metrics
   */
  getStatus() {
    return {
      isConnected: this.connection?.isConnected || false,
      connectionState: this.connectionState,
      projectId: this.connection?.projectId || null,
      connectionId: this.connection?.connectionId || null,
      reconnectAttempts: this.reconnectAttempts,
      metrics: { ...this.metrics },
      queueSize: this.messageQueue.length,
      latencyHistory: [...this.latencyHistory],
    };
  }

  /**
   * Legacy compatibility methods
   */
  isConnected(): boolean {
    return this.connection?.isConnected || false;
  }

  getCurrentProjectId(): string | null {
    return this.connection?.projectId || null;
  }
}

// Export singleton instance with enhanced capabilities
export const webSocketService = new EnhancedWebSocketService();
export default webSocketService;
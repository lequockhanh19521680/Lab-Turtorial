import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api'

interface RetryConfig {
  maxRetries: number
  retryDelay: number
  retryStatuses: number[]
  exponentialBackoff: boolean
}

interface DLQEntry {
  endpoint: string
  method: string
  payload?: any
  headers?: any
  timestamp: string
  errorDetails: string
  attempt: number
}

class APIService {
  private api: AxiosInstance
  private retryConfig: RetryConfig
  private dlqEntries: DLQEntry[] = []

  constructor() {
    this.api = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    this.retryConfig = {
      maxRetries: 4,
      retryDelay: 1000, // 1 second base delay
      retryStatuses: [500, 502, 503, 504, 408, 429], // Server errors, timeouts, rate limits
      exponentialBackoff: true,
    }

    this.setupInterceptors()
  }

  private setupInterceptors() {
    // Request interceptor for auth tokens
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('authToken')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Response interceptor for error handling and retries
    this.api.interceptors.response.use(
      (response) => response,
      async (error) => {
        const config = error.config

        // Handle 401 unauthorized
        if (error.response?.status === 401) {
          localStorage.removeItem('authToken')
          window.location.href = '/login'
          return Promise.reject(error)
        }

        // Check if we should retry
        if (this.shouldRetry(error, config)) {
          return this.retryRequest(config, error)
        }

        return Promise.reject(error)
      }
    )
  }

  private shouldRetry(error: any, config: any): boolean {
    if (!config || config.__retryCount >= this.retryConfig.maxRetries) {
      return false
    }

    const status = error.response?.status
    return this.retryConfig.retryStatuses.includes(status)
  }

  private async retryRequest(config: any, _lastError: any): Promise<AxiosResponse> {
    config.__retryCount = config.__retryCount || 0
    config.__retryCount++

    const delay = this.calculateDelay(config.__retryCount)
    
    console.log(`Retrying request to ${config.url}, attempt ${config.__retryCount}/${this.retryConfig.maxRetries}`)
    
    await this.sleep(delay)

    try {
      return await this.api(config)
    } catch (error: any) {
      // If this was the last retry attempt, add to DLQ
      if (config.__retryCount >= this.retryConfig.maxRetries) {
        this.addToDLQ(config, error)
      }
      throw error
    }
  }

  private calculateDelay(attempt: number): number {
    if (this.retryConfig.exponentialBackoff) {
      return this.retryConfig.retryDelay * Math.pow(2, attempt - 1)
    }
    return this.retryConfig.retryDelay
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }

  private addToDLQ(config: any, error: any) {
    const dlqEntry: DLQEntry = {
      endpoint: config.url,
      method: config.method?.toUpperCase() || 'GET',
      payload: config.data,
      headers: config.headers,
      timestamp: new Date().toISOString(),
      errorDetails: error.message || 'Unknown error',
      attempt: config.__retryCount || 0,
    }

    this.dlqEntries.push(dlqEntry)
    console.error('Request added to Dead Letter Queue:', dlqEntry)

    // Trigger DLQ monitoring/alerting
    this.triggerDLQAlert(dlqEntry)
  }

  private triggerDLQAlert(entry: DLQEntry) {
    // In a real application, this would send alerts to monitoring systems
    console.warn(`🚨 DLQ Alert: Failed request to ${entry.endpoint} after ${entry.attempt} attempts`)
    
    // Could integrate with services like:
    // - Sentry for error tracking
    // - DataDog for monitoring
    // - Slack/Teams for notifications
    // - Custom webhook endpoints
    
    // For now, store in localStorage for debugging
    const existingDLQ = JSON.parse(localStorage.getItem('api_dlq') || '[]')
    existingDLQ.push(entry)
    localStorage.setItem('api_dlq', JSON.stringify(existingDLQ))
  }

  // Public methods for API calls
  async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.get(url, config)
  }

  async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.post(url, data, config)
  }

  async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.put(url, data, config)
  }

  async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.patch(url, data, config)
  }

  async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<T>> {
    return this.api.delete(url, config)
  }

  // DLQ management methods
  getDLQEntries(): DLQEntry[] {
    return [...this.dlqEntries]
  }

  clearDLQ(): void {
    this.dlqEntries = []
    localStorage.removeItem('api_dlq')
  }

  getDLQStats(): { count: number; lastEntry?: DLQEntry } {
    const count = this.dlqEntries.length
    const lastEntry = this.dlqEntries[this.dlqEntries.length - 1]
    return { count, lastEntry }
  }

  // Retry failed requests from DLQ
  async retryDLQEntry(entry: DLQEntry): Promise<boolean> {
    try {
      const config: AxiosRequestConfig = {
        url: entry.endpoint,
        method: entry.method as any,
        data: entry.payload,
        headers: entry.headers,
      }

      await this.api(config)
      console.log(`Successfully retried DLQ entry: ${entry.endpoint}`)
      return true
    } catch (error) {
      console.error(`Failed to retry DLQ entry: ${entry.endpoint}`, error)
      return false
    }
  }

  // Configuration methods
  updateRetryConfig(config: Partial<RetryConfig>): void {
    this.retryConfig = { ...this.retryConfig, ...config }
  }

  getRetryConfig(): RetryConfig {
    return { ...this.retryConfig }
  }
}

// Create singleton instance
const apiService = new APIService()

export default apiService
export { APIService, type DLQEntry, type RetryConfig }
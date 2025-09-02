// S3 Upload Utility for Lab Tutorial
// Organizes files using pattern: s3://<bucket-name>/<userId>/...

export interface S3UploadConfig {
  bucketName: string
  region: string
  accessKeyId?: string
  secretAccessKey?: string
}

export interface S3FileInfo {
  key: string
  url: string
  etag: string
  size: number
  contentType: string
  lastModified: Date
}

export interface UploadOptions {
  userId: string
  category: 'profile' | 'project' | 'artifact' | 'temp'
  projectId?: string
  metadata?: Record<string, string>
}

/**
 * Generate S3 key path organized by userId
 */
export const generateS3Key = (
  fileName: string, 
  options: UploadOptions
): string => {
  const { userId, category, projectId } = options
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
  const sanitizedFileName = fileName.replace(/[^a-zA-Z0-9.-]/g, '_')
  
  // Base path with userId
  let keyPath = `${userId}/${category}/`
  
  // Add project-specific path if provided
  if (projectId && (category === 'project' || category === 'artifact')) {
    keyPath += `${projectId}/`
  }
  
  // Add timestamp prefix to avoid naming conflicts
  keyPath += `${timestamp}_${sanitizedFileName}`
  
  return keyPath
}

/**
 * Mock S3 Upload Service for Development
 * In production, this would integrate with AWS SDK
 */
export class MockS3Service {
  private config: S3UploadConfig
  private mockStorage: Map<string, S3FileInfo> = new Map()

  constructor(config: S3UploadConfig) {
    this.config = config
  }

  /**
   * Upload file with userId-based organization
   */
  async uploadFile(
    file: File, 
    options: UploadOptions
  ): Promise<S3FileInfo> {
    const key = generateS3Key(file.name, options)
    const url = `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${key}`
    
    // Simulate upload delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    const fileInfo: S3FileInfo = {
      key,
      url,
      etag: `"${Math.random().toString(36).substring(2)}"`,
      size: file.size,
      contentType: file.type,
      lastModified: new Date()
    }
    
    // Store in mock storage
    this.mockStorage.set(key, fileInfo)
    
    return fileInfo
  }

  /**
   * Upload multiple files with progress tracking
   */
  async uploadFiles(
    files: File[], 
    options: UploadOptions,
    onProgress?: (progress: number, fileIndex: number) => void
  ): Promise<S3FileInfo[]> {
    const results: S3FileInfo[] = []
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Update progress
      if (onProgress) {
        onProgress(0, i)
      }
      
      try {
        const fileInfo = await this.uploadFile(file, options)
        results.push(fileInfo)
        
        // Final progress for this file
        if (onProgress) {
          onProgress(100, i)
        }
      } catch (error) {
        console.error(`Failed to upload file ${file.name}:`, error)
        throw error
      }
    }
    
    return results
  }

  /**
   * List files for a user/category
   */
  async listFiles(
    userId: string, 
    category?: string,
    projectId?: string
  ): Promise<S3FileInfo[]> {
    let prefix = `${userId}/`
    if (category) {
      prefix += `${category}/`
      if (projectId && (category === 'project' || category === 'artifact')) {
        prefix += `${projectId}/`
      }
    }
    
    const files: S3FileInfo[] = []
    for (const [key, fileInfo] of this.mockStorage) {
      if (key.startsWith(prefix)) {
        files.push(fileInfo)
      }
    }
    
    return files.sort((a, b) => b.lastModified.getTime() - a.lastModified.getTime())
  }

  /**
   * Delete a file
   */
  async deleteFile(key: string): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 500))
    this.mockStorage.delete(key)
  }

  /**
   * Get file URL (for downloads)
   */
  getFileUrl(key: string): string {
    return `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${key}`
  }

  /**
   * Generate presigned URL for secure uploads
   */
  async generatePresignedUrl(
    key: string, 
    expiresIn: number = 3600
  ): Promise<string> {
    // In production, this would generate a real presigned URL
    // For mock, return a mock URL with expiration
    const timestamp = Date.now() + (expiresIn * 1000)
    return `https://${this.config.bucketName}.s3.${this.config.region}.amazonaws.com/${key}?X-Amz-Expires=${expiresIn}&X-Amz-Timestamp=${timestamp}`
  }

  /**
   * Get storage statistics for a user
   */
  async getUserStorageStats(userId: string): Promise<{
    totalFiles: number
    totalSize: number
    sizeByCategory: Record<string, number>
  }> {
    const userFiles = await this.listFiles(userId)
    
    const stats = {
      totalFiles: userFiles.length,
      totalSize: userFiles.reduce((sum, file) => sum + file.size, 0),
      sizeByCategory: {} as Record<string, number>
    }
    
    // Calculate size by category
    for (const file of userFiles) {
      const category = file.key.split('/')[1] || 'unknown'
      stats.sizeByCategory[category] = (stats.sizeByCategory[category] || 0) + file.size
    }
    
    return stats
  }
}

// Default S3 service instance
export const s3Service = new MockS3Service({
  bucketName: process.env.VITE_S3_BUCKET_NAME || 'lab-tutorial-dev',
  region: process.env.VITE_AWS_REGION || 'us-east-1'
})

/**
 * Utility functions for file handling
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
}

export const getFileExtension = (filename: string): string => {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

export const isImageFile = (filename: string): boolean => {
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'webp', 'svg']
  const ext = getFileExtension(filename).toLowerCase()
  return imageExtensions.includes(ext)
}
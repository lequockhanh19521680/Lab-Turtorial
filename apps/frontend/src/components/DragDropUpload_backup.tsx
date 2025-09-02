import React, { useState, useCallback, useRef } from 'react'
import { Upload, X, File, Image, FileText, Code, Archive, AlertCircle, Check } from 'lucide-react'
import { Button } from '@/features/shared/components/ui/button'
import { Card } from '@/features/shared/components/ui/card'
import { Badge } from '@/features/shared/components/ui/badge'
import { Progress } from '@/features/shared/components/ui/progress'
import { s3Service, UploadOptions, S3FileInfo } from '../services/s3'
import { authService } from '../services/auth'

interface UploadedFile {
  id: string
  file: File
  progress: number
  status: 'uploading' | 'completed' | 'error'
  preview?: string
  s3Info?: S3FileInfo
}

interface DragDropUploadProps {
  onFilesUpload?: (files: File[], s3Files?: S3FileInfo[]) => void
  acceptedTypes?: string[]
  maxFileSize?: number // in MB
  maxFiles?: number
  className?: string
  showPreview?: boolean
  uploadOptions?: Omit<UploadOptions, 'userId'> // userId will be auto-filled from current user
}

const DragDropUpload: React.FC<DragDropUploadProps> = ({
  onFilesUpload,
  acceptedTypes = ['image/*', 'application/pdf', 'text/*', '.zip', '.rar'],
  maxFileSize = 10, // 10MB
  maxFiles = 5,
  className = '',
  showPreview = true,
  uploadOptions = { category: 'temp' }
}) => {
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([])
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const getFileIcon = (file: File) => {
    const type = file.type
    const name = file.name.toLowerCase()

    if (type.startsWith('image/')) return <Image className="h-8 w-8 text-blue-500" />
    if (type.startsWith('text/') || name.endsWith('.txt')) return <FileText className="h-8 w-8 text-green-500" />
    if (name.endsWith('.zip') || name.endsWith('.rar') || name.endsWith('.tar')) return <Archive className="h-8 w-8 text-purple-500" />
    if (name.endsWith('.js') || name.endsWith('.ts') || name.endsWith('.jsx') || name.endsWith('.tsx') || name.endsWith('.py') || name.endsWith('.java')) {
      return <Code className="h-8 w-8 text-orange-500" />
    }
    return <File className="h-8 w-8 text-gray-500" />
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const validateFile = (file: File): string | null => {
    // Check file size
    if (file.size > maxFileSize * 1024 * 1024) {
      return `File size must be less than ${maxFileSize}MB`
    }

    // Check file type
    const isValidType = acceptedTypes.some(type => {
      if (type.startsWith('.')) {
        return file.name.toLowerCase().endsWith(type)
      }
      return file.type.match(type)
    })

    if (!isValidType) {
      return `File type not supported. Accepted types: ${acceptedTypes.join(', ')}`
    }

    return null
  }

  const processFiles = useCallback(async (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    
    // Check max files limit
    if (uploadedFiles.length + fileArray.length > maxFiles) {
      setError(`Maximum ${maxFiles} files allowed`)
      return
    }

    setError(null)

    const validFiles: File[] = []
    const newUploadedFiles: UploadedFile[] = []

    for (const file of fileArray) {
      const validationError = validateFile(file)
      if (validationError) {
        setError(validationError)
        continue
      }

      validFiles.push(file)
      
      const uploadedFile: UploadedFile = {
        id: `${Date.now()}-${Math.random()}`,
        file,
        progress: 0,
        status: 'uploading'
      }

      // Generate preview for images
      if (file.type.startsWith('image/') && showPreview) {
        const reader = new FileReader()
        reader.onload = (e) => {
          uploadedFile.preview = e.target?.result as string
          setUploadedFiles(prev => prev.map(f => f.id === uploadedFile.id ? uploadedFile : f))
        }
        reader.readAsDataURL(file)
      }

      newUploadedFiles.push(uploadedFile)
    }

    setUploadedFiles(prev => [...prev, ...newUploadedFiles])

    // Upload files to S3 with userId organization
    const s3Files: S3FileInfo[] = []
    
    try {
      // Get current user
      const currentUser = await authService.getCurrentUser()
      if (!currentUser) {
        throw new Error('User not authenticated')
      }

      // Upload each file to S3
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i]
        const uploadedFile = newUploadedFiles[i]
        
        try {
          // Prepare upload options with userId
          const fullUploadOptions: UploadOptions = {
            ...uploadOptions,
            userId: currentUser.id
          }
          
          // Upload to S3
          const s3FileInfo = await s3Service.uploadFile(file, fullUploadOptions)
          s3Files.push(s3FileInfo)
          
          // Update file status
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'completed', progress: 100, s3Info: s3FileInfo }
              : f
          ))
        } catch (error) {
          console.error(`Failed to upload ${file.name}:`, error)
          setUploadedFiles(prev => prev.map(f => 
            f.id === uploadedFile.id 
              ? { ...f, status: 'error', progress: 0 }
              : f
          ))
        }
      }
    } catch (error) {
      console.error('Failed to upload files:', error)
      setError('Failed to upload files. Please try again.')
      
      // Mark all files as error
      setUploadedFiles(prev => prev.map(f => ({ ...f, status: 'error' as const })))
    }

    if (onFilesUpload && validFiles.length > 0) {
      onFilesUpload(validFiles, s3Files.length > 0 ? s3Files : undefined)
    }
  }, [uploadedFiles.length, maxFiles, maxFileSize, acceptedTypes, onFilesUpload, showPreview, uploadOptions])
    for (const uploadedFile of newUploadedFiles) {
      simulateUpload(uploadedFile.id)
    }

    if (onFilesUpload && validFiles.length > 0) {
      onFilesUpload(validFiles)
    }
  }, [uploadedFiles.length, maxFiles, maxFileSize, acceptedTypes, onFilesUpload, showPreview])

  const simulateUpload = (fileId: string) => {
    const interval = setInterval(() => {
      setUploadedFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          const newProgress = Math.min(file.progress + Math.random() * 30, 100)
          const status = newProgress >= 100 ? 'completed' : 'uploading'
          return { ...file, progress: newProgress, status }
        }
        return file
      }))
    }, 200)

    setTimeout(() => {
      clearInterval(interval)
      setUploadedFiles(prev => prev.map(file => {
        if (file.id === fileId) {
          return { ...file, progress: 100, status: 'completed' }
        }
        return file
      }))
    }, 2000 + Math.random() * 2000)
  }

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== fileId))
  }

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.currentTarget === e.target) {
      setIsDragging(false)
    }
  }, [])

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
  }, [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    if (files?.length > 0) {
      processFiles(files)
    }
  }, [processFiles])

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files?.length > 0) {
      processFiles(files)
    }
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleClick = () => {
    fileInputRef.current?.click()
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Drop Zone */}
      <Card
        className={`relative border-2 border-dashed transition-all duration-200 cursor-pointer ${
          isDragging
            ? 'border-primary bg-primary/5 scale-105'
            : 'border-muted-foreground/25 hover:border-primary/50 hover:bg-muted/50'
        }`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        <div className="p-8 text-center">
          <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 transition-all duration-200 ${
            isDragging ? 'bg-primary text-white' : 'bg-muted text-muted-foreground'
          }`}>
            <Upload className="h-8 w-8" />
          </div>
          
          <h3 className="text-lg font-semibold mb-2">
            {isDragging ? 'Drop files here' : 'Upload files'}
          </h3>
          
          <p className="text-muted-foreground mb-4">
            Drag and drop files here, or{' '}
            <span className="text-primary font-medium">click to browse</span>
          </p>
          
          <div className="text-sm text-muted-foreground space-y-1">
            <p>Supported formats: {acceptedTypes.join(', ')}</p>
            <p>Maximum file size: {maxFileSize}MB</p>
            <p>Maximum {maxFiles} files</p>
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept={acceptedTypes.join(',')}
          onChange={handleFileSelect}
          className="hidden"
        />
      </Card>

      {/* Error Message */}
      {error && (
        <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
          <AlertCircle className="h-5 w-5 flex-shrink-0" />
          <span className="text-sm">{error}</span>
        </div>
      )}

      {/* Uploaded Files List */}
      {uploadedFiles.length > 0 && (
        <Card className="p-4">
          <h4 className="font-semibold mb-4 flex items-center space-x-2">
            <File className="h-5 w-5" />
            <span>Uploaded Files ({uploadedFiles.length})</span>
          </h4>
          
          <div className="space-y-3">
            {uploadedFiles.map((uploadedFile) => (
              <div
                key={uploadedFile.id}
                className="flex items-center space-x-4 p-3 bg-muted/30 rounded-lg border border-border"
              >
                {/* File Icon/Preview */}
                <div className="flex-shrink-0">
                  {uploadedFile.preview ? (
                    <img
                      src={uploadedFile.preview}
                      alt={uploadedFile.file.name}
                      className="w-12 h-12 object-cover rounded-lg"
                    />
                  ) : (
                    <div className="w-12 h-12 flex items-center justify-center">
                      {getFileIcon(uploadedFile.file)}
                    </div>
                  )}
                </div>

                {/* File Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">
                    {uploadedFile.file.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(uploadedFile.file.size)}
                  </p>
                  
                  {/* Progress Bar */}
                  {uploadedFile.status === 'uploading' && (
                    <div className="mt-2">
                      <Progress 
                        value={uploadedFile.progress} 
                        className="h-2"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {Math.round(uploadedFile.progress)}% uploaded
                      </p>
                    </div>
                  )}
                </div>

                {/* Status Badge */}
                <div className="flex items-center space-x-2">
                  {uploadedFile.status === 'completed' && (
                    <Badge className="bg-green-100 text-green-700">
                      <Check className="h-3 w-3 mr-1" />
                      Complete
                    </Badge>
                  )}
                  {uploadedFile.status === 'uploading' && (
                    <Badge className="bg-blue-100 text-blue-700 animate-pulse">
                      Uploading...
                    </Badge>
                  )}
                  {uploadedFile.status === 'error' && (
                    <Badge className="bg-red-100 text-red-700">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Error
                    </Badge>
                  )}
                </div>

                {/* Remove Button */}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    removeFile(uploadedFile.id)
                  }}
                  className="p-1 h-8 w-8 text-muted-foreground hover:text-red-600"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>

          {/* Clear All Button */}
          {uploadedFiles.length > 0 && (
            <div className="flex justify-end mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setUploadedFiles([])}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                Clear All
              </Button>
            </div>
          )}
        </Card>
      )}
    </div>
  )
}

export default DragDropUpload
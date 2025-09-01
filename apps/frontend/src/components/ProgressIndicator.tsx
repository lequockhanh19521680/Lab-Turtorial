import React from 'react'
import { Clock, CheckCircle, AlertCircle } from 'lucide-react'

interface ProgressIndicatorProps {
  status: string
  progress: number
  currentTask?: string
  estimatedCompletion?: string
}

const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
  status,
  progress,
  currentTask,
  estimatedCompletion
}) => {
  const getStatusIcon = () => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'FAILED':
        return <AlertCircle className="h-6 w-6 text-red-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-6 w-6 text-blue-500 animate-pulse" />
      default:
        return <Clock className="h-6 w-6 text-gray-400" />
    }
  }

  const getProgressBarColor = () => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500'
      case 'FAILED':
        return 'bg-red-500'
      case 'IN_PROGRESS':
        return 'bg-blue-500'
      default:
        return 'bg-gray-300'
    }
  }

  const getStatusMessage = () => {
    switch (status) {
      case 'COMPLETED':
        return 'Project completed successfully!'
      case 'FAILED':
        return 'Project build failed. Please check the logs.'
      case 'IN_PROGRESS':
        return currentTask || 'Building your application...'
      default:
        return 'Waiting to start...'
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {getStatusIcon()}
          <div>
            <h3 className="text-lg font-medium text-gray-900">
              {status === 'COMPLETED' ? 'Build Complete' : 
               status === 'FAILED' ? 'Build Failed' :
               status === 'IN_PROGRESS' ? 'Building...' : 'Pending'}
            </h3>
            <p className="text-sm text-gray-600">
              {getStatusMessage()}
            </p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-semibold text-gray-900">
            {Math.round(progress)}%
          </div>
          {estimatedCompletion && status === 'IN_PROGRESS' && (
            <div className="text-sm text-gray-500">
              ETA: {estimatedCompletion}
            </div>
          )}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-500 ease-out ${getProgressBarColor()}`}
          style={{ width: `${Math.min(progress, 100)}%` }}
        />
      </div>

      {/* Status Details */}
      {status === 'IN_PROGRESS' && (
        <div className="bg-blue-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
            <span className="text-sm font-medium text-blue-900">
              AI Agents are working on your project
            </span>
          </div>
          <p className="text-sm text-blue-700 mt-1">
            This process typically takes 5-30 minutes depending on project complexity.
          </p>
        </div>
      )}

      {status === 'COMPLETED' && (
        <div className="bg-green-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-4 w-4 text-green-600" />
            <span className="text-sm font-medium text-green-900">
              Your application is ready!
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            You can now view your live application and download the source code.
          </p>
        </div>
      )}

      {status === 'FAILED' && (
        <div className="bg-red-50 rounded-lg p-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <span className="text-sm font-medium text-red-900">
              Build failed
            </span>
          </div>
          <p className="text-sm text-red-700 mt-1">
            There was an issue building your application. You can retry or contact support.
          </p>
        </div>
      )}
    </div>
  )
}

export default ProgressIndicator
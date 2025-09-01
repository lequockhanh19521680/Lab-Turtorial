import React from 'react'
import { Task } from '../store/slices/projectsSlice'
import { CheckCircle, Clock, AlertCircle, XCircle, User } from 'lucide-react'

interface TaskListProps {
  tasks: Task[]
}

const TaskList: React.FC<TaskListProps> = ({ tasks }) => {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'DONE':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-500 animate-pulse" />
      case 'PENDING_APPROVAL':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-50 border-green-200'
      case 'FAILED':
        return 'bg-red-50 border-red-200'
      case 'IN_PROGRESS':
        return 'bg-blue-50 border-blue-200'
      case 'PENDING_APPROVAL':
        return 'bg-yellow-50 border-yellow-200'
      default:
        return 'bg-gray-50 border-gray-200'
    }
  }

  const getProgressBarColor = (status: string) => {
    switch (status) {
      case 'DONE':
        return 'bg-green-500'
      case 'FAILED':
        return 'bg-red-500'
      case 'IN_PROGRESS':
        return 'bg-blue-500'
      case 'PENDING_APPROVAL':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-300'
    }
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="mx-auto h-8 w-8 text-gray-400" />
        <p className="mt-2 text-sm text-gray-500">No tasks yet</p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task, index) => (
        <div
          key={task.taskId}
          className={`border rounded-lg p-4 ${getStatusColor(task.status)}`}
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3 flex-1">
              <div className="flex-shrink-0 mt-1">
                {getStatusIcon(task.status)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2">
                  <h4 className="text-sm font-medium text-gray-900">
                    {task.description || `Task ${index + 1}`}
                  </h4>
                  <span className="text-xs text-gray-500">
                    {task.assignedAgent}
                  </span>
                </div>
                
                {task.status === 'IN_PROGRESS' && task.progress !== undefined && (
                  <div className="mt-2">
                    <div className="flex items-center justify-between text-xs text-gray-600 mb-1">
                      <span>Progress</span>
                      <span>{task.progress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-1.5">
                      <div
                        className={`h-1.5 rounded-full ${getProgressBarColor(task.status)} transition-all duration-300`}
                        style={{ width: `${task.progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {task.dependencies.length > 0 && (
                  <div className="mt-2">
                    <span className="text-xs text-gray-500">
                      Depends on: {task.dependencies.length} task(s)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center space-x-2 ml-4">
              <div className="flex items-center space-x-1 text-xs text-gray-500">
                <User className="h-3 w-3" />
                <span>{task.assignedAgent.replace('Agent', '')}</span>
              </div>
            </div>
          </div>

          {(task.startedAt || task.completedAt) && (
            <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">
              {task.startedAt && (
                <div>Started: {new Date(task.startedAt).toLocaleString()}</div>
              )}
              {task.completedAt && (
                <div>Completed: {new Date(task.completedAt).toLocaleString()}</div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}

export default TaskList
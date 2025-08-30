import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { setCurrentProject } from '../store/slices/projectsSlice'
import { projectsApi } from '../services/projects'
import webSocketService, { WebSocketMessage } from '../services/websocket'
import TaskList from '../components/TaskList'
import ArtifactList from '../components/ArtifactList'
import ProgressIndicator from '../components/ProgressIndicator'
import { 
  ArrowLeft, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  ExternalLink,
  Download,
  RefreshCw,
  Wifi,
  WifiOff,
  PlayCircle,
  FileText
} from 'lucide-react'
import { format } from 'date-fns'
import type { Task, Artifact } from '../store/slices/projectsSlice'

// Pending Approval Section Component
interface PendingApprovalSectionProps {
  projectId: string
  tasks: Task[]
  artifacts: Artifact[]
  onApprove: () => void
}

const PendingApprovalSection: React.FC<PendingApprovalSectionProps> = ({ 
  projectId, 
  tasks, 
  artifacts, 
  onApprove 
}) => {
  const [isApproving, setIsApproving] = useState(false)
  const [feedback, setFeedback] = useState('')
  
  const pendingTasks = tasks.filter(task => task.status === 'PENDING_APPROVAL')
  
  if (pendingTasks.length === 0) return null
  
  const currentPendingTask = pendingTasks[0] // Assuming one pending task at a time
  
  // Get artifacts related to this task
  const taskArtifacts = artifacts.filter(artifact => 
    artifact.artifactId === currentPendingTask.outputArtifactId
  )
  
  const handleApprove = async () => {
    setIsApproving(true)
    try {
      await projectsApi.resumeExecution(projectId, {
        taskId: currentPendingTask.taskId,
        feedback: feedback.trim() || undefined
      })
      onApprove()
      setFeedback('')
    } catch (error) {
      console.error('Error approving task:', error)
      // Could add toast notification here
    } finally {
      setIsApproving(false)
    }
  }
  
  return (
    <div className="card border-2 border-blue-200 bg-blue-50">
      <div className="flex items-center space-x-3 mb-4">
        <div className="flex-shrink-0">
          <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
            <Clock className="h-4 w-4 text-white" />
          </div>
        </div>
        <div>
          <h3 className="text-lg font-medium text-gray-900">Task Awaiting Approval</h3>
          <p className="text-sm text-gray-600">
            {currentPendingTask.assignedAgent} has completed their work and is waiting for your approval to continue.
          </p>
        </div>
      </div>
      
      {/* Task Details */}
      <div className="bg-white rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h4 className="font-medium text-gray-900">{currentPendingTask.assignedAgent}</h4>
          <span className="px-2 py-1 text-xs font-medium bg-yellow-100 text-yellow-800 rounded-full">
            Pending Approval
          </span>
        </div>
        
        {currentPendingTask.description && (
          <p className="text-sm text-gray-600 mb-3">{currentPendingTask.description}</p>
        )}
        
        {/* Show artifacts if available */}
        {taskArtifacts.length > 0 && (
          <div className="mb-4">
            <h5 className="text-sm font-medium text-gray-700 mb-2">Generated Artifacts:</h5>
            <div className="space-y-2">
              {taskArtifacts.map((artifact) => (
                <div key={artifact.artifactId} className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
                  <FileText className="h-4 w-4 text-gray-400" />
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">{artifact.title || artifact.artifactType}</p>
                    {artifact.description && (
                      <p className="text-xs text-gray-500">{artifact.description}</p>
                    )}
                  </div>
                  <a 
                    href={artifact.location} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm"
                  >
                    View
                  </a>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
      
      {/* Optional Feedback */}
      <div className="mb-4">
        <label htmlFor="feedback" className="block text-sm font-medium text-gray-700 mb-2">
          Feedback (Optional)
        </label>
        <textarea
          id="feedback"
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          placeholder="Provide any feedback or comments for the agent..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          rows={3}
        />
      </div>
      
      {/* Action Buttons */}
      <div className="flex space-x-3">
        <button
          onClick={handleApprove}
          disabled={isApproving}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <PlayCircle className="h-4 w-4" />
          <span>{isApproving ? 'Approving...' : 'Approve & Continue'}</span>
        </button>
        
        {/* Future: Add "Request Changes" button */}
        <button
          disabled={isApproving}
          className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Request Changes (Coming Soon)
        </button>
      </div>
    </div>
  )
}

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)

  // Get project data with reduced polling since WebSocket will provide updates
  const { data: project, isLoading, error, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getProject(id!),
    enabled: !!id,
    refetchInterval: (data) => {
      // Only poll occasionally as fallback when not using WebSocket
      return isWebSocketConnected ? 30000 : (data?.status === 'IN_PROGRESS' ? 10000 : false)
    }
  })

  const { data: tasks } = useQuery({
    queryKey: ['project-tasks', id],
    queryFn: () => projectsApi.getProjectTasks(id!),
    enabled: !!id,
    refetchInterval: isWebSocketConnected ? false : 10000 // Disable polling when WebSocket is active
  })

  const { data: artifacts } = useQuery({
    queryKey: ['project-artifacts', id],
    queryFn: () => projectsApi.getProjectArtifacts(id!),
    enabled: !!id,
    refetchInterval: isWebSocketConnected ? false : 15000 // Disable polling when WebSocket is active
  })

  const { data: status } = useQuery({
    queryKey: ['project-status', id],
    queryFn: () => projectsApi.getProjectStatus(id!),
    enabled: !!id,
    refetchInterval: isWebSocketConnected ? false : 5000 // Disable polling when WebSocket is active
  })

  useEffect(() => {
    if (project) {
      dispatch(setCurrentProject(project))
    }
  }, [project, dispatch])

  // WebSocket connection setup
  useEffect(() => {
    if (!id) return

    const wsEndpoint = import.meta.env.VITE_WEBSOCKET_ENDPOINT || 'wss://localhost:3001'
    
    const handleMessage = (message: WebSocketMessage) => {
      console.log('WebSocket message received:', message)
      
      // Invalidate and refetch relevant queries based on message type
      if (message.type === 'task_update') {
        queryClient.invalidateQueries({ queryKey: ['project-tasks', id] })
        queryClient.invalidateQueries({ queryKey: ['project-status', id] })
      } else if (message.type === 'project_update') {
        queryClient.invalidateQueries({ queryKey: ['project', id] })
        queryClient.invalidateQueries({ queryKey: ['project-status', id] })
        queryClient.invalidateQueries({ queryKey: ['project-artifacts', id] })
      }
    }

    const handleError = (error: Event) => {
      console.error('WebSocket error:', error)
      setIsWebSocketConnected(false)
    }

    const handleClose = () => {
      console.log('WebSocket disconnected')
      setIsWebSocketConnected(false)
    }

    // Connect to WebSocket
    webSocketService.connect(wsEndpoint, handleMessage, handleError, handleClose)
    
    // Subscribe to project updates
    if (webSocketService.isConnected()) {
      webSocketService.subscribe(id)
      setIsWebSocketConnected(true)
    }

    // Cleanup on unmount
    return () => {
      webSocketService.unsubscribe()
      webSocketService.disconnect()
      setIsWebSocketConnected(false)
    }
  }, [id, queryClient])

  // Monitor WebSocket connection status
  useEffect(() => {
    const checkConnection = () => {
      setIsWebSocketConnected(webSocketService.isConnected())
    }

    const interval = setInterval(checkConnection, 1000)
    return () => clearInterval(interval)
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-6 w-6 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-6 w-6 text-red-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-6 w-6 text-blue-500 animate-pulse" />
      default:
        return <AlertCircle className="h-6 w-6 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-800'
      case 'FAILED':
        return 'bg-red-100 text-red-800'
      case 'IN_PROGRESS':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-yellow-100 text-yellow-800'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error || !project) {
    return (
      <div className="text-center py-12">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Project not found</h3>
        <p className="mt-1 text-sm text-gray-500">
          The project you're looking for doesn't exist or has been deleted.
        </p>
        <div className="mt-6">
          <Link to="/" className="btn-primary">
            Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link
            to="/"
            className="p-2 rounded-md hover:bg-gray-100 transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{project.projectName}</h1>
            <p className="text-gray-600">{project.requestPrompt}</p>
          </div>
        </div>
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2">
            {isWebSocketConnected ? (
              <div className="flex items-center text-green-600">
                <Wifi className="h-4 w-4" />
                <span className="text-sm">Live</span>
              </div>
            ) : (
              <div className="flex items-center text-gray-400">
                <WifiOff className="h-4 w-4" />
                <span className="text-sm">Polling</span>
              </div>
            )}
          </div>
          <button
            onClick={() => refetch()}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          <div className="flex items-center space-x-2">
            {getStatusIcon(project.status)}
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
              {project.status.replace('_', ' ')}
            </span>
          </div>
        </div>
      </div>

      {/* Progress Overview */}
      {status && (
        <div className="card">
          <ProgressIndicator 
            status={status.status}
            progress={status.progress}
            currentTask={status.currentTask}
            estimatedCompletion={status.estimatedCompletion}
          />
        </div>
      )}

      {/* Pending Approval Section */}
      {tasks?.some(task => task.status === 'PENDING_APPROVAL') && (
        <PendingApprovalSection 
          projectId={id!}
          tasks={tasks}
          artifacts={artifacts || []}
          onApprove={() => {
            // Refresh data after approval
            queryClient.invalidateQueries({ queryKey: ['project', id] })
            queryClient.invalidateQueries({ queryKey: ['project-tasks', id] })
            queryClient.invalidateQueries({ queryKey: ['project-status', id] })
          }}
        />
      )}

      {/* Project Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Tasks */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Tasks</h2>
              <span className="text-sm text-gray-500">
                {tasks?.filter(t => t.status === 'DONE').length || 0} of {tasks?.length || 0} completed
              </span>
            </div>
            <TaskList tasks={tasks || []} />
          </div>

          {/* Artifacts */}
          <div className="card">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-medium text-gray-900">Generated Artifacts</h2>
              <span className="text-sm text-gray-500">
                {artifacts?.length || 0} items
              </span>
            </div>
            <ArtifactList artifacts={artifacts || []} />
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Project Details */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Project Details</h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-gray-500">Created</dt>
                <dd className="text-sm text-gray-900">
                  {format(new Date(project.createdAt), 'PPpp')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Last Updated</dt>
                <dd className="text-sm text-gray-900">
                  {format(new Date(project.updatedAt), 'PPpp')}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Project ID</dt>
                <dd className="text-sm text-gray-900 font-mono">
                  {project.projectId}
                </dd>
              </div>
            </dl>
          </div>

          {/* Quick Actions */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              {project.status === 'COMPLETED' && (
                <button className="w-full btn-primary flex items-center justify-center space-x-2">
                  <ExternalLink className="h-4 w-4" />
                  <span>View Live App</span>
                </button>
              )}
              
              <button className="w-full btn-secondary flex items-center justify-center space-x-2">
                <Download className="h-4 w-4" />
                <span>Download Source</span>
              </button>
              
              {project.status === 'FAILED' && (
                <button className="w-full btn-primary flex items-center justify-center space-x-2">
                  <RefreshCw className="h-4 w-4" />
                  <span>Retry Build</span>
                </button>
              )}
            </div>
          </div>

          {/* AI Agents Status */}
          <div className="card">
            <h3 className="text-lg font-medium text-gray-900 mb-4">AI Agents</h3>
            <div className="space-y-3">
              {[
                { name: 'Orchestrator', status: 'completed' },
                { name: 'Product Manager', status: 'completed' },
                { name: 'Frontend Engineer', status: project.status === 'IN_PROGRESS' ? 'in-progress' : 'completed' },
                { name: 'Backend Engineer', status: project.status === 'PENDING' ? 'pending' : 'completed' },
                { name: 'DevOps Engineer', status: 'pending' },
              ].map((agent, index) => (
                <div key={index} className="flex items-center justify-between">
                  <span className="text-sm text-gray-900">{agent.name}</span>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    agent.status === 'completed' ? 'bg-green-100 text-green-800' :
                    agent.status === 'in-progress' ? 'bg-blue-100 text-blue-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {agent.status === 'in-progress' ? 'Working...' : agent.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProjectDetail
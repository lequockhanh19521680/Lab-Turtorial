import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { setCurrentProject } from '../store/slices/projectsSlice'
import { projectsApi } from '../services/projects'
import webSocketService, { WebSocketMessage } from '../services/websocket'
import ActivityLog from '../components/ActivityLog'
import ProjectTimeline from '../components/ProjectTimeline'
import FeedbackModal from '../components/FeedbackModal'
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
  Calendar,
  Hash,
  Zap
} from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch()
  const queryClient = useQueryClient()
  const [isWebSocketConnected, setIsWebSocketConnected] = useState(false)
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [selectedStepId, setSelectedStepId] = useState<string>('')
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)

  const { data: project, isLoading, error, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getProject(id!),
    enabled: !!id,
  })

  const { data: tasks } = useQuery({
    queryKey: ['project-tasks', id],
    queryFn: () => projectsApi.getProjectTasks(id!),
    enabled: !!id,
  })

  const { data: artifacts } = useQuery({
    queryKey: ['project-artifacts', id],
    queryFn: () => projectsApi.getProjectArtifacts(id!),
    enabled: !!id,
  })

  const { data: status } = useQuery({
    queryKey: ['project-status', id],
    queryFn: () => projectsApi.getProjectStatus(id!),
    enabled: !!id,
    refetchInterval: isWebSocketConnected ? false : 5000
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

    webSocketService.connect(wsEndpoint, handleMessage, handleError, handleClose)
    
    if (webSocketService.isConnected()) {
      webSocketService.subscribe(id)
      setIsWebSocketConnected(true)
    }

    return () => {
      webSocketService.unsubscribe()
      webSocketService.disconnect()
      setIsWebSocketConnected(false)
    }
  }, [id, queryClient])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="info">In Progress</Badge>
      default:
        return <Badge variant="warning">Pending</Badge>
    }
  }

  const handleApprove = async () => {
    if (!id) return
    
    try {
      // Find the pending task for this step
      const pendingTask = tasks?.find(task => task.status === 'PENDING_APPROVAL')
      if (pendingTask) {
        await projectsApi.resumeExecution(id, {
          taskId: pendingTask.taskId,
        })
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['project', id] })
        queryClient.invalidateQueries({ queryKey: ['project-tasks', id] })
        queryClient.invalidateQueries({ queryKey: ['project-status', id] })
      }
    } catch (error) {
      console.error('Error approving step:', error)
    }
  }

  const handleRequestChanges = (stepId: string) => {
    setSelectedStepId(stepId)
    setFeedbackModalOpen(true)
  }

  const handleSubmitFeedback = async (feedback: string) => {
    if (!id || !selectedStepId) return
    
    setIsSubmittingFeedback(true)
    try {
      // Find the pending task for this step
      const pendingTask = tasks?.find(task => task.status === 'PENDING_APPROVAL')
      if (pendingTask) {
        await projectsApi.resumeExecution(id, {
          taskId: pendingTask.taskId,
          feedback: feedback
        })
        
        // Refresh data
        queryClient.invalidateQueries({ queryKey: ['project', id] })
        queryClient.invalidateQueries({ queryKey: ['project-tasks', id] })
        queryClient.invalidateQueries({ queryKey: ['project-status', id] })
      }
      
      setFeedbackModalOpen(false)
      setSelectedStepId('')
    } catch (error) {
      console.error('Error submitting feedback:', error)
    } finally {
      setIsSubmittingFeedback(false)
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
          <Button asChild>
            <Link to="/">Back to Dashboard</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="icon" asChild>
            <Link to="/">
              <ArrowLeft className="h-5 w-5" />
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{project.projectName}</h1>
            <p className="text-gray-600 mt-1">{project.requestPrompt}</p>
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
          <Button variant="outline" onClick={() => refetch()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <div className="flex items-center space-x-2">
            {getStatusIcon(project.status)}
            {getStatusBadge(project.status)}
          </div>
        </div>
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column - Project Summary */}
        <div className="lg:col-span-3 space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Zap className="h-5 w-5 text-primary-600" />
                <span>Project Overview</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Calendar className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Created</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(project.createdAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Clock className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Last Updated</p>
                  <p className="text-sm text-gray-500">
                    {format(new Date(project.updatedAt), 'MMM d, yyyy')}
                  </p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Hash className="h-4 w-4 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">Project ID</p>
                  <p className="text-sm text-gray-500 font-mono">
                    {project.projectId}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {project.status === 'COMPLETED' && (
                <Button className="w-full" variant="default">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Live App
                </Button>
              )}
              
              <Button className="w-full" variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Download Source
              </Button>
              
              {project.status === 'FAILED' && (
                <Button className="w-full" variant="default">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Retry Build
                </Button>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Progress Stats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Tasks Completed</span>
                  <span className="font-medium">
                    {tasks?.filter(t => t.status === 'DONE').length || 0} / {tasks?.length || 0}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Artifacts Generated</span>
                  <span className="font-medium">{artifacts?.length || 0}</span>
                </div>
                {status && (
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Overall Progress</span>
                    <span className="font-medium">{Math.round(status.progress)}%</span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Middle Column - Timeline */}
        <div className="lg:col-span-6">
          <ProjectTimeline
            projectStatus={project.status}
            onApprove={() => handleApprove()}
            onRequestChanges={handleRequestChanges}
          />
        </div>

        {/* Right Column - Activity Log */}
        <div className="lg:col-span-3">
          <ActivityLog projectId={id!} />
        </div>
      </div>

      {/* Feedback Modal */}
      <FeedbackModal
        open={feedbackModalOpen}
        onOpenChange={setFeedbackModalOpen}
        onSubmit={handleSubmitFeedback}
        isLoading={isSubmittingFeedback}
        stepTitle={selectedStepId}
        agentName="AI Agent"
      />
    </div>
  )
}

export default ProjectDetail
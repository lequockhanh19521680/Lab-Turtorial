import React, { useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
// import { useSelector } from 'react-redux'
// import { RootState } from '../store'
import { setCurrentProject } from '../store/slices/projectsSlice'
import { projectsApi } from '../services/projects'
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
  RefreshCw
} from 'lucide-react'
import { format } from 'date-fns'

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch()
  // const { currentProject } = useSelector((state: RootState) => state.projects)

  const { data: project, isLoading, error, refetch } = useQuery({
    queryKey: ['project', id],
    queryFn: () => projectsApi.getProject(id!),
    enabled: !!id,
    refetchInterval: (data) => {
      // Refetch every 5 seconds if project is in progress
      return data?.status === 'IN_PROGRESS' ? 5000 : false
    }
  })

  const { data: tasks } = useQuery({
    queryKey: ['project-tasks', id],
    queryFn: () => projectsApi.getProjectTasks(id!),
    enabled: !!id,
    refetchInterval: 5000 // Refetch tasks every 5 seconds
  })

  const { data: artifacts } = useQuery({
    queryKey: ['project-artifacts', id],
    queryFn: () => projectsApi.getProjectArtifacts(id!),
    enabled: !!id,
    refetchInterval: 10000 // Refetch artifacts every 10 seconds
  })

  const { data: status } = useQuery({
    queryKey: ['project-status', id],
    queryFn: () => projectsApi.getProjectStatus(id!),
    enabled: !!id,
    refetchInterval: 3000 // Refetch status every 3 seconds
  })

  useEffect(() => {
    if (project) {
      dispatch(setCurrentProject(project))
    }
  }, [project, dispatch])

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
import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { RootState } from '../store'
import { projectsApi } from '../services/projects'
import { Plus, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react'
import { format } from 'date-fns'

const Dashboard: React.FC = () => {
  const { projects } = useSelector((state: RootState) => state.projects)
  
  const { data: projectsData, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-5 w-5 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'status-completed'
      case 'FAILED':
        return 'status-failed'
      case 'IN_PROGRESS':
        return 'status-in-progress'
      default:
        return 'status-pending'
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <XCircle className="mx-auto h-12 w-12 text-red-500" />
        <h3 className="mt-2 text-sm font-medium text-gray-900">Error loading projects</h3>
        <p className="mt-1 text-sm text-gray-500">Please try again later.</p>
      </div>
    )
  }

  const displayProjects = projectsData || projects

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Manage your AI-generated projects</p>
        </div>
        <Link
          to="/create"
          className="btn-primary flex items-center space-x-2"
        >
          <Plus className="h-5 w-5" />
          <span>New Project</span>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 bg-primary-100 rounded-md">
                <CheckCircle className="h-5 w-5 text-primary-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayProjects.filter(p => p.status === 'COMPLETED').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 bg-blue-100 rounded-md">
                <Clock className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">In Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayProjects.filter(p => p.status === 'IN_PROGRESS').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 bg-yellow-100 rounded-md">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Pending</p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayProjects.filter(p => p.status === 'PENDING').length}
              </p>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="flex items-center justify-center h-8 w-8 bg-gray-100 rounded-md">
                <Plus className="h-5 w-5 text-gray-600" />
              </div>
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total</p>
              <p className="text-2xl font-semibold text-gray-900">
                {displayProjects.length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Projects List */}
      <div className="card">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-medium text-gray-900">Recent Projects</h2>
          <Link to="/projects" className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View all
          </Link>
        </div>

        {displayProjects.length === 0 ? (
          <div className="text-center py-12">
            <Plus className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
            <p className="mt-1 text-sm text-gray-500">
              Get started by creating your first AI-powered application.
            </p>
            <div className="mt-6">
              <Link to="/create" className="btn-primary">
                Create Project
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {displayProjects.slice(0, 10).map((project) => (
              <div key={project.projectId} className="border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <Link 
                      to={`/project/${project.projectId}`}
                      className="block focus:outline-none focus:ring-2 focus:ring-primary-500 rounded"
                    >
                      <div className="flex items-center space-x-3">
                        {getStatusIcon(project.status)}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-sm font-medium text-gray-900 truncate">
                            {project.projectName}
                          </h3>
                          <p className="text-sm text-gray-500 truncate">
                            {project.requestPrompt}
                          </p>
                        </div>
                      </div>
                    </Link>
                  </div>
                  <div className="flex items-center space-x-4 ml-4">
                    <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(project.status)}`}>
                      {project.status.replace('_', ' ')}
                    </span>
                    <span className="text-sm text-gray-500">
                      {format(new Date(project.createdAt), 'MMM d, yyyy')}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Dashboard
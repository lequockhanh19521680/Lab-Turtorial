import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { RootState } from '../store'
import { projectsApi } from '../services/projects'
import { Plus, Clock, CheckCircle, XCircle, AlertCircle, ArrowUpRight, Calendar, MoreHorizontal } from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

const Dashboard: React.FC = () => {
  const { projects } = useSelector((state: RootState) => state.projects)
  
  const { data: projectsData, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
  })

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'FAILED':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'IN_PROGRESS':
        return <Clock className="h-4 w-4 text-blue-500 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
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
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-1">Manage your AI-generated projects</p>
        </div>
        <Button asChild>
          <Link to="/create">
            <Plus className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayProjects.filter(p => p.status === 'COMPLETED').length}
            </div>
            <p className="text-xs text-gray-500">
              +2 from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayProjects.filter(p => p.status === 'IN_PROGRESS').length}
            </div>
            <p className="text-xs text-gray-500">
              Currently building
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <AlertCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayProjects.filter(p => p.status === 'PENDING').length}
            </div>
            <p className="text-xs text-gray-500">
              Awaiting approval
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <Plus className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {displayProjects.length}
            </div>
            <p className="text-xs text-gray-500">
              All time projects
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Projects Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>
            Manage and monitor your AI-generated applications
          </CardDescription>
        </CardHeader>
        <CardContent>
          {displayProjects.length === 0 ? (
            <div className="text-center py-12">
              <Plus className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No projects yet</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first AI-powered application.
              </p>
              <div className="mt-6">
                <Button asChild>
                  <Link to="/create">Create Project</Link>
                </Button>
              </div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayProjects.slice(0, 10).map((project) => (
                  <TableRow key={project.projectId}>
                    <TableCell>
                      <div className="space-y-1">
                        <Link 
                          to={`/project/${project.projectId}`}
                          className="font-medium hover:underline"
                        >
                          {project.projectName}
                        </Link>
                        <p className="text-sm text-gray-500 truncate max-w-md">
                          {project.requestPrompt}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {getStatusIcon(project.status)}
                        {getStatusBadge(project.status)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="h-4 w-4" />
                        {format(new Date(project.createdAt), 'MMM d, yyyy')}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button variant="outline" size="sm" asChild>
                          <Link to={`/project/${project.projectId}`}>
                            <ArrowUpRight className="h-4 w-4 mr-1" />
                            View
                          </Link>
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link to={`/project/${project.projectId}`}>
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            {project.status === 'COMPLETED' && (
                              <DropdownMenuItem>
                                Download Source
                              </DropdownMenuItem>
                            )}
                            {project.status === 'FAILED' && (
                              <DropdownMenuItem>
                                Retry Build
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Dashboard
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
import { Skeleton } from '../features/shared/components/ui/skeleton'
import DashboardAnalytics from '../components/DashboardAnalytics'
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
        return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">Completed</Badge>
      case 'FAILED':
        return <Badge variant="destructive" className="bg-gradient-to-r from-red-500 to-pink-500 border-0">Failed</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">In Progress</Badge>
      default:
        return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">Pending</Badge>
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-8 p-6 bg-gradient-to-br from-background via-background to-secondary min-h-screen">
        {/* Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse-slow"></div>
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl animate-float"></div>
        </div>

        <div className="relative z-10 space-y-8">
          {/* Header Skeleton */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <Skeleton className="h-10 w-48" />
              <Skeleton className="h-6 w-96" />
            </div>
            <Skeleton className="h-12 w-32" />
          </div>

          {/* Stats Cards Skeleton */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[...Array(4)].map((_, i) => (
              <Card key={i} className="border-0 shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-8 w-8 rounded-lg" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-12 mb-2" />
                  <Skeleton className="h-4 w-24" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Table Skeleton */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-80" />
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-4 w-40" />
                    <Skeleton className="h-6 w-20" />
                    <Skeleton className="h-4 w-24" />
                    <Skeleton className="h-8 w-16" />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
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
    <div className="space-y-8 p-6 bg-gradient-to-br from-background via-background to-secondary min-h-screen">
      {/* Modern Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="relative z-10 space-y-8">
        {/* Enhanced Header */}
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-lg">Manage your AI-generated projects with ease</p>
          </div>
          <Button 
            asChild 
            className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-105"
          >
            <Link to="/create">
              <Plus className="h-5 w-5 mr-2" />
              New Project
            </Link>
          </Button>
        </div>

        {/* Enhanced Stats Cards */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="border-0 shadow-lg bg-gradient-to-br from-green-50 to-emerald-50 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-green-800">Completed</CardTitle>
              <div className="p-2 bg-green-100 rounded-lg">
                <CheckCircle className="h-5 w-5 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-green-700">
                {displayProjects.filter(p => p.status === 'COMPLETED').length}
              </div>
              <p className="text-sm text-green-600 mt-1">
                +2 from last month
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-cyan-50 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-blue-800">In Progress</CardTitle>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Clock className="h-5 w-5 text-blue-600 animate-pulse" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-700">
                {displayProjects.filter(p => p.status === 'IN_PROGRESS').length}
              </div>
              <p className="text-sm text-blue-600 mt-1">
                Currently building
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-yellow-50 to-orange-50 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-yellow-800">Pending</CardTitle>
              <div className="p-2 bg-yellow-100 rounded-lg">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-yellow-700">
                {displayProjects.filter(p => p.status === 'PENDING').length}
              </div>
              <p className="text-sm text-yellow-600 mt-1">
                Awaiting approval
              </p>
            </CardContent>
          </Card>

          <Card className="border-0 shadow-lg bg-gradient-to-br from-purple-50 to-pink-50 hover:shadow-xl transition-all duration-200 transform hover:scale-105">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-semibold text-purple-800">Total Projects</CardTitle>
              <div className="p-2 bg-purple-100 rounded-lg">
                <Plus className="h-5 w-5 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-purple-700">
                {displayProjects.length}
              </div>
              <p className="text-sm text-purple-600 mt-1">
                All time projects
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Dashboard Analytics Section */}
        <DashboardAnalytics />

        {/* Enhanced Projects Table */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm">
          <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50 rounded-t-lg">
            <CardTitle className="text-xl font-bold text-slate-800">Recent Projects</CardTitle>
            <CardDescription className="text-slate-600">
              Manage and monitor your AI-generated applications
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            {displayProjects.length === 0 ? (
              <div className="text-center py-16">
                <div className="w-16 h-16 mx-auto bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Plus className="h-8 w-8 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold text-slate-800 mb-2">No projects yet</h3>
                <p className="text-slate-600 mb-6 max-w-md mx-auto">
                  Get started by creating your first AI-powered application and bring your ideas to life.
                </p>
                <Button 
                  asChild 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg shadow-blue-500/25 hover:shadow-xl hover:shadow-blue-500/30 transition-all duration-200 transform hover:scale-105"
                >
                  <Link to="/create">Create Your First Project</Link>
                </Button>
              </div>
            ) : (
              <div className="p-6">
                <Table>
                  <TableHeader>
                    <TableRow className="border-slate-200">
                      <TableHead className="font-semibold text-slate-700">Project Name</TableHead>
                      <TableHead className="font-semibold text-slate-700">Status</TableHead>
                      <TableHead className="font-semibold text-slate-700">Created</TableHead>
                      <TableHead className="text-right font-semibold text-slate-700">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {displayProjects.slice(0, 10).map((project) => (
                      <TableRow key={project.projectId} className="border-slate-100 hover:bg-slate-50/50 transition-colors">
                        <TableCell>
                          <div className="space-y-2">
                            <Link 
                              to={`/project/${project.projectId}`}
                              className="font-semibold text-slate-800 hover:text-blue-600 transition-colors"
                            >
                              {project.projectName}
                            </Link>
                            <p className="text-sm text-slate-500 truncate max-w-md">
                              {project.requestPrompt}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-3">
                            {getStatusIcon(project.status)}
                            {getStatusBadge(project.status)}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-sm text-slate-600">
                            <Calendar className="h-4 w-4" />
                            {format(new Date(project.createdAt), 'MMM d, yyyy')}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              asChild
                              className="border-slate-200 hover:bg-slate-50 transition-all duration-200 transform hover:scale-105"
                            >
                              <Link to={`/project/${project.projectId}`}>
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="hover:bg-slate-50">
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="border-slate-200">
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
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Dashboard
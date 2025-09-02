import React from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useQuery } from '@tanstack/react-query'
import { RootState } from '../store'
import { projectsApi } from '../services/projects'
import { Plus, Clock, CheckCircle, ArrowUpRight, Calendar, Zap, TrendingUp, Activity, FolderOpen } from 'lucide-react'
import { format } from 'date-fns'

// SERA UI Components
import { 
  SeraPageContainer, 
  SeraPageHeader, 
  SeraGrid, 
  SeraSection,
  SeraStack,
} from '@/components/ui/seraLayout'
import { 
  SeraCard, 
  SeraCardHeader, 
  SeraCardTitle, 
  SeraCardContent,
  StatsCard,
  FeatureCard,
} from '@/components/ui/seraCard'
import { PrimaryButton, SecondaryButton } from '@/components/ui/seraButton'
import { StatusBadge } from '@/components/ui/seraBadge'
import { SeraLoading, SeraEmptyState, SeraErrorState } from '@/components/ui/seraLoading'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

const EnhancedDashboard: React.FC = () => {
  const { projects } = useSelector((state: RootState) => state.projects)
  
  const { data: projectsData, isLoading, error } = useQuery({
    queryKey: ['projects'],
    queryFn: projectsApi.getProjects,
  })

  if (isLoading) {
    return (
      <SeraPageContainer>
        <SeraLoading 
          text="Loading your projects..." 
          size="lg" 
          variant="center" 
        />
      </SeraPageContainer>
    )
  }

  if (error) {
    return (
      <SeraPageContainer>
        <SeraErrorState
          title="Failed to load projects"
          description="There was an error loading your projects. Please try again."
          onRetry={() => window.location.reload()}
          size="lg"
        />
      </SeraPageContainer>
    )
  }

  const displayProjects = projectsData || projects

  // Calculate stats
  const stats = {
    total: displayProjects.length,
    completed: displayProjects.filter(p => p.status === 'COMPLETED').length,
    inProgress: displayProjects.filter(p => p.status === 'IN_PROGRESS').length,
    pending: displayProjects.filter(p => p.status === 'PENDING').length,
    failed: displayProjects.filter(p => p.status === 'FAILED').length,
  }

  const completionRate = stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0

  return (
    <SeraPageContainer size="xl" padding="lg">
      <SeraStack spacing="xl">
        {/* Page Header */}
        <SeraPageHeader
          title="Dashboard"
          description="Manage and monitor your AI-generated applications"
          badge={
            <div className="inline-flex items-center px-2 py-1 bg-primary-100 text-primary-800 text-xs font-medium rounded-full">
              <Zap className="w-3 h-3 mr-1" />
              AI-Powered
            </div>
          }
          action={
            <PrimaryButton asChild size="lg">
              <Link to="/create">
                <Plus className="h-5 w-5 mr-2" />
                New Project
              </Link>
            </PrimaryButton>
          }
        />

        {/* Stats Overview */}
        <SeraSection 
          title="Overview"
          description="Your project statistics at a glance"
        >
          <SeraGrid cols={4} responsive>
            <StatsCard
              title="Total Projects"
              value={stats.total}
              description="All time projects"
              icon={<FolderOpen className="h-5 w-5" />}
              trend={{ value: "+2 this month", isPositive: true }}
            />
            <StatsCard
              title="Completed"
              value={stats.completed}
              description={`${completionRate}% completion rate`}
              icon={<CheckCircle className="h-5 w-5 text-success-500" />}
              trend={{ value: "+3 this week", isPositive: true }}
            />
            <StatsCard
              title="In Progress"
              value={stats.inProgress}
              description="Currently building"
              icon={<Activity className="h-5 w-5 text-primary-500" />}
            />
            <StatsCard
              title="Success Rate"
              value={`${Math.round(((stats.completed + stats.inProgress) / (stats.total || 1)) * 100)}%`}
              description="Project success rate"
              icon={<TrendingUp className="h-5 w-5 text-success-500" />}
              trend={{ value: "+5% vs last month", isPositive: true }}
            />
          </SeraGrid>
        </SeraSection>

        {/* Quick Actions */}
        <SeraSection 
          title="Quick Actions"
          description="Common tasks and shortcuts"
          variant="subtle"
        >
          <SeraGrid cols={3} responsive>
            <FeatureCard
              title="Create New Project"
              description="Start building your next AI-powered application with our intelligent agents"
              icon={<Plus className="h-6 w-6" />}
              action={
                <PrimaryButton asChild>
                  <Link to="/create">
                    Get Started
                    <ArrowUpRight className="h-4 w-4 ml-1" />
                  </Link>
                </PrimaryButton>
              }
            />
            <FeatureCard
              title="Browse Templates"
              description="Explore pre-built templates for common application types"
              icon={<Zap className="h-6 w-6" />}
              action={
                <SecondaryButton>
                  Coming Soon
                </SecondaryButton>
              }
            />
            <FeatureCard
              title="API Documentation"
              description="Learn how to integrate with our APIs and extend functionality"
              icon={<Clock className="h-6 w-6" />}
              action={
                <SecondaryButton>
                  View Docs
                  <ArrowUpRight className="h-4 w-4 ml-1" />
                </SecondaryButton>
              }
            />
          </SeraGrid>
        </SeraSection>

        {/* Recent Projects */}
        <SeraSection title="Recent Projects">
          <SeraCard variant="elevated">
            <SeraCardHeader>
              <SeraCardTitle>Your Projects</SeraCardTitle>
            </SeraCardHeader>
            <SeraCardContent>
              {displayProjects.length === 0 ? (
                <SeraEmptyState
                  icon={<Plus className="w-12 h-12" />}
                  title="No projects yet"
                  description="Get started by creating your first AI-powered application. Our intelligent agents will help you build amazing projects in minutes."
                  size="lg"
                  action={
                    <PrimaryButton asChild size="lg">
                      <Link to="/create">
                        <Plus className="h-5 w-5 mr-2" />
                        Create Your First Project
                      </Link>
                    </PrimaryButton>
                  }
                />
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
                      <TableRow key={project.projectId} className="group hover:bg-secondary-50/50">
                        <TableCell>
                          <div className="space-y-1">
                            <Link 
                              to={`/project/${project.projectId}`}
                              className="font-medium text-secondary-900 hover:text-primary-600 transition-colors group-hover:underline"
                            >
                              {project.projectName}
                            </Link>
                            <p className="text-sm text-secondary-600 truncate max-w-md">
                              {project.requestPrompt}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <StatusBadge 
                            status={project.status.toLowerCase().replace('_', '-') as any}
                            showIcon={true}
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2 text-sm text-secondary-600">
                            <Calendar className="h-4 w-4" />
                            <time dateTime={project.createdAt}>
                              {format(new Date(project.createdAt), 'MMM d, yyyy')}
                            </time>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <SecondaryButton size="sm" asChild>
                              <Link to={`/project/${project.projectId}`}>
                                <ArrowUpRight className="h-4 w-4 mr-1" />
                                View
                              </Link>
                            </SecondaryButton>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </SeraCardContent>
          </SeraCard>
        </SeraSection>

        {/* Show more projects link if there are many */}
        {displayProjects.length > 10 && (
          <div className="text-center">
            <SecondaryButton>
              View All Projects ({displayProjects.length})
              <ArrowUpRight className="h-4 w-4 ml-1" />
            </SecondaryButton>
          </div>
        )}
      </SeraStack>
    </SeraPageContainer>
  )
}

export default EnhancedDashboard
import React, { useState, useEffect } from 'react'
import { useSelector } from 'react-redux'
import { RootState } from '../../../store'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Bot, 
  Users, 
  Code, 
  Cloud, 
  Activity, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  MessageSquare,
  ArrowRight,
  Zap,
  Timer
} from 'lucide-react'
import type { 
  AgentWorkflowStatus, 
  ProjectDashboardData, 
  AgentCommunicationMessage
} from '@lab-tutorial/shared-types'

// Agent configuration with icons and colors
const AGENT_CONFIG = {
  'product-manager': {
    icon: Users,
    label: 'Product Manager',
    color: 'from-blue-500 to-cyan-500',
    description: 'Analyzing requirements'
  },
  'backend': {
    icon: Code,
    label: 'Backend Engineer', 
    color: 'from-green-500 to-emerald-500',
    description: 'Building APIs & database'
  },
  'frontend': {
    icon: Bot,
    label: 'Frontend Engineer',
    color: 'from-purple-500 to-pink-500', 
    description: 'Creating user interface'
  },
  'devops': {
    icon: Cloud,
    label: 'DevOps Engineer',
    color: 'from-orange-500 to-red-500',
    description: 'Setting up deployment'
  }
} as const

interface AgentProgressCardProps {
  agentStatus: AgentWorkflowStatus
  className?: string
}

const AgentProgressCard: React.FC<AgentProgressCardProps> = ({ agentStatus, className = '' }) => {
  const config = AGENT_CONFIG[agentStatus.agentType]
  const IconComponent = config.icon
  
  const getStatusBadge = () => {
    switch (agentStatus.status) {
      case 'completed':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 font-semibold">Completed</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0 font-semibold">Failed</Badge>
      case 'working':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 font-semibold">Working</Badge>
      case 'waiting':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 font-semibold">Waiting</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-0 font-semibold">Idle</Badge>
    }
  }

  const formatTimeRemaining = (minutes?: number) => {
    if (!minutes) return null
    if (minutes < 60) return `${Math.round(minutes)}m remaining`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m remaining`
  }

  const getProgressColor = () => {
    switch (agentStatus.status) {
      case 'completed':
        return 'bg-emerald-500'
      case 'failed':
        return 'bg-red-500'
      case 'working':
        return 'bg-blue-500'
      case 'waiting':
        return 'bg-amber-500'
      default:
        return 'bg-gray-400'
    }
  }

  const getIconBackgroundColor = () => {
    switch (agentStatus.agentType) {
      case 'product-manager':
        return 'bg-blue-500'
      case 'backend':
        return 'bg-emerald-500'
      case 'frontend':
        return 'bg-purple-500'
      case 'devops':
        return 'bg-orange-500'
      default:
        return 'bg-gray-500'
    }
  }

  return (
    <Card className={`group relative bg-white border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-lg ${className}`}>
      <CardContent className="p-6">
        {/* Header Section */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center space-x-3">
            <div className={`w-12 h-12 rounded-lg ${getIconBackgroundColor()} flex items-center justify-center shadow-sm`}>
              <IconComponent className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="font-bold text-gray-900 text-lg mb-1">
                {config.label}
              </h3>
              <p className="text-sm text-gray-600">{config.description}</p>
            </div>
          </div>
          <div className="text-right">
            {getStatusBadge()}
          </div>
        </div>

        {/* Progress Section */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Progress</span>
            <span className="text-lg font-bold text-gray-900">{Math.round(agentStatus.progress)}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
              style={{ width: `${agentStatus.progress}%` }}
            />
          </div>
        </div>

        {/* Current Step */}
        <div className="mb-4">
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Current Step</p>
          <p className="text-sm text-gray-800 font-medium leading-relaxed">{agentStatus.currentStep}</p>
        </div>

        {/* Time Estimation */}
        {agentStatus.estimatedTimeRemaining && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Timer className="h-4 w-4 text-gray-500" />
                <span className="text-xs font-medium text-gray-600">Time Remaining</span>
              </div>
              <span className="text-sm font-semibold text-gray-800">{formatTimeRemaining(agentStatus.estimatedTimeRemaining)}</span>
            </div>
          </div>
        )}

        {/* Error Message */}
        {agentStatus.status === 'failed' && agentStatus.errorMessage && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start space-x-2">
              <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{agentStatus.errorMessage}</p>
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="mt-6">
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-medium"
          >
            View Details
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

interface AgentCommunicationPanelProps {
  communications: AgentCommunicationMessage['payload'][]
  className?: string
}

const AgentCommunicationPanel: React.FC<AgentCommunicationPanelProps> = ({ 
  communications, 
  className = '' 
}) => {
  const getCommTypeIcon = (type: string) => {
    switch (type) {
      case 'handoff':
        return <ArrowRight className="h-4 w-4 text-blue-600" />
      case 'status_update':
        return <Activity className="h-4 w-4 text-emerald-600" />
      case 'request_input':
        return <AlertCircle className="h-4 w-4 text-amber-600" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-600" />
    }
  }

  const getCommTypeBadge = (type: string) => {
    switch (type) {
      case 'handoff':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 font-semibold text-xs">Handoff</Badge>
      case 'status_update':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 font-semibold text-xs">Update</Badge>
      case 'request_input':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 font-semibold text-xs">Request</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-0 font-semibold text-xs">Message</Badge>
    }
  }

  return (
    <Card className={`border border-gray-200 bg-white ${className}`}>
      <CardHeader className="border-b border-gray-200 bg-gray-50">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
            <MessageSquare className="h-6 w-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-gray-900">Agent Communications</CardTitle>
            <p className="text-sm text-gray-600 font-medium mt-1">
              Real-time agent interactions and handoffs
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {communications.length === 0 ? (
            <div className="text-center py-12 text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-gray-400" />
              </div>
              <p className="text-lg font-semibold mb-2 text-gray-800">No agent communications yet</p>
              <p className="text-sm text-gray-600">Agent interactions will appear here in real-time</p>
            </div>
          ) : (
            communications.map((comm, index) => (
              <div 
                key={index}
                className="flex items-start space-x-4 p-4 bg-gray-50 rounded-lg border border-gray-200 hover:bg-gray-100 transition-colors duration-200"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="w-10 h-10 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
                    {getCommTypeIcon(comm.communicationType)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-bold text-gray-900">
                        {AGENT_CONFIG[comm.fromAgent]?.label || comm.fromAgent}
                      </p>
                      {comm.toAgent && (
                        <>
                          <ArrowRight className="h-3 w-3 text-gray-400" />
                          <p className="text-sm font-bold text-gray-900">
                            {AGENT_CONFIG[comm.toAgent]?.label || comm.toAgent}
                          </p>
                        </>
                      )}
                    </div>
                    {getCommTypeBadge(comm.communicationType)}
                  </div>
                  <p className="text-sm text-gray-700 leading-relaxed font-medium">{comm.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}

interface RealTimeProjectDashboardProps {
  projectId?: string
  className?: string
}

const RealTimeProjectDashboard: React.FC<RealTimeProjectDashboardProps> = ({ 
  projectId, 
  className = '' 
}) => {
  const { currentProject } = useSelector((state: RootState) => state.projects)
  const [dashboardData, setDashboardData] = useState<ProjectDashboardData | null>(null)
  const [isConnected, setIsConnected] = useState(false)

  // Mock data for demonstration - in real app this would come from WebSocket
  useEffect(() => {
    // Initialize mock dashboard data even without currentProject for demo
    const mockData: ProjectDashboardData = {
      project: currentProject ? {
        id: currentProject.projectId,
        userId: currentProject.userId,
        projectName: currentProject.projectName,
        requestPrompt: currentProject.requestPrompt,
        status: currentProject.status,
        createdAt: currentProject.createdAt,
        updatedAt: currentProject.updatedAt
      } : {
        id: projectId || 'demo-project',
        userId: 'demo-user',
        projectName: 'AI Chat Application',
        requestPrompt: 'Build a real-time chat application with AI integration',
        status: 'IN_PROGRESS' as const,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      agentStatuses: [
        {
          agentType: 'product-manager',
          status: 'completed',
          progress: 100,
          currentStep: 'Requirements analysis completed',
          completedAt: new Date(Date.now() - 3600000).toISOString()
        },
        {
          agentType: 'backend',
          status: 'working',
          progress: 65,
          currentStep: 'Implementing real-time messaging APIs',
          estimatedTimeRemaining: 25,
          startedAt: new Date(Date.now() - 1800000).toISOString()
        },
        {
          agentType: 'frontend',
          status: 'waiting',
          progress: 0,
          currentStep: 'Waiting for backend completion',
        },
        {
          agentType: 'devops',
          status: 'idle',
          progress: 0,
          currentStep: 'Ready to deploy',
        }
      ],
      recentCommunications: [
        {
          projectId: projectId || 'demo-project',
          fromAgent: 'product-manager',
          toAgent: 'backend',
          message: 'Requirements analysis complete. Handoff includes user authentication, real-time messaging, and AI integration specs.',
          communicationType: 'handoff',
          metadata: { artifactId: 'srs-001' }
        },
        {
          projectId: projectId || 'demo-project',
          fromAgent: 'backend',
          message: 'Started implementing core messaging APIs. Database schema is ready.',
          communicationType: 'status_update',
          metadata: { progress: 65 }
        }
      ],
      overallProgress: 41,
      estimatedCompletion: new Date(Date.now() + 3600000).toISOString()
    }

    setDashboardData(mockData)
    setIsConnected(true)

    // Simulate real-time updates
    const interval = setInterval(() => {
      setDashboardData(prev => {
        if (!prev) return prev
        
        return {
          ...prev,
          agentStatuses: prev.agentStatuses.map(status => {
            if (status.status === 'working' && status.progress < 100) {
              return {
                ...status,
                progress: Math.min(100, status.progress + Math.random() * 5),
                estimatedTimeRemaining: Math.max(0, (status.estimatedTimeRemaining || 30) - 1)
              }
            }
            return status
          }),
          overallProgress: Math.min(100, prev.overallProgress + Math.random() * 2)
        }
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [currentProject, projectId])

  if (!dashboardData) {
    return (
      <div className={`space-y-6 ${className}`}>
        <Card>
          <CardContent className="flex items-center justify-center py-16">
            <div className="text-center">
              <Activity className="h-8 w-8 mx-auto mb-4 text-muted-foreground animate-spin" />
              <p className="text-muted-foreground">Loading project dashboard...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className={`space-y-8 ${className}`}>
      {/* Project Overview Header */}
      <Card className="border border-gray-200 bg-white">
        <CardContent className="p-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center space-x-4 mb-3">
                <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold text-gray-900 mb-1">
                    {dashboardData.project.projectName}
                  </CardTitle>
                  <p className="text-gray-600 text-lg leading-relaxed max-w-2xl">
                    {dashboardData.project.requestPrompt}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-500' : 'bg-red-500'}`} />
                <span className="text-sm font-semibold text-gray-700">
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
              <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 font-semibold px-4 py-2">
                In Progress
              </Badge>
            </div>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-gray-600" />
                <span className="text-lg font-bold text-gray-900">Overall Progress</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-gray-900">
                  {Math.round(dashboardData.overallProgress)}%
                </span>
                <p className="text-sm text-gray-500 font-medium">Complete</p>
              </div>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-3">
              <div 
                className="h-3 bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${dashboardData.overallProgress}%` }}
              />
            </div>
            {dashboardData.estimatedCompletion && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm font-medium text-gray-600">Estimated completion:</span>
                </div>
                <span className="text-sm font-semibold text-gray-800">
                  {new Date(dashboardData.estimatedCompletion).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agent Progress Cards Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI Agent Workflow</h2>
              <p className="text-gray-600 font-medium">Real-time progress tracking for each specialized agent</p>
            </div>
          </div>
          <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 px-4 py-2 font-semibold">
            4 Agents Active
          </Badge>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
          {dashboardData.agentStatuses.map((agentStatus) => (
            <AgentProgressCard 
              key={agentStatus.agentType}
              agentStatus={agentStatus}
            />
          ))}
        </div>
      </div>

      {/* Agent Communications */}
      <AgentCommunicationPanel 
        communications={dashboardData.recentCommunications}
      />

      {/* Quick Actions */}
      <Card className="border border-gray-200 bg-white">
        <CardHeader className="border-b border-gray-200 bg-gray-50">
          <CardTitle className="text-xl font-bold text-gray-900">Quick Actions</CardTitle>
          <p className="text-sm text-gray-600 font-medium">Common tasks and monitoring tools</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" size="lg" className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-gray-50 transition-colors duration-200 border-gray-300">
              <MessageSquare className="h-8 w-8 text-blue-600" />
              <span className="font-semibold text-gray-900">View Full Log</span>
              <span className="text-xs text-gray-500">Complete activity history</span>
            </Button>
            <Button variant="outline" size="lg" className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-gray-50 transition-colors duration-200 border-gray-300">
              <Bot className="h-8 w-8 text-purple-600" />
              <span className="font-semibold text-gray-900">Customize Agents</span>
              <span className="text-xs text-gray-500">Configure AI behavior</span>
            </Button>
            <Button variant="outline" size="lg" className="h-auto p-6 flex flex-col items-center space-y-3 hover:bg-gray-50 transition-colors duration-200 border-gray-300">
              <Activity className="h-8 w-8 text-emerald-600" />
              <span className="font-semibold text-gray-900">Monitor Performance</span>
              <span className="text-xs text-gray-500">Real-time metrics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RealTimeProjectDashboard
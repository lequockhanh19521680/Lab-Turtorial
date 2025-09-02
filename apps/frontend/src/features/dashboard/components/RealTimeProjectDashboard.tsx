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
  AgentType,
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
  
  const getStatusIcon = () => {
    switch (agentStatus.status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'failed':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'working':
        return <Activity className="h-5 w-5 text-blue-500 animate-pulse" />
      case 'waiting':
        return <Clock className="h-5 w-5 text-yellow-500" />
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusBadge = () => {
    switch (agentStatus.status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Completed</Badge>
      case 'failed':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Failed</Badge>
      case 'working':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200 animate-pulse">Working</Badge>
      case 'waiting':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Waiting</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-600 border-gray-200">Idle</Badge>
    }
  }

  const formatTimeRemaining = (minutes?: number) => {
    if (!minutes) return null
    if (minutes < 60) return `${Math.round(minutes)}m remaining`
    const hours = Math.floor(minutes / 60)
    const mins = Math.round(minutes % 60)
    return `${hours}h ${mins}m remaining`
  }

  return (
    <Card className={`relative overflow-hidden transition-all duration-200 hover:shadow-lg ${className}`}>
      {/* Gradient background based on agent type */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-5`} />
      
      <CardHeader className="relative flex flex-row items-center justify-between space-y-0 pb-3">
        <div className="flex items-center space-x-3">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${config.color} bg-opacity-10`}>
            <IconComponent className="h-5 w-5 text-foreground" />
          </div>
          <div>
            <CardTitle className="text-sm font-semibold">{config.label}</CardTitle>
            <p className="text-xs text-muted-foreground">{config.description}</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          {getStatusIcon()}
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-4">
        {/* Progress bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-medium">Progress</span>
            <span className="text-muted-foreground">{Math.round(agentStatus.progress)}%</span>
          </div>
          <Progress 
            value={agentStatus.progress} 
            className="h-2"
          />
        </div>

        {/* Current step */}
        <div className="space-y-1">
          <p className="text-xs font-medium text-muted-foreground">Current Step</p>
          <p className="text-sm font-medium">{agentStatus.currentStep}</p>
        </div>

        {/* Time estimation */}
        {agentStatus.estimatedTimeRemaining && (
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Timer className="h-3 w-3" />
            <span>{formatTimeRemaining(agentStatus.estimatedTimeRemaining)}</span>
          </div>
        )}

        {/* Error message for failed status */}
        {agentStatus.status === 'failed' && agentStatus.errorMessage && (
          <div className="p-2 bg-red-50 border border-red-200 rounded-md">
            <p className="text-xs text-red-700">{agentStatus.errorMessage}</p>
          </div>
        )}
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
        return <ArrowRight className="h-4 w-4 text-blue-500" />
      case 'status_update':
        return <Activity className="h-4 w-4 text-green-500" />
      case 'request_input':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      default:
        return <MessageSquare className="h-4 w-4 text-gray-500" />
    }
  }

  const getCommTypeBadge = (type: string) => {
    switch (type) {
      case 'handoff':
        return <Badge variant="outline" className="text-xs">Handoff</Badge>
      case 'status_update':
        return <Badge variant="outline" className="text-xs">Update</Badge>
      case 'request_input':
        return <Badge variant="outline" className="text-xs">Request</Badge>
      default:
        return <Badge variant="outline" className="text-xs">Message</Badge>
    }
  }

  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2 text-lg">
          <MessageSquare className="h-5 w-5" />
          <span>Agent Communications</span>
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Real-time agent interactions and handoffs
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {communications.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <MessageSquare className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No agent communications yet</p>
            </div>
          ) : (
            communications.map((comm, index) => (
              <div 
                key={index}
                className="flex items-start space-x-3 p-3 bg-muted/50 rounded-lg"
              >
                <div className="flex-shrink-0 mt-0.5">
                  {getCommTypeIcon(comm.communicationType)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium">
                        {AGENT_CONFIG[comm.fromAgent]?.label || comm.fromAgent}
                      </p>
                      {comm.toAgent && (
                        <>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <p className="text-sm font-medium">
                            {AGENT_CONFIG[comm.toAgent]?.label || comm.toAgent}
                          </p>
                        </>
                      )}
                    </div>
                    {getCommTypeBadge(comm.communicationType)}
                  </div>
                  <p className="text-sm text-muted-foreground">{comm.message}</p>
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
    if (!currentProject && !projectId) return

    // Initialize mock dashboard data
    const mockData: ProjectDashboardData = {
      project: currentProject || {
        projectId: projectId || 'demo',
        userId: 'user1',
        projectName: 'AI Chat Application',
        requestPrompt: 'Build a real-time chat application with AI integration',
        status: 'IN_PROGRESS',
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
          projectId: projectId || currentProject?.projectId || 'demo',
          fromAgent: 'product-manager',
          toAgent: 'backend',
          message: 'Requirements analysis complete. Handoff includes user authentication, real-time messaging, and AI integration specs.',
          communicationType: 'handoff',
          metadata: { artifactId: 'srs-001' }
        },
        {
          projectId: projectId || currentProject?.projectId || 'demo',
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
    <div className={`space-y-6 ${className}`}>
      {/* Project Overview Header */}
      <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-50 to-purple-50">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold text-slate-800">
                {dashboardData.project.projectName}
              </CardTitle>
              <p className="text-slate-600 mt-1">
                {dashboardData.project.requestPrompt}
              </p>
            </div>
            <div className="flex items-center space-x-3">
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'} animate-pulse`} />
                <span className="text-sm text-muted-foreground">
                  {isConnected ? 'Live' : 'Disconnected'}
                </span>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                In Progress
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Overall Progress</span>
              <span className="text-muted-foreground">
                {Math.round(dashboardData.overallProgress)}%
              </span>
            </div>
            <Progress value={dashboardData.overallProgress} className="h-3" />
            {dashboardData.estimatedCompletion && (
              <p className="text-xs text-muted-foreground">
                Estimated completion: {new Date(dashboardData.estimatedCompletion).toLocaleString()}
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Agent Progress Cards */}
      <div>
        <div className="flex items-center space-x-2 mb-4">
          <Zap className="h-5 w-5 text-primary" />
          <h2 className="text-lg font-semibold">AI Agent Workflow</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" size="sm">
              <MessageSquare className="h-4 w-4 mr-2" />
              View Full Log
            </Button>
            <Button variant="outline" size="sm">
              <Bot className="h-4 w-4 mr-2" />
              Customize Agents
            </Button>
            <Button variant="outline" size="sm">
              <Activity className="h-4 w-4 mr-2" />
              Monitor Performance
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RealTimeProjectDashboard
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
  
  const getStatusIcon = () => {
    switch (agentStatus.status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case 'failed':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'working':
        return <Activity className="h-4 w-4 text-blue-600 animate-pulse" />
      case 'waiting':
        return <Clock className="h-4 w-4 text-amber-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-slate-400" />
    }
  }

  const getStatusBadge = () => {
    switch (agentStatus.status) {
      case 'completed':
        return <Badge className="bg-emerald-50 text-emerald-700 border-emerald-200 font-medium">Completed</Badge>
      case 'failed':
        return <Badge className="bg-red-50 text-red-700 border-red-200 font-medium">Failed</Badge>
      case 'working':
        return <Badge className="bg-blue-50 text-blue-700 border-blue-200 animate-pulse font-medium">Working</Badge>
      case 'waiting':
        return <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-medium">Waiting</Badge>
      default:
        return <Badge className="bg-slate-50 text-slate-600 border-slate-200 font-medium">Idle</Badge>
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
        return 'bg-slate-400'
    }
  }

  return (
    <Card className={`group relative overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 border-0 shadow-lg bg-white ${className}`}>
      {/* Enhanced gradient background */}
      <div className={`absolute inset-0 bg-gradient-to-br ${config.color} opacity-[0.02] group-hover:opacity-[0.04] transition-opacity duration-300`} />
      
      {/* Status indicator line */}
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${config.color}`} />
      
      <CardHeader className="relative pb-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className={`relative p-3 rounded-xl bg-gradient-to-br ${config.color} shadow-sm group-hover:shadow-md transition-shadow duration-300`}>
              <IconComponent className="h-5 w-5 text-white" />
              <div className="absolute inset-0 bg-white opacity-10 rounded-xl" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-base font-bold text-slate-800 mb-1">
                {config.label}
              </CardTitle>
              <p className="text-xs text-slate-500 font-medium">{config.description}</p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            {getStatusIcon()}
            {getStatusBadge()}
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="relative space-y-5 pt-0">
        {/* Enhanced progress section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-700">Progress</span>
            <span className="text-lg font-bold text-slate-800">{Math.round(agentStatus.progress)}%</span>
          </div>
          <div className="relative">
            <div className="w-full bg-slate-100 rounded-full h-3 shadow-inner">
              <div 
                className={`h-3 rounded-full transition-all duration-500 ease-out shadow-sm ${getProgressColor()}`}
                style={{ width: `${agentStatus.progress}%` }}
              />
            </div>
            {agentStatus.status === 'working' && (
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse rounded-full" />
            )}
          </div>
        </div>

        {/* Current step with better typography */}
        <div className="space-y-2">
          <p className="text-xs font-bold text-slate-600 uppercase tracking-wide">Current Step</p>
          <p className="text-sm font-medium text-slate-800 leading-relaxed">{agentStatus.currentStep}</p>
        </div>

        {/* Time estimation with icon */}
        {agentStatus.estimatedTimeRemaining && (
          <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg border border-slate-100">
            <div className="flex items-center space-x-2">
              <Timer className="h-4 w-4 text-slate-500" />
              <span className="text-xs font-medium text-slate-600">Time Remaining</span>
            </div>
            <span className="text-sm font-bold text-slate-800">{formatTimeRemaining(agentStatus.estimatedTimeRemaining)}</span>
          </div>
        )}

        {/* Enhanced error message */}
        {agentStatus.status === 'failed' && agentStatus.errorMessage && (
          <div className="p-4 bg-red-50 border-l-4 border-red-400 rounded-lg">
            <div className="flex items-start space-x-2">
              <XCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700 font-medium">{agentStatus.errorMessage}</p>
            </div>
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
    <Card className={`border-0 shadow-xl bg-white ${className}`}>
      <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
            <MessageSquare className="h-5 w-5 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold text-slate-800">Agent Communications</CardTitle>
            <p className="text-sm text-slate-600 font-medium mt-1">
              Real-time agent interactions and handoffs
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {communications.length === 0 ? (
            <div className="text-center py-12 text-slate-500">
              <div className="p-4 bg-slate-100 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
                <MessageSquare className="h-8 w-8 opacity-50" />
              </div>
              <p className="text-lg font-semibold mb-2">No agent communications yet</p>
              <p className="text-sm">Agent interactions will appear here in real-time</p>
            </div>
          ) : (
            communications.map((comm, index) => (
              <div 
                key={index}
                className="flex items-start space-x-4 p-4 bg-gradient-to-r from-slate-50 to-white rounded-xl border border-slate-100 hover:shadow-md transition-all duration-200"
              >
                <div className="flex-shrink-0 mt-1">
                  <div className="p-2 bg-white rounded-lg shadow-sm border border-slate-200">
                    {getCommTypeIcon(comm.communicationType)}
                  </div>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-bold text-slate-800">
                        {AGENT_CONFIG[comm.fromAgent]?.label || comm.fromAgent}
                      </p>
                      {comm.toAgent && (
                        <>
                          <ArrowRight className="h-3 w-3 text-slate-400" />
                          <p className="text-sm font-bold text-slate-800">
                            {AGENT_CONFIG[comm.toAgent]?.label || comm.toAgent}
                          </p>
                        </>
                      )}
                    </div>
                    {getCommTypeBadge(comm.communicationType)}
                  </div>
                  <p className="text-sm text-slate-700 leading-relaxed font-medium">{comm.message}</p>
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
      {/* Enhanced Project Overview Header */}
      <Card className="border-0 shadow-xl bg-white overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 p-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-3">
                <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-2xl font-bold">
                  {dashboardData.project.projectName}
                </CardTitle>
              </div>
              <p className="text-blue-100 text-lg font-medium leading-relaxed max-w-2xl">
                {dashboardData.project.requestPrompt}
              </p>
            </div>
            <div className="flex flex-col items-end space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-3 py-1.5 rounded-full">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-red-400'} animate-pulse`} />
                  <span className="text-sm font-semibold text-white">
                    {isConnected ? 'Live' : 'Disconnected'}
                  </span>
                </div>
                <Badge className="bg-white text-blue-700 hover:bg-white font-bold px-4 py-2 text-sm">
                  In Progress
                </Badge>
              </div>
            </div>
          </div>
        </div>
        <CardContent className="p-8 bg-gradient-to-b from-white to-slate-50">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Activity className="h-5 w-5 text-slate-600" />
                <span className="text-lg font-bold text-slate-800">Overall Progress</span>
              </div>
              <div className="text-right">
                <span className="text-3xl font-bold text-slate-800">
                  {Math.round(dashboardData.overallProgress)}%
                </span>
                <p className="text-sm text-slate-500 font-medium">Complete</p>
              </div>
            </div>
            <div className="relative">
              <div className="w-full bg-slate-200 rounded-full h-4 shadow-inner">
                <div 
                  className="h-4 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${dashboardData.overallProgress}%` }}
                />
              </div>
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse rounded-full" />
            </div>
            {dashboardData.estimatedCompletion && (
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <span className="text-sm font-medium text-slate-600">Estimated completion:</span>
                </div>
                <span className="text-sm font-bold text-slate-800">
                  {new Date(dashboardData.estimatedCompletion).toLocaleString()}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Agent Progress Cards Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
              <Zap className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">AI Agent Workflow</h2>
              <p className="text-slate-600 font-medium">Real-time progress tracking for each specialized agent</p>
            </div>
          </div>
          <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-4 py-2 font-bold">
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

      {/* Enhanced Quick Actions */}
      <Card className="border-0 shadow-xl bg-white">
        <CardHeader className="bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
          <CardTitle className="text-xl font-bold text-slate-800">Quick Actions</CardTitle>
          <p className="text-sm text-slate-600 font-medium">Common tasks and monitoring tools</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" size="lg" className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200 border-slate-200 hover:border-blue-300">
              <MessageSquare className="h-6 w-6 text-blue-600" />
              <span className="font-semibold">View Full Log</span>
              <span className="text-xs text-slate-500">Complete activity history</span>
            </Button>
            <Button variant="outline" size="lg" className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200 border-slate-200 hover:border-purple-300">
              <Bot className="h-6 w-6 text-purple-600" />
              <span className="font-semibold">Customize Agents</span>
              <span className="text-xs text-slate-500">Configure AI behavior</span>
            </Button>
            <Button variant="outline" size="lg" className="h-auto p-4 flex flex-col items-center space-y-2 hover:shadow-md transition-all duration-200 border-slate-200 hover:border-green-300">
              <Activity className="h-6 w-6 text-green-600" />
              <span className="font-semibold">Monitor Performance</span>
              <span className="text-xs text-slate-500">Real-time metrics</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default RealTimeProjectDashboard
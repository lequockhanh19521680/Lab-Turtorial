import React from 'react'
import { 
  CheckCircle, 
  Search,
  Code,
  Server,
  Globe,
  Sparkles
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface TimelineStep {
  id: string
  title: string
  description: string
  agent: string
  status: 'completed' | 'in_progress' | 'pending' | 'pending_approval' | 'failed'
  icon: React.ElementType
  estimatedDuration?: string
  artifacts?: Array<{
    name: string
    type: string
  }>
}

interface ProjectTimelineProps {
  projectStatus: string
  onApprove?: (_stepId: string) => void
  onRequestChanges?: (_stepId: string) => void
  className?: string
}

const ProjectTimeline: React.FC<ProjectTimelineProps> = ({
  projectStatus,
  onApprove,
  onRequestChanges,
  className
}) => {
  // Define the standard workflow steps
  const workflowSteps: TimelineStep[] = [
    {
      id: 'analysis',
      title: 'Product Analysis',
      description: 'Analyze requirements and create detailed specifications',
      agent: 'Product Manager',
      status: 'completed',
      icon: Search,
      estimatedDuration: '5-10 min',
      artifacts: [
        { name: 'Requirements Spec', type: 'document' },
        { name: 'User Stories', type: 'document' }
      ]
    },
    {
      id: 'frontend',
      title: 'Frontend Development',
      description: 'Create user interface and user experience',
      agent: 'Frontend Engineer',
      status: projectStatus === 'IN_PROGRESS' ? 'pending_approval' : 'completed',
      icon: Code,
      estimatedDuration: '15-20 min',
      artifacts: [
        { name: 'React Components', type: 'code' },
        { name: 'Styles & Assets', type: 'code' }
      ]
    },
    {
      id: 'backend',
      title: 'Backend Development',
      description: 'Build APIs, database, and server logic',
      agent: 'Backend Engineer',
      status: projectStatus === 'COMPLETED' ? 'completed' : 'pending',
      icon: Server,
      estimatedDuration: '10-15 min',
      artifacts: [
        { name: 'API Endpoints', type: 'code' },
        { name: 'Database Schema', type: 'code' }
      ]
    },
    {
      id: 'deployment',
      title: 'DevOps & Deployment',
      description: 'Deploy application and set up infrastructure',
      agent: 'DevOps Engineer',
      status: projectStatus === 'COMPLETED' ? 'completed' : 'pending',
      icon: Globe,
      estimatedDuration: '5-10 min',
      artifacts: [
        { name: 'Docker Config', type: 'config' },
        { name: 'CI/CD Pipeline', type: 'config' }
      ]
    }
  ]


  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default">Completed</Badge>
      case 'in_progress':
        return <Badge variant="secondary">In Progress</Badge>
      case 'pending_approval':
        return <Badge variant="outline">Pending Approval</Badge>
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>
      default:
        return <Badge variant="secondary">Pending</Badge>
    }
  }

  const getStepColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50'
      case 'in_progress':
        return 'border-blue-200 bg-blue-50'
      case 'pending_approval':
        return 'border-yellow-200 bg-yellow-50'
      case 'failed':
        return 'border-red-200 bg-red-50'
      default:
        return 'border-gray-200 bg-gray-50'
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Sparkles className="h-5 w-5 text-primary-600" />
          <span>Workflow Timeline</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {workflowSteps.map((step, index) => {
            const Icon = step.icon
            const isPendingApproval = step.status === 'pending_approval'
            const isActive = step.status === 'in_progress' || step.status === 'pending_approval'
            
            return (
              <div
                key={step.id}
                className={cn(
                  "relative border rounded-lg p-4 transition-all duration-200",
                  getStepColor(step.status),
                  isActive && "ring-2 ring-primary-200"
                )}
              >
                {/* Connection line to next step */}
                {index < workflowSteps.length - 1 && (
                  <div 
                    className={cn(
                      "absolute left-6 top-16 w-0.5 h-8 -mb-4",
                      step.status === 'completed' ? "bg-green-300" : "bg-gray-300"
                    )}
                  />
                )}
                
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className={cn(
                      "flex items-center justify-center w-12 h-12 rounded-full border-2",
                      step.status === 'completed' ? "border-green-500 bg-green-100" :
                      step.status === 'in_progress' ? "border-blue-500 bg-blue-100" :
                      step.status === 'pending_approval' ? "border-yellow-500 bg-yellow-100" :
                      step.status === 'failed' ? "border-red-500 bg-red-100" :
                      "border-gray-300 bg-gray-100"
                    )}>
                      {step.status === 'completed' ? (
                        <CheckCircle className="h-6 w-6 text-green-600" />
                      ) : (
                        <Icon className={cn(
                          "h-6 w-6",
                          step.status === 'in_progress' ? "text-blue-600" :
                          step.status === 'pending_approval' ? "text-yellow-600" :
                          step.status === 'failed' ? "text-red-600" :
                          "text-gray-500"
                        )} />
                      )}
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="text-lg font-medium text-gray-900">
                        {step.title}
                      </h3>
                      {getStatusBadge(step.status)}
                    </div>
                    
                    <p className="text-sm text-gray-600 mb-3">
                      {step.description}
                    </p>
                    
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-3">
                      <span>Agent: {step.agent}</span>
                      {step.estimatedDuration && (
                        <span>Est. {step.estimatedDuration}</span>
                      )}
                    </div>
                    
                    {step.artifacts && step.artifacts.length > 0 && (
                      <div className="mb-3">
                        <p className="text-xs font-medium text-gray-500 mb-1">Artifacts:</p>
                        <div className="flex flex-wrap gap-1">
                          {step.artifacts.map((artifact, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                              {artifact.name}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    
                    {isPendingApproval && onApprove && onRequestChanges && (
                      <div className="flex items-center space-x-3 pt-3 border-t border-yellow-200">
                        <Button 
                          size="sm"
                          onClick={() => onApprove(step.id)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          Approve & Continue
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          onClick={() => onRequestChanges(step.id)}
                        >
                          Request Changes
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

export default ProjectTimeline
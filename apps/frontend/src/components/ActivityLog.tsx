import React from 'react'
import { format } from 'date-fns'
import { 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  User, 
  FileText, 
  Globe,
  MessageSquare,
  GitCommit
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface ActivityItem {
  id: string
  type: 'task_completed' | 'task_started' | 'approval_requested' | 'feedback_provided' | 'artifact_created' | 'deployment'
  title: string
  description?: string
  timestamp: string
  agent?: string
  status?: 'success' | 'warning' | 'error' | 'info'
}

interface ActivityLogProps {
  projectId: string
  activities?: ActivityItem[]
  className?: string
}

const ActivityLog: React.FC<ActivityLogProps> = ({
  activities = [],
  className
}) => {
  // Mock activities for demo purposes
  const mockActivities: ActivityItem[] = [
    {
      id: '1',
      type: 'task_started',
      title: 'Project analysis started',
      description: 'Product Manager agent began analyzing requirements',
      timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      agent: 'Product Manager',
      status: 'info'
    },
    {
      id: '2',
      type: 'task_completed',
      title: 'Requirements specification completed',
      description: 'Generated detailed technical specifications',
      timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      agent: 'Product Manager',
      status: 'success'
    },
    {
      id: '3',
      type: 'task_started',
      title: 'Frontend development started',
      description: 'Frontend Engineer began implementing user interface',
      timestamp: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
      agent: 'Frontend Engineer',
      status: 'info'
    },
    {
      id: '4',
      type: 'artifact_created',
      title: 'React components generated',
      description: 'Created 12 reusable UI components',
      timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      agent: 'Frontend Engineer',
      status: 'success'
    },
    {
      id: '5',
      type: 'approval_requested',
      title: 'Frontend review required',
      description: 'Frontend implementation ready for approval',
      timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
      agent: 'Frontend Engineer',
      status: 'warning'
    }
  ]

  const displayActivities = activities.length > 0 ? activities : mockActivities

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'task_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'task_started':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'approval_requested':
        return <AlertCircle className="h-4 w-4 text-yellow-500" />
      case 'feedback_provided':
        return <MessageSquare className="h-4 w-4 text-purple-500" />
      case 'artifact_created':
        return <FileText className="h-4 w-4 text-green-500" />
      case 'deployment':
        return <Globe className="h-4 w-4 text-blue-500" />
      default:
        return <GitCommit className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'success':
        return <Badge variant="success">Success</Badge>
      case 'warning':
        return <Badge variant="warning">Pending</Badge>
      case 'error':
        return <Badge variant="destructive">Error</Badge>
      case 'info':
        return <Badge variant="info">In Progress</Badge>
      default:
        return null
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle className="text-lg">Activity Log</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {displayActivities.map((activity) => (
            <div key={activity.id} className="flex items-start space-x-3 pb-4 border-b border-gray-100 last:border-b-0">
              <div className="flex-shrink-0 mt-1">
                {getActivityIcon(activity.type)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <h4 className="text-sm font-medium text-gray-900 truncate">
                    {activity.title}
                  </h4>
                  {activity.status && getStatusBadge(activity.status)}
                </div>
                {activity.description && (
                  <p className="text-sm text-gray-600 mb-2">
                    {activity.description}
                  </p>
                )}
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <div className="flex items-center space-x-2">
                    {activity.agent && (
                      <>
                        <User className="h-3 w-3" />
                        <span>{activity.agent}</span>
                      </>
                    )}
                  </div>
                  <span>{format(new Date(activity.timestamp), 'MMM d, h:mm a')}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {displayActivities.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No activity yet</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ActivityLog
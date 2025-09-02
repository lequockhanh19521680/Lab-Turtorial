import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// ScrollArea component not available, using regular div with overflow
import { 
  Bell, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Info, 
  Clock,
  X
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

export interface Notification {
  id: string
  type: 'success' | 'error' | 'warning' | 'info' | 'progress'
  title: string
  message: string
  timestamp: string
  isRead: boolean
  projectId?: string
  agentType?: string
  actionRequired?: boolean
  metadata?: Record<string, any>
}

interface RealTimeNotificationsPanelProps {
  notifications: Notification[]
  onNotificationRead: (id: string) => void
  onNotificationDismiss: (id: string) => void
  onMarkAllRead: () => void
  className?: string
}

const RealTimeNotificationsPanel: React.FC<RealTimeNotificationsPanelProps> = ({
  notifications,
  onNotificationRead,
  onNotificationDismiss,
  onMarkAllRead,
  className = ''
}) => {
  const [filter, setFilter] = useState<'all' | 'unread' | 'important'>('all')
  
  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-emerald-600" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-600" />
      case 'warning':
        return <AlertCircle className="h-4 w-4 text-amber-600" />
      case 'progress':
        return <Clock className="h-4 w-4 text-blue-600" />
      default:
        return <Info className="h-4 w-4 text-blue-600" />
    }
  }

  const getNotificationBadge = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Badge className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 border-0 font-semibold">Success</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-0 font-semibold">Error</Badge>
      case 'warning':
        return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 font-semibold">Warning</Badge>
      case 'progress':
        return <Badge className="bg-blue-100 text-blue-800 hover:bg-blue-100 border-0 font-semibold">In Progress</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 hover:bg-gray-100 border-0 font-semibold">Info</Badge>
    }
  }

  const filteredNotifications = notifications.filter(notification => {
    switch (filter) {
      case 'unread':
        return !notification.isRead
      case 'important':
        return notification.actionRequired || notification.type === 'error' || notification.type === 'warning'
      default:
        return true
    }
  })

  const unreadCount = notifications.filter(n => !n.isRead).length

  return (
    <Card className={`border border-gray-200 bg-white ${className}`}>
      <CardHeader className="pb-3 bg-gray-50 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-gray-900">Notifications</CardTitle>
              {unreadCount > 0 && (
                <p className="text-xs text-gray-600 font-medium">
                  {unreadCount} unread
                </p>
              )}
            </div>
          </div>
          {unreadCount > 0 && (
            <Badge className="bg-red-500 text-white text-xs px-2 py-1 font-bold">
              {unreadCount}
            </Badge>
          )}
        </div>
        
        {/* Compact filter buttons */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center space-x-1">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="text-xs px-2 py-1 h-6 font-medium"
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="text-xs px-2 py-1 h-6 font-medium"
            >
              Unread
            </Button>
            <Button
              variant={filter === 'important' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('important')}
              className="text-xs px-2 py-1 h-6 font-medium"
            >
              Important
            </Button>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllRead}
              className="text-xs px-2 py-1 h-6 text-gray-600 hover:text-gray-800"
            >
              Clear all
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="p-3 space-y-2">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-6 text-gray-500">
                <div className="w-10 h-10 bg-gray-100 rounded-full mx-auto mb-3 flex items-center justify-center">
                  <Bell className="h-5 w-5 text-gray-400" />
                </div>
                <p className="text-sm font-semibold mb-1 text-gray-800">
                  {filter === 'unread' ? 'No unread notifications' : 
                   filter === 'important' ? 'No important notifications' : 
                   'No notifications yet'}
                </p>
                <p className="text-xs text-gray-500">Updates will appear here</p>
              </div>
            ) : (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  onRead={onNotificationRead}
                  onDismiss={onNotificationDismiss}
                  getIcon={getNotificationIcon}
                  getBadge={getNotificationBadge}
                />
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface NotificationItemProps {
  notification: Notification
  onRead: (id: string) => void
  onDismiss: (id: string) => void
  getIcon: (type: Notification['type']) => React.ReactNode
  getBadge: (type: Notification['type']) => React.ReactNode
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  onRead,
  onDismiss,
  getIcon,
  getBadge
}) => {
  const handleClick = () => {
    if (!notification.isRead) {
      onRead(notification.id)
    }
  }

  return (
    <div
      className={`
        group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:bg-gray-50
        ${notification.isRead 
          ? 'bg-gray-50 border-gray-200' 
          : 'bg-white border-blue-200 shadow-sm'
        }
      `}
      onClick={handleClick}
    >
      {/* Unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-4 bg-blue-500 rounded-r-full" />
      )}

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <div className="w-8 h-8 bg-white rounded-lg border border-gray-200 flex items-center justify-center">
            {getIcon(notification.type)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-1">
            <p className={`text-sm font-bold leading-tight ${
              notification.isRead ? 'text-gray-700' : 'text-gray-900'
            }`}>
              {notification.title}
            </p>
            <div className="flex items-center space-x-1 ml-2">
              <div className="scale-75">
                {getBadge(notification.type)}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation()
                  onDismiss(notification.id)
                }}
                className="opacity-0 group-hover:opacity-100 transition-opacity w-4 h-4 p-0 hover:bg-gray-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <p className={`text-xs leading-relaxed mb-2 ${
            notification.isRead ? 'text-gray-500' : 'text-gray-700'
          }`}>
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-gray-400 font-medium">
              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
            </p>
            
            {notification.actionRequired && (
              <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-0 text-xs px-2 py-0.5 font-semibold">
                Action Required
              </Badge>
            )}
          </div>
          
          {notification.projectId && (
            <div className="mt-2 text-xs text-gray-400 font-medium bg-gray-100 px-2 py-1 rounded">
              Project: {notification.projectId}
              {notification.agentType && ` • Agent: ${notification.agentType}`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Hook for managing notifications
export const useRealTimeNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([])

  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'isRead'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      isRead: false
    }
    setNotifications(prev => [newNotification, ...prev])
  }

  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, isRead: true } : n)
    )
  }

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })))
  }

  // Simulate real-time notifications for demo
  useEffect(() => {
    const interval = setInterval(() => {
      const notificationTypes = ['success', 'error', 'warning', 'info', 'progress'] as const
      const randomType = notificationTypes[Math.floor(Math.random() * notificationTypes.length)]
      
      const sampleNotifications = {
        success: {
          title: 'Agent Task Completed',
          message: 'Backend Engineer has successfully completed API implementation'
        },
        error: {
          title: 'Build Failed',
          message: 'Frontend build encountered errors in component rendering'
        },
        warning: {
          title: 'Performance Warning',
          message: 'High memory usage detected in DevOps deployment process'
        },
        info: {
          title: 'New Feature Available',
          message: 'Code preview with syntax highlighting is now available'
        },
        progress: {
          title: 'Agent Working',
          message: 'Product Manager is analyzing requirements and generating specifications'
        }
      }

      if (Math.random() < 0.3) { // 30% chance to add notification every interval
        addNotification({
          type: randomType,
          ...sampleNotifications[randomType],
          projectId: 'demo-project',
          agentType: 'backend',
          actionRequired: randomType === 'error' || randomType === 'warning'
        })
      }
    }, 10000) // Every 10 seconds

    return () => clearInterval(interval)
  }, [])

  return {
    notifications,
    addNotification,
    markAsRead,
    dismissNotification,
    markAllAsRead
  }
}

export default RealTimeNotificationsPanel
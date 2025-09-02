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
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />
      case 'warning':
        return <AlertCircle className="h-5 w-5 text-yellow-500" />
      case 'progress':
        return <Clock className="h-5 w-5 text-blue-500 animate-pulse" />
      default:
        return <Info className="h-5 w-5 text-blue-500" />
    }
  }

  const getNotificationBadge = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Success</Badge>
      case 'error':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Error</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">Warning</Badge>
      case 'progress':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">In Progress</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Info</Badge>
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
    <Card className={`border-0 shadow-xl bg-white ${className}`}>
      <CardHeader className="pb-4 bg-gradient-to-r from-slate-50 to-slate-100 border-b border-slate-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-md">
              <Bell className="h-4 w-4 text-white" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold text-slate-800">Live Notifications</CardTitle>
              {unreadCount > 0 && (
                <p className="text-xs text-slate-600 font-medium">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
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
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-1">
            <Button
              variant={filter === 'all' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('all')}
              className="text-xs px-3 py-1.5 h-7 font-medium"
            >
              All
            </Button>
            <Button
              variant={filter === 'unread' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('unread')}
              className="text-xs px-3 py-1.5 h-7 font-medium"
            >
              Unread
            </Button>
            <Button
              variant={filter === 'important' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setFilter('important')}
              className="text-xs px-3 py-1.5 h-7 font-medium"
            >
              Important
            </Button>
          </div>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onMarkAllRead}
              className="text-xs px-2 py-1.5 h-7 text-slate-600 hover:text-slate-800"
            >
              Mark all read
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[60vh] overflow-y-auto">
          <div className="p-4 space-y-3">
            {filteredNotifications.length === 0 ? (
              <div className="text-center py-8 text-slate-500">
                <div className="p-3 bg-slate-100 rounded-full w-12 h-12 mx-auto mb-3 flex items-center justify-center">
                  <Bell className="h-6 w-6 opacity-50" />
                </div>
                <p className="text-sm font-semibold mb-1">
                  {filter === 'unread' ? 'No unread notifications' : 
                   filter === 'important' ? 'No important notifications' : 
                   'No notifications yet'}
                </p>
                <p className="text-xs text-slate-400">Updates will appear here</p>
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
        group relative p-3 rounded-lg border transition-all duration-200 cursor-pointer hover:shadow-md
        ${notification.isRead 
          ? 'bg-slate-50 border-slate-200 hover:bg-slate-100' 
          : 'bg-white border-blue-200 shadow-sm hover:shadow-lg hover:border-blue-300'
        }
      `}
      onClick={handleClick}
    >
      {/* Enhanced unread indicator */}
      {!notification.isRead && (
        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1 h-6 bg-gradient-to-b from-blue-500 to-purple-600 rounded-r-full" />
      )}

      <div className="flex items-start space-x-3">
        <div className="flex-shrink-0 mt-1">
          <div className="p-1.5 bg-white rounded-md shadow-sm border border-slate-200">
            {getIcon(notification.type)}
          </div>
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between mb-2">
            <p className={`text-sm font-bold leading-tight ${
              notification.isRead ? 'text-slate-700' : 'text-slate-900'
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
                className="opacity-0 group-hover:opacity-100 transition-opacity w-5 h-5 p-0 hover:bg-slate-200"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <p className={`text-xs leading-relaxed mb-3 ${
            notification.isRead ? 'text-slate-500' : 'text-slate-700'
          }`}>
            {notification.message}
          </p>
          
          <div className="flex items-center justify-between">
            <p className="text-xs text-slate-400 font-medium">
              {formatDistanceToNow(new Date(notification.timestamp), { addSuffix: true })}
            </p>
            
            {notification.actionRequired && (
              <Badge variant="outline" className="text-xs text-orange-600 border-orange-200 px-2 py-0.5">
                Action Required
              </Badge>
            )}
          </div>
          
          {notification.projectId && (
            <div className="mt-2 text-xs text-slate-400 font-medium bg-slate-100 px-2 py-1 rounded">
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
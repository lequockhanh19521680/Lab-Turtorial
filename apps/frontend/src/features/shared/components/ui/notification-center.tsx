import React, { useState } from 'react'
import { Bell, X, Check, Info, AlertTriangle, AlertCircle, Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from './button'
import { Badge } from './badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from './dropdown-menu'

interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error' | 'feature'
  title: string
  message: string
  timestamp: Date
  read?: boolean
  actionLabel?: string
  actionUrl?: string
  priority?: 'low' | 'medium' | 'high'
}

interface NotificationCenterProps {
  notifications?: Notification[]
  onNotificationRead?: (id: string) => void
  onNotificationDismiss?: (id: string) => void
  onMarkAllRead?: () => void
  onNotificationAction?: (notification: Notification) => void
  className?: string
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({
  notifications = [],
  onNotificationRead,
  onNotificationDismiss,
  onMarkAllRead,
  onNotificationAction,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false)
  
  const unreadCount = notifications.filter(n => !n.read).length
  
  const getNotificationIcon = (type: Notification['type']) => {
    const iconProps = { className: 'w-4 h-4' }
    switch (type) {
      case 'success':
        return <Check {...iconProps} className="w-4 h-4 text-green-600" />
      case 'warning':
        return <AlertTriangle {...iconProps} className="w-4 h-4 text-yellow-600" />
      case 'error':
        return <AlertCircle {...iconProps} className="w-4 h-4 text-red-600" />
      case 'feature':
        return <Star {...iconProps} className="w-4 h-4 text-purple-600" />
      default:
        return <Info {...iconProps} className="w-4 h-4 text-blue-600" />
    }
  }
  
  const getNotificationColor = (type: Notification['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50/50 dark:bg-green-900/10'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-900/10'
      case 'error':
        return 'border-l-red-500 bg-red-50/50 dark:bg-red-900/10'
      case 'feature':
        return 'border-l-purple-500 bg-purple-50/50 dark:bg-purple-900/10'
      default:
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-900/10'
    }
  }
  
  const formatTimestamp = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    
    if (minutes < 1) return 'Just now'
    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    if (days < 7) return `${days}d ago`
    return date.toLocaleDateString()
  }
  
  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read && onNotificationRead) {
      onNotificationRead(notification.id)
    }
  }
  
  const handleActionClick = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onNotificationAction) {
      onNotificationAction(notification)
    }
  }
  
  const handleDismiss = (notification: Notification, e: React.MouseEvent) => {
    e.stopPropagation()
    if (onNotificationDismiss) {
      onNotificationDismiss(notification.id)
    }
  }

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn(
            'relative p-2 hover:bg-muted focus:bg-muted',
            className
          )}
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 min-w-[1.25rem] h-5 p-0 flex items-center justify-center text-xs font-bold bg-red-500 text-white border-2 border-background"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        align="end" 
        className="w-80 max-h-96 p-0 overflow-hidden"
        sideOffset={5}
      >
        <div className="bg-gradient-to-r from-primary to-cyan-500 text-white p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Notifications</h3>
            {unreadCount > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onMarkAllRead}
                className="text-white hover:bg-white/20 text-xs h-6 px-2"
              >
                Mark all read
              </Button>
            )}
          </div>
          {unreadCount > 0 && (
            <p className="text-sm opacity-90 mt-1">
              {unreadCount} new notification{unreadCount !== 1 ? 's' : ''}
            </p>
          )}
        </div>
        
        <div className="max-h-80 overflow-y-auto custom-scrollbar">
          {notifications.length === 0 ? (
            <div className="p-8 text-center">
              <Bell className="w-12 h-12 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground text-sm">No notifications yet</p>
              <p className="text-muted-foreground text-xs mt-1">
                You'll see updates about your projects here
              </p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    'p-4 border-l-4 cursor-pointer transition-all duration-200 hover:bg-muted/50',
                    getNotificationColor(notification.type),
                    !notification.read && 'bg-muted/30'
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start space-x-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <p className={cn(
                            'text-sm font-medium',
                            !notification.read && 'font-semibold'
                          )}>
                            {notification.title}
                          </p>
                          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                            {notification.message}
                          </p>
                        </div>
                        
                        <div className="flex items-center space-x-1 ml-2">
                          {!notification.read && (
                            <div className="w-2 h-2 bg-primary rounded-full" />
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => handleDismiss(notification, e)}
                            className="p-1 h-6 w-6 text-muted-foreground hover:text-foreground"
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTimestamp(notification.timestamp)}
                        </span>
                        
                        {notification.actionLabel && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={(e) => handleActionClick(notification, e)}
                            className="h-6 px-2 text-xs"
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                      </div>
                      
                      {notification.priority === 'high' && (
                        <Badge 
                          variant="destructive" 
                          className="mt-2 text-xs"
                        >
                          High Priority
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {notifications.length > 0 && (
          <div className="p-3 border-t border-border bg-muted/30">
            <Button 
              variant="ghost" 
              className="w-full text-sm text-muted-foreground hover:text-foreground"
              onClick={() => setIsOpen(false)}
            >
              View all notifications
            </Button>
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Mock data for development/testing
export const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'success',
    title: 'Project deployed successfully',
    message: 'Your "E-commerce Store" project has been deployed to production.',
    timestamp: new Date(Date.now() - 5 * 60 * 1000),
    actionLabel: 'View Live',
    actionUrl: 'https://your-project.com',
    priority: 'medium'
  },
  {
    id: '2',
    type: 'info',
    title: 'AI Agent completed backend generation',
    message: 'The backend engineer agent has finished creating your API endpoints and database schema.',
    timestamp: new Date(Date.now() - 15 * 60 * 1000),
    read: false,
    actionLabel: 'Review Code'
  },
  {
    id: '3',
    type: 'feature',
    title: 'New feature: Voice input',
    message: 'You can now use voice commands to describe your project requirements.',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
    read: true,
    actionLabel: 'Try Now'
  },
  {
    id: '4',
    type: 'warning',
    title: 'API rate limit approaching',
    message: 'You have used 80% of your monthly API quota. Consider upgrading your plan.',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
    read: false,
    priority: 'high',
    actionLabel: 'Upgrade'
  },
  {
    id: '5',
    type: 'error',
    title: 'Deployment failed',
    message: 'There was an issue deploying your "Blog Platform" project. Please check the logs.',
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
    read: true,
    priority: 'high',
    actionLabel: 'View Logs'
  }
]

export default NotificationCenter
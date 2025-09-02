import React, { useState, useEffect } from 'react'
import { Bell, BellRing, Heart, MessageCircle, Award, Users, Clock } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../features/shared/components/ui/avatar'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface Notification {
  id: string
  type: 'like' | 'comment' | 'follow' | 'achievement' | 'project' | 'mention'
  title: string
  message: string
  timestamp: string
  read: boolean
  priority: 'low' | 'medium' | 'high'
  actor?: {
    id: string
    name: string
    avatar?: string
  }
  actionUrl?: string
  data?: any
}

const mockNotifications: Notification[] = [
  {
    id: '1',
    type: 'like',
    title: 'New Like',
    message: 'Sarah Chen liked your project "E-commerce Platform"',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    read: false,
    priority: 'medium',
    actor: {
      id: 'sarah123',
      name: 'Sarah Chen',
      avatar: '/api/placeholder/40/40'
    },
    actionUrl: '/project/123'
  },
  {
    id: '2',
    type: 'follow',
    title: 'New Follower',
    message: 'Alex Johnson started following you',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    read: false,
    priority: 'high',
    actor: {
      id: 'alex456',
      name: 'Alex Johnson',
      avatar: '/api/placeholder/40/40'
    },
    actionUrl: '/profile/alex456'
  },
  {
    id: '3',
    type: 'achievement',
    title: 'Achievement Unlocked!',
    message: 'You earned the "Code Master" achievement for completing 10 projects',
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'high',
    actionUrl: '/achievements'
  },
  {
    id: '4',
    type: 'comment',
    title: 'New Comment',
    message: 'Maria Rodriguez commented on your project: "Great work on the UI design!"',
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    read: true,
    priority: 'medium',
    actor: {
      id: 'maria789',
      name: 'Maria Rodriguez',
      avatar: '/api/placeholder/40/40'
    },
    actionUrl: '/project/123#comments'
  }
]

interface NotificationCenterProps {
  notifications?: Notification[]
  onMarkAsRead?: (id: string) => void
  onMarkAllAsRead?: () => void
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ 
  notifications: propNotifications,
  onMarkAsRead: propOnMarkAsRead,
  onMarkAllAsRead: propOnMarkAllAsRead
}) => {
  const [notifications, setNotifications] = useState<Notification[]>(propNotifications || mockNotifications)
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    if (propNotifications) {
      setNotifications(propNotifications)
    }
    setUnreadCount(notifications.filter(n => !n.read).length)
  }, [propNotifications, notifications])

  const markAsRead = (notificationId: string) => {
    if (propOnMarkAsRead) {
      propOnMarkAsRead(notificationId)
    } else {
      setNotifications(prev => 
        prev.map(n => 
          n.id === notificationId ? { ...n, read: true } : n
        )
      )
      setUnreadCount(prev => Math.max(0, prev - 1))
    }
  }

  const markAllAsRead = () => {
    if (propOnMarkAllAsRead) {
      propOnMarkAllAsRead()
    } else {
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
      setUnreadCount(0)
    }
  }

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like': return <Heart className="h-4 w-4 text-red-500" />
      case 'comment': return <MessageCircle className="h-4 w-4 text-blue-500" />
      case 'follow': return <Users className="h-4 w-4 text-green-500" />
      case 'achievement': return <Award className="h-4 w-4 text-yellow-500" />
      case 'project': return <Clock className="h-4 w-4 text-purple-500" />
      default: return <Bell className="h-4 w-4 text-gray-500" />
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          {unreadCount > 0 ? (
            <BellRing className="h-5 w-5" />
          ) : (
            <Bell className="h-5 w-5" />
          )}
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 bg-red-500 text-white border-2 border-white min-w-[20px] h-5 text-xs flex items-center justify-center"
            >
              {unreadCount > 99 ? '99+' : unreadCount}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-96">
        <DropdownMenuLabel className="flex items-center justify-between">
          <span>Notifications</span>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs text-blue-600 hover:text-blue-700"
            >
              Mark all read
            </Button>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {notifications.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
            <p>No notifications yet</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            {notifications.slice(0, 10).map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${
                  !notification.read ? 'bg-blue-50/50' : ''
                }`}
                onClick={() => {
                  if (!notification.read) {
                    markAsRead(notification.id)
                  }
                  if (notification.actionUrl) {
                    console.log('Navigate to:', notification.actionUrl)
                  }
                }}
              >
                <div className="flex items-start space-x-3 w-full">
                  {notification.actor ? (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={notification.actor.avatar} />
                      <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-xs">
                        {notification.actor.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                  ) : (
                    <div className="p-2 bg-gray-100 rounded-full">
                      {getNotificationIcon(notification.type)}
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                      {notification.message}
                    </p>
                    <div className="flex items-center justify-between mt-1">
                      <p className="text-xs text-gray-500">
                        {formatDistanceToNow(new Date(notification.timestamp))} ago
                      </p>
                      {getNotificationIcon(notification.type)}
                    </div>
                  </div>
                </div>
              </DropdownMenuItem>
            ))}
            {notifications.length > 10 && (
              <DropdownMenuItem className="text-center text-blue-600 hover:text-blue-700">
                View all notifications
              </DropdownMenuItem>
            )}
          </div>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default NotificationCenter
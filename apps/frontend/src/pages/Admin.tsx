import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Users, 
  FolderOpen, 
  Activity, 
  TrendingUp, 
  Server, 
  Database,
  AlertTriangle,
  CheckCircle,
  Clock,
  BarChart3
} from 'lucide-react'

interface AdminStats {
  totalUsers: number
  activeUsers: number
  totalProjects: number
  activeProjects: number
  completedProjects: number
  systemHealth: 'healthy' | 'warning' | 'critical'
  serverUptime: string
  dbConnections: number
}

interface RecentActivity {
  id: string
  type: 'user_registered' | 'project_created' | 'project_completed'
  user: string
  description: string
  timestamp: string
}

const Admin: React.FC = () => {
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 1247,
    activeUsers: 89,
    totalProjects: 156,
    activeProjects: 23,
    completedProjects: 128,
    systemHealth: 'healthy',
    serverUptime: '99.9%',
    dbConnections: 45
  })

  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([
    {
      id: '1',
      type: 'user_registered',
      user: 'john.doe@example.com',
      description: 'New user registered',
      timestamp: '2 minutes ago'
    },
    {
      id: '2',
      type: 'project_completed',
      user: 'alice.smith@example.com',
      description: 'Completed E-commerce Platform project',
      timestamp: '5 minutes ago'
    },
    {
      id: '3',
      type: 'project_created',
      user: 'bob.wilson@example.com',
      description: 'Created new Task Management App project',
      timestamp: '12 minutes ago'
    },
    {
      id: '4',
      type: 'user_registered',
      user: 'sarah.johnson@example.com',
      description: 'New user registered',
      timestamp: '18 minutes ago'
    },
    {
      id: '5',
      type: 'project_completed',
      user: 'mike.brown@example.com',
      description: 'Completed Blog Platform project',
      timestamp: '25 minutes ago'
    }
  ])

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'user_registered':
        return <Users className="h-4 w-4 text-blue-500" />
      case 'project_created':
        return <FolderOpen className="h-4 w-4 text-green-500" />
      case 'project_completed':
        return <CheckCircle className="h-4 w-4 text-purple-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getHealthBadge = (health: string) => {
    switch (health) {
      case 'healthy':
        return <Badge className="bg-green-100 text-green-700">Healthy</Badge>
      case 'warning':
        return <Badge className="bg-yellow-100 text-yellow-700">Warning</Badge>
      case 'critical':
        return <Badge className="bg-red-100 text-red-700">Critical</Badge>
      default:
        return <Badge className="bg-gray-100 text-gray-700">Unknown</Badge>
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-1">Monitor and manage the Lab Tutorial platform</p>
        </div>
        <div className="flex items-center space-x-2">
          <Badge className="bg-blue-100 text-blue-700">Admin Access</Badge>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeUsers} active today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProjects} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Projects</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completedProjects}</div>
            <p className="text-xs text-muted-foreground">
              +15.2% from last month
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              {getHealthBadge(stats.systemHealth)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stats.serverUptime} uptime
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Recent Activity</span>
            </CardTitle>
            <CardDescription>
              Latest user and system activities across the platform
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
                  {getActivityIcon(activity.type)}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">
                      {activity.description}
                    </p>
                    <p className="text-sm text-gray-600">
                      {activity.user}
                    </p>
                  </div>
                  <div className="flex items-center text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    {activity.timestamp}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" className="w-full">
                View All Activity
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* System Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>System Overview</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Database Connections</span>
                <span className="font-medium">{stats.dbConnections}/100</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full" 
                  style={{ width: `${(stats.dbConnections / 100) * 100}%` }}
                ></div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Server Uptime</span>
                <span className="font-medium">{stats.serverUptime}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full w-full"></div>
              </div>
            </div>

            <div className="pt-4 border-t space-y-2">
              <Button variant="outline" className="w-full" size="sm">
                <Database className="h-4 w-4 mr-2" />
                Database Status
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <TrendingUp className="h-4 w-4 mr-2" />
                Analytics
              </Button>
              <Button variant="outline" className="w-full" size="sm">
                <AlertTriangle className="h-4 w-4 mr-2" />
                System Logs
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common administrative tasks and system management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Users className="h-6 w-6" />
              <span>Manage Users</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <FolderOpen className="h-6 w-6" />
              <span>View All Projects</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <BarChart3 className="h-6 w-6" />
              <span>System Reports</span>
            </Button>
            <Button variant="outline" className="h-20 flex flex-col space-y-2">
              <Server className="h-6 w-6" />
              <span>Server Health</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Admin
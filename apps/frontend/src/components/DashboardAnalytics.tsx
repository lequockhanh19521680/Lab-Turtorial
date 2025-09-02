import React from 'react'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  Area,
  AreaChart
} from 'recharts'
import { TrendingUp, TrendingDown, Activity, Users, Clock, CheckCircle } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card'
import { Badge } from '@/features/shared/components/ui/badge'

// Sample data for charts
const projectStatsData = [
  { month: 'Jan', created: 12, completed: 8, failed: 2 },
  { month: 'Feb', created: 18, completed: 15, failed: 1 },
  { month: 'Mar', created: 24, completed: 20, failed: 3 },
  { month: 'Apr', created: 30, completed: 25, failed: 2 },
  { month: 'May', created: 35, completed: 28, failed: 4 },
  { month: 'Jun', created: 42, completed: 35, failed: 3 },
]

const techStackData = [
  { name: 'React', value: 35, color: '#0066FF' },
  { name: 'Vue.js', value: 25, color: '#00CCFF' },
  { name: 'Angular', value: 20, color: '#8B5CF6' },
  { name: 'Svelte', value: 12, color: '#10B981' },
  { name: 'Other', value: 8, color: '#F59E0B' },
]

const performanceData = [
  { time: '00:00', projects: 12, users: 8 },
  { time: '04:00', projects: 8, users: 5 },
  { time: '08:00', projects: 25, users: 18 },
  { time: '12:00', projects: 35, users: 28 },
  { time: '16:00', projects: 30, users: 25 },
  { time: '20:00', projects: 20, users: 15 },
]

interface AnalyticsCardProps {
  title: string
  value: string | number
  change: number
  changeLabel: string
  icon: React.ReactNode
  trend?: 'up' | 'down' | 'neutral'
  className?: string
}

const AnalyticsCard: React.FC<AnalyticsCardProps> = ({
  title,
  value,
  change,
  changeLabel,
  icon,
  trend = 'neutral',
  className = ''
}) => {
  const getTrendIcon = () => {
    if (trend === 'up') return <TrendingUp className="h-4 w-4 text-green-500" />
    if (trend === 'down') return <TrendingDown className="h-4 w-4 text-red-500" />
    return <Activity className="h-4 w-4 text-gray-500" />
  }

  const getTrendColor = () => {
    if (trend === 'up') return 'text-green-600 bg-green-50 dark:bg-green-900/20 dark:text-green-400'
    if (trend === 'down') return 'text-red-600 bg-red-50 dark:bg-red-900/20 dark:text-red-400'
    return 'text-gray-600 bg-gray-50 dark:bg-gray-900/20 dark:text-gray-400'
  }

  return (
    <Card className={`card-interactive ${className}`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold text-foreground mb-2">
          {value}
        </div>
        <div className="flex items-center space-x-2">
          {getTrendIcon()}
          <Badge className={`text-xs ${getTrendColor()}`}>
            {change > 0 ? '+' : ''}{change}% {changeLabel}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}

interface ProjectTrendsChartProps {
  className?: string
}

const ProjectTrendsChart: React.FC<ProjectTrendsChartProps> = ({ className = '' }) => {
  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Project Trends</CardTitle>
        <p className="text-sm text-muted-foreground">
          Monthly project creation and completion rates
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={projectStatsData}>
            <defs>
              <linearGradient id="createdGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0066FF" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#0066FF" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="completedGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10B981" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Area 
              type="monotone" 
              dataKey="created" 
              stroke="#0066FF" 
              strokeWidth={2}
              fill="url(#createdGradient)"
              name="Created"
            />
            <Area 
              type="monotone" 
              dataKey="completed" 
              stroke="#10B981" 
              strokeWidth={2}
              fill="url(#completedGradient)"
              name="Completed"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface TechStackChartProps {
  className?: string
}

const TechStackChart: React.FC<TechStackChartProps> = ({ className = '' }) => {
  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Technology Stack Usage</CardTitle>
        <p className="text-sm text-muted-foreground">
          Popular frameworks in your projects
        </p>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <ResponsiveContainer width="60%" height={200}>
            <PieChart>
              <Pie
                data={techStackData}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {techStackData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e2e8f0',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div className="flex-1 space-y-3">
            {techStackData.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div 
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: item.color }}
                  />
                  <span className="text-sm font-medium">{item.name}</span>
                </div>
                <span className="text-sm text-muted-foreground">
                  {item.value}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface PerformanceChartProps {
  className?: string
}

const PerformanceChart: React.FC<PerformanceChartProps> = ({ className = '' }) => {
  return (
    <Card className={`${className}`}>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Real-time Activity</CardTitle>
        <p className="text-sm text-muted-foreground">
          Project creation and user activity throughout the day
        </p>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={250}>
          <LineChart data={performanceData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="time" 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              tick={{ fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
              }}
            />
            <Line 
              type="monotone" 
              dataKey="projects" 
              stroke="#0066FF" 
              strokeWidth={3}
              dot={{ fill: '#0066FF', strokeWidth: 2, r: 4 }}
              name="Projects"
            />
            <Line 
              type="monotone" 
              dataKey="users" 
              stroke="#8B5CF6" 
              strokeWidth={3}
              dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
              name="Active Users"
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

interface DashboardAnalyticsProps {
  className?: string
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ className = '' }) => {
  // Sample analytics data - in real app this would come from API
  const analyticsData = {
    totalProjects: 156,
    activeProjects: 23,
    completedProjects: 128,
    totalUsers: 1247,
    projectsChange: 12.5,
    usersChange: 8.3,
    completionChange: 15.2,
    activityChange: -2.1
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Analytics Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AnalyticsCard
          title="Total Projects"
          value={analyticsData.totalProjects}
          change={analyticsData.projectsChange}
          changeLabel="vs last month"
          icon={<Activity className="h-4 w-4 text-primary" />}
          trend="up"
        />
        
        <AnalyticsCard
          title="Active Projects"
          value={analyticsData.activeProjects}
          change={analyticsData.activityChange}
          changeLabel="vs last week"
          icon={<Clock className="h-4 w-4 text-yellow-500" />}
          trend="down"
        />
        
        <AnalyticsCard
          title="Completed"
          value={analyticsData.completedProjects}
          change={analyticsData.completionChange}
          changeLabel="this month"
          icon={<CheckCircle className="h-4 w-4 text-green-500" />}
          trend="up"
        />
        
        <AnalyticsCard
          title="Total Users"
          value={analyticsData.totalUsers.toLocaleString()}
          change={analyticsData.usersChange}
          changeLabel="new users"
          icon={<Users className="h-4 w-4 text-purple-500" />}
          trend="up"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ProjectTrendsChart className="lg:col-span-2" />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <TechStackChart />
        <PerformanceChart />
      </div>
    </div>
  )
}

export default DashboardAnalytics
export { AnalyticsCard, ProjectTrendsChart, TechStackChart, PerformanceChart }
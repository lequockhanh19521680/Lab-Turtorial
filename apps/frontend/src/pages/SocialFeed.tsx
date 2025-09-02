import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { 
  Heart, 
  MessageCircle, 
  Share2, 
  MoreHorizontal,
  Calendar,
  User,
  ArrowUpRight,
  TrendingUp,
  Users,
  Star,
  Eye,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../features/shared/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

// Mock data for social feed
const mockFeedData = [
  {
    id: 1,
    user: {
      name: 'Sarah Chen',
      username: 'sarahc_dev',
      avatar: '/api/placeholder/40/40',
      verified: true
    },
    project: {
      name: 'E-commerce Platform',
      description: 'Built a full-stack e-commerce platform with React and Node.js',
      status: 'COMPLETED',
      createdAt: '2024-01-20T14:30:00.000Z',
      technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
      likes: 42,
      comments: 8,
      shares: 3,
      views: 156
    },
    timestamp: '2 hours ago'
  },
  {
    id: 2,
    user: {
      name: 'Alex Johnson',
      username: 'alexj_builds',
      avatar: '/api/placeholder/40/40',
      verified: false
    },
    project: {
      name: 'Task Management App',
      description: 'Creating a collaborative task management tool with real-time updates',
      status: 'IN_PROGRESS',
      createdAt: '2024-01-19T16:45:00.000Z',
      technologies: ['Vue.js', 'Express', 'MongoDB', 'Socket.io'],
      likes: 28,
      comments: 12,
      shares: 5,
      views: 89
    },
    timestamp: '4 hours ago'
  },
  {
    id: 3,
    user: {
      name: 'Maria Rodriguez',
      username: 'maria_codes',
      avatar: '/api/placeholder/40/40',
      verified: true
    },
    project: {
      name: 'AI Content Generator',
      description: 'Built an AI-powered content generation tool for social media',
      status: 'COMPLETED',
      createdAt: '2024-01-18T09:15:00.000Z',
      technologies: ['Python', 'OpenAI API', 'Flask', 'React'],
      likes: 78,
      comments: 23,
      shares: 15,
      views: 234
    },
    timestamp: '1 day ago'
  },
  {
    id: 4,
    user: {
      name: 'David Kim',
      username: 'davidk_dev',
      avatar: '/api/placeholder/40/40',
      verified: false
    },
    project: {
      name: 'Weather Dashboard',
      description: 'Interactive weather dashboard with location-based forecasts',
      status: 'COMPLETED',
      createdAt: '2024-01-17T11:20:00.000Z',
      technologies: ['JavaScript', 'Chart.js', 'Weather API', 'CSS'],
      likes: 35,
      comments: 6,
      shares: 2,
      views: 112
    },
    timestamp: '2 days ago'
  }
]

const trendingTopics = [
  { tag: 'react', projects: 45 },
  { tag: 'nodejs', projects: 38 },
  { tag: 'ai', projects: 29 },
  { tag: 'ecommerce', projects: 22 },
  { tag: 'dashboard', projects: 18 }
]

const SocialFeed: React.FC = () => {
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'following' | 'trending' | 'completed' | 'in-progress'>('all')
  const [sortBy, setSortBy] = useState<'recent' | 'popular' | 'views'>('recent')

  const filteredFeedData = mockFeedData.filter(item => {
    if (selectedFilter === 'all') return true
    if (selectedFilter === 'completed') return item.project.status === 'COMPLETED'
    if (selectedFilter === 'in-progress') return item.project.status === 'IN_PROGRESS'
    // Add more filtering logic as needed
    return true
  })

  const sortedFeedData = [...filteredFeedData].sort((a, b) => {
    if (sortBy === 'popular') return b.project.likes - a.project.likes
    if (sortBy === 'views') return b.project.views - a.project.views
    return new Date(b.project.createdAt).getTime() - new Date(a.project.createdAt).getTime()
  })
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set())
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set())

  const handleLike = (postId: number) => {
    setLikedPosts(prev => {
      const newSet = new Set(prev)
      if (newSet.has(postId)) {
        newSet.delete(postId)
      } else {
        newSet.add(postId)
      }
      return newSet
    })
  }

  const handleFollow = (username: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(username)) {
        newSet.delete(username)
      } else {
        newSet.add(username)
      }
      return newSet
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0">Completed</Badge>
      case 'IN_PROGRESS':
        return <Badge className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0">In Progress</Badge>
      default:
        return <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white border-0">Pending</Badge>
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-primary/10 to-accent/10 rounded-full blur-3xl animate-pulse-slow"></div>
        <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-accent/10 to-primary/10 rounded-full blur-3xl animate-float"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Feed */}
          <div className="lg:col-span-3 space-y-6">
            {/* Header with Filters */}
            <div className="space-y-4">
              <div className="space-y-2">
                <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
                  Social Feed
                </h1>
                <p className="text-muted-foreground text-lg">Discover amazing projects from the community</p>
              </div>
              
              {/* Filter and Sort Controls */}
              <div className="flex flex-wrap gap-4 items-center justify-between bg-white/50 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant={selectedFilter === 'all' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedFilter('all')}
                  >
                    All Projects
                  </Button>
                  <Button 
                    variant={selectedFilter === 'trending' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedFilter('trending')}
                  >
                    <TrendingUp className="h-4 w-4 mr-1" />
                    Trending
                  </Button>
                  <Button 
                    variant={selectedFilter === 'completed' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedFilter('completed')}
                  >
                    Completed
                  </Button>
                  <Button 
                    variant={selectedFilter === 'in-progress' ? 'default' : 'outline'} 
                    size="sm"
                    onClick={() => setSelectedFilter('in-progress')}
                  >
                    In Progress
                  </Button>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground">Sort by:</span>
                  <Button 
                    variant={sortBy === 'recent' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setSortBy('recent')}
                  >
                    Recent
                  </Button>
                  <Button 
                    variant={sortBy === 'popular' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setSortBy('popular')}
                  >
                    Popular
                  </Button>
                  <Button 
                    variant={sortBy === 'views' ? 'default' : 'ghost'} 
                    size="sm"
                    onClick={() => setSortBy('views')}
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    Views
                  </Button>
                </div>
              </div>
            </div>

            {/* Feed Items */}
            <div className="space-y-6">
              {sortedFeedData.map((item) => (
                <Card key={item.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 bg-white/80 backdrop-blur-sm">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={item.user.avatar} />
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                            {item.user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <h3 className="font-semibold text-slate-800">{item.user.name}</h3>
                            {item.user.verified && (
                              <Star className="h-4 w-4 text-blue-500 fill-current" />
                            )}
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-slate-500">
                            <span>@{item.user.username}</span>
                            <span>•</span>
                            <span>{item.timestamp}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant={followedUsers.has(item.user.username) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFollow(item.user.username)}
                          className={followedUsers.has(item.user.username) 
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white" 
                            : ""
                          }
                        >
                          {followedUsers.has(item.user.username) ? 'Following' : 'Follow'}
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              Share Project
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              Report Content
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {/* Project Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xl font-bold text-slate-800">{item.project.name}</h4>
                        {getStatusBadge(item.project.status)}
                      </div>
                      <p className="text-slate-600">{item.project.description}</p>
                      
                      {/* Technologies */}
                      <div className="flex flex-wrap gap-2">
                        {item.project.technologies.map((tech, index) => (
                          <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-700">
                            {tech}
                          </Badge>
                        ))}
                      </div>

                      {/* Project Meta */}
                      <div className="flex items-center space-x-4 text-sm text-slate-500">
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>Created {format(new Date(item.project.createdAt), 'MMM d, yyyy')}</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{item.project.views} views</span>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center justify-between pt-4 border-t border-slate-200">
                      <div className="flex items-center space-x-6">
                        <button
                          onClick={() => handleLike(item.id)}
                          className={`flex items-center space-x-2 transition-colors ${
                            likedPosts.has(item.id) 
                              ? 'text-red-500' 
                              : 'text-slate-500 hover:text-red-500'
                          }`}
                        >
                          <Heart className={`h-5 w-5 ${likedPosts.has(item.id) ? 'fill-current' : ''}`} />
                          <span className="text-sm font-medium">
                            {item.project.likes + (likedPosts.has(item.id) ? 1 : 0)}
                          </span>
                        </button>
                        <button className="flex items-center space-x-2 text-slate-500 hover:text-blue-500 transition-colors">
                          <MessageCircle className="h-5 w-5" />
                          <span className="text-sm font-medium">{item.project.comments}</span>
                        </button>
                        <button className="flex items-center space-x-2 text-slate-500 hover:text-green-500 transition-colors">
                          <Share2 className="h-5 w-5" />
                          <span className="text-sm font-medium">{item.project.shares}</span>
                        </button>
                      </div>
                      <Button variant="outline" size="sm" asChild>
                        <Link to={`/project/${item.id}`}>
                          <ArrowUpRight className="h-4 w-4 mr-1" />
                          View Project
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Load More */}
            <div className="text-center py-8">
              <Button variant="outline" className="border-slate-200 hover:bg-slate-50">
                Load More Posts
              </Button>
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Trending Topics */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-orange-500" />
                  <span>Trending Topics</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {trendingTopics.map((topic, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer">
                    <div>
                      <p className="font-medium text-slate-800">#{topic.tag}</p>
                      <p className="text-sm text-slate-500">{topic.projects} projects</p>
                    </div>
                    <Badge variant="secondary" className="bg-orange-100 text-orange-700">
                      {index + 1}
                    </Badge>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Community Stats */}
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-blue-500" />
                  <span>Community</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Active Users</span>
                    <span className="font-semibold text-blue-600">1,234</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">Projects Created</span>
                    <span className="font-semibold text-green-600">5,678</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-slate-600">This Week</span>
                    <span className="font-semibold text-purple-600">234</span>
                  </div>
                </div>
                <div className="pt-2 border-t border-slate-200">
                  <Button variant="outline" className="w-full" asChild>
                    <Link to="/community">
                      Join Discussions
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-purple-50">
              <CardHeader>
                <CardTitle className="text-slate-800">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button asChild className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <Link to="/create">
                    <Plus className="h-4 w-4 mr-2" />
                    Create Project
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full">
                  <Link to="/profile">
                    <User className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SocialFeed
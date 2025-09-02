import React, { useState, useEffect } from 'react'
import { X, Users, Heart, MessageCircle, Share2, MoreHorizontal, Star, TrendingUp, Plus } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../features/shared/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import UserRecommendations from './UserRecommendations'

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
  }
]

const trendingTopics = [
  { tag: 'react', projects: 45 },
  { tag: 'nodejs', projects: 38 },
  { tag: 'ai', projects: 29 },
  { tag: 'ecommerce', projects: 22 },
  { tag: 'dashboard', projects: 18 }
]

interface FloatingSocialFeedProps {
  isOpen: boolean
  onClose: () => void
}

const FloatingSocialFeed: React.FC<FloatingSocialFeedProps> = ({ isOpen, onClose }) => {
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

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl h-[80vh] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-purple-600">
            <div className="flex items-center space-x-3">
              <Users className="h-6 w-6 text-white" />
              <h2 className="text-xl font-bold text-white">Social Feed</h2>
              <Badge className="bg-white/20 text-white border-0">
                Live
              </Badge>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {/* Content */}
          <div className="flex h-full">
            {/* Main Feed */}
            <div className="flex-1 overflow-y-auto p-6">
              <div className="space-y-4">
                {mockFeedData.map((item) => (
                  <Card key={item.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                            <AvatarImage src={item.user.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold text-sm">
                              {item.user.name.split(' ').map(n => n[0]).join('')}
                            </AvatarFallback>
                          </Avatar>
                          <div className="space-y-1">
                            <div className="flex items-center space-x-2">
                              <h3 className="font-semibold text-sm">{item.user.name}</h3>
                              {item.user.verified && (
                                <Star className="h-3 w-3 text-blue-500 fill-current" />
                              )}
                            </div>
                            <div className="flex items-center space-x-2 text-xs text-gray-500">
                              <span>@{item.user.username}</span>
                              <span>•</span>
                              <span>{item.timestamp}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant={followedUsers.has(item.user.username) ? "default" : "outline"}
                          size="sm"
                          onClick={() => handleFollow(item.user.username)}
                          className={followedUsers.has(item.user.username) 
                            ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs" 
                            : "text-xs"
                          }
                        >
                          {followedUsers.has(item.user.username) ? 'Following' : 'Follow'}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3 pt-0">
                      {/* Project Info */}
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-bold text-sm">{item.project.name}</h4>
                          {getStatusBadge(item.project.status)}
                        </div>
                        <p className="text-gray-600 text-sm">{item.project.description}</p>
                        
                        {/* Technologies */}
                        <div className="flex flex-wrap gap-1">
                          {item.project.technologies.slice(0, 3).map((tech, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {tech}
                            </Badge>
                          ))}
                          {item.project.technologies.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.project.technologies.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                        <div className="flex items-center space-x-4">
                          <button
                            onClick={() => handleLike(item.id)}
                            className={`flex items-center space-x-1 transition-colors text-xs ${
                              likedPosts.has(item.id) 
                                ? 'text-red-500' 
                                : 'text-gray-500 hover:text-red-500'
                            }`}
                          >
                            <Heart className={`h-4 w-4 ${likedPosts.has(item.id) ? 'fill-current' : ''}`} />
                            <span>{item.project.likes + (likedPosts.has(item.id) ? 1 : 0)}</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-blue-500 transition-colors text-xs">
                            <MessageCircle className="h-4 w-4" />
                            <span>{item.project.comments}</span>
                          </button>
                          <button className="flex items-center space-x-1 text-gray-500 hover:text-green-500 transition-colors text-xs">
                            <Share2 className="h-4 w-4" />
                            <span>{item.project.shares}</span>
                          </button>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-6 w-6">
                              <MoreHorizontal className="h-3 w-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem className="text-xs">
                              View Project
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">
                              Share Project
                            </DropdownMenuItem>
                            <DropdownMenuItem className="text-xs">
                              Report Content
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            {/* Sidebar */}
            <div className="w-80 border-l border-gray-200 bg-gray-50 p-4 overflow-y-auto">
              <div className="space-y-4">
                {/* User Recommendations */}
                <UserRecommendations 
                  onFollow={(userId) => console.log('Follow user:', userId)}
                  className="mb-4"
                />

                {/* Trending Topics */}
                <Card className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <CardTitle className="flex items-center space-x-2 text-sm">
                      <TrendingUp className="h-4 w-4 text-orange-500" />
                      <span>Trending</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {trendingTopics.slice(0, 5).map((topic, index) => (
                        <div key={index} className="flex items-center justify-between p-2 rounded-lg hover:bg-gray-100 transition-colors cursor-pointer">
                          <div>
                            <p className="font-medium text-xs">#{topic.tag}</p>
                            <p className="text-xs text-gray-500">{topic.projects} projects</p>
                          </div>
                          <Badge variant="secondary" className="text-xs">
                            {index + 1}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-sm bg-gradient-to-br from-blue-50 to-purple-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Quick Actions</CardTitle>
                  </CardHeader>
                  <CardContent className="pt-0 space-y-2">
                    <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs">
                      <Plus className="h-3 w-3 mr-1" />
                      Create Project
                    </Button>
                    <Button variant="outline" className="w-full text-xs">
                      Join Discussions
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FloatingSocialFeed
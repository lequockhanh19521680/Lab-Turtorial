import React, { useState, useEffect } from 'react'
import { Users, UserPlus, Star, TrendingUp, Award } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'

interface RecommendedUser {
  id: string
  name: string
  username: string
  avatar?: string
  verified: boolean
  followers: number
  mutualConnections: number
  skills: string[]
  projects: number
  engagementScore: number
  reason: string
}

// Mock data for user recommendations
const mockRecommendations: RecommendedUser[] = [
  {
    id: '1',
    name: 'Alex Chen',
    username: 'alexc_builds',
    avatar: '/api/placeholder/40/40',
    verified: true,
    followers: 1234,
    mutualConnections: 5,
    skills: ['React', 'Node.js', 'TypeScript'],
    projects: 23,
    engagementScore: 94,
    reason: 'Similar interests in React development'
  },
  {
    id: '2',
    name: 'Sofia Rodriguez',
    username: 'sofia_codes',
    avatar: '/api/placeholder/40/40',
    verified: false,
    followers: 892,
    mutualConnections: 3,
    skills: ['Python', 'AI/ML', 'Django'],
    projects: 18,
    engagementScore: 87,
    reason: 'Active in AI/ML projects'
  },
  {
    id: '3',
    name: 'Marcus Johnson',
    username: 'marcusj_dev',
    avatar: '/api/placeholder/40/40',
    verified: true,
    followers: 2156,
    mutualConnections: 7,
    skills: ['Vue.js', 'AWS', 'DevOps'],
    projects: 31,
    engagementScore: 92,
    reason: 'Followed by people you follow'
  },
  {
    id: '4',
    name: 'Emma Wilson',
    username: 'emma_designs',
    avatar: '/api/placeholder/40/40',
    verified: false,
    followers: 567,
    mutualConnections: 2,
    skills: ['UI/UX', 'Figma', 'React'],
    projects: 12,
    engagementScore: 85,
    reason: 'Complementary skills to yours'
  }
]

interface UserRecommendationsProps {
  onFollow?: (userId: string) => void
  className?: string
}

const UserRecommendations: React.FC<UserRecommendationsProps> = ({ 
  onFollow, 
  className = "" 
}) => {
  const [recommendations, setRecommendations] = useState<RecommendedUser[]>([])
  const [followedUsers, setFollowedUsers] = useState<Set<string>>(new Set())
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulate loading recommendations
    setTimeout(() => {
      setRecommendations(mockRecommendations)
      setIsLoading(false)
    }, 1000)
  }, [])

  const handleFollow = (userId: string) => {
    setFollowedUsers(prev => {
      const newSet = new Set(prev)
      if (newSet.has(userId)) {
        newSet.delete(userId)
      } else {
        newSet.add(userId)
      }
      return newSet
    })

    if (onFollow) {
      onFollow(userId)
    }
  }

  const getEngagementColor = (score: number) => {
    if (score >= 90) return 'text-green-600 bg-green-100'
    if (score >= 80) return 'text-blue-600 bg-blue-100'
    if (score >= 70) return 'text-yellow-600 bg-yellow-100'
    return 'text-gray-600 bg-gray-100'
  }

  if (isLoading) {
    return (
      <Card className={`border-0 shadow-lg ${className}`}>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5 text-blue-500" />
            <span>Recommended for You</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-24 mb-1"></div>
                    <div className="h-3 bg-gray-200 rounded w-16"></div>
                  </div>
                  <div className="h-8 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-0 shadow-lg ${className}`}>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Users className="h-5 w-5 text-blue-500" />
          <span>Recommended for You</span>
          <Badge className="bg-blue-100 text-blue-700 text-xs">
            AI Powered
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recommendations.map((user) => (
            <div 
              key={user.id} 
              className="group p-4 rounded-xl border border-gray-100 hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
            >
              <div className="flex items-start space-x-3">
                <div className="relative">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={user.avatar} />
                    <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white font-semibold">
                      {user.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  {user.verified && (
                    <div className="absolute -top-1 -right-1 w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                      <Star className="h-3 w-3 text-white fill-current" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">
                        {user.name}
                      </h3>
                      <p className="text-gray-500 text-xs">@{user.username}</p>
                    </div>
                    <Button
                      size="sm"
                      variant={followedUsers.has(user.id) ? "default" : "outline"}
                      onClick={() => handleFollow(user.id)}
                      className={
                        followedUsers.has(user.id)
                          ? "bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white text-xs"
                          : "text-xs hover:bg-blue-50 border-blue-200"
                      }
                    >
                      {followedUsers.has(user.id) ? (
                        <span>Following</span>
                      ) : (
                        <>
                          <UserPlus className="h-3 w-3 mr-1" />
                          Follow
                        </>
                      )}
                    </Button>
                  </div>

                  <div className="mt-2 flex items-center space-x-4 text-xs text-gray-500">
                    <span>{user.followers.toLocaleString()} followers</span>
                    <span>{user.projects} projects</span>
                    {user.mutualConnections > 0 && (
                      <span className="text-blue-600 font-medium">
                        {user.mutualConnections} mutual
                      </span>
                    )}
                  </div>

                  <div className="mt-2 flex items-center space-x-2">
                    <Badge 
                      className={`text-xs ${getEngagementColor(user.engagementScore)}`}
                    >
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {user.engagementScore}% active
                    </Badge>
                    {user.engagementScore >= 90 && (
                      <Badge className="bg-gradient-to-r from-yellow-100 to-orange-100 text-yellow-700 text-xs">
                        <Award className="h-3 w-3 mr-1" />
                        Top Creator
                      </Badge>
                    )}
                  </div>

                  <div className="mt-2">
                    <div className="flex flex-wrap gap-1">
                      {user.skills.slice(0, 3).map((skill, index) => (
                        <Badge 
                          key={index} 
                          variant="secondary" 
                          className="text-xs bg-gray-100 text-gray-700"
                        >
                          {skill}
                        </Badge>
                      ))}
                      {user.skills.length > 3 && (
                        <Badge 
                          variant="secondary" 
                          className="text-xs bg-gray-100 text-gray-700"
                        >
                          +{user.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <p className="mt-2 text-xs text-gray-600 italic">
                    {user.reason}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t border-gray-100">
          <Button 
            variant="ghost" 
            className="w-full text-sm text-blue-600 hover:text-blue-700 hover:bg-blue-50"
          >
            View All Recommendations
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

export default UserRecommendations
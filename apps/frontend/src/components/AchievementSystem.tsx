import React, { useState, useEffect } from 'react'
import { Award, Star, Trophy, Target, Zap, Users, Heart, Code, Calendar } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Badge } from './ui/badge'
import { Progress } from '../features/shared/components/ui/progress'

interface Achievement {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  category: 'social' | 'technical' | 'engagement' | 'milestone'
  difficulty: 'bronze' | 'silver' | 'gold' | 'platinum'
  points: number
  unlocked: boolean
  unlockedAt?: string
  progress?: {
    current: number
    target: number
  }
  requirement: string
}

const mockAchievements: Achievement[] = [
  {
    id: '1',
    name: 'First Steps',
    description: 'Created your first project',
    icon: <Star className="h-5 w-5" />,
    category: 'milestone',
    difficulty: 'bronze',
    points: 50,
    unlocked: true,
    unlockedAt: '2024-01-15',
    requirement: 'Create 1 project'
  },
  {
    id: '2',
    name: 'Code Master',
    description: 'Completed 10 projects successfully',
    icon: <Code className="h-5 w-5" />,
    category: 'technical',
    difficulty: 'silver',
    points: 200,
    unlocked: true,
    unlockedAt: '2024-01-20',
    requirement: 'Complete 10 projects'
  },
  {
    id: '3',
    name: 'Social Butterfly',
    description: 'Gained 100 followers',
    icon: <Users className="h-5 w-5" />,
    category: 'social',
    difficulty: 'gold',
    points: 300,
    unlocked: false,
    progress: {
      current: 67,
      target: 100
    },
    requirement: 'Gain 100 followers'
  },
  {
    id: '4',
    name: 'Community Favorite',
    description: 'Received 500 likes on your projects',
    icon: <Heart className="h-5 w-5" />,
    category: 'engagement',
    difficulty: 'gold',
    points: 350,
    unlocked: false,
    progress: {
      current: 342,
      target: 500
    },
    requirement: 'Receive 500 total likes'
  },
  {
    id: '5',
    name: 'Speed Demon',
    description: 'Deployed a project in under 30 minutes',
    icon: <Zap className="h-5 w-5" />,
    category: 'technical',
    difficulty: 'platinum',
    points: 500,
    unlocked: false,
    requirement: 'Deploy project < 30 minutes'
  },
  {
    id: '6',
    name: 'Consistent Creator',
    description: 'Created projects for 7 consecutive days',
    icon: <Calendar className="h-5 w-5" />,
    category: 'milestone',
    difficulty: 'silver',
    points: 250,
    unlocked: false,
    progress: {
      current: 4,
      target: 7
    },
    requirement: 'Create projects 7 days in a row'
  },
  {
    id: '7',
    name: 'Legend',
    description: 'Reached 10,000 total platform points',
    icon: <Trophy className="h-5 w-5" />,
    category: 'milestone',
    difficulty: 'platinum',
    points: 1000,
    unlocked: false,
    progress: {
      current: 6850,
      target: 10000
    },
    requirement: 'Earn 10,000 total points'
  }
]

interface AchievementSystemProps {
  compact?: boolean
  className?: string
}

const AchievementSystem: React.FC<AchievementSystemProps> = ({ 
  compact = false, 
  className = "" 
}) => {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userStats, setUserStats] = useState({
    totalPoints: 0,
    unlockedCount: 0,
    rank: 'Beginner',
    nextRankPoints: 1000
  })
  const [selectedCategory, setSelectedCategory] = useState<string>('all')

  useEffect(() => {
    // Simulate loading achievements
    setAchievements(mockAchievements)
    
    // Calculate user stats
    const unlocked = mockAchievements.filter(a => a.unlocked)
    const totalPoints = unlocked.reduce((sum, a) => sum + a.points, 0)
    
    setUserStats({
      totalPoints,
      unlockedCount: unlocked.length,
      rank: getRank(totalPoints),
      nextRankPoints: getNextRankPoints(totalPoints)
    })
  }, [])

  const getRank = (points: number) => {
    if (points >= 5000) return 'Legend'
    if (points >= 2000) return 'Expert'
    if (points >= 1000) return 'Advanced'
    if (points >= 500) return 'Intermediate'
    return 'Beginner'
  }

  const getNextRankPoints = (points: number) => {
    if (points < 500) return 500
    if (points < 1000) return 1000
    if (points < 2000) return 2000
    if (points < 5000) return 5000
    return 10000
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'bronze': return 'bg-gradient-to-r from-orange-400 to-orange-600'
      case 'silver': return 'bg-gradient-to-r from-gray-300 to-gray-500'
      case 'gold': return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 'platinum': return 'bg-gradient-to-r from-purple-400 to-purple-600'
      default: return 'bg-gray-400'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'social': return <Users className="h-4 w-4" />
      case 'technical': return <Code className="h-4 w-4" />
      case 'engagement': return <Heart className="h-4 w-4" />
      case 'milestone': return <Target className="h-4 w-4" />
      default: return <Award className="h-4 w-4" />
    }
  }

  const filteredAchievements = selectedCategory === 'all' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory)

  const categories = [
    { id: 'all', name: 'All', icon: <Award className="h-4 w-4" /> },
    { id: 'milestone', name: 'Milestones', icon: <Target className="h-4 w-4" /> },
    { id: 'technical', name: 'Technical', icon: <Code className="h-4 w-4" /> },
    { id: 'social', name: 'Social', icon: <Users className="h-4 w-4" /> },
    { id: 'engagement', name: 'Engagement', icon: <Heart className="h-4 w-4" /> }
  ]

  if (compact) {
    return (
      <Card className={`border-0 shadow-lg ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2 text-lg">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span>Achievements</span>
            <Badge className="bg-yellow-100 text-yellow-700">
              {userStats.unlockedCount}/{achievements.length}
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-gray-700">Total Points</span>
              <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                {userStats.totalPoints.toLocaleString()}
              </Badge>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-600">Rank: {userStats.rank}</span>
                <span className="text-gray-500">
                  {userStats.nextRankPoints - userStats.totalPoints} to next rank
                </span>
              </div>
              <Progress 
                value={(userStats.totalPoints / userStats.nextRankPoints) * 100} 
                className="h-2"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              {achievements.filter(a => a.unlocked).slice(0, 4).map((achievement) => (
                <div 
                  key={achievement.id}
                  className="flex items-center space-x-2 p-2 bg-gray-50 rounded-lg"
                >
                  <div className={`p-1.5 rounded-full text-white ${getDifficultyColor(achievement.difficulty)}`}>
                    {achievement.icon}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-medium text-gray-900 truncate">
                      {achievement.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {achievement.points} pts
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={`border-0 shadow-lg ${className}`}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span>Achievement System</span>
          </CardTitle>
          <div className="flex items-center space-x-2">
            <Badge className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
              {userStats.totalPoints.toLocaleString()} Points
            </Badge>
            <Badge className="bg-yellow-100 text-yellow-700">
              {userStats.rank}
            </Badge>
          </div>
        </div>
        
        {/* Progress to next rank */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600">Progress to next rank</span>
            <span className="text-gray-500">
              {userStats.nextRankPoints - userStats.totalPoints} points needed
            </span>
          </div>
          <Progress 
            value={(userStats.totalPoints / userStats.nextRankPoints) * 100} 
            className="h-3"
          />
        </div>

        {/* Category filters */}
        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`flex items-center space-x-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                selectedCategory === category.id
                  ? 'bg-blue-100 text-blue-700 border border-blue-200'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {category.icon}
              <span>{category.name}</span>
            </button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredAchievements.map((achievement) => (
            <div
              key={achievement.id}
              className={`p-4 rounded-xl border transition-all duration-200 ${
                achievement.unlocked
                  ? 'border-green-200 bg-green-50/50 shadow-sm'
                  : 'border-gray-200 bg-gray-50/50 hover:border-blue-200 hover:bg-blue-50/50'
              }`}
            >
              <div className="flex items-start space-x-3">
                <div className={`p-2 rounded-full text-white ${getDifficultyColor(achievement.difficulty)} ${
                  !achievement.unlocked ? 'opacity-50' : ''
                }`}>
                  {achievement.icon}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center space-x-2">
                    <h3 className={`font-semibold text-sm ${
                      achievement.unlocked ? 'text-gray-900' : 'text-gray-600'
                    }`}>
                      {achievement.name}
                    </h3>
                    <div className="flex items-center space-x-1">
                      {getCategoryIcon(achievement.category)}
                      <Badge 
                        variant="secondary" 
                        className={`text-xs capitalize ${getDifficultyColor(achievement.difficulty)} text-white`}
                      >
                        {achievement.difficulty}
                      </Badge>
                    </div>
                  </div>
                  
                  <p className="text-xs text-gray-600 mt-1">
                    {achievement.description}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs font-medium text-blue-600">
                      {achievement.points} points
                    </span>
                    {achievement.unlocked && achievement.unlockedAt && (
                      <span className="text-xs text-green-600">
                        Unlocked {new Date(achievement.unlockedAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>

                  {achievement.progress && !achievement.unlocked && (
                    <div className="mt-2 space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-gray-600">Progress</span>
                        <span className="text-gray-500">
                          {achievement.progress.current}/{achievement.progress.target}
                        </span>
                      </div>
                      <Progress 
                        value={(achievement.progress.current / achievement.progress.target) * 100}
                        className="h-2"
                      />
                    </div>
                  )}

                  <p className="text-xs text-gray-500 mt-2 italic">
                    {achievement.requirement}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

export default AchievementSystem
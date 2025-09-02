import React, { useState, useRef } from 'react'
import { Link } from 'react-router-dom'
import { 
  Mail, 
  Calendar, 
  MapPin, 
  Link as LinkIcon, 
  Edit, 
  Settings,
  Star,
  Heart,
  MessageCircle,
  Share2,
  ArrowUpRight,
  Plus,
  Github,
  Twitter,
  Linkedin,
  TrendingUp,
  Camera,
  Upload,
  Check,
  X
} from 'lucide-react'
import { format } from 'date-fns'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '../features/shared/components/ui/avatar'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../features/shared/components/ui/tabs'
import AchievementSystem from '../components/AchievementSystem'
import UserRecommendations from '../components/UserRecommendations'

// Mock user data
const mockUserProfile = {
  id: 'user-123',
  name: 'Demo User',
  username: 'demo_user',
  email: 'demo@agent-builder.app',
  bio: 'Full-stack developer passionate about AI and modern web technologies. Building the future, one project at a time.',
  avatar: '/api/placeholder/120/120',
  coverImage: '/api/placeholder/800/200',
  location: 'San Francisco, CA',
  website: 'https://demo-user.dev',
  joinedAt: '2023-06-15T10:00:00.000Z',
  verified: true,
  stats: {
    projects: 12,
    followers: 1284,
    following: 456,
    likes: 3842,
    views: 15678
  },
  socialLinks: {
    github: 'https://github.com/demo-user',
    twitter: 'https://twitter.com/demo_user',
    linkedin: 'https://linkedin.com/in/demo-user'
  },
  achievements: [
    { id: 1, name: 'Early Adopter', description: 'Joined in the first month', icon: '🌟', earned: '2023-06-15' },
    { id: 2, name: 'Project Master', description: 'Created 10+ projects', icon: '🏆', earned: '2023-12-01' },
    { id: 3, name: 'Community Favorite', description: 'Received 1000+ likes', icon: '❤️', earned: '2024-01-15' },
    { id: 4, name: 'Tech Explorer', description: 'Used 5+ different technologies', icon: '🚀', earned: '2023-11-20' }
  ]
}

// Mock projects data
const mockUserProjects = [
  {
    id: 'proj-1',
    name: 'E-commerce Platform',
    description: 'Modern e-commerce platform with product catalog, shopping cart, and payment processing',
    status: 'COMPLETED',
    createdAt: '2024-01-15T10:00:00.000Z',
    technologies: ['React', 'Node.js', 'PostgreSQL', 'Stripe'],
    likes: 42,
    comments: 8,
    shares: 3,
    views: 156,
    featured: true
  },
  {
    id: 'proj-2',
    name: 'Task Management App',
    description: 'Collaborative task management tool with real-time updates',
    status: 'IN_PROGRESS',
    createdAt: '2024-01-18T09:15:00.000Z',
    technologies: ['Vue.js', 'Express', 'MongoDB', 'Socket.io'],
    likes: 28,
    comments: 12,
    shares: 5,
    views: 89,
    featured: false
  },
  {
    id: 'proj-3',
    name: 'Weather Dashboard',
    description: 'Interactive weather dashboard with location-based forecasts',
    status: 'COMPLETED',
    createdAt: '2024-01-12T14:30:00.000Z',
    technologies: ['JavaScript', 'Chart.js', 'Weather API'],
    likes: 35,
    comments: 6,
    shares: 2,
    views: 112,
    featured: false
  }
]

const Profile: React.FC = () => {
  const [activeTab, setActiveTab] = useState('projects')
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [isUploadingCover, setIsUploadingCover] = useState(false)
  const [showAvatarUpload, setShowAvatarUpload] = useState(false)
  const [avatarPreview, setAvatarPreview] = useState(mockUserProfile.avatar)
  const [coverPreview, setCoverPreview] = useState(mockUserProfile.coverImage)
  
  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingAvatar(true)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setAvatarPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Simulate API upload to S3
    try {
      // In real implementation, this would upload to S3 and save metadata to DynamoDB
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Simulate processing: resize, optimize, generate thumbnails
      console.log('Image uploaded successfully:', {
        fileName: file.name,
        size: file.size,
        type: file.type,
        s3Key: `profiles/avatar-${Date.now()}.jpg`,
        metadata: {
          originalSize: file.size,
          processedSize: Math.floor(file.size * 0.7), // Simulated compression
          dimensions: '400x400', // Standardized avatar size
          userId: mockUserProfile.id
        }
      })
      
      setShowAvatarUpload(false)
    } catch (error) {
      console.error('Upload failed:', error)
      setAvatarPreview(mockUserProfile.avatar) // Revert on error
    } finally {
      setIsUploadingAvatar(false)
    }
  }

  const handleCoverUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsUploadingCover(true)

    // Create preview
    const reader = new FileReader()
    reader.onload = (e) => {
      setCoverPreview(e.target?.result as string)
    }
    reader.readAsDataURL(file)

    // Simulate API upload
    try {
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      console.log('Cover image uploaded successfully:', {
        fileName: file.name,
        s3Key: `profiles/cover-${Date.now()}.jpg`,
        metadata: {
          originalSize: file.size,
          processedSize: Math.floor(file.size * 0.8),
          dimensions: '1200x300',
          userId: mockUserProfile.id
        }
      })
    } catch (error) {
      console.error('Cover upload failed:', error)
      setCoverPreview(mockUserProfile.coverImage)
    } finally {
      setIsUploadingCover(false)
    }
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
        {/* Profile Header */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm mb-6 overflow-hidden">
          {/* Cover Image */}
          <div className="h-48 relative group">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 bg-cover bg-center"
              style={{ backgroundImage: coverPreview ? `url(${coverPreview})` : undefined }}
            >
              <div className="absolute inset-0 bg-black/20"></div>
              
              {/* Cover Upload Button */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-200">
                <Button
                  size="sm"
                  variant="secondary"
                  className="bg-white/90 backdrop-blur-sm hover:bg-white"
                  onClick={() => coverInputRef.current?.click()}
                  disabled={isUploadingCover}
                >
                  {isUploadingCover ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-600 border-t-transparent" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                  <span className="ml-2">
                    {isUploadingCover ? 'Uploading...' : 'Change Cover'}
                  </span>
                </Button>
                <input
                  ref={coverInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleCoverUpload}
                />
              </div>
            </div>
          </div>
          
          <CardContent className="relative -mt-16 pb-6">
            {/* Avatar and Basic Info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-end space-y-4 sm:space-y-0 sm:space-x-6 mb-6">
              {/* Avatar with Upload */}
              <div className="relative group">
                <Avatar className="h-32 w-32 border-4 border-white shadow-lg">
                  <AvatarImage src={avatarPreview} />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-3xl font-bold">
                    {mockUserProfile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                {/* Avatar Upload Overlay */}
                <div className="absolute inset-0 bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-all duration-200 flex items-center justify-center cursor-pointer"
                     onClick={() => setShowAvatarUpload(true)}>
                  <Camera className="h-6 w-6 text-white" />
                </div>
                
                {/* Upload Progress */}
                {isUploadingAvatar && (
                  <div className="absolute inset-0 bg-black/70 rounded-full flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-2 border-white border-t-transparent" />
                  </div>
                )}
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center space-x-3">
                  <h1 className="text-3xl font-bold text-slate-800">{mockUserProfile.name}</h1>
                  {mockUserProfile.verified && (
                    <Star className="h-6 w-6 text-blue-500 fill-current" />
                  )}
                </div>
                <p className="text-slate-600">@{mockUserProfile.username}</p>
                <p className="text-slate-700 max-w-2xl">{mockUserProfile.bio}</p>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline"
                  size="icon"
                  asChild
                >
                  <Link to="/settings">
                    <Settings className="h-4 w-4" />
                  </Link>
                </Button>
                <Button 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Profile
                </Button>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="flex items-center space-x-3 text-slate-600">
                <Mail className="h-5 w-5" />
                <span>{mockUserProfile.email}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <MapPin className="h-5 w-5" />
                <span>{mockUserProfile.location}</span>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <LinkIcon className="h-5 w-5" />
                <a href={mockUserProfile.website} className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                  demo-user.dev
                </a>
              </div>
              <div className="flex items-center space-x-3 text-slate-600">
                <Calendar className="h-5 w-5" />
                <span>Joined {format(new Date(mockUserProfile.joinedAt), 'MMM yyyy')}</span>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg">
                <div className="text-2xl font-bold text-blue-700">{mockUserProfile.stats.projects}</div>
                <div className="text-sm text-blue-600">Projects</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg">
                <div className="text-2xl font-bold text-green-700">{mockUserProfile.stats.followers.toLocaleString()}</div>
                <div className="text-sm text-green-600">Followers</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg">
                <div className="text-2xl font-bold text-purple-700">{mockUserProfile.stats.following}</div>
                <div className="text-sm text-purple-600">Following</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg">
                <div className="text-2xl font-bold text-red-700">{mockUserProfile.stats.likes.toLocaleString()}</div>
                <div className="text-sm text-red-600">Likes</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg">
                <div className="text-2xl font-bold text-orange-700">{mockUserProfile.stats.views.toLocaleString()}</div>
                <div className="text-sm text-orange-600">Views</div>
              </div>
            </div>

            {/* Social Links */}
            <div className="flex items-center space-x-4">
              <span className="text-sm text-slate-600 font-medium">Connect:</span>
              <div className="flex space-x-3">
                <Button variant="outline" size="icon" asChild>
                  <a href={mockUserProfile.socialLinks.github} target="_blank" rel="noopener noreferrer">
                    <Github className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href={mockUserProfile.socialLinks.twitter} target="_blank" rel="noopener noreferrer">
                    <Twitter className="h-4 w-4" />
                  </a>
                </Button>
                <Button variant="outline" size="icon" asChild>
                  <a href={mockUserProfile.socialLinks.linkedin} target="_blank" rel="noopener noreferrer">
                    <Linkedin className="h-4 w-4" />
                  </a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:grid-cols-4 bg-white/80 backdrop-blur-sm">
            <TabsTrigger value="projects">Projects</TabsTrigger>
            <TabsTrigger value="achievements">Achievements</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
            <TabsTrigger value="about" className="hidden lg:block">About</TabsTrigger>
          </TabsList>

          {/* Projects Tab */}
          <TabsContent value="projects" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold text-slate-800">Projects ({mockUserProjects.length})</h2>
              <Button asChild className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                <Link to="/create">
                  <Plus className="h-4 w-4 mr-2" />
                  New Project
                </Link>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {mockUserProjects.map((project) => (
                <Card key={project.id} className="border-0 shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 bg-white/80 backdrop-blur-sm">
                  {project.featured && (
                    <div className="bg-gradient-to-r from-yellow-400 to-orange-400 text-white text-xs font-bold px-3 py-1 rounded-t-lg">
                      FEATURED
                    </div>
                  )}
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <CardTitle className="text-lg font-bold text-slate-800 line-clamp-1">
                          {project.name}
                        </CardTitle>
                        <div className="flex items-center space-x-2">
                          {getStatusBadge(project.status)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-slate-600 mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    
                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.technologies.slice(0, 3).map((tech, index) => (
                        <Badge key={index} variant="secondary" className="bg-slate-100 text-slate-700 text-xs">
                          {tech}
                        </Badge>
                      ))}
                      {project.technologies.length > 3 && (
                        <Badge variant="secondary" className="bg-slate-100 text-slate-700 text-xs">
                          +{project.technologies.length - 3} more
                        </Badge>
                      )}
                    </div>

                    {/* Stats */}
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4">
                      <div className="flex items-center space-x-4">
                        <span className="flex items-center space-x-1">
                          <Heart className="h-4 w-4" />
                          <span>{project.likes}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <MessageCircle className="h-4 w-4" />
                          <span>{project.comments}</span>
                        </span>
                        <span className="flex items-center space-x-1">
                          <Share2 className="h-4 w-4" />
                          <span>{project.shares}</span>
                        </span>
                      </div>
                      <span>{format(new Date(project.createdAt), 'MMM d')}</span>
                    </div>

                    <Button 
                      variant="outline" 
                      size="sm" 
                      asChild
                      className="w-full border-slate-200 hover:bg-slate-50"
                    >
                      <Link to={`/project/${project.id}`}>
                        <ArrowUpRight className="h-4 w-4 mr-1" />
                        View Project
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Achievements Tab */}
          <TabsContent value="achievements" className="space-y-6">
            <AchievementSystem />
          </TabsContent>

          {/* Activity Tab */}
          <TabsContent value="activity" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <h2 className="text-2xl font-bold text-slate-800 mb-6">Recent Activity</h2>
                <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
                  <CardContent className="p-6">
                    <div className="text-center py-12">
                      <TrendingUp className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-slate-600 mb-2">Activity Coming Soon</h3>
                      <p className="text-slate-500">Track your project updates, likes, and community interactions here.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              <div className="lg:col-span-1">
                <UserRecommendations 
                  onFollow={(userId) => console.log('Follow user:', userId)}
                />
              </div>
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="space-y-6">
            <h2 className="text-2xl font-bold text-slate-800">About</h2>
            <Card className="border-0 shadow-lg bg-white/80 backdrop-blur-sm">
              <CardContent className="p-6 space-y-6">
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Bio</h3>
                  <p className="text-slate-600">{mockUserProfile.bio}</p>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Skills & Technologies</h3>
                  <div className="flex flex-wrap gap-2">
                    {['React', 'Node.js', 'TypeScript', 'Python', 'PostgreSQL', 'MongoDB', 'AWS', 'Docker'].map((skill) => (
                      <Badge key={skill} className="bg-gradient-to-r from-blue-500 to-purple-500 text-white">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-2">Interests</h3>
                  <div className="flex flex-wrap gap-2">
                    {['AI & Machine Learning', 'Web Development', 'Open Source', 'DevOps', 'Mobile Apps'].map((interest) => (
                      <Badge key={interest} variant="secondary" className="bg-slate-100 text-slate-700">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
        
        {/* Avatar Upload Modal */}
        {showAvatarUpload && (
          <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
            <Card className="w-full max-w-md bg-white shadow-2xl">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Upload Profile Picture</CardTitle>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setShowAvatarUpload(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center">
                  <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 hover:border-blue-400 transition-colors">
                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                    <p className="text-sm text-slate-600 mb-2">
                      Drag and drop your image here, or click to browse
                    </p>
                    <p className="text-xs text-slate-500">
                      Supports: JPG, PNG, WebP (Max 5MB)
                    </p>
                    <Button 
                      variant="outline" 
                      className="mt-3"
                      onClick={() => avatarInputRef.current?.click()}
                      disabled={isUploadingAvatar}
                    >
                      {isUploadingAvatar ? (
                        <div className="flex items-center space-x-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-2 border-slate-600 border-t-transparent" />
                          <span>Processing...</span>
                        </div>
                      ) : (
                        <>
                          <Upload className="h-4 w-4 mr-2" />
                          Select Image
                        </>
                      )}
                    </Button>
                    <input
                      ref={avatarInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleAvatarUpload}
                    />
                  </div>
                </div>
                
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="text-xs text-blue-800">
                    📸 <strong>Professional Processing:</strong> Your image will be automatically resized to 400x400px, 
                    optimized for quality, and securely stored. Only metadata is saved to our database.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}

export default Profile
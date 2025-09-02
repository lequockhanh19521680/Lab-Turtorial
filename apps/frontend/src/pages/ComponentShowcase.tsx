import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/features/shared/components/ui/card'
import { Badge } from '@/features/shared/components/ui/badge'
import { Button } from '@/features/shared/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/shared/components/ui/tabs'
import DashboardAnalytics from '../components/DashboardAnalytics'
import AIChatInterface from '../components/AIChatInterface'
import DragDropUpload from '../components/DragDropUpload'
import AdvancedSearch from '../components/AdvancedSearch'
import NotificationCenter, { mockNotifications } from '../features/shared/components/ui/notification-center'
import { 
  SkeletonCardWithHeader, 
  SkeletonProjectCard,
  SkeletonText,
  SkeletonAvatar,
  SkeletonButton
} from '../features/shared/components/ui/skeleton'
import { 
  EnhancedProgress as Progress, 
  EnhancedCircularProgress as CircularProgress, 
  StepProgress, 
  MultiProgress 
} from '../features/shared/components/ui/progress-indicator'
import { 
  Palette, 
  Zap, 
  Sparkles, 
  Monitor, 
  Smartphone, 
  Moon, 
  Sun,
  Eye,
  Code2,
  BarChart3,
  MessageSquare,
  Upload,
  Search,
  Bell
} from 'lucide-react'

const ComponentShowcase: React.FC = () => {
  const [isDark, setIsDark] = useState(false)
  const [showSkeletons, setShowSkeletons] = useState(false)

  const toggleTheme = () => {
    setIsDark(!isDark)
    document.documentElement.classList.toggle('dark')
  }

  const mockSteps = [
    { label: 'Requirements', description: 'Analyze project needs', completed: true, current: false },
    { label: 'Design', description: 'Create UI/UX mockups', completed: true, current: false },
    { label: 'Development', description: 'Build the application', completed: false, current: true },
    { label: 'Testing', description: 'Quality assurance', completed: false, current: false },
    { label: 'Deployment', description: 'Launch to production', completed: false, current: false },
  ]

  const mockMultiProgress = [
    { label: 'Frontend', value: 65, color: '#0066FF' },
    { label: 'Backend', value: 45, color: '#00CCFF' },
    { label: 'Testing', value: 20, color: '#8B5CF6' },
  ]

  return (
    <div className={`min-h-screen transition-all duration-300 ${isDark ? 'dark' : ''}`}>
      <div className="bg-background text-foreground">
        {/* Header */}
        <div className="border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
                  <Sparkles className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gradient">UI/UX Showcase</h1>
                  <p className="text-sm text-muted-foreground">Modern Lab Tutorial Components</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-4">
                <NotificationCenter 
                  notifications={mockNotifications}
                  onNotificationRead={(id) => console.log('Read:', id)}
                  onNotificationDismiss={(id) => console.log('Dismissed:', id)}
                  onMarkAllRead={() => console.log('Mark all read')}
                />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleTheme}
                  className="w-10 h-10 p-0"
                >
                  {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSkeletons(!showSkeletons)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  {showSkeletons ? 'Hide' : 'Show'} Loading
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Hero Section */}
        <section className="relative py-20 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-purple-500/5" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-full blur-3xl animate-pulse" />
          <div className="absolute bottom-20 left-20 w-48 h-48 bg-gradient-to-br from-purple-500/10 to-primary/10 rounded-full blur-3xl animate-float" />
          
          <div className="container mx-auto px-6 relative z-10">
            <div className="text-center max-w-4xl mx-auto">
              <Badge className="mb-4 bg-primary/10 text-primary border-primary/20">
                ✨ UI/UX Overhaul Complete
              </Badge>
              
              <h1 className="text-5xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-purple-500 bg-clip-text text-transparent">
                Modern Lab Tutorial
              </h1>
              
              <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
                Experience the completely redesigned interface with modern blue gradients, 
                smooth animations, and enhanced user experience components.
              </p>
              
              <div className="flex flex-wrap justify-center gap-4 mb-12">
                <Badge className="bg-gradient-to-r from-primary to-purple-500 text-white">
                  <Palette className="h-4 w-4 mr-2" />
                  Modern Design
                </Badge>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white">
                  <Zap className="h-4 w-4 mr-2" />
                  Smooth Animations
                </Badge>
                <Badge className="bg-gradient-to-r from-orange-500 to-red-500 text-white">
                  <Monitor className="h-4 w-4 mr-2" />
                  Responsive Design
                </Badge>
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Mobile Optimized
                </Badge>
              </div>
            </div>
          </div>
        </section>

        {/* Components Showcase */}
        <section className="py-16">
          <div className="container mx-auto px-6">
            <Tabs defaultValue="analytics" className="space-y-8">
              <TabsList className="grid grid-cols-5 w-full max-w-2xl mx-auto">
                <TabsTrigger value="analytics" className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4" />
                  <span className="hidden sm:inline">Analytics</span>
                </TabsTrigger>
                <TabsTrigger value="chat" className="flex items-center space-x-2">
                  <MessageSquare className="h-4 w-4" />
                  <span className="hidden sm:inline">AI Chat</span>
                </TabsTrigger>
                <TabsTrigger value="upload" className="flex items-center space-x-2">
                  <Upload className="h-4 w-4" />
                  <span className="hidden sm:inline">Upload</span>
                </TabsTrigger>
                <TabsTrigger value="search" className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span className="hidden sm:inline">Search</span>
                </TabsTrigger>
                <TabsTrigger value="components" className="flex items-center space-x-2">
                  <Code2 className="h-4 w-4" />
                  <span className="hidden sm:inline">UI</span>
                </TabsTrigger>
              </TabsList>

              {/* Analytics Tab */}
              <TabsContent value="analytics" className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Dashboard Analytics</h2>
                  <p className="text-muted-foreground mb-8">
                    Beautiful charts and metrics with real-time data visualization
                  </p>
                </div>
                
                {showSkeletons ? (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <SkeletonCardWithHeader key={i} showAvatar={false} showButton={false} textLines={2} />
                      ))}
                    </div>
                    <SkeletonCardWithHeader textLines={8} className="h-96" />
                  </div>
                ) : (
                  <DashboardAnalytics />
                )}
              </TabsContent>

              {/* AI Chat Tab */}
              <TabsContent value="chat" className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">AI Chat Interface</h2>
                  <p className="text-muted-foreground mb-8">
                    ChatGPT-style interface with code highlighting and voice input
                  </p>
                </div>
                
                <div className="max-w-4xl mx-auto">
                  <AIChatInterface 
                    onSendMessage={(message) => console.log('Sent:', message)}
                    placeholder="Ask me to build something amazing..."
                  />
                </div>
              </TabsContent>

              {/* Upload Tab */}
              <TabsContent value="upload" className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Drag & Drop Upload</h2>
                  <p className="text-muted-foreground mb-8">
                    Modern file upload with preview, progress tracking, and validation
                  </p>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <DragDropUpload 
                    onFilesUpload={(files) => console.log('Uploaded:', files)}
                    maxFiles={10}
                    maxFileSize={20}
                  />
                </div>
              </TabsContent>

              {/* Search Tab */}
              <TabsContent value="search" className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">Advanced Search</h2>
                  <p className="text-muted-foreground mb-8">
                    Smart search with autocomplete, filters, and recent searches
                  </p>
                </div>
                
                <div className="max-w-2xl mx-auto">
                  <AdvancedSearch 
                    onSearch={(query, filters) => console.log('Search:', query, filters)}
                    onSuggestionSelect={(suggestion) => console.log('Selected:', suggestion)}
                    recentSearches={['React Dashboard', 'Vue.js Template', 'AI Chatbot']}
                  />
                </div>
              </TabsContent>

              {/* UI Components Tab */}
              <TabsContent value="components" className="space-y-6">
                <div className="text-center">
                  <h2 className="text-3xl font-bold mb-4">UI Components</h2>
                  <p className="text-muted-foreground mb-8">
                    Modern components with gradients, animations, and micro-interactions
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Progress Indicators */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Progress Indicators</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div>
                        <h4 className="font-medium mb-3">Linear Progress</h4>
                        <Progress value={75} showValue label="Project Completion" />
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Circular Progress</h4>
                        <div className="flex justify-center">
                          <CircularProgress value={65} showValue />
                        </div>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-3">Multi Progress</h4>
                        <MultiProgress items={mockMultiProgress} />
                      </div>
                    </CardContent>
                  </Card>

                  {/* Step Progress */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Step Progress</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <StepProgress steps={mockSteps} variant="vertical" />
                    </CardContent>
                  </Card>

                  {/* Buttons */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Modern Buttons</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-x-4">
                        <Button className="btn-primary">Primary Button</Button>
                        <Button className="btn-secondary">Secondary</Button>
                        <Button className="btn-outline">Outline</Button>
                        <Button className="btn-ghost">Ghost</Button>
                      </div>
                      
                      <div className="space-x-4">
                        <Button size="sm">Small</Button>
                        <Button>Default</Button>
                        <Button size="lg">Large</Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Loading Skeletons */}
                  <Card>
                    <CardHeader>
                      <CardTitle>Loading Skeletons</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex items-center space-x-3">
                        <SkeletonAvatar />
                        <div className="space-y-2 flex-1">
                          <SkeletonText className="w-32" />
                          <SkeletonText className="w-24" />
                        </div>
                        <SkeletonButton />
                      </div>
                      
                      <SkeletonProjectCard />
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </section>

        {/* Color Scheme Section */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-6">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Modern Color Scheme</h2>
              <p className="text-muted-foreground">
                Blue gradient theme with smooth dark/light mode transitions
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Primary Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#0066FF]" />
                    <span className="font-mono text-sm">#0066FF</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#00CCFF]" />
                    <span className="font-mono text-sm">#00CCFF</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#8B5CF6]" />
                    <span className="font-mono text-sm">#8B5CF6</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Status Colors</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#10B981]" />
                    <span className="font-mono text-sm">#10B981 Success</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#F59E0B]" />
                    <span className="font-mono text-sm">#F59E0B Warning</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-full bg-[#EF4444]" />
                    <span className="font-mono text-sm">#EF4444 Error</span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Gradients</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-8 rounded-full bg-gradient-to-r from-[#0066FF] to-[#00CCFF]" />
                  <div className="h-8 rounded-full bg-gradient-to-r from-[#8B5CF6] to-[#0066FF]" />
                  <div className="h-8 rounded-full bg-gradient-to-r from-[#00CCFF] to-[#8B5CF6]" />
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Footer */}
        <footer className="py-8 border-t border-border">
          <div className="container mx-auto px-6 text-center">
            <p className="text-muted-foreground">
              🚀 Lab Tutorial UI/UX Overhaul - Modern, Beautiful, Fast
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default ComponentShowcase
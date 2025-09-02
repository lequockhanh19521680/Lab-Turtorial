import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Send, 
  Star,
  CheckCircle,
  AlertCircle,
  Info,
  Lightbulb,
  Bug
} from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface FeedbackItem {
  id: string
  type: 'bug' | 'feature' | 'improvement' | 'general'
  title: string
  description: string
  rating: number
  email: string
  status: 'pending' | 'in-review' | 'resolved'
  submittedAt: string
}

// Mock data for demonstration
const mockFeedbacks: FeedbackItem[] = [
  {
    id: '1',
    type: 'bug',
    title: 'Navigation sidebar not responsive on mobile',
    description: 'When using the app on mobile devices, the sidebar navigation overlaps with the main content area.',
    rating: 3,
    email: 'user1@example.com',
    status: 'in-review',
    submittedAt: '2024-01-20T10:30:00Z'
  },
  {
    id: '2',
    type: 'feature',
    title: 'Add dark mode toggle',
    description: 'Would love to have a dark mode option for better usability during night time coding sessions.',
    rating: 5,
    email: 'developer@example.com',
    status: 'resolved',
    submittedAt: '2024-01-19T14:15:00Z'
  },
  {
    id: '3',
    type: 'improvement',
    title: 'Better project search functionality',
    description: 'The current search only works with exact matches. It would be great to have fuzzy search and filters.',
    rating: 4,
    email: 'manager@company.com',
    status: 'pending',
    submittedAt: '2024-01-21T09:45:00Z'
  }
]

const Feedback: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showThankYou, setShowThankYou] = useState(false)
  const [isAdmin] = useState(true) // This would come from user context/auth
  const [activeTab, setActiveTab] = useState<'submit' | 'admin'>('submit')
  
  // Form state
  const [formData, setFormData] = useState({
    type: '',
    title: '',
    description: '',
    email: '',
    rating: 5
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsSubmitting(false)
    setShowThankYou(true)
    
    // Reset form
    setFormData({
      type: '',
      title: '',
      description: '',
      email: '',
      rating: 5
    })
    
    // Hide thank you message after 3 seconds
    setTimeout(() => setShowThankYou(false), 3000)
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'bug': return <Bug className="h-4 w-4" />
      case 'feature': return <Lightbulb className="h-4 w-4" />
      case 'improvement': return <CheckCircle className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Pending</Badge>
      case 'in-review':
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Review</Badge>
      case 'resolved':
        return <Badge variant="secondary" className="bg-green-100 text-green-800">Resolved</Badge>
      default:
        return <Badge variant="secondary">Unknown</Badge>
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
      />
    ))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-6xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <MessageSquare className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Feedback Center
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Help us improve the platform by sharing your feedback, reporting bugs, or suggesting new features.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center space-x-4">
          <Button
            variant={activeTab === 'submit' ? 'default' : 'outline'}
            onClick={() => setActiveTab('submit')}
            className="px-6 py-2 transition-all duration-200"
          >
            <Send className="h-4 w-4 mr-2" />
            Submit Feedback
          </Button>
          {isAdmin && (
            <Button
              variant={activeTab === 'admin' ? 'default' : 'outline'}
              onClick={() => setActiveTab('admin')}
              className="px-6 py-2 transition-all duration-200"
            >
              <AlertCircle className="h-4 w-4 mr-2" />
              Admin View
            </Button>
          )}
        </div>

        {/* Thank You Message */}
        {showThankYou && (
          <div className="fixed top-4 right-4 z-50 bg-green-500 text-white p-4 rounded-lg shadow-lg animate-in slide-in-from-right">
            <div className="flex items-center space-x-2">
              <CheckCircle className="h-5 w-5" />
              <span className="font-medium">Thank you for your feedback!</span>
            </div>
          </div>
        )}

        {/* Submit Feedback Tab */}
        {activeTab === 'submit' && (
          <Card className="max-w-2xl mx-auto shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center">
              <CardTitle className="text-2xl font-bold text-slate-800">
                Share Your Feedback
              </CardTitle>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Feedback Type</Label>
                    <Select
                      value={formData.type}
                      onValueChange={(value) => setFormData(prev => ({ ...prev, type: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select feedback type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="bug">🐛 Bug Report</SelectItem>
                        <SelectItem value="feature">💡 Feature Request</SelectItem>
                        <SelectItem value="improvement">⚡ Improvement</SelectItem>
                        <SelectItem value="general">💬 General Feedback</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    placeholder="Brief description of your feedback"
                    value={formData.title}
                    onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    placeholder="Please provide detailed information about your feedback..."
                    rows={4}
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label>Overall Rating</Label>
                  <div className="flex items-center space-x-2">
                    {Array.from({ length: 5 }, (_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, rating: i + 1 }))}
                        className="transition-colors hover:scale-110 transform"
                      >
                        <Star
                          className={`h-6 w-6 ${i < formData.rating ? 'text-yellow-500 fill-current' : 'text-gray-300'}`}
                        />
                      </button>
                    ))}
                    <span className="ml-2 text-sm text-slate-600">({formData.rating}/5)</span>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 transition-all duration-200"
                >
                  {isSubmitting ? (
                    <div className="flex items-center space-x-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      <span>Submitting...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Send className="h-4 w-4" />
                      <span>Submit Feedback</span>
                    </div>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {/* Admin View Tab */}
        {activeTab === 'admin' && isAdmin && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                Feedback Management
              </h2>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {mockFeedbacks.length} Total Feedbacks
              </Badge>
            </div>

            <div className="grid gap-6">
              {mockFeedbacks.map((feedback) => (
                <Card key={feedback.id} className="shadow-lg border-0 bg-white/80 backdrop-blur-sm hover:shadow-xl transition-all duration-200">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          {getTypeIcon(feedback.type)}
                          <h3 className="text-lg font-semibold text-slate-800">{feedback.title}</h3>
                        </div>
                        <div className="flex items-center space-x-4 text-sm text-slate-600">
                          <span>{feedback.email}</span>
                          <span>•</span>
                          <span>{new Date(feedback.submittedAt).toLocaleDateString()}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(feedback.status)}
                        <div className="flex items-center space-x-1">
                          {renderStars(feedback.rating)}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-slate-700 mb-4">{feedback.description}</p>
                    <div className="flex space-x-2">
                      <Button size="sm" variant="outline">
                        Mark as Resolved
                      </Button>
                      <Button size="sm" variant="outline">
                        Reply
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Feedback
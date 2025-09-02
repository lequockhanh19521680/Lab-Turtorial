import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Search, 
  Star, 
  Download, 
  Eye, 
  Clock, 
  Code, 
  ShoppingCart, 
  FileText,
  BarChart3,
  Smartphone,
  User,
  Building2,
  Grid3x3,
  Heart,
  TrendingUp,
  X
} from 'lucide-react'
import type { ProjectTemplate, TemplateCategory, TemplateSearchFilters } from '@lab-tutorial/shared-types'

// Mock template data
const MOCK_TEMPLATES: ProjectTemplate[] = [
  {
    id: 'ecommerce-store',
    name: 'E-commerce Store',
    description: 'Full-featured online store with payment processing, inventory management, and admin dashboard',
    category: 'ECOMMERCE',
    tags: ['react', 'node.js', 'stripe', 'database', 'authentication'],
    thumbnail: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=400&h=240&fit=crop',
    previewImages: [],
    techStack: ['React', 'Node.js', 'Express', 'MongoDB', 'Stripe'],
    complexity: 'advanced',
    estimatedTime: 240,
    rating: 4.8,
    reviewCount: 126,
    downloadCount: 1543,
    isPopular: true,
    isFeatured: true,
    template: {
      projectName: 'Modern E-commerce Platform',
      requestPrompt: 'Create a full-featured e-commerce platform with user authentication, product catalog, shopping cart, payment processing with Stripe, order management, and admin dashboard. Include responsive design and mobile optimization.'
    },
    createdAt: new Date('2024-01-15').toISOString(),
    updatedAt: new Date('2024-08-15').toISOString()
  },
  {
    id: 'blog-cms',
    name: 'Blog & CMS',
    description: 'Content management system with blog functionality, SEO optimization, and analytics',
    category: 'BLOG',
    tags: ['next.js', 'cms', 'seo', 'analytics', 'markdown'],
    thumbnail: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=400&h=240&fit=crop',
    previewImages: [],
    techStack: ['Next.js', 'React', 'MDX', 'Prisma', 'PostgreSQL'],
    complexity: 'intermediate',
    estimatedTime: 180,
    rating: 4.6,
    reviewCount: 89,
    downloadCount: 967,
    isPopular: true,
    isFeatured: false,
    template: {
      projectName: 'Modern Blog Platform',
      requestPrompt: 'Build a modern blog and content management system with markdown support, SEO optimization, user authentication, commenting system, analytics dashboard, and responsive design.'
    },
    createdAt: new Date('2024-02-20').toISOString(),
    updatedAt: new Date('2024-08-20').toISOString()
  },
  {
    id: 'rest-api',
    name: 'REST API Backend',
    description: 'Scalable REST API with authentication, rate limiting, and comprehensive documentation',
    category: 'API',
    tags: ['node.js', 'express', 'swagger', 'jwt', 'rate-limiting'],
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=400&h=240&fit=crop',
    previewImages: [],
    techStack: ['Node.js', 'Express', 'MongoDB', 'JWT', 'Swagger'],
    complexity: 'intermediate',
    estimatedTime: 120,
    rating: 4.7,
    reviewCount: 156,
    downloadCount: 2145,
    isPopular: true,
    isFeatured: true,
    template: {
      projectName: 'Enterprise REST API',
      requestPrompt: 'Create a robust REST API backend with JWT authentication, role-based access control, rate limiting, input validation, error handling, comprehensive logging, and Swagger documentation.'
    },
    createdAt: new Date('2024-01-10').toISOString(),
    updatedAt: new Date('2024-08-10').toISOString()
  },
  {
    id: 'analytics-dashboard',
    name: 'Analytics Dashboard',
    description: 'Real-time analytics dashboard with charts, metrics, and data visualization',
    category: 'DASHBOARD',
    tags: ['react', 'charts', 'real-time', 'websockets', 'analytics'],
    thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=240&fit=crop',
    previewImages: [],
    techStack: ['React', 'D3.js', 'WebSockets', 'Node.js', 'Redis'],
    complexity: 'advanced',
    estimatedTime: 200,
    rating: 4.9,
    reviewCount: 203,
    downloadCount: 1876,
    isPopular: true,
    isFeatured: true,
    template: {
      projectName: 'Real-time Analytics Dashboard',
      requestPrompt: 'Build a comprehensive analytics dashboard with real-time data visualization, interactive charts, KPI metrics, filtering capabilities, export functionality, and responsive design.'
    },
    createdAt: new Date('2024-03-05').toISOString(),
    updatedAt: new Date('2024-08-25').toISOString()
  },
  {
    id: 'saas-starter',
    name: 'SaaS Starter Kit',
    description: 'Complete SaaS application with subscriptions, billing, and multi-tenancy',
    category: 'SAAS',
    tags: ['saas', 'subscriptions', 'billing', 'multi-tenant', 'stripe'],
    thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=240&fit=crop',
    previewImages: [],
    techStack: ['Next.js', 'Stripe', 'Prisma', 'NextAuth', 'Tailwind'],
    complexity: 'advanced',
    estimatedTime: 300,
    rating: 4.5,
    reviewCount: 78,
    downloadCount: 543,
    isPopular: false,
    isFeatured: true,
    template: {
      projectName: 'SaaS Application Platform',
      requestPrompt: 'Create a complete SaaS starter kit with user authentication, subscription management, billing integration, multi-tenant architecture, admin dashboard, and customer portal.'
    },
    createdAt: new Date('2024-04-12').toISOString(),
    updatedAt: new Date('2024-08-30').toISOString()
  },
  {
    id: 'portfolio-website',
    name: 'Portfolio Website',
    description: 'Professional portfolio website with project showcase and contact forms',
    category: 'PORTFOLIO',
    tags: ['portfolio', 'showcase', 'contact', 'responsive', 'seo'],
    thumbnail: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=400&h=240&fit=crop',
    previewImages: [],
    techStack: ['Next.js', 'Tailwind CSS', 'Framer Motion', 'MDX'],
    complexity: 'beginner',
    estimatedTime: 60,
    rating: 4.4,
    reviewCount: 345,
    downloadCount: 3421,
    isPopular: true,
    isFeatured: false,
    template: {
      projectName: 'Professional Portfolio',
      requestPrompt: 'Build a modern portfolio website with project showcase, about section, skills display, contact form, blog integration, and smooth animations with responsive design.'
    },
    createdAt: new Date('2024-01-05').toISOString(),
    updatedAt: new Date('2024-08-05').toISOString()
  }
]

const CATEGORY_CONFIG = {
  ECOMMERCE: { icon: ShoppingCart, label: 'E-commerce', color: 'bg-green-100 text-green-800' },
  BLOG: { icon: FileText, label: 'Blog & CMS', color: 'bg-blue-100 text-blue-800' },
  API: { icon: Code, label: 'API', color: 'bg-purple-100 text-purple-800' },
  DASHBOARD: { icon: BarChart3, label: 'Dashboard', color: 'bg-orange-100 text-orange-800' },
  SAAS: { icon: Building2, label: 'SaaS', color: 'bg-indigo-100 text-indigo-800' },
  MOBILE_APP: { icon: Smartphone, label: 'Mobile App', color: 'bg-pink-100 text-pink-800' },
  PORTFOLIO: { icon: User, label: 'Portfolio', color: 'bg-teal-100 text-teal-800' },
  BUSINESS: { icon: Building2, label: 'Business', color: 'bg-gray-100 text-gray-800' }
} as const

interface TemplateCardProps {
  template: ProjectTemplate
  onPreview: (template: ProjectTemplate) => void
  onUseTemplate: (template: ProjectTemplate) => void
}

const TemplateCard: React.FC<TemplateCardProps> = ({ template, onPreview, onUseTemplate }) => {
  const categoryConfig = CATEGORY_CONFIG[template.category]
  const IconComponent = categoryConfig.icon

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`
  }

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'beginner': return 'bg-green-100 text-green-800'
      case 'intermediate': return 'bg-yellow-100 text-yellow-800'
      case 'advanced': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <Card className="group relative overflow-hidden transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
      {/* Featured/Popular Badges */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        {template.isFeatured && (
          <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white text-xs">
            Featured
          </Badge>
        )}
        {template.isPopular && (
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs">
            <TrendingUp className="h-3 w-3 mr-1" />
            Popular
          </Badge>
        )}
      </div>

      {/* Template Image */}
      <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-100 to-gray-200">
        {template.thumbnail ? (
          <img 
            src={template.thumbnail} 
            alt={template.name}
            className="w-full h-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <IconComponent className="h-16 w-16 text-gray-400" />
          </div>
        )}
        
        {/* Overlay on hover */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="secondary"
              onClick={() => onPreview(template)}
              className="bg-white/90 hover:bg-white text-black"
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button 
              size="sm"
              onClick={() => onUseTemplate(template)}
              className="bg-primary hover:bg-primary/90"
            >
              Use Template
            </Button>
          </div>
        </div>
      </div>

      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="text-lg font-semibold mb-2 line-clamp-1">
              {template.name}
            </CardTitle>
            <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
              {template.description}
            </p>
          </div>
        </div>

        {/* Category and Complexity */}
        <div className="flex items-center gap-2 mb-3">
          <Badge className={categoryConfig.color}>
            <IconComponent className="h-3 w-3 mr-1" />
            {categoryConfig.label}
          </Badge>
          <Badge className={getComplexityColor(template.complexity)}>
            {template.complexity}
          </Badge>
        </div>

        {/* Tech Stack */}
        <div className="flex flex-wrap gap-1 mb-3">
          {template.techStack.slice(0, 3).map((tech) => (
            <Badge key={tech} variant="outline" className="text-xs">
              {tech}
            </Badge>
          ))}
          {template.techStack.length > 3 && (
            <Badge variant="outline" className="text-xs">
              +{template.techStack.length - 3}
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Stats */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-500 fill-current" />
              <span className="font-medium">{template.rating}</span>
              <span>({template.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <Download className="h-4 w-4" />
              <span>{template.downloadCount.toLocaleString()}</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Clock className="h-4 w-4" />
            <span>{formatTime(template.estimatedTime)}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

interface ProjectTemplatesGalleryProps {
  onTemplateSelected?: (template: ProjectTemplate) => void
  className?: string
}

const ProjectTemplatesGallery: React.FC<ProjectTemplatesGalleryProps> = ({ 
  onTemplateSelected,
  className = '' 
}) => {
  const [templates] = useState<ProjectTemplate[]>(MOCK_TEMPLATES)
  const [filteredTemplates, setFilteredTemplates] = useState<ProjectTemplate[]>(MOCK_TEMPLATES)
  const [filters, setFilters] = useState<TemplateSearchFilters>({
    searchQuery: '',
    category: undefined,
    complexity: undefined,
    sortBy: 'popularity',
    sortOrder: 'desc'
  })
  const [selectedTemplate, setSelectedTemplate] = useState<ProjectTemplate | null>(null)

  // Filter and sort templates
  useEffect(() => {
    let filtered = [...templates]

    // Apply search filter
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase()
      filtered = filtered.filter(template => 
        template.name.toLowerCase().includes(query) ||
        template.description.toLowerCase().includes(query) ||
        template.tags.some(tag => tag.toLowerCase().includes(query)) ||
        template.techStack.some(tech => tech.toLowerCase().includes(query))
      )
    }

    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(template => template.category === filters.category)
    }

    // Apply complexity filter
    if (filters.complexity) {
      filtered = filtered.filter(template => template.complexity === filters.complexity)
    }

    // Apply sorting
    if (filters.sortBy) {
      filtered.sort((a, b) => {
        let aValue: number | string = 0
        let bValue: number | string = 0

        switch (filters.sortBy) {
          case 'popularity':
            aValue = a.downloadCount
            bValue = b.downloadCount
            break
          case 'rating':
            aValue = a.rating
            bValue = b.rating
            break
          case 'newest':
            aValue = new Date(a.createdAt).getTime()
            bValue = new Date(b.createdAt).getTime()
            break
          case 'name':
            aValue = a.name.toLowerCase()
            bValue = b.name.toLowerCase()
            break
        }

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return filters.sortOrder === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
        }

        return filters.sortOrder === 'asc' ? (aValue as number) - (bValue as number) : (bValue as number) - (aValue as number)
      })
    }

    setFilteredTemplates(filtered)
  }, [templates, filters])

  const handlePreview = (template: ProjectTemplate) => {
    setSelectedTemplate(template)
  }

  const handleUseTemplate = (template: ProjectTemplate) => {
    onTemplateSelected?.(template)
  }

  const updateFilters = (newFilters: Partial<TemplateSearchFilters>) => {
    setFilters(prev => ({ ...prev, ...newFilters }))
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="space-y-4">
        <div>
          <h1 className="text-3xl font-bold">Project Templates</h1>
          <p className="text-muted-foreground">
            Choose from our curated collection of professional templates to jumpstart your project
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search templates, tags, or technologies..."
              value={filters.searchQuery || ''}
              onChange={(e) => updateFilters({ searchQuery: e.target.value })}
              className="pl-10"
            />
          </div>
          
          <div className="flex gap-2">
            <Select value={filters.category || 'all'} onValueChange={(value) => updateFilters({ category: value === 'all' ? undefined : value as TemplateCategory })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {Object.entries(CATEGORY_CONFIG).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filters.complexity || 'all'} onValueChange={(value) => updateFilters({ complexity: value === 'all' ? undefined : value as any })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Complexity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="beginner">Beginner</SelectItem>
                <SelectItem value="intermediate">Intermediate</SelectItem>
                <SelectItem value="advanced">Advanced</SelectItem>
              </SelectContent>
            </Select>

            <Select value={filters.sortBy || 'popularity'} onValueChange={(value) => updateFilters({ sortBy: value as any })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="popularity">Popularity</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="name">Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>
            {filteredTemplates.length} template{filteredTemplates.length !== 1 ? 's' : ''} found
          </span>
          {(filters.searchQuery || filters.category || filters.complexity) && (
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => setFilters({ sortBy: 'popularity', sortOrder: 'desc' })}
            >
              Clear filters
            </Button>
          )}
        </div>
      </div>

      {/* Featured Templates */}
      {!filters.searchQuery && !filters.category && !filters.complexity && (
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Featured Templates</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {templates.filter(t => t.isFeatured).map((template) => (
              <TemplateCard
                key={template.id}
                template={template}
                onPreview={handlePreview}
                onUseTemplate={handleUseTemplate}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Templates Grid */}
      <div className="space-y-4">
        {(!filters.searchQuery && !filters.category && !filters.complexity) && (
          <h2 className="text-xl font-semibold">All Templates</h2>
        )}
        
        {(() => {
          // When showing featured templates section, exclude featured templates from "All Templates"
          const showingFeaturedSection = !filters.searchQuery && !filters.category && !filters.complexity
          const templatesToShow = showingFeaturedSection 
            ? filteredTemplates.filter(t => !t.isFeatured)
            : filteredTemplates
          
          return templatesToShow.length === 0 ? (
            <div className="text-center py-16">
              <Grid3x3 className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No templates found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search criteria or browse all templates
              </p>
              <Button onClick={() => setFilters({ sortBy: 'popularity', sortOrder: 'desc' })}>
                Clear filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {templatesToShow.map((template) => (
                <TemplateCard
                  key={template.id}
                  template={template}
                  onPreview={handlePreview}
                  onUseTemplate={handleUseTemplate}
                />
              ))}
            </div>
          )
        })()}
      </div>

      {/* Template Preview Modal would go here */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{selectedTemplate.name}</CardTitle>
                  <p className="text-muted-foreground mt-2">{selectedTemplate.description}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setSelectedTemplate(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="font-medium">Complexity:</span> {selectedTemplate.complexity}
                </div>
                <div>
                  <span className="font-medium">Est. Time:</span> {Math.floor(selectedTemplate.estimatedTime / 60)}h {selectedTemplate.estimatedTime % 60}m
                </div>
                <div>
                  <span className="font-medium">Rating:</span> {selectedTemplate.rating}/5 ({selectedTemplate.reviewCount} reviews)
                </div>
                <div>
                  <span className="font-medium">Downloads:</span> {selectedTemplate.downloadCount.toLocaleString()}
                </div>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">Tech Stack</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedTemplate.techStack.map((tech) => (
                    <Badge key={tech} variant="outline">{tech}</Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">Project Prompt</h4>
                <p className="text-sm text-muted-foreground bg-muted p-3 rounded">
                  {selectedTemplate.template.requestPrompt}
                </p>
              </div>

              <div className="flex gap-2">
                <Button onClick={() => handleUseTemplate(selectedTemplate)} className="flex-1">
                  <Heart className="h-4 w-4 mr-2" />
                  Use This Template
                </Button>
                <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default ProjectTemplatesGallery
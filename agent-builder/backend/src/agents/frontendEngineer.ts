import { Context } from 'aws-lambda'
import { DatabaseService } from '../utils/database'
import { AgentExecutionContext, AgentResponse } from '../models'

const db = new DatabaseService()

export const handler = async (event: AgentExecutionContext, _context: Context): Promise<AgentResponse> => {
  console.log('Frontend Engineer Agent execution:', JSON.stringify(event, null, 2))

  try {
    const { projectId, project, previousArtifacts } = event

    // Get requirements from previous artifacts
    const srs = previousArtifacts.find(a => a.artifactType === 'SRS_DOCUMENT')
    // const backend = previousArtifacts.find(a => a.artifactType === 'SOURCE_CODE' && a.title?.includes('Backend'))
    
    const features = srs?.metadata?.features || []
    // const apiEndpoints = backend?.metadata?.endpoints || []

    // Simulate frontend development work
    await new Promise(resolve => setTimeout(resolve, 4000))

    // Generate component structure
    const components = generateComponents(features)
    
    // Generate pages
    const pages = generatePages(features)

    // Create frontend source code artifact
    const frontendArtifact = await db.createArtifact({
      projectId,
      artifactType: 'SOURCE_CODE',
      location: `https://github.com/agent-builder/${projectId}-frontend`,
      version: '1.0',
      title: 'Frontend Source Code',
      description: `React application with TypeScript and Tailwind CSS for ${project.projectName}`,
      metadata: {
        framework: 'React 18 + TypeScript',
        styling: 'Tailwind CSS',
        stateManagement: 'Redux Toolkit',
        routing: 'React Router v6',
        components,
        pages,
        features: features,
      },
    })

    return {
      success: true,
      artifacts: [frontendArtifact],
      metadata: {
        components: components.length,
        pages: pages.length,
        responsive: true,
        accessibility: 'WCAG 2.1 compliant',
      },
    }
  } catch (error) {
    console.error('Frontend Engineer Agent error:', error)
    return {
      success: false,
      artifacts: [],
      errorMessage: (error as Error).message,
    }
  }
}

const generateComponents = (features: string[]): string[] => {
  const components = [
    'Layout',
    'Header',
    'Sidebar',
    'Footer',
    'Button',
    'Input',
    'Modal',
    'Spinner',
    'Alert',
  ]

  if (features.includes('User Authentication')) {
    components.push('LoginForm', 'RegisterForm', 'ProfileSettings')
  }

  if (features.includes('Dashboard')) {
    components.push('Dashboard', 'StatsCard', 'Chart', 'RecentActivity')
  }

  if (features.includes('Task Management')) {
    components.push(
      'ProjectList',
      'ProjectCard',
      'TaskList',
      'TaskItem',
      'TaskForm',
      'ProjectForm',
      'TaskBoard',
      'ProgressBar'
    )
  }

  if (features.includes('Content Management')) {
    components.push(
      'PostList',
      'PostCard',
      'PostEditor',
      'PostForm',
      'RichTextEditor',
      'ImageUpload'
    )
  }

  if (features.includes('E-commerce Functionality')) {
    components.push(
      'ProductList',
      'ProductCard',
      'ProductDetails',
      'ShoppingCart',
      'CartItem',
      'Checkout',
      'OrderSummary',
      'PaymentForm'
    )
  }

  if (features.includes('Real-time Notifications')) {
    components.push('NotificationCenter', 'NotificationItem', 'ToastNotification')
  }

  return components
}

const generatePages = (features: string[]): string[] => {
  const pages = [
    'Home',
    'About',
    'Contact',
    'NotFound',
  ]

  if (features.includes('User Authentication')) {
    pages.push('Login', 'Register', 'Profile', 'Settings')
  }

  if (features.includes('Dashboard')) {
    pages.push('Dashboard')
  }

  if (features.includes('Task Management')) {
    pages.push(
      'Projects',
      'ProjectDetail',
      'CreateProject',
      'Tasks',
      'TaskDetail',
      'CreateTask'
    )
  }

  if (features.includes('Content Management')) {
    pages.push(
      'Blog',
      'PostDetail',
      'CreatePost',
      'EditPost',
      'PostList'
    )
  }

  if (features.includes('E-commerce Functionality')) {
    pages.push(
      'Shop',
      'ProductDetail',
      'Cart',
      'Checkout',
      'Orders',
      'OrderDetail'
    )
  }

  return pages
}
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { projectsApi, CreateProjectRequest } from '../services/projects'
import { addNotification } from '../store/slices/uiSlice'
import { 
  Zap, 
  Lightbulb, 
  Code, 
  Globe, 
  Database, 
  Settings, 
  Eye,
  Sparkles,
  Server,
  Layers
} from 'lucide-react'

// SERA UI Components
import { SeraCard, SeraCardContent, SeraCardHeader, SeraCardTitle } from '@/components/ui/seraCard'
import { SeraInput, SeraTextarea } from '@/components/ui/seraInput'
import { SeraStepper, SeraStepperNavigation } from '@/components/ui/seraStepper'
import {
  SeraSelect,
  SeraSelectContent,
  SeraSelectItem,
  SeraSelectTrigger,
  SeraSelectValue,
} from '@/components/ui/seraSelect'

const createProjectSchema = z.object({
  projectName: z.string().min(1, 'Project name is required').max(50, 'Project name too long'),
  requestPrompt: z.string().min(10, 'Description must be at least 10 characters'),
  techStack: z.string().optional(),
  apiKeys: z.string().optional(),
  additionalRequirements: z.string().optional(),
})

type CreateProjectForm = z.infer<typeof createProjectSchema>

const CreateProject: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [currentStep, setCurrentStep] = useState(0)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isValid },
  } = useForm<CreateProjectForm>({
    resolver: zodResolver(createProjectSchema),
    mode: 'onChange',
  })

  const watchedValues = watch()

  const createProjectMutation = useMutation({
    mutationFn: (data: CreateProjectRequest) => projectsApi.createProject(data),
    onSuccess: (response) => {
      dispatch(addNotification({
        type: 'success',
        title: 'Project Created',
        message: 'Your project has been created and the AI agents are starting work!',
      }))
      navigate(`/project/${response.projectId}`)
    },
    onError: (error: any) => {
      dispatch(addNotification({
        type: 'error',
        title: 'Creation Failed',
        message: error.response?.data?.message || 'Failed to create project',
      }))
    },
  })

  const steps = [
    {
      title: "Project Basics",
      description: "Name & description"
    },
    {
      title: "Configuration",
      description: "Tech stack & settings"
    },
    {
      title: "Review",
      description: "Confirm & create"
    }
  ]

  const examplePrompts = [
    {
      icon: Code,
      title: "Simple Blog Platform",
      description: "Create a blog where I can create, edit, and delete posts with a clean, modern design",
      prompt: "Create a simple blog platform where I can create, edit, and delete posts. Include user authentication, a rich text editor for posts, and a clean modern design with responsive layout."
    },
    {
      icon: Database,
      title: "Task Management App",
      description: "Build a task management system with projects, due dates, and team collaboration",
      prompt: "Build a task management application where users can create projects, add tasks with due dates, assign them to team members, and track progress with a dashboard."
    },
    {
      icon: Globe,
      title: "E-commerce Store",
      description: "Create an online store with product catalog, shopping cart, and checkout",
      prompt: "Create an e-commerce store with product catalog, shopping cart functionality, user accounts, order management, and payment integration."
    },
    {
      icon: Lightbulb,
      title: "Recipe Sharing Platform",
      description: "Build a platform where users can share and discover recipes",
      prompt: "Build a recipe sharing platform where users can upload recipes with photos, rate and review recipes, create collections, and search by ingredients or dietary restrictions."
    }
  ]

  const techStackOptions = [
    { value: "react-node", label: "React + Node.js", description: "Modern web app with JavaScript" },
    { value: "nextjs", label: "Next.js Full Stack", description: "React framework with SSR" },
    { value: "vue-express", label: "Vue.js + Express", description: "Progressive web app" },
    { value: "python-django", label: "Python + Django", description: "Rapid development framework" },
    { value: "python-fastapi", label: "Python + FastAPI", description: "High-performance API" },
    { value: "auto", label: "Auto-select", description: "Let AI choose the best stack" },
  ]

  const useExample = (prompt: string) => {
    setValue('requestPrompt', prompt)
  }

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const onSubmit = (data: CreateProjectForm) => {
    const projectData: CreateProjectRequest = {
      projectName: data.projectName,
      requestPrompt: data.requestPrompt,
    }
    createProjectMutation.mutate(projectData)
  }

  const isStepValid = () => {
    switch (currentStep) {
      case 0:
        return watchedValues.projectName && watchedValues.requestPrompt && watchedValues.requestPrompt.length >= 10
      case 1:
        return true // Configuration is optional
      case 2:
        return isValid
      default:
        return false
    }
  }

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <SeraInput
              id="projectName"
              label="Project Name"
              placeholder="e.g., My Awesome Blog, Task Manager Pro"
              error={errors.projectName?.message}
              helperText="Choose a memorable name for your project"
              required
              {...register('projectName')}
            />

            <SeraTextarea
              id="requestPrompt"
              label="Project Description"
              rows={6}
              placeholder="Describe your application in detail. What features do you want? Who are the users? What should it look like? The more specific you are, the better the result will be."
              error={errors.requestPrompt?.message}
              helperText="Describe your application in natural language. Be as specific as possible about features, design, and functionality."
              required
              {...register('requestPrompt')}
            />

            {/* Example Prompts */}
            <SeraCard variant="outline">
              <SeraCardHeader>
                <SeraCardTitle className="text-lg">Need inspiration? Try these examples:</SeraCardTitle>
              </SeraCardHeader>
              <SeraCardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {examplePrompts.map((example, index) => {
                    const Icon = example.icon
                    return (
                      <div
                        key={index}
                        className="border border-secondary-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                        onClick={() => useExample(example.prompt)}
                      >
                        <div className="flex items-start space-x-3">
                          <div className="flex-shrink-0">
                            <Icon className="h-5 w-5 text-primary-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-secondary-900">
                              {example.title}
                            </h3>
                            <p className="text-xs text-secondary-500 mt-1">
                              {example.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
                <p className="text-sm text-secondary-500 mt-4">
                  Click on any example to use it as a starting point for your project description.
                </p>
              </SeraCardContent>
            </SeraCard>
          </div>
        )

      case 1:
        return (
          <div className="space-y-6">
            <SeraSelect value={watchedValues.techStack} onValueChange={(value: string) => setValue('techStack', value)}>
              <SeraSelectTrigger 
                label="Technology Stack"
                helperText="Select your preferred technology stack. AI will choose the best option if left empty."
              >
                <SeraSelectValue placeholder="Choose a tech stack or let AI decide" />
              </SeraSelectTrigger>
              <SeraSelectContent>
                {techStackOptions.map((option) => (
                  <SeraSelectItem key={option.value} value={option.value}>
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-secondary-500">{option.description}</div>
                    </div>
                  </SeraSelectItem>
                ))}
              </SeraSelectContent>
            </SeraSelect>

            <SeraTextarea
              id="apiKeys"
              label="API Keys & Integrations"
              rows={4}
              placeholder="List any API keys, third-party services, or integrations you want to include (e.g., Stripe for payments, SendGrid for emails, Google Maps)"
              helperText="Optional: Specify any third-party services or APIs your project should integrate with."
              {...register('apiKeys')}
            />

            <SeraTextarea
              id="additionalRequirements"
              label="Additional Requirements"
              rows={4}
              placeholder="Any specific requirements, constraints, or preferences for your project (e.g., mobile-responsive, dark mode, specific UI framework)"
              helperText="Optional: Add any specific technical requirements or constraints."
              {...register('additionalRequirements')}
            />

            <SeraCard variant="outline" className="bg-primary-50 border-primary-200">
              <SeraCardContent className="pt-6">
                <div className="flex items-start space-x-3">
                  <Sparkles className="h-5 w-5 text-primary-600 mt-0.5" />
                  <div>
                    <h3 className="text-sm font-medium text-primary-900">AI Configuration</h3>
                    <p className="text-sm text-primary-700 mt-1">
                      These settings help our AI agents make better decisions about your project architecture and implementation.
                    </p>
                  </div>
                </div>
              </SeraCardContent>
            </SeraCard>
          </div>
        )

      case 2:
        return (
          <div className="space-y-6">
            <SeraCard variant="elevated">
              <SeraCardHeader>
                <SeraCardTitle className="flex items-center space-x-2">
                  <Eye className="h-5 w-5" />
                  <span>Project Review</span>
                </SeraCardTitle>
                <p className="text-secondary-600">
                  Review your project details before creation
                </p>
              </SeraCardHeader>
              <SeraCardContent className="space-y-4">
                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-2">Project Name</h4>
                  <p className="text-sm text-secondary-600">{watchedValues.projectName}</p>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-secondary-900 mb-2">Description</h4>
                  <p className="text-sm text-secondary-600 whitespace-pre-wrap">{watchedValues.requestPrompt}</p>
                </div>

                {watchedValues.techStack && (
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900 mb-2">Technology Stack</h4>
                    <p className="text-sm text-secondary-600">
                      {techStackOptions.find(option => option.value === watchedValues.techStack)?.label}
                    </p>
                  </div>
                )}

                {watchedValues.apiKeys && (
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900 mb-2">API Keys & Integrations</h4>
                    <p className="text-sm text-secondary-600 whitespace-pre-wrap">{watchedValues.apiKeys}</p>
                  </div>
                )}

                {watchedValues.additionalRequirements && (
                  <div>
                    <h4 className="text-sm font-medium text-secondary-900 mb-2">Additional Requirements</h4>
                    <p className="text-sm text-secondary-600 whitespace-pre-wrap">{watchedValues.additionalRequirements}</p>
                  </div>
                )}
              </SeraCardContent>
            </SeraCard>

            {/* AI Process Overview */}
            <SeraCard variant="gradient" className="bg-gradient-to-r from-primary-50 to-primary-100 border-primary-200">
              <SeraCardHeader>
                <SeraCardTitle className="text-lg">What happens next?</SeraCardTitle>
              </SeraCardHeader>
              <SeraCardContent>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="flex items-center justify-center h-10 w-10 bg-primary-100 rounded-full mx-auto mb-2">
                      <Settings className="h-5 w-5 text-primary-600" />
                    </div>
                    <h3 className="text-sm font-medium text-secondary-900">Analysis</h3>
                    <p className="text-xs text-secondary-500 mt-1">AI analyzes your requirements</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center h-10 w-10 bg-primary-100 rounded-full mx-auto mb-2">
                      <Layers className="h-5 w-5 text-primary-600" />
                    </div>
                    <h3 className="text-sm font-medium text-secondary-900">Planning</h3>
                    <p className="text-xs text-secondary-500 mt-1">Creates detailed specifications</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center h-10 w-10 bg-primary-100 rounded-full mx-auto mb-2">
                      <Server className="h-5 w-5 text-primary-600" />
                    </div>
                    <h3 className="text-sm font-medium text-secondary-900">Development</h3>
                    <p className="text-xs text-secondary-500 mt-1">Generates frontend & backend code</p>
                  </div>
                  <div className="text-center">
                    <div className="flex items-center justify-center h-10 w-10 bg-primary-100 rounded-full mx-auto mb-2">
                      <Globe className="h-5 w-5 text-primary-600" />
                    </div>
                    <h3 className="text-sm font-medium text-secondary-900">Deployment</h3>
                    <p className="text-xs text-secondary-500 mt-1">Deploys your live application</p>
                  </div>
                </div>
              </SeraCardContent>
            </SeraCard>
          </div>
        )

      default:
        return null
    }
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center">
        <div className="flex justify-center mb-4">
          <div className="flex items-center justify-center h-16 w-16 bg-primary-100 rounded-full">
            <Zap className="h-8 w-8 text-primary-600" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-secondary-900">Create New Project</h1>
        <p className="mt-2 text-lg text-secondary-600">
          Describe your application idea and let our AI agents build it for you
        </p>
      </div>

      {/* Stepper */}
      <SeraCard variant="elevated">
        <SeraCardContent className="pt-6">
          <SeraStepper steps={steps} currentStep={currentStep} />
        </SeraCardContent>
      </SeraCard>

      {/* Step Content */}
      <SeraCard variant="elevated">
        <SeraCardContent className="pt-6">
          <form onSubmit={handleSubmit(onSubmit)}>
            {renderStepContent()}
            
            <SeraStepperNavigation
              currentStep={currentStep}
              totalSteps={steps.length}
              onNext={currentStep === steps.length - 1 ? handleSubmit(onSubmit) : handleNext}
              onPrevious={currentStep > 0 ? handlePrevious : undefined}
              onCancel={() => navigate('/')}
              nextLabel={currentStep === steps.length - 1 ? 'Create Project' : 'Next'}
              isNextDisabled={!isStepValid()}
              isLoading={createProjectMutation.isPending}
            />
          </form>
        </SeraCardContent>
      </SeraCard>
    </div>
  )
}

export default CreateProject
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation } from '@tanstack/react-query'
import { useDispatch } from 'react-redux'
import { projectsApi, CreateProjectRequest } from '../services/projects'
// import { addProject } from '../store/slices/projectsSlice'
import { addNotification } from '../store/slices/uiSlice'
import { Zap, Lightbulb, Code, Globe, Database } from 'lucide-react'

const CreateProject: React.FC = () => {
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const [formData, setFormData] = useState({
    projectName: '',
    requestPrompt: '',
  })

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.projectName.trim() || !formData.requestPrompt.trim()) {
      dispatch(addNotification({
        type: 'warning',
        title: 'Missing Information',
        message: 'Please fill in both project name and description',
      }))
      return
    }
    createProjectMutation.mutate(formData)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

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

  const useExample = (prompt: string) => {
    setFormData(prev => ({
      ...prev,
      requestPrompt: prompt
    }))
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
        <h1 className="text-3xl font-bold text-gray-900">Create New Project</h1>
        <p className="mt-2 text-lg text-gray-600">
          Describe your application idea in natural language and let our AI agents build it for you
        </p>
      </div>

      {/* Main Form */}
      <div className="card">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="projectName" className="block text-sm font-medium text-gray-700">
              Project Name
            </label>
            <div className="mt-1">
              <input
                type="text"
                id="projectName"
                name="projectName"
                value={formData.projectName}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., My Awesome Blog, Task Manager Pro"
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Choose a memorable name for your project
            </p>
          </div>

          <div>
            <label htmlFor="requestPrompt" className="block text-sm font-medium text-gray-700">
              Project Description
            </label>
            <div className="mt-1">
              <textarea
                id="requestPrompt"
                name="requestPrompt"
                rows={6}
                value={formData.requestPrompt}
                onChange={handleChange}
                className="input-field resize-none"
                placeholder="Describe your application in detail. What features do you want? Who are the users? What should it look like? The more specific you are, the better the result will be."
                required
              />
            </div>
            <p className="mt-2 text-sm text-gray-500">
              Describe your application in natural language. Be as specific as possible about features, design, and functionality.
            </p>
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="btn-secondary"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createProjectMutation.isPending}
              className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
            >
              {createProjectMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span>Creating...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Create Project</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Example Prompts */}
      <div className="card">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Need inspiration? Try these examples:
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {examplePrompts.map((example, index) => {
            const Icon = example.icon
            return (
              <div
                key={index}
                className="border border-gray-200 rounded-lg p-4 hover:border-primary-300 hover:bg-primary-50 transition-colors cursor-pointer"
                onClick={() => useExample(example.prompt)}
              >
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0">
                    <Icon className="h-6 w-6 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-medium text-gray-900">
                      {example.title}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {example.description}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        <p className="text-sm text-gray-500 mt-4">
          Click on any example to use it as a starting point for your project description.
        </p>
      </div>

      {/* AI Process Overview */}
      <div className="card bg-gradient-to-r from-primary-50 to-blue-50 border-primary-200">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          What happens next?
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center h-10 w-10 bg-primary-100 rounded-full mx-auto mb-2">
              <span className="text-sm font-semibold text-primary-600">1</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900">Analysis</h3>
            <p className="text-xs text-gray-500 mt-1">AI analyzes your requirements</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-10 w-10 bg-primary-100 rounded-full mx-auto mb-2">
              <span className="text-sm font-semibold text-primary-600">2</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900">Planning</h3>
            <p className="text-xs text-gray-500 mt-1">Creates detailed specifications</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-10 w-10 bg-primary-100 rounded-full mx-auto mb-2">
              <span className="text-sm font-semibold text-primary-600">3</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900">Development</h3>
            <p className="text-xs text-gray-500 mt-1">Generates frontend & backend code</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center h-10 w-10 bg-primary-100 rounded-full mx-auto mb-2">
              <span className="text-sm font-semibold text-primary-600">4</span>
            </div>
            <h3 className="text-sm font-medium text-gray-900">Deployment</h3>
            <p className="text-xs text-gray-500 mt-1">Deploys your live application</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateProject
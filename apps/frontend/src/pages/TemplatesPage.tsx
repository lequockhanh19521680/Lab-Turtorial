import React from 'react'
import { useNavigate } from 'react-router-dom'
import ProjectTemplatesGallery from '../features/dashboard/components/ProjectTemplatesGallery'
import type { ProjectTemplate } from '@lab-tutorial/shared-types'

const TemplatesPage: React.FC = () => {
  const navigate = useNavigate()

  const handleTemplateSelected = (template: ProjectTemplate) => {
    // In a real app, this would create a new project with the template
    console.log('Using template:', template)
    
    // For demo purposes, navigate to create project with template data
    navigate('/create', { 
      state: { 
        templateData: {
          projectName: template.template.projectName,
          requestPrompt: template.template.requestPrompt,
          templateId: template.id
        }
      }
    })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <div className="container mx-auto p-6">
        <ProjectTemplatesGallery onTemplateSelected={handleTemplateSelected} />
      </div>
    </div>
  )
}

export default TemplatesPage
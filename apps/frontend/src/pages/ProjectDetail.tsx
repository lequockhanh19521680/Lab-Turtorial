import React from 'react'
import { Link } from 'react-router-dom'

// Temporary placeholder during Shadcn UI migration - layout bug fix will be addressed in the full refactor
const ProjectDetail: React.FC = () => {
  return (
    <div className="p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Project Detail</h1>
        <p className="text-muted-foreground mb-4">This component is being refactored to use Shadcn UI and fix layout bugs.</p>
        <Link to="/" className="text-primary hover:underline">Go to Dashboard</Link>
      </div>
    </div>
  )
}

export default ProjectDetail
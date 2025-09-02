import React from 'react'
import { Link } from 'react-router-dom'

// Simple placeholder component - use Dashboard.tsx instead of EnhancedDashboard for now
const EnhancedDashboard: React.FC = () => {
  return (
    <div className="p-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold mb-4">Enhanced Dashboard</h1>
        <p className="text-muted-foreground mb-4">This component is temporarily disabled during Shadcn UI migration.</p>
        <Link to="/" className="text-primary hover:underline">Go to regular Dashboard</Link>
      </div>
    </div>
  )
}

export default EnhancedDashboard
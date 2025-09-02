import React from 'react'
import { Link } from 'react-router-dom'

// Simple placeholder component during Shadcn UI migration
const Register: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col justify-center">
      <div className="max-w-md mx-auto w-full p-6">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Registration</h1>
          <p className="text-muted-foreground mb-4">This component is temporarily disabled during Shadcn UI migration.</p>
          <Link to="/login" className="text-primary hover:underline">Go to Login instead</Link>
        </div>
      </div>
    </div>
  )
}

export default Register
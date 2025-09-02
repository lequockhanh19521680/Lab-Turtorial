import React from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { authService } from '../../../services/auth'

interface ProtectedRouteProps {
  children: React.ReactNode
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const location = useLocation()
  const isAuthenticated = authService.isAuthenticated()

  // Temporary bypass for development - remove this in production
  const isDevelopment = import.meta.env.DEV && import.meta.env.VITE_USE_MOCK_API === 'true'
  
  if (!isAuthenticated && !isDevelopment) {
    // Redirect to login page with return url
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}

export default ProtectedRoute
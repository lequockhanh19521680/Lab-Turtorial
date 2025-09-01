import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { authService } from '../services/auth'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      const code = searchParams.get('code')
      const errorParam = searchParams.get('error')
      const errorDescription = searchParams.get('error_description')

      if (errorParam) {
        setStatus('error')
        setError(errorDescription || 'Authentication failed')
        return
      }

      if (!code) {
        setStatus('error')
        setError('No authorization code received')
        return
      }

      try {
        await authService.handleOAuthCallback(code)
        setStatus('success')
        
        // Redirect to dashboard after a short delay
        setTimeout(() => {
          navigate('/')
        }, 2000)
      } catch (error: any) {
        setStatus('error')
        setError(error.message || 'Authentication failed')
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          {status === 'loading' && (
            <>
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-blue-100">
                <Loader2 className="h-6 w-6 text-blue-600 animate-spin" />
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Authenticating...
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Please wait while we sign you in
              </p>
            </>
          )}

          {status === 'success' && (
            <>
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-6 w-6 text-green-600" />
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Welcome to Agent Builder!
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                Authentication successful. Redirecting you to your dashboard...
              </p>
            </>
          )}

          {status === 'error' && (
            <>
              <div className="mx-auto h-12 w-12 flex items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-6 w-6 text-red-600" />
              </div>
              <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                Authentication Failed
              </h2>
              <p className="mt-2 text-center text-sm text-gray-600">
                {error}
              </p>
              <div className="mt-6">
                <button
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500"
                >
                  Back to Login
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

export default AuthCallback
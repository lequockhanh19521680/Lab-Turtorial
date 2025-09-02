import React, { useState } from 'react'
import { Button } from './ui/button'
import { authService } from '../services/auth'
import { useNavigate } from 'react-router-dom'

declare global {
  interface Window {
    FB: any
    fbAsyncInit: () => void
  }
}

interface FacebookLoginProps {
  onSuccess?: (user: any) => void
  onError?: (error: any) => void
  className?: string
}

const FacebookLogin: React.FC<FacebookLoginProps> = ({ 
  onSuccess, 
  onError, 
  className = "" 
}) => {
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()

  // Initialize Facebook SDK
  React.useEffect(() => {
    // Load Facebook SDK script
    if (!document.getElementById('facebook-jssdk')) {
      const script = document.createElement('script')
      script.id = 'facebook-jssdk'
      script.src = 'https://connect.facebook.net/en_US/sdk.js'
      script.async = true
      script.defer = true
      document.body.appendChild(script)
    }

    // Initialize Facebook SDK when script loads
    window.fbAsyncInit = function() {
      window.FB.init({
        appId: process.env.REACT_APP_FACEBOOK_APP_ID || 'your-facebook-app-id',
        cookie: true,
        xfbml: true,
        version: 'v18.0'
      })
    }
  }, [])

  const handleFacebookLogin = async () => {
    if (!window.FB) {
      console.error('Facebook SDK not loaded')
      return
    }

    setIsLoading(true)

    try {
      // Check login status
      window.FB.login((response: any) => {
        if (response.authResponse) {
          // User authorized the app
          window.FB.api('/me', { fields: 'name,email,picture' }, async (userInfo: any) => {
            try {
              // Sign in with Facebook using Cognito
              const result = await authService.signInWithFacebook(response.authResponse.accessToken)
              
              if (onSuccess) {
                onSuccess(result)
              } else {
                navigate('/')
              }
            } catch (error) {
              console.error('Facebook login error:', error)
              if (onError) {
                onError(error)
              }
            } finally {
              setIsLoading(false)
            }
          })
        } else {
          console.log('User cancelled login or did not fully authorize.')
          setIsLoading(false)
        }
      }, { scope: 'email,public_profile' })
    } catch (error) {
      console.error('Facebook login failed:', error)
      if (onError) {
        onError(error)
      }
      setIsLoading(false)
    }
  }

  return (
    <Button
      onClick={handleFacebookLogin}
      disabled={isLoading}
      className={`
        w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg
        flex items-center justify-center space-x-2 transition-colors duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {isLoading ? (
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Connecting...</span>
        </div>
      ) : (
        <div className="flex items-center space-x-2">
          <svg 
            className="w-5 h-5" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
          </svg>
          <span>Continue with Facebook</span>
        </div>
      )}
    </Button>
  )
}

export default FacebookLogin
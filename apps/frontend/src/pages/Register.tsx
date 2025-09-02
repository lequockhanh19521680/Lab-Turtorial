import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { authService } from '../services/auth'
import { Mail, Lock, User, UserPlus, AlertCircle, CheckCircle, Zap } from 'lucide-react'

// SERA UI Components
import { PrimaryButton, SecondaryButton } from '@/components/ui/seraButton'
import { SeraCard, SeraCardContent, SeraCardHeader, SeraCardTitle } from '@/components/ui/seraCard'
import { SeraInput } from '@/components/ui/seraInput'

const registerSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string().min(1, 'Please confirm your password'),
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterForm = z.infer<typeof registerSchema>

const Register: React.FC = () => {
  const navigate = useNavigate()
  const [step, setStep] = useState<'register' | 'confirm'>('register')
  const [confirmationCode, setConfirmationCode] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [email, setEmail] = useState('')
  const [registrationData, setRegistrationData] = useState<RegisterForm | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
  })

  const onSubmit = async (data: RegisterForm) => {
    setIsLoading(true)
    setError(null)
    setEmail(data.email)
    setRegistrationData(data) // Store registration data for auto-login

    try {
      const result = await authService.signUp({
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      })

      if (result.needsConfirmation) {
        setStep('confirm')
        setSuccess('Please check your email for a confirmation code')
      } else {
        // If no confirmation needed, auto-login immediately
        await authService.signIn({
          email: data.email,
          password: data.password
        })
        navigate('/')
      }
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
  }

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      await authService.confirmSignUp(email, confirmationCode)
      setSuccess('Account confirmed successfully! Signing you in...')
      
      // Auto-login after successful confirmation using stored registration data
      if (registrationData) {
        await authService.signIn({
          email: registrationData.email,
          password: registrationData.password
        })
        
        // Navigate directly to home page
        navigate('/')
      } else {
        // Fallback to login page if registration data is missing
        setTimeout(() => navigate('/login'), 2000)
      }
    } catch (error: any) {
      setError(error.message)
      // If auto-login fails, still redirect to login page
      setTimeout(() => navigate('/login'), 2000)
    } finally {
      setIsLoading(false)
    }
  }

  if (step === 'confirm') {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
        {/* Left Column - Branding */}
        <div className="lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto lg:mx-0">
            <div className="flex items-center space-x-3 mb-8">
              <div className="p-2 bg-white/10 rounded-lg">
                <Zap className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-2xl font-bold text-white">Agent Builder</h1>
            </div>
            
            <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
              Almost there!
            </h2>
            <p className="text-primary-100 text-lg">
              We've sent a confirmation code to your email. Enter it below to complete your registration and start building.
            </p>
          </div>
        </div>

        {/* Right Column - Confirmation Form */}
        <div className="lg:flex lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
          <div className="max-w-md mx-auto lg:mx-0 w-full">
            <SeraCard variant="elevated" className="border-0 shadow-none lg:border lg:shadow-medium">
              <SeraCardHeader className="space-y-1 text-center lg:text-left">
                <SeraCardTitle className="text-2xl font-bold">Confirm your email</SeraCardTitle>
                <p className="text-secondary-600">
                  We sent a confirmation code to {email}
                </p>
              </SeraCardHeader>
              <SeraCardContent className="space-y-6">
                {error && (
                  <div className="flex items-center space-x-2 p-3 bg-error-50 border border-error-200 rounded-lg">
                    <AlertCircle className="h-4 w-4 text-error-500" />
                    <span className="text-sm text-error-700">{error}</span>
                  </div>
                )}

                {success && (
                  <div className="flex items-center space-x-2 p-3 bg-success-50 border border-success-200 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-success-500" />
                    <span className="text-sm text-success-700">{success}</span>
                  </div>
                )}

                <form onSubmit={handleConfirm} className="space-y-4">
                  <SeraInput
                    id="confirmationCode"
                    label="Confirmation Code"
                    type="text"
                    placeholder="Enter the 6-digit code"
                    value={confirmationCode}
                    onChange={(e) => setConfirmationCode(e.target.value)}
                    required
                  />

                  <PrimaryButton 
                    type="submit" 
                    className="w-full" 
                    disabled={isLoading}
                    loading={isLoading}
                    loadingText="Confirming..."
                  >
                    Confirm Account
                  </PrimaryButton>
                </form>

                <div className="text-center">
                  <SecondaryButton
                    onClick={() => setStep('register')}
                    className="text-sm"
                  >
                    Back to registration
                  </SecondaryButton>
                </div>
              </SeraCardContent>
            </SeraCard>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col lg:flex-row">
      {/* Left Column - Branding */}
      <div className="lg:flex lg:w-1/2 bg-gradient-to-br from-primary-600 to-primary-800 p-8 lg:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto lg:mx-0">
          <div className="flex items-center space-x-3 mb-8">
            <div className="p-2 bg-white/10 rounded-lg">
              <Zap className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-white">Agent Builder</h1>
          </div>
          
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-4">
            Join thousands of developers
          </h2>
          <p className="text-primary-100 text-lg">
            Start your journey with AI-powered development. Create, deploy, and scale applications faster than ever before.
          </p>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-3 text-primary-100">
              <div className="w-2 h-2 bg-primary-200 rounded-full"></div>
              <span>Free to start building</span>
            </div>
            <div className="flex items-center space-x-3 text-primary-100">
              <div className="w-2 h-2 bg-primary-200 rounded-full"></div>
              <span>No credit card required</span>
            </div>
            <div className="flex items-center space-x-3 text-primary-100">
              <div className="w-2 h-2 bg-primary-200 rounded-full"></div>
              <span>Deploy in minutes</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Registration Form */}
      <div className="lg:flex lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto lg:mx-0 w-full">
          <SeraCard variant="elevated" className="border-0 shadow-none lg:border lg:shadow-medium">
            <SeraCardHeader className="space-y-1 text-center lg:text-left">
              <SeraCardTitle className="text-2xl font-bold">Create your account</SeraCardTitle>
              <p className="text-secondary-600">
                Enter your details below to create your account and start building
              </p>
            </SeraCardHeader>
            <SeraCardContent className="space-y-6">
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-error-50 border border-error-200 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-error-500" />
                  <span className="text-sm text-error-700">{error}</span>
                </div>
              )}

              {success && (
                <div className="flex items-center space-x-2 p-3 bg-success-50 border border-success-200 rounded-lg">
                  <CheckCircle className="h-4 w-4 text-success-500" />
                  <span className="text-sm text-success-700">{success}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <SeraInput
                    id="firstName"
                    label="First Name"
                    placeholder="First name"
                    leftIcon={<User className="h-4 w-4" />}
                    error={errors.firstName?.message}
                    required
                    {...register('firstName')}
                  />

                  <SeraInput
                    id="lastName"
                    label="Last Name"
                    placeholder="Last name"
                    error={errors.lastName?.message}
                    required
                    {...register('lastName')}
                  />
                </div>

                <SeraInput
                  id="email"
                  label="Email address"
                  type="email"
                  placeholder="Enter your email"
                  leftIcon={<Mail className="h-4 w-4" />}
                  error={errors.email?.message}
                  required
                  {...register('email')}
                />

                <SeraInput
                  id="password"
                  label="Password"
                  type="password"
                  placeholder="Create a password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.password?.message}
                  required
                  {...register('password')}
                />

                <SeraInput
                  id="confirmPassword"
                  label="Confirm Password"
                  type="password"
                  placeholder="Confirm your password"
                  leftIcon={<Lock className="h-4 w-4" />}
                  error={errors.confirmPassword?.message}
                  required
                  {...register('confirmPassword')}
                />

                <PrimaryButton 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  loading={isLoading}
                  loadingText="Creating account..."
                  leftIcon={!isLoading ? <UserPlus className="h-4 w-4" /> : undefined}
                >
                  Create Account
                </PrimaryButton>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-secondary-300" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-white text-secondary-500">Or continue with</span>
                </div>
              </div>

              <SecondaryButton
                className="w-full"
                onClick={() => authService.signInWithGoogle()}
              >
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </SecondaryButton>

              <div className="text-center text-sm text-secondary-600">
                Already have an account?{' '}
                <Link to="/login" className="font-medium text-primary-600 hover:text-primary-500 transition-colors">
                  Sign in instead
                </Link>
              </div>
            </SeraCardContent>
          </SeraCard>
        </div>
      </div>
    </div>
  )
}

export default Register
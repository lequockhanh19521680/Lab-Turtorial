import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { authService } from '../services/auth'
import { Mail, Lock, LogIn, AlertCircle, Zap } from 'lucide-react'

// Shadcn UI Components
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type LoginForm = z.infer<typeof loginSchema>

const Login: React.FC = () => {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginForm) => {
    setIsLoading(true)
    setError(null)

    try {
      await authService.signIn(data)
      navigate('/')
    } catch (error: any) {
      setError(error.message)
    } finally {
      setIsLoading(false)
    }
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
            Build powerful applications with AI
          </h2>
          <p className="text-primary-100 text-lg">
            Create full-stack applications in minutes, not hours. Let our AI agents handle the heavy lifting while you focus on what matters.
          </p>
          
          <div className="mt-8 space-y-4">
            <div className="flex items-center space-x-3 text-primary-100">
              <div className="w-2 h-2 bg-primary-200 rounded-full"></div>
              <span>AI-powered code generation</span>
            </div>
            <div className="flex items-center space-x-3 text-primary-100">
              <div className="w-2 h-2 bg-primary-200 rounded-full"></div>
              <span>Full-stack applications</span>
            </div>
            <div className="flex items-center space-x-3 text-primary-100">
              <div className="w-2 h-2 bg-primary-200 rounded-full"></div>
              <span>Deployment ready code</span>
            </div>
          </div>
        </div>
      </div>

      {/* Right Column - Login Form */}
      <div className="lg:flex lg:w-1/2 p-8 lg:p-12 flex flex-col justify-center">
        <div className="max-w-md mx-auto lg:mx-0 w-full">
          <Card className="border-0 shadow-none lg:border lg:shadow-lg">
            <CardHeader className="space-y-1 text-center lg:text-left">
              <CardTitle className="text-2xl font-bold">Welcome back</CardTitle>
              <p className="text-muted-foreground">
                Sign in to your account to continue building amazing applications
              </p>
            </CardHeader>
            <CardContent className="space-y-6">
              {error && (
                <div className="flex items-center space-x-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <AlertCircle className="h-4 w-4 text-destructive" />
                  <span className="text-sm text-destructive">{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Enter your email"
                      className="pl-10"
                      {...register('email')}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-sm text-destructive">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="Enter your password"
                      className="pl-10"
                      {...register('password')}
                    />
                  </div>
                  {errors.password && (
                    <p className="text-sm text-destructive">{errors.password.message}</p>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                  loading={isLoading}
                  leftIcon={!isLoading ? <LogIn className="h-4 w-4" /> : undefined}
                >
                  Sign in
                </Button>
              </form>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-background text-muted-foreground">Or continue with</span>
                </div>
              </div>

              <Button
                variant="outline"
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
              </Button>

              <div className="text-center text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Link to="/register" className="font-medium text-primary hover:text-primary/80 transition-colors">
                  Create one now
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default Login
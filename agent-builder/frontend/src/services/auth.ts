import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  AuthFlowType
} from '@aws-sdk/client-cognito-identity-provider'
import { mockAuth } from './mock'

// These should be environment variables in production
const COGNITO_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  userPoolId: import.meta.env.VITE_USER_POOL_ID || '',
  clientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || ''
}

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_CONFIG.region
})

// Check if we should use mock API
const USE_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true'

export interface SignUpRequest {
  email: string
  password: string
  firstName?: string
  lastName?: string
}

export interface SignInRequest {
  email: string
  password: string
}

export interface AuthResponse {
  accessToken: string
  idToken: string
  refreshToken: string
  user: {
    id: string
    email: string
    firstName?: string
    lastName?: string
  }
}

export const authService = {
  // Sign up new user
  signUp: async (data: SignUpRequest): Promise<{ userSub: string; needsConfirmation: boolean }> => {
    if (USE_MOCK_API) {
      // For mock API, simulate sign up
      await mockAuth.register({
        email: data.email,
        password: data.password,
        givenName: data.firstName,
        familyName: data.lastName
      })
      
      return {
        userSub: 'mock-user-sub-' + Date.now(),
        needsConfirmation: false // Skip confirmation for mock
      }
    }
    
    try {
      const command = new SignUpCommand({
        ClientId: COGNITO_CONFIG.clientId,
        Username: data.email,
        Password: data.password,
        UserAttributes: [
          {
            Name: 'email',
            Value: data.email
          },
          ...(data.firstName ? [{
            Name: 'given_name',
            Value: data.firstName
          }] : []),
          ...(data.lastName ? [{
            Name: 'family_name',
            Value: data.lastName
          }] : [])
        ]
      })

      const response = await cognitoClient.send(command)
      
      return {
        userSub: response.UserSub!,
        needsConfirmation: !response.UserConfirmed
      }
    } catch (error: any) {
      console.error('Sign up error:', error)
      throw new Error(error.message || 'Sign up failed')
    }
  },

  // Confirm sign up with verification code
  confirmSignUp: async (email: string, confirmationCode: string): Promise<void> => {
    if (USE_MOCK_API) {
      // For mock API, confirmation always succeeds
      return
    }
    
    try {
      const command = new ConfirmSignUpCommand({
        ClientId: COGNITO_CONFIG.clientId,
        Username: email,
        ConfirmationCode: confirmationCode
      })

      await cognitoClient.send(command)
    } catch (error: any) {
      console.error('Confirm sign up error:', error)
      throw new Error(error.message || 'Confirmation failed')
    }
  },

  // Sign in user
  signIn: async (data: SignInRequest): Promise<AuthResponse> => {
    if (USE_MOCK_API) {
      const mockResponse = await mockAuth.login(data.email, data.password)
      
      const authResponse: AuthResponse = {
        accessToken: mockResponse.token,
        idToken: mockResponse.token,
        refreshToken: mockResponse.token,
        user: {
          id: mockResponse.user.id,
          email: mockResponse.user.email,
          firstName: mockResponse.user.givenName,
          lastName: mockResponse.user.familyName
        }
      }

      // Store tokens in localStorage
      localStorage.setItem('authToken', mockResponse.token)
      localStorage.setItem('idToken', mockResponse.token)
      localStorage.setItem('refreshToken', mockResponse.token)
      localStorage.setItem('user', JSON.stringify(authResponse.user))

      return authResponse
    }
    
    try {
      const command = new InitiateAuthCommand({
        ClientId: COGNITO_CONFIG.clientId,
        AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
        AuthParameters: {
          USERNAME: data.email,
          PASSWORD: data.password
        }
      })

      const response = await cognitoClient.send(command)

      if (response.ChallengeName) {
        throw new Error(`Authentication challenge required: ${response.ChallengeName}`)
      }

      if (!response.AuthenticationResult) {
        throw new Error('Authentication failed')
      }

      const { AccessToken, IdToken, RefreshToken } = response.AuthenticationResult

      if (!AccessToken || !IdToken) {
        throw new Error('Invalid authentication response')
      }

      // Decode ID token to get user info
      const idTokenPayload = JSON.parse(atob(IdToken.split('.')[1]))

      const authResponse: AuthResponse = {
        accessToken: AccessToken,
        idToken: IdToken,
        refreshToken: RefreshToken || '',
        user: {
          id: idTokenPayload.sub,
          email: idTokenPayload.email,
          firstName: idTokenPayload.given_name,
          lastName: idTokenPayload.family_name
        }
      }

      // Store tokens in localStorage
      localStorage.setItem('authToken', AccessToken)
      localStorage.setItem('idToken', IdToken)
      localStorage.setItem('refreshToken', RefreshToken || '')
      localStorage.setItem('user', JSON.stringify(authResponse.user))

      return authResponse
    } catch (error: any) {
      console.error('Sign in error:', error)
      throw new Error(error.message || 'Sign in failed')
    }
  },

  // Sign out user
  signOut: async (): Promise<void> => {
    if (USE_MOCK_API) {
      await mockAuth.logout()
    }
    
    localStorage.removeItem('authToken')
    localStorage.removeItem('idToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken')
    if (!token) return false

    if (USE_MOCK_API) {
      // For mock API, token is always valid if it exists
      return true
    }

    try {
      // Basic token expiration check
      const payload = JSON.parse(atob(token.split('.')[1]))
      const currentTime = Math.floor(Date.now() / 1000)
      return payload.exp > currentTime
    } catch {
      return false
    }
  },

  // Get current user from localStorage
  getCurrentUser: async () => {
    if (USE_MOCK_API) {
      try {
        return await mockAuth.getCurrentUser()
      } catch {
        const userStr = localStorage.getItem('user')
        return userStr ? JSON.parse(userStr) : null
      }
    }
    
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem('authToken')
  },

  // Get OAuth URLs for social login
  getOAuthUrls: () => {
    const userPoolDomain = import.meta.env.VITE_USER_POOL_DOMAIN || `agent-builder-dev-${import.meta.env.VITE_AWS_ACCOUNT_ID}`
    const clientId = COGNITO_CONFIG.clientId
    const redirectUri = encodeURIComponent(`${window.location.origin}/auth/callback`)
    const region = COGNITO_CONFIG.region

    return {
      google: `https://${userPoolDomain}.auth.${region}.amazoncognito.com/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=email+openid+profile&` +
        `identity_provider=Google`,
      
      cognito: `https://${userPoolDomain}.auth.${region}.amazoncognito.com/oauth2/authorize?` +
        `response_type=code&` +
        `client_id=${clientId}&` +
        `redirect_uri=${redirectUri}&` +
        `scope=email+openid+profile`
    }
  },

  // Handle OAuth callback
  handleOAuthCallback: async (code: string): Promise<AuthResponse> => {
    const userPoolDomain = import.meta.env.VITE_USER_POOL_DOMAIN || `agent-builder-dev-${import.meta.env.VITE_AWS_ACCOUNT_ID}`
    const region = COGNITO_CONFIG.region
    const redirectUri = `${window.location.origin}/auth/callback`

    try {
      // Exchange authorization code for tokens
      const response = await fetch(`https://${userPoolDomain}.auth.${region}.amazoncognito.com/oauth2/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams({
          grant_type: 'authorization_code',
          client_id: COGNITO_CONFIG.clientId,
          code: code,
          redirect_uri: redirectUri
        })
      })

      if (!response.ok) {
        throw new Error('Failed to exchange authorization code for tokens')
      }

      const tokens = await response.json()
      const { access_token, id_token, refresh_token } = tokens

      // Decode ID token to get user info
      const idTokenPayload = JSON.parse(atob(id_token.split('.')[1]))

      const authResponse: AuthResponse = {
        accessToken: access_token,
        idToken: id_token,
        refreshToken: refresh_token || '',
        user: {
          id: idTokenPayload.sub,
          email: idTokenPayload.email,
          firstName: idTokenPayload.given_name,
          lastName: idTokenPayload.family_name
        }
      }

      // Store tokens in localStorage
      localStorage.setItem('authToken', access_token)
      localStorage.setItem('idToken', id_token)
      localStorage.setItem('refreshToken', refresh_token || '')
      localStorage.setItem('user', JSON.stringify(authResponse.user))

      return authResponse
    } catch (error: any) {
      console.error('OAuth callback error:', error)
      throw new Error(error.message || 'OAuth authentication failed')
    }
  },

  // Sign in with Google (redirect to OAuth)
  signInWithGoogle: (): void => {
    const urls = authService.getOAuthUrls()
    window.location.href = urls.google
  }
}
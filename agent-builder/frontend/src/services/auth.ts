import { 
  CognitoIdentityProviderClient, 
  SignUpCommand, 
  ConfirmSignUpCommand,
  InitiateAuthCommand,
  AuthFlowType
} from '@aws-sdk/client-cognito-identity-provider'

// These should be environment variables in production
const COGNITO_CONFIG = {
  region: import.meta.env.VITE_AWS_REGION || 'us-east-1',
  userPoolId: import.meta.env.VITE_USER_POOL_ID || '',
  clientId: import.meta.env.VITE_USER_POOL_CLIENT_ID || ''
}

const cognitoClient = new CognitoIdentityProviderClient({
  region: COGNITO_CONFIG.region
})

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
  signOut: (): void => {
    localStorage.removeItem('authToken')
    localStorage.removeItem('idToken')
    localStorage.removeItem('refreshToken')
    localStorage.removeItem('user')
  },

  // Check if user is authenticated
  isAuthenticated: (): boolean => {
    const token = localStorage.getItem('authToken')
    if (!token) return false

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
  getCurrentUser: () => {
    const userStr = localStorage.getItem('user')
    return userStr ? JSON.parse(userStr) : null
  },

  // Get stored token
  getToken: (): string | null => {
    return localStorage.getItem('authToken')
  }
}
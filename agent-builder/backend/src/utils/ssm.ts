import { SSMClient, GetParameterCommand, GetParametersCommand } from '@aws-sdk/client-ssm'

const ssmClient = new SSMClient({})

interface SecretCache {
  [key: string]: {
    value: string
    timestamp: number
  }
}

// Cache secrets for 5 minutes to avoid repeated SSM calls
const CACHE_TTL = 5 * 60 * 1000
const secretCache: SecretCache = {}

/**
 * Get a single parameter from SSM Parameter Store
 */
export const getParameter = async (parameterName: string, withDecryption = true): Promise<string> => {
  // Check cache first
  const cached = secretCache[parameterName]
  if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
    return cached.value
  }

  try {
    const command = new GetParameterCommand({
      Name: parameterName,
      WithDecryption: withDecryption
    })
    
    const response = await ssmClient.send(command)
    
    if (!response.Parameter?.Value) {
      throw new Error(`Parameter ${parameterName} not found or has no value`)
    }

    // Cache the result
    secretCache[parameterName] = {
      value: response.Parameter.Value,
      timestamp: Date.now()
    }

    return response.Parameter.Value
  } catch (error) {
    console.error(`Failed to get parameter ${parameterName}:`, error)
    throw error
  }
}

/**
 * Get multiple parameters from SSM Parameter Store
 */
export const getParameters = async (parameterNames: string[], withDecryption = true): Promise<Record<string, string>> => {
  const result: Record<string, string> = {}
  const uncachedParams: string[] = []

  // Check cache for each parameter
  for (const paramName of parameterNames) {
    const cached = secretCache[paramName]
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      result[paramName] = cached.value
    } else {
      uncachedParams.push(paramName)
    }
  }

  // Fetch uncached parameters
  if (uncachedParams.length > 0) {
    try {
      const command = new GetParametersCommand({
        Names: uncachedParams,
        WithDecryption: withDecryption
      })
      
      const response = await ssmClient.send(command)
      
      if (response.Parameters) {
        for (const param of response.Parameters) {
          if (param.Name && param.Value) {
            result[param.Name] = param.Value
            
            // Cache the result
            secretCache[param.Name] = {
              value: param.Value,
              timestamp: Date.now()
            }
          }
        }
      }

      // Check for any invalid parameters
      if (response.InvalidParameters && response.InvalidParameters.length > 0) {
        console.warn('Invalid parameters:', response.InvalidParameters)
      }
    } catch (error) {
      console.error('Failed to get parameters:', error)
      throw error
    }
  }

  return result
}

/**
 * Helper function to get the OpenAI API key
 */
export const getOpenAIApiKey = async (): Promise<string> => {
  const environment = process.env.NODE_ENV || 'dev'
  const parameterName = `/agent-builder/${environment}/openai-api-key`
  return await getParameter(parameterName, true)
}

/**
 * Helper function to get all application secrets
 */
export const getApplicationSecrets = async (): Promise<{
  openaiApiKey: string
}> => {
  const environment = process.env.NODE_ENV || 'dev'
  
  const parameterNames = [
    `/agent-builder/${environment}/openai-api-key`
  ]

  const parameters = await getParameters(parameterNames, true)
  
  return {
    openaiApiKey: parameters[`/agent-builder/${environment}/openai-api-key`] || ''
  }
}

/**
 * Clear the parameter cache (useful for testing)
 */
export const clearCache = (): void => {
  Object.keys(secretCache).forEach(key => delete secretCache[key])
}
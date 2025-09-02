import { createSlice, PayloadAction } from '@reduxjs/toolkit'

export interface SettingsState {
  // Profile settings
  profile: {
    firstName: string
    lastName: string
    email: string
    bio: string
  }
  
  // Appearance settings
  appearance: {
    theme: 'light' | 'dark'
    fontSize: 'small' | 'medium' | 'large'
    layoutDensity: 'comfortable' | 'compact'
  }
  
  // API Keys and integrations
  apiKeys: {
    openai: string
    github: string
    aws: {
      accessKeyId: string
      secretAccessKey: string
      region: string
    }
    stripe: string
    sendgrid: string
  }
  
  // Notification preferences
  notifications: {
    projectUpdates: boolean
    socialActivity: boolean
    systemUpdates: boolean
    emailNotifications: boolean
    pushNotifications: boolean
  }
  
  // Privacy and security
  privacy: {
    publicProfile: boolean
    projectVisibility: boolean
    dataCollection: boolean
    twoFactorAuth: boolean
  }
  
  // Application preferences
  preferences: {
    autoSave: boolean
    codeCompletion: boolean
    defaultTechStack: string
    defaultProjectVisibility: 'public' | 'private'
  }
}

const initialState: SettingsState = {
  profile: {
    firstName: '',
    lastName: '',
    email: '',
    bio: ''
  },
  appearance: {
    theme: 'light',
    fontSize: 'medium',
    layoutDensity: 'comfortable'
  },
  apiKeys: {
    openai: '',
    github: '',
    aws: {
      accessKeyId: '',
      secretAccessKey: '',
      region: 'us-east-1'
    },
    stripe: '',
    sendgrid: ''
  },
  notifications: {
    projectUpdates: true,
    socialActivity: true,
    systemUpdates: true,
    emailNotifications: true,
    pushNotifications: false
  },
  privacy: {
    publicProfile: true,
    projectVisibility: true,
    dataCollection: false,
    twoFactorAuth: false
  },
  preferences: {
    autoSave: true,
    codeCompletion: true,
    defaultTechStack: 'auto',
    defaultProjectVisibility: 'public'
  }
}

const settingsSlice = createSlice({
  name: 'settings',
  initialState,
  reducers: {
    // Profile actions
    updateProfile: (state, action: PayloadAction<Partial<SettingsState['profile']>>) => {
      state.profile = { ...state.profile, ...action.payload }
    },
    
    // Appearance actions
    setTheme: (state, action: PayloadAction<'light' | 'dark'>) => {
      state.appearance.theme = action.payload
    },
    setFontSize: (state, action: PayloadAction<'small' | 'medium' | 'large'>) => {
      state.appearance.fontSize = action.payload
    },
    setLayoutDensity: (state, action: PayloadAction<'comfortable' | 'compact'>) => {
      state.appearance.layoutDensity = action.payload
    },
    updateAppearance: (state, action: PayloadAction<Partial<SettingsState['appearance']>>) => {
      state.appearance = { ...state.appearance, ...action.payload }
    },
    
    // API Keys actions
    updateApiKey: (state, action: PayloadAction<{ key: keyof SettingsState['apiKeys']; value: any }>) => {
      const { key, value } = action.payload
      if (key === 'aws') {
        state.apiKeys.aws = { ...state.apiKeys.aws, ...value }
      } else {
        (state.apiKeys as any)[key] = value
      }
    },
    updateApiKeys: (state, action: PayloadAction<Partial<SettingsState['apiKeys']>>) => {
      state.apiKeys = { ...state.apiKeys, ...action.payload }
    },
    
    // Notifications actions
    toggleNotification: (state, action: PayloadAction<keyof SettingsState['notifications']>) => {
      const key = action.payload
      state.notifications[key] = !state.notifications[key]
    },
    updateNotifications: (state, action: PayloadAction<Partial<SettingsState['notifications']>>) => {
      state.notifications = { ...state.notifications, ...action.payload }
    },
    
    // Privacy actions
    togglePrivacySetting: (state, action: PayloadAction<keyof SettingsState['privacy']>) => {
      const key = action.payload
      state.privacy[key] = !state.privacy[key]
    },
    updatePrivacy: (state, action: PayloadAction<Partial<SettingsState['privacy']>>) => {
      state.privacy = { ...state.privacy, ...action.payload }
    },
    
    // Preferences actions
    updatePreferences: (state, action: PayloadAction<Partial<SettingsState['preferences']>>) => {
      state.preferences = { ...state.preferences, ...action.payload }
    },
    
    // Bulk actions
    loadSettings: (state, action: PayloadAction<Partial<SettingsState>>) => {
      return { ...state, ...action.payload }
    },
    resetSettings: () => initialState,
    
    // Persistence actions
    saveSettingsToStorage: (state) => {
      try {
        localStorage.setItem('labTutorialSettings', JSON.stringify(state))
      } catch (error) {
        console.error('Failed to save settings to localStorage:', error)
      }
    },
    loadSettingsFromStorage: (state) => {
      try {
        const savedSettings = localStorage.getItem('labTutorialSettings')
        if (savedSettings) {
          const parsedSettings = JSON.parse(savedSettings)
          return { ...state, ...parsedSettings }
        }
      } catch (error) {
        console.error('Failed to load settings from localStorage:', error)
      }
      return state
    }
  }
})

export const {
  updateProfile,
  setTheme,
  setFontSize,
  setLayoutDensity,
  updateAppearance,
  updateApiKey,
  updateApiKeys,
  toggleNotification,
  updateNotifications,
  togglePrivacySetting,
  updatePrivacy,
  updatePreferences,
  loadSettings,
  resetSettings,
  saveSettingsToStorage,
  loadSettingsFromStorage
} = settingsSlice.actions

export default settingsSlice.reducer
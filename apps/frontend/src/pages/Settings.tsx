import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { 
  Settings as SettingsIcon, 
  User, 
  Key, 
  Palette, 
  Bell,
  Shield,
  Moon,
  Sun,
  Save
} from 'lucide-react'
import { RootState } from '../store'
import { 
  setTheme, 
  updateProfile, 
  updateApiKeys, 
  toggleNotification, 
  togglePrivacySetting,
  saveSettingsToStorage,
  loadSettingsFromStorage
} from '../store/slices/settingsSlice'

const Settings: React.FC = () => {
  const dispatch = useDispatch()
  const settings = useSelector((state: RootState) => state.settings)

  // Load settings from localStorage on component mount
  useEffect(() => {
    dispatch(loadSettingsFromStorage())
  }, [dispatch])

  const handleThemeToggle = () => {
    const newTheme = settings.appearance.theme === 'light' ? 'dark' : 'light'
    dispatch(setTheme(newTheme))
  }

  const handleProfileChange = (field: string, value: string) => {
    dispatch(updateProfile({ [field]: value }))
  }

  const handleApiKeyChange = (key: string, value: string) => {
    if (key.startsWith('aws.')) {
      const awsField = key.split('.')[1]
      dispatch(updateApiKeys({ 
        aws: { 
          ...settings.apiKeys.aws, 
          [awsField]: value 
        } 
      }))
    } else {
      dispatch(updateApiKeys({ [key]: value }))
    }
  }

  const handleSaveSettings = () => {
    dispatch(saveSettingsToStorage())
    // TODO: Also save to backend API
    console.log('Settings saved to localStorage')
  }

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3 mb-8">
        <div className="p-2 bg-primary/10 rounded-lg">
          <SettingsIcon className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-3xl font-bold">Settings</h1>
          <p className="text-muted-foreground">Manage your account preferences and application settings</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Settings Navigation */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Categories</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="ghost" className="w-full justify-start">
                <User className="h-4 w-4 mr-2" />
                Profile
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Palette className="h-4 w-4 mr-2" />
                Appearance
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Key className="h-4 w-4 mr-2" />
                API Keys
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Bell className="h-4 w-4 mr-2" />
                Notifications
              </Button>
              <Button variant="ghost" className="w-full justify-start">
                <Shield className="h-4 w-4 mr-2" />
                Privacy & Security
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Settings Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Profile Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Profile Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Enter your first name"
                    value={settings.profile.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Enter your last name"
                    value={settings.profile.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email"
                  value={settings.profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us about yourself" 
                  rows={3}
                  value={settings.profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Palette className="h-5 w-5" />
                <span>Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Theme</Label>
                  <p className="text-sm text-muted-foreground">
                    Choose between light and dark themes
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <Sun className="h-4 w-4" />
                  <Switch
                    checked={settings.appearance.theme === 'dark'}
                    onCheckedChange={handleThemeToggle}
                  />
                  <Moon className="h-4 w-4" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Keys Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Key className="h-5 w-5" />
                <span>API Keys & Integrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="openaiKey">OpenAI API Key</Label>
                <Input 
                  id="openaiKey" 
                  type="password" 
                  placeholder="sk-..." 
                  value={settings.apiKeys.openai}
                  onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Used for AI-powered code generation
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="githubToken">GitHub Personal Access Token</Label>
                <Input 
                  id="githubToken" 
                  type="password" 
                  placeholder="ghp_..." 
                  value={settings.apiKeys.github}
                  onChange={(e) => handleApiKeyChange('github', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  For repository creation and deployment
                </p>
              </div>
              <div className="space-y-2">
                <Label htmlFor="awsAccessKey">AWS Access Key ID</Label>
                <Input 
                  id="awsAccessKey" 
                  type="password" 
                  placeholder="AKIA..."
                  value={settings.apiKeys.aws.accessKeyId}
                  onChange={(e) => handleApiKeyChange('aws.accessKeyId', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="awsSecretKey">AWS Secret Access Key</Label>
                <Input 
                  id="awsSecretKey" 
                  type="password" 
                  placeholder="Secret key..."
                  value={settings.apiKeys.aws.secretAccessKey}
                  onChange={(e) => handleApiKeyChange('aws.secretAccessKey', e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="awsRegion">AWS Region</Label>
                <Input 
                  id="awsRegion" 
                  placeholder="us-east-1"
                  value={settings.apiKeys.aws.region}
                  onChange={(e) => handleApiKeyChange('aws.region', e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  For cloud deployment and services
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bell className="h-5 w-5" />
                <span>Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Project Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Get notified when project generation completes
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.projectUpdates}
                  onCheckedChange={() => dispatch(toggleNotification('projectUpdates'))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Social Activity</Label>
                  <p className="text-sm text-muted-foreground">
                    Notifications for likes, comments, and follows
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.socialActivity}
                  onCheckedChange={() => dispatch(toggleNotification('socialActivity'))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>System Updates</Label>
                  <p className="text-sm text-muted-foreground">
                    Important updates and maintenance notifications
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.systemUpdates}
                  onCheckedChange={() => dispatch(toggleNotification('systemUpdates'))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5" />
                <span>Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Public Profile</Label>
                  <p className="text-sm text-muted-foreground">
                    Make your profile visible to other users
                  </p>
                </div>
                <Switch 
                  checked={settings.privacy.publicProfile}
                  onCheckedChange={() => dispatch(togglePrivacySetting('publicProfile'))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Project Visibility</Label>
                  <p className="text-sm text-muted-foreground">
                    Show your projects in the public feed
                  </p>
                </div>
                <Switch 
                  checked={settings.privacy.projectVisibility}
                  onCheckedChange={() => dispatch(togglePrivacySetting('projectVisibility'))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Data Collection</Label>
                  <p className="text-sm text-muted-foreground">
                    Allow usage data collection for service improvement
                  </p>
                </div>
                <Switch 
                  checked={settings.privacy.dataCollection}
                  onCheckedChange={() => dispatch(togglePrivacySetting('dataCollection'))}
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button onClick={handleSaveSettings} className="flex items-center space-x-2">
              <Save className="h-4 w-4" />
              <span>Save Settings</span>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
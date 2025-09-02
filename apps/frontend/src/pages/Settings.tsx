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
    dispatch(updateApiKeys({ [key]: value }))
  }

  const handleSaveSettings = () => {
    dispatch(saveSettingsToStorage())
    // TODO: Also save to backend API
    console.log('Settings saved to localStorage')
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 right-20 w-72 h-72 bg-gradient-to-br from-blue-400/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-64 h-64 bg-gradient-to-br from-green-400/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
              <SettingsIcon className="h-8 w-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
              Settings
            </h1>
          </div>
          <p className="text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto">
            Manage your account preferences and application settings with enterprise-grade security
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Settings Navigation */}
          <div className="lg:col-span-1">
            <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80 sticky top-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">Categories</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="default" className="w-full justify-start bg-gradient-to-r from-blue-600 to-purple-600 text-white hover:from-blue-700 hover:to-purple-700">
                  <User className="h-4 w-4 mr-3" />
                  Profile
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Palette className="h-4 w-4 mr-3" />
                  Appearance
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Key className="h-4 w-4 mr-3" />
                  API Keys
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Bell className="h-4 w-4 mr-3" />
                  Notifications
                </Button>
                <Button variant="ghost" className="w-full justify-start hover:bg-slate-100 dark:hover:bg-slate-700">
                  <Shield className="h-4 w-4 mr-3" />
                  Privacy & Security
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Settings Content */}
          <div className="lg:col-span-3 space-y-8">
          {/* Profile Settings */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                  <User className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-slate-800 dark:text-slate-200">Profile Settings</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <Label htmlFor="firstName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">First Name</Label>
                  <Input 
                    id="firstName" 
                    placeholder="Enter your first name"
                    value={settings.profile.firstName}
                    onChange={(e) => handleProfileChange('firstName', e.target.value)}
                    className="bg-white/50 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
                <div className="space-y-3">
                  <Label htmlFor="lastName" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Last Name</Label>
                  <Input 
                    id="lastName" 
                    placeholder="Enter your last name"
                    value={settings.profile.lastName}
                    onChange={(e) => handleProfileChange('lastName', e.target.value)}
                    className="bg-white/50 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>
              </div>
              <div className="space-y-3">
                <Label htmlFor="email" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Email Address</Label>
                <Input 
                  id="email" 
                  type="email" 
                  placeholder="Enter your email"
                  value={settings.profile.email}
                  onChange={(e) => handleProfileChange('email', e.target.value)}
                  className="bg-white/50 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20"
                />
              </div>
              <div className="space-y-3">
                <Label htmlFor="bio" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Bio</Label>
                <Textarea 
                  id="bio" 
                  placeholder="Tell us about yourself" 
                  rows={3}
                  value={settings.profile.bio}
                  onChange={(e) => handleProfileChange('bio', e.target.value)}
                  className="bg-white/50 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 resize-none"
                />
              </div>
            </CardContent>
          </Card>

          {/* Appearance Settings */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                  <Palette className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-slate-800 dark:text-slate-200">Appearance</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-50 to-blue-50 dark:from-slate-800 dark:to-slate-700 rounded-xl">
                <div className="space-y-1">
                  <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">Theme Preference</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Choose between light and dark themes for optimal viewing
                  </p>
                </div>
                <div className="flex items-center space-x-3 bg-white dark:bg-slate-800 rounded-lg p-2 border border-slate-200 dark:border-slate-600">
                  <Sun className="h-4 w-4 text-yellow-500" />
                  <Switch
                    checked={settings.appearance.theme === 'dark'}
                    onCheckedChange={handleThemeToggle}
                    className="data-[state=checked]:bg-blue-600"
                  />
                  <Moon className="h-4 w-4 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* API Keys Settings */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-green-500 to-teal-600 rounded-lg">
                  <Key className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-slate-800 dark:text-slate-200">API Keys & Integrations</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-3">
                <Label htmlFor="openaiKey" className="text-sm font-semibold text-slate-700 dark:text-slate-300">OpenAI API Key</Label>
                <Input 
                  id="openaiKey" 
                  type="password" 
                  placeholder="sk-..." 
                  value={settings.apiKeys.openai}
                  onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                  className="bg-white/50 border-slate-300 focus:border-green-500 focus:ring-green-500/20 font-mono"
                />
                <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center space-x-1">
                  <span>🤖</span>
                  <span>Used for AI-powered code generation and assistance</span>
                </p>
              </div>
              <div className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-950/50 dark:to-green-950/50 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
                <p className="text-sm text-blue-800 dark:text-blue-200 flex items-start space-x-2">
                  <span className="text-lg">🔒</span>
                  <span>
                    <strong>Enterprise Security:</strong> Your API keys are encrypted end-to-end and never shared. 
                    AWS and other cloud credentials are managed separately by your system administrator for maximum security.
                  </span>
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Notification Settings */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                  <Bell className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-slate-800 dark:text-slate-200">Notifications</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-orange-50 to-yellow-50 dark:from-orange-950/50 dark:to-yellow-950/50 rounded-xl">
                <div className="space-y-1">
                  <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">Project Updates</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Get notified when project generation completes
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.projectUpdates}
                  onCheckedChange={() => dispatch(toggleNotification('projectUpdates'))}
                  className="data-[state=checked]:bg-orange-600"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-xl">
                <div className="space-y-1">
                  <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">Social Activity</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Notifications for likes, comments, and follows
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.socialActivity}
                  onCheckedChange={() => dispatch(toggleNotification('socialActivity'))}
                  className="data-[state=checked]:bg-purple-600"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 rounded-xl">
                <div className="space-y-1">
                  <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">System Updates</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Important updates and maintenance notifications
                  </p>
                </div>
                <Switch 
                  checked={settings.notifications.systemUpdates}
                  onCheckedChange={() => dispatch(toggleNotification('systemUpdates'))}
                  className="data-[state=checked]:bg-blue-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
            <CardHeader className="border-b border-slate-200 dark:border-slate-700">
              <CardTitle className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                  <Shield className="h-5 w-5 text-white" />
                </div>
                <span className="text-xl font-semibold text-slate-800 dark:text-slate-200">Privacy & Security</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-xl">
                <div className="space-y-1">
                  <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">Public Profile</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Make your profile visible to other users
                  </p>
                </div>
                <Switch 
                  checked={settings.privacy.publicProfile}
                  onCheckedChange={() => dispatch(togglePrivacySetting('publicProfile'))}
                  className="data-[state=checked]:bg-green-600"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-teal-50 to-cyan-50 dark:from-teal-950/50 dark:to-cyan-950/50 rounded-xl">
                <div className="space-y-1">
                  <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">Project Visibility</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Show your projects in the public feed
                  </p>
                </div>
                <Switch 
                  checked={settings.privacy.projectVisibility}
                  onCheckedChange={() => dispatch(togglePrivacySetting('projectVisibility'))}
                  className="data-[state=checked]:bg-teal-600"
                />
              </div>
              <div className="flex items-center justify-between p-4 bg-gradient-to-r from-violet-50 to-purple-50 dark:from-violet-950/50 dark:to-purple-950/50 rounded-xl">
                <div className="space-y-1">
                  <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">Data Collection</Label>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Allow usage data collection for service improvement
                  </p>
                </div>
                <Switch 
                  checked={settings.privacy.dataCollection}
                  onCheckedChange={() => dispatch(togglePrivacySetting('dataCollection'))}
                  className="data-[state=checked]:bg-violet-600"
                />
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-center">
            <Button 
              onClick={handleSaveSettings} 
              className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105"
            >
              <Save className="h-5 w-5 mr-2" />
              <span>Save All Settings</span>
            </Button>
          </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
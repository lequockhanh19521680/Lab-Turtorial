import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/features/shared/components/ui/tabs'
import { 
  Settings as SettingsIcon, 
  User, 
  Key, 
  Palette, 
  Bell,
  Shield,
  Moon,
  Sun,
  Save,
  Monitor
} from 'lucide-react'
import { RootState } from '../store'
import { 
  setTheme, 
  updateProfile, 
  updateApiKeys, 
  toggleNotification, 
  togglePrivacySetting,
  saveSettingsToStorage,
  loadSettingsFromStorage,
  updateAppearance
} from '../store/slices/settingsSlice'

const Settings: React.FC = () => {
  const dispatch = useDispatch()
  const settings = useSelector((state: RootState) => state.settings)
  const [activeTab, setActiveTab] = useState('profile')

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

        {/* Settings Tabs */}
        <Card className="border-0 shadow-xl bg-white/80 backdrop-blur-sm dark:bg-slate-800/80">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-5 p-1 bg-slate-100 dark:bg-slate-700 rounded-lg">
              <TabsTrigger 
                value="profile" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-600"
              >
                <User className="h-4 w-4" />
                <span className="hidden sm:inline">Profile</span>
              </TabsTrigger>
              <TabsTrigger 
                value="appearance" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-600"
              >
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Appearance</span>
              </TabsTrigger>
              <TabsTrigger 
                value="api-keys" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-600"
              >
                <Key className="h-4 w-4" />
                <span className="hidden sm:inline">API Keys</span>
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-600"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
              </TabsTrigger>
              <TabsTrigger 
                value="privacy" 
                className="flex items-center space-x-2 data-[state=active]:bg-white data-[state=active]:shadow-sm dark:data-[state=active]:bg-slate-600"
              >
                <Shield className="h-4 w-4" />
                <span className="hidden sm:inline">Privacy</span>
              </TabsTrigger>
            </TabsList>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6 p-6">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-0">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                    <User className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-slate-800 dark:text-slate-200">Profile Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-0">
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
                    value={settings.profile.bio}
                    onChange={(e) => handleProfileChange('bio', e.target.value)}
                    className="bg-white/50 border-slate-300 focus:border-blue-500 focus:ring-blue-500/20 min-h-[100px]"
                  />
                </div>
                <Button 
                  onClick={handleSaveSettings} 
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Save Profile
                </Button>
              </CardContent>
            </TabsContent>

            {/* Appearance Tab */}
            <TabsContent value="appearance" className="space-y-6 p-6">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-0">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg">
                    <Palette className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-slate-800 dark:text-slate-200">Appearance Settings</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 dark:from-purple-950/50 dark:to-pink-950/50 rounded-xl">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">Theme</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Choose between light and dark mode
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button 
                        variant={settings.appearance.theme === 'light' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => dispatch(setTheme('light'))}
                        className="flex items-center space-x-1"
                      >
                        <Sun className="h-4 w-4" />
                        <span>Light</span>
                      </Button>
                      <Button 
                        variant={settings.appearance.theme === 'dark' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => dispatch(setTheme('dark'))}
                        className="flex items-center space-x-1"
                      >
                        <Moon className="h-4 w-4" />
                        <span>Dark</span>
                      </Button>
                      <Button 
                        variant={settings.appearance.theme === 'system' ? 'default' : 'outline'} 
                        size="sm"
                        onClick={() => dispatch(updateAppearance({ theme: 'light' }))}
                        className="flex items-center space-x-1"
                      >
                        <Monitor className="h-4 w-4" />
                        <span>Auto</span>
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-cyan-50 dark:from-blue-950/50 dark:to-cyan-950/50 rounded-xl">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">Animations</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Enable smooth animations and transitions
                      </p>
                    </div>
                    <Switch 
                      checked={settings.appearance.animations}
                      onCheckedChange={(checked) => dispatch(updateProfile({ animations: checked }))}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            {/* API Keys Tab */}
            <TabsContent value="api-keys" className="space-y-6 p-6">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-0">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
                    <Key className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-slate-800 dark:text-slate-200">API Keys</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-0">
                <div className="space-y-4">
                  <div className="space-y-3">
                    <Label htmlFor="openaiKey" className="text-sm font-semibold text-slate-700 dark:text-slate-300">OpenAI API Key</Label>
                    <Input 
                      id="openaiKey" 
                      type="password"
                      placeholder="Enter your OpenAI API key"
                      value={settings.apiKeys.openai}
                      onChange={(e) => handleApiKeyChange('openai', e.target.value)}
                      className="bg-white/50 border-slate-300 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="anthropicKey" className="text-sm font-semibold text-slate-700 dark:text-slate-300">Anthropic API Key</Label>
                    <Input 
                      id="anthropicKey" 
                      type="password"
                      placeholder="Enter your Anthropic API key"
                      value={settings.apiKeys.anthropic}
                      onChange={(e) => handleApiKeyChange('anthropic', e.target.value)}
                      className="bg-white/50 border-slate-300 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>
                  <div className="space-y-3">
                    <Label htmlFor="awsKey" className="text-sm font-semibold text-slate-700 dark:text-slate-300">AWS Access Key</Label>
                    <Input 
                      id="awsKey" 
                      type="password"
                      placeholder="Enter your AWS access key"
                      value={settings.apiKeys.aws}
                      onChange={(e) => handleApiKeyChange('aws', e.target.value)}
                      className="bg-white/50 border-slate-300 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>
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
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6 p-6">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-0">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg">
                    <Bell className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-slate-800 dark:text-slate-200">Notifications</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-0">
                <div className="space-y-4">
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
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/50 dark:to-emerald-950/50 rounded-xl">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">Email Notifications</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Receive notifications via email
                      </p>
                    </div>
                    <Switch 
                      checked={settings.notifications.emailNotifications}
                      onCheckedChange={() => dispatch(toggleNotification('emailNotifications'))}
                      className="data-[state=checked]:bg-green-600"
                    />
                  </div>
                </div>
              </CardContent>
            </TabsContent>

            {/* Privacy & Security Tab */}
            <TabsContent value="privacy" className="space-y-6 p-6">
              <CardHeader className="border-b border-slate-200 dark:border-slate-700 px-0">
                <CardTitle className="flex items-center space-x-3">
                  <div className="p-2 bg-gradient-to-br from-red-500 to-pink-600 rounded-lg">
                    <Shield className="h-5 w-5 text-white" />
                  </div>
                  <span className="text-xl font-semibold text-slate-800 dark:text-slate-200">Privacy & Security</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-0">
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-red-50 to-pink-50 dark:from-red-950/50 dark:to-pink-950/50 rounded-xl">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">Profile Visibility</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Make your profile visible to other users
                      </p>
                    </div>
                    <Switch 
                      checked={settings.privacy.profileVisibility}
                      onCheckedChange={() => dispatch(togglePrivacySetting('profileVisibility'))}
                      className="data-[state=checked]:bg-red-600"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/50 dark:to-indigo-950/50 rounded-xl">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">Data Analytics</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Allow anonymous usage analytics
                      </p>
                    </div>
                    <Switch 
                      checked={settings.privacy.dataAnalytics}
                      onCheckedChange={() => dispatch(togglePrivacySetting('dataAnalytics'))}
                      className="data-[state=checked]:bg-purple-600"
                    />
                  </div>
                  <div className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-slate-50 dark:from-blue-950/50 dark:to-slate-950/50 rounded-xl">
                    <div className="space-y-1">
                      <Label className="text-base font-semibold text-slate-800 dark:text-slate-200">Two-Factor Authentication</Label>
                      <p className="text-sm text-slate-600 dark:text-slate-400">
                        Enable 2FA for enhanced security
                      </p>
                    </div>
                    <Switch 
                      checked={settings.privacy.twoFactorAuth}
                      onCheckedChange={() => dispatch(togglePrivacySetting('twoFactorAuth'))}
                      className="data-[state=checked]:bg-blue-600"
                    />
                  </div>
                </div>
                <div className="bg-gradient-to-r from-yellow-50 to-orange-50 dark:from-yellow-950/50 dark:to-orange-950/50 p-4 rounded-xl border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm text-yellow-800 dark:text-yellow-200 flex items-start space-x-2">
                    <span className="text-lg">⚠️</span>
                    <span>
                      <strong>Security Notice:</strong> Enabling two-factor authentication significantly improves your account security. 
                      We recommend keeping it enabled at all times.
                    </span>
                  </p>
                </div>
              </CardContent>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}

export default Settings
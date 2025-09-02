import React, { useEffect, useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import { RootState } from '../../../store'
import { toggleSidebar } from '../../../store/slices/uiSlice'
import { authService } from '../../../services/auth'
import { 
  Menu, 
  X, 
  Plus, 
  Settings, 
  User, 
  Zap,
  LogOut,
  Moon,
  Sun,
  Monitor,
  ChevronDown,
  FolderOpen,
  Search,
  Users,
  MessageSquare,
  Home
} from 'lucide-react'
import { Button } from './ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu'
import NotificationCenter, { mockNotifications } from './ui/notification-center'
import { useTheme } from '@/hooks/use-theme'
import FloatingSocialButton from '../../../components/FloatingSocialButton'

interface LayoutProps {
  children: React.ReactNode
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { setTheme } = useTheme()
  const { sidebarOpen } = useSelector((state: RootState) => state.ui)
  const [currentUser, setCurrentUser] = useState<any>(null)

  useEffect(() => {
    const loadCurrentUser = async () => {
      try {
        const user = await authService.getCurrentUser()
        setCurrentUser(user)
      } catch (error) {
        console.error('Error loading current user:', error)
      }
    }

    loadCurrentUser()
  }, [])

  const navigation = [
    { name: 'Social Feed', href: '/', icon: Users },
    { name: 'Create Project', href: '/create', icon: Plus },
    { name: 'Projects', href: '/projects', icon: FolderOpen },
  ]

  const isActivePath = (path: string) => {
    return location.pathname === path
  }

  const getPageTitle = () => {
    if (location.pathname === '/') return 'Social Feed'
    if (location.pathname === '/dashboard') return 'Dashboard'
    if (location.pathname === '/create') return 'Create New Project'
    if (location.pathname === '/projects') return 'Projects'
    if (location.pathname === '/profile') return 'Profile'
    if (location.pathname === '/settings') return 'Settings'
    if (location.pathname === '/feedback') return 'Feedback'
    if (location.pathname.startsWith('/project')) return 'Project Details'
    return 'Agent Builder'
  }

  const handleLogout = async () => {
    await authService.signOut()
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <div className={`fixed inset-y-0 left-0 z-50 w-64 bg-card shadow-lg transform transition-transform duration-300 ease-in-out ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 lg:static lg:inset-0 lg:flex lg:flex-col`}>
        <div className="flex items-center justify-between h-16 px-6 border-b border-border">
          <div className="flex items-center space-x-2">
            <Zap className="h-8 w-8 text-primary" />
            <span className="text-xl font-bold text-card-foreground">Agent Builder</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => dispatch(toggleSidebar())}
            className="lg:hidden"
          >
            <X className="h-6 w-6" />
          </Button>
        </div>
        
        <nav className="mt-6 px-6 flex-1">
          <ul className="space-y-2">
            {navigation.map((item) => {
              const Icon = item.icon
              const isActive = isActivePath(item.href)
              
              return (
                <li key={item.name}>
                  <Link
                    to={item.href}
                    className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-primary/10 text-primary border-r-2 border-primary'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span>{item.name}</span>
                  </Link>
                </li>
              )
            })}
          </ul>
        </nav>
        
        {/* Feedback link at bottom */}
        <div className="px-6 py-4 border-t border-border">
          <Link
            to="/feedback"
            className={`flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
              isActivePath('/feedback')
                ? 'bg-primary/10 text-primary border-r-2 border-primary'
                : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
            }`}
          >
            <MessageSquare className="h-5 w-5" />
            <span>Feedback</span>
          </Link>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col lg:ml-0">
        {/* Top bar */}
        <header className="bg-card shadow-sm border-b border-border">
          <div className="flex items-center justify-between h-16 px-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => dispatch(toggleSidebar())}
                className="lg:hidden"
              >
                <Menu className="h-6 w-6" />
              </Button>
              <div>
                <h1 className="text-xl font-semibold text-card-foreground">
                  {getPageTitle()}
                </h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <NotificationCenter 
                notifications={mockNotifications}
                onNotificationRead={(id) => console.log('Read notification:', id)}
                onNotificationDismiss={(id) => console.log('Dismissed notification:', id)}
                onMarkAllRead={() => console.log('Mark all read')}
                onNotificationAction={(notification) => console.log('Action clicked:', notification)}
              />
              
              {/* Search functionality */}
              <div className="hidden md:flex relative">
                <input
                  type="text"
                  placeholder="Search projects..."
                  className="pl-4 pr-10 py-2 w-64 text-sm border border-border rounded-lg bg-background/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                />
                <Search className="absolute right-3 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
              
              {/* User dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <User className="h-5 w-5" />
                    <span className="hidden md:inline">
                      {currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || currentUser.email : 'User'}
                    </span>
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {currentUser ? `${currentUser.firstName || ''} ${currentUser.lastName || ''}`.trim() || 'User' : 'User'}
                      </p>
                      <p className="text-xs leading-none text-gray-500">
                        {currentUser?.email || 'user@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* User menu options */}
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    <User className="h-4 w-4 mr-2" />
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    <Home className="h-4 w-4 mr-2" />
                    Dashboard
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  
                  {/* Theme selector */}
                  <DropdownMenuLabel className="text-xs text-gray-500 uppercase tracking-wide">
                    Theme
                  </DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setTheme('light')}>
                    <Sun className="h-4 w-4 mr-2" />
                    Light
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('dark')}>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setTheme('system')}>
                    <Monitor className="h-4 w-4 mr-2" />
                    System
                  </DropdownMenuItem>
                  
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto">
          <div className="p-6">
            {children}
          </div>
        </main>
      </div>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-gray-600 bg-opacity-75 lg:hidden"
          onClick={() => dispatch(toggleSidebar())}
        />
      )}

      {/* Floating Social Button */}
      <FloatingSocialButton />
    </div>
  )
}

export default Layout
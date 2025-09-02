import { Routes, Route } from 'react-router-dom'
import Layout from './features/shared/components/Layout'
import ProtectedRoute from './features/shared/components/ProtectedRoute'
import Dashboard from './pages/Dashboard'
import Projects from './pages/Projects'
import SocialFeed from './pages/SocialFeed'
import Profile from './pages/Profile'
import ProjectDetail from './pages/ProjectDetail'
import CreateProject from './pages/CreateProject'
import Login from './pages/Login'
import Register from './pages/Register'
import AuthCallback from './pages/AuthCallback'
import { Toaster } from './features/shared/components/ui/toaster'

function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        
        {/* Protected routes */}
        <Route path="/" element={
          <ProtectedRoute>
            <Layout>
              <Dashboard />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/projects" element={
          <ProtectedRoute>
            <Layout>
              <Projects />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/feed" element={
          <ProtectedRoute>
            <Layout>
              <SocialFeed />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/profile" element={
          <ProtectedRoute>
            <Layout>
              <Profile />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <Layout>
              <CreateProject />
            </Layout>
          </ProtectedRoute>
        } />
        <Route path="/project/:id" element={
          <ProtectedRoute>
            <Layout>
              <ProjectDetail />
            </Layout>
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
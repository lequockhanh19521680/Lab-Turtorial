import React from 'react'
import { useParams } from 'react-router-dom'
import RealTimeProjectDashboard from '../features/dashboard/components/RealTimeProjectDashboard'
import RealTimeNotificationsPanel, { useRealTimeNotifications } from '../features/dashboard/components/RealTimeNotificationsPanel'

const EnhancedDashboard: React.FC = () => {
  const { projectId } = useParams<{ projectId?: string }>()
  const {
    notifications,
    markAsRead,
    dismissNotification,
    markAllAsRead
  } = useRealTimeNotifications()

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Dashboard - Takes 2/3 of the space */}
          <div className="lg:col-span-2">
            <RealTimeProjectDashboard projectId={projectId} />
          </div>
          
          {/* Notifications Panel - Takes 1/3 of the space */}
          <div className="lg:col-span-1">
            <RealTimeNotificationsPanel 
              notifications={notifications}
              onNotificationRead={markAsRead}
              onNotificationDismiss={dismissNotification}
              onMarkAllRead={markAllAsRead}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedDashboard
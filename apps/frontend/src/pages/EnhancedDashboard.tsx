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
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      <div className="container mx-auto p-6">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Main Dashboard - Takes 3/4 of the space on large screens */}
          <div className="xl:col-span-3">
            <RealTimeProjectDashboard projectId={projectId} />
          </div>
          
          {/* Notifications Panel - Takes 1/4 of the space, smaller and more focused */}
          <div className="xl:col-span-1">
            <div className="sticky top-6">
              <RealTimeNotificationsPanel 
                notifications={notifications}
                onNotificationRead={markAsRead}
                onNotificationDismiss={dismissNotification}
                onMarkAllRead={markAllAsRead}
                className="max-h-[80vh]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default EnhancedDashboard
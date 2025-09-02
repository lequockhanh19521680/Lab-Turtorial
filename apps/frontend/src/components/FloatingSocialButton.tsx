import React, { useState, useEffect } from 'react'
import { Users, MessageCircle, Heart } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import FloatingSocialFeed from './FloatingSocialFeed'

const FloatingSocialButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(3)
  const [isAnimating, setIsAnimating] = useState(false)

  // Simulate notification updates
  useEffect(() => {
    const interval = setInterval(() => {
      if (Math.random() > 0.8) { // 20% chance to get a new notification
        setNotificationCount(prev => prev + 1)
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 1000)
      }
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  const handleClick = () => {
    setIsOpen(true)
    setNotificationCount(0) // Clear notifications when opened
  }

  return (
    <>
      {/* Floating Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <div className="relative">
          {/* Notification Badge */}
          {notificationCount > 0 && (
            <Badge 
              className={`absolute -top-2 -right-2 bg-red-500 text-white border-2 border-white min-w-[20px] h-5 text-xs flex items-center justify-center rounded-full z-10 ${
                isAnimating ? 'animate-pulse scale-125' : ''
              } transition-transform duration-300`}
            >
              {notificationCount > 99 ? '99+' : notificationCount}
            </Badge>
          )}
          
          {/* Main Button */}
          <Button
            onClick={handleClick}
            className={`
              w-14 h-14 rounded-full shadow-lg
              bg-gradient-to-r from-blue-600 to-purple-600 
              hover:from-blue-700 hover:to-purple-700
              text-white border-0
              transition-all duration-300 ease-in-out
              hover:scale-110 hover:shadow-xl
              group
              ${isAnimating ? 'animate-bounce' : ''}
            `}
          >
            <div className="relative">
              <Users className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              
              {/* Pulse animation for new activity */}
              {notificationCount > 0 && (
                <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping" />
              )}
            </div>
          </Button>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
              Social Feed
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>

        {/* Activity Indicators (floating mini icons) */}
        {notificationCount > 0 && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute -top-1 -left-1 animate-float-1">
              <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg">
                <Heart className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-1 -left-2 animate-float-2">
              <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center shadow-lg">
                <MessageCircle className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Social Feed Modal */}
      <FloatingSocialFeed isOpen={isOpen} onClose={() => setIsOpen(false)} />

      {/* Custom CSS for animations */}
      <style jsx>{`
        @keyframes float-1 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-10px) rotate(5deg); }
        }
        @keyframes float-2 {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-8px) rotate(-5deg); }
        }
        .animate-float-1 {
          animation: float-1 3s ease-in-out infinite;
        }
        .animate-float-2 {
          animation: float-2 2.5s ease-in-out infinite 0.5s;
        }
      `}</style>
    </>
  )
}

export default FloatingSocialButton
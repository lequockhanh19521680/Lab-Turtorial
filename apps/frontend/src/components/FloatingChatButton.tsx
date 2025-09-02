import React, { useState, useEffect } from 'react'
import { Bot, Sparkles, Zap } from 'lucide-react'
import { Button } from './ui/button'
import { Badge } from './ui/badge'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/features/shared/components/ui/dialog'
import AIChatInterface from './AIChatInterface'

const FloatingChatButton: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [isAnimating, setIsAnimating] = useState(false)
  const [isNewUser, setIsNewUser] = useState(true)

  // Simulate AI assistance availability
  useEffect(() => {
    // Check if user is new (for demo purposes)
    const hasUsedChat = localStorage.getItem('hasUsedAIChat')
    if (!hasUsedChat) {
      setNotificationCount(1)
      setIsNewUser(true)
    }
  }, [])

  // Add a pulse animation for new users
  useEffect(() => {
    if (isNewUser && notificationCount > 0) {
      const interval = setInterval(() => {
        setIsAnimating(true)
        setTimeout(() => setIsAnimating(false), 1000)
      }, 3000)

      return () => clearInterval(interval)
    }
  }, [isNewUser, notificationCount])

  const handleClick = () => {
    setIsOpen(true)
    setNotificationCount(0)
    
    // Mark that user has used the chat
    localStorage.setItem('hasUsedAIChat', 'true')
    setIsNewUser(false)
  }

  const handleSendMessage = (message: string) => {
    // This could be connected to an actual AI service
    console.log('AI Chat message:', message)
    // You can integrate with OpenAI API or other AI services here
  }

  return (
    <>
      {/* Floating Chat Button */}
      <div className="fixed bottom-20 right-6 z-40">
        <div className="relative">
          {/* Notification Badge */}
          {notificationCount > 0 && (
            <Badge 
              className={`absolute -top-2 -right-2 bg-green-500 text-white border-2 border-white min-w-[20px] h-5 text-xs flex items-center justify-center rounded-full z-10 ${
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
              bg-gradient-to-r from-green-600 to-emerald-600 
              hover:from-green-700 hover:to-emerald-700
              text-white border-0
              transition-all duration-300 ease-in-out
              hover:scale-110 hover:shadow-xl
              group
              ${isAnimating ? 'animate-bounce' : ''}
            `}
          >
            <div className="relative">
              <Bot className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
              
              {/* Pulse animation for new users */}
              {notificationCount > 0 && (
                <div className="absolute inset-0 rounded-full bg-white opacity-30 animate-ping" />
              )}
            </div>
          </Button>

          {/* Tooltip */}
          <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
            <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap">
              AI Assistant
              <div className="absolute top-full right-4 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
            </div>
          </div>
        </div>

        {/* Activity Indicators (floating mini icons) */}
        {notificationCount > 0 && (
          <div className="absolute top-0 left-0 w-full h-full pointer-events-none">
            <div className="absolute -top-1 -left-1 animate-float">
              <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="h-3 w-3 text-white" />
              </div>
            </div>
            <div className="absolute -bottom-1 -left-2 animate-pulse">
              <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shadow-lg">
                <Zap className="h-2.5 w-2.5 text-white" />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Chat Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl h-[80vh] p-0">
          <DialogHeader className="px-6 py-4 border-b">
            <DialogTitle className="flex items-center space-x-2">
              <Bot className="h-5 w-5 text-green-600" />
              <span>AI Assistant</span>
            </DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-hidden">
            <AIChatInterface 
              onSendMessage={handleSendMessage}
              placeholder="Ask me anything about your project or development..."
              className="h-full border-0"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

export default FloatingChatButton
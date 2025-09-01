import React, { useState } from 'react'
import { MessageSquare, Send } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'

interface FeedbackModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (feedback: string) => void
  isLoading?: boolean
  stepTitle?: string
  agentName?: string
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({
  open,
  onOpenChange,
  onSubmit,
  isLoading = false,
  stepTitle = "Current Step",
  agentName = "AI Agent"
}) => {
  const [feedback, setFeedback] = useState('')

  const handleSubmit = () => {
    if (feedback.trim()) {
      onSubmit(feedback.trim())
      setFeedback('')
    }
  }

  const handleClose = () => {
    setFeedback('')
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <MessageSquare className="h-5 w-5 text-primary-600" />
            <span>Request Changes</span>
          </DialogTitle>
          <DialogDescription>
            Provide feedback to {agentName} about "{stepTitle}". Be specific about what needs to be changed or improved.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="feedback">Your Feedback</Label>
            <Textarea
              id="feedback"
              placeholder="Please be specific about what changes you'd like to see. For example:
              
• Change the color scheme to use blue instead of green
• Add a search functionality to the header
• Modify the layout to be more mobile-friendly
• Update the text content for better clarity"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="min-h-[120px]"
            />
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <h4 className="text-sm font-medium text-blue-900 mb-1">💡 Tips for effective feedback:</h4>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• Be specific about what you want changed</li>
              <li>• Provide examples or references when possible</li>
              <li>• Explain the reasoning behind your request</li>
              <li>• Consider user experience and functionality</li>
            </ul>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit} 
            disabled={!feedback.trim() || isLoading}
            className="bg-primary-600 hover:bg-primary-700"
          >
            {isLoading ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
            ) : (
              <Send className="h-4 w-4 mr-2" />
            )}
            Send Feedback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default FeedbackModal
import React, { useState, useRef, useEffect } from 'react'
import { Send, Bot, User, Code, Copy, Check, Sparkles, Mic, MicOff } from 'lucide-react'
import { Button } from '@/features/shared/components/ui/button'
import { Card } from '@/features/shared/components/ui/card'
import { Badge } from '@/features/shared/components/ui/badge'
// TODO: Replace with a more secure syntax highlighting solution

interface Message {
  id: string
  type: 'user' | 'assistant'
  content: string
  timestamp: Date
  isTyping?: boolean
  codeBlocks?: Array<{
    language: string
    code: string
  }>
}

interface AIChatInterfaceProps {
  className?: string
  onSendMessage?: (message: string) => void
  placeholder?: string
}

const AIChatInterface: React.FC<AIChatInterfaceProps> = ({
  className = '',
  onSendMessage,
  placeholder = "Describe your project idea..."
}) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      type: 'assistant',
      content: "Hello! I'm your AI agent assistant. I can help you create amazing applications by understanding your requirements and generating code. What would you like to build today?",
      timestamp: new Date(),
    }
  ])
  const [currentMessage, setCurrentMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    // TODO: Re-implement syntax highlighting with a secure library
    // Prism.highlightAll()
  }, [messages])

  const handleSend = async () => {
    if (!currentMessage.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      type: 'user',
      content: currentMessage,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setCurrentMessage('')
    setIsTyping(true)

    if (onSendMessage) {
      onSendMessage(currentMessage)
    }

    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: 'assistant',
        content: "I understand you want to build that! Let me create a comprehensive solution for you. Here's what I'll generate:",
        timestamp: new Date(),
        codeBlocks: [
          {
            language: 'typescript',
            code: `// React Component Example
import React, { useState } from 'react'
import { Button } from '@/components/ui/button'

const MyComponent: React.FC = () => {
  const [count, setCount] = useState(0)
  
  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Counter: {count}</h2>
      <Button onClick={() => setCount(count + 1)}>
        Increment
      </Button>
    </div>
  )
}

export default MyComponent`
          }
        ]
      }

      setMessages(prev => [...prev, aiResponse])
      setIsTyping(false)
    }, 2000)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const copyCode = async (code: string, blockId: string) => {
    try {
      await navigator.clipboard.writeText(code)
      setCopiedCode(blockId)
      setTimeout(() => setCopiedCode(null), 2000)
    } catch (err) {
      console.error('Failed to copy code:', err)
    }
  }

  const startVoiceInput = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition
      const recognition = new SpeechRecognition()
      
      recognition.continuous = false
      recognition.interimResults = false
      recognition.lang = 'en-US'

      recognition.onstart = () => {
        setIsListening(true)
      }

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript
        setCurrentMessage(prev => prev + transcript)
        setIsListening(false)
      }

      recognition.onerror = () => {
        setIsListening(false)
      }

      recognition.onend = () => {
        setIsListening(false)
      }

      recognition.start()
    }
  }

  const renderCodeBlock = (codeBlock: { language: string; code: string }, messageId: string, index: number) => {
    const blockId = `${messageId}-${index}`
    
    return (
      <div key={index} className="my-4 rounded-lg border border-border overflow-hidden">
        <div className="flex items-center justify-between bg-muted px-4 py-2 border-b border-border">
          <div className="flex items-center space-x-2">
            <Code className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium capitalize">{codeBlock.language}</span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => copyCode(codeBlock.code, blockId)}
            className="h-8 px-2"
          >
            {copiedCode === blockId ? (
              <Check className="h-4 w-4 text-green-500" />
            ) : (
              <Copy className="h-4 w-4" />
            )}
          </Button>
        </div>
        <div className="p-4 bg-slate-950 overflow-x-auto">
          <pre className="text-sm">
            <code className={`language-${codeBlock.language}`}>
              {codeBlock.code}
            </code>
          </pre>
        </div>
      </div>
    )
  }

  return (
    <Card className={`flex flex-col h-[600px] ${className}`}>
      {/* Chat Header */}
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/5 to-purple-500/5">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-white" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">AI Agent Assistant</h3>
            <p className="text-sm text-muted-foreground">Ready to help you build</p>
          </div>
        </div>
        <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
          Online
        </Badge>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex items-start space-x-3 max-w-[80%] ${message.type === 'user' ? 'flex-row-reverse space-x-reverse' : ''}`}>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                message.type === 'user' 
                  ? 'bg-primary text-primary-foreground' 
                  : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
              }`}>
                {message.type === 'user' ? (
                  <User className="h-4 w-4" />
                ) : (
                  <Bot className="h-4 w-4" />
                )}
              </div>
              
              <div className={`rounded-2xl px-4 py-3 ${
                message.type === 'user'
                  ? 'bg-primary text-primary-foreground ml-auto'
                  : 'bg-muted text-foreground'
              }`}>
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.codeBlocks && message.codeBlocks.map((codeBlock, index) => 
                  renderCodeBlock(codeBlock, message.id, index)
                )}
                <div className="text-xs opacity-70 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-3 max-w-[80%]">
              <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-500 to-pink-500 text-white flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted text-foreground rounded-2xl px-4 py-3">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-border bg-muted/30">
        <div className="flex items-end space-x-3">
          <div className="flex-1 relative">
            <textarea
              ref={textareaRef}
              value={currentMessage}
              onChange={(e) => setCurrentMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={placeholder}
              className="w-full min-h-[44px] max-h-32 resize-none rounded-xl border border-input bg-background px-4 py-3 text-sm placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all duration-200"
              disabled={isTyping}
            />
          </div>
          
          <div className="flex space-x-2">
            {/* Voice Input Button */}
            <Button
              variant="outline"
              size="sm"
              onClick={startVoiceInput}
              disabled={isListening || isTyping}
              className={`h-11 w-11 p-0 ${isListening ? 'bg-red-50 border-red-200 text-red-600' : ''}`}
            >
              {isListening ? (
                <MicOff className="h-4 w-4" />
              ) : (
                <Mic className="h-4 w-4" />
              )}
            </Button>
            
            {/* Send Button */}
            <Button
              onClick={handleSend}
              disabled={!currentMessage.trim() || isTyping}
              className="h-11 w-11 p-0 bg-gradient-to-r from-primary to-purple-500 hover:from-primary/90 hover:to-purple-500/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mt-2 text-xs text-muted-foreground">
          <span>Press Enter to send, Shift+Enter for new line</span>
          {isListening && (
            <Badge className="bg-red-100 text-red-700 animate-pulse">
              Listening...
            </Badge>
          )}
        </div>
      </div>
    </Card>
  )
}

export default AIChatInterface
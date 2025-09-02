import React, { useState, useRef, useEffect } from 'react'
import { Search, X, Filter, Clock, Sparkles, Tag, User, Calendar } from 'lucide-react'
import { Button } from '@/features/shared/components/ui/button'
import { Card } from '@/features/shared/components/ui/card'
import { Badge } from '@/features/shared/components/ui/badge'
import { Input } from '@/features/shared/components/ui/input'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/features/shared/components/ui/dropdown-menu'

interface SearchSuggestion {
  id: string
  type: 'project' | 'user' | 'template' | 'tag' | 'recent'
  title: string
  subtitle?: string
  icon?: React.ReactNode
  metadata?: string
}

interface SearchFilter {
  id: string
  label: string
  value: string
  count?: number
}

interface AdvancedSearchProps {
  placeholder?: string
  onSearch?: (query: string, filters: SearchFilter[]) => void
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void
  className?: string
  showFilters?: boolean
  recentSearches?: string[]
}

const AdvancedSearch: React.FC<AdvancedSearchProps> = ({
  placeholder = "Search projects, templates, users...",
  onSearch,
  onSuggestionSelect,
  className = '',
  showFilters = true,
  recentSearches = []
}) => {
  const [query, setQuery] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [activeFilters, setActiveFilters] = useState<SearchFilter[]>([])
  const [suggestions, setSuggestions] = useState<SearchSuggestion[]>([])
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const inputRef = useRef<HTMLInputElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // Mock data for suggestions
  const mockSuggestions: SearchSuggestion[] = [
    {
      id: '1',
      type: 'project',
      title: 'E-commerce Store',
      subtitle: 'React + Node.js application',
      icon: <Sparkles className="h-4 w-4 text-blue-500" />,
      metadata: 'Created 2 days ago'
    },
    {
      id: '2',
      type: 'template',
      title: 'SaaS Dashboard Template',
      subtitle: 'Complete dashboard with authentication',
      icon: <Tag className="h-4 w-4 text-green-500" />,
      metadata: 'Popular template'
    },
    {
      id: '3',
      type: 'user',
      title: 'John Doe',
      subtitle: 'Frontend Developer',
      icon: <User className="h-4 w-4 text-purple-500" />,
      metadata: '15 projects'
    },
    {
      id: '4',
      type: 'project',
      title: 'Blog Platform',
      subtitle: 'Next.js blog with CMS',
      icon: <Sparkles className="h-4 w-4 text-orange-500" />,
      metadata: 'Created 1 week ago'
    }
  ]

  const availableFilters: SearchFilter[] = [
    { id: 'type-project', label: 'Projects', value: 'projects', count: 24 },
    { id: 'type-template', label: 'Templates', value: 'templates', count: 12 },
    { id: 'type-user', label: 'Users', value: 'users', count: 156 },
    { id: 'status-completed', label: 'Completed', value: 'completed', count: 18 },
    { id: 'status-in-progress', label: 'In Progress', value: 'in-progress', count: 6 },
    { id: 'tech-react', label: 'React', value: 'react', count: 15 },
    { id: 'tech-vue', label: 'Vue.js', value: 'vue', count: 8 },
    { id: 'tech-angular', label: 'Angular', value: 'angular', count: 5 },
  ]

  useEffect(() => {
    // Simulate API call for suggestions
    if (query.length > 0) {
      const filtered = mockSuggestions.filter(suggestion =>
        suggestion.title.toLowerCase().includes(query.toLowerCase()) ||
        suggestion.subtitle?.toLowerCase().includes(query.toLowerCase())
      )
      setSuggestions(filtered)
    } else {
      // Show recent searches when empty
      const recentSuggestions = recentSearches.map((search, index) => ({
        id: `recent-${index}`,
        type: 'recent' as const,
        title: search,
        icon: <Clock className="h-4 w-4 text-gray-400" />
      }))
      setSuggestions(recentSuggestions)
    }
  }, [query, recentSearches])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false)
        setSelectedIndex(-1)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => Math.min(prev + 1, suggestions.length - 1))
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => Math.max(prev - 1, -1))
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && suggestions[selectedIndex]) {
          handleSuggestionSelect(suggestions[selectedIndex])
        } else {
          handleSearch()
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        inputRef.current?.blur()
        break
    }
  }

  const handleSearch = () => {
    if (onSearch && query.trim()) {
      onSearch(query, activeFilters)
    }
    setIsOpen(false)
  }

  const handleSuggestionSelect = (suggestion: SearchSuggestion) => {
    setQuery(suggestion.title)
    setIsOpen(false)
    setSelectedIndex(-1)
    
    if (onSuggestionSelect) {
      onSuggestionSelect(suggestion)
    }
  }

  const addFilter = (filter: SearchFilter) => {
    if (!activeFilters.find(f => f.id === filter.id)) {
      setActiveFilters(prev => [...prev, filter])
    }
  }

  const removeFilter = (filterId: string) => {
    setActiveFilters(prev => prev.filter(f => f.id !== filterId))
  }

  const clearAllFilters = () => {
    setActiveFilters([])
  }

  const getSuggestionIcon = (suggestion: SearchSuggestion) => {
    if (suggestion.icon) return suggestion.icon
    
    switch (suggestion.type) {
      case 'project':
        return <Sparkles className="h-4 w-4 text-blue-500" />
      case 'template':
        return <Tag className="h-4 w-4 text-green-500" />
      case 'user':
        return <User className="h-4 w-4 text-purple-500" />
      case 'recent':
        return <Clock className="h-4 w-4 text-gray-400" />
      default:
        return <Search className="h-4 w-4 text-gray-400" />
    }
  }

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-muted-foreground" />
        </div>
        
        <Input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="pl-10 pr-20 h-12 text-base border-2 focus:border-primary transition-all duration-200"
        />
        
        <div className="absolute inset-y-0 right-0 flex items-center space-x-1 pr-3">
          {query && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setQuery('')
                setIsOpen(false)
                inputRef.current?.focus()
              }}
              className="h-8 w-8 p-0 hover:bg-muted"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
          
          {showFilters && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-muted">
                  <Filter className="h-4 w-4" />
                  {activeFilters.length > 0 && (
                    <Badge className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs bg-primary">
                      {activeFilters.length}
                    </Badge>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-64">
                <DropdownMenuLabel>Filter Results</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Content Type
                </DropdownMenuLabel>
                {availableFilters.filter(f => f.id.startsWith('type-')).map(filter => (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => addFilter(filter)}
                    className="flex items-center justify-between"
                  >
                    <span>{filter.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {filter.count}
                    </Badge>
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Status
                </DropdownMenuLabel>
                {availableFilters.filter(f => f.id.startsWith('status-')).map(filter => (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => addFilter(filter)}
                    className="flex items-center justify-between"
                  >
                    <span>{filter.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {filter.count}
                    </Badge>
                  </DropdownMenuItem>
                ))}
                
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs text-muted-foreground">
                  Technology
                </DropdownMenuLabel>
                {availableFilters.filter(f => f.id.startsWith('tech-')).map(filter => (
                  <DropdownMenuItem
                    key={filter.id}
                    onClick={() => addFilter(filter)}
                    className="flex items-center justify-between"
                  >
                    <span>{filter.label}</span>
                    <Badge variant="secondary" className="text-xs">
                      {filter.count}
                    </Badge>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          )}
        </div>
      </div>

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="flex items-center space-x-2 mt-3">
          <span className="text-sm text-muted-foreground">Filters:</span>
          {activeFilters.map(filter => (
            <Badge
              key={filter.id}
              variant="secondary"
              className="cursor-pointer hover:bg-muted"
              onClick={() => removeFilter(filter.id)}
            >
              {filter.label}
              <X className="h-3 w-3 ml-1" />
            </Badge>
          ))}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearAllFilters}
            className="h-6 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            Clear all
          </Button>
        </div>
      )}

      {/* Suggestions Dropdown */}
      {isOpen && (
        <Card className="absolute top-full left-0 right-0 mt-2 z-50 max-h-96 overflow-hidden shadow-lg border">
          <div className="p-2">
            {suggestions.length > 0 ? (
              <>
                <div className="max-h-80 overflow-y-auto custom-scrollbar">
                  {suggestions.map((suggestion, index) => (
                    <div
                      key={suggestion.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        index === selectedIndex
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => handleSuggestionSelect(suggestion)}
                    >
                      <div className="flex-shrink-0">
                        {getSuggestionIcon(suggestion)}
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">
                          {suggestion.title}
                        </p>
                        {suggestion.subtitle && (
                          <p className="text-xs text-muted-foreground truncate">
                            {suggestion.subtitle}
                          </p>
                        )}
                      </div>
                      
                      {suggestion.metadata && (
                        <div className="flex-shrink-0">
                          <span className="text-xs text-muted-foreground">
                            {suggestion.metadata}
                          </span>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                {query && (
                  <>
                    <div className="border-t border-border mt-2 pt-2">
                      <button
                        onClick={handleSearch}
                        className="w-full flex items-center space-x-3 p-3 rounded-lg hover:bg-muted/50 transition-colors text-left"
                      >
                        <Search className="h-4 w-4 text-primary" />
                        <span className="text-sm">
                          Search for "<span className="font-medium">{query}</span>"
                        </span>
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="p-8 text-center text-muted-foreground">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p className="text-sm">No suggestions found</p>
              </div>
            )}
          </div>
        </Card>
      )}
    </div>
  )
}

export default AdvancedSearch
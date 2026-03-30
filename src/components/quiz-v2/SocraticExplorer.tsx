'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { X, PaperPlaneRight, ChatCircleDots } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SourceBadgeRow, extractSources, stripSources } from '@/components/shared/SourceBadge'
import { useQuizStore } from '@/stores/useQuizStore'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface ConversationMessage {
  role: 'assistant' | 'user'
  content: string
  sources: string[]
}

interface SocraticExplorerProps {
  questionText: string
  selectedAnswer: string
  correctAnswer: string
  topicName: string
  topicId: string
  onClose: () => void
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const MAX_TURNS = 5

const SUGGESTED_PROMPTS = [
  'What concept am I missing here?',
  'Can you walk me through the reasoning?',
  'How do I avoid this mistake next time?',
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SocraticExplorer = ({
  questionText,
  selectedAnswer,
  correctAnswer,
  topicName,
  topicId,
  onClose,
}: SocraticExplorerProps) => {
  const [messages, setMessages] = useState<ConversationMessage[]>([])
  const [inputValue, setInputValue] = useState('')
  const [loading, setLoading] = useState(false)
  const [turnNumber, setTurnNumber] = useState(0)
  const [isComplete, setIsComplete] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  
  const openWikiPanel = useQuizStore((s) => s.openWikiPanel)

  const handleSourceClick = (slug: string) => {
    openWikiPanel(`/dashboard/wiki/${slug}`)
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight
    }
  }, [messages, loading])

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Auto-start: send first request on mount
  useEffect(() => {
    sendMessage(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const sendMessage = useCallback(
    async (userMessage: string | null) => {
      if (loading || isComplete) return

      // Add user message to conversation if provided
      const updatedMessages = [...messages]
      if (userMessage) {
        const userMsg: ConversationMessage = {
          role: 'user',
          content: userMessage,
          sources: [],
        }
        updatedMessages.push(userMsg)
        setMessages(updatedMessages)
      }

      setLoading(true)
      setInputValue('')

      // Check if user wants to end early
      const endPhrases = ['i understand', 'i get it', 'makes sense', 'got it', 'understood']
      if (userMessage && endPhrases.some((phrase) => userMessage.toLowerCase().includes(phrase))) {
        const completeMsg: ConversationMessage = {
          role: 'assistant',
          content:
            'Good work exploring this concept. Understanding the "why" behind the answer is what builds lasting knowledge. Try a similar question to see if it clicks.',
          sources: [],
        }
        setMessages([...updatedMessages, completeMsg])
        setIsComplete(true)
        setLoading(false)
        return
      }

      try {
        const conversationHistory = updatedMessages.map((m) => ({
          role: m.role,
          content: m.content,
        }))

        const response = await fetch('/api/ai/socratic', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            questionText,
            selectedAnswer,
            correctAnswer,
            topicName,
            topicId,
            conversationHistory,
          }),
        })

        if (!response.ok) {
          throw new Error(`API error: ${response.status}`)
        }

        const data = (await response.json()) as {
          message: string
          turnNumber: number
          isComplete: boolean
          sources: string[]
        }

        const sources = extractSources(data.message)
        const assistantMsg: ConversationMessage = {
          role: 'assistant',
          content: data.message,
          sources,
        }

        setMessages((prev) => [...prev, assistantMsg])
        setTurnNumber(data.turnNumber)
        setIsComplete(data.isComplete)
      } catch {
        const errorMsg: ConversationMessage = {
          role: 'assistant',
          content:
            'Something went wrong connecting to the tutor. Try closing and reopening this panel.',
          sources: [],
        }
        setMessages((prev) => [...prev, errorMsg])
      } finally {
        setLoading(false)
      }
    },
    [loading, isComplete, messages, questionText, selectedAnswer, correctAnswer, topicName, topicId],
  )

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) return
    sendMessage(trimmed)
  }

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt)
  }

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/20 z-40 animate-in fade-in duration-150"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Slide-over panel */}
      <div
        role="dialog"
        aria-label="Socratic exploration"
        aria-modal="true"
        className={cn(
          'fixed right-0 top-0 bottom-0 z-50 w-full max-w-md',
          'bg-white border-l border-[#D4DAE3] shadow-lg',
          'flex flex-col',
          'animate-in slide-in-from-right duration-200 ease-out',
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#D4DAE3] shrink-0">
          <div className="flex items-center gap-2">
            <ChatCircleDots size={18} weight="fill" className="text-[#1B3FC4]" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-semibold text-[#1A2332]">Explore This</h2>
              {turnNumber > 0 && !isComplete && (
                <p className="text-[11px] text-[#8896A7]">
                  Turn {turnNumber} of {MAX_TURNS}
                </p>
              )}
              {isComplete && (
                <p className="text-[11px] text-[#2D9F6F] font-medium">Exploration complete</p>
              )}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className={cn(
              'flex items-center justify-center w-8 h-8 rounded-sm',
              'text-[#8896A7] hover:text-[#1A2332] hover:bg-[#F8F7F5]',
              'transition-colors duration-150 ease-out',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4]/30',
            )}
            aria-label="Close exploration panel"
          >
            <X size={16} weight="bold" />
          </button>
        </div>

        {/* Messages area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={cn(
                'flex',
                msg.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-md px-3 py-2 text-sm leading-relaxed',
                  msg.role === 'user'
                    ? 'bg-[#EEF2FC] text-[#1A2332]'
                    : 'bg-[#F8F7F5] text-[#1A2332]',
                )}
              >
                <p className="whitespace-pre-wrap">{stripSources(msg.content)}</p>
                {msg.sources.length > 0 && (
                  <SourceBadgeRow 
                    sources={msg.sources} 
                    onSourceClick={handleSourceClick}
                  />
                )}
              </div>
            </div>
          ))}

          {/* Loading indicator */}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-[#F8F7F5] rounded-md px-3 py-2 flex items-center gap-1.5">
                <div className="flex gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8896A7] animate-pulse" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8896A7] animate-pulse [animation-delay:150ms]" />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#8896A7] animate-pulse [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {/* Suggested prompts — shown when no user messages yet and not loading */}
          {messages.length === 1 && !loading && !isComplete && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] text-[#8896A7]">Try asking:</p>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className={cn(
                    'block w-full text-left text-xs px-3 py-2 rounded-md',
                    'border border-[#D4DAE3] text-[#4A5568]',
                    'hover:border-[#1B3FC4]/40 hover:text-[#1A2332] hover:bg-[#EEF2FC]/50',
                    'transition-all duration-150 ease-out',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4]/30',
                  )}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {/* Completion message */}
          {isComplete && (
            <div className="pt-2">
              <Button variant="primary" size="sm" onClick={onClose} fullWidth>
                Close exploration
              </Button>
            </div>
          )}
        </div>

        {/* Input area */}
        {!isComplete && (
          <form
            onSubmit={handleSubmit}
            className="shrink-0 border-t border-[#D4DAE3] px-4 py-3 flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your response..."
              disabled={loading}
              className={cn(
                'flex-1 h-9 px-3 rounded-sm border border-[#D4DAE3] bg-white',
                'text-sm text-[#1A2332] placeholder:text-[#8896A7]',
                'transition-colors duration-150 ease-out',
                'focus:outline-none focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20',
                'disabled:opacity-50',
              )}
              aria-label="Your response"
            />
            <Button
              type="submit"
              variant="primary"
              size="icon"
              disabled={loading || !inputValue.trim()}
              aria-label="Send message"
            >
              <PaperPlaneRight size={16} weight="fill" />
            </Button>
          </form>
        )}
      </div>
    </>
  )
}

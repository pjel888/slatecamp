'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { PaperPlaneRight, ChatCircleDots } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { SourceBadgeRow, extractSources, stripSources } from '@/components/shared/SourceBadge'
import { useQuizStore } from '@/stores/useQuizStore'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'

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
  const didAutoStartRef = useRef(false)

  const openWikiPanel = useQuizStore((s) => s.openWikiPanel)

  const handleSourceClick = (slug: string, articleId?: string) => {
    openWikiPanel(`/dashboard/wiki/${articleId || slug}`)
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

  // Auto-start: send first request on mount
  useEffect(() => {
    if (didAutoStartRef.current) return
    didAutoStartRef.current = true
    sendMessage(null)
  }, [sendMessage])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = inputValue.trim()
    if (!trimmed) return
    sendMessage(trimmed)
  }

  const handleSuggestedPrompt = (prompt: string) => {
    sendMessage(prompt)
  }

  return (
    <Modal
      open
      onOpenChange={(open) => {
        if (!open) onClose()
      }}
    >
      <ModalContent
        width={480}
        height={620}
        maxHeight="calc(100dvh - 24px)"
        role="dialog"
        aria-label="Socratic exploration"
      >
        <ModalHeader closeAriaLabel="Close exploration panel">
          <div className="flex min-w-0 items-center gap-2">
            <ChatCircleDots size={18} weight="fill" className="text-primary" aria-hidden="true" />
            <div className="min-w-0">
              <ModalTitle>Explore This</ModalTitle>
              {turnNumber > 0 && !isComplete && (
                <ModalDescription>
                  Turn {turnNumber} of {MAX_TURNS}
                </ModalDescription>
              )}
              {isComplete && (
                <ModalDescription className="font-medium text-success">
                  Exploration complete
                </ModalDescription>
              )}
            </div>
          </div>
        </ModalHeader>

        <ModalBody ref={scrollRef} className="space-y-3 px-4 py-3">
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
                    ? 'bg-primary-50 text-foreground'
                    : 'bg-surface-light text-foreground',
                )}
              >
                <p className="whitespace-pre-wrap">{stripSources(msg.content)}</p>
                {msg.sources.length > 0 && (
                  <SourceBadgeRow
                    sources={msg.sources.map((s) => ({ slug: s }))}
                    onSourceClick={handleSourceClick}
                  />
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="flex items-center gap-1.5 rounded-md bg-surface-light px-3 py-2">
                <div className="flex gap-1">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:150ms]" />
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-muted-foreground [animation-delay:300ms]" />
                </div>
              </div>
            </div>
          )}

          {messages.length === 1 && !loading && !isComplete && (
            <div className="space-y-1.5 pt-1">
              <p className="text-[11px] text-muted-foreground">Try asking:</p>
              {SUGGESTED_PROMPTS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => handleSuggestedPrompt(prompt)}
                  className={cn(
                    'block w-full rounded-md border border-border px-3 py-2 text-left text-xs text-text-secondary',
                    'transition-all duration-150 ease-out hover:border-primary/40 hover:bg-primary-50/50 hover:text-foreground',
                    'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30',
                  )}
                >
                  {prompt}
                </button>
              ))}
            </div>
          )}

          {isComplete && (
            <div className="pt-2">
              <Button variant="primary" size="sm" onClick={onClose} fullWidth>
                Close exploration
              </Button>
            </div>
          )}
        </ModalBody>

        {!isComplete && (
          <ModalFooter className="block px-4 py-3">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Type your response..."
                disabled={loading}
                className={cn(
                  'h-9 flex-1 rounded-sm border border-border bg-card px-3 text-sm text-foreground placeholder:text-muted-foreground',
                  'transition-colors duration-150 ease-out focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20',
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
          </ModalFooter>
        )}
      </ModalContent>
    </Modal>
  )
}

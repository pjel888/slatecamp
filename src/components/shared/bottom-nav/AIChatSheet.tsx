'use client'

import { useState, useRef, useEffect } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Send, MessageSquare } from 'lucide-react'
import { cn } from '@/lib/utils'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface AIChatSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AIChatSheet({ open, onOpenChange }: AIChatSheetProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([
        {
          role: 'assistant',
          content:
            "I'm your Socratic tutor. I won't give you the answer directly — instead, I'll ask questions to guide your thinking. What would you like to explore?",
        },
      ])
    }
  }, [open, messages.length])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function handleSend() {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input.trim() }
    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setLoading(true)

    try {
      const res = await fetch('/api/ai/tutor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMessage].map((m) => ({
            role: m.role,
            content: m.content,
          })),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Request failed')
      }

      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: data.message },
      ])
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content:
            error instanceof Error
              ? `Error: ${error.message}`
              : 'Sorry, I encountered an error. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
      textareaRef.current?.focus()
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='bottom' className='h-[80vh] flex flex-col'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <MessageSquare className='h-5 w-5 text-slatecamp-amber' />
            SlateCamp Reference Assistant
          </SheetTitle>
          <SheetDescription>
            Ask questions about architecture concepts. I'll guide you with
            questions, not answers.
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto space-y-4 py-4'>
          {messages.map((message, idx) => (
            <div
              key={idx}
              className={cn(
                'flex',
                message.role === 'user' ? 'justify-end' : 'justify-start',
              )}
            >
              <div
                className={cn(
                  'max-w-[85%] rounded-xl px-4 py-2.5',
                  message.role === 'user'
                    ? 'bg-slatecamp-ink-main text-slatecamp-paper-snow'
                    : 'bg-slatecamp-paper-cool text-slatecamp-ink-main border border-slatecamp-border',
                )}
              >
                <p className='text-sm leading-relaxed whitespace-pre-wrap'>
                  {message.content}
                </p>
              </div>
            </div>
          ))}
          {loading && (
            <div className='flex justify-start'>
              <div className='bg-slatecamp-paper-cool border border-slatecamp-border rounded-xl px-4 py-2.5'>
                <Loader2 className='h-4 w-4 animate-spin text-slatecamp-ink-muted' />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className='flex gap-2 pt-4 border-t border-slatecamp-border'>
          <Textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder='Ask a question...'
            className='min-h-[60px] resize-none'
            disabled={loading}
          />
          <Button
            onClick={handleSend}
            disabled={!input.trim() || loading}
            className='shrink-0'
          >
            {loading ? (
              <Loader2 className='h-4 w-4 animate-spin' />
            ) : (
              <Send className='h-4 w-4' />
            )}
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  )
}

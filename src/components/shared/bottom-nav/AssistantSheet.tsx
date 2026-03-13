'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Loader2, Sparkles, FileText, ListChecks, Code } from 'lucide-react'
import { cn } from '@/lib/utils'

type StudyAgentAction = 'summarize' | 'flashcards' | 'code_check'

interface AssistantSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

const ACTIONS: { id: StudyAgentAction; label: string; icon: typeof FileText; description: string }[] = [
  {
    id: 'summarize',
    label: 'Summarize',
    icon: FileText,
    description: 'Turn messy notes into clear bullet points',
  },
  {
    id: 'flashcards',
    label: 'Flashcards',
    icon: ListChecks,
    description: 'Generate active-recall questions',
  },
  {
    id: 'code_check',
    label: 'Code Check',
    icon: Code,
    description: 'Verify building code references',
  },
]

export function AssistantSheet({ open, onOpenChange }: AssistantSheetProps) {
  const [selectedAction, setSelectedAction] = useState<StudyAgentAction | null>(null)
  const [content, setContent] = useState('')
  const [result, setResult] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleProcess() {
    if (!selectedAction || !content.trim() || loading) return

    setLoading(true)
    setResult('')

    try {
      const res = await fetch('/api/ai/study-agent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: selectedAction,
          content: content.trim(),
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error ?? 'Request failed')
      }

      setResult(data.text ?? '')
    } catch (error) {
      setResult(
        error instanceof Error
          ? `Error: ${error.message}`
          : 'Sorry, I encountered an error. Please try again.',
      )
    } finally {
      setLoading(false)
    }
  }

  function handleReset() {
    setSelectedAction(null)
    setContent('')
    setResult('')
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side='bottom' className='h-[85vh] flex flex-col'>
        <SheetHeader>
          <SheetTitle className='flex items-center gap-2'>
            <Sparkles className='h-5 w-5 text-slatecamp-amber' />
            Study Assistant
          </SheetTitle>
          <SheetDescription>
            Process your notes with AI-powered study tools
          </SheetDescription>
        </SheetHeader>

        <div className='flex-1 overflow-y-auto space-y-4 py-4'>
          {!selectedAction ? (
            <div className='grid gap-3'>
              {ACTIONS.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.id}
                    onClick={() => setSelectedAction(action.id)}
                    className={cn(
                      'flex items-start gap-3 p-4 rounded-xl border border-slatecamp-border',
                      'bg-slatecamp-paper-cool hover:bg-slatecamp-paper-cool/80',
                      'transition-colors text-left',
                    )}
                  >
                    <div className='shrink-0 p-2 rounded-lg bg-slatecamp-amber/10'>
                      <Icon className='h-5 w-5 text-slatecamp-amber' />
                    </div>
                    <div className='flex-1 min-w-0'>
                      <h3 className='font-medium text-slatecamp-ink-main mb-1'>
                        {action.label}
                      </h3>
                      <p className='text-sm text-slatecamp-ink-muted'>
                        {action.description}
                      </p>
                    </div>
                  </button>
                )
              })}
            </div>
          ) : (
            <>
              <div className='space-y-2'>
                <label className='text-sm font-medium text-slatecamp-ink-main'>
                  {ACTIONS.find((a) => a.id === selectedAction)?.label}
                </label>
                <Textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder='Paste your notes here...'
                  className='min-h-[120px] resize-none'
                  disabled={loading}
                />
                <div className='flex gap-2'>
                  <Button
                    onClick={handleProcess}
                    disabled={!content.trim() || loading}
                    className='flex-1'
                  >
                    {loading ? (
                      <>
                        <Loader2 className='h-4 w-4 animate-spin mr-2' />
                        Processing...
                      </>
                    ) : (
                      'Process'
                    )}
                  </Button>
                  <Button
                    variant='outline'
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Back
                  </Button>
                </div>
              </div>

              {result && (
                <div className='mt-4 p-4 rounded-xl bg-slatecamp-paper-cool border border-slatecamp-border'>
                  <div
                    className='prose prose-sm max-w-none text-slatecamp-ink-main'
                    dangerouslySetInnerHTML={{
                      __html: result
                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                        .replace(/\n/g, '<br />'),
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  )
}

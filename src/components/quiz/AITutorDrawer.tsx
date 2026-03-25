'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, CircleNotch, Warning } from '@phosphor-icons/react/dist/ssr'
import { getCorrectOptionId } from '@/lib/utils/question'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Eyebrow } from '@/components/ui/eyebrow'
import { CloseButton } from '@/components/ui/close-button'
import { cn } from '@/lib/utils'
import type { Question, Choice } from '@/types/app'

interface AITutorDrawerProps {
  question: Question
  selectedOptionId: string | undefined
  options: Choice[]
  isVisible: boolean
  onClose: () => void
}

interface TutorResponse {
  misconception: string
  principle: string
  wikiHint: string
}

function parseTutorResponse(text: string): TutorResponse {
  const get = (label: string) => {
    const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i')
    return text.match(re)?.[1]?.trim() || ''
  }
  return {
    misconception: get('Misconception') || text,
    principle: get('Principle'),
    wikiHint: get('Wiki Reference'),
  }
}

export function AITutorDrawer({
  question,
  selectedOptionId,
  options,
  isVisible,
  onClose,
}: AITutorDrawerProps) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [response, setResponse] = useState<TutorResponse | null>(null)
  const closeRef = useRef<HTMLDivElement>(null)
  const fetchedForRef = useRef<string | null>(null)

  useEffect(() => {
    if (!isVisible) return
    // Don't refetch if we already have a response for this question
    if (fetchedForRef.current === question.question_id && response) return

    const correctOption = options.find(
      (o) => o.id === getCorrectOptionId(question)
    )
    const selectedOption = options.find((o) => o.id === selectedOptionId)

    setLoading(true)
    setError(null)
    fetchedForRef.current = question.question_id

    fetch('/api/ai/tutor', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Explain this question using the required format.',
        context: {
          question: question.text,
          correct_answer: correctOption?.text ?? 'Unknown',
          student_answer: selectedOption?.text ?? 'No answer selected',
          rationale: question.rationale,
          topic_id: question.topic_id,
        },
      }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('The AI tutor is momentarily unavailable — try again in a moment.')
        const data = await res.json()
        const text = data.reply?.text ?? data.reply ?? ''
        setResponse(parseTutorResponse(text))
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false))
  }, [isVisible, question.question_id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Reset when question changes
  useEffect(() => {
    setResponse(null)
    setError(null)
    fetchedForRef.current = null
  }, [question.question_id])

  // Focus close button when drawer opens
  useEffect(() => {
    if (isVisible) {
      const t = setTimeout(() => closeRef.current?.querySelector('button')?.focus(), 350)
      return () => clearTimeout(t)
    }
  }, [isVisible])

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ type: 'spring', damping: 28, stiffness: 220 }}
          className="shrink-0 overflow-hidden border-t border-zinc-100"
          role="region"
          aria-label="AI Tutor explanation"
          aria-live="polite"
        >
          <div className="bg-zinc-50 border-b border-zinc-200">
            <div className="max-w-[900px] mx-auto px-5 py-5 space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-zinc-700">
                  <SCIcon icon={Brain} size="sm" />
                  <span className="text-[11px] font-black uppercase tracking-widest">AI Tutor</span>
                </div>
                <div ref={closeRef}>
                  <CloseButton onClick={onClose} aria-label="Close AI tutor" size="sm" />
                </div>
              </div>

              {/* Body */}
              {loading && (
                <div className="flex items-center gap-2 text-zinc-400 py-2">
                  {/* Spinner: AI response throbber — inline indicator, not a content placeholder */}
                  <SCIcon icon={CircleNotch} size="sm" className="animate-spin" />
                  <span className="text-[11px] font-medium">Preparing your explanation…</span>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 text-destructive py-2">
                  <SCIcon icon={Warning} size="sm" />
                  <span className="text-[11px] font-medium">{error}</span>
                </div>
              )}

              {response && !loading && (
                <div className="space-y-3">
                  {response.misconception && (
                    <div className="space-y-1">
                      <Eyebrow className="text-warning">Misconception</Eyebrow>
                      <p className="text-[13px] text-zinc-600 leading-[1.65] max-w-[65ch]">
                        {response.misconception}
                      </p>
                    </div>
                  )}

                  {response.principle && (
                    <div className="space-y-1">
                      <Eyebrow className="text-primary">Principle</Eyebrow>
                      <p className="text-[13px] text-zinc-700 leading-[1.65] max-w-[65ch]">
                        {response.principle}
                      </p>
                    </div>
                  )}

                  {response.wikiHint && (
                    <div className="pt-1">
                      <span className="inline-flex items-center gap-1.5 h-6 px-2.5 rounded-sm bg-[#EEF2FC] border border-primary/20 text-[#1535A8] text-[11px] font-black uppercase tracking-widest">
                        {response.wikiHint}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

'use client'

import { useState, useTransition } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { trackEvent } from '@/lib/analytics'
import { submitEIResponse } from '@/lib/actions/ei-prompts'

interface EIOption {
  text: string
  is_correct: boolean
}

interface ElaborativeInterrogationProps {
  promptId: string
  question: string
  answer: string
  options: EIOption[]
  articleId?: string
  /** Pre-existing response from DB — null if unanswered */
  existingResponse?: {
    selected_option_index: number | null
    response_text: string | null
    responded_at: string
  } | null
}

export const ElaborativeInterrogation = ({
  promptId,
  question,
  answer,
  options,
  articleId,
  existingResponse,
}: ElaborativeInterrogationProps) => {
  const sanitizedAnswer = DOMPurify.sanitize(answer)
  const isMCQ = options.length > 0
  const wasAnswered = !!existingResponse

  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    existingResponse?.selected_option_index ?? null
  )
  const [isRevealed, setIsRevealed] = useState(wasAnswered)
  const [isSubmitted, setIsSubmitted] = useState(wasAnswered)
  const [isPending, startTransition] = useTransition()

  const handleMCQSelect = (index: number) => {
    if (isSubmitted) return
    setSelectedIndex(index)
    setIsSubmitted(true)
    setIsRevealed(true)

    startTransition(async () => {
      await submitEIResponse({
        promptId,
        selectedOptionIndex: index,
      })
    })

    trackEvent({
      event_name: 'ei_prompt_answered',
      event_properties: {
        article_id: articleId,
        prompt_id: promptId,
        is_correct: options[index]?.is_correct === true,
        format: 'mcq',
      },
    })
  }

  const handleReveal = () => {
    setIsRevealed(true)

    trackEvent({
      event_name: 'ei_prompt_revealed',
      event_properties: {
        article_id: articleId,
        prompt_id: promptId,
        format: 'open_ended',
      },
    })
  }

  // Already answered — show completed state
  if (wasAnswered && isMCQ) {
    const prevIndex = existingResponse.selected_option_index
    const wasCorrect = prevIndex !== null && options[prevIndex]?.is_correct === true

    return (
      <div className="not-prose my-6 rounded-md border border-[#D4DAE3] bg-[#F8F7F5] p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8896A7] mb-2">
          Think About It
        </p>
        <p className="text-sm font-medium text-[#1A2332] leading-relaxed mb-3">
          {question}
        </p>
        <div className="space-y-2 mb-3">
          {options.map((opt, i) => {
            const isSelected = i === prevIndex
            const isCorrectOption = opt.is_correct
            let style = 'border-[#D4DAE3] bg-white text-[#4A5568]'
            if (isSelected && isCorrectOption) {
              style = 'border-[#2D9F6F] bg-[#EDFAF4] text-[#1A2332]'
            } else if (isSelected && !isCorrectOption) {
              style = 'border-[#D64545] bg-[#FDF0F0] text-[#1A2332]'
            } else if (isCorrectOption) {
              style = 'border-[#2D9F6F]/40 bg-[#EDFAF4]/50 text-[#4A5568]'
            }
            return (
              <div
                key={i}
                className={`rounded-sm border px-3 py-2 text-sm ${style}`}
              >
                {opt.text}
                {isSelected && isCorrectOption && (
                  <span className="ml-2 text-[#2D9F6F] font-medium">Correct</span>
                )}
                {isSelected && !isCorrectOption && (
                  <span className="ml-2 text-[#D64545] font-medium">Incorrect</span>
                )}
              </div>
            )
          })}
        </div>
        <div className="pt-3 border-t border-[#D4DAE3]">
          <div
            className="text-sm text-[#4A5568] leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedAnswer }}
          />
        </div>
        <p className="mt-2 text-[11px] text-[#8896A7]">
          {wasCorrect ? 'You got this right' : 'Reviewed'} &middot; {new Date(existingResponse.responded_at).toLocaleDateString()}
        </p>
      </div>
    )
  }

  // MCQ — unanswered
  if (isMCQ && !isSubmitted) {
    return (
      <div className="not-prose my-6 rounded-md border border-[#1B3FC4]/15 bg-[#EEF2FC] p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8896A7] mb-2">
          Think About It
        </p>
        <p className="text-sm font-medium text-[#1A2332] leading-relaxed mb-3">
          {question}
        </p>
        <div className="space-y-2">
          {options.map((opt, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handleMCQSelect(i)}
              disabled={isPending}
              className="w-full text-left rounded-sm border border-[#D4DAE3] bg-white px-3 py-2 text-sm text-[#1A2332] transition-colors duration-150 ease-out hover:border-[#1B3FC4] hover:bg-[#EEF2FC] disabled:opacity-60"
            >
              {opt.text}
            </button>
          ))}
        </div>
      </div>
    )
  }

  // MCQ — just submitted this session
  if (isMCQ && isSubmitted && selectedIndex !== null) {
    const isCorrect = options[selectedIndex]?.is_correct === true
    return (
      <div className="not-prose my-6 rounded-md border border-[#D4DAE3] bg-[#F8F7F5] p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8896A7] mb-2">
          Think About It
        </p>
        <p className="text-sm font-medium text-[#1A2332] leading-relaxed mb-3">
          {question}
        </p>
        <div className="space-y-2 mb-3">
          {options.map((opt, i) => {
            const isSelected = i === selectedIndex
            const isCorrectOption = opt.is_correct
            let style = 'border-[#D4DAE3] bg-white text-[#4A5568]'
            if (isSelected && isCorrectOption) {
              style = 'border-[#2D9F6F] bg-[#EDFAF4] text-[#1A2332]'
            } else if (isSelected && !isCorrectOption) {
              style = 'border-[#D64545] bg-[#FDF0F0] text-[#1A2332]'
            } else if (isCorrectOption) {
              style = 'border-[#2D9F6F]/40 bg-[#EDFAF4]/50 text-[#4A5568]'
            }
            return (
              <div
                key={i}
                className={`rounded-sm border px-3 py-2 text-sm ${style}`}
              >
                {opt.text}
                {isSelected && isCorrectOption && (
                  <span className="ml-2 text-[#2D9F6F] font-medium">Correct</span>
                )}
                {isSelected && !isCorrectOption && (
                  <span className="ml-2 text-[#D64545] font-medium">Incorrect</span>
                )}
              </div>
            )
          })}
        </div>
        <div className="pt-3 border-t border-[#D4DAE3]">
          <div
            className="text-sm text-[#4A5568] leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedAnswer }}
          />
        </div>
        {isCorrect ? (
          <p className="mt-2 text-[11px] text-[#2D9F6F] font-medium">Nice work!</p>
        ) : (
          <p className="mt-2 text-[11px] text-[#D4951A] font-medium">Review the explanation above</p>
        )}
      </div>
    )
  }

  // Open-ended — revealed
  if (isRevealed) {
    return (
      <div className="not-prose my-6 rounded-md border border-[#D4DAE3] bg-[#F8F7F5] p-4">
        <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8896A7] mb-2">
          Think About It
        </p>
        <p className="text-sm font-medium text-[#1A2332] leading-relaxed">
          {question}
        </p>
        <div className="mt-3 pt-3 border-t border-[#D4DAE3]">
          <div
            className="text-sm text-[#4A5568] leading-relaxed prose prose-sm max-w-none"
            dangerouslySetInnerHTML={{ __html: sanitizedAnswer }}
          />
        </div>
      </div>
    )
  }

  // Open-ended — hidden (default)
  return (
    <div className="not-prose my-6 rounded-md border border-[#1B3FC4]/15 bg-[#EEF2FC] p-4">
      <p className="text-[11px] font-medium uppercase tracking-[0.15em] text-[#8896A7] mb-2">
        Think About It
      </p>
      <p className="text-sm font-medium text-[#1A2332] leading-relaxed">
        {question}
      </p>
      <button
        type="button"
        onClick={handleReveal}
        className="mt-3 text-sm font-medium text-[#1B3FC4] transition-colors duration-150 ease-out hover:underline"
      >
        Reveal answer &rarr;
      </button>
    </div>
  )
}

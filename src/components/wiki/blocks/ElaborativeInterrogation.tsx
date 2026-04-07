'use client'

import { useState, useTransition } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { trackEvent } from '@/lib/analytics'
import { submitEIResponse } from '@/lib/actions/ei-prompts'
import { parseMdxProp } from '../shared/parse-mdx-prop'

interface EIOption {
  text: string
  is_correct: boolean
}

interface ElaborativeInterrogationProps {
  promptId: string
  question: string
  /** Reveal/explanation text — accepts both `answer` and `revealText` (MDX alias) */
  answer?: string
  revealText?: string
  options: EIOption[] | string
  articleId?: string
  /** "mcq" | "open" — inferred from options if omitted */
  type?: string
  /** Placeholder for open-ended textarea */
  placeholder?: string
  /** Pre-existing response from DB — null if unanswered */
  existingResponse?: {
    selected_option_index: number | null
    response_text: string | null
    responded_at: string
  } | null
}

/** Parse options prop — may be native array or MDX string */
const parseOptions = (options: EIOption[] | string | undefined): EIOption[] =>
  parseMdxProp<EIOption[]>(options, [])

const LETTERS = ['A', 'B', 'C', 'D', 'E', 'F']

export const ElaborativeInterrogation = ({
  promptId,
  question,
  answer,
  revealText,
  options: rawOptions,
  articleId,
  type,
  placeholder,
  existingResponse,
}: ElaborativeInterrogationProps) => {
  const options = parseOptions(rawOptions)
  const resolvedAnswer = answer || revealText || ''
  const sanitizedAnswer = DOMPurify.sanitize(resolvedAnswer)
  const isMCQ = options.length > 0
  const wasAnswered = !!existingResponse

  const [selectedIndex, setSelectedIndex] = useState<number | null>(
    existingResponse?.selected_option_index ?? null
  )
  const [isRevealed, setIsRevealed] = useState(wasAnswered)
  const [isSubmitted, setIsSubmitted] = useState(wasAnswered)
  const [isPending, startTransition] = useTransition()
  const [openText, setOpenText] = useState(existingResponse?.response_text ?? '')

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

  const handleOpenSubmit = () => {
    setIsRevealed(true)
    setIsSubmitted(true)

    startTransition(async () => {
      await submitEIResponse({
        promptId,
        responseText: openText,
      })
    })

    trackEvent({
      event_name: 'ei_prompt_answered',
      event_properties: {
        article_id: articleId,
        prompt_id: promptId,
        format: 'open_ended',
      },
    })
  }

  // Determine header config based on type
  const headerIcon = isMCQ ? '💡' : '✍️'
  const headerLabel = isMCQ ? 'Think About It' : 'Reflect'
  const headerSubtitle = isMCQ
    ? 'Test your understanding before moving on'
    : 'Write your thinking before seeing the explanation'

  return (
    <div className="not-prose my-7 border border-wiki-border rounded-xl overflow-hidden bg-card dark:bg-wiki-ink dark:border-wiki-invert-divider">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-br from-cobalt-light to-[var(--wiki-gradient-blue)] border-b border-wiki-border dark:from-primary/15 dark:to-primary/10 dark:border-wiki-invert-divider">
        <div className="w-7 h-7 rounded-lg bg-camp-cobalt flex items-center justify-center text-white text-sm">
          {headerIcon}
        </div>
        <div className="flex-1">
          <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-camp-cobalt">
            {headerLabel}
          </div>
          <div className="text-[13px] text-wiki-body mt-px dark:text-wiki-invert-body">
            {headerSubtitle}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Already-answered badge */}
        {wasAnswered && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-success-50 rounded-lg text-xs text-camp-green mb-3 dark:bg-camp-green/15">
            <span className="text-sm">✓</span>
            <span className="font-[var(--font-dm-mono)] text-[11px]">
              You answered this on {new Date(existingResponse!.responded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}

        {/* Question */}
        <p className="text-[15px] font-semibold text-wiki-ink mb-4 leading-relaxed dark:text-wiki-invert-heading">
          {question}
        </p>

        {/* MCQ Options */}
        {isMCQ && (
          <div className="flex flex-col gap-2">
            {options.map((opt, i) => {
              const isSelected = i === selectedIndex
              const isCorrectOption = opt.is_correct

              let containerStyle = 'border-wiki-border cursor-pointer hover:border-primary-700 hover:bg-cobalt-light'
              let letterStyle = 'border-wiki-border text-wiki-body'

              if (isSubmitted) {
                if (isCorrectOption) {
                  containerStyle = 'border-camp-green bg-success-50 cursor-default'
                  letterStyle = 'bg-camp-green text-white border-camp-green'
                } else if (isSelected && !isCorrectOption) {
                  containerStyle = 'border-camp-red bg-destructive-50 cursor-default'
                  letterStyle = 'bg-camp-red text-white border-camp-red'
                } else {
                  containerStyle = 'border-wiki-border opacity-50 cursor-default'
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleMCQSelect(i)}
                  disabled={isSubmitted || isPending}
                  className={`flex items-start gap-3 px-4 py-3 border-[1.5px] rounded-[10px] transition-all duration-150 text-left text-sm text-wiki-body leading-[1.45] dark:text-wiki-invert-body ${containerStyle}`}
                >
                  <span
                    className={`w-6 h-6 rounded-full border-[1.5px] flex items-center justify-center text-xs font-semibold shrink-0 mt-px font-[var(--font-dm-mono)] transition-all duration-150 ${letterStyle}`}
                  >
                    {LETTERS[i]}
                  </span>
                  <span>{opt.text}</span>
                </button>
              )
            })}
          </div>
        )}

        {/* Open-ended textarea */}
        {!isMCQ && !isSubmitted && (
          <>
            <textarea
              value={openText}
              onChange={(e) => setOpenText(e.target.value)}
              aria-label="Write your answer"
              placeholder={placeholder || "Write your answer here. There is no single correct answer, but the explanation below will help you calibrate your thinking."}
              className="w-full min-h-[80px] px-3.5 py-3 border-[1.5px] border-wiki-border rounded-[10px] font-sans text-sm text-wiki-ink resize-y outline-none transition-colors duration-150 focus:border-camp-cobalt placeholder:text-wiki-muted dark:bg-wiki-ink dark:border-wiki-invert-divider dark:text-wiki-invert-heading"
            />
            <div className="flex justify-end mt-2.5">
              <button
                type="button"
                onClick={handleOpenSubmit}
                disabled={isPending}
                className="px-5 py-2 bg-camp-cobalt text-white border-none rounded-lg text-[13px] font-semibold font-sans transition-colors duration-150 hover:bg-primary-700 disabled:bg-wiki-muted disabled:cursor-not-allowed"
              >
                Show Explanation
              </button>
            </div>
          </>
        )}

        {/* Open-ended — already submitted textarea (readonly) */}
        {!isMCQ && isSubmitted && openText && (
          <textarea
            value={openText}
            readOnly
            className="w-full min-h-[80px] px-3.5 py-3 border-[1.5px] border-wiki-border rounded-[10px] font-sans text-sm text-wiki-ink opacity-70 resize-none outline-none dark:bg-wiki-ink dark:border-wiki-invert-divider dark:text-wiki-invert-heading"
          />
        )}

        {/* Reveal text */}
        {isRevealed && sanitizedAnswer && (
          <div className="mt-4 p-4 bg-muted rounded-[10px] dark:bg-wiki-surface-dark">
            <div className="font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-camp-cobalt mb-1.5">
              Why This Matters
            </div>
            <div
              className="text-sm text-wiki-body leading-relaxed [&_strong]:font-semibold [&_strong]:text-wiki-ink dark:text-wiki-invert-body dark:[&_strong]:text-wiki-invert-heading"
              dangerouslySetInnerHTML={{ __html: sanitizedAnswer }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

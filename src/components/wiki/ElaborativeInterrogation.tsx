'use client'

import { useState, useTransition } from 'react'
import DOMPurify from 'isomorphic-dompurify'
import { trackEvent } from '@/lib/analytics'
import { submitEIResponse } from '@/lib/actions/ei-prompts'
import { parseMdxProp } from './parse-mdx-prop'

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
    <div className="not-prose my-7 border border-[#E0DED8] rounded-xl overflow-hidden bg-white dark:bg-[#1A1A1A] dark:border-[#3A3835]">
      {/* Header */}
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-br from-[#EEF3FD] to-[#E8EEFF] border-b border-[#E0DED8] dark:from-[#1B3FC415] dark:to-[#1B3FC410] dark:border-[#3A3835]">
        <div className="w-7 h-7 rounded-lg bg-[#1B3FC4] flex items-center justify-center text-white text-sm">
          {headerIcon}
        </div>
        <div className="flex-1">
          <div className="font-[var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[0.1em] text-[#1B3FC4]">
            {headerLabel}
          </div>
          <div className="text-[13px] text-[#3D3D3A] mt-px dark:text-[#C8C6C0]">
            {headerSubtitle}
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5">
        {/* Already-answered badge */}
        {wasAnswered && (
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-[#EDFAF4] rounded-lg text-xs text-[#1B7A3C] mb-3 dark:bg-[#1B7A3C15]">
            <span className="text-sm">✓</span>
            <span className="font-[var(--font-dm-mono)] text-[11px]">
              You answered this on {new Date(existingResponse!.responded_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </span>
          </div>
        )}

        {/* Question */}
        <p className="text-[15px] font-semibold text-[#1A1A1A] mb-4 leading-relaxed dark:text-[#E2E0D8]">
          {question}
        </p>

        {/* MCQ Options */}
        {isMCQ && (
          <div className="flex flex-col gap-2">
            {options.map((opt, i) => {
              const isSelected = i === selectedIndex
              const isCorrectOption = opt.is_correct

              let containerStyle = 'border-[#E0DED8] cursor-pointer hover:border-[#3B5BD6] hover:bg-[#EEF3FD]'
              let letterStyle = 'border-[#E0DED8] text-[#3D3D3A]'

              if (isSubmitted) {
                if (isCorrectOption) {
                  containerStyle = 'border-[#1B7A3C] bg-[#EDFAF4] cursor-default'
                  letterStyle = 'bg-[#1B7A3C] text-white border-[#1B7A3C]'
                } else if (isSelected && !isCorrectOption) {
                  containerStyle = 'border-[#E63329] bg-[#FFF0EF] cursor-default'
                  letterStyle = 'bg-[#E63329] text-white border-[#E63329]'
                } else {
                  containerStyle = 'border-[#E0DED8] opacity-50 cursor-default'
                }
              }

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleMCQSelect(i)}
                  disabled={isSubmitted || isPending}
                  className={`flex items-start gap-3 px-4 py-3 border-[1.5px] rounded-[10px] transition-all duration-150 text-left text-sm text-[#3D3D3A] leading-[1.45] dark:text-[#C8C6C0] ${containerStyle}`}
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
              placeholder={placeholder || "Write your answer here. There is no single correct answer, but the explanation below will help you calibrate your thinking."}
              className="w-full min-h-[80px] px-3.5 py-3 border-[1.5px] border-[#E0DED8] rounded-[10px] font-sans text-sm text-[#1A1A1A] resize-y outline-none transition-colors duration-150 focus:border-[#1B3FC4] placeholder:text-[#A8A8A5] dark:bg-[#1A1A1A] dark:border-[#3A3835] dark:text-[#E2E0D8]"
            />
            <div className="flex justify-end mt-2.5">
              <button
                type="button"
                onClick={handleOpenSubmit}
                disabled={isPending}
                className="px-5 py-2 bg-[#1B3FC4] text-white border-none rounded-lg text-[13px] font-semibold font-sans transition-colors duration-150 hover:bg-[#3B5BD6] disabled:bg-[#A8A8A5] disabled:cursor-not-allowed"
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
            className="w-full min-h-[80px] px-3.5 py-3 border-[1.5px] border-[#E0DED8] rounded-[10px] font-sans text-sm text-[#1A1A1A] opacity-70 resize-none outline-none dark:bg-[#1A1A1A] dark:border-[#3A3835] dark:text-[#E2E0D8]"
          />
        )}

        {/* Reveal text */}
        {isRevealed && sanitizedAnswer && (
          <div className="mt-4 p-4 bg-[#F2F0EB] rounded-[10px] dark:bg-[#252420]">
            <div className="font-[var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.1em] text-[#1B3FC4] mb-1.5">
              Why This Matters
            </div>
            <div
              className="text-sm text-[#3D3D3A] leading-relaxed [&_strong]:font-semibold [&_strong]:text-[#1A1A1A] dark:text-[#C8C6C0] dark:[&_strong]:text-[#E2E0D8]"
              dangerouslySetInnerHTML={{ __html: sanitizedAnswer }}
            />
          </div>
        )}
      </div>
    </div>
  )
}

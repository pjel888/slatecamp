'use client'

import { useState } from 'react'
import { cn } from '@/lib/utils'
import type { ReviewQuestionData, QuestionHistoryStats } from '@/types/quiz-config'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ReviewCardProps {
  question: ReviewQuestionData
  historyStats?: QuestionHistoryStats
  defaultExpanded: boolean
}

// ─── Option annotation (inline) ───────────────────────────────────────────────

type OptionState = 'correct' | 'wrong-choice' | 'default'

const getOptionState = (
  option: ReviewQuestionData['options'][number],
  userWasWrong: boolean,
): OptionState => {
  if (option.isCorrect) return 'correct'
  if (option.isUserChoice && userWasWrong) return 'wrong-choice'
  return 'default'
}

const OPTION_BG: Record<OptionState, string> = {
  correct: 'bg-primary-50 border-primary',
  'wrong-choice': 'bg-warning-50 border-warning',
  default: 'bg-white border-border opacity-60',
}

const LETTER_BG: Record<OptionState, string> = {
  correct: 'bg-primary text-white',
  'wrong-choice': 'bg-warning text-white',
  default: 'bg-surface-light text-muted-foreground',
}

// ─── Correctness helpers ──────────────────────────────────────────────────────

const getCorrectnessInfo = (question: ReviewQuestionData) => {
  if (question.isSkipped) {
    return { icon: '\u2298', label: 'Skipped', colorClass: 'text-muted-foreground' }
  }
  if (question.isCorrect) {
    return { icon: '\u2713', label: 'Correct', colorClass: 'text-success' }
  }
  return { icon: '\u2192', label: 'Not quite', colorClass: 'text-warning' }
}

const getConfidenceLabel = (level: number | null): string | null => {
  if (level === 3) return 'Very sure'
  if (level === 2) return 'Somewhat sure'
  if (level === 1) return 'Guessing'
  return null
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ReviewCard = ({
  question,
  historyStats,
  defaultExpanded,
}: ReviewCardProps) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded)
  const info = getCorrectnessInfo(question)
  const userWasWrong = !question.isCorrect && !question.isSkipped
  const confidenceLabel = getConfidenceLabel(question.confidenceLevel)

  return (
    <div
      className="bg-white rounded-md border border-border overflow-hidden"
    >
      {/* ── Header (always visible, toggles expand) ─────────────────────────── */}
      <button
        type="button"
        onClick={() => setIsExpanded((prev) => !prev)}
        aria-expanded={isExpanded}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left',
          'hover:bg-surface-light transition-colors duration-150 ease-out',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
        )}
      >
        {/* Question number */}
        <span className="text-xs font-semibold text-text-secondary tabular-nums shrink-0">
          Q{question.position}
        </span>

        {/* Topic breadcrumb */}
        <span className="text-sm text-foreground truncate flex-1 min-w-0">
          {question.taxonomyBreadcrumb || question.stem.slice(0, 80)}
        </span>

        {/* Correctness badge */}
        <span
          className={cn(
            'text-xs font-semibold shrink-0 flex items-center gap-1',
            info.colorClass,
          )}
        >
          {info.icon} {info.label}
        </span>

        {/* Expand/collapse chevron */}
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={cn(
            'shrink-0 text-muted-foreground transition-transform duration-150 ease-out',
            isExpanded && 'rotate-180',
          )}
        >
          <path
            d="M4 6l4 4 4-4"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {/* ── Expanded body ───────────────────────────────────────────────────── */}
      {isExpanded && (
        <div className="border-t border-border">
          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* ── Left column: Question stem + metadata ─────────────────────── */}
            <div className="p-4 md:p-5 md:border-r md:border-border">
              {/* Topic breadcrumb */}
              {question.taxonomyBreadcrumb && (
                <p className="text-xs text-muted-foreground mb-2 leading-snug">
                  {question.taxonomyBreadcrumb}
                </p>
              )}

              {/* Question stem */}
              <p className="text-sm text-foreground leading-relaxed">
                {question.stem}
              </p>

              {/* Optional image */}
              {question.imageUrl && (
                <figure className="mt-3">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={question.imageUrl}
                    alt="Question illustration"
                    className="rounded-md max-w-full h-auto border border-border"
                  />
                </figure>
              )}

              {/* Confidence badge */}
              {confidenceLabel && (
                <div className="mt-3">
                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-sm bg-surface-light text-xs text-text-secondary">
                    Confidence: {confidenceLabel}
                  </span>
                </div>
              )}

              {/* Question history (Pro) — inline rendering */}
              {historyStats && historyStats.timesSeen > 1 && (
                <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                  <span>
                    Seen {historyStats.timesSeen}&times;:
                  </span>
                  <span className="text-success tabular-nums">
                    {'\u2713'}{historyStats.timesCorrect}
                  </span>
                  <span className="text-text-secondary tabular-nums">
                    {'\u2717'}{historyStats.timesWrong}
                  </span>
                </div>
              )}
            </div>

            {/* ── Right column: Annotated options + rationale ────────────────── */}
            <div className="p-4 md:p-5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                Answer Choices
              </p>

              <div className="flex flex-col gap-2" role="list" aria-label="Answer options">
                {question.options.map((option) => {
                  const state = getOptionState(option, userWasWrong)
                  return (
                    <div
                      key={option.id}
                      className={cn(
                        'flex items-start gap-3 rounded-md border px-3 py-2.5',
                        OPTION_BG[state],
                      )}
                      role="listitem"
                    >
                      <span
                        className={cn(
                          'flex-shrink-0 w-6 h-6 rounded-sm flex items-center justify-center',
                          'text-xs font-semibold',
                          LETTER_BG[state],
                        )}
                        aria-hidden="true"
                      >
                        {option.letter}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm text-foreground leading-relaxed">{option.text}</p>
                        {option.isCorrect && (
                          <p className="mt-1 text-xs font-medium text-primary flex items-center gap-1">
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                              <path d="M2 6l3 3 5-5" stroke="#1B3FC4" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                            Correct answer
                          </p>
                        )}
                        {state === 'wrong-choice' && (
                          <p className="mt-1 text-xs text-warning">{'\u2190'} You chose this</p>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Rationale */}
              {question.rationale && (
                <div className="mt-4 rounded-md border border-border bg-surface-light p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1.5">
                    Explanation
                  </p>
                  <p className="text-sm text-foreground leading-relaxed">{question.rationale}</p>

                  {!question.isCorrect && question.wrongAnswerExplanation && (
                    <div className="mt-2 border-t border-border pt-2">
                      <p className="text-xs font-semibold text-text-secondary mb-1">Why your answer was incorrect</p>
                      <p className="text-sm text-text-secondary leading-relaxed">{question.wrongAnswerExplanation}</p>
                    </div>
                  )}

                  {question.wikiArticleUrl && (
                    <a
                      href={question.wikiArticleUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-primary hover:text-primary-700 transition-colors duration-150"
                    >
                      Read reference article
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M2 8L8 2M8 2H4M8 2v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

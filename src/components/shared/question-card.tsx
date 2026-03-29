'use client'

import * as React from 'react'
import { useState } from 'react'
import { Check, X, BookmarkSimple, CaretDown } from '@phosphor-icons/react/dist/ssr'
import DOMPurify from 'isomorphic-dompurify'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

// ─── Types ──────────────────────────────────────────────────────────────────

interface QuestionOption {
  id: string
  label: string // "A", "B", "C", "D", "E"
  text: string
  isCorrect?: boolean // Only available in review/preview variants
}

interface QuestionCardProps {
  variant: 'quiz' | 'review' | 'preview' | 'compact'
  stem: string // Question text (may contain HTML/markdown)
  options: QuestionOption[]
  // Quiz variant state
  selectedOptionId?: string | null
  onSelectOption?: (optionId: string) => void
  submitted?: boolean // Has the answer been submitted/checked
  // Review variant
  userAnswerId?: string // What the user picked
  correctAnswerId?: string // Correct answer
  rationale?: string // Explanation text
  // Preview variant
  metadata?: {
    difficulty?: number | string
    aleId?: string
    topicName?: string
    status?: string
  }
  // Compact variant
  truncateStem?: number // Max chars for stem, default 120
  // Shared
  questionNumber?: number
  totalQuestions?: number
  flagged?: boolean
  onFlag?: () => void
  className?: string
}

// ─── Option state derivation ────────────────────────────────────────────────

type DerivedOptionState = 'default' | 'hover' | 'selected' | 'correct' | 'incorrect' | 'faded'

const deriveOptionState = (
  optionId: string,
  variant: QuestionCardProps['variant'],
  selectedOptionId?: string | null,
  submitted?: boolean,
  userAnswerId?: string,
  correctAnswerId?: string,
  optionIsCorrect?: boolean,
): DerivedOptionState => {
  // Preview: highlight correct answer only
  if (variant === 'preview') {
    return optionIsCorrect ? 'correct' : 'default'
  }

  // Review: always show submitted state
  if (variant === 'review') {
    if (optionId === correctAnswerId) return 'correct'
    if (optionId === userAnswerId && optionId !== correctAnswerId) return 'incorrect'
    return 'faded'
  }

  // Quiz: depends on submission state
  if (variant === 'quiz') {
    if (submitted) {
      if (optionIsCorrect) return 'correct'
      if (optionId === selectedOptionId && !optionIsCorrect) return 'incorrect'
      return 'faded'
    }
    if (optionId === selectedOptionId) return 'selected'
    return 'default'
  }

  return 'default'
}

// ─── Difficulty badge helper ────────────────────────────────────────────────

const difficultyDisplay = (difficulty: number | string) => {
  if (typeof difficulty === 'string') return difficulty
  if (difficulty <= 0.3) return 'Easy'
  if (difficulty <= 0.7) return 'Medium'
  return 'Hard'
}

const difficultyVariant = (difficulty: number | string): 'default' | 'secondary' | 'destructive' => {
  if (typeof difficulty === 'string') {
    const lower = difficulty.toLowerCase()
    if (lower === 'easy') return 'secondary'
    if (lower === 'hard') return 'destructive'
    return 'default'
  }
  if (difficulty <= 0.3) return 'secondary'
  if (difficulty <= 0.7) return 'default'
  return 'destructive'
}

// ─── Status badge variant ───────────────────────────────────────────────────

const statusVariant = (status: string): 'default' | 'secondary' | 'outline' => {
  const lower = status.toLowerCase()
  if (lower === 'active' || lower === 'published') return 'default'
  if (lower === 'draft') return 'outline'
  return 'secondary'
}

// ─── Letter circle component ────────────────────────────────────────────────

const LetterCircle = ({
  label,
  state,
}: {
  label: string
  state: DerivedOptionState
}) => (
  <div
    aria-hidden
    className={cn(
      'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium shrink-0 transition-colors duration-150',
      state === 'default' && 'bg-muted text-muted-foreground',
      state === 'selected' && 'bg-primary text-primary-foreground',
      state === 'correct' && 'bg-emerald text-white',
      state === 'incorrect' && 'bg-destructive text-white',
      state === 'faded' && 'bg-muted text-muted-foreground',
    )}
  >
    {state === 'correct' ? <Check size={16} /> : null}
    {state === 'incorrect' ? <X size={16} /> : null}
    {state !== 'correct' && state !== 'incorrect' ? label : null}
  </div>
)

// ─── Option row component ───────────────────────────────────────────────────

const OptionRow = ({
  option,
  state,
  interactive,
  onSelect,
}: {
  option: QuestionOption
  state: DerivedOptionState
  interactive: boolean
  onSelect?: () => void
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!interactive || !onSelect) return
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      onSelect()
    }
  }

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      aria-pressed={state === 'selected' ? true : undefined}
      aria-label={`Option ${option.label}: ${option.text}`}
      onClick={interactive ? onSelect : undefined}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex items-start gap-3 p-3 rounded-lg border transition-all duration-150',
        'outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1',

        // Default
        state === 'default' && [
          'bg-card border-border',
          interactive && 'cursor-pointer hover:bg-muted/50 hover:border-border',
        ],

        // Selected (not submitted)
        state === 'selected' && 'bg-quiz-selected-bg border-quiz-selected-border cursor-pointer',

        // Submitted correct
        state === 'correct' && 'bg-quiz-correct-bg border-quiz-correct-border',

        // Submitted incorrect
        state === 'incorrect' && 'bg-quiz-wrong-bg border-quiz-wrong-border',

        // Faded (other options after submit)
        state === 'faded' && 'opacity-50 border-border bg-card',

        // Non-interactive post-submit
        !interactive && 'cursor-default',
      )}
    >
      <LetterCircle label={option.label} state={state} />
      <span className="text-sm leading-relaxed text-foreground pt-1">{option.text}</span>
    </div>
  )
}

// ─── Rationale section ──────────────────────────────────────────────────────

const RationaleSection = ({
  rationale,
  collapsible,
}: {
  rationale: string
  collapsible: boolean
}) => {
  const [isOpen, setIsOpen] = useState(!collapsible)

  if (collapsible) {
    return (
      <div className="mt-4">
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          <CaretDown
            className={cn(
              'h-3.5 w-3.5 transition-transform duration-150',
              isOpen && 'rotate-180',
            )}
          />
          {isOpen ? 'Hide rationale' : 'Show rationale'}
        </button>
        {isOpen && (
          <div
            className="bg-muted/30 rounded-lg p-4 mt-2 text-sm text-foreground leading-relaxed"
            dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rationale) }}
          />
        )}
      </div>
    )
  }

  return (
    <div
      className="bg-muted/30 rounded-lg p-4 mt-4 text-sm text-foreground leading-relaxed"
      dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(rationale) }}
    />
  )
}

// ─── Card header ────────────────────────────────────────────────────────────

const CardHeader = ({
  questionNumber,
  totalQuestions,
  flagged,
  onFlag,
}: {
  questionNumber?: number
  totalQuestions?: number
  flagged?: boolean
  onFlag?: () => void
}) => {
  if (!questionNumber && !onFlag) return null

  return (
    <div className="flex items-center justify-between mb-3">
      {questionNumber ? (
        <span className="text-xs font-medium text-muted-foreground">
          Q{questionNumber}
          {totalQuestions ? ` of ${totalQuestions}` : ''}
        </span>
      ) : (
        <span />
      )}
      {onFlag && (
        <button
          type="button"
          onClick={onFlag}
          aria-label={flagged ? 'Remove flag' : 'Flag question'}
          aria-pressed={flagged}
          className={cn(
            'p-1 rounded-sm transition-colors duration-150',
            flagged
              ? 'text-camp-orange hover:text-camp-orange/80'
              : 'text-muted-foreground hover:text-foreground',
          )}
        >
          <BookmarkSimple
            size={16}
            weight={flagged ? 'fill' : 'regular'}
          />
        </button>
      )}
    </div>
  )
}

// ─── Metadata bar (preview variant) ─────────────────────────────────────────

const MetadataBar = ({
  metadata,
}: {
  metadata: NonNullable<QuestionCardProps['metadata']>
}) => (
  <div className="flex flex-wrap items-center gap-2 mb-3">
    {metadata.difficulty != null && (
      <Badge variant={difficultyVariant(metadata.difficulty)}>
        {difficultyDisplay(metadata.difficulty)}
      </Badge>
    )}
    {metadata.status && (
      <Badge variant={statusVariant(metadata.status)}>
        {metadata.status}
      </Badge>
    )}
    {metadata.topicName && (
      <span className="text-xs text-muted-foreground">{metadata.topicName}</span>
    )}
    {metadata.aleId && (
      <span className="font-mono text-xs text-muted-foreground">{metadata.aleId}</span>
    )}
  </div>
)

// ─── Main QuestionCard component ────────────────────────────────────────────

const QuestionCard = ({
  variant,
  stem,
  options,
  selectedOptionId,
  onSelectOption,
  submitted,
  userAnswerId,
  correctAnswerId,
  rationale,
  metadata,
  truncateStem = 120,
  questionNumber,
  totalQuestions,
  flagged,
  onFlag,
  className,
}: QuestionCardProps) => {
  // ── Compact variant ───────────────────────────────────────────────────────
  if (variant === 'compact') {
    const plainStem = stem.replace(/<[^>]*>/g, '')
    const truncated = plainStem.length > truncateStem
      ? `${plainStem.slice(0, truncateStem)}...`
      : plainStem

    return (
      <div
        data-slot="question-card"
        className={cn(
          'flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3',
          className,
        )}
      >
        {questionNumber && (
          <span className="text-xs font-medium text-muted-foreground shrink-0 tabular-nums">
            Q{questionNumber}
          </span>
        )}
        <span className="text-sm text-foreground truncate flex-1">{truncated}</span>
        <div className="flex items-center gap-2 shrink-0">
          {metadata?.difficulty != null && (
            <Badge variant={difficultyVariant(metadata.difficulty)}>
              {difficultyDisplay(metadata.difficulty)}
            </Badge>
          )}
          {metadata?.status && (
            <Badge variant={statusVariant(metadata.status)}>
              {metadata.status}
            </Badge>
          )}
        </div>
      </div>
    )
  }

  // ── Full variants (quiz, review, preview) ─────────────────────────────────
  const isInteractive = variant === 'quiz' && !submitted
  const showRationale = rationale && (variant === 'review' || variant === 'preview')

  return (
    <div
      data-slot="question-card"
      className={cn(
        'rounded-lg border border-border bg-card',
        variant === 'preview' ? 'p-5' : 'p-4',
        className,
      )}
    >
      {/* Header */}
      <CardHeader
        questionNumber={questionNumber}
        totalQuestions={totalQuestions}
        flagged={flagged}
        onFlag={onFlag}
      />

      {/* Metadata (preview only) */}
      {variant === 'preview' && metadata && (
        <MetadataBar metadata={metadata} />
      )}

      {/* Stem */}
      <div
        className="text-sm leading-relaxed text-foreground mb-4"
        dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(stem) }}
      />

      {/* Options */}
      <div className="flex flex-col gap-2">
        {options.map((option) => {
          const state = deriveOptionState(
            option.id,
            variant,
            selectedOptionId,
            submitted,
            userAnswerId,
            correctAnswerId,
            option.isCorrect,
          )

          return (
            <OptionRow
              key={option.id}
              option={option}
              state={state}
              interactive={isInteractive}
              onSelect={
                isInteractive && onSelectOption
                  ? () => onSelectOption(option.id)
                  : undefined
              }
            />
          )
        })}
      </div>

      {/* Rationale */}
      {showRationale && (
        <RationaleSection
          rationale={rationale}
          collapsible={variant === 'review'}
        />
      )}
    </div>
  )
}

export { QuestionCard }
export type { QuestionCardProps, QuestionOption }

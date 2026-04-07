'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CaretDown, CaretUp, ArrowRight } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'
import type { ConfidenceMatrixResult, ConfidenceMatrixItem } from '@/lib/actions/quiz-v2/get-confidence-matrix'

// ─── Types ────────────────────────────────────────────────────────────────────

interface ConfidenceMatrixProps {
  matrix: ConfidenceMatrixResult
  sessionId: string
  mode: string
}

// ─── Quadrant config ──────────────────────────────────────────────────────────

interface QuadrantConfig {
  label: string
  description: string
  borderClass: string
  bgColor: string
  textColor: string
  items: ConfidenceMatrixItem[]
  linkable: boolean
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Deduplicate topic names, returning unique sorted names */
const getUniqueTopicNames = (items: ConfidenceMatrixItem[]): string[] => {
  const names = new Set<string>()
  for (const item of items) {
    if (item.topic_name) names.add(item.topic_name)
  }
  return [...names].sort()
}

// ─── Quadrant Cell ────────────────────────────────────────────────────────────

const QuadrantCell = ({
  config,
  sessionId,
  mode,
}: {
  config: QuadrantConfig
  sessionId: string
  mode: string
}) => {
  const topicNames = getUniqueTopicNames(config.items)
  const count = config.items.length
  const isEmpty = count === 0

  return (
    <div
      className={cn(
        'rounded-md border p-4 h-full flex flex-col',
        config.borderClass,
        config.bgColor,
      )}
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <p className={cn('text-sm font-semibold', config.textColor)}>
          {config.label}
        </p>
        <span
          className={cn(
            'flex-shrink-0 text-xs font-medium tabular-nums px-1.5 py-0.5 rounded-sm',
            isEmpty ? 'bg-surface-light text-muted-foreground' : `${config.bgColor} ${config.textColor}`,
          )}
        >
          {count}
        </span>
      </div>

      <p className="text-xs text-text-secondary leading-relaxed mb-2">
        {config.description}
      </p>

      {/* Content area — flex-1 so all cards fill equally */}
      <div className="flex-1">
        {!isEmpty ? (
          <div className="flex flex-wrap gap-1">
            {topicNames.map((name) => (
              <span
                key={name}
                className="inline-block text-[11px] leading-tight text-text-secondary bg-card/80 border border-border rounded-sm px-1.5 py-0.5"
              >
                {name}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-xs text-muted-foreground italic">
            No questions in this category.
          </p>
        )}
      </div>

      {/* Focused review link for Confident+Wrong quadrant — pinned to bottom */}
      {config.linkable && count > 0 && (
        <Link
          href={`/quiz/focused/setup?source=confidence&session=${sessionId}&mode=${mode}&filter=confident-wrong`}
          className={cn(
            'inline-flex items-center gap-1 mt-3 text-xs font-medium shrink-0',
            'text-primary hover:text-primary-700',
            'transition-colors duration-150 ease-out',
          )}
        >
          Review these topics
          <ArrowRight size={12} weight="bold" />
        </Link>
      )}
    </div>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export const ConfidenceMatrix = ({
  matrix,
  sessionId,
  mode,
}: ConfidenceMatrixProps) => {
  const [expanded, setExpanded] = useState(false)

  // Don't render if no confidence data was captured at all
  const totalItems =
    matrix.confidentCorrect.length +
    matrix.confidentWrong.length +
    matrix.guessingCorrect.length +
    matrix.guessingWrong.length +
    matrix.partlyCorrect.length +
    matrix.partlyWrong.length

  if (totalItems === 0) return null

  const quadrants: QuadrantConfig[] = [
    {
      label: 'Solid Knowledge',
      description: 'You knew it and you knew you knew it.',
      borderClass: 'border-success/30',
      bgColor: 'bg-success-50',
      textColor: 'text-success',
      items: matrix.confidentCorrect,
      linkable: false,
    },
    {
      label: 'Overconfident',
      description: 'These topics need attention — you thought you knew them but the data says otherwise.',
      borderClass: 'border-destructive/30',
      bgColor: 'bg-destructive-50',
      textColor: 'text-destructive',
      items: matrix.confidentWrong,
      linkable: true,
    },
    {
      label: 'Underconfident',
      description: 'You got it right but didn\'t trust yourself.',
      borderClass: 'border-warning/30',
      bgColor: 'bg-warning-50',
      textColor: 'text-warning',
      items: matrix.guessingCorrect,
      linkable: false,
    },
    {
      label: 'Known Gap',
      description: 'Honest self-assessment. These are areas to revisit.',
      borderClass: 'border-border',
      bgColor: 'bg-surface-light',
      textColor: 'text-text-secondary',
      items: matrix.guessingWrong,
      linkable: false,
    },
  ]

  // On mobile: collapsed by default, show summary + expand toggle
  // On desktop: always visible
  const summaryCount = matrix.confidentWrong.length
  const hasDangerItems = summaryCount > 0

  return (
    <section aria-label="Confidence diagnostic matrix">
      {/* Header + mobile toggle */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          Confidence Diagnostic
        </p>
        <button
          type="button"
          onClick={() => setExpanded((prev) => !prev)}
          className="md:hidden flex items-center gap-1 text-xs text-primary font-medium"
          aria-expanded={expanded}
          aria-controls="confidence-matrix-grid"
        >
          {expanded ? 'Collapse' : 'Expand'}
          {expanded ? (
            <CaretUp size={12} weight="bold" />
          ) : (
            <CaretDown size={12} weight="bold" />
          )}
        </button>
      </div>

      {/* Summary banner for mobile (always visible) */}
      {hasDangerItems && !expanded && (
        <div className="md:hidden bg-destructive-50 border border-destructive/20 rounded-md p-3 mb-3">
          <p className="text-xs text-destructive font-medium">
            {summaryCount} question{summaryCount !== 1 ? 's' : ''} answered confidently but incorrectly.
          </p>
        </div>
      )}

      {/* 2x2 grid — hidden on mobile unless expanded, always visible on md+ */}
      <div
        id="confidence-matrix-grid"
        className={cn(
          'grid grid-cols-1 sm:grid-cols-2 gap-3',
          expanded ? 'block' : 'hidden md:grid',
        )}
      >
        {quadrants.map((q) => (
          <QuadrantCell
            key={q.label}
            config={q}
            sessionId={sessionId}
            mode={mode}
          />
        ))}
      </div>

      {/* Partly sure breakdown — secondary, below the main 2x2 */}
      {(matrix.partlyCorrect.length > 0 || matrix.partlyWrong.length > 0) && (
        <div
          className={cn(
            'mt-3 grid grid-cols-1 sm:grid-cols-2 gap-3',
            expanded ? 'block' : 'hidden md:grid',
          )}
        >
          {matrix.partlyCorrect.length > 0 && (
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-xs font-medium text-text-secondary mb-1">
                Partly Sure + Correct
                <span className="ml-1 tabular-nums text-muted-foreground">
                  ({matrix.partlyCorrect.length})
                </span>
              </p>
              <div className="flex flex-wrap gap-1">
                {getUniqueTopicNames(matrix.partlyCorrect).map((name) => (
                  <span
                    key={name}
                    className="inline-block text-[11px] leading-tight text-text-secondary bg-surface-light border border-border rounded-sm px-1.5 py-0.5"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
          {matrix.partlyWrong.length > 0 && (
            <div className="rounded-md border border-border bg-card p-3">
              <p className="text-xs font-medium text-text-secondary mb-1">
                Partly Sure + Wrong
                <span className="ml-1 tabular-nums text-muted-foreground">
                  ({matrix.partlyWrong.length})
                </span>
              </p>
              <div className="flex flex-wrap gap-1">
                {getUniqueTopicNames(matrix.partlyWrong).map((name) => (
                  <span
                    key={name}
                    className="inline-block text-[11px] leading-tight text-text-secondary bg-surface-light border border-border rounded-sm px-1.5 py-0.5"
                  >
                    {name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  )
}

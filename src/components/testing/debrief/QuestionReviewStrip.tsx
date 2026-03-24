'use client'

import { useState } from 'react'
import { Check, X, Flag } from 'lucide-react'
import type { QuestionReviewItem } from '@/types/testing'
import { ERROR_TAG_LABELS } from '@/types/testing'

// ─── Types ────────────────────────────────────────────────────────────────────

interface QuestionReviewStripProps {
  items: QuestionReviewItem[]
  onRetryWrong: () => void
}

// ─── Tile ─────────────────────────────────────────────────────────────────────

interface TileProps {
  item: QuestionReviewItem
  index: number
  isSelected: boolean
  onClick: () => void
}

const QuestionTile = ({ item, index, isSelected, onClick }: TileProps) => {
  const bg = item.isCorrect ? 'var(--success)' : 'var(--destructive)'
  const borderStyle = item.isFlagged
    ? `2px solid var(--warning)`
    : `2px solid transparent`

  return (
    <button
      onClick={onClick}
      aria-label={`Question ${index + 1}: ${item.isCorrect ? 'Correct' : 'Incorrect'}${item.isFlagged ? ', flagged' : ''}`}
      aria-pressed={isSelected}
      className="flex-shrink-0 flex items-center justify-center rounded-sm transition-transform duration-150 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1"
      style={{
        width: 44,
        height: 44,
        backgroundColor: bg,
        border: borderStyle,
        transform: isSelected ? 'scale(1.1)' : 'scale(1)',
        boxShadow: isSelected ? '0 0 0 2px var(--foreground)' : 'none',
      }}
    >
      {item.isCorrect ? (
        <Check className="text-white" style={{ width: 12, height: 12 }} aria-hidden="true" />
      ) : (
        <X className="text-white" style={{ width: 12, height: 12 }} aria-hidden="true" />
      )}
    </button>
  )
}

// ─── Detail Panel ─────────────────────────────────────────────────────────────

const DetailPanel = ({ item }: { item: QuestionReviewItem }) => {
  const timeSeconds = Math.round(item.timeSpentMs / 1000)

  return (
    <div className="mt-3 bg-card rounded-lg border border-border p-4 space-y-3">
      {/* Question text */}
      <p
        className="text-sm line-clamp-2"
        style={{ color: 'var(--foreground)' }}
      >
        {item.questionText}
      </p>

      {/* Your answer */}
      {item.selectedOptionId ? (
        <div className="text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>You chose: </span>
          <span
            style={{
              color: item.isCorrect ? 'var(--success)' : 'var(--destructive)',
              fontWeight: 500,
            }}
          >
            {item.selectedOptionText ?? '—'}
          </span>
        </div>
      ) : (
        <p className="text-sm" style={{ color: 'var(--muted-foreground)' }}>
          Not answered
        </p>
      )}

      {/* Correct answer (only if wrong) */}
      {!item.isCorrect && (
        <div className="text-sm">
          <span style={{ color: 'var(--text-secondary)' }}>Correct: </span>
          <span style={{ color: 'var(--success)', fontWeight: 500 }}>
            {item.correctOptionText}
          </span>
        </div>
      )}

      {/* Footer row */}
      <div className="flex flex-wrap items-center gap-3 pt-1">
        {/* Time */}
        <span
          className="text-xs"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Took{' '}
          <span className="font-mono">{timeSeconds}</span>s
        </span>

        {/* Flagged indicator */}
        {item.isFlagged && (
          <span
            className="flex items-center gap-1 text-xs"
            style={{ color: 'var(--warning)' }}
          >
            <Flag style={{ width: 12, height: 12 }} aria-hidden="true" />
            Flagged
          </span>
        )}

        {/* Error tags */}
        {item.errorTags.map(tag => (
          <span
            key={tag}
            className="text-xs rounded-sm px-1.5 py-0.5"
            style={{
              backgroundColor: 'var(--quiz-wrong-bg)',
              color: 'var(--destructive)',
            }}
          >
            {ERROR_TAG_LABELS[tag]}
          </span>
        ))}

        {/* Code citation */}
        {item.codeCitation && (
          <span
            className="font-mono text-[11px]"
            style={{ color: 'var(--muted-foreground)' }}
          >
            {item.codeCitation}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export const QuestionReviewStrip = ({ items, onRetryWrong }: QuestionReviewStripProps) => {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)

  const handleTileClick = (index: number) => {
    setSelectedIndex(prev => (prev === index ? null : index))
  }

  const selectedItem = selectedIndex !== null ? items[selectedIndex] : null

  return (
    <div>
      {/* Section label */}
      <p
        className="mb-3 text-[11px] font-medium uppercase tracking-widest"
        style={{ color: 'var(--muted-foreground)' }}
      >
        Question Review
      </p>

      {/* Scrollable tile strip */}
      <div
        className="overflow-x-auto pb-2"
        role="list"
        aria-label="Question results"
      >
        <div className="flex gap-1.5" style={{ minWidth: 'max-content' }}>
          {items.map((item, idx) => (
            <div key={item.questionId} role="listitem">
              <QuestionTile
                item={item}
                index={idx}
                isSelected={selectedIndex === idx}
                onClick={() => handleTileClick(idx)}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Hint text or detail panel */}
      {selectedItem ? (
        <DetailPanel item={selectedItem} />
      ) : (
        <p
          className="mt-2 text-[13px]"
          style={{ color: 'var(--muted-foreground)' }}
        >
          Tap a question to review it
        </p>
      )}
    </div>
  )
}

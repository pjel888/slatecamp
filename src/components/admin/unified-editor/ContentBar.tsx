'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useDirtyState } from './DirtyStateProvider'

// ─── Props ───────────────────────────────────────────────────

interface ContentBarProps {
  title: string
  onTitleChange: (val: string) => void
  aleId: string | null
  status: string
  onStatusChange: (val: string) => void
  difficultyLabel: string
  onDifficultyLabelChange: (val: string) => void
  questionsCount: number
  isSaving: boolean
  saveError: string | null
}

// ─── Helpers ─────────────────────────────────────────────────

const STATUS_STYLES: Record<string, string> = {
  draft: 'bg-[#FEF8ED] text-[#D4951A]',
  review: 'bg-[#FEF8ED] text-[#D4951A]',
  published: 'bg-[#EDFAF4] text-[#2D9F6F]',
}

const Divider = () => <div className="h-4 w-px bg-[#D4DAE3]" />

const dispatchSave = () => {
  window.dispatchEvent(new CustomEvent('unified-editor:save'))
}

// ─── Component ───────────────────────────────────────────────

export const ContentBar = ({
  title,
  onTitleChange,
  aleId,
  status,
  onStatusChange,
  difficultyLabel,
  onDifficultyLabelChange,
  questionsCount,
  isSaving,
  saveError,
}: ContentBarProps) => {
  const dirty = useDirtyState()

  // ── Cmd+S / Ctrl+S global shortcut ─────────────────────────
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 's') {
      e.preventDefault()
      dispatchSave()
    }
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  return (
    <div className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center gap-3 border-b border-[#D4DAE3] bg-white px-4">
      {/* 1. Back link */}
      <Link
        href="/admin/articles"
        className="whitespace-nowrap text-xs text-[#4A5568] transition-colors duration-150 ease-out hover:text-[#1A2332]"
      >
        &larr; Back to Articles
      </Link>

      <Divider />

      {/* 3. Title inline input */}
      <input
        type="text"
        value={title}
        onChange={(e) => onTitleChange(e.target.value)}
        placeholder="Article title..."
        className="min-w-0 flex-1 truncate border-0 bg-transparent text-sm font-semibold text-[#1A2332] outline-none ring-0 transition-colors duration-150 ease-out placeholder:text-[#8896A7] focus:ring-1 focus:ring-[#1B3FC4]/30"
      />

      <Divider />

      {/* 5. ALE ID badge */}
      {aleId ? (
        <span className="whitespace-nowrap font-mono text-[11px] text-[#8896A7]">
          {aleId}
        </span>
      ) : (
        <span className="whitespace-nowrap rounded-sm bg-[#FEF8ED] px-2 py-0.5 text-[11px] font-medium text-[#D4951A]">
          No topic linked
        </span>
      )}

      <Divider />

      {/* 7. Status dropdown */}
      <select
        value={status}
        onChange={(e) => onStatusChange(e.target.value)}
        className={`cursor-pointer rounded-sm border-0 px-2 py-1 text-xs font-medium transition-colors duration-150 ease-out focus:outline-none focus:ring-1 focus:ring-[#1B3FC4]/30 ${STATUS_STYLES[status] ?? STATUS_STYLES.draft}`}
      >
        <option value="draft">Draft</option>
        <option value="review">Review</option>
        <option value="published">Published</option>
      </select>

      <Divider />

      {/* 9. Difficulty dropdown */}
      <select
        value={difficultyLabel}
        onChange={(e) => onDifficultyLabelChange(e.target.value)}
        className="cursor-pointer rounded-sm border border-[#D4DAE3] bg-transparent px-2 py-1 text-xs text-[#4A5568] transition-colors duration-150 ease-out focus:outline-none focus:ring-1 focus:ring-[#1B3FC4]/30"
      >
        <option value="">No difficulty</option>
        <option value="Foundational">Foundational</option>
        <option value="Intermediate">Intermediate</option>
        <option value="Advanced">Advanced</option>
      </select>

      <Divider />

      {/* 11. Questions count */}
      <span className="whitespace-nowrap text-xs text-[#8896A7]">
        {questionsCount} question{questionsCount !== 1 ? 's' : ''}
      </span>

      {/* 12. Unsaved indicator */}
      {dirty.isAnythingDirty && (
        <span className="flex items-center gap-1 whitespace-nowrap text-xs text-[#D4951A]">
          <span aria-hidden="true">&#9679;</span>
          Unsaved changes
        </span>
      )}

      {/* 13. Flexible spacer */}
      <div className="flex-1" />

      {/* 14. Discard button */}
      <button
        type="button"
        onClick={() => window.location.reload()}
        className="rounded-sm border border-[#D4DAE3] bg-transparent px-3 py-1.5 text-xs text-[#4A5568] transition-colors duration-150 ease-out hover:border-[#8896A7] hover:text-[#1A2332]"
      >
        Discard
      </button>

      {/* 15. Save All button */}
      <button
        type="button"
        onClick={dispatchSave}
        disabled={isSaving}
        className="inline-flex items-center gap-1.5 rounded-sm bg-[#1B3FC4] px-4 py-1.5 text-xs font-semibold text-white transition-colors duration-150 ease-out hover:bg-[#1535A8] disabled:opacity-60"
      >
        {isSaving && (
          <svg
            className="h-3 w-3 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        )}
        Save All
      </button>
    </div>
  )
}

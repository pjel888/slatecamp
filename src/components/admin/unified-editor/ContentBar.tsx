'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { useDirtyState } from './DirtyStateProvider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'

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
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger
          size="sm"
          className={`border-0 font-medium ${STATUS_STYLES[status] ?? STATUS_STYLES.draft}`}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="draft">Draft</SelectItem>
          <SelectItem value="review">Review</SelectItem>
          <SelectItem value="published">Published</SelectItem>
        </SelectContent>
      </Select>

      <Divider />

      {/* 9. Difficulty dropdown */}
      <Select value={difficultyLabel} onValueChange={onDifficultyLabelChange}>
        <SelectTrigger size="sm">
          <SelectValue placeholder="No difficulty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">No difficulty</SelectItem>
          <SelectItem value="Foundational">Foundational</SelectItem>
          <SelectItem value="Intermediate">Intermediate</SelectItem>
          <SelectItem value="Advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>

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
      <Button
        variant="secondary"
        size="sm"
        onClick={() => window.location.reload()}
      >
        Discard
      </Button>

      {/* 15. Save All button */}
      <Button
        size="sm"
        onClick={dispatchSave}
        disabled={isSaving}
        loading={isSaving}
      >
        Save All
      </Button>
    </div>
  )
}

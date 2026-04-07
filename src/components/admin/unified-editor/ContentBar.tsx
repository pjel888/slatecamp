'use client'

import { useEffect, useCallback } from 'react'
import Link from 'next/link'
import { ArrowLeft, PencilSimple, CircleDashed, Clock, CheckCircle } from '@phosphor-icons/react/dist/ssr'
import { useDirtyState } from './DirtyStateProvider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

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

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; colorClass: string }> = {
  draft: { 
    label: 'Draft', 
    icon: <CircleDashed className="w-3.5 h-3.5" />, 
    colorClass: 'bg-muted text-text-secondary border border-border' 
  },
  review: { 
    label: 'In Review', 
    icon: <Clock className="w-3.5 h-3.5" />, 
    colorClass: 'bg-warning-50 text-warning border border-warning/30' 
  },
  published: { 
    label: 'Published', 
    icon: <CheckCircle className="w-3.5 h-3.5" weight="fill" />, 
    colorClass: 'bg-success-50 text-emerald border border-emerald/30' 
  },
}

const Divider = () => <div className="h-5 w-px bg-border/60 mx-1" />

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

  const currentStatus = STATUS_CONFIG[status] || STATUS_CONFIG.draft

  return (
    <div className="sticky top-0 z-30 flex h-16 w-full shrink-0 items-center gap-3 border-b border-border bg-card px-4">
      {/* 1. Back link */}
      <Link
        href="/admin/knowledge"
        className="flex items-center justify-center w-8 h-8 rounded-md text-text-secondary hover:bg-surface-light hover:text-text-primary transition-colors"
        title="Back to Articles"
      >
        <ArrowLeft className="w-4 h-4" />
      </Link>

      <Divider />

      {/* 3. Title inline input */}
      <div className="flex-1 min-w-0 pr-4 group relative flex items-center">
        <input
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          placeholder="Untitled Article..."
          className="w-full bg-transparent text-[17px] font-bold text-text-primary placeholder:text-text-tertiary focus:outline-none border-b border-transparent focus:border-border transition-colors truncate pb-0.5"
        />
        <PencilSimple className="w-4 h-4 text-text-tertiary absolute right-0 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      </div>

      <Divider />

      {/* 5. ALE ID badge */}
      {aleId ? (
        <span className="whitespace-nowrap font-mono text-[11px] text-text-tertiary" title="Linked Subject Node">
          {aleId}
        </span>
      ) : (
        <span className="whitespace-nowrap rounded-sm bg-warning-50 px-2 py-0.5 text-[11px] font-medium text-warning">
          No topic linked
        </span>
      )}

      {/* 11. Questions count */}
      <span className="whitespace-nowrap font-[family-name:var(--font-dm-mono)] text-[11px] text-text-tertiary px-2 tabular-nums" title="Questions & Assessments">
        {questionsCount} Qs
      </span>

      <Divider />

      {/* 7. Status dropdown */}
      <Select value={status} onValueChange={onStatusChange}>
        <SelectTrigger
          className={cn(
            'h-8 space-x-2 px-3 text-xs font-semibold focus:ring-0 rounded-full shadow-none',
            currentStatus.colorClass
          )}
        >
          <div className="flex items-center gap-1.5">
            {currentStatus.icon}
            <span>{currentStatus.label}</span>
          </div>
        </SelectTrigger>
        <SelectContent align="end" sideOffset={4} alignItemWithTrigger={false}>
          {Object.entries(STATUS_CONFIG).map(([key, config]) => (
            <SelectItem key={key} value={key}>
              <div className="flex items-center gap-2">
                {config.icon}
                <span>{config.label}</span>
              </div>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* 9. Difficulty dropdown */}
      <Select value={difficultyLabel} onValueChange={onDifficultyLabelChange}>
        <SelectTrigger className="h-8 w-[120px] text-xs focus:ring-0 bg-surface-light border-border">
          <SelectValue placeholder="No difficulty" />
        </SelectTrigger>
        <SelectContent align="end" sideOffset={4} alignItemWithTrigger={false}>
          <SelectItem value="none">
            <span className="text-text-secondary">No difficulty</span>
          </SelectItem>
          <SelectItem value="Foundational">Foundational</SelectItem>
          <SelectItem value="Intermediate">Intermediate</SelectItem>
          <SelectItem value="Advanced">Advanced</SelectItem>
        </SelectContent>
      </Select>

      {/* 12. Unsaved indicator */}
      {dirty.isAnythingDirty && (
        <span className="flex items-center shrink-0 ml-1">
          <span className="w-2 h-2 rounded-full bg-warning animate-pulse" title="Unsaved changes" />
        </span>
      )}

      {/* 14. Discard button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={() => window.location.reload()}
        className="ml-2 h-8 text-xs px-3 text-text-secondary hover:text-text-primary"
      >
        Discard
      </Button>

      {/* 15. Save All button */}
      <Button
        size="sm"
        onClick={dispatchSave}
        disabled={isSaving}
        className="h-8 px-4 text-xs font-semibold shadow-sm"
      >
        {isSaving ? 'Saving...' : 'Save All'}
      </Button>
    </div>
  )
}

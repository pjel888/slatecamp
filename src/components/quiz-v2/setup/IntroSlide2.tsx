'use client'

import { useState, useMemo } from 'react'
import { MagnifyingGlass, CaretDown, CaretUp } from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { QuizMode, TaxonomySubject, TaxonomySubtopic } from '@/types/quiz-config'

// ─── Mastery helpers ──────────────────────────────────────────────────────────

const masteryColor = (w: number | null): string => {
  if (w === null) return 'var(--muted-foreground)'
  if (w >= 0.7) return 'var(--success)'
  if (w >= 0.4) return 'var(--warning)'
  return 'var(--muted-foreground)'
}

const masteryPct = (w: number | null): number => (w === null ? 0 : Math.round(w * 100))

// ─── Loading skeleton ─────────────────────────────────────────────────────────

const Skeleton = () => (
  <div className="space-y-2" aria-busy="true" aria-label="Loading topics">
    {[1, 2, 3, 4].map((i) => (
      <div key={i} className="rounded-md border border-border bg-white p-4 animate-pulse">
        <div className="flex items-center gap-3">
          <div className="h-4 w-4 rounded-[3px] bg-border" />
          <div className="flex-1 h-3 rounded bg-border" style={{ width: `${40 + i * 12}%` }} />
        </div>
      </div>
    ))}
  </div>
)

// ─── Subject row ──────────────────────────────────────────────────────────────

interface SubjectRowProps {
  subject: TaxonomySubject
  selected: Set<string>
  onToggleTopic: (id: string) => void
  onToggleSubject: (subject: TaxonomySubject) => void
  defaultExpanded: boolean
}

const SubjectRow = ({ subject, selected, onToggleTopic, onToggleSubject, defaultExpanded }: SubjectRowProps) => {
  const [expanded, setExpanded] = useState(defaultExpanded)

  const leafIds = useMemo(
    () => subject.subtopics.length > 0
      ? subject.subtopics.map((s) => s.nodeId)
      : [subject.nodeId],
    [subject],
  )
  const allSelected = leafIds.every((id) => selected.has(id))
  const someSelected = leafIds.some((id) => selected.has(id))
  const color = masteryColor(subject.masteryWeight)
  const pct = masteryPct(subject.masteryWeight)

  return (
    <div className="rounded-md border border-border bg-white overflow-hidden">
      {/* Subject header */}
      <div className="flex items-center gap-3 px-4 py-3 bg-surface-light">
        {/* Checkbox */}
        <button
          type="button"
          onClick={() => onToggleSubject(subject)}
          aria-label={allSelected ? `Deselect all ${subject.name} topics` : `Select all ${subject.name} topics`}
          aria-checked={allSelected ? true : someSelected ? 'mixed' : false}
          role="checkbox"
          className={cn(
            'h-4 w-4 shrink-0 rounded-[3px] border transition-colors duration-150',
            allSelected
              ? 'bg-primary border-primary'
              : someSelected
                ? 'bg-primary-50 border-primary'
                : 'bg-white border-border hover:border-primary/50',
          )}
        >
          {allSelected && (
            <svg viewBox="0 0 12 12" className="w-full h-full p-[2px]" aria-hidden="true">
              <polyline points="1.5,6 5,9.5 10.5,2.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {!allSelected && someSelected && (
            <svg viewBox="0 0 12 12" className="w-full h-full p-[2px]" aria-hidden="true">
              <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>

        {/* Expand toggle */}
        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="flex-1 flex items-center gap-3 text-left focus-visible:outline-none min-w-0"
          aria-expanded={expanded}
          aria-controls={`subject-topics-${subject.nodeId}`}
          disabled={subject.subtopics.length === 0}
        >
          <span className="text-[13px] font-medium text-foreground truncate">{subject.name}</span>

          {/* Mastery bar + pct */}
          <span className="ml-auto flex items-center gap-2 shrink-0">
            <span className="w-16 h-1 rounded-full bg-border overflow-hidden" aria-hidden="true">
              <span
                className="h-full rounded-full block transition-all duration-150"
                style={{ width: `${pct}%`, backgroundColor: color }}
              />
            </span>
            <span
              className="text-[11px] font-mono tabular-nums"
              style={{ color, minWidth: '28px', textAlign: 'right' }}
              aria-label={`${pct}% mastery`}
            >
              {subject.interactionCount > 0 ? `${pct}%` : '—'}
            </span>
            {subject.subtopics.length > 0 && (
              expanded
                ? <CaretUp className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
                : <CaretDown className="h-3.5 w-3.5 text-muted-foreground shrink-0" aria-hidden="true" />
            )}
          </span>
        </button>
      </div>

      {/* Subtopic chips */}
      {expanded && subject.subtopics.length > 0 && (
        <div id={`subject-topics-${subject.nodeId}`} className="flex flex-wrap gap-2 px-4 py-3">
          {subject.subtopics.map((sub) => {
            const isSelected = selected.has(sub.nodeId)
            const isWeak = sub.masteryWeight !== null && sub.masteryWeight < 0.4
            return (
              <button
                key={sub.nodeId}
                type="button"
                onClick={() => onToggleTopic(sub.nodeId)}
                aria-pressed={isSelected}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-medium',
                  'border transition-all duration-150 ease-out',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 focus-visible:ring-offset-1',
                  isSelected
                    ? 'bg-primary-50 border-primary text-primary'
                    : 'bg-white border-border text-text-secondary hover:border-primary/40',
                )}
              >
                {sub.name}
                {isWeak && (
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-warning shrink-0"
                    title="Developing skill"
                    aria-label="developing skill"
                  />
                )}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

// ─── Focused pre-selection: subjects with mastery < 0.70 ─────────────────────

const getFocusedIds = (subjects: TaxonomySubject[]): string[] =>
  subjects.flatMap((s) => {
    const leafIds = s.subtopics.length > 0 ? s.subtopics.map((st) => st.nodeId) : [s.nodeId]
    const isFocused = s.masteryWeight === null || s.masteryWeight < 0.7
    return isFocused ? leafIds : []
  })

// ─── Props ────────────────────────────────────────────────────────────────────

interface IntroSlide2Props {
  mode: QuizMode
  subjects?: TaxonomySubject[]
  initialSelected?: string[]
  onContinue: (selectedTopicIds: string[]) => void
}

// ─── IntroSlide2 ──────────────────────────────────────────────────────────────

const IntroSlide2 = ({ mode, subjects, initialSelected, onContinue }: IntroSlide2Props) => {
  const allLeafIds = useMemo<string[]>(
    () => (subjects ?? []).flatMap((s) =>
      s.subtopics.length > 0 ? s.subtopics.map((st) => st.nodeId) : [s.nodeId],
    ),
    [subjects],
  )

  const focusedIds = useMemo(
    () => subjects ? getFocusedIds(subjects) : [],
    [subjects],
  )

  const defaultSelected = useMemo<Set<string>>(() => {
    if (initialSelected) return new Set(initialSelected)
    if (mode === 'focused') return new Set(focusedIds)
    return new Set(allLeafIds)
  }, [mode, allLeafIds, focusedIds, initialSelected])

  const [selected, setSelected] = useState<Set<string>>(defaultSelected)
  const [query, setQuery] = useState('')

  const filteredSubjects = useMemo<TaxonomySubject[]>(() => {
    if (!subjects) return []
    if (!query.trim()) return subjects
    const q = query.toLowerCase()
    return subjects
      .filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.subtopics.some((st) => st.name.toLowerCase().includes(q)),
      )
      .map((s) => ({
        ...s,
        subtopics: s.subtopics.filter(
          (st) => !query.trim() || st.name.toLowerCase().includes(q) || s.name.toLowerCase().includes(q),
        ),
      }))
  }, [subjects, query])

  const allSelected = allLeafIds.length > 0 && selected.size === allLeafIds.length

  const toggleTopic = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(allLeafIds))
  }

  const toggleSubject = (subject: TaxonomySubject) => {
    const ids = subject.subtopics.length > 0
      ? subject.subtopics.map((st) => st.nodeId)
      : [subject.nodeId]
    const allSubjectSelected = ids.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allSubjectSelected) ids.forEach((id) => next.delete(id))
      else ids.forEach((id) => next.add(id))
      return next
    })
  }

  const handleContinue = () => onContinue(Array.from(selected))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-[12px] font-medium uppercase tracking-wide text-muted-foreground mb-1">
          Step 2 — Topics
        </p>
        <h2 className="text-[17px] font-semibold text-foreground">Choose your topics</h2>
        {mode === 'focused' && (
          <p className="text-[13px] text-warning mt-1">
            Developing skills pre-selected based on your history.
          </p>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlass
          className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search topics…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-sm border border-border bg-white pl-8 pr-3 py-2 text-[13px] text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-colors duration-150"
          aria-label="Search topics"
        />
      </div>

      {/* Loading skeleton */}
      {!subjects && <Skeleton />}

      {/* All-topics toggle (only when loaded) */}
      {subjects && (
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={toggleAll}
            className="text-[12px] font-medium text-primary hover:text-primary-700 transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
            aria-label={allSelected ? 'Deselect all topics' : 'Select all topics'}
          >
            {allSelected ? 'Deselect all' : 'Select all'}
          </button>
          <span className="text-[12px] text-muted-foreground">
            {selected.size} of {allLeafIds.length} subtopics selected
          </span>
        </div>
      )}

      {/* Subject rows */}
      {subjects && (
        <div className="space-y-2">
          {filteredSubjects.map((subject) => (
            <SubjectRow
              key={subject.nodeId}
              subject={subject}
              selected={selected}
              onToggleTopic={toggleTopic}
              onToggleSubject={toggleSubject}
              defaultExpanded={mode === 'focused'}
            />
          ))}
          {filteredSubjects.length === 0 && (
            <p className="text-[13px] text-muted-foreground text-center py-6">
              No topics match your search.
            </p>
          )}
        </div>
      )}

      {/* Continue */}
      <Button
        variant="default"
        size="lg"
        fullWidth
        onClick={handleContinue}
        disabled={selected.size === 0 || !subjects}
        className="rounded-sm"
      >
        Continue with {selected.size} subtopic{selected.size !== 1 ? 's' : ''}
      </Button>
    </div>
  )
}

IntroSlide2.displayName = 'IntroSlide2'

export { IntroSlide2 }

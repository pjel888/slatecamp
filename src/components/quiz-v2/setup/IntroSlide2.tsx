'use client'

import { useState, useMemo } from 'react'
import { MagnifyingGlass, CaretDown, CaretUp } from '@phosphor-icons/react/dist/ssr'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { QuizMode } from '@/types/quiz-config'

// ─── Topic data ───────────────────────────────────────────────────────────────
// Placeholder structure: 3 areas (A, B, C) with topics per area.
// In production these would be fetched/passed as props.

export interface TopicItem {
  id: string
  label: string
  /** Relative weakness score 0–1 (1 = strongest weakness) */
  weaknessScore?: number
}

export interface SubjectArea {
  id: string
  label: string
  topics: TopicItem[]
}

const DEFAULT_AREAS: SubjectArea[] = [
  {
    id: 'area-a',
    label: 'Area A — Project Management',
    topics: [
      { id: 'a1', label: 'Scope & Integration', weaknessScore: 0.85 },
      { id: 'a2', label: 'Schedule Management', weaknessScore: 0.6 },
      { id: 'a3', label: 'Cost Management', weaknessScore: 0.4 },
      { id: 'a4', label: 'Risk Management', weaknessScore: 0.75 },
      { id: 'a5', label: 'Procurement', weaknessScore: 0.3 },
    ],
  },
  {
    id: 'area-b',
    label: 'Area B — Technical Practice',
    topics: [
      { id: 'b1', label: 'Structural Systems', weaknessScore: 0.5 },
      { id: 'b2', label: 'Mechanical & Electrical', weaknessScore: 0.9 },
      { id: 'b3', label: 'Building Enclosure', weaknessScore: 0.65 },
      { id: 'b4', label: 'Accessibility', weaknessScore: 0.2 },
      { id: 'b5', label: 'Sustainability', weaknessScore: 0.55 },
    ],
  },
  {
    id: 'area-c',
    label: 'Area C — Professional Practice',
    topics: [
      { id: 'c1', label: 'Contracts & Agreements', weaknessScore: 0.7 },
      { id: 'c2', label: 'Ethics & Regulations', weaknessScore: 0.45 },
      { id: 'c3', label: 'Business Development', weaknessScore: 0.35 },
      { id: 'c4', label: 'Legal Responsibilities', weaknessScore: 0.8 },
    ],
  },
]

// Blindspot threshold: topics with weaknessScore >= 0.65
const BLINDSPOT_THRESHOLD = 0.65

const getBlindspotIds = (areas: SubjectArea[]): string[] =>
  areas.flatMap((a) =>
    a.topics.filter((t) => (t.weaknessScore ?? 0) >= BLINDSPOT_THRESHOLD).map((t) => t.id),
  )

// ─── Props ────────────────────────────────────────────────────────────────────

interface IntroSlide2Props {
  mode: QuizMode
  areas?: SubjectArea[]
  initialSelected?: string[]
  onContinue: (selectedTopics: string[]) => void
}

// ─── Area row (expandable) ────────────────────────────────────────────────────

interface AreaRowProps {
  area: SubjectArea
  selected: Set<string>
  onToggleTopic: (id: string) => void
  onToggleArea: (area: SubjectArea) => void
}

const AreaRow = ({ area, selected, onToggleTopic, onToggleArea }: AreaRowProps) => {
  const [expanded, setExpanded] = useState(true)
  const allSelected = area.topics.every((t) => selected.has(t.id))
  const someSelected = area.topics.some((t) => selected.has(t.id))

  return (
    <div className="rounded-md border border-[#D4DAE3] bg-white overflow-hidden">
      {/* Area header */}
      <div className="flex items-center gap-2 px-4 py-3 bg-[#F8F7F5]">
        {/* Area-level select toggle */}
        <button
          type="button"
          onClick={() => onToggleArea(area)}
          aria-label={allSelected ? `Deselect all ${area.label} topics` : `Select all ${area.label} topics`}
          className={cn(
            'h-4 w-4 shrink-0 rounded-[3px] border transition-colors duration-150',
            allSelected
              ? 'bg-[#1B3FC4] border-[#1B3FC4]'
              : someSelected
                ? 'bg-[#EEF2FC] border-[#1B3FC4]'
                : 'bg-white border-[#D4DAE3] hover:border-[#1B3FC4]/50',
          )}
          aria-checked={allSelected ? true : someSelected ? 'mixed' : false}
          role="checkbox"
        >
          {allSelected && (
            <svg viewBox="0 0 12 12" className="w-full h-full p-[2px]" aria-hidden="true">
              <polyline points="1.5,6 5,9.5 10.5,2.5" stroke="white" strokeWidth="1.8" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
          {!allSelected && someSelected && (
            <svg viewBox="0 0 12 12" className="w-full h-full p-[2px]" aria-hidden="true">
              <line x1="2" y1="6" x2="10" y2="6" stroke="#1B3FC4" strokeWidth="1.8" strokeLinecap="round" />
            </svg>
          )}
        </button>

        <button
          type="button"
          onClick={() => setExpanded((p) => !p)}
          className="flex-1 flex items-center justify-between text-left focus-visible:outline-none"
          aria-expanded={expanded}
          aria-controls={`area-topics-${area.id}`}
        >
          <span className="text-[13px] font-medium text-[#1A2332]">{area.label}</span>
          {expanded ? (
            <CaretUp className="h-3.5 w-3.5 text-[#8896A7]" aria-hidden="true" />
          ) : (
            <CaretDown className="h-3.5 w-3.5 text-[#8896A7]" aria-hidden="true" />
          )}
        </button>
      </div>

      {/* Topic chips */}
      {expanded && (
        <div id={`area-topics-${area.id}`} className="flex flex-wrap gap-2 px-4 py-3">
          {area.topics.map((topic) => {
            const isSelected = selected.has(topic.id)
            const isWeakness = (topic.weaknessScore ?? 0) >= BLINDSPOT_THRESHOLD
            return (
              <button
                key={topic.id}
                type="button"
                onClick={() => onToggleTopic(topic.id)}
                aria-pressed={isSelected}
                className={cn(
                  'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-sm text-[12px] font-medium',
                  'border transition-all duration-150 ease-out',
                  'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1B3FC4]/30 focus-visible:ring-offset-1',
                  isSelected
                    ? 'bg-[#EEF2FC] border-[#1B3FC4] text-[#1B3FC4]'
                    : 'bg-white border-[#D4DAE3] text-[#4A5568] hover:border-[#1B3FC4]/40',
                )}
              >
                {topic.label}
                {isWeakness && (
                  <span
                    className="inline-block w-1.5 h-1.5 rounded-full bg-[#D4951A] shrink-0"
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

// ─── IntroSlide2 ──────────────────────────────────────────────────────────────

const IntroSlide2 = ({
  mode,
  areas = DEFAULT_AREAS,
  initialSelected,
  onContinue,
}: IntroSlide2Props) => {
  const allIds = useMemo(() => areas.flatMap((a) => a.topics.map((t) => t.id)), [areas])
  const blindspotIds = useMemo(() => getBlindspotIds(areas), [areas])

  const defaultSelected = useMemo<Set<string>>(() => {
    if (initialSelected) return new Set(initialSelected)
    // Focused mode pre-selects blindspot topics
    if (mode === 'focused') return new Set(blindspotIds)
    // Subject / Custom start with all selected
    return new Set(allIds)
  }, [mode, allIds, blindspotIds, initialSelected])

  const [selected, setSelected] = useState<Set<string>>(defaultSelected)
  const [query, setQuery] = useState('')

  const filteredAreas = useMemo<SubjectArea[]>(() => {
    if (!query.trim()) return areas
    const q = query.toLowerCase()
    return areas
      .map((a) => ({
        ...a,
        topics: a.topics.filter((t) => t.label.toLowerCase().includes(q)),
      }))
      .filter((a) => a.topics.length > 0)
  }, [areas, query])

  const allSelected = selected.size === allIds.length

  const toggleTopic = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const toggleAll = () => {
    setSelected(allSelected ? new Set() : new Set(allIds))
  }

  const toggleArea = (area: SubjectArea) => {
    const areaIds = area.topics.map((t) => t.id)
    const allAreaSelected = areaIds.every((id) => selected.has(id))
    setSelected((prev) => {
      const next = new Set(prev)
      if (allAreaSelected) areaIds.forEach((id) => next.delete(id))
      else areaIds.forEach((id) => next.add(id))
      return next
    })
  }

  const handleContinue = () => onContinue(Array.from(selected))

  return (
    <div className="space-y-4">
      {/* Header */}
      <div>
        <p className="text-[12px] font-medium uppercase tracking-wide text-[#8896A7] mb-1">
          Step 2 — Topics
        </p>
        <h2 className="text-[17px] font-semibold text-[#1A2332]">Choose your topics</h2>
        {mode === 'focused' && (
          <p className="text-[13px] text-[#D4951A] mt-1">
            Developing skills pre-selected based on your history.
          </p>
        )}
      </div>

      {/* Search */}
      <div className="relative">
        <MagnifyingGlass
          className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8896A7]"
          aria-hidden="true"
        />
        <input
          type="search"
          placeholder="Search topics…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full rounded-sm border border-[#D4DAE3] bg-white pl-8 pr-3 py-2 text-[13px] text-[#1A2332] placeholder:text-[#8896A7] focus:outline-none focus:ring-2 focus:ring-[#1B3FC4]/20 focus:border-[#1B3FC4]/50 transition-colors duration-150"
          aria-label="Search topics"
        />
      </div>

      {/* All-topics toggle */}
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={toggleAll}
          className="text-[12px] font-medium text-[#1B3FC4] hover:text-[#1535A8] transition-colors duration-150 focus-visible:outline-none focus-visible:underline"
          aria-label={allSelected ? 'Deselect all topics' : 'Select all topics'}
        >
          {allSelected ? 'Deselect all' : 'Select all'}
        </button>
        <span className="text-[12px] text-[#8896A7]">
          {selected.size} of {allIds.length} selected
        </span>
      </div>

      {/* Area rows */}
      <div className="space-y-2">
        {filteredAreas.map((area) => (
          <AreaRow
            key={area.id}
            area={area}
            selected={selected}
            onToggleTopic={toggleTopic}
            onToggleArea={toggleArea}
          />
        ))}
        {filteredAreas.length === 0 && (
          <p className="text-[13px] text-[#8896A7] text-center py-6">
            No topics match your search.
          </p>
        )}
      </div>

      {/* Continue */}
      <Button
        variant="default"
        size="lg"
        fullWidth
        onClick={handleContinue}
        disabled={selected.size === 0}
        className="rounded-sm"
      >
        Continue with {selected.size} topic{selected.size !== 1 ? 's' : ''}
      </Button>
    </div>
  )
}

IntroSlide2.displayName = 'IntroSlide2'

export { IntroSlide2 }

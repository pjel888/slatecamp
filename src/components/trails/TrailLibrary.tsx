'use client'

import { useState, useMemo } from 'react'
import { CaretDown, Rows } from '@phosphor-icons/react/dist/ssr'
import { TrailFilterRow } from '@/components/trails/TrailFilterRow'
import { TrailCard } from '@/components/trails/TrailCard'
import type { CampTrail, TrailEnrollment } from '@/types/app'

const TRAIL_TYPE_LABELS: Record<string, string> = {
  time_gated: 'Time-Gated Programs',
  subject_mastery: 'Subject Mastery Paths',
  code_deep_dive: 'Code Deep-Dives',
  remediation: 'Targeted Remediation',
  exam_simulation: 'Exam Simulation',
}

const TYPE_ORDER = ['time_gated', 'subject_mastery', 'code_deep_dive', 'remediation', 'exam_simulation']

interface TrailLibraryProps {
  trails: CampTrail[]
  enrollmentMap: Record<string, TrailEnrollment>
  excludeTrailId?: string | null
}

export const TrailLibrary = ({ trails, enrollmentMap, excludeTrailId }: TrailLibraryProps) => {
  const [expanded, setExpanded] = useState(false)
  const [activeFilter, setActiveFilter] = useState('all')

  // Separate featured/popular trails from the rest
  const availableTrails = useMemo(() => {
    return excludeTrailId
      ? trails.filter((t) => t.trail_id !== excludeTrailId)
      : trails
  }, [trails, excludeTrailId])

  // Preview: show up to 3 featured or first-available trails
  const previewTrails = useMemo(() => {
    const featured = availableTrails.filter((t) => t.is_featured)
    if (featured.length >= 3) return featured.slice(0, 3)
    // Pad with non-featured trails to reach 3
    const rest = availableTrails.filter((t) => !t.is_featured)
    return [...featured, ...rest].slice(0, 3)
  }, [availableTrails])

  // Full library grouped by type (only when expanded)
  const filteredGrouped = useMemo(() => {
    let filtered = availableTrails
    if (activeFilter !== 'all') {
      filtered = filtered.filter((t) => t.trail_type === activeFilter)
    }

    const grouped: { type: string; label: string; trails: CampTrail[] }[] = []
    for (const type of TYPE_ORDER) {
      const typeTrails = filtered.filter((t) => t.trail_type === type)
      if (typeTrails.length > 0) {
        grouped.push({ type, label: TRAIL_TYPE_LABELS[type] ?? type, trails: typeTrails })
      }
    }

    const knownTypes = new Set(TYPE_ORDER)
    const remaining = filtered.filter((t) => !knownTypes.has(t.trail_type))
    if (remaining.length > 0) {
      const otherGrouped = remaining.reduce<Record<string, CampTrail[]>>((acc, t) => {
        if (!acc[t.trail_type]) acc[t.trail_type] = []
        acc[t.trail_type].push(t)
        return acc
      }, {})
      for (const [type, typeTrails] of Object.entries(otherGrouped)) {
        grouped.push({ type, label: TRAIL_TYPE_LABELS[type] ?? type, trails: typeTrails })
      }
    }

    return grouped
  }, [availableTrails, activeFilter])

  const remainingCount = availableTrails.length - previewTrails.length

  // ─── Collapsed State: Show 3 preview cards + expand button ───
  if (!expanded) {
    return (
      <div>
        {/* Preview grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          {previewTrails.map((trail) => (
            <TrailCard
              key={trail.trail_id}
              trail={{ ...trail, enrollment: enrollmentMap[trail.trail_id] ?? null }}
              isLocked={false}
            />
          ))}
        </div>

        {/* Expand button — gentle invitation, not demanding */}
        {remainingCount > 0 && (
          <button
            type="button"
            onClick={() => setExpanded(true)}
            className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-md border border-dashed border-border text-sm font-medium text-text-secondary hover:border-camp-cobalt hover:text-camp-cobalt hover:bg-primary-50/50 transition-all duration-150 cursor-pointer"
          >
            <Rows size={16} />
            Browse {remainingCount} more trail{remainingCount !== 1 ? 's' : ''}
            <CaretDown size={14} />
          </button>
        )}
      </div>
    )
  }

  // ─── Expanded State: Full library with filters ───
  return (
    <div>
      <TrailFilterRow onFilterChange={setActiveFilter} activeFilter={activeFilter} />

      {filteredGrouped.length === 0 && (
        <div className="text-center py-8">
          <p className="text-sm text-text-secondary">No trails match this filter.</p>
        </div>
      )}

      <div className="flex flex-col gap-8">
        {filteredGrouped.map((group) => (
          <section key={group.type}>
            <h2 className="text-sm font-semibold text-text-secondary uppercase tracking-wide mb-3">
              {group.label}
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {group.trails.map((trail) => (
                <TrailCard
                  key={trail.trail_id}
                  trail={{ ...trail, enrollment: enrollmentMap[trail.trail_id] ?? null }}
                  isLocked={false}
                />
              ))}
            </div>
          </section>
        ))}
      </div>

      {/* Collapse button */}
      <button
        type="button"
        onClick={() => { setExpanded(false); setActiveFilter('all') }}
        className="mt-6 w-full flex items-center justify-center gap-2 py-2.5 text-sm text-text-tertiary hover:text-text-secondary transition-colors duration-150 cursor-pointer"
      >
        Show fewer trails
      </button>
    </div>
  )
}

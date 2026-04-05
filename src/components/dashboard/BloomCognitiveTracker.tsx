'use client'

import { useState } from 'react'
import type { BloomBreakdown, BloomLevel } from '@/lib/actions/bloom-tracker'

// ── Types ─────────────────────────────────────────────────────────────────────

interface BloomCognitiveTrackerProps {
  data: BloomBreakdown[]
  sessionsCompleted: number
}

// ── Constants ─────────────────────────────────────────────────────────────────

const SESSIONS_THRESHOLD = 10

const BLOOM_LABELS: Record<BloomLevel, string> = {
  remember: 'Remember',
  understand: 'Understand',
  apply: 'Apply',
  analyze: 'Analyze',
}

const getBarColor = (accuracy: number): string => {
  if (accuracy >= 70) return '#2D9F6F'  // Emerald
  if (accuracy >= 50) return '#D4951A'  // Amber
  return '#D64545'                       // Warm Red
}

const getBarBg = (accuracy: number): string => {
  if (accuracy >= 70) return '#EDFAF4'  // Emerald 50
  if (accuracy >= 50) return '#FEF8ED'  // Amber 50
  return '#FDF0F0'                       // Warm Red 50
}

// ── Diagnostic copy ───────────────────────────────────────────────────────────

const getDiagnosticMessage = (data: BloomBreakdown, activeSubject: BloomBreakdown | null): string => {
  const subject = activeSubject ?? data
  const levelMap = new Map(subject.levels.map(l => [l.bloom, l.accuracy]))

  const remember = levelMap.get('remember')
  const apply = levelMap.get('apply')
  const analyze = levelMap.get('analyze')

  // Check "know rules but can't apply" pattern
  if (remember !== undefined && apply !== undefined) {
    if (remember >= 70 && apply < 50) {
      return "You know the rules but struggle to apply them in scenarios. Your next sessions focus on apply-level questions."
    }
  }

  // Check analyze gap across this subject
  if (analyze !== undefined && analyze < 50) {
    return "Multi-step reasoning is your biggest gap. This distinguishes passers from those who need another cycle."
  }

  // Check if all present levels are strong
  const allStrong = subject.levels.length > 0 && subject.levels.every(l => l.accuracy >= 70)
  if (allStrong) {
    return "Strong across all cognitive levels. Keep practicing to maintain."
  }

  return ""
}

// ── Bloom Bar Row ─────────────────────────────────────────────────────────────

const BloomBarRow = ({
  bloom,
  accuracy,
  attempts,
  animated,
  index,
}: {
  bloom: BloomLevel
  accuracy: number
  attempts: number
  animated: boolean
  index: number
}) => {
  const color = getBarColor(accuracy)
  const bg = getBarBg(accuracy)

  return (
    <div className="flex flex-col gap-0.5">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-foreground">
          {BLOOM_LABELS[bloom]}
        </span>
        <div className="flex items-center gap-2">
          <span
            className="font-mono text-xs font-semibold tabular-nums"
            style={{ color }}
          >
            {accuracy}%
          </span>
          <span
            className="font-mono text-[11px] tabular-nums"
            style={{ color: '#8896A7' }}
          >
            {attempts} attempts
          </span>
        </div>
      </div>
      <div
        className="h-2 w-full rounded-sm overflow-hidden"
        style={{ backgroundColor: bg }}
      >
        <div
          className="h-full rounded-sm"
          style={{
            width: animated ? `${Math.max(accuracy, 1)}%` : '0%',
            backgroundColor: color,
            transition: `width 300ms ease-out ${index * 60}ms`,
          }}
        />
      </div>
    </div>
  )
}

// ── Subject Tabs ──────────────────────────────────────────────────────────────

const SubjectTabs = ({
  subjects,
  activeId,
  onSelect,
}: {
  subjects: BloomBreakdown[]
  activeId: string
  onSelect: (id: string) => void
}) => (
  <div className="flex flex-wrap gap-1 mb-3">
    {subjects.map(s => {
      const isActive = s.subjectId === activeId
      return (
        <button
          key={s.subjectId}
          type="button"
          onClick={() => onSelect(s.subjectId)}
          className="text-[11px] font-medium px-2 py-0.5 rounded-sm transition-colors duration-150"
          style={{
            backgroundColor: isActive ? '#1B3FC4' : '#EEF2FC',
            color: isActive ? '#FFFFFF' : '#1B3FC4',
          }}
        >
          {s.subject}
        </button>
      )
    })}
  </div>
)

// ── Diagnostic Banner ─────────────────────────────────────────────────────────

const DiagnosticBanner = ({ message }: { message: string }) => {
  if (!message) return null
  return (
    <div
      className="mt-3 rounded-md px-3 py-2 border"
      style={{
        backgroundColor: '#F8F7F5',
        borderColor: '#D4DAE3',
      }}
    >
      <p className="text-[11px] text-text-secondary leading-relaxed">{message}</p>
    </div>
  )
}

// ── Locked state (< 10 sessions) ─────────────────────────────────────────────

const LockedState = ({ sessionsCompleted }: { sessionsCompleted: number }) => (
  <div className="flex flex-col items-center justify-center py-6 text-center gap-1">
    <p className="text-sm font-medium text-foreground">
      Cognitive level tracking unlocks after 10 sessions
    </p>
    <p className="text-[11px] text-muted-foreground">
      {sessionsCompleted} of {SESSIONS_THRESHOLD} sessions completed
    </p>
    <div className="mt-2 h-1.5 w-48 rounded-full overflow-hidden" style={{ backgroundColor: '#EEF2FC' }}>
      <div
        className="h-full rounded-full"
        style={{
          width: `${Math.min((sessionsCompleted / SESSIONS_THRESHOLD) * 100, 100)}%`,
          backgroundColor: '#1B3FC4',
          transition: 'width 300ms ease-out',
        }}
      />
    </div>
  </div>
)

// ── Empty state ───────────────────────────────────────────────────────────────

const EmptyBloomState = () => (
  <div className="flex flex-col items-center justify-center py-6 text-center">
    <p className="text-sm font-medium text-foreground">No data yet</p>
    <p className="text-[11px] text-muted-foreground mt-0.5">
      Complete a session with bloom-tagged questions to see your cognitive profile.
    </p>
  </div>
)

// ── Main component ────────────────────────────────────────────────────────────

export const BloomCognitiveTracker = ({
  data,
  sessionsCompleted,
}: BloomCognitiveTrackerProps) => {
  const [activeId, setActiveId] = useState<string>(data[0]?.subjectId ?? '')
  const [animated] = useState(true)

  const isLocked = sessionsCompleted < SESSIONS_THRESHOLD

  const activeSubject = data.find(d => d.subjectId === activeId) ?? data[0] ?? null

  const diagnosticMessage = activeSubject
    ? getDiagnosticMessage(activeSubject, activeSubject)
    : ''

  return (
    <div
      className="rounded-md bg-white p-3 flex flex-col"
      style={{ boxShadow: 'none' }}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-[11px] font-medium uppercase tracking-[0.15em] text-text-secondary">
          Cognitive Level Tracker
        </h3>
      </div>
      <p className="text-[11px] text-muted-foreground mb-3">
        Accuracy by Bloom's taxonomy level per subject
      </p>

      {isLocked ? (
        <LockedState sessionsCompleted={sessionsCompleted} />
      ) : data.length === 0 ? (
        <EmptyBloomState />
      ) : (
        <>
          {/* Subject Tabs */}
          <SubjectTabs
            subjects={data}
            activeId={activeId}
            onSelect={setActiveId}
          />

          {/* Bloom level bars */}
          {activeSubject ? (
            <div className="flex flex-col gap-3">
              {activeSubject.levels.map((level, i) => (
                <BloomBarRow
                  key={level.bloom}
                  bloom={level.bloom}
                  accuracy={level.accuracy}
                  attempts={level.attempts}
                  animated={animated}
                  index={i}
                />
              ))}

              {/* Diagnostic copy */}
              <DiagnosticBanner message={diagnosticMessage} />
            </div>
          ) : null}
        </>
      )}
    </div>
  )
}

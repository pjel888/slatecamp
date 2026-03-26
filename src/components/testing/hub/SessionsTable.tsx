'use client'

import { useState } from 'react'
import Link from 'next/link'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionsTableProps {
  sessions: Array<{
    session_id: string
    test_mode: string
    config: {
      mode?: string
      source?: string
    } | null
    status: string
    question_ids: string[] | null
    started_at: string
    completed_at: string | null
    current_question_index: number
    updated_at: string
  }>
}

// ─── Constants ────────────────────────────────────────────────────────────────

const MODE_LABELS: Record<string, string> = {
  camp: 'Camp',
  chill: 'Chill',
  subject: 'Subject',
  focused: 'Focus Review',
  focus_review: 'Focus Review',
  custom: 'Custom',
  storm: 'Storm',
  fullexam: 'Full Exam',
  full_exam: 'Full Exam',
  extended: 'Extended',
  extended_practice: 'Extended',
  article_review: 'Article Review',
  wiki_review: 'Article Review',
  camp_mode: 'Camp',
  chill_mode: 'Chill',
  subject_mode: 'Subject',
  custom_session: 'Custom',
  storm_mode: 'Storm',
  proof_simulation: 'Full Exam',
  assessment_quiz: 'Camp',
  trail_quiz: 'Camp',
  blindspot_queue: 'Focus Review',
}

const LEARNING_MODES = new Set([
  'camp', 'camp_mode', 'chill', 'chill_mode', 'subject', 'subject_mode',
  'focused', 'focus_review', 'assessment_quiz', 'trail_quiz', 'blindspot_queue',
])

const EXAM_MODES = new Set([
  'storm', 'storm_mode', 'fullexam', 'full_exam', 'proof_simulation',
  'extended', 'extended_practice',
])

const PAGE_SIZE = 20

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getRelativeTime = (dateStr: string): string => {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60000)
  if (minutes < 1) return 'just now'
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'yesterday'
  if (days < 7) return `${days}d ago`
  if (days < 30) return `${Math.floor(days / 7)}w ago`
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

const getModeKey = (session: SessionsTableProps['sessions'][number]): string => {
  return session.config?.mode ?? session.config?.source ?? session.test_mode ?? 'camp'
}

const getModeLabel = (modeKey: string): string => {
  return MODE_LABELS[modeKey] ?? modeKey
}

const getModeBadgeStyle = (modeKey: string): React.CSSProperties => {
  if (EXAM_MODES.has(modeKey)) {
    return { backgroundColor: '#FEF0E4', color: '#C4621A' }
  }
  if (LEARNING_MODES.has(modeKey)) {
    return { backgroundColor: '#EEF2FC', color: '#1B3FC4' }
  }
  // custom / unknown
  return { backgroundColor: '#F1F3F5', color: '#4A5568' }
}

const getSessionUrl = (session: SessionsTableProps['sessions'][number]): string => {
  const modeKey = getModeKey(session)
  const slug = modeKey.replace(/_/g, '-')
  if (session.status === 'in_progress') {
    return `/quiz/${slug}/session/${session.session_id}`
  }
  return `/quiz/${slug}/session/${session.session_id}/results`
}

const getScoreDisplay = (session: SessionsTableProps['sessions'][number]): {
  label: string
  color: string
} => {
  if (session.status === 'in_progress') {
    return { label: 'In progress', color: '#1B3FC4' }
  }
  // No score data available in the raw sessions shape — show em dash
  return { label: '—', color: '#8896A7' }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusDot = ({ status }: { status: string }) => {
  const dotStyle: React.CSSProperties =
    status === 'in_progress'
      ? { backgroundColor: '#1B3FC4' }
      : status === 'completed'
        ? { backgroundColor: '#2D9F6F' }
        : { backgroundColor: '#8896A7' }

  const textStyle: React.CSSProperties =
    status === 'in_progress'
      ? { color: '#1B3FC4' }
      : status === 'completed'
        ? { color: '#2D9F6F' }
        : { color: '#8896A7' }

  const label =
    status === 'in_progress' ? 'In progress' : status === 'completed' ? 'Completed' : 'Abandoned'

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-1.5 w-1.5 rounded-full flex-shrink-0"
        style={dotStyle}
        aria-hidden="true"
      />
      <span className="text-[12px]" style={textStyle}>
        {label}
      </span>
    </span>
  )
}

const ActionLink = ({ session }: { session: SessionsTableProps['sessions'][number] }) => {
  const url = getSessionUrl(session)
  const label = session.status === 'in_progress' ? 'Resume' : 'Review'

  return (
    <Link
      href={url}
      className="text-[12px] font-medium transition-colors duration-150"
      style={{ color: '#1B3FC4' }}
      onClick={(e) => e.stopPropagation()}
    >
      {label} →
    </Link>
  )
}

// ─── Desktop table row ────────────────────────────────────────────────────────

const TableRow = ({ session }: { session: SessionsTableProps['sessions'][number] }) => {
  const modeKey = getModeKey(session)
  const modeLabel = getModeLabel(modeKey)
  const badgeStyle = getModeBadgeStyle(modeKey)
  const total = session.question_ids?.length ?? 0
  const answered = session.current_question_index ?? 0
  const score = getScoreDisplay(session)
  const dateStr = session.completed_at ?? session.updated_at
  const fullDate = new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  const url = getSessionUrl(session)

  return (
    <tr
      className="group cursor-pointer border-b transition-colors duration-150"
      style={{ borderColor: 'rgba(212, 218, 227, 0.5)' }}
      onClick={() => { window.location.href = url }}
    >
      {/* Mode */}
      <td className="py-3 pl-4 pr-3">
        <span
          className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium"
          style={badgeStyle}
        >
          {modeLabel}
        </span>
      </td>

      {/* Questions */}
      <td className="px-3 py-3 text-[13px]" style={{ color: '#1A2332' }}>
        <span className="font-[family-name:var(--font-dm-mono)]">
          {answered}/{total}
        </span>
      </td>

      {/* Score */}
      <td className="px-3 py-3 text-[13px]" style={{ color: score.color }}>
        {session.status === 'in_progress' ? (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium"
            style={{ backgroundColor: '#EEF2FC', color: '#1B3FC4' }}
          >
            In progress
          </span>
        ) : (
          <span className="font-[family-name:var(--font-dm-mono)]">{score.label}</span>
        )}
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <StatusDot status={session.status} />
      </td>

      {/* Date */}
      <td className="px-3 py-3 text-[12px]" style={{ color: '#8896A7' }}>
        <span
          className="font-[family-name:var(--font-dm-mono)]"
          title={fullDate}
        >
          {getRelativeTime(dateStr)}
        </span>
      </td>

      {/* Action */}
      <td className="py-3 pl-3 pr-4 text-right">
        <ActionLink session={session} />
      </td>
    </tr>
  )
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

const MobileCard = ({ session }: { session: SessionsTableProps['sessions'][number] }) => {
  const modeKey = getModeKey(session)
  const modeLabel = getModeLabel(modeKey)
  const badgeStyle = getModeBadgeStyle(modeKey)
  const total = session.question_ids?.length ?? 0
  const answered = session.current_question_index ?? 0
  const dateStr = session.completed_at ?? session.updated_at
  const fullDate = new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
  const url = getSessionUrl(session)

  return (
    <div
      className="rounded-md border p-4 cursor-pointer transition-colors duration-150"
      style={{
        backgroundColor: '#FFFFFF',
        borderColor: '#D4DAE3',
      }}
      onClick={() => { window.location.href = url }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-2 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium"
              style={badgeStyle}
            >
              {modeLabel}
            </span>
            <StatusDot status={session.status} />
          </div>
          <div className="flex items-center gap-3 text-[12px]" style={{ color: '#4A5568' }}>
            <span>
              <span className="font-[family-name:var(--font-dm-mono)]">{answered}/{total}</span>
              {' '}questions
            </span>
            <span
              className="font-[family-name:var(--font-dm-mono)]"
              title={fullDate}
              style={{ color: '#8896A7' }}
            >
              {getRelativeTime(dateStr)}
            </span>
          </div>
        </div>
        <ActionLink session={session} />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const SessionsTable = ({ sessions }: SessionsTableProps) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)

  // Sort newest first (already ordered by updated_at desc from query, but ensure it)
  const sorted = [...sessions].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )

  const visible = sorted.slice(0, visibleCount)
  const hasMore = visibleCount < sorted.length

  if (sessions.length === 0) {
    return (
      <div
        className="rounded-md border py-12 text-center text-[13px]"
        style={{ borderColor: '#D4DAE3', color: '#8896A7', backgroundColor: '#F8F7F5' }}
      >
        No sessions yet. Start your first quiz above.
      </div>
    )
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-md border" style={{ borderColor: '#D4DAE3' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: '#F8F7F5' }}>
              {(['Mode', 'Questions', 'Score', 'Status', 'Date', ''] as const).map((col) => (
                <th
                  key={col}
                  className={`py-2.5 text-left text-[11px] font-medium uppercase tracking-wide ${
                    col === '' ? 'pl-3 pr-4 text-right' : col === 'Mode' ? 'pl-4 pr-3' : 'px-3'
                  }`}
                  style={{ color: '#8896A7' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: '#FFFFFF' }}>
            {visible.map((session) => (
              <TableRow key={session.session_id} session={session} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 md:hidden">
        {visible.map((session) => (
          <MobileCard key={session.session_id} session={session} />
        ))}
      </div>

      {/* Show more */}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            className="px-4 py-2 rounded-sm text-[13px] font-medium border transition-colors duration-150"
            style={{
              borderColor: '#D4DAE3',
              color: '#4A5568',
              backgroundColor: '#FFFFFF',
            }}
            onClick={() => setVisibleCount((c) => c + PAGE_SIZE)}
          >
            Show more ({sorted.length - visibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  )
}

SessionsTable.displayName = 'SessionsTable'

export { SessionsTable }
export type { SessionsTableProps }

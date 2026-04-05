'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { abandonTestingSession } from '@/lib/actions/testing'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SessionConfig {
  mode?: string
  source?: string
  articleSlug?: string
}

interface SessionsTableProps {
  sessions: Array<{
    session_id: string
    test_mode: string
    config: SessionConfig | null
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

// Reading-based modes that should redirect to source articles instead of results
const READING_MODES = new Set([
  'article_review',
  'prequestion',
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
    return { backgroundColor: 'var(--warning-50)', color: 'var(--camp-orange-hover)' }
  }
  if (LEARNING_MODES.has(modeKey)) {
    return { backgroundColor: 'var(--primary-50)', color: 'var(--primary)' }
  }
  // custom / unknown
  return { backgroundColor: 'var(--muted)', color: 'var(--text-secondary)' }
}

const getSessionUrl = (session: SessionsTableProps['sessions'][number]): string => {
  const modeKey = getModeKey(session)
  const slug = modeKey.replace(/_/g, '-')
  
  // Handle in-progress sessions - always go to quiz session
  if (session.status === 'in_progress') {
    return `/quiz/${slug}/session/${session.session_id}`
  }
  
  // Conditional routing for completed sessions
  // Reading-based modes (article_review, prequestion) should redirect to source articles
  if (READING_MODES.has(modeKey)) {
    const articleSlug = session.config?.articleSlug
    
    // If article slug exists, redirect to the wiki article
    if (articleSlug) {
      return `/dashboard/wiki/${articleSlug}`
    }
    
    // Fallback: No valid article identifier - log warning and route to results
    // This ensures we don't have broken redirects when article slug is missing
    console.warn(
      `[SessionsTable] Missing articleSlug for reading session ${session.session_id} (mode: ${modeKey}). Falling back to results.`
    )
  }
  
  // Standard modes and fallback for reading modes without article slug
  return `/quiz/${slug}/session/${session.session_id}/results`
}

const getScoreDisplay = (session: SessionsTableProps['sessions'][number]): {
  label: string
  color: string
} => {
  if (session.status === 'in_progress') {
    return { label: 'In progress', color: 'var(--primary)' }
  }
  // No score data available in the raw sessions shape — show em dash
  return { label: '—', color: 'var(--muted-foreground)' }
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusDot = ({ status }: { status: string }) => {
  const dotStyle: React.CSSProperties =
    status === 'in_progress'
      ? { backgroundColor: 'var(--primary)' }
      : status === 'completed'
        ? { backgroundColor: 'var(--success)' }
        : { backgroundColor: 'var(--muted-foreground)' }

  const textStyle: React.CSSProperties =
    status === 'in_progress'
      ? { color: 'var(--primary)' }
      : status === 'completed'
        ? { color: 'var(--success)' }
        : { color: 'var(--muted-foreground)' }

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

const ActionLink = ({ 
  session, 
  onAbandon 
}: { 
  session: SessionsTableProps['sessions'][number]
  onAbandon: (sessionId: string) => void
}) => {
  const url = getSessionUrl(session)
  const isInProgress = session.status === 'in_progress'

  if (isInProgress) {
    return (
      <div className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
        <Link
          href={url}
          className="text-[12px] font-medium transition-colors duration-150"
          style={{ color: 'var(--primary)' }}
        >
          Resume
        </Link>
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="ghost"
              size="xs"
              className="rounded-sm text-[12px] font-medium h-auto py-1 px-2"
              style={{ color: 'var(--muted-foreground)' }}
            >
              Abandon
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="rounded-lg max-w-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-[16px] font-semibold" style={{ color: 'var(--foreground)' }}>
                Abandon this session?
              </AlertDialogTitle>
              <AlertDialogDescription
                className="text-[14px] font-normal leading-relaxed"
                style={{ color: 'var(--text-secondary)' }}
              >
                Your progress on this session will be lost. Any answers you&apos;ve submitted are already saved to your mastery data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2">
              <AlertDialogCancel className="rounded-sm text-[13px]">
                Keep going
              </AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                className="rounded-sm bg-destructive text-white hover:bg-destructive/90 text-[13px]"
                onClick={() => onAbandon(session.session_id)}
              >
                Yes, abandon
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    )
  }

  return (
    <Link
      href={url}
      className="text-[12px] font-medium transition-colors duration-150"
      style={{ color: 'var(--primary)' }}
      onClick={(e) => e.stopPropagation()}
    >
      Review →
    </Link>
  )
}

// ─── Desktop table row ────────────────────────────────────────────────────────

const TableRow = ({ 
  session, 
  onAbandon 
}: { 
  session: SessionsTableProps['sessions'][number]
  onAbandon: (sessionId: string) => void
}) => {
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
      style={{ borderColor: 'color-mix(in srgb, var(--border) 50%, transparent)' }}
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
      <td className="px-3 py-3 text-[13px]" style={{ color: 'var(--foreground)' }}>
        <span className="font-[family-name:var(--font-dm-mono)]">
          {answered}/{total}
        </span>
      </td>

      {/* Score */}
      <td className="px-3 py-3 text-[13px]" style={{ color: score.color }}>
        {session.status === 'in_progress' ? (
          <span
            className="inline-flex items-center px-2 py-0.5 rounded-sm text-[11px] font-medium"
            style={{ backgroundColor: 'var(--primary-50)', color: 'var(--primary)' }}
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
      <td className="px-3 py-3 text-[12px]" style={{ color: 'var(--muted-foreground)' }}>
        <span
          className="font-[family-name:var(--font-dm-mono)]"
          title={fullDate}
        >
          {getRelativeTime(dateStr)}
        </span>
      </td>

      {/* Action */}
      <td className="py-3 pl-3 pr-4 text-right">
        <ActionLink session={session} onAbandon={onAbandon} />
      </td>
    </tr>
  )
}

// ─── Mobile card ──────────────────────────────────────────────────────────────

const MobileCard = ({ 
  session, 
  onAbandon 
}: { 
  session: SessionsTableProps['sessions'][number]
  onAbandon: (sessionId: string) => void
}) => {
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
        backgroundColor: 'var(--surface-card)',
        borderColor: 'var(--border)',
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
          <div className="flex items-center gap-3 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            <span>
              <span className="font-[family-name:var(--font-dm-mono)]">{answered}/{total}</span>
              {' '}questions
            </span>
            <span
              className="font-[family-name:var(--font-dm-mono)]"
              title={fullDate}
              style={{ color: 'var(--muted-foreground)' }}
            >
              {getRelativeTime(dateStr)}
            </span>
          </div>
        </div>
        <ActionLink session={session} onAbandon={onAbandon} />
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const SessionsTable = ({ sessions }: SessionsTableProps) => {
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE)
  const [localSessions, setLocalSessions] = useState(sessions)
  const [abandoningId, setAbandoningId] = useState<string | null>(null)

  const handleAbandon = async (sessionId: string) => {
    setAbandoningId(sessionId)
    await abandonTestingSession(sessionId)
    setLocalSessions((prev) =>
      prev.map((s) =>
        s.session_id === sessionId ? { ...s, status: 'abandoned' as const } : s
      )
    )
    setAbandoningId(null)
  }

  const sorted = [...localSessions].sort(
    (a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime(),
  )

  const visible = sorted.slice(0, visibleCount)
  const hasMore = visibleCount < sorted.length

  if (sessions.length === 0) {
    return (
      <div
        className="rounded-md border py-12 text-center text-[13px]"
        style={{ borderColor: 'var(--border)', color: 'var(--muted-foreground)', backgroundColor: 'var(--surface-light)' }}
      >
        No sessions yet. Start your first quiz above.
      </div>
    )
  }

  return (
    <div>
      {/* Desktop table */}
      <div className="hidden md:block overflow-hidden rounded-md border" style={{ borderColor: 'var(--border)' }}>
        <table className="w-full border-collapse">
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-light)' }}>
              {(['Mode', 'Questions', 'Score', 'Status', 'Date', 'Actions'] as const).map((col) => (
                <th
                  key={col}
                  className={`py-2.5 text-left text-[11px] font-medium uppercase tracking-wide ${
                    col === 'Actions' ? 'pl-3 pr-4 text-right' : col === 'Mode' ? 'pl-4 pr-3' : 'px-3'
                  }`}
                  style={{ color: 'var(--muted-foreground)' }}
                >
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody style={{ backgroundColor: 'var(--surface-card)' }}>
            {visible.map((session) => (
              <TableRow key={session.session_id} session={session} onAbandon={handleAbandon} />
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile card list */}
      <div className="flex flex-col gap-3 md:hidden">
        {visible.map((session) => (
          <MobileCard key={session.session_id} session={session} onAbandon={handleAbandon} />
        ))}
      </div>

      {/* Show more */}
      {hasMore && (
        <div className="mt-4 flex justify-center">
          <button
            type="button"
            className="px-4 py-2 rounded-sm text-[13px] font-medium border transition-colors duration-150"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--surface-card)',
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

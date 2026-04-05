'use client'

import { type CSSProperties, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { DataTable, type Column } from '@/components/shared/data-table'
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
import { abandonSession as abandonSessionAction } from '@/lib/actions/quiz-v2'

interface SessionConfig {
  mode?: string
  source?: string
  articleSlug?: string
}

interface SessionRecord {
  session_id: string
  test_mode: string
  config: SessionConfig | null
  status: string
  question_ids: string[] | null
  started_at: string
  completed_at: string | null
  current_question_index: number
  updated_at: string
}

interface SessionsTableProps {
  sessions: SessionRecord[]
}

interface SessionTableRow extends SessionRecord {
  [key: string]: unknown
  modeKey: string
  modeLabel: string
  statusLabel: string
  totalQuestions: number
  answeredQuestions: number
  sessionUrl: string
  activityDate: string
}

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
  'camp',
  'camp_mode',
  'chill',
  'chill_mode',
  'subject',
  'subject_mode',
  'focused',
  'focus_review',
  'assessment_quiz',
  'trail_quiz',
  'blindspot_queue',
])

const EXAM_MODES = new Set([
  'storm',
  'storm_mode',
  'fullexam',
  'full_exam',
  'proof_simulation',
  'extended',
  'extended_practice',
])

const READING_MODES = new Set(['article_review', 'prequestion'])

const PAGE_SIZE = 20

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

const getModeKey = (session: SessionRecord): string => {
  return session.config?.mode ?? session.config?.source ?? session.test_mode ?? 'camp'
}

const getModeLabel = (modeKey: string): string => {
  return MODE_LABELS[modeKey] ?? modeKey
}

const getStatusLabel = (status: string): string => {
  if (status === 'in_progress') return 'In progress'
  if (status === 'completed') return 'Completed'
  return 'Abandoned'
}

const getModeBadgeStyle = (modeKey: string): CSSProperties => {
  if (EXAM_MODES.has(modeKey)) {
    return { backgroundColor: 'var(--warning-50)', color: 'var(--camp-orange-hover)' }
  }

  if (LEARNING_MODES.has(modeKey)) {
    return { backgroundColor: 'var(--primary-50)', color: 'var(--primary)' }
  }

  return { backgroundColor: 'var(--muted)', color: 'var(--text-secondary)' }
}

const getSessionUrl = (session: SessionRecord): string => {
  const modeKey = getModeKey(session)

  const modeKeyToV2: Record<string, string> = {
    'focus-review': 'focused',
    focus_review: 'focused',
    blindspot_queue: 'focused',
    simulation: 'fullexam',
    full_exam: 'fullexam',
    proof_simulation: 'fullexam',
    endurance: 'extended',
    extended_practice: 'extended',
    assessment_quiz: 'camp',
    trail_quiz: 'camp',
    camp_mode: 'camp',
    chill_mode: 'chill',
    subject_mode: 'subject',
    custom_session: 'custom',
    storm_mode: 'storm',
  }

  const v2Mode = modeKeyToV2[modeKey] ?? modeKey.replace(/_/g, '-')

  if (session.status === 'in_progress') {
    return `/quiz/${v2Mode}/session/${session.session_id}`
  }

  if (READING_MODES.has(modeKey)) {
    const articleSlug = session.config?.articleSlug
    if (articleSlug) {
      return `/dashboard/wiki/${articleSlug}`
    }
  }

  return `/quiz/${v2Mode}/session/${session.session_id}/results`
}

const getScoreDisplay = (session: SessionRecord): {
  label: string
  color: string
} => {
  if (session.status === 'in_progress') {
    return { label: 'In progress', color: 'var(--primary)' }
  }

  return { label: '\u2014', color: 'var(--muted-foreground)' }
}

const StatusDot = ({ status }: { status: string }) => {
  const dotStyle: CSSProperties =
    status === 'in_progress'
      ? { backgroundColor: 'var(--primary)' }
      : status === 'completed'
        ? { backgroundColor: 'var(--success)' }
        : { backgroundColor: 'var(--muted-foreground)' }

  const textStyle: CSSProperties =
    status === 'in_progress'
      ? { color: 'var(--primary)' }
      : status === 'completed'
        ? { color: 'var(--success)' }
        : { color: 'var(--muted-foreground)' }

  return (
    <span className="inline-flex items-center gap-1.5">
      <span
        className="inline-block h-1.5 w-1.5 flex-shrink-0 rounded-full"
        style={dotStyle}
        aria-hidden="true"
      />
      <span className="text-[12px]" style={textStyle}>
        {getStatusLabel(status)}
      </span>
    </span>
  )
}

const ActionLink = ({
  session,
  onAbandon,
  isAbandoning,
}: {
  session: SessionTableRow
  onAbandon: (sessionId: string) => Promise<void>
  isAbandoning: boolean
}) => {
  const isInProgress = session.status === 'in_progress'

  if (isInProgress) {
    return (
      <div className="flex items-center justify-end gap-2" onClick={(event) => event.stopPropagation()}>
        <Link
          href={session.sessionUrl}
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
              className="h-auto rounded-sm px-2 py-1 text-[12px] font-medium"
              style={{ color: 'var(--muted-foreground)' }}
              disabled={isAbandoning}
            >
              {isAbandoning ? 'Abandoning...' : 'Abandon'}
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-sm rounded-lg">
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
              <AlertDialogCancel className="rounded-sm text-[13px]">Keep going</AlertDialogCancel>
              <AlertDialogAction
                variant="destructive"
                className="rounded-sm bg-destructive text-[13px] text-white hover:bg-destructive/90"
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
      href={session.sessionUrl}
      className="text-[12px] font-medium transition-colors duration-150"
      style={{ color: 'var(--primary)' }}
      onClick={(event) => event.stopPropagation()}
    >
      Review {'->'}
    </Link>
  )
}

const MobileCard = ({
  session,
  onAbandon,
  isAbandoning,
}: {
  session: SessionTableRow
  onAbandon: (sessionId: string) => Promise<void>
  isAbandoning: boolean
}) => {
  const badgeStyle = getModeBadgeStyle(session.modeKey)

  return (
    <div
      className="cursor-pointer rounded-md border p-4 transition-colors duration-150"
      style={{
        backgroundColor: 'var(--surface-card)',
        borderColor: 'var(--border)',
      }}
      onClick={() => {
        window.location.href = session.sessionUrl
      }}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex flex-col gap-2">
          <div className="flex flex-wrap items-center gap-2">
            <span
              className="inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium"
              style={badgeStyle}
            >
              {session.modeLabel}
            </span>
            <StatusDot status={session.status} />
          </div>
          <div className="flex items-center gap-3 text-[12px]" style={{ color: 'var(--text-secondary)' }}>
            <span>
              <span className="font-[family-name:var(--font-dm-mono)]">
                {session.answeredQuestions}/{session.totalQuestions}
              </span>{' '}
              questions
            </span>
            <span
              className="font-[family-name:var(--font-dm-mono)]"
              title={new Date(session.activityDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric',
              })}
              style={{ color: 'var(--muted-foreground)' }}
            >
              {getRelativeTime(session.activityDate)}
            </span>
          </div>
        </div>
        <ActionLink
          session={session}
          onAbandon={onAbandon}
          isAbandoning={isAbandoning}
        />
      </div>
    </div>
  )
}

const SessionsTable = ({ sessions }: SessionsTableProps) => {
  const router = useRouter()
  const [mobileVisibleCount, setMobileVisibleCount] = useState(PAGE_SIZE)
  const [localSessions, setLocalSessions] = useState(sessions)
  const [abandoningId, setAbandoningId] = useState<string | null>(null)

  useEffect(() => {
    setLocalSessions(sessions)
    setMobileVisibleCount(PAGE_SIZE)
  }, [sessions])

  const handleAbandon = async (sessionId: string) => {
    setAbandoningId(sessionId)

    try {
      await abandonSessionAction(sessionId)
      setLocalSessions((previousSessions) =>
        previousSessions.map((session) =>
          session.session_id === sessionId
            ? { ...session, status: 'abandoned' as const }
            : session,
        ),
      )
    } finally {
      setAbandoningId(null)
    }
  }

  const rows = useMemo<SessionTableRow[]>(
    () =>
      localSessions.map((session) => {
        const modeKey = getModeKey(session)
        return {
          ...session,
          modeKey,
          modeLabel: getModeLabel(modeKey),
          statusLabel: getStatusLabel(session.status),
          totalQuestions: session.question_ids?.length ?? 0,
          answeredQuestions: session.current_question_index ?? 0,
          sessionUrl: getSessionUrl(session),
          activityDate: session.completed_at ?? session.updated_at,
        }
      }),
    [localSessions],
  )

  const mobileRows = useMemo(
    () =>
      [...rows]
        .sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime())
        .slice(0, mobileVisibleCount),
    [mobileVisibleCount, rows],
  )

  const hasMoreMobileRows = mobileVisibleCount < rows.length

  const columns: Column<SessionTableRow>[] = [
    {
      key: 'modeLabel',
      header: 'Mode',
      sortable: true,
      render: (session) => (
        <span
          className="inline-flex items-center rounded-sm px-2 py-0.5 text-[11px] font-medium"
          style={getModeBadgeStyle(session.modeKey)}
        >
          {session.modeLabel}
        </span>
      ),
    },
    {
      key: 'totalQuestions',
      header: 'Questions',
      sortable: true,
      render: (session) => (
        <span className="font-[family-name:var(--font-dm-mono)] text-[13px] text-foreground">
          {session.answeredQuestions}/{session.totalQuestions}
        </span>
      ),
    },
    {
      key: 'status',
      header: 'Score',
      sortable: true,
      render: (session) => {
        const score = getScoreDisplay(session)

        if (session.status === 'in_progress') {
          return (
            <span className="inline-flex items-center rounded-sm bg-primary-50 px-2 py-0.5 text-[11px] font-medium text-primary">
              In progress
            </span>
          )
        }

        return (
          <span className="font-[family-name:var(--font-dm-mono)] text-[13px]" style={{ color: score.color }}>
            {score.label}
          </span>
        )
      },
    },
    {
      key: 'statusLabel',
      header: 'Status',
      sortable: true,
      render: (session) => <StatusDot status={session.status} />,
    },
    {
      key: 'activityDate',
      header: 'Date',
      type: 'date',
      sortable: true,
      render: (session) => (
        <span
          className="font-[family-name:var(--font-dm-mono)] text-[12px]"
          title={new Date(session.activityDate).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          })}
          style={{ color: 'var(--muted-foreground)' }}
        >
          {getRelativeTime(session.activityDate)}
        </span>
      ),
    },
    {
      key: 'actions',
      header: '',
      type: 'action',
      render: (session) => (
        <ActionLink
          session={session}
          onAbandon={handleAbandon}
          isAbandoning={abandoningId === session.session_id}
        />
      ),
    },
  ]

  if (rows.length === 0) {
    return (
      <div
        className="rounded-md border py-12 text-center text-[13px]"
        style={{
          borderColor: 'var(--border)',
          color: 'var(--muted-foreground)',
          backgroundColor: 'var(--surface-light)',
        }}
      >
        No sessions yet. Start your first quiz above.
      </div>
    )
  }

  return (
    <div>
      <div className="hidden md:block">
        <DataTable
          columns={columns}
          data={rows}
          keyField="session_id"
          searchable
          searchPlaceholder="Search sessions"
          searchFields={['modeLabel', 'statusLabel', 'test_mode']}
          defaultSort={{ key: 'updated_at', direction: 'desc' }}
          pageSize={PAGE_SIZE}
          onRowClick={(session) => router.push(session.sessionUrl)}
        />
      </div>

      <div className="flex flex-col gap-3 md:hidden">
        {mobileRows.map((session) => (
          <MobileCard
            key={session.session_id}
            session={session}
            onAbandon={handleAbandon}
            isAbandoning={abandoningId === session.session_id}
          />
        ))}
      </div>

      {hasMoreMobileRows && (
        <div className="mt-4 flex justify-center md:hidden">
          <button
            type="button"
            className="rounded-sm border px-4 py-2 text-[13px] font-medium transition-colors duration-150"
            style={{
              borderColor: 'var(--border)',
              color: 'var(--text-secondary)',
              backgroundColor: 'var(--surface-card)',
            }}
            onClick={() => setMobileVisibleCount((count) => count + PAGE_SIZE)}
          >
            Show more ({rows.length - mobileVisibleCount} remaining)
          </button>
        </div>
      )}
    </div>
  )
}

SessionsTable.displayName = 'SessionsTable'

export { SessionsTable }
export type { SessionsTableProps }

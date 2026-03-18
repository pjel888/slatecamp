import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import type { ActivityFeedItem } from '@/types/dashboard'

// ── Icons ───────────────────────────────────────────────────────────────────

function CheckIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M3.5 7l2.5 2.5L10.5 4" stroke="#8896A7" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function XIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
      <path d="M4 4l6 6M10 4l-6 6" stroke="#8896A7" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  )
}

// ── Relative time ───────────────────────────────────────────────────────────

function formatRelative(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime()
  const hours = diff / (1000 * 60 * 60)
  if (hours < 1) return 'Just now'
  if (hours < 24) return `${Math.floor(hours)}h ago`
  const days = Math.floor(hours / 24)
  if (days === 1) return 'Yesterday'
  if (days < 7) return `${days} days ago`
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

// ── Component ───────────────────────────────────────────────────────────────

interface RecentActivityFeedProps {
  sessions: ActivityFeedItem[]
}

/**
 * DASHBOARD: RecentActivityFeed
 * Chronological list of sessions from the last 7 days.
 * No score colorization — per spec, neutral ink only.
 */
export function RecentActivityFeedNew({ sessions }: RecentActivityFeedProps) {
  return (
    <Card className="border p-3 bg-white h-full" style={{ borderColor: '#D4DAE3' }}>
      <p
        className="font-dm-mono text-[11px] font-medium uppercase tracking-[0.15em] mb-2"
        style={{ color: '#8896A7' }}
      >
        Recent Activity
      </p>

      {sessions.length === 0 ? (
        <div className="flex items-center justify-center py-6">
          <p className="text-[13px]" style={{ color: '#4A5568' }}>
            No sessions yet this week. Your heatmap is waiting.
          </p>
        </div>
      ) : (
        <div className="max-h-[200px] overflow-y-auto space-y-2 pr-1">
          {sessions.slice(0, 5).map((session) => {
            const Icon = session.status === 'completed' ? CheckIcon : XIcon

            return (
              <div
                key={session.sessionId}
                className="flex items-center gap-2.5 py-1 border-b last:border-b-0"
                style={{ borderColor: '#F2F0EB' }}
              >
                <div
                  className="shrink-0 rounded p-1"
                  style={{ backgroundColor: '#F8F7F5' }}
                >
                  <Icon />
                </div>

                <div className="flex-1 min-w-0">
                  <p
                    className="text-xs font-medium truncate"
                    style={{ color: '#1A2332' }}
                  >
                    {session.testMode} · {session.questionCount} question{session.questionCount !== 1 ? 's' : ''}
                  </p>
                </div>

                <span
                  className="shrink-0 text-[11px]"
                  style={{ color: '#8896A7' }}
                >
                  {formatRelative(session.updatedAt)}
                </span>
              </div>
            )
          })}
        </div>
      )}
    </Card>
  )
}

export function RecentActivityFeedSkeleton() {
  return (
    <Card className="border p-3 h-full" style={{ borderColor: '#D4DAE3' }}>
      <Skeleton className="h-3 w-24 mb-2" />
      {[1, 2, 3, 4].map((i) => (
        <div key={i} className="flex items-center gap-2.5 py-1.5">
          <Skeleton className="h-6 w-6 rounded" />
          <Skeleton className="h-3 flex-1" />
          <Skeleton className="h-3 w-12" />
        </div>
      ))}
    </Card>
  )
}

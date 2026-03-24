import type { Metadata } from 'next'
import { createClient } from '@/lib/supabase/server'
import { isAdmin } from '@/lib/admin/roles'

export const metadata: Metadata = { title: 'Activity Feed — SlateCamp Admin' }
import { redirect } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { SectionHeader } from '@/components/shared/section-header'
import { EmptyState } from '@/components/shared/empty-state'

/* ------------------------------------------------------------------ */
/*  Relative time helper                                               */
/* ------------------------------------------------------------------ */

const relativeTime = (dateStr: string): string => {
  const now = Date.now()
  const then = new Date(dateStr).getTime()
  const diffMs = now - then

  const seconds = Math.floor(diffMs / 1000)
  if (seconds < 60) return 'just now'

  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`

  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`

  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`

  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/* ------------------------------------------------------------------ */
/*  Action label mapping                                               */
/* ------------------------------------------------------------------ */

const actionLabel = (eventType: string): string => {
  const map: Record<string, string> = {
    INSERT: 'created',
    CREATE: 'created',
    UPDATE: 'updated',
    DELETE: 'deleted',
    PUBLISH: 'published',
  }
  return map[eventType?.toUpperCase()] ?? eventType.toLowerCase()
}

const eventBadgeVariant = (eventType: string) => {
  const upper = eventType?.toUpperCase()
  if (upper === 'INSERT' || upper === 'CREATE') return 'success' as const
  if (upper === 'UPDATE') return 'info' as const
  if (upper === 'DELETE') return 'danger' as const
  return 'default' as const
}

/* ------------------------------------------------------------------ */
/*  Initials helper                                                    */
/* ------------------------------------------------------------------ */

const getInitials = (actorId: string | null): string => {
  if (!actorId) return '??'
  return actorId.slice(0, 2).toUpperCase()
}

/* ------------------------------------------------------------------ */
/*  Content identifier helper                                          */
/* ------------------------------------------------------------------ */

const getContentIdentifier = (
  log: { table_name: string; record_id: string; content_snapshot: Record<string, unknown> | null },
): string => {
  const snapshot = log.content_snapshot
  if (snapshot) {
    if (typeof snapshot.title === 'string' && snapshot.title) return snapshot.title
    if (typeof snapshot.stem === 'string' && snapshot.stem) return snapshot.stem.slice(0, 60)
    if (typeof snapshot.name === 'string' && snapshot.name) return snapshot.name
    if (typeof snapshot.slug === 'string' && snapshot.slug) return snapshot.slug
  }
  return log.record_id.slice(0, 8)
}

/* ------------------------------------------------------------------ */
/*  Table name formatting                                              */
/* ------------------------------------------------------------------ */

const formatTableName = (tableName: string): string => {
  return tableName
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .replace(/^(.*)s$/, (_, base) => base) // crude singular
}

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const AdminActivityPage = async () => {
  const authorized = await isAdmin()
  if (!authorized) {
    redirect('/admin')
  }

  const supabase = await createClient()
  const { data: logs } = await supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50)

  const entries = (logs ?? []) as Array<{
    id: string
    actor_id: string
    event_type: string
    table_name: string
    record_id: string
    metadata: Record<string, unknown> | null
    content_snapshot: Record<string, unknown> | null
    created_at: string
  }>

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Activity"
        title="Activity Feed"
        subtitle="Recent content changes across the platform"
        level="page"
      />

      <Card>
        {entries.length === 0 ? (
          <EmptyState
            message="No activity yet"
            description="Content changes will appear here as they happen."
          />
        ) : (
          <div className="divide-y divide-border">
            {entries.map((log) => (
              <div
                key={log.id}
                className="flex items-start gap-3 px-4 py-3 first:pt-4 last:pb-4"
              >
                {/* Avatar */}
                <div
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#FEF2F2] font-[family-name:var(--font-dm-mono)] text-[11px] font-semibold text-[#B91C1C]"
                  aria-hidden="true"
                >
                  {getInitials(log.actor_id)}
                </div>

                {/* Content */}
                <div className="min-w-0 flex-1">
                  <p className="text-sm leading-snug text-foreground">
                    <span className="font-semibold">
                      {log.actor_id?.slice(0, 8) ?? 'System'}
                    </span>{' '}
                    {actionLabel(log.event_type)}{' '}
                    <span className="text-muted-foreground">
                      {formatTableName(log.table_name)}
                    </span>{' '}
                    <span className="font-medium">
                      {getContentIdentifier(log)}
                    </span>
                  </p>
                  <p className="mt-0.5 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
                    {relativeTime(log.created_at)}
                  </p>
                </div>

                {/* Badge */}
                <Badge
                  variant={eventBadgeVariant(log.event_type)}
                  size="xs"
                  className="shrink-0 mt-0.5"
                >
                  {log.event_type}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  )
}

export default AdminActivityPage

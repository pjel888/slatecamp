import type { Metadata } from 'next'
import { getAdminDashboardData } from '@/lib/actions/admin/dashboard'

export const metadata: Metadata = { title: 'Dashboard — SlateCamp Admin' }
import { SectionHeader } from '@/components/shared/section-header'
import { StatCard } from '@/components/shared/stat-card'
import { ActionCard } from '@/components/shared/action-card'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Plus,
  FileText,
  Upload,
  ClipboardCheck,
  GitBranch,
  ArrowRight,
} from 'lucide-react'

/* ------------------------------------------------------------------ */
/*  Relative time formatter                                            */
/* ------------------------------------------------------------------ */

const formatRelativeTime = (dateString: string): string => {
  const now = Date.now()
  const then = new Date(dateString).getTime()
  const diffMs = now - then
  const diffSeconds = Math.floor(diffMs / 1000)
  const diffMinutes = Math.floor(diffSeconds / 60)
  const diffHours = Math.floor(diffMinutes / 60)
  const diffDays = Math.floor(diffHours / 24)

  if (diffSeconds < 60) return 'just now'
  if (diffMinutes < 60) return `${diffMinutes}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 30) return `${diffDays}d ago`
  return new Date(dateString).toLocaleDateString()
}

/* ------------------------------------------------------------------ */
/*  Event type → badge variant mapping                                 */
/* ------------------------------------------------------------------ */

const eventBadgeVariant = (eventType: string) => {
  const normalized = eventType.toUpperCase()
  if (normalized.includes('CREATE') || normalized.includes('INSERT')) return 'success' as const
  if (normalized.includes('UPDATE')) return 'info' as const
  if (normalized.includes('DELETE')) return 'danger' as const
  if (normalized.includes('PUBLISH')) return 'purple' as const
  return 'default' as const
}

const eventBadgeLabel = (eventType: string) => {
  const normalized = eventType.toUpperCase()
  if (normalized.includes('CREATE') || normalized.includes('INSERT')) return 'CREATE'
  if (normalized.includes('UPDATE')) return 'UPDATE'
  if (normalized.includes('DELETE')) return 'DELETE'
  if (normalized.includes('PUBLISH')) return 'PUBLISH'
  return eventType.toUpperCase()
}

/* ------------------------------------------------------------------ */
/*  Actor initials helper                                              */
/* ------------------------------------------------------------------ */

const getInitials = (actorId: string): string => {
  // Use first two chars of the actor ID as initials
  return actorId.slice(0, 2).toUpperCase()
}

/* ------------------------------------------------------------------ */
/*  Quick actions config                                               */
/* ------------------------------------------------------------------ */

const quickActions = [
  { icon: <Plus className="h-4 w-4 text-muted-foreground" />, title: 'Create Question', subtitle: 'Add a new question to the bank', href: '/admin/questions/new' },
  { icon: <FileText className="h-4 w-4 text-muted-foreground" />, title: 'Create Article', subtitle: 'Write a new wiki article', href: '/admin/articles/new' },
  { icon: <Upload className="h-4 w-4 text-muted-foreground" />, title: 'Import Questions', subtitle: 'Bulk import from spreadsheet', href: '/admin/questions/import' },
  { icon: <ClipboardCheck className="h-4 w-4 text-muted-foreground" />, title: 'Review Queue', subtitle: 'Items awaiting review', href: '/admin/reviews' },
  { icon: <GitBranch className="h-4 w-4 text-muted-foreground" />, title: 'Taxonomy Editor', subtitle: 'Manage content taxonomy', href: '/admin/taxonomy' },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const AdminDashboardPage = async () => {
  const data = await getAdminDashboardData()

  const totalArticles = data.wikiTotal || 1 // avoid division by zero
  const publishedPct = Math.round((data.publishedArticles / totalArticles) * 100)
  const draftPct = Math.round((data.draftArticles / totalArticles) * 100)
  const otherPct = Math.max(0, 100 - publishedPct - draftPct)

  const recentLogs = data.recentAuditLogs.slice(0, 5)

  return (
    <div className="space-y-6">
      {/* Section 1: Page Header */}
      <SectionHeader
        level="page"
        eyebrow="Content Management"
        title="Dashboard"
      />

      {/* Section 2: Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard
          eyebrow="Total Questions"
          value={data.questions.toLocaleString()}
          color="text-primary"
          href="/admin/questions"
        />
        <StatCard
          eyebrow="Published Articles"
          value={data.publishedArticles.toLocaleString()}
          color="text-emerald-600"
          href="/admin/articles"
        />
        <StatCard
          eyebrow="Draft Articles"
          value={data.draftArticles.toLocaleString()}
          color="text-amber-600"
        />
        <StatCard
          eyebrow="Taxonomy Nodes"
          value={data.taxonomyNodes.toLocaleString()}
        />
      </div>

      {/* Section 3: Content Health Bar */}
      <Card size="md">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-semibold text-foreground">Content Health</span>
          <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
            {data.wikiTotal} total articles
          </span>
        </div>

        {/* Horizontal bar */}
        <div className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted">
          {publishedPct > 0 && (
            <div
              className="bg-emerald-500 transition-all duration-150"
              style={{ width: `${publishedPct}%` }}
            />
          )}
          {draftPct > 0 && (
            <div
              className="bg-amber-400 transition-all duration-150"
              style={{ width: `${draftPct}%` }}
            />
          )}
          {otherPct > 0 && (
            <div
              className="bg-muted-foreground/20 transition-all duration-150"
              style={{ width: `${otherPct}%` }}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 mt-3">
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
              Published {publishedPct}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
              Draft {draftPct}%
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-muted-foreground/20" />
            <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
              Other {otherPct}%
            </span>
          </div>
        </div>
      </Card>

      {/* Section 4: Two-column grid */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* LEFT: Recent Activity */}
        <Card size="md">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold text-foreground">Recent Activity</span>
            <Link
              href="/admin/audit"
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors duration-150"
            >
              View all
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          {recentLogs.length === 0 ? (
            <p className="text-sm text-muted-foreground py-6 text-center">
              No recent activity recorded.
            </p>
          ) : (
            <div className="space-y-3">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-start gap-3">
                  {/* Avatar circle */}
                  <div className="h-8 w-8 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-primary">
                      {getInitials(log.actor_id)}
                    </span>
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-xs font-semibold text-foreground truncate">
                        {log.actor_id.slice(0, 8)}
                      </span>
                      <Badge variant={eventBadgeVariant(log.event_type)} size="xs">
                        {eventBadgeLabel(log.event_type)}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-0.5 truncate">
                      {log.table_name}{log.record_id ? ` — ${log.record_id.slice(0, 8)}` : ''}
                    </p>
                  </div>

                  {/* Timestamp */}
                  <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground shrink-0">
                    {formatRelativeTime(log.created_at)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* RIGHT: Quick Actions */}
        <div className="space-y-3">
          <SectionHeader
            level="section"
            eyebrow="Quick Actions"
            title="Common Tasks"
          />
          <div className="space-y-2">
            {quickActions.map((action) => (
              <ActionCard
                key={action.href}
                icon={action.icon}
                title={action.title}
                subtitle={action.subtitle}
                href={action.href}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default AdminDashboardPage

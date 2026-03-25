import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, FileText, UploadSimple, ArrowRight, Warning, ClipboardText, GitBranch, SquaresFour } from '@phosphor-icons/react/dist/ssr'
import { getAdminDashboardData, getContentBySubject, getCriticalCoverageGap, getNeedsAttentionData } from '@/lib/actions/admin/dashboard'
import { formatRelativeTime } from '@/lib/utils/format-time'
import { SectionHeader } from '@/components/shared/section-header'
import { StatCard } from '@/components/shared/stat-card'
import { ActionCard } from '@/components/shared/action-card'
import { Card } from '@/components/ui/card'
import { EventBadge } from '@/components/ui/event-badge'
import { Eyebrow } from '@/components/ui/eyebrow'
import { NeedsAttentionCard } from '@/components/admin/NeedsAttentionCard'

export const metadata: Metadata = { title: 'Dashboard — SlateCamp Admin' }

/* ------------------------------------------------------------------ */
/*  Actor initials helper                                               */
/* ------------------------------------------------------------------ */

const getInitials = (actorId: string): string => actorId.slice(0, 2).toUpperCase()

/* ------------------------------------------------------------------ */
/*  Quick actions config                                               */
/* ------------------------------------------------------------------ */

const quickActions = [
  {
    icon: <Plus size={16} className="text-muted-foreground" />,
    title: 'Create Question',
    subtitle: 'Add a new question to the bank',
    href: '/admin/questions/new',
  },
  {
    icon: <FileText size={16} className="text-muted-foreground" />,
    title: 'Create Article',
    subtitle: 'Write a new wiki article',
    href: '/admin/articles/new',
  },
  {
    icon: <SquaresFour size={16} className="text-muted-foreground" />,
    title: 'Content Editor',
    subtitle: 'Manage existing content',
    href: '/admin/content',
  },
  {
    icon: <UploadSimple size={16} className="text-muted-foreground" />,
    title: 'Import Questions',
    subtitle: 'Bulk import from spreadsheet',
    href: '/admin/questions/import',
  },
  {
    icon: <ClipboardText size={16} className="text-muted-foreground" />,
    title: 'Review Queue',
    subtitle: 'Items awaiting review',
    href: '/admin/reviews',
  },
  {
    icon: <GitBranch size={16} className="text-muted-foreground" />,
    title: 'Taxonomy Editor',
    subtitle: 'Manage content taxonomy',
    href: '/admin/taxonomy',
  },
]

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const AdminDashboardPage = async () => {
  const [data, subjectCounts, coverageGap, attentionData] = await Promise.all([
    getAdminDashboardData(),
    getContentBySubject(),
    getCriticalCoverageGap(),
    getNeedsAttentionData(),
  ])

  const recentLogs = data.recentAuditLogs.slice(0, 10)

  // Compute max question count for bar chart scaling
  const maxQuestions = Math.max(...subjectCounts.map((s) => s.questionCount), 1)

  return (
    <div className="space-y-6">

      {/* Section 1: Page Header */}
      <SectionHeader
        level="page"
        eyebrow="Content Management"
        title="Dashboard"
      />

      {/* Section 2: Coverage Alert */}
      {coverageGap && (
        <div className="flex items-start gap-3 rounded-md border border-amber-200 bg-amber-50 px-4 py-3">
          <Warning size={16} className="shrink-0 text-amber-600 mt-0.5" />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-amber-900">
              Coverage gap detected
            </p>
            <p className="text-xs text-amber-700 mt-0.5">
              <span className="font-semibold">{coverageGap.name}</span>
              {coverageGap.ale_id && (
                <span className="font-[family-name:var(--font-dm-mono)] ml-1">({coverageGap.ale_id})</span>
              )}
              {' '}has <span className="font-semibold">{coverageGap.exam_frequency}</span> exam frequency but 0 questions.
            </p>
          </div>
          <Link
            href="/admin/questions/new"
            className="shrink-0 inline-flex items-center gap-1 text-xs font-medium text-amber-800 hover:text-amber-900 transition-colors duration-150"
          >
            Create content
            <ArrowRight size={12} />
          </Link>
        </div>
      )}

      {/* Section 3: Needs Attention */}
      <NeedsAttentionCard {...attentionData} />

      {/* Section 4: Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          eyebrow="Total Questions"
          value={data.questions.toLocaleString()}
          color="text-primary"
          href="/admin/questions"
        />
        <StatCard
          eyebrow="Total Articles"
          value={data.wikiTotal.toLocaleString()}
          href="/admin/articles"
        />
        <StatCard
          eyebrow="Published"
          value={data.publishedArticles.toLocaleString()}
          color="text-emerald-600"
          href="/admin/articles"
        />
        <StatCard
          eyebrow="Draft"
          value={data.draftArticles.toLocaleString()}
          color="text-amber-600"
        />
      </div>

      {/* Section 4: Content by Subject */}
      {subjectCounts.length > 0 && (
        <Card size="md">
          <div className="flex items-center justify-between mb-4">
            <Eyebrow>Content by Subject</Eyebrow>
          </div>
          <div className="space-y-2.5">
            {subjectCounts.map((subject) => {
              const pct = Math.round((subject.questionCount / maxQuestions) * 100)
              return (
                <div key={subject.node_id} className="flex items-center gap-3">
                  <div className="w-32 shrink-0">
                    <span className="text-xs font-medium text-foreground truncate block" title={subject.name}>
                      {subject.name}
                    </span>
                    {subject.ale_id && (
                      <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
                        {subject.ale_id}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary/60 rounded-full transition-all duration-150"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <div className="flex items-center gap-2 shrink-0 text-right">
                    <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-foreground tabular-nums w-8 text-right">
                      {subject.questionCount}
                    </span>
                    <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">q</span>
                    <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground tabular-nums w-6 text-right">
                      {subject.articleCount}
                    </span>
                    <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">a</span>
                  </div>
                </div>
              )
            })}
          </div>
        </Card>
      )}

      {/* Section 5: Two-column grid — Quick Actions + Recent Activity */}
      <div className="grid gap-4 lg:grid-cols-2">

        {/* LEFT: Quick Actions */}
        <div className="space-y-3">
          <Eyebrow>Quick Actions</Eyebrow>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-3">
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

        {/* RIGHT: Recent Activity */}
        <Card size="md">
          <div className="flex items-center justify-between mb-4">
            <Eyebrow>Recent Activity</Eyebrow>
            <Link
              href="/admin/activity"
              aria-label="View all recent activity"
              className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors duration-150"
            >
              View all
              <ArrowRight size={12} />
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
                  <div className="h-7 w-7 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
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
                      <EventBadge eventType={log.event_type} />
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
      </div>
    </div>
  )
}

export default AdminDashboardPage

import type { Metadata } from 'next'
import Link from 'next/link'
import { ROUTES } from '@/lib/routes'
import { Plus, FileText, UploadSimple, ArrowRight, Warning, ClipboardText, GitBranch, SquaresFour } from '@phosphor-icons/react/dist/ssr'
import { getAdminDashboardData, getContentBySubject, getCriticalCoverageGap, getNeedsAttentionData } from '@/lib/actions/admin/dashboard'
import { formatRelativeTime } from '@/lib/utils/format-time'
import { SectionHeader } from '@/components/shared/section-header'
import { StatCard } from '@/components/shared/stat-card'
import { ActionCard } from '@/components/shared/action-card'
import { EventBadge } from '@/components/shared/event-badge'
import { Eyebrow } from '@/components/ui/eyebrow'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import { NeedsAttentionCard } from '@/components/admin/NeedsAttentionCard'
import { DashboardMetricCard } from '@/components/shared/dashboard-metric-card'
import { SubjectDistributionBar } from '@/components/shared/subject-distribution-bar'

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
    href: '/admin/knowledge/questions/new',
  },
  {
    icon: <FileText size={16} className="text-muted-foreground" />,
    title: 'Create Article',
    subtitle: 'Write a new wiki article',
    href: '/admin/knowledge/new',
  },
  {
    icon: <SquaresFour size={16} className="text-muted-foreground" />,
    title: 'Knowledge Browser',
    subtitle: 'Manage existing content',
    href: '/admin/knowledge',
  },
  {
    icon: <UploadSimple size={16} className="text-muted-foreground" />,
    title: 'Import Content',
    subtitle: 'Bulk import from spreadsheet',
    href: '/admin/knowledge/import',
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
      <Breadcrumb
        items={[
          { label: 'Admin', href: ROUTES.admin.root },
          { label: 'Dashboard' },
        ]}
      />

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
              {coverageGap.lea_id && (
                <span className="font-[family-name:var(--font-dm-mono)] ml-1">({coverageGap.lea_id})</span>
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
          href={ROUTES.admin.knowledgeQuestions}
        />
        <StatCard
          eyebrow="Total Articles"
          value={data.wikiTotal.toLocaleString()}
          href={ROUTES.admin.knowledge}
        />
        <StatCard
          eyebrow="Published"
          value={data.publishedArticles.toLocaleString()}
          color="text-emerald-600"
          href={ROUTES.admin.knowledge}
        />
        <StatCard
          eyebrow="Draft"
          value={data.draftArticles.toLocaleString()}
          color="text-amber-600"
        />
      </div>

      {/* Section 4: Content by Subject */}
      {subjectCounts.length > 0 && (
        <DashboardMetricCard
          headerProps={{
            eyebrow: "Content by Subject",
            title: "Resource Distribution",
            subtitle: "Resource distribution across the syllabus",
            action: (
              <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider font-bold text-text-tertiary">
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-primary/60" />
                  <span>Questions</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  <span>Articles</span>
                </div>
              </div>
            )
          }}
        >
          <SubjectDistributionBar 
            items={subjectCounts.map(s => ({
              id: s.node_id,
              leaId: s.lea_id,
              name: s.name,
              primaryCount: s.questionCount,
              secondaryCount: s.articleCount
            }))}
            maxPrimaryCount={maxQuestions}
          />
        </DashboardMetricCard>
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
        <DashboardMetricCard
          headerProps={{
            eyebrow: "Recent Activity",
            title: "System Logs",
            action: (
              <Link
                href={ROUTES.admin.activity}
                aria-label="View all recent activity"
                className="inline-flex items-center gap-1 text-xs text-primary hover:text-primary/80 transition-colors duration-150"
              >
                View all
                <ArrowRight size={12} />
              </Link>
            )
          }}
        >
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
        </DashboardMetricCard>
      </div>
    </div>
  )
}

export default AdminDashboardPage

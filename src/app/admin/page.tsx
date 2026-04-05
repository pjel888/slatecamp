import type { Metadata } from 'next'
import Link from 'next/link'
import { Plus, FileText, UploadSimple, ArrowRight, Warning, ClipboardText, GitBranch, SquaresFour } from '@phosphor-icons/react/dist/ssr'
import { getAdminDashboardData, getContentBySubject, getCriticalCoverageGap, getNeedsAttentionData } from '@/lib/actions/admin/dashboard'
import { cn } from '@/lib/utils'
import { formatRelativeTime } from '@/lib/utils/format-time'
import { SectionHeader } from '@/components/shared/section-header'
import { StatCard } from '@/components/shared/stat-card'
import { ActionCard } from '@/components/shared/action-card'
import { Card } from '@/components/ui/card'
import { EventBadge } from '@/components/shared/event-badge'
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
          href="/admin/knowledge/questions"
        />
        <StatCard
          eyebrow="Total Articles"
          value={data.wikiTotal.toLocaleString()}
          href="/admin/knowledge"
        />
        <StatCard
          eyebrow="Published"
          value={data.publishedArticles.toLocaleString()}
          color="text-emerald-600"
          href="/admin/knowledge"
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
          <div className="flex items-center justify-between mb-6">
            <div>
              <Eyebrow>Content by Subject</Eyebrow>
              <p className="text-xs text-muted-foreground mt-1">Resource distribution across the syllabus</p>
            </div>
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
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-6">
            {subjectCounts.map((subject) => {
              const qPct = Math.round((subject.questionCount / maxQuestions) * 100)
              const aPct = Math.min(100, Math.round((subject.articleCount / 20) * 100)) // Arbitrary 20 as "full" for articles for scale
              
              // Color mapping based on subject code
              const colorClass = 
                subject.ale_id?.includes('PRAC') ? 'bg-emerald-500' :
                subject.ale_id?.includes('HIST') ? 'bg-amber-500' :
                subject.ale_id?.includes('THEO') ? 'bg-sky-500' :
                subject.ale_id?.includes('PLAN') ? 'bg-indigo-500' :
                subject.ale_id?.includes('STRC') ? 'bg-rose-500' :
                subject.ale_id?.includes('MATL') ? 'bg-violet-500' :
                subject.ale_id?.includes('DSGN') ? 'bg-cyan-500' :
                subject.ale_id?.includes('UTIL') ? 'bg-orange-500' :
                'bg-primary'

              return (
                <div key={subject.node_id} className="space-y-2">
                  <div className="flex items-end justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-[11px] font-bold text-text-tertiary uppercase truncate">
                        {subject.ale_id || 'Subject'}
                      </p>
                      <p className="text-xs font-semibold text-foreground truncate" title={subject.name}>
                        {subject.name}
                      </p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <span className="block text-xs font-bold text-foreground tabular-nums">
                          {subject.questionCount}
                        </span>
                        <span className="block text-[9px] text-muted-foreground uppercase font-bold">Items</span>
                      </div>
                      <div className="text-right">
                        <span className="block text-xs font-bold text-text-secondary tabular-nums">
                          {subject.articleCount}
                        </span>
                        <span className="block text-[9px] text-muted-foreground uppercase font-bold">Wiki</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="relative h-1.5 w-full bg-muted rounded-full overflow-hidden">
                    <div
                      className={cn("absolute inset-y-0 left-0 rounded-full transition-all duration-500 ease-out", colorClass)}
                      style={{ width: `${qPct}%`, opacity: 0.7 }}
                    />
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

import Link from 'next/link'
import { ActionCard } from '@/components/shared/action-card'
import { SectionHeader } from '@/components/shared/section-header'
import { StatCard } from '@/components/shared/stat-card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Database, Flask, Pulse, Wrench, ToggleRight } from '@phosphor-icons/react/dist/ssr'
import { CHANGELOG } from '@/lib/developer/changelog'
import { developerPortalTechStack } from '@/lib/developer/tech-stack'
import { getDeveloperRepoMetrics } from '@/lib/developer/repo-metrics'
import { Card } from '@/components/ui/card'
import { developerOverviewCards, developerQuickActions, developerToolCount } from '@/lib/developer/surface-registry'

import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Developer Portal — SlateCamp',
  description: 'Internal documentation, API reference, architecture guides, and dev tools for the SlateCamp engineering team.',
}

const healthServices = [
  { name: 'Database', status: 'operational' as const },
  { name: 'API', status: 'operational' as const },
  { name: 'Auth', status: 'operational' as const },
  { name: 'Cache', status: 'degraded' as const },
]

const overviewCardIconMap = {
  apiReference: BookOpen,
  status: Pulse,
  tools: Wrench,
} as const

const quickActionIconMap = {
  database: Database,
  console: ToggleRight,
  testData: Flask,
} as const

const StatusDot = ({ status, name }: { status: 'operational' | 'degraded'; name: string }) => {
  const isOperational = status === 'operational'
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium">
      <span
        className={`w-1.5 h-1.5 rounded-full ${isOperational ? 'bg-emerald-500' : 'bg-amber-500'}`}
      />
      <span className={isOperational ? 'text-emerald-600' : 'text-amber-600'}>
        {name}
      </span>
    </span>
  )
}

const DeveloperPortalPage = async () => {
  const supabase = await createClient()

  const [
    { count: usersCount },
    { count: articlesCount },
    { count: questionsCount },
    { count: sessionsCount },
    repoMetrics,
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('wiki_articles').select('id', { count: 'exact', head: true }),
    supabase.from('questions').select('id', { count: 'exact', head: true }),
    supabase.from('quiz_sessions').select('id', { count: 'exact', head: true }),
    getDeveloperRepoMetrics(),
  ])

  const checkedAtLabel = new Date().toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })

  const stats = [
    { eyebrow: 'Users', value: usersCount ?? 0 },
    { eyebrow: 'Articles', value: articlesCount ?? 0 },
    { eyebrow: 'Questions', value: questionsCount ?? 0 },
    { eyebrow: 'Sessions', value: sessionsCount ?? 0 },
    { eyebrow: 'Stories', value: repoMetrics.storyCount },
    { eyebrow: 'Source Files', value: repoMetrics.sourceFileCount },
  ]

  return (
    <div className="max-w-5xl space-y-8">
      <SectionHeader
        eyebrow="Internal Docs & Tools"
        title="Developer Portal"
        subtitle="Documentation, API reference, architecture guides, and engineering tools for the SlateCamp platform."
        level="page"
        className="max-w-xl"
      />

      {/* Section Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {developerOverviewCards.map((card) => {
          const Icon = overviewCardIconMap[card.iconKey]
          const badge =
            card.id === 'api-reference'
              ? 'Reference'
              : card.id === 'status-overview'
                ? 'Operational'
                : `${developerToolCount} Tools`
          const badgeVariant =
            card.id === 'status-overview' ? ('success' as const) : ('default' as const)

          return (
            <ActionCard
              key={card.href}
              href={card.href}
              title={card.title}
              description={card.description}
              icon={<Icon className="h-4 w-4 text-primary" />}
              badge={
                <Badge variant={badgeVariant} size="xs" shape="pill">
                  {badge}
                </Badge>
              }
            />
          )
        })}
      </div>

      {/* System Health Summary */}
      <Card className="p-2.5">
        <div className="flex items-center gap-4 flex-wrap">
          <span className="text-[11px] font-semibold text-foreground">System Health</span>
          <div className="flex items-center gap-3">
            {healthServices.map((service) => (
              <StatusDot key={service.name} status={service.status} name={service.name} />
            ))}
          </div>
          <span className="h-3 w-px bg-border" />
          <span className="text-[11px] text-muted-foreground font-[family-name:var(--font-dm-mono)]">
            Snapshot: {checkedAtLabel}
          </span>
        </div>
      </Card>

      {/* Quick Actions */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {developerQuickActions.map((action) => {
            const Icon = quickActionIconMap[action.iconKey]
            return (
              <Link key={action.label} href={action.href}>
                <Card variant="interactive" size="sm" className="h-full">
                  <div className="flex items-center gap-2">
                    <Icon className="w-3.5 h-3.5 text-primary" />
                    <span className="text-[11px] font-medium text-foreground">{action.label}</span>
                  </div>
                </Card>
              </Link>
            )
          })}
        </div>
      </div>

      {/* Platform Metrics */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2">
          Platform Metrics
        </p>
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
          {stats.map((stat) => (
            <StatCard
              key={stat.eyebrow}
              eyebrow={stat.eyebrow}
              value={stat.value}
              color="text-primary"
            />
          ))}
        </div>
      </div>

      {/* Tech Stack */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2">
          Tech Stack
        </p>
        <div className="rounded-xs border border-border overflow-hidden">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border bg-muted">
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Layer</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Package</th>
                <th className="px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">Version</th>
              </tr>
            </thead>
            <tbody>
              {developerPortalTechStack.map((row) => (
                <tr key={row.label} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-2 text-xs text-foreground">{row.label}</td>
                  <td className="px-4 py-2 text-xs font-mono text-foreground">{row.pkg}</td>
                  <td className="px-4 py-2 text-xs font-mono text-muted-foreground">{row.version}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Changes */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2">
          Recent Changes
        </p>
        <div className="space-y-2">
          {CHANGELOG.slice(0, 5).map((entry) => (
            <div
              key={`${entry.date}-${entry.title}`}
              className="flex items-start gap-3 rounded-md border border-border bg-card px-4 py-3"
            >
              <span className="shrink-0 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground pt-px">
                {entry.date}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-foreground truncate">
                    {entry.title}
                  </span>
                  {entry.badge && (
                    <Badge
                      variant={
                        entry.badge === 'new'
                          ? 'success'
                          : entry.badge === 'fix'
                            ? 'danger'
                            : 'default'
                      }
                      size="xs"
                      shape="pill"
                    >
                      {entry.badge}
                    </Badge>
                  )}
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed mt-0.5">
                  {entry.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default DeveloperPortalPage

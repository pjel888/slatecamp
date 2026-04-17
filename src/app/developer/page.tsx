import Link from 'next/link'
import { ActionCard } from '@/components/shared/action-card'
import { SectionHeader } from '@/components/shared/section-header'
import { StatCard } from '@/components/shared/stat-card'
import { Badge } from '@/components/ui/badge'
import { BookOpen, Database, Flask, Pulse, Wrench, ToggleRight, UserGear } from '@phosphor-icons/react/dist/ssr'
import { CHANGELOG } from '@/lib/developer/changelog'
import { Card } from '@/components/ui/card'

import { createClient } from '@/lib/supabase/server'

export const metadata = {
  title: 'Developer Portal — SlateCamp',
  description: 'Internal documentation, API reference, architecture guides, and dev tools for the SlateCamp engineering team.',
}

const sectionCards = [
  {
    title: 'API Reference',
    description: 'Server actions, internal endpoints, payload contracts, and integration notes.',
    icon: BookOpen,
    href: '/developer/api-reference',
    badge: 'Reference',
    badgeVariant: 'default' as const,
  },
  {
    title: 'System Status',
    description: 'Database health, API latency, edge functions, and deployment status.',
    icon: Pulse,
    href: '/developer/status',
    badge: 'Operational',
    badgeVariant: 'success' as const,
  },
  {
    title: 'Dev Tools',
    description: 'Feature flags, user impersonation, and test data generation.',
    icon: Wrench,
    href: '/developer/tools',
    badge: '3 Tools',
    badgeVariant: 'default' as const,
  },
]

const healthServices = [
  { name: 'Database', status: 'operational' as const },
  { name: 'API', status: 'operational' as const },
  { name: 'Auth', status: 'operational' as const },
  { name: 'Cache', status: 'degraded' as const },
]

const quickActions = [
  { label: 'Check DB Status', href: '/developer/status/database', icon: Database },
  { label: 'Toggle Feature Flag', href: '/developer/tools', icon: ToggleRight },
  { label: 'Impersonate User', href: '/developer/tools', icon: UserGear },
  { label: 'Generate Test Data', href: '/developer/tools/test-data', icon: Flask },
]

const techStack = [
  { layer: 'Framework', pkg: 'next', version: '16.1.6' },
  { layer: 'Runtime', pkg: 'react / react-dom', version: '19.2.4' },
  { layer: 'Language', pkg: 'typescript', version: '5.9.3' },
  { layer: 'Styling', pkg: 'tailwindcss', version: '4.2.2' },
  { layer: 'UI', pkg: '@base-ui/react + shadcn', version: '1.3.0 / 4.1.0' },
  { layer: 'Database', pkg: '@supabase/supabase-js', version: '2.101.1' },
  { layer: 'State', pkg: 'zustand', version: '5.0.12' },
  { layer: 'AI', pkg: '@anthropic-ai/sdk', version: '0.78.0' },
  { layer: '3D', pkg: 'three / @react-three/fiber', version: '0.183.2 / 9.5.0' },
  { layer: 'Payments', pkg: '@lemonsqueezy/lemonsqueezy.js + payrex-node', version: '1.2.5 / 1.7.3' },
]

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
  ] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }),
    supabase.from('wiki_articles').select('id', { count: 'exact', head: true }),
    supabase.from('questions').select('id', { count: 'exact', head: true }),
    supabase.from('quiz_sessions').select('id', { count: 'exact', head: true }),
  ])

  const stats = [
    { eyebrow: 'Users', value: usersCount ?? 0 },
    { eyebrow: 'Articles', value: articlesCount ?? 0 },
    { eyebrow: 'Questions', value: questionsCount ?? 0 },
    { eyebrow: 'Sessions', value: sessionsCount ?? 0 },
    { eyebrow: 'Stories', value: '71+' },
    { eyebrow: 'LOC', value: '26K' },
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
        {sectionCards.map((card) => (
          <ActionCard
            key={card.href}
            href={card.href}
            title={card.title}
            description={card.description}
            icon={<card.icon className="h-4 w-4 text-primary" />}
            badge={
              <Badge variant={card.badgeVariant} size="xs" shape="pill">
                {card.badge}
              </Badge>
            }
          />
        ))}
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
            Last checked: 3s ago
          </span>
        </div>
      </Card>

      {/* Quick Actions */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2">
          Quick Actions
        </p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {quickActions.map((action) => (
            <Link key={action.label} href={action.href}>
              <Card variant="interactive" size="sm" className="h-full">
                <div className="flex items-center gap-2">
                  <action.icon className="w-3.5 h-3.5 text-primary" />
                  <span className="text-[11px] font-medium text-foreground">{action.label}</span>
                </div>
              </Card>
            </Link>
          ))}
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
              {techStack.map((row) => (
                <tr key={row.layer} className="border-b border-border last:border-0 hover:bg-muted/50 transition-colors">
                  <td className="px-4 py-2 text-xs text-foreground">{row.layer}</td>
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

import { ROUTES } from '@/lib/constants/routes'
import { Card } from '@/components/ui/card'
import { StatCard } from '@/components/shared/stat-card'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'
import {
  Palette,
  Code2,
  Layers,
  Grid3X3,
  Wrench,
  Activity,
} from 'lucide-react'

export const metadata = {
  title: 'Developer Portal — SlateCamp',
  description: 'Internal documentation, API reference, architecture guides, and dev tools for the SlateCamp engineering team.',
}

const quickLinks = [
  {
    title: 'Design System',
    description: 'Colors, typography, components, tokens, and the Campfire visual language.',
    icon: Palette,
    href: ROUTES.DEVELOPER_DESIGN_SYSTEM,
  },
  {
    title: 'API Reference',
    description: '11 route handlers, 50+ server actions, webhook documentation.',
    icon: Code2,
    href: ROUTES.DEVELOPER_API_REFERENCE,
  },
  {
    title: 'Architecture',
    description: 'Schema, auth, mastery engine, data flow, and deployment.',
    icon: Layers,
    href: ROUTES.DEVELOPER_DOCS,
  },
  {
    title: 'Component Library',
    description: '247 components — UI primitives, MDX blocks, interactive widgets.',
    icon: Grid3X3,
    href: ROUTES.DEVELOPER_COMPONENTS,
  },
  {
    title: 'Dev Tools',
    description: 'Console, database browser, audit logs, and test data generator.',
    icon: Wrench,
    href: ROUTES.DEVELOPER_TOOLS,
  },
  {
    title: 'System Health',
    description: 'Environment status, cron jobs, and platform metrics.',
    icon: Activity,
    href: ROUTES.DEVELOPER_TOOLS,
  },
]

const stats = [
  { eyebrow: 'Tables', value: 50 },
  { eyebrow: 'API Routes', value: 11 },
  { eyebrow: 'Actions', value: '50+' },
  { eyebrow: 'Components', value: 247 },
  { eyebrow: 'RLS Policies', value: 89 },
  { eyebrow: 'LOC', value: '26K' },
]

const techStack = [
  { layer: 'Framework', pkg: 'next', version: '16.1.6' },
  { layer: 'Runtime', pkg: 'react / react-dom', version: '19.2.4' },
  { layer: 'Language', pkg: 'typescript', version: '5.9.3' },
  { layer: 'Styling', pkg: 'tailwindcss', version: '4.2.2' },
  { layer: 'UI', pkg: '@base-ui/react + shadcn', version: '1.3.0 / 4.1.0' },
  { layer: 'Database', pkg: '@supabase/supabase-js', version: '2.100.0' },
  { layer: 'State', pkg: 'zustand', version: '5.0.12' },
  { layer: 'AI', pkg: '@anthropic-ai/sdk', version: '0.78.0' },
  { layer: '3D', pkg: 'three / @react-three/fiber', version: '0.183.2 / 9.5.0' },
  { layer: 'Payments', pkg: 'stripe + payrex-node', version: '20.4.1 / 1.7.3' },
]

export default function DeveloperPortalPage() {
  return (
    <div className="max-w-5xl space-y-8">
      {/* Hero */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-0.5">
          Internal Docs & Tools
        </p>
        <h1 className="font-[family-name:var(--font-display)] font-extrabold text-xl text-foreground tracking-tight">
          Developer Portal
        </h1>
        <p className="text-[13px] text-muted-foreground leading-relaxed max-w-xl mt-1">
          Documentation, API reference, architecture guides, and engineering tools for the SlateCamp platform.
        </p>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {quickLinks.map((link) => (
          <Link key={link.href + link.title} href={link.href}>
            <Card variant="interactive" size="sm" className="h-full">
              <div className="flex items-center gap-2 mb-1.5">
                <link.icon className="w-4 h-4 text-primary" />
                <span className="text-[13px] font-semibold text-foreground">{link.title}</span>
              </div>
              <p className="text-[11px] text-muted-foreground leading-relaxed">{link.description}</p>
            </Card>
          </Link>
        ))}
      </div>

      {/* Platform Metrics */}
      <div>
        <p className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2">
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
        <p className="font-[family-name:var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2">
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
    </div>
  )
}

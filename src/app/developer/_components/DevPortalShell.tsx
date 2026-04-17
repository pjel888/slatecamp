'use client'

import { Database, Monitor, Flask, BookOpen, SquaresFour, Pulse, HardDrives, Wrench, Stack, Scroll } from '@phosphor-icons/react/dist/ssr'
import { PortalLayout } from '@/components/portal'
import { SidebarProvider } from '@/components/sidebar/SidebarProvider'
import { Badge } from '@/components/ui/badge'
import { DevPortalSearch } from './DevPortalSearch'
import { PORTALS } from '@/config/portals'
import type { NavGroup } from '@/components/portal'
import { ROUTES } from '@/lib/routes'

const devNavItems: NavGroup[] = [
  {
    label: 'Portal',
    items: [
      { href: ROUTES.developer.root, label: 'Overview', icon: <SquaresFour className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Documentation',
    items: [
      { href: ROUTES.developer.apiReference, label: 'API Reference', icon: <BookOpen className="w-3.5 h-3.5" weight="regular" /> },
      { href: ROUTES.developer.architecture, label: 'Architecture', icon: <Stack className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Status',
    items: [
      { href: ROUTES.developer.status, label: 'Overview', icon: <Pulse className="w-3.5 h-3.5" /> },
      { href: ROUTES.developer.statusDatabase, label: 'Database', icon: <Database className="w-3.5 h-3.5" /> },
      { href: ROUTES.developer.statusInfrastructure, label: 'Infrastructure', icon: <HardDrives className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: ROUTES.developer.tools, label: 'Dev Tools', icon: <Wrench className="w-3.5 h-3.5" /> },
      { href: ROUTES.developer.console, label: 'Console', icon: <Monitor className="w-3.5 h-3.5" /> },
      { href: ROUTES.developer.db, label: 'Database Browser', icon: <Database className="w-3.5 h-3.5" /> },
      { href: ROUTES.developer.logs, label: 'Audit Logs', icon: <Scroll className="w-3.5 h-3.5" /> },
      { href: ROUTES.developer.testData, label: 'Test Data', icon: <Flask className="w-3.5 h-3.5" /> },
    ],
  },
]

interface DevPortalShellProps {
  env: 'development' | 'staging' | 'production'
  children: React.ReactNode
}

const envBadgeVariant = {
  development: 'success' as const,
  staging: 'warning' as const,
  production: 'danger' as const,
}

export const DevPortalShell = ({ env, children }: DevPortalShellProps) => (
  <SidebarProvider disableShortcuts={true}>
    <PortalLayout
      portalLabel={PORTALS.developer.label}
      topbarBg={PORTALS.developer.topbarBg}
      accentColor={PORTALS.developer.accentColor}
      accentLightColor={PORTALS.developer.accentLightColor}
      navItems={devNavItems}
      rightContent={
        <Badge
          variant={envBadgeVariant[env]}
          size="xs"
          shape="pill"
          className="font-[family-name:var(--font-dm-mono)]"
        >
          {env}
        </Badge>
      }
      searchComponent={<DevPortalSearch />}
    >
      {children}
    </PortalLayout>
  </SidebarProvider>
)

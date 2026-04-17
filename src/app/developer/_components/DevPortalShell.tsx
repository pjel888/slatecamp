'use client'

import { Database, Monitor, Flask, BookOpen, SquaresFour, Pulse, HardDrives, Wrench, Stack, Scroll } from '@phosphor-icons/react/dist/ssr'
import { PortalLayout } from '@/components/portal'
import { SidebarProvider } from '@/components/sidebar/SidebarProvider'
import { Badge } from '@/components/ui/badge'
import { DevPortalSearch } from './DevPortalSearch'
import { PORTALS } from '@/config/portals'
import type { NavGroup } from '@/components/portal'
import { developerSurfaceGroups } from '@/lib/developer/surface-registry'

const navIconMap = {
  overview: <SquaresFour className="w-3.5 h-3.5" />,
  apiReference: <BookOpen className="w-3.5 h-3.5" weight="regular" />,
  architecture: <Stack className="w-3.5 h-3.5" />,
  status: <Pulse className="w-3.5 h-3.5" />,
  database: <Database className="w-3.5 h-3.5" />,
  infrastructure: <HardDrives className="w-3.5 h-3.5" />,
  tools: <Wrench className="w-3.5 h-3.5" />,
  console: <Monitor className="w-3.5 h-3.5" />,
  logs: <Scroll className="w-3.5 h-3.5" />,
  testData: <Flask className="w-3.5 h-3.5" />,
} as const

const devNavItems: NavGroup[] = developerSurfaceGroups.map((group) => ({
  label: group.label,
  items: group.items.map((item) => ({
    href: item.href,
    label: item.label,
    icon: navIconMap[item.iconKey],
  })),
}))

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

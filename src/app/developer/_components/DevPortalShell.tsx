'use client'

import {
  LayoutGrid,
  Palette,
  Code2,
  Layers,
  Grid3X3,
  Wrench,
  Monitor,
  Database,
  FileText,
  FlaskConical,
} from 'lucide-react'
import { PortalLayout } from '@/components/portal'
import { Badge } from '@/components/ui/badge'
import { DevPortalSearch } from './DevPortalSearch'
import type { NavGroup } from '@/components/portal'

const devNavItems: NavGroup[] = [
  {
    label: 'Portal',
    items: [
      { href: '/developer', label: 'Overview', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Documentation',
    items: [
      { href: '/developer/design-system', label: 'Design System', icon: <Palette className="w-3.5 h-3.5" /> },
      { href: '/developer/api-reference', label: 'API Reference', icon: <Code2 className="w-3.5 h-3.5" /> },
      { href: '/developer/architecture', label: 'Architecture', icon: <Layers className="w-3.5 h-3.5" /> },
      { href: '/developer/components', label: 'Component Library', icon: <Grid3X3 className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Tools',
    items: [
      { href: '/developer/tools', label: 'Dev Tools', icon: <Wrench className="w-3.5 h-3.5" /> },
      { href: '/developer/tools/console', label: 'Console', icon: <Monitor className="w-3.5 h-3.5" /> },
      { href: '/developer/tools/db', label: 'Database Browser', icon: <Database className="w-3.5 h-3.5" /> },
      { href: '/developer/tools/logs', label: 'Audit Logs', icon: <FileText className="w-3.5 h-3.5" /> },
      { href: '/developer/tools/test-data', label: 'Test Data', icon: <FlaskConical className="w-3.5 h-3.5" /> },
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
  <PortalLayout
    portalLabel="Developer Portal"
    topbarBg="#0F1F5C"
    accentColor="#1B3FC4"
    accentLightColor="#EEF2FC"
    navItems={devNavItems}
    rightContent={
      <Badge
        variant={envBadgeVariant[env]}
        size="xs"
        pill
        className="font-[family-name:var(--font-dm-mono)]"
      >
        {env}
      </Badge>
    }
    searchComponent={<DevPortalSearch />}
  >
    {children}
  </PortalLayout>
)

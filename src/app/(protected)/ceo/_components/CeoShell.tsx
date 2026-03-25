'use client'

import {
  LayoutDashboard,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  Package,
  Building2,
  Settings,
} from 'lucide-react'
import { PortalLayout } from '@/components/portal'
import { PORTALS } from '@/config/portals'
import type { NavGroup } from '@/components/portal'

const ceoNavItems: NavGroup[] = [
  {
    label: 'Business',
    items: [
      { href: '/ceo', label: 'Dashboard', icon: <LayoutDashboard className="w-3.5 h-3.5" /> },
      { href: '/ceo/revenue', label: 'Revenue', icon: <DollarSign className="w-3.5 h-3.5" /> },
      { href: '/ceo/growth', label: 'Growth', icon: <TrendingUp className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Product',
    items: [
      { href: '/ceo/users', label: 'Users', icon: <Users className="w-3.5 h-3.5" /> },
      { href: '/ceo/outcomes', label: 'Outcomes', icon: <Target className="w-3.5 h-3.5" /> },
      { href: '/ceo/content', label: 'Content', icon: <Package className="w-3.5 h-3.5" /> },
    ],
  },
  {
    label: 'Operations',
    items: [
      { href: '/ceo/team', label: 'Team', icon: <Building2 className="w-3.5 h-3.5" /> },
      {
        href: '/ceo/financials',
        label: 'Financials',
        icon: <DollarSign className="w-3.5 h-3.5" />,
      },
    ],
  },
  {
    label: 'Settings',
    items: [
      { href: '/ceo/settings', label: 'Settings', icon: <Settings className="w-3.5 h-3.5" /> },
    ],
  },
]

interface CeoShellProps {
  displayName: string
  children: React.ReactNode
}

export const CeoShell = ({ displayName, children }: CeoShellProps) => (
  <PortalLayout
    portalLabel={PORTALS.ceo.label}
    topbarBg={PORTALS.ceo.topbarBg}
    accentColor={PORTALS.ceo.accentColor}
    accentLightColor={PORTALS.ceo.accentLightColor}
    navItems={ceoNavItems}
    backLabel={PORTALS.ceo.backLabel}
    backHref={PORTALS.ceo.backHref}
  >
    {children}
  </PortalLayout>
)

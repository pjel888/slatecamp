'use client'

import { Question, FileText, MagnifyingGlass, Clock, SquaresFour, GitBranch, Cube, CheckSquare, GitPullRequest, Pulse, GearSix, TreeStructure } from '@phosphor-icons/react/dist/ssr'
import { PortalLayout, CommandPalette } from '@/components/portal'
import { AdminRoleBadge } from './AdminRoleBadge'
import { PORTALS } from '@/config/portals'
import type { NavGroup } from '@/components/portal'
import type { UserRole } from '@/lib/admin/roles'

const adminPages = [
  { title: 'Dashboard', href: '/admin/dashboard', group: 'Overview' },
  { title: 'Knowledge Browser', href: '/admin/knowledge', group: 'Knowledge Base' },
  { title: 'Question Bank', href: '/admin/knowledge/questions', group: 'Knowledge Base' },
  { title: 'Create Question', href: '/admin/knowledge/questions/new', group: 'Knowledge Base' },
  { title: 'Import Content', href: '/admin/knowledge/import', group: 'Knowledge Base' },
  { title: 'Quality Analytics', href: '/admin/knowledge/analytics', group: 'Knowledge Base' },
  { title: 'Create Article', href: '/admin/knowledge/new', group: 'Knowledge Base' },
  { title: 'Taxonomy Editor', href: '/admin/taxonomy', group: 'Structure' },
  { title: 'Coverage Map', href: '/admin/taxonomy/coverage', group: 'Structure' },
  { title: '3D Assets', href: '/admin/assets', group: 'Structure' },
  { title: '3D Models Registry', href: '/admin/3d-models', group: 'Structure' },
  { title: 'Review Queue', href: '/admin/reviews', group: 'Quality' },
  { title: 'Publishing Pipeline', href: '/admin/pipeline', group: 'Quality' },
  { title: 'Content Search', href: '/admin/search', group: 'Quality' },
  { title: 'Audit Log', href: '/admin/audit', group: 'Pulse' },
  { title: 'Pulse Feed', href: '/admin/activity', group: 'Pulse' },
  { title: 'Settings', href: '/admin/settings', group: 'Settings' },
]

const adminNavItems: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: <SquaresFour className="w-3.5 h-3.5" />,
      },
    ],
  },
  {
    label: 'Knowledge Base',
    items: [
      {
        label: 'Browser',
        href: '/admin/knowledge',
        icon: <FileText className="w-3.5 h-3.5" />,
        children: [
          { label: 'All Content', href: '/admin/knowledge' },
          { label: 'Create Article', href: '/admin/knowledge/new' },
        ],
      },
      {
        label: 'Question Bank',
        href: '/admin/knowledge/questions',
        icon: <Question className="w-3.5 h-3.5" />,
        children: [
          { label: 'All Questions', href: '/admin/knowledge/questions' },
          { label: 'Create New', href: '/admin/knowledge/questions/new' },
          { label: 'Import', href: '/admin/knowledge/import' },
          { label: 'Quality Analytics', href: '/admin/knowledge/analytics' },
        ],
      },
    ],
  },
  {
    label: 'Structure',
    items: [
      {
        label: 'Taxonomy',
        href: '/admin/taxonomy',
        icon: <GitBranch className="w-3.5 h-3.5" />,
        children: [
          { label: 'Tree Editor', href: '/admin/taxonomy' },
          { label: 'Coverage Map', href: '/admin/taxonomy/coverage' },
        ],
      },
      {
        label: '3D Assets',
        href: '/admin/assets',
        icon: <Cube className="w-3.5 h-3.5" />,
      },
      {
        label: '3D Models Registry',
        href: '/admin/3d-models',
        icon: <TreeStructure className="w-3.5 h-3.5" />,
        children: [
          { label: 'All Models', href: '/admin/3d-models' },
        ],
      },
    ],
  },
  {
    label: 'Quality',
    items: [
      {
        label: 'Review Queue',
        href: '/admin/reviews',
        icon: <CheckSquare className="w-3.5 h-3.5" />,
      },
      {
        label: 'Publishing Pipeline',
        href: '/admin/pipeline',
        icon: <GitPullRequest className="w-3.5 h-3.5" />,
      },
      {
        label: 'Content Search',
        href: '/admin/search',
        icon: <MagnifyingGlass className="w-3.5 h-3.5" />,
      },
    ],
  },
  {
    label: 'Pulse',
    items: [
      {
        label: 'Audit Log',
        href: '/admin/audit',
        icon: <Clock className="w-3.5 h-3.5" />,
      },
      {
        label: 'Pulse Feed',
        href: '/admin/activity',
        icon: <Pulse className="w-3.5 h-3.5" />,
      },
    ],
  },
  {
    label: 'Settings',
    items: [
      {
        label: 'Settings',
        href: '/admin/settings',
        icon: <GearSix className="w-3.5 h-3.5" />,
      },
    ],
  },
]

interface AdminShellProps {
  role: UserRole
  badgeCounts?: { pendingReviews: number }
  noPadding?: boolean
  children: React.ReactNode
}

const AdminShell = ({ role, badgeCounts, noPadding = false, children }: AdminShellProps) => {
  const navItemsWithBadges = adminNavItems.map((group) => ({
    ...group,
    items: group.items.map((item) => ({
      ...item,
      badge: item.label === 'Review Queue' ? badgeCounts?.pendingReviews : undefined,
    })),
  }))

  return (
    <PortalLayout
      portalLabel={PORTALS.admin.label}
      topbarBg={PORTALS.admin.topbarBg}
      accentColor={PORTALS.admin.accentColor}
      accentLightColor={PORTALS.admin.accentLightColor}
      navItems={navItemsWithBadges}
      rightContent={<AdminRoleBadge role={role} />}
      backLabel={PORTALS.admin.backLabel}
      noPadding={noPadding}
    >
      <CommandPalette pages={adminPages} />
      {children}
    </PortalLayout>
  )
}

export { AdminShell, adminNavItems }

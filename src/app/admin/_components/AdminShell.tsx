'use client'

import { Question, FileText, MagnifyingGlass, Clock, SquaresFour, GitBranch, Cube, CheckSquare, GitPullRequest, Columns, Pulse, GearSix } from '@phosphor-icons/react/dist/ssr'
import { PortalLayout, CommandPalette } from '@/components/portal'
import { AdminRoleBadge } from './AdminRoleBadge'
import { PORTALS } from '@/config/portals'
import type { NavGroup } from '@/components/portal'
import type { UserRole } from '@/lib/admin/roles'

const adminPages = [
  { title: 'Dashboard', href: '/admin/dashboard', group: 'Overview' },
  { title: 'Questions', href: '/admin/questions', group: 'Content' },
  { title: 'Create Question', href: '/admin/questions/new', group: 'Content' },
  { title: 'Import Questions', href: '/admin/questions/import', group: 'Content' },
  { title: 'Quality Analytics', href: '/admin/questions/analytics', group: 'Content' },
  { title: 'Articles', href: '/admin/articles', group: 'Content' },
  { title: 'Create Article', href: '/admin/articles/new', group: 'Content' },
  { title: 'Content Editor', href: '/admin/content', group: 'Content' },
  { title: 'Taxonomy Editor', href: '/admin/taxonomy', group: 'Structure' },
  { title: 'Coverage Map', href: '/admin/taxonomy/coverage', group: 'Structure' },
  { title: '3D Assets', href: '/admin/assets', group: 'Structure' },
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
    label: 'Content',
    items: [
      {
        label: 'Questions',
        href: '/admin/questions',
        icon: <Question className="w-3.5 h-3.5" />,
        children: [
          { label: 'All Questions', href: '/admin/questions' },
          { label: 'Create New', href: '/admin/questions/new' },
          { label: 'Import', href: '/admin/questions/import' },
          { label: 'Quality Analytics', href: '/admin/questions/analytics' },
        ],
      },
      {
        label: 'Articles',
        href: '/admin/articles',
        icon: <FileText className="w-3.5 h-3.5" />,
        children: [
          { label: 'All Articles', href: '/admin/articles' },
          { label: 'Create New', href: '/admin/articles/new' },
        ],
      },
      {
        label: 'Content Editor',
        href: '/admin/content',
        icon: <Columns className="w-3.5 h-3.5" />,
        children: [],
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
  children: React.ReactNode
}

const AdminShell = ({ role, badgeCounts, children }: AdminShellProps) => {
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
    >
      <CommandPalette pages={adminPages} />
      {children}
    </PortalLayout>
  )
}

export { AdminShell, adminNavItems }

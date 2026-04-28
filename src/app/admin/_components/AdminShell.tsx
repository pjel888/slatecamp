'use client'

import { usePathname } from 'next/navigation'
import { Question, FileText, MagnifyingGlass, Clock, SquaresFour, GitBranch, Cube, CheckSquare, GitPullRequest, Pulse, GearSix, TreeStructure } from '@phosphor-icons/react/dist/ssr'
import { PortalLayout, CommandPalette } from '@/components/portal'
import { SidebarProvider } from '@/components/sidebar/SidebarProvider'
import { AdminRoleBadge } from './AdminRoleBadge'
import { PORTALS } from '@/config/portals'
import { Toaster } from '@/components/ui/toaster'
import type { NavGroup } from '@/components/portal'
import type { UserRole } from '@/lib/admin/roles'
import { getPermissionsForRole } from '@/lib/entitlements/policy'
import type { AdminPermission } from '@/lib/entitlements/types'

interface AdminPage {
  title: string
  href: string
  group: string
  keywords?: string
  permission?: AdminPermission
}

const adminPages: AdminPage[] = [
  { title: 'Dashboard', href: '/admin', group: 'Overview', permission: 'admin.dashboard.view' },
  { title: 'Knowledge Browser', href: '/admin/knowledge', group: 'Knowledge Base', permission: 'admin.content.view' },
  { title: 'Question Bank', href: '/admin/knowledge/questions', group: 'Knowledge Base', permission: 'admin.content.view' },
  { title: 'Design Problem Questions', href: '/admin/knowledge/questions/design-problems', group: 'Knowledge Base', permission: 'admin.content.view' },
  { title: 'Scenario Questions', href: '/admin/knowledge/questions/scenarios', group: 'Knowledge Base', permission: 'admin.content.view' },
  { title: 'Create Question', href: '/admin/knowledge/questions/new', group: 'Knowledge Base', permission: 'admin.content.create' },
  { title: 'Import Content', href: '/admin/knowledge/import', group: 'Knowledge Base', permission: 'admin.content.import' },
  { title: 'Quality Analytics', href: '/admin/knowledge/analytics', group: 'Knowledge Base', permission: 'admin.analytics.view' },
  { title: 'Create Article', href: '/admin/knowledge/new', group: 'Knowledge Base', permission: 'admin.content.create' },
  { title: 'Taxonomy Editor', href: '/admin/taxonomy', group: 'Structure', permission: 'admin.taxonomy.manage' },
  { title: 'Coverage Map', href: '/admin/taxonomy/coverage', group: 'Structure', permission: 'admin.analytics.view' },
  { title: '3D Assets', href: '/admin/assets', group: 'Structure', permission: 'admin.assets.manage' },
  { title: '3D Models Registry', href: '/admin/3d-models', group: 'Structure', permission: 'admin.access' },
  { title: 'Review Queue', href: '/admin/reviews', group: 'Quality', permission: 'admin.reviews.view' },
  { title: 'Publishing Pipeline', href: '/admin/pipeline', group: 'Quality', permission: 'admin.pipeline.manage' },
  { title: 'Content Search', href: '/admin/search', group: 'Quality', permission: 'admin.search.use' },
  { title: 'Audit Log', href: '/admin/audit', group: 'Pulse', permission: 'admin.audit.view' },
  { title: 'Pulse Feed', href: '/admin/activity', group: 'Pulse', permission: 'admin.activity.view' },
  { title: 'Settings', href: '/admin/settings', group: 'Settings', permission: 'admin.users.manage' },
]

interface NavItemWithPermission {
  label: string
  href: string
  icon: React.ReactNode
  permission?: AdminPermission
  children?: { label: string; href: string; permission?: AdminPermission }[]
}

interface NavGroupWithPermissions {
  label: string
  items: NavItemWithPermission[]
}

const adminNavItemsSource: NavGroupWithPermissions[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/admin',
        icon: <SquaresFour className="w-3.5 h-3.5" />,
        permission: 'admin.dashboard.view',
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
        permission: 'admin.content.view',
        children: [
          { label: 'All Content', href: '/admin/knowledge', permission: 'admin.content.view' },
          { label: 'Create Article', href: '/admin/knowledge/new', permission: 'admin.content.create' },
        ],
      },
      {
        label: 'Question Bank',
        href: '/admin/knowledge/questions',
        icon: <Question className="w-3.5 h-3.5" />,
        permission: 'admin.content.view',
        children: [
          { label: 'All Questions', href: '/admin/knowledge/questions', permission: 'admin.content.view' },
          { label: 'Design Problem Questions', href: '/admin/knowledge/questions/design-problems', permission: 'admin.content.view' },
          { label: 'Scenario Questions', href: '/admin/knowledge/questions/scenarios', permission: 'admin.content.view' },
          { label: 'Create New', href: '/admin/knowledge/questions/new', permission: 'admin.content.create' },
          { label: 'Import', href: '/admin/knowledge/import', permission: 'admin.content.import' },
          { label: 'Quality Analytics', href: '/admin/knowledge/analytics', permission: 'admin.analytics.view' },
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
        permission: 'admin.taxonomy.manage',
        children: [
          { label: 'Tree Editor', href: '/admin/taxonomy', permission: 'admin.taxonomy.manage' },
          { label: 'Coverage Map', href: '/admin/taxonomy/coverage', permission: 'admin.analytics.view' },
        ],
      },
      {
        label: '3D Assets',
        href: '/admin/assets',
        icon: <Cube className="w-3.5 h-3.5" />,
        permission: 'admin.assets.manage',
      },
      {
        label: '3D Models Registry',
        href: '/admin/3d-models',
        icon: <TreeStructure className="w-3.5 h-3.5" />,
        permission: 'admin.access',
        children: [
          { label: 'All Models', href: '/admin/3d-models', permission: 'admin.access' },
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
        permission: 'admin.reviews.view',
      },
      {
        label: 'Publishing Pipeline',
        href: '/admin/pipeline',
        icon: <GitPullRequest className="w-3.5 h-3.5" />,
        permission: 'admin.pipeline.manage',
      },
      {
        label: 'Content Search',
        href: '/admin/search',
        icon: <MagnifyingGlass className="w-3.5 h-3.5" />,
        permission: 'admin.search.use',
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
        permission: 'admin.audit.view',
      },
      {
        label: 'Pulse Feed',
        href: '/admin/activity',
        icon: <Pulse className="w-3.5 h-3.5" />,
        permission: 'admin.activity.view',
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
        permission: 'admin.users.manage',
      },
    ],
  },
]

const filterNavItems = (role: UserRole, badgeCounts?: { pendingReviews: number }): NavGroup[] => {
  const permissions = new Set(getPermissionsForRole(role))

  return adminNavItemsSource
    .map((group) => {
      const filteredItems = group.items
        .filter((item) => !item.permission || permissions.has(item.permission))
        .map((item) => ({
          label: item.label,
          href: item.href,
          icon: item.icon,
          badge: item.label === 'Review Queue' ? badgeCounts?.pendingReviews : undefined,
          children: item.children
            ? item.children.filter((child) => !child.permission || permissions.has(child.permission))
            : undefined,
        }))
      return { label: group.label, items: filteredItems }
    })
    .filter((group) => group.items.length > 0)
}

const filterAdminPages = (role: UserRole) => {
  const permissions = new Set(getPermissionsForRole(role))

  return adminPages.filter((page) => !page.permission || permissions.has(page.permission))
}

interface AdminShellProps {
  role: UserRole
  badgeCounts?: { pendingReviews: number }
  noPadding?: boolean
  children: React.ReactNode
}

export const shouldBypassAdminShellChrome = (pathname: string) =>
  pathname.startsWith('/admin/preview/')

const AdminShell = ({ role, badgeCounts, noPadding = false, children }: AdminShellProps) => {
  const pathname = usePathname()
  const filteredNavItems = filterNavItems(role, badgeCounts)
  const filteredAdminPages = filterAdminPages(role)

  if (shouldBypassAdminShellChrome(pathname)) {
    return (
      <>
        {children}
        <Toaster />
      </>
    )
  }

  return (
    <SidebarProvider disableShortcuts={true}>
      <PortalLayout
        portalLabel={PORTALS.admin.label}
        topbarBg={PORTALS.admin.topbarBg}
        accentColor={PORTALS.admin.accentColor}
        accentLightColor={PORTALS.admin.accentLightColor}
        navItems={filteredNavItems}
        rightContent={<AdminRoleBadge role={role} />}
        backLabel={PORTALS.admin.backLabel}
        noPadding={noPadding}
      >
        <CommandPalette pages={filteredAdminPages} />
        {children}
        <Toaster />
      </PortalLayout>
    </SidebarProvider>
  )
}

export { AdminShell, adminNavItemsSource as adminNavItems }

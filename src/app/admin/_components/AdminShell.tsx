'use client'

import {
  LayoutDashboard,
  HelpCircle,
  FileText,
  GitBranch,
  Box,
  CheckSquare,
  GitPullRequest,
  Search,
  Clock,
  Activity,
  Settings,
} from 'lucide-react'
import { PortalLayout, CommandPalette } from '@/components/portal'
import { AdminRoleBadge } from './AdminRoleBadge'
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
  { title: 'Taxonomy Editor', href: '/admin/taxonomy', group: 'Structure' },
  { title: 'Coverage Map', href: '/admin/taxonomy/coverage', group: 'Structure' },
  { title: '3D Assets', href: '/admin/assets', group: 'Structure' },
  { title: 'Review Queue', href: '/admin/reviews', group: 'Quality' },
  { title: 'Publishing Pipeline', href: '/admin/pipeline', group: 'Quality' },
  { title: 'Content Search', href: '/admin/search', group: 'Quality' },
  { title: 'Audit Log', href: '/admin/audit', group: 'Activity' },
  { title: 'Activity Feed', href: '/admin/activity', group: 'Activity' },
  { title: 'Settings', href: '/admin/settings', group: 'Settings' },
]

const adminNavItems: NavGroup[] = [
  {
    label: 'Overview',
    items: [
      {
        label: 'Dashboard',
        href: '/admin/dashboard',
        icon: <LayoutDashboard className="w-3.5 h-3.5" />,
      },
    ],
  },
  {
    label: 'Content',
    items: [
      {
        label: 'Questions',
        href: '/admin/questions',
        icon: <HelpCircle className="w-3.5 h-3.5" />,
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
        icon: <Box className="w-3.5 h-3.5" />,
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
        icon: <Search className="w-3.5 h-3.5" />,
      },
    ],
  },
  {
    label: 'Activity',
    items: [
      {
        label: 'Audit Log',
        href: '/admin/audit',
        icon: <Clock className="w-3.5 h-3.5" />,
      },
      {
        label: 'Activity Feed',
        href: '/admin/activity',
        icon: <Activity className="w-3.5 h-3.5" />,
      },
    ],
  },
  {
    label: 'Settings',
    items: [
      {
        label: 'Settings',
        href: '/admin/settings',
        icon: <Settings className="w-3.5 h-3.5" />,
      },
    ],
  },
]

interface AdminShellProps {
  role: UserRole
  children: React.ReactNode
}

const AdminShell = ({ role, children }: AdminShellProps) => (
  <PortalLayout
    portalLabel="Admin Console"
    topbarBg="#6B1A1A"
    accentColor="#B91C1C"
    accentLightColor="#FEF2F2"
    navItems={adminNavItems}
    rightContent={<AdminRoleBadge role={role} />}
    backLabel="Dashboard"
  >
    <CommandPalette pages={adminPages} />
    {children}
  </PortalLayout>
)

export { AdminShell, adminNavItems }

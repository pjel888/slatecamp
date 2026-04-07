import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'
import {
  SquaresFour,
  ChartBar,
  Cube,
  Exam,
  GearSix,
  Globe,
  Cards,
  FileText,
  Path,
  Users,
} from '@phosphor-icons/react/dist/ssr'

export type NavGroup = 'learn' | 'practice' | 'data'

export interface NavGroupConfig {
  key: NavGroup
  label: string
  order: number
}

export const NAV_GROUPS: NavGroupConfig[] = [
  { key: 'learn', label: 'Learn', order: 1 },
  { key: 'practice', label: 'Practice', order: 2 },
  { key: 'data', label: 'Data', order: 3 },
]

export interface RouteConfig {
  path: string
  title: string
  sidebarLabel?: string
  icon?: PhosphorIcon
  sidebar?: boolean
  group?: NavGroup
}

export const RESULTS_DAY = '/dashboard/results-day'

/**
 * Single source of truth for dashboard routes: titles and sidebar metadata.
 */
export const DASHBOARD_ROUTES: RouteConfig[] = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    icon: SquaresFour,
  },
  {
    path: '/dashboard/area-c',
    title: 'Design',
  },
  {
    path: '/dashboard/wiki',
    title: 'Wiki',
    icon: Globe,
    group: 'learn',
  },
  {
    path: '/dashboard/drills',
    title: 'Drills',
    sidebarLabel: 'Drills',
    icon: Exam,
    group: 'practice',
  },
  {
    path: '/dashboard/dae-mode',
    title: 'DAE Maintenance Mode',
    sidebarLabel: 'DAE Mode',
    group: 'practice',
  },
  {
    path: '/dashboard/camptrails',
    title: 'Camp Trail',
    icon: Path,
    group: 'practice',
  },
  {
    path: '/dashboard/pods',
    title: 'Study Pods',
    sidebarLabel: 'Study Pods',
    icon: Users,
    group: 'practice',
  },
  {
    path: '/dashboard/flash',
    title: 'ALE Numbers Flash',
    sidebarLabel: 'Flash Cards',
    icon: Cards,
    group: 'learn',
  },
  {
    path: '/dashboard/notes',
    title: 'Notes',
    icon: FileText,
    group: 'learn',
  },
  {
    path: '/dashboard/3d-lab',
    title: '3D Lab',
    icon: Cube,
    group: 'learn',
  },
  {
    path: '/dashboard/analytics',
    title: 'Analytics',
    icon: ChartBar,
    group: 'data',
  },
  {
    path: '/dashboard/cram-card',
    title: 'Cram Card',
    group: 'data',
  },
  {
    path: '/dashboard/professional',
    title: 'Professional Reference',
    sidebarLabel: 'Professional Reference',
  },
  {
    path: '/dashboard/studio',
    title: 'Studio Mode',
  },
  {
    path: '/dashboard/notifications',
    title: 'Notifications',
  },
  {
    path: '/dashboard/code-updates',
    title: 'Code Updates',
    sidebarLabel: 'Code Updates',
  },
  {
    path: '/dashboard/settings',
    title: 'Account Settings',
    sidebarLabel: 'Settings',
    icon: GearSix,
  },
]

export const STATIC_PAGE_TITLES: Record<string, string> = Object.fromEntries(
  DASHBOARD_ROUTES.map(({ path, title }) => [path, title]),
) as Record<string, string>

const DEFAULT_TITLE = 'Overview'

const DYNAMIC_TITLE_PREFIXES: { prefix: string; title: string }[] = [
  { prefix: '/dashboard/quiz/', title: 'Active Session' },
  { prefix: '/dashboard/testing/session/', title: 'Active Session' },
  { prefix: '/dashboard/drills/', title: 'Drills' },
  { prefix: '/dashboard/testing/', title: 'Drills' },
  { prefix: '/dashboard/library/', title: 'Question Bank' },
  { prefix: '/dashboard/wiki/', title: 'Knowledge Wiki' },
  { prefix: '/dashboard/flash/', title: 'ALE Numbers Flash' },
  { prefix: '/dashboard/pods/', title: 'Study Pods' },
]

export const getPageTitle = (pathname: string): string => {
  const exact = STATIC_PAGE_TITLES[pathname]
  if (exact) return exact

  const dynamicMatch = DYNAMIC_TITLE_PREFIXES.find(({ prefix }) =>
    pathname.startsWith(prefix),
  )
  if (dynamicMatch) return dynamicMatch.title

  if (pathname.startsWith('/dashboard')) {
    return DEFAULT_TITLE
  }

  return DEFAULT_TITLE
}


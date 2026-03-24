import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import {
  SquaresFour,
  ChartBar,
  Cube,
  Exam,
  GearSix,
  Globe,

  FileText,
  Path,
} from '@phosphor-icons/react'

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
    path: '/dashboard/wiki',
    title: 'Wiki',
    icon: Globe,
    group: 'learn',
  },
  {
    path: '/dashboard/testing',
    title: 'Testing & Review',
    sidebarLabel: 'Testing & Review',
    icon: Exam,
    group: 'practice',
  },
  {
    path: '/dashboard/camptrails',
    title: 'Camp Trail',
    icon: Path,
    group: 'practice',
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
  { prefix: '/dashboard/testing/', title: 'Testing & Review' },
  { prefix: '/dashboard/library/', title: 'Question Bank' },
  { prefix: '/dashboard/wiki/', title: 'Knowledge Wiki' },
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


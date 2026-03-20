import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import {
  SquaresFour,
  ChartBar,
  Cube,
  GearSix,
  Globe,
  Brain,
  FileText,
} from '@phosphor-icons/react'

export interface RouteConfig {
  path: string
  title: string
  sidebarLabel?: string
  icon?: PhosphorIcon
  sidebar?: boolean
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
  },
  {
    path: '/dashboard/review',
    title: 'Review',
    icon: Brain,
  },
  {
    path: '/dashboard/notes',
    title: 'Notes',
    icon: FileText,
  },
  {
    path: '/dashboard/3d-lab',
    title: '3D Lab',
    icon: Cube,
  },
  {
    path: '/dashboard/analytics',
    title: 'Analytics',
    icon: ChartBar,
  },
  {
    path: '/dashboard/settings',
    title: 'Account Settings',
    icon: GearSix,
  },
]

export const STATIC_PAGE_TITLES: Record<string, string> = Object.fromEntries(
  DASHBOARD_ROUTES.map(({ path, title }) => [path, title]),
) as Record<string, string>

const DEFAULT_TITLE = 'Overview'

const DYNAMIC_TITLE_PREFIXES: { prefix: string; title: string }[] = [
  { prefix: '/dashboard/quiz/', title: 'Active Session' },
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

export interface SidebarNavItem {
  href: string
  label: string
  icon?: PhosphorIcon
}

export const SIDEBAR_NAVIGATION: SidebarNavItem[] = DASHBOARD_ROUTES.filter(
  (route) => route.sidebar !== false,
).map((route) => ({
  href: route.path,
  label: route.sidebarLabel ?? route.title,
  icon: route.icon,
}))

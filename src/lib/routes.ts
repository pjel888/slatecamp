import type { ComponentType, SVGProps } from 'react'
import {
  LayoutDashboard,
  BarChart3,
  Box,
  Settings as SettingsIcon,
  Globe,
  Brain,
  FileText,
} from 'lucide-react'

export interface RouteConfig {
  path: string
  title: string
  sidebarLabel?: string
  icon?: ComponentType<SVGProps<SVGSVGElement>>
  sidebar?: boolean
}

/**
 * Single source of truth for dashboard routes: titles and sidebar metadata.
 */
export const DASHBOARD_ROUTES: RouteConfig[] = [
  {
    path: '/dashboard',
    title: 'Dashboard',
    icon: LayoutDashboard,
  },
  {
    path: '/dashboard/wiki',
    title: 'Wiki',
    icon: Globe,
  },
  {
    path: '/dashboard/testing',
    title: 'Testing',
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
    icon: Box,
  },
  {
    path: '/dashboard/analytics',
    title: 'Analytics',
    icon: BarChart3,
  },
  {
    path: '/dashboard/settings',
    title: 'Account Settings',
    icon: SettingsIcon,
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
  icon?: ComponentType<SVGProps<SVGSVGElement>>
}

export const SIDEBAR_NAVIGATION: SidebarNavItem[] = DASHBOARD_ROUTES.filter(
  (route) => route.sidebar !== false,
).map((route) => ({
  href: route.path,
  label: route.sidebarLabel ?? route.title,
  icon: route.icon,
}))

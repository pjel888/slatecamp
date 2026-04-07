import {
  SquaresFour,
  Globe,
  FileText,
  Cube,
  Exam,
  Path,
  Cards,
  ChartBar,
  GearSix,
} from '@phosphor-icons/react/dist/ssr'
import type { SidebarNavItemConfig, SidebarNavGroupConfig } from './types'

// ---------------------------------------------------------------------------
// Complete navigation config (matching locked HTML v4 + current routes)
// ---------------------------------------------------------------------------

export const SIDEBAR_NAV_ITEMS: SidebarNavItemConfig[] = [
  // Dashboard (standalone, no group) — tier: default
  { id: 'dashboard', href: '/dashboard', label: 'Dashboard', icon: SquaresFour, tier: 'default', shortcut: '⌘1' },

  // Learn group — tier: default (primary study loop)
  { id: 'wiki', href: '/dashboard/wiki', label: 'Wiki', icon: Globe, tier: 'default', group: 'learn', shortcut: '⌘2' },
  { id: 'notes', href: '/dashboard/notes', label: 'Notes', icon: FileText, tier: 'default', group: 'learn', shortcut: '⌘3' },

  // Explore group — tier: default (interactive tools)
  {
    id: '3d-lab',
    href: '/dashboard/3d-lab',
    label: '3D Lab',
    icon: Cube,
    tier: 'default',
    group: 'explore',
    shortcut: '⌘4',
    children: [
      { id: '3d-site', label: 'Site Development', href: '/dashboard/3d-lab/site-development-controls' },
      { id: '3d-stairs', label: 'Stairs', href: '/dashboard/3d-lab/stairway-configurator' },
      { id: '3d-wall', label: 'Unified Wall', href: '/dashboard/3d-lab/unified-wall-configurator' },
    ],
  },

  // Practice group — tier: secondary (tools)
  {
    id: 'testing',
    href: '/dashboard/drills',
    label: 'Drills',
    icon: Exam,
    tier: 'secondary',
    group: 'practice',
    children: [
      { id: 'test-sessions', label: 'Sessions', href: '/dashboard/drills/sessions' },
    ],
  },
  { id: 'camptrail', href: '/dashboard/camptrails', label: 'Camp Trail', icon: Path, tier: 'secondary', group: 'practice' },
  { id: 'flash', href: '/dashboard/flash', label: 'Flash Cards', icon: Cards, tier: 'secondary', group: 'practice' },

  // Data group — tier: secondary (tools)
  { id: 'analytics', href: '/dashboard/analytics', label: 'Analytics', icon: ChartBar, tier: 'secondary', group: 'data' },

  // Settings (standalone, bottom-pinned) — tier: tertiary
  { id: 'settings', href: '/dashboard/settings', label: 'Settings', icon: GearSix, tier: 'tertiary' },
]

// ---------------------------------------------------------------------------
// Grouped navigation for rendering
// ---------------------------------------------------------------------------

export const SIDEBAR_GROUPS: SidebarNavGroupConfig[] = [
  { key: 'learn', label: 'Learn', items: SIDEBAR_NAV_ITEMS.filter((i) => i.group === 'learn') },
  { key: 'explore', label: 'Explore', items: SIDEBAR_NAV_ITEMS.filter((i) => i.group === 'explore') },
  { key: 'practice', label: 'Practice', items: SIDEBAR_NAV_ITEMS.filter((i) => i.group === 'practice') },
  { key: 'data', label: 'Data', items: SIDEBAR_NAV_ITEMS.filter((i) => i.group === 'data') },
]

export const DASHBOARD_ITEM = SIDEBAR_NAV_ITEMS.find((i) => i.id === 'dashboard')!
export const SETTINGS_ITEM = SIDEBAR_NAV_ITEMS.find((i) => i.id === 'settings')!

// ---------------------------------------------------------------------------
// Keyboard shortcut map (Cmd/Ctrl + number → route)
// ---------------------------------------------------------------------------

export const SHORTCUT_MAP: Record<string, string> = {
  '1': '/dashboard',
  '2': '/dashboard/wiki',
  '3': '/dashboard/notes',
  '4': '/dashboard/3d-lab',
}

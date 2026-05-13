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
  Table,
} from '@phosphor-icons/react/dist/ssr'
import type { SidebarNavItemConfig, SidebarNavGroupConfig } from './types'
import { ROUTES } from '@/lib/routes'

// ---------------------------------------------------------------------------
// Complete navigation config (matching locked HTML v4 + current routes)
// ---------------------------------------------------------------------------

export const SIDEBAR_NAV_ITEMS: SidebarNavItemConfig[] = [
  // Dashboard (standalone, no group) — tier: default
  { id: 'dashboard', href: ROUTES.dashboard.root, label: 'Dashboard', icon: SquaresFour, tier: 'default', shortcut: '⌘1' },

  // Learn group — tier: default (primary study loop)
  { id: 'wiki', href: ROUTES.dashboard.wiki, label: 'Wiki', icon: Globe, tier: 'default', group: 'learn', shortcut: '⌘2' },
  { id: 'tables', href: ROUTES.dashboard.tables, label: 'Tables', icon: Table, tier: 'default', group: 'learn' },
  { id: 'notes', href: ROUTES.dashboard.notes, label: 'Notes', icon: FileText, tier: 'default', group: 'learn', shortcut: '⌘3' },

  // Explore group — tier: default (interactive tools)
  {
    id: '3d-lab',
    href: ROUTES.lab.root,
    label: '3D Lab',
    icon: Cube,
    tier: 'default',
    group: 'explore',
    shortcut: '⌘4',
  },

  // Practice group — tier: secondary (tools)
  {
    id: 'testing',
    href: ROUTES.dashboard.quiz,
    label: 'Quiz',
    icon: Exam,
    tier: 'secondary',
    group: 'practice',
  },
  { id: 'camptrail', href: ROUTES.dashboard.camptrails, label: 'Camp Trail', icon: Path, tier: 'secondary', group: 'practice' },
  { id: 'flash', href: ROUTES.dashboard.flash, label: 'Flash Cards', icon: Cards, tier: 'secondary', group: 'practice' },

  // Data group — tier: secondary (tools)
  { id: 'analytics', href: ROUTES.dashboard.analytics, label: 'Analytics', icon: ChartBar, tier: 'secondary', group: 'data' },

  // Settings (standalone, bottom-pinned) — tier: tertiary
  { id: 'settings', href: ROUTES.dashboard.settings, label: 'Settings', icon: GearSix, tier: 'tertiary' },
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
  '1': ROUTES.dashboard.root,
  '2': ROUTES.dashboard.wiki,
  '3': ROUTES.dashboard.notes,
  '4': ROUTES.lab.root,
}

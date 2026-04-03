import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'

// ---------------------------------------------------------------------------
// Z-Index Scale (matching locked HTML v4)
// sidebar < backdrop was wrong; HTML v4: backdrop=30, sidebar=40
// ---------------------------------------------------------------------------

export const Z_INDEX = {
  backdrop: 30,
  sidebar: 40,
  mobileTopBar: 45,
  mobileDrawer: 50,
  tooltip: 50,
  dialog: 100,
} as const

// ---------------------------------------------------------------------------
// Layout Constants (locked HTML v4: 52px collapsed / 216px expanded)
// ---------------------------------------------------------------------------

export const SIDEBAR_WIDTH_COLLAPSED = 52
export const SIDEBAR_WIDTH_EXPANDED = 256

/** Nav item row height: 32px */
export const NAV_ITEM_HEIGHT = 32
/** Header height: 64px — matches DashboardHeader h-16 for visual continuity */
export const HEADER_HEIGHT = 64
/** Footer row heights: 30px each (profile + toggle) */
export const FOOTER_ROW_HEIGHT = 30
/** Sidebar horizontal padding: 6px */
export const SIDEBAR_PADDING = 6

/**
 * Icon container: 40px wide x 32px tall, flex-shrink-0.
 * Centers a 16x16 icon inside. Position is spatially locked —
 * identical x,y in both collapsed and expanded states.
 */
export const ICON_CONTAINER_CLASS = 'flex h-8 w-10 shrink-0 items-center justify-center'

/** Icon SVG: 16x16px, stroke-width 1.75 */
export const ICON_SIZE = 16
export const ICON_WEIGHT = 'regular' as const

export const STORAGE_KEY = 'slatecamp_sidebar_expanded'

// ---------------------------------------------------------------------------
// Transition Config (locked HTML v4)
// ---------------------------------------------------------------------------

export const TRANSITION = {
  /** Expand: 180ms with snappy overshoot easing */
  expandDuration: 180,
  expandEasing: 'cubic-bezier(0.16, 1, 0.3, 1)',
  /** Collapse: 140ms with quick deceleration */
  collapseDuration: 140,
  collapseEasing: 'cubic-bezier(0.4, 0, 1, 1)',
  /** Tooltip show delay */
  tooltipDelay: 70,
} as const

// ---------------------------------------------------------------------------
// Icon Tier System (visual hierarchy via opacity)
// ---------------------------------------------------------------------------

export type IconTier = 'default' | 'secondary' | 'tertiary'

/** Tier opacity values matching locked HTML v4 */
export const ICON_TIER_OPACITY: Record<IconTier, number> = {
  default: 1.0,
  secondary: 0.65,
  tertiary: 0.55,
}

// ---------------------------------------------------------------------------
// Interfaces
// ---------------------------------------------------------------------------

export interface SidebarContextValue {
  expanded: boolean
  setExpanded: (v: boolean) => void
  toggle: () => void
  expand: () => void
  collapse: () => void
  prefersReducedMotion: boolean
  sidebarRef: React.RefObject<HTMLElement | null>
  toggleRef: React.RefObject<HTMLButtonElement | null>
  contentRef: React.RefObject<HTMLDivElement | null>
}

export interface SidebarNavItemConfig {
  id: string
  href: string
  label: string
  icon: PhosphorIcon
  tier: IconTier
  group?: string
  shortcut?: string
  children?: { id: string; label: string; href: string }[]
}

export interface SidebarNavGroupConfig {
  key: string
  label: string
  items: SidebarNavItemConfig[]
}

export interface SidebarNavItemProps {
  item: SidebarNavItemConfig
  isActive: boolean
  expanded: boolean
  showTooltip: boolean
  onNavigate: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

export interface SidebarProps {
  userDisplay: {
    name: string
    avatarUrl: string | null
  }
  tier: string
  isAdmin?: boolean
  isDevMode?: boolean
}

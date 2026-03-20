import type { Icon as PhosphorIcon } from '@phosphor-icons/react'
import type { UserTier } from '@/types/app'

// ---------------------------------------------------------------------------
// Z-Index Scale (VIS-06)
// rail < backdrop < overlay < tooltips < dialogs
// ---------------------------------------------------------------------------

export const Z_INDEX = {
  rail: 10,
  backdrop: 39,
  overlay: 40,
  tooltip: 50,
  dialog: 100,
} as const

// ---------------------------------------------------------------------------
// Layout Constants
// ---------------------------------------------------------------------------

export const SIDEBAR_WIDTH_COLLAPSED = 72
export const SIDEBAR_WIDTH_EXPANDED = 260

/** 32px alignment box: 20px left padding + 16px (half of 32px) = 36px = center of 72px collapsed rail. */
export const ICON_BOX = 'flex h-8 w-8 shrink-0 items-center justify-center'
export const ICON_SIZE = 'h-[18px] w-[18px]'

export const STORAGE_KEY = 'slatecamp_sidebar_expanded'

// ---------------------------------------------------------------------------
// SidebarProvider Context Value
// ---------------------------------------------------------------------------

export interface SidebarContextValue {
  expanded: boolean
  setExpanded: (v: boolean) => void
  toggle: () => void
  contentRef: React.RefObject<HTMLDivElement | null>
  toggleRef: React.RefObject<HTMLButtonElement | null>
}

// ---------------------------------------------------------------------------
// Nav Item Props (shared between rail and panel variants)
// ---------------------------------------------------------------------------

export interface SidebarNavItemProps {
  href: string
  label: string
  icon?: PhosphorIcon
  isActive: boolean
  variant: 'rail' | 'expanded'
  onBeforeNavigate: (e: React.MouseEvent<HTMLAnchorElement>) => void
}

// ---------------------------------------------------------------------------
// User Profile Props
// ---------------------------------------------------------------------------

export interface SidebarUserProfileProps {
  name: string
  avatarUrl: string | null
  tier: UserTier
  isDevMode?: boolean
  variant: 'rail' | 'expanded'
}

// ---------------------------------------------------------------------------
// Upgrade CTA Props
// ---------------------------------------------------------------------------

export interface SidebarUpgradeCTAProps {
  variant: 'rail' | 'expanded'
}

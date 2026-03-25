import type { LucideIcon } from 'lucide-react'

// ── Role Types ──

export type UserRole = 'student' | 'admin' | 'ceo'

// ── Navigation Types ──

export interface NavItem {
  label: string
  href: string
  icon: LucideIcon
  badge?: number | string
  disabled?: boolean
  tooltip?: string
}

export interface NavSection {
  label: string
  items: NavItem[]
}

export interface NavFooterItem {
  label: string
  href: string
  icon: LucideIcon
}

// ── Shell Types ──

export interface RoleConfig {
  role: UserRole
  shellTitle: string
  sections: NavSection[]
  footerItems: NavFooterItem[]
  /** Allowed profile.role values that grant access to this shell */
  allowedRoles: string[]
  /** Where to redirect if the user lacks access */
  fallbackRedirect: string
}

export interface UnifiedShellProps {
  role: UserRole
  children: React.ReactNode
}

export interface UnifiedSidebarProps {
  shellTitle: string
  sections: NavSection[]
  footerItems: NavFooterItem[]
}

export interface UnifiedTopBarProps {
  displayName: string
  role: UserRole
  onMenuToggle: () => void
}

export interface MobileDrawerProps {
  open: boolean
  onClose: () => void
  shellTitle: string
  sections: NavSection[]
  footerItems: NavFooterItem[]
}

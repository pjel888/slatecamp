// Sidebar module barrel export — v2 (overhaul)
export { SidebarProvider, useSidebar } from './SidebarProvider'
export { Sidebar } from './Sidebar'
export { SidebarContent } from './SidebarContent'
export { SidebarNavItem } from './SidebarNavItem'
export { SidebarHeader } from './SidebarHeader'
export { SidebarFooter } from './SidebarFooter'
export { MobileTopBar } from './MobileTopBar'
export { MobileDrawer } from './MobileDrawer'
export { MobileSidebarShell } from './MobileSidebarShell'
export {
  Z_INDEX,
  SIDEBAR_WIDTH_COLLAPSED,
  SIDEBAR_WIDTH_EXPANDED,
  ICON_CONTAINER_CLASS,
  ICON_SIZE,
  STORAGE_KEY,
  TRANSITION,
  ICON_TIER_OPACITY,
} from './types'
export type {
  SidebarContextValue,
  SidebarNavItemConfig,
  SidebarNavGroupConfig,
  SidebarNavItemProps,
  SidebarProps,
  IconTier,
} from './types'
export {
  SIDEBAR_NAV_ITEMS,
  SIDEBAR_GROUPS,
  DASHBOARD_ITEM,
  SETTINGS_ITEM,
  SHORTCUT_MAP,
} from './sidebar-constants'

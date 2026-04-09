// Viewport Shell UI state — sidebar collapse, view mode, camera preset, mobile tabs.
// Scene-affecting actions (view mode, camera preset) must call invalidate().
// UI-only actions (sidebar collapse, tab switch) must NOT call invalidate().
import { create } from 'zustand'
import type { ViewMode } from '@/features/3d-lab/types/templates'

export interface ViewportShellState {
  // Sidebar state
  leftSidebarCollapsed: boolean
  rightSidebarCollapsed: boolean

  // View mode
  activeViewMode: ViewMode

  // Camera
  activeCameraPreset: string | null

  // Mobile
  mobileActiveTab: string
  bottomSheetOpen: boolean

  // Invalidation bridge — set by CanvasWrapper or scene component
  invalidateFn: (() => void) | null

  // Actions — UI only (no invalidate)
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  setMobileTab: (tab: string) => void
  setBottomSheetOpen: (open: boolean) => void

  // Actions — scene-affecting (calls invalidate)
  setViewMode: (mode: ViewMode) => void
  setCameraPreset: (presetId: string | null) => void

  // Invalidation
  setInvalidateFn: (fn: (() => void) | null) => void

  // Reset
  reset: () => void
}

const DEFAULTS: Pick<
  ViewportShellState,
  | 'leftSidebarCollapsed'
  | 'rightSidebarCollapsed'
  | 'activeViewMode'
  | 'activeCameraPreset'
  | 'mobileActiveTab'
  | 'bottomSheetOpen'
  | 'invalidateFn'
> = {
  leftSidebarCollapsed: false,
  rightSidebarCollapsed: false,
  activeViewMode: 'perspective',
  activeCameraPreset: null,
  mobileActiveTab: '',
  bottomSheetOpen: true,
  invalidateFn: null,
}

export const useViewportShellStore = create<ViewportShellState>()((set, get) => ({
  ...DEFAULTS,

  // UI-only — no invalidate
  toggleLeftSidebar: () =>
    set((s) => ({ leftSidebarCollapsed: !s.leftSidebarCollapsed })),

  toggleRightSidebar: () =>
    set((s) => ({ rightSidebarCollapsed: !s.rightSidebarCollapsed })),

  setMobileTab: (tab) => set({ mobileActiveTab: tab }),

  setBottomSheetOpen: (open) => set({ bottomSheetOpen: open }),

  // Scene-affecting — calls invalidate
  setViewMode: (mode) => {
    set({ activeViewMode: mode })
    get().invalidateFn?.()
  },

  setCameraPreset: (presetId) => {
    set({ activeCameraPreset: presetId })
    get().invalidateFn?.()
  },

  setInvalidateFn: (fn) => set({ invalidateFn: fn }),

  reset: () => set({ ...DEFAULTS }),
}))

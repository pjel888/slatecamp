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

  // Navigation mode
  navMode: 'orbit' | 'pan' | 'look'

  // Active interaction — tracks which mouse interaction is in progress (for visual feedback)
  activeInteraction: 'idle' | 'orbiting' | 'panning'

  // Mobile
  mobileActiveTab: string
  bottomSheetOpen: boolean

  // Invalidation bridge — set by CanvasWrapper or scene component
  invalidateFn: (() => void) | null

  // Scene toolbar state
  gridVisible: boolean
  dimensionsVisible: boolean
  xrayMode: boolean
  layersPanelOpen: boolean
  layersPanelPinned: boolean

  // Camera projection + orbit state
  projectionMode: 'perspective' | 'orthographic'
  manualOrbit: boolean  // true when user has orbited away from a preset view

  // Selection state
  selectedIds: Set<string>
  hoveredId: string | null

  // Actions — UI only (no invalidate)
  toggleLeftSidebar: () => void
  toggleRightSidebar: () => void
  setMobileTab: (tab: string) => void
  setBottomSheetOpen: (open: boolean) => void
  toggleLayersPanel: () => void
  setLayersPanelPinned: (pinned: boolean) => void
  setProjectionMode: (mode: 'perspective' | 'orthographic') => void
  setManualOrbit: (v: boolean) => void

  // Actions — scene-affecting toolbar toggles (calls invalidate)
  toggleGrid: () => void
  toggleDimensions: () => void
  toggleXray: () => void

  // Selection actions — UI only, no invalidate
  selectElement: (id: string) => void
  toggleSelect: (id: string) => void
  clearSelection: () => void
  boxSelect: (ids: string[]) => void
  setHoveredId: (id: string | null) => void

  // Navigation mode action
  setNavMode: (mode: 'orbit' | 'pan' | 'look') => void

  // Active interaction action
  setActiveInteraction: (interaction: 'idle' | 'orbiting' | 'panning') => void

  // Actions — scene-affecting (calls invalidate)
  setViewMode: (mode: ViewMode) => void
  setCameraPreset: (presetId: string | null) => void
  snapToPreset: (preset: 'front' | 'top' | 'left' | 'right' | 'rear' | 'iso' | 'iso-ne' | 'iso-nw' | 'iso-se' | 'iso-sw' | 'zoom-to-fit' | 'zoom-in' | 'zoom-out' | 'reset' | 'perspective') => void

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
  | 'gridVisible'
  | 'dimensionsVisible'
  | 'xrayMode'
  | 'layersPanelOpen'
  | 'layersPanelPinned'
  | 'projectionMode'
  | 'manualOrbit'
  | 'navMode'
  | 'activeInteraction'
  | 'selectedIds'
  | 'hoveredId'
> = {
  leftSidebarCollapsed: false,
  rightSidebarCollapsed: false,
  activeViewMode: 'perspective',
  activeCameraPreset: null,
  navMode: 'orbit' as const,
  activeInteraction: 'idle' as const,
  mobileActiveTab: '',
  bottomSheetOpen: true,
  invalidateFn: null,
  gridVisible: true,
  dimensionsVisible: false,
  xrayMode: false,
  layersPanelOpen: false,
  layersPanelPinned: false,
  projectionMode: 'perspective' as const,
  manualOrbit: false,
  selectedIds: new Set<string>(),
  hoveredId: null,
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

  // Scene toolbar toggles — grid/dimensions/xray affect the 3D scene and need invalidate
  toggleGrid: () => {
    set((s) => ({ gridVisible: !s.gridVisible }))
    get().invalidateFn?.()
  },
  toggleDimensions: () => {
    set((s) => ({ dimensionsVisible: !s.dimensionsVisible }))
    get().invalidateFn?.()
  },
  toggleXray: () => {
    set((s) => ({ xrayMode: !s.xrayMode }))
    get().invalidateFn?.()
  },
  // Layers panel is UI-only — no invalidate needed
  toggleLayersPanel: () => set((s) => {
    const willClose = s.layersPanelOpen
    // When closing, also unpin
    return willClose
      ? { layersPanelOpen: false, layersPanelPinned: false }
      : { layersPanelOpen: true }
  }),
  setLayersPanelPinned: (pinned) => set({ layersPanelPinned: pinned }),
  setProjectionMode: (mode) => {
    set({ projectionMode: mode })
    get().invalidateFn?.()
  },
  setManualOrbit: (v) => set({ manualOrbit: v }),

  // Selection actions — UI only, no invalidate
  selectElement: (id) => set({ selectedIds: new Set([id]) }),
  toggleSelect: (id) => set((s) => {
    const next = new Set(s.selectedIds)
    if (next.has(id)) next.delete(id)
    else next.add(id)
    return { selectedIds: next }
  }),
  clearSelection: () => set({ selectedIds: new Set(), hoveredId: null }),
  boxSelect: (ids) => set({ selectedIds: new Set(ids) }),
  setHoveredId: (id) => set({ hoveredId: id }),

  // Navigation mode
  setNavMode: (mode) => {
    set({ navMode: mode })
    get().invalidateFn?.()
  },

  // Active interaction
  setActiveInteraction: (interaction) => {
    set({ activeInteraction: interaction })
  },

  // Scene-affecting — calls invalidate
  setViewMode: (mode) => {
    set({ activeViewMode: mode })
    get().invalidateFn?.()
  },

  setCameraPreset: (presetId) => {
    set({ activeCameraPreset: presetId })
    get().invalidateFn?.()
  },

  snapToPreset: (preset) => {
    set({ activeCameraPreset: preset })
    get().invalidateFn?.()
  },

  setInvalidateFn: (fn) => set({ invalidateFn: fn }),

  reset: () => set({ ...DEFAULTS }),
}))

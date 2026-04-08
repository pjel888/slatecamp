import { create } from 'zustand'
import * as THREE from 'three'

export interface LabelPayload {
  text: string
  subtext?: string
  codeRef?: string
}

export interface HotspotPayload {
  title: string
  body: string
  codeRef?: string
  isOpen: boolean
}

export interface ViolationPayload {
  law: string
  section: string
  message: string
  severity: 'error' | 'warning'
}

export interface DimensionPayload {
  value: number
  unit: 'mm' | 'm'
  label?: string
  isViolating: boolean
}

export interface OverlayItem {
  id: string
  worldPosition: THREE.Vector3
  type: 'label' | 'hotspot' | 'violation' | 'dimension' | 'area-tag'
  payload: LabelPayload | HotspotPayload | ViolationPayload | DimensionPayload
  visible: boolean
  zIndex?: number
}

interface OverlayStore {
  items: Map<string, OverlayItem>
  cameraRef: THREE.Camera | null

  upsertItem: (item: OverlayItem) => void
  removeItem: (id: string) => void
  clearAll: () => void
  setCameraRef: (camera: THREE.Camera | null) => void

  openHotspot: (id: string) => void
  closeHotspot: (id: string) => void
  closeAllHotspots: () => void
}

export const useOverlayStore = create<OverlayStore>((set) => ({
  items: new Map(),
  cameraRef: null,

  upsertItem: (item) => set((s) => {
    const next = new Map(s.items)
    next.set(item.id, item)
    return { items: next }
  }),

  removeItem: (id) => set((s) => {
    const next = new Map(s.items)
    next.delete(id)
    return { items: next }
  }),

  clearAll: () => set({ items: new Map() }),
  setCameraRef: (camera) => set({ cameraRef: camera }),

  openHotspot: (id) => set((s) => {
    const item = s.items.get(id)
    if (!item || item.type !== 'hotspot') return s
    const next = new Map(s.items)
    next.set(id, {
      ...item,
      payload: { ...(item.payload as HotspotPayload), isOpen: true },
    })
    return { items: next }
  }),

  closeHotspot: (id) => set((s) => {
    const item = s.items.get(id)
    if (!item || item.type !== 'hotspot') return s
    const next = new Map(s.items)
    next.set(id, {
      ...item,
      payload: { ...(item.payload as HotspotPayload), isOpen: false },
    })
    return { items: next }
  }),

  closeAllHotspots: () => set((s) => {
    const next = new Map(s.items)
    next.forEach((item, id) => {
      if (item.type === 'hotspot') {
        next.set(id, {
          ...item,
          payload: { ...(item.payload as HotspotPayload), isOpen: false },
        })
      }
    })
    return { items: next }
  }),
}))

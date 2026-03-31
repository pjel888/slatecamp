'use client'

import { create } from 'zustand'

// ─── Selected object data bridged from WebGL click → DOM overlay ────────────

export interface SelectedObjectData {
  objectId: string
  layerType: 'lot' | 'setback' | 'ambf' | 'isa' | 'usa' | 'tosl' | 'building' | 'rrow'
  displayName: string
  codeReference: string
  formulaHint?: string         // suppressed in exam mode
  computedValues: Record<string, number | string>
  violations: string[]
}

interface SelectionStore {
  selectedObjectId: string | null
  selectedObjectData: SelectedObjectData | null
  setSelection: (id: string, data: SelectedObjectData) => void
  clearSelection: () => void
}

export const useSelectionStore = create<SelectionStore>()((set) => ({
  selectedObjectId: null,
  selectedObjectData: null,

  setSelection: (id, data) => set({
    selectedObjectId: id,
    selectedObjectData: data,
  }),

  clearSelection: () => set({
    selectedObjectId: null,
    selectedObjectData: null,
  }),
}))

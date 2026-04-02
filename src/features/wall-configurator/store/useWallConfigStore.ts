'use client'

import { create } from 'zustand'
import type { CoreType, SideCount, Opening, WallConfig } from '../types/wall.types'
import { getDefaultLayers } from './layer-defaults'

export type WizardStep = 1 | 2 | 3 | 4 | 5 | 6 | 7

interface WallConfigState {
  step: WizardStep
  config: WallConfig

  // Navigation
  setStep: (step: WizardStep) => void
  nextStep: () => void
  prevStep: () => void

  // Step 1
  setCoreType: (core: CoreType) => void

  // Step 2
  setGeometry: (lengthM: number, heightM: number, wallCount: number) => void

  // Step 3
  addOpening: (o: Opening) => void
  removeOpening: (id: string) => void
  updateOpening: (id: string, patch: Partial<Opening>) => void

  // Step 4
  setSides: (s: SideCount) => void

  // Step 5 & 6
  toggleLayer: (code: string, enabled: boolean) => void
  setLayerWaste: (code: string, wasteFactor: number) => void

  // Drywall extras
  setSeamLength: (lm: number) => void

  // Paint extras
  setTopcoatCoats: (coats: number) => void
  setPaintCoverage: (sqmPerL: number) => void

  // Reset
  reset: () => void
}

const initialConfig: WallConfig = {
  coreType: 'chb',
  geometry: { lengthM: 5, heightM: 3, wallCount: 1 },
  openings: [],
  sides: 1,
  layers: getDefaultLayers('chb'),
  topcoatCoats: 2,
  paintCoverageSqmPerL: 7,
}

export const useWallConfigStore = create<WallConfigState>((set) => ({
  step: 1,
  config: { ...initialConfig, layers: getDefaultLayers('chb') },

  setStep: (step) => set({ step }),

  nextStep: () =>
    set((s) => ({ step: Math.min(7, s.step + 1) as WizardStep })),

  prevStep: () =>
    set((s) => ({ step: Math.max(1, s.step - 1) as WizardStep })),

  setCoreType: (coreType) =>
    set((s) => ({
      config: { ...s.config, coreType, layers: getDefaultLayers(coreType) },
    })),

  setGeometry: (lengthM, heightM, wallCount) =>
    set((s) => ({
      config: { ...s.config, geometry: { lengthM, heightM, wallCount } },
    })),

  addOpening: (o) =>
    set((s) => ({
      config: { ...s.config, openings: [...s.config.openings, o] },
    })),

  removeOpening: (id) =>
    set((s) => ({
      config: {
        ...s.config,
        openings: s.config.openings.filter((o) => o.id !== id),
      },
    })),

  updateOpening: (id, patch) =>
    set((s) => ({
      config: {
        ...s.config,
        openings: s.config.openings.map((o) =>
          o.id === id ? { ...o, ...patch } : o
        ),
      },
    })),

  setSides: (sides) =>
    set((s) => ({ config: { ...s.config, sides } })),

  toggleLayer: (code, enabled) =>
    set((s) => ({
      config: {
        ...s.config,
        layers: s.config.layers.map((l) =>
          l.code === code ? { ...l, enabled } : l
        ),
      },
    })),

  setLayerWaste: (code, wasteFactor) =>
    set((s) => ({
      config: {
        ...s.config,
        layers: s.config.layers.map((l) =>
          l.code === code ? { ...l, wasteFactor } : l
        ),
      },
    })),

  setSeamLength: (lm) =>
    set((s) => ({ config: { ...s.config, seamLengthLM: lm } })),

  setTopcoatCoats: (coats) =>
    set((s) => ({ config: { ...s.config, topcoatCoats: coats } })),

  setPaintCoverage: (sqmPerL) =>
    set((s) => ({ config: { ...s.config, paintCoverageSqmPerL: sqmPerL } })),

  reset: () =>
    set({ step: 1, config: { ...initialConfig, layers: getDefaultLayers('chb') } }),
}))

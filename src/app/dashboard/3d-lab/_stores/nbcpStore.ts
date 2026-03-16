// src/app/dashboard/3d-lab/_stores/nbcpStore.ts
import { create } from 'zustand'
import { ZoningClass, LotType } from '../_constants/nbcp'
import { calculateEnvelope, type NBCPInputs, type NBCPComputed } from '../_utils/nbcpCalculator'

// ─── Default inputs ────────────────────────────────────────────────────────────
const DEFAULT_INPUTS: NBCPInputs = {
  lotWidth:      20,
  lotDepth:      30,
  zoningClass:   ZoningClass.R2_MAX,
  lotType:       LotType.INSIDE,
  rrowWidth:     12,
  floorHeight:   3.0,
  firewalls:     { front: false, rear: false, left: false, right: false },
  floorsOverride: 0,  // 0 = use code-computed max
}

// ─── Presets ──────────────────────────────────────────────────────────────────
export const NBCP_PRESETS: Array<{ label: string; inputs: NBCPInputs }> = [
  {
    label: 'R-1 Subdivision',
    inputs: { ...DEFAULT_INPUTS, lotWidth: 12, lotDepth: 25, zoningClass: ZoningClass.R1, rrowWidth: 8 },
  },
  {
    label: 'R-3 Apartment',
    inputs: { ...DEFAULT_INPUTS, lotWidth: 25, lotDepth: 40, zoningClass: ZoningClass.R3, rrowWidth: 15 },
  },
  {
    label: 'C-2 Commercial',
    inputs: { ...DEFAULT_INPUTS, lotWidth: 30, lotDepth: 50, zoningClass: ZoningClass.C2, lotType: LotType.CORNER, rrowWidth: 20 },
  },
  {
    label: 'RROW Effect',
    inputs: { ...DEFAULT_INPUTS, lotWidth: 20, lotDepth: 40, zoningClass: ZoningClass.R3, rrowWidth: 8 },
  },
  {
    label: 'Firewall Effect',
    inputs: { ...DEFAULT_INPUTS, lotWidth: 12, lotDepth: 25, zoningClass: ZoningClass.R2_MAX, rrowWidth: 10, firewalls: { front: false, rear: true, left: true, right: false } },
  },
]

// ─── Store ────────────────────────────────────────────────────────────────────

interface NBCPState {
  inputs: NBCPInputs
  computed: NBCPComputed

  // R3F bridge — registered from inside Canvas via useNBCPInvalidateOnChange
  invalidateFn: (() => void) | null

  // Actions
  setInputs: (patch: Partial<NBCPInputs>) => void
  setFirewall: (side: keyof NBCPInputs['firewalls'], val: boolean) => void
  applyPreset: (preset: typeof NBCP_PRESETS[number]) => void
  reset: () => void
  setInvalidateFn: (fn: (() => void) | null) => void
}

function computeAndInvalidate(inputs: NBCPInputs, invalidateFn: (() => void) | null): NBCPComputed {
  const computed = calculateEnvelope(inputs)
  invalidateFn?.()
  return computed
}

export const useNBCPStore = create<NBCPState>()((set, get) => ({
  inputs:   DEFAULT_INPUTS,
  computed: calculateEnvelope(DEFAULT_INPUTS),
  invalidateFn: null,

  setInputs: (patch) => {
    const next = { ...get().inputs, ...patch }
    set({ inputs: next, computed: computeAndInvalidate(next, get().invalidateFn) })
  },

  setFirewall: (side, val) => {
    const next = { ...get().inputs, firewalls: { ...get().inputs.firewalls, [side]: val } }
    set({ inputs: next, computed: computeAndInvalidate(next, get().invalidateFn) })
  },

  applyPreset: (preset) => {
    set({ inputs: preset.inputs, computed: computeAndInvalidate(preset.inputs, get().invalidateFn) })
  },

  reset: () => {
    set({ inputs: DEFAULT_INPUTS, computed: computeAndInvalidate(DEFAULT_INPUTS, get().invalidateFn) })
  },

  setInvalidateFn: (fn) => set({ invalidateFn: fn }),
}))

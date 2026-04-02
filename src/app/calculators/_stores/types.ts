// src/app/calculators/_stores/types.ts
// Shared base interface for all Calculator Suite Zustand stores.
// Each tool store (flooring, paint, drywall) extends this with typed inputs + computed.

export interface BaseCalculatorStore {
  /** Incremented on every input mutation. SceneInvalidator watches this. */
  inputVersion: number

  /** UI state — does NOT trigger 3D re-render */
  viewMode: 'default' | 'deductions' | 'waste'
  resultMode: 'net' | 'buy'
  hoveredSurface: string | null

  /** UI state setters */
  setViewMode: (mode: BaseCalculatorStore['viewMode']) => void
  setResultMode: (mode: 'net' | 'buy') => void
  setHoveredSurface: (id: string | null) => void
}

/**
 * Helper to create the base slice for a calculator store.
 * Use with Zustand's set/get pattern inside create():
 *
 * @example
 * const useFlooringStore = create<FlooringStore>()((set) => ({
 *   ...createBaseSlice(set),
 *   // ... tool-specific state
 * }))
 */
export function createBaseSlice(
  set: (partial: Partial<BaseCalculatorStore>) => void,
): BaseCalculatorStore {
  return {
    inputVersion: 0,
    viewMode: 'default',
    resultMode: 'buy',
    hoveredSurface: null,
    setViewMode: (mode) => set({ viewMode: mode }),
    setResultMode: (mode) => set({ resultMode: mode }),
    setHoveredSurface: (id) => set({ hoveredSurface: id }),
  }
}

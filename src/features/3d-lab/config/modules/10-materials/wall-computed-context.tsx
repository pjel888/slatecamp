'use client'

// src/features/3d-lab/config/modules/10-materials/wall-computed-context.tsx
// React context for distributing ComputedWallState to sidebar panels
// Solves the architectural gap: geometry() returns only GeometryInstruction[],
// but UI panels need performance metrics and BOM data.

import { createContext, useContext, useMemo, type ReactNode } from 'react'
import type { ComputedWallState } from './wall-types'
import { computeWallState } from './wall-computation'

const WallComputedContext = createContext<ComputedWallState | null>(null)

interface WallComputedProviderProps {
  params: Record<string, number | boolean | string>
  children: ReactNode
}

export const WallComputedProvider = ({ params, children }: WallComputedProviderProps) => {
  const state = useMemo(() => computeWallState(params), [params])

  return (
    <WallComputedContext.Provider value={state}>
      {children}
    </WallComputedContext.Provider>
  )
}

export const useWallComputed = (): ComputedWallState => {
  const ctx = useContext(WallComputedContext)
  if (!ctx) {
    throw new Error('useWallComputed must be used within WallComputedProvider')
  }
  return ctx
}

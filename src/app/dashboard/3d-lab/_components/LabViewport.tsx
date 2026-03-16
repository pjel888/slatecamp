'use client'

import dynamic from 'next/dynamic'
import type { Model3D, ModelParameter, SpatialHotspot } from '@/components/3d/Workspace'
import { Workspace } from '@/components/3d/Workspace'

// Dynamically import scene components with SSR disabled (Three.js cannot run server-side)
const FARPlayground = dynamic(
  () => import('../_scenes/FARPlayground'),
  { ssr: false },
)

const ClassicalOrders = dynamic(
  () => import('../_scenes/ClassicalOrders'),
  { ssr: false },
)

const NBCPEnvelope = dynamic(
  () => import('../_scenes/NBCPEnvelope'),
  { ssr: false },
)

// Model IDs that route to the new scene types
const PARAMETRIC_SCENES = new Set(['far-calculator', 'nbcp-envelope'])
const ANATOMY_SCENES = new Set(['classical-orders'])

interface LabViewportProps {
  modelId: string
  model: Model3D
  parameters: ModelParameter[]
  hotspots: SpatialHotspot[]
  userTier: string
}

/**
 * Routes a modelId to the correct scene implementation:
 * - Parametric scenes (FAR Calculator etc.) → new Zustand-bridged scenes
 * - Anatomy scenes (Classical Orders etc.) → new hotspot-driven scenes
 * - All other modelIds → existing GLTF Workspace (backwards compatible)
 */
export function LabViewport({
  modelId,
  model,
  parameters,
  hotspots,
  userTier,
}: LabViewportProps) {
  if (modelId === 'far-calculator') return <FARPlayground />
  if (modelId === 'nbcp-envelope') return <NBCPEnvelope />

  if (ANATOMY_SCENES.has(modelId)) {
    return <ClassicalOrders />
  }

  // Default: existing GLTF model viewer (unchanged)
  return (
    <Workspace
      model={model}
      parameters={parameters}
      hotspots={hotspots}
      userTier={userTier}
    />
  )
}

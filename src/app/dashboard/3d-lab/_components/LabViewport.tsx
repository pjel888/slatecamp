'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { Model3D, ModelParameter, SpatialHotspot } from '@/components/3d/Workspace'
import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { getModuleById } from '../_config/registry'
import type {
  TemplateType,
  ParametricSceneConfig,
  ExplodedAssemblyConfig,
  FloorPlanConfig,
  CutawaySectionConfig,
  AnimatedSequenceConfig,
} from '../_types/templates'

// ─── Legacy Scene Imports (SSR disabled) ───────────────────────────────────

const FARPlayground = dynamic(
  () => import('../_scenes/FARPlayground'),
  { ssr: false },
)

const ClassicalOrders = dynamic(
  () => import('../_scenes/ClassicalOrders'),
  { ssr: false },
)

const SiteControls = dynamic(
  () => import('@/components/3d-lab/DevControlsModule'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

// ─── Template Components (dynamic, SSR disabled) ──────────────────────────

const ParametricScene = dynamic(
  () => import('../_templates/ParametricScene'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const ExplodedAssembly = dynamic(
  () => import('../_templates/ExplodedAssembly'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const FloorPlanWalkthrough = dynamic(
  () => import('../_templates/FloorPlanWalkthrough'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const CutawaySection = dynamic(
  () => import('../_templates/CutawaySection'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const AnimatedSequence = dynamic(
  () => import('../_templates/AnimatedSequence'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

// ─── Dynamic Module Loader ────────────────────────────────────────────────
//
// Module configs are loaded on demand via dynamic import keyed by moduleId.
// Each module file under _config/modules/ exports its config as the first
// (and only) named export — we take Object.values(mod)[0] as the config.
//
// webpack uses the known path prefix + suffix to create a per-file chunk for
// every .ts file under _config/modules/, so only the requested chunk is
// fetched when a user opens a specific module.

const loadModuleConfig = (moduleId: string): Promise<unknown> =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  import(`../_config/modules/${moduleId}` as any).then(
    (mod: Record<string, unknown>) => Object.values(mod)[0],
  )

// ─── Loading Spinner ───────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <SCIcon icon={CircleNotch} size="lg" className="animate-spin text-muted-foreground" />
      <span className="ml-2 text-[11px] text-muted-foreground">Loading module…</span>
    </div>
  )
}

// ─── Workspace (Three.js — lazy loaded) ──────────────────────────────────

const Workspace = dynamic(
  () => import('@/components/3d/Workspace').then(m => m.Workspace),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

// ─── Template Module Wrapper ───────────────────────────────────────────────

interface TemplateModuleWrapperProps {
  moduleId: string
  templateType: TemplateType
}

const TemplateModuleWrapper = ({ moduleId, templateType }: TemplateModuleWrapperProps) => {
  const [config, setConfig] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    loadModuleConfig(moduleId)
      .then((cfg) => {
        if (!cancelled) setConfig(cfg)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(String(err))
      })
    return () => { cancelled = true }
  }, [moduleId])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-500">
        Failed to load module: {error}
      </div>
    )
  }

  if (!config) return <LoadingSpinner />

  switch (templateType) {
    case 'parametric':
      return <ParametricScene config={config as ParametricSceneConfig} />
    case 'exploded':
      return <ExplodedAssembly config={config as ExplodedAssemblyConfig} />
    case 'floorplan':
      return <FloorPlanWalkthrough config={config as FloorPlanConfig} />
    case 'cutaway':
      return <CutawaySection config={config as CutawaySectionConfig} />
    case 'animated':
      return <AnimatedSequence config={config as AnimatedSequenceConfig} />
    default:
      return null
  }
}

// ─── Props ─────────────────────────────────────────────────────────────────

interface LabViewportProps {
  modelId: string
  model: Model3D
  parameters: ModelParameter[]
  hotspots: SpatialHotspot[]
  userTier: string
}

// ─── Main Component ────────────────────────────────────────────────────────

/**
 * Routes a modelId to the correct scene implementation:
 * - Legacy scenes (far-calculator, classical-orders) → hardcoded imports
 * - Registry modules → dynamic import keyed by moduleId + templateType from MODULE_REGISTRY
 * - All other modelIds → existing GLTF Workspace (backwards compatible)
 */
export function LabViewport({
  modelId,
  model,
  parameters,
  hotspots,
  userTier,
}: LabViewportProps) {
  // Legacy hardcoded scenes — must remain for backwards compatibility
  if (modelId === 'far-calculator') return <FARPlayground />
  if (modelId === 'classical-orders') return <ClassicalOrders />

  // Bespoke scenes — custom Canvas + own store (exceed template capabilities)
  if (modelId === 'site-development-controls') return <SiteControls />

  // Template-driven modules: any module registered in MODULE_REGISTRY with a
  // matching config file under _config/modules/ is loaded dynamically.
  const registryEntry = getModuleById(modelId)
  if (registryEntry != null) {
    return (
      <TemplateModuleWrapper
        moduleId={modelId}
        templateType={registryEntry.templateType}
      />
    )
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

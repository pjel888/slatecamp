'use client'

import { useEffect } from 'react'
import dynamic from 'next/dynamic'
import { useLabStore } from '@/features/3d-lab/stores/useLabStore'
import type { Model3D, ModelParameter, SpatialHotspot } from '@/components/3d/Workspace'
import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { getModuleById } from '@/features/3d-lab/config/registry'
import type {
  TemplateType,
  ParametricSceneConfig,
  ExplodedAssemblyConfig,
  FloorPlanConfig,
  CutawaySectionConfig,
  AnimatedSequenceConfig,
  CalculatorConfig,
} from '@/features/3d-lab/types/templates'

// ─── Legacy Scene Imports (SSR disabled) ───────────────────────────────────

const FARPlayground = dynamic(
  () => import('@/features/3d-lab/scenes/FARPlayground/FARPlayground'),
  { ssr: false },
)

const ClassicalOrders = dynamic(
  () => import('@/features/3d-lab/scenes/ClassicalOrders/ClassicalOrders'),
  { ssr: false },
)

const SiteControls = dynamic(
  () => import('@/features/3d-lab/DevControlsModule'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

// ─── Template Components (dynamic, SSR disabled) ──────────────────────────

const ParametricScene = dynamic(
  () => import('@/features/3d-lab/templates/ParametricScene'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const ExplodedAssembly = dynamic(
  () => import('@/features/3d-lab/templates/ExplodedAssembly'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const FloorPlanWalkthrough = dynamic(
  () => import('@/features/3d-lab/templates/FloorPlanWalkthrough'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const CutawaySection = dynamic(
  () => import('@/features/3d-lab/templates/CutawaySection'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const AnimatedSequence = dynamic(
  () => import('@/features/3d-lab/templates/AnimatedSequence'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const CalculatorTemplate = dynamic(
  () => import('@/features/3d-lab/templates/CalculatorTemplate'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const WallConfiguratorTemplate = dynamic(
  () => import('@/features/3d-lab/templates/WallConfiguratorTemplate'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

// ─── Loading Spinner ───────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <SCIcon icon={CircleNotch} size="lg" className="animate-spin text-muted-foreground" />
      <span className="ml-2 text-[11px] text-muted-foreground uppercase tracking-widest font-black">
        Initializing...
      </span>
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
  config: any
  templateType: TemplateType
}

const TemplateModuleWrapper = ({ config, templateType }: TemplateModuleWrapperProps) => {
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
    case 'calculator':
      return <CalculatorTemplate config={config as CalculatorConfig} />
    case 'wall-configurator':
      return <WallConfiguratorTemplate config={config as ParametricSceneConfig} />
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
  /** Phase 2: Accept pre-loaded config from ModuleViewer */
  preLoadedConfig?: any
}

// ─── Main Component ────────────────────────────────────────────────────────

/**
 * Routes a modelId to the correct scene implementation.
 * In Phase 2, it primarily consumes the preLoadedConfig from the parent ModuleViewer.
 */
export function LabViewport({
  modelId,
  model,
  parameters,
  hotspots,
  userTier,
  preLoadedConfig,
}: LabViewportProps) {
  // Cleanup session state on unmount
  useEffect(() => {
    return () => {
      useLabStore.getState().resetSession()
    }
  }, [])

  // Legacy hardcoded scenes
  if (modelId === 'far-calculator') return <FARPlayground />
  if (modelId === 'classical-orders') return <ClassicalOrders />

  // Bespoke scenes
  if (modelId === 'site-development-controls') return <SiteControls />

  // Template-driven modules
  const registryEntry = getModuleById(modelId)
  if (registryEntry != null && preLoadedConfig) {
    return (
      <TemplateModuleWrapper
        config={preLoadedConfig}
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

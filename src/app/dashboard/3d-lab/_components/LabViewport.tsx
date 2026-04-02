'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import type { Model3D, ModelParameter, SpatialHotspot } from '@/components/3d/Workspace'
import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { getModuleById, ALL_MODULES } from '../_config/registry'
import { ASSET_TAXONOMY } from '../_config/taxonomy'
import type {
  TemplateType,
  ParametricSceneConfig,
  ExplodedAssemblyConfig,
  FloorPlanConfig,
  CutawaySectionConfig,
  AnimatedSequenceConfig,
  CalculatorConfig,
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

const CalculatorTemplate = dynamic(
  () => import('../_templates/CalculatorTemplate'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

const WallConfiguratorTemplate = dynamic(
  () => import('../_templates/WallConfiguratorTemplate'),
  { ssr: false, loading: () => <LoadingSpinner /> },
)

// ─── Dynamic Module Loader ────────────────────────────────────────────────
//
// Module configs live in category subdirectories (e.g., 15-estimating/calculator-flooring).
// The MODULE_PATHS map resolves a flat module ID to its subdirectory path so the
// dynamic import can find it. Webpack creates per-file chunks for every .ts file
// under _config/modules/, so only the requested chunk is fetched.

// Build category key → directory prefix map from the taxonomy source of truth.
// e.g. BUILDING_CODE → '01', VERTICAL → '08', etc.
const CAT_ID_MAP: Record<string, string> = {}
for (const [key, meta] of Object.entries(ASSET_TAXONOMY)) {
  CAT_ID_MAP[key] = meta.id
}

// Directory name map: taxonomy id → folder name under _config/modules/
const DIR_NAMES: Record<string, string> = {
  '01': '01-building-code',
  '02': '02-accessibility',
  '03': '03-fire-code',
  '04': '04-structural',
  '05': '05-plumbing',
  '06': '06-electrical',
  '07': '07-mechanical',
  '08': '08-vertical',
  '09': '09-construction',
  '10': '10-materials',
  '11': '11-arch-history',
  '12': '12-ph-heritage',
  '13': '13-planning',
  '14': '14-prof-practice',
  '15': '15-estimating',
  '16': '16-site-dev',
}

const MODULE_PATHS: Record<string, string> = {}

// Build the path map from the registry at module scope (runs once)
for (const mod of ALL_MODULES) {
  if (mod.categoryId) {
    const catId = CAT_ID_MAP[mod.categoryId]
    const dir = catId ? DIR_NAMES[catId] : undefined
    if (dir) {
      MODULE_PATHS[mod.id] = `${dir}/${mod.id}`
    }
  }
}

const loadModuleConfig = (moduleId: string): Promise<unknown> => {
  const path = MODULE_PATHS[moduleId] ?? moduleId
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return import(`../_config/modules/${path}` as any).then(
    (mod: Record<string, unknown>) => Object.values(mod)[0],
  )
}

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

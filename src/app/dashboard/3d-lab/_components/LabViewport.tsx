'use client'

import { useState, useEffect, useMemo } from 'react'
import dynamic from 'next/dynamic'
import type { Model3D, ModelParameter, SpatialHotspot } from '@/components/3d/Workspace'
import { Workspace } from '@/components/3d/Workspace'
import { Loader2 } from 'lucide-react'

// ─── Legacy Scene Imports (SSR disabled) ───────────────────────────────────

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

// ─── Module Config Registry ────────────────────────────────────────────────

interface ModuleConfigEntry {
  template: 'parametric' | 'exploded' | 'floorplan' | 'cutaway' | 'animated'
  configImport: () => Promise<{ [key: string]: unknown }>
  /** The named export key in the module file */
  exportKey: string
}

const MODULE_CONFIGS: Record<string, ModuleConfigEntry> = {
  'stairway-configurator': {
    template: 'parametric',
    configImport: () => import('../_config/modules/stairway-configurator'),
    exportKey: 'stairwayConfigurator',
  },
  'fire-travel-distance': {
    template: 'floorplan',
    configImport: () => import('../_config/modules/fire-travel-distance'),
    exportKey: 'fireTravelDistanceConfig',
  },
  'ramp-accessible-toilet': {
    template: 'parametric',
    configImport: () => import('../_config/modules/ramp-accessible-toilet'),
    exportKey: 'rampAccessibleToiletConfig',
  },
  'classical-orders-comparison': {
    template: 'exploded',
    configImport: () => import('../_config/modules/classical-orders-comparison'),
    exportKey: 'classicalOrdersComparisonConfig',
  },
  'structural-load-path': {
    template: 'animated',
    configImport: () => import('../_config/modules/structural-load-path'),
    exportKey: 'structuralLoadPathConfig',
  },
  'plumbing-fixture-cutaway': {
    template: 'cutaway',
    configImport: () => import('../_config/modules/plumbing-fixture-cutaway'),
    exportKey: 'plumbingFixtureCutaway',
  },
  'bahay-na-bato': {
    template: 'exploded',
    configImport: () => import('../_config/modules/bahay-na-bato'),
    exportKey: 'bahayNaBatoConfig',
  },
  'construction-sequence-foundation': {
    template: 'animated',
    configImport: () => import('../_config/modules/construction-sequence'),
    exportKey: 'constructionSequenceConfig',
  },
}

// ─── Loading Spinner ───────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex h-full items-center justify-center">
      <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      <span className="ml-2 text-[11px] text-muted-foreground">Loading module…</span>
    </div>
  )
}

// ─── Template Module Wrapper ───────────────────────────────────────────────

function TemplateModuleWrapper({ moduleId }: { moduleId: string }) {
  const entry = MODULE_CONFIGS[moduleId]
  const [config, setConfig] = useState<unknown>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    entry
      .configImport()
      .then((mod) => {
        if (!cancelled) {
          const cfg = (mod as Record<string, unknown>)[entry.exportKey] ?? Object.values(mod)[0]
          setConfig(cfg)
        }
      })
      .catch((err) => {
        if (!cancelled) setError(String(err))
      })
    return () => { cancelled = true }
  }, [moduleId, entry])

  if (error) {
    return (
      <div className="flex h-full items-center justify-center text-sm text-red-500">
        Failed to load module: {error}
      </div>
    )
  }

  if (!config) return <LoadingSpinner />

  switch (entry.template) {
    case 'parametric':
      return <ParametricScene config={config as never} />
    case 'exploded':
      return <ExplodedAssembly config={config as never} />
    case 'floorplan':
      return <FloorPlanWalkthrough config={config as never} />
    case 'cutaway':
      return <CutawaySection config={config as never} />
    case 'animated':
      return <AnimatedSequence config={config as never} />
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
 * - Legacy scenes (far-calculator, nbcp-envelope, classical-orders) → hardcoded imports
 * - Template modules (stairway-configurator, etc.) → registry-driven dynamic loading
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
  if (modelId === 'nbcp-envelope') return <NBCPEnvelope />
  if (modelId === 'classical-orders') return <ClassicalOrders />

  // Template-driven modules from registry
  if (modelId in MODULE_CONFIGS) {
    return <TemplateModuleWrapper moduleId={modelId} />
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

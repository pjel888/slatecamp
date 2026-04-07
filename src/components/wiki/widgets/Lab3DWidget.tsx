'use client'

import * as React from 'react'
import dynamic from 'next/dynamic'
import { CircleNotch, ArrowsOut, Cube } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getModuleById } from '@/features/3d-lab/config/registry'
import type { 
  TemplateType, 
  ParametricSceneConfig, 
  ExplodedAssemblyConfig, 
  FloorPlanConfig, 
  CutawaySectionConfig, 
  AnimatedSequenceConfig 
} from '@/features/3d-lab/types/templates'

// ─── Loading Spinner ───────────────────────────────────────────────────────

function LoadingSpinner() {
  return (
    <div className="flex h-64 w-full flex-col items-center justify-center bg-muted/20 rounded-md border border-dashed border-border">
      <SCIcon icon={CircleNotch} size="lg" className="animate-spin text-muted-foreground/50" />
      <span className="mt-2 text-[11px] font-medium text-muted-foreground/60 uppercase tracking-widest">
        Initializing 3D Module…
      </span>
    </div>
  )
}

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

/** 
 * Shared dynamic loader that works with absolute aliases. 
 * Fetches the specific module configuration chunk on demand.
 */
const loadModuleConfig = (moduleId: string): Promise<unknown> =>
  import(`@/features/3d-lab/config/modules/${moduleId}`).then(
    (mod: Record<string, unknown>) => Object.values(mod)[0],
  )

interface Lab3DWidgetProps {
  moduleId: string
  height?: number | string
  caption?: string
}

/**
 * Lab3DWidget: Embeds a 3D Lab module directly into a wiki article.
 * 
 * Usage in MDX:
 * <Lab3DWidget moduleId="stairway-configurator" caption="Interactive Stair Compliance" />
 */
export default function Lab3DWidget({ moduleId, height = 420, caption }: Lab3DWidgetProps) {
  const [config, setConfig] = React.useState<unknown>(null)
  const [error, setError] = React.useState<string | null>(null)
  
  const registryEntry = React.useMemo(() => getModuleById(moduleId), [moduleId])

  React.useEffect(() => {
    if (!registryEntry) {
      setError(`Module "${moduleId}" not found in registry.`)
      return
    }

    let cancelled = false
    loadModuleConfig(moduleId)
      .then((cfg) => {
        if (!cancelled) setConfig(cfg)
      })
      .catch((err: unknown) => {
        if (!cancelled) setError(`Failed to load config for ${moduleId}: ${String(err)}`)
      })
    return () => { cancelled = true }
  }, [moduleId, registryEntry])

  if (error) {
    return (
      <div className="my-6 p-4 border border-destructive/20 bg-destructive/5 rounded-md text-xs text-destructive flex items-center gap-3">
        <SCIcon icon={Cube} size="sm" />
        <span>3D Lab Error: {error}</span>
      </div>
    )
  }

  if (!registryEntry) return null

  const renderScene = () => {
    if (!config) return <LoadingSpinner />

    switch (registryEntry.templateType) {
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
        return <p className="text-xs p-4">Unsupported template type: {registryEntry.templateType}</p>
    }
  }

  return (
    <div className="not-prose my-8 space-y-2">
      <Card className="overflow-hidden bg-zinc-950 border-zinc-800" style={{ height }}>
        <div className="relative h-full w-full group">
          {renderScene()}
          
          {/* Overlay Actions */}
          <div className="absolute top-3 right-3 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Button
              variant="outline"
              size="xs"
              className="bg-zinc-900/80 border-zinc-700 text-zinc-300 hover:text-white"
              onClick={() => window.open(`/dashboard/3d-lab?node=${moduleId}`, '_blank')}
            >
              <ArrowsOut size={12} className="mr-1.5" />
              Full Lab
            </Button>
          </div>
          
          {/* Module Identity Badge */}
          <div className="absolute bottom-3 left-3 px-2 py-1 bg-zinc-900/80 border border-zinc-700 rounded-sm pointer-events-none">
            <p className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <Cube size={10} className="text-primary" />
              {registryEntry.title}
            </p>
          </div>
        </div>
      </Card>
      
      {caption && (
        <p className="text-[11px] italic text-muted-foreground text-center px-4">
          {caption}
        </p>
      )}
    </div>
  )
}

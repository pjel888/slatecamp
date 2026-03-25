// src/app/dashboard/3d-lab/_templates/CutawaySection.tsx
'use client'

import { useMemo } from 'react'
import { Stack, BookOpen } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { CanvasWrapper } from '../_components/CanvasWrapper'
import { CutawaySectionScene } from './CutawaySectionScene'
import { createModuleStore } from '../_stores/createModuleStore'
import { Slider } from '@/components/ui/slider'
import type { CutawaySectionConfig } from '../_types/templates'

// ─── Annotation List Panel ──────────────────────────────────────────────────

function AnnotationPanel({
  config,
  useStore,
}: {
  config: CutawaySectionConfig
  useStore: ReturnType<typeof createModuleStore>
}) {
  const params = useStore((s) => s.params)
  const activeAnnotation = useStore((s) => s.activeAnnotation)
  const setActiveAnnotation = useStore((s) => s.setActiveAnnotation)
  const cutPosition = typeof params.cutPosition === 'number' ? params.cutPosition : 1

  const visibleLayers = useMemo(
    () => config.layers.filter((l) => l.depth <= cutPosition),
    [config.layers, cutPosition]
  )

  return (
    <div className="absolute right-4 top-4 bottom-20 z-10 w-64 overflow-y-auto bg-white/90 backdrop-blur-sm border border-border rounded-md shadow-lg">
      {/* Header */}
      <div className="sticky top-0 bg-white/90 backdrop-blur-sm border-b border-border px-3 py-2">
        <div className="flex items-center gap-1.5">
          <SCIcon icon={Stack} size="xs" className="text-zinc-400" />
          <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400">
            Layers
          </span>
          <span className="ml-auto text-[11px] text-zinc-400 tabular-nums">
            {visibleLayers.length}/{config.layers.length}
          </span>
        </div>
      </div>

      {/* Layer list */}
      <div className="p-2 space-y-1">
        {config.layers.map((layer) => {
          const isVisible = layer.depth <= cutPosition
          const isActive = activeAnnotation === layer.id

          return (
            <button
              key={layer.id}
              onClick={() =>
                setActiveAnnotation(isActive ? null : layer.id)
              }
              className={`
                w-full text-left rounded px-2 py-1.5 transition-colors cursor-pointer
                ${!isVisible ? 'opacity-30' : ''}
                ${isActive
                  ? 'bg-[#EEF2FC] border border-primary/30'
                  : 'hover:bg-zinc-50 border border-transparent'
                }
              `}
            >
              <div className="flex items-center gap-2">
                {/* Color swatch */}
                <div
                  className="w-3 h-3 rounded-sm shrink-0 border border-black/10"
                  style={{ backgroundColor: layer.geometry.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-zinc-700 truncate">
                    {layer.label}
                  </div>
                  {layer.material && (
                    <div className="text-[11px] text-zinc-400 truncate">
                      {layer.material}
                    </div>
                  )}
                </div>
              </div>

              {/* Expanded details when active */}
              {isActive && (
                <div className="mt-1.5 pl-5 space-y-0.5">
                  {layer.description && (
                    <p className="text-[11px] text-zinc-500">
                      {layer.description}
                    </p>
                  )}
                  {layer.codeCitation && (
                    <div className="flex items-center gap-1">
                      <SCIcon icon={BookOpen} size="xs" className="text-primary shrink-0" />
                      <span className="text-[11px] font-medium text-primary">
                        {layer.codeCitation}
                      </span>
                    </div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}

// ─── Cut Slider Bar ─────────────────────────────────────────────────────────

function CutSliderBar({
  config,
  useStore,
}: {
  config: CutawaySectionConfig
  useStore: ReturnType<typeof createModuleStore>
}) {
  const params = useStore((s) => s.params)
  const setParam = useStore((s) => s.setParam)
  const cutPosition = typeof params.cutPosition === 'number' ? params.cutPosition : 1

  // Derive range from layers if not explicit
  const minDepth = 0
  const maxDepth = Math.max(...config.layers.map((l) => l.depth + (l.geometry.args?.[1] ?? 0.1)))

  return (
    <div className="absolute bottom-4 left-4 right-72 z-10 bg-white/90 backdrop-blur-sm border border-border rounded-md shadow-lg px-4 py-3">
      <div className="flex items-center gap-3">
        <span className="text-[11px] font-black uppercase tracking-widest text-zinc-400 shrink-0">
          Cut Depth
        </span>
        <Slider
          value={[cutPosition]}
          min={minDepth}
          max={maxDepth}
          step={0.01}
          onValueChange={(v) => {
            const val = Array.isArray(v) ? v[0] : v
            if (typeof val === 'number') setParam('cutPosition', val)
          }}
          className="flex-1 cursor-pointer"
        />
        <span className="text-[11px] font-bold text-zinc-700 tabular-nums w-12 text-right">
          {cutPosition.toFixed(2)} m
        </span>
      </div>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface CutawaySectionProps {
  config: CutawaySectionConfig
}

export default function CutawaySection({ config }: CutawaySectionProps) {
  // Compute the max cut range from layers
  const cutMax = useMemo(
    () => Math.max(...config.layers.map((l) => l.depth + (l.geometry.args?.[1] ?? 0.1))),
    [config.layers]
  )

  // Defaults: fully revealed
  const defaults = useMemo(() => {
    const d: Record<string, number | boolean | string> = {
      cutPosition: cutMax,
    }
    // Merge any extra parameters from config
    for (const p of config.parameters ?? []) {
      d[p.key] = p.default
    }
    return d
  }, [config.parameters, cutMax])

  // Create a stable Zustand store
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const useStore = useMemo(() => createModuleStore(defaults), [config.id])

  const cameraPos = config.camera?.position ?? [2, 1.5, 2]
  const cameraFov = config.camera?.fov ?? 40

  return (
    <div className="relative h-full w-full">
      {/* 3D Canvas */}
      <CanvasWrapper
        cameraPosition={cameraPos}
        cameraFov={cameraFov}
        minDistance={1}
        maxDistance={20}
      >
        <CutawaySectionScene config={config} useStore={useStore} />
      </CanvasWrapper>

      {/* Right-side annotation panel */}
      <AnnotationPanel config={config} useStore={useStore} />

      {/* Bottom cut slider */}
      <CutSliderBar config={config} useStore={useStore} />
    </div>
  )
}

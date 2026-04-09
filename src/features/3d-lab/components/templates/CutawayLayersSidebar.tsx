'use client'

import { useMemo } from 'react'
import { Stack, BookOpen } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import type { CutawaySectionConfig } from '@/features/3d-lab/types/templates'
import type { createModuleStore } from '@/features/3d-lab/stores/createModuleStore'

interface CutawayLayersSidebarProps {
  config: CutawaySectionConfig
  useStore: ReturnType<typeof createModuleStore>
}

/**
 * CutawayLayersSidebar — Layers list for cutaway section template.
 * Extracted from CutawaySection template to serve as ViewportSidebar slot content.
 */
export const CutawayLayersSidebar = ({ config, useStore }: CutawayLayersSidebarProps) => {
  const params = useStore((s) => s.params)
  const activeAnnotation = useStore((s) => s.activeAnnotation)
  const setActiveAnnotation = useStore((s) => s.setActiveAnnotation)
  const cutPosition = typeof params.cutPosition === 'number' ? params.cutPosition : 1

  const visibleLayers = useMemo(
    () => config.layers.filter((l) => l.depth <= cutPosition),
    [config.layers, cutPosition],
  )

  return (
    <div>
      {/* Header */}
      <div className="sticky top-0 bg-card border-b border-border px-3 py-2 z-10">
        <div className="flex items-center gap-1.5">
          <SCIcon icon={Stack} size="xs" className="text-muted-foreground" />
          <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            Layers
          </span>
          <span className="ml-auto text-[11px] text-muted-foreground tabular-nums">
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
              onClick={() => setActiveAnnotation(isActive ? null : layer.id)}
              className={`w-full text-left rounded px-2 py-1.5 transition-colors cursor-pointer ${
                !isVisible ? 'opacity-30' : ''
              } ${
                isActive
                  ? 'bg-primary-50 border border-primary/30'
                  : 'hover:bg-muted border border-transparent'
              }`}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-sm shrink-0 border border-black/10"
                  style={{ backgroundColor: layer.geometry.color }}
                />
                <div className="min-w-0 flex-1">
                  <div className="text-[11px] font-medium text-foreground truncate">
                    {layer.label}
                  </div>
                  {layer.material && (
                    <div className="text-[11px] text-muted-foreground truncate">
                      {layer.material}
                    </div>
                  )}
                </div>
              </div>

              {isActive && (
                <div className="mt-1.5 pl-5 space-y-0.5">
                  {layer.description && (
                    <p className="text-[11px] text-text-secondary">
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

'use client'

// src/app/dashboard/3d-lab/_templates/ExplodedAssembly.tsx
import { useMemo, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { CanvasWrapper } from '@/features/3d-lab/components/CanvasWrapper'
import { SceneErrorBoundary } from '@/features/3d-lab/components/templates/SceneErrorBoundary'
import { createModuleStore } from '@/features/3d-lab/stores/createModuleStore'
import { ExplodedAssemblyScene } from './ExplodedAssemblyScene'
import type { ExplodedAssemblyConfig } from '@/features/3d-lab/types/templates'
import { LabSlider } from '@/features/3d-lab/components/controls/LabSlider'

// ─── Props ──────────────────────────────────────────────────────────────────

interface ExplodedAssemblyProps {
  config: ExplodedAssemblyConfig
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ExplodedAssembly({ config }: ExplodedAssemblyProps) {
  // Create a stable store with explode default
  const useStore = useMemo(
    () => createModuleStore({ explode: 0 }),
    [config.id],
  )

  const explode = useStore((s) => (s.params.explode as number) ?? 0)
  const setParam = useStore((s) => s.setParam)
  const activeAnnotation = useStore((s) => s.activeAnnotation)
  const setActiveAnnotation = useStore((s) => s.setActiveAnnotation)

  // Find the active part for the info panel
  const activePart = useMemo(
    () => (activeAnnotation ? config.parts.find((p) => p.id === activeAnnotation) : null),
    [activeAnnotation, config.parts],
  )

  const _handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setParam('explode', parseFloat(e.target.value))
    },
    [setParam],
  )

  const handleClosePanel = useCallback(() => {
    setActiveAnnotation(null)
  }, [setActiveAnnotation])

  const cam = config.camera

  return (
    <SceneErrorBoundary>
      <div className="relative h-full w-full">
        {/* 3D Canvas */}
        <CanvasWrapper
          sceneConfig={{
            cameraPosition: cam?.position ?? [6, 6, 6],
            cameraFov: cam?.fov ?? 35,
            showGround: false,
            minDistance: 0.01,
            maxDistance: Infinity,
          }}
        >
          <ExplodedAssemblyScene config={config} useStore={useStore} />
        </CanvasWrapper>

        {/* Explode Slider — bottom center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-xs px-4">
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-md shadow-lg px-3 py-2">
            <LabSlider
              label="Explode"
              value={explode}
              min={0}
              max={1}
              step={0.01}
              onChange={(v) => setParam('explode', v)}
              formatValue={(v) => `${Math.round(v * 100)}%`}
              compact
            />
          </div>
        </div>

        {/* Info Panel — right side */}
        <AnimatePresence>
          {activePart && (
            <motion.div
              key={activePart.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 16 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute top-4 right-4 z-10 w-64"
            >
              <div className="bg-card/95 backdrop-blur-sm border border-border rounded-md shadow-lg p-3">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div>
                    <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground block mb-0.5">
                      Part
                    </span>
                    <h3 className="text-sm font-bold text-foreground leading-snug">
                      {activePart.label}
                    </h3>
                  </div>
                  <button
                    onClick={handleClosePanel}
                    className="shrink-0 rounded-sm p-1 hover:bg-muted transition-colors"
                  >
                    <SCIcon icon={X} size="xs" className="text-muted-foreground" />
                  </button>
                </div>

                {activePart.description && (
                  <p className="text-xs text-text-secondary leading-relaxed mb-2">
                    {activePart.description}
                  </p>
                )}

                {activePart.codeCitation && (
                  <div className="text-[11px] text-muted-foreground mb-2">
                    {activePart.codeCitation}
                  </div>
                )}

                {/* Material & Geometry info */}
                <div className="flex flex-wrap gap-1.5">
                  <span className="inline-flex items-center px-1.5 py-0.5 bg-muted rounded text-[11px] font-bold text-foreground uppercase tracking-wide">
                    {activePart.geometry.type}
                  </span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SceneErrorBoundary>
  )
}

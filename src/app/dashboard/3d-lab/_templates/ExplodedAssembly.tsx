'use client'

// src/app/dashboard/3d-lab/_templates/ExplodedAssembly.tsx
import { useMemo, useCallback } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X } from 'lucide-react'
import { CanvasWrapper } from '../_components/CanvasWrapper'
import { createModuleStore } from '../_stores/createModuleStore'
import { ExplodedAssemblyScene } from './ExplodedAssemblyScene'
import type { ExplodedAssemblyConfig } from '../_types/templates'

// ─── Props ──────────────────────────────────────────────────────────────────

interface ExplodedAssemblyProps {
  config: ExplodedAssemblyConfig
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function ExplodedAssembly({ config }: ExplodedAssemblyProps) {
  // Create a stable store with explode default
  const useStore = useMemo(
    () => createModuleStore({ explode: 0 }),
    [],
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

  const handleSliderChange = useCallback(
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
    <div className="relative h-full w-full">
      {/* 3D Canvas */}
      <CanvasWrapper
        cameraPosition={cam?.position ?? [6, 6, 6]}
        cameraFov={cam?.fov ?? 35}
        showGround={false}
        minDistance={3}
        maxDistance={20}
      >
        <ExplodedAssemblyScene config={config} useStore={useStore} />
      </CanvasWrapper>

      {/* Explode Slider — bottom center */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-xs px-4">
        <div className="bg-white/95 backdrop-blur-sm border border-border rounded-md shadow-lg px-3 py-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
              Explode
            </span>
            <span className="text-[10px] font-bold text-zinc-600 tabular-nums">
              {Math.round(explode * 100)}%
            </span>
          </div>
          <input
            type="range"
            min={0}
            max={1}
            step={0.01}
            value={explode}
            onChange={handleSliderChange}
            className="w-full h-1 bg-zinc-200 rounded-full appearance-none cursor-pointer accent-blue-600"
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
            <div className="bg-white/95 backdrop-blur-sm border border-border rounded-md shadow-lg p-3">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400 block mb-0.5">
                    Part
                  </span>
                  <h3 className="text-sm font-bold text-zinc-900 leading-snug">
                    {activePart.label}
                  </h3>
                </div>
                <button
                  onClick={handleClosePanel}
                  className="shrink-0 rounded-sm p-1 hover:bg-zinc-100 transition-colors"
                >
                  <X className="h-3.5 w-3.5 text-zinc-400" />
                </button>
              </div>

              {activePart.description && (
                <p className="text-xs text-zinc-500 leading-relaxed mb-2">
                  {activePart.description}
                </p>
              )}

              {activePart.codeCitation && (
                <div className="text-[10px] text-zinc-400 mb-2">
                  {activePart.codeCitation}
                </div>
              )}

              {/* Material & Geometry info */}
              <div className="flex flex-wrap gap-1.5">
                <span className="inline-flex items-center px-1.5 py-0.5 bg-zinc-100 rounded text-[9px] font-bold text-zinc-600 uppercase tracking-wide">
                  {activePart.geometry.type}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

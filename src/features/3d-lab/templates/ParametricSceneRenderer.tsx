'use client'

// src/app/dashboard/3d-lab/_templates/ParametricSceneRenderer.tsx
import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import { Warning } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { useModuleInvalidate } from '@/features/3d-lab/hooks/useModuleInvalidate'
import { InstructionMesh } from '@/features/3d-lab/components/templates/GeometryMesh'
import { HumanSilhouette } from '@/features/3d-lab/components/templates/HumanSilhouette'
import type { ParametricSceneConfig } from '@/features/3d-lab/types/templates'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'

// ─── Main Renderer ──────────────────────────────────────────────────────────

interface ParametricSceneRendererProps {
  config: ParametricSceneConfig
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
  /** When true, suppresses Html violation/annotation overlays in the 3D scene
   *  (used when a ComplianceReportPanel handles the information display instead) */
  hideOverlays?: boolean
}

export function ParametricSceneRenderer({
  config,
  useStore,
  hideOverlays = false,
}: ParametricSceneRendererProps) {
  // Register invalidate bridge
  useModuleInvalidate(useStore)

  // Subscribe to params
  const params = useStore((s) => s.params)

  // Build geometry from config
  const geometryInstructions = useMemo(
    () => config.geometry(params),
    [config, params]
  )

  // Compute active violations
  const activeViolations = useMemo(
    () => (config.violations ?? []).filter((v) => v.check(params)),
    [config.violations, params]
  )

  // Compute visible annotations
  const visibleAnnotations = useMemo(
    () =>
      (config.annotations ?? []).filter(
        (a) => !a.visibleWhen || a.visibleWhen(params)
      ),
    [config.annotations, params]
  )

  return (
    <group scale={config.scale ?? 1}>
      {/* Human scale reference — 1.7m silhouette (research: scale calibration) */}
      {config.showHumanScale && (
        <HumanSilhouette position={[-1.2, 0, 0]} opacity={0.4} />
      )}

      {/* Geometry meshes */}
      {geometryInstructions.map((inst) => (
        <InstructionMesh key={inst.id} inst={inst} />
      ))}

      {/* Violation annotations — hidden when ComplianceReportPanel handles display */}
      {!hideOverlays &&
        activeViolations.map((v) => {
          const pos = v.position?.(params) ?? [0, 0, 0]
          return (
            <Html
              key={v.id}
              position={pos}
              distanceFactor={8}
              occlude={false}
            >
              <div
                style={{ pointerEvents: 'none' }}
                className="flex items-start gap-1 bg-red-50 border border-red-300 rounded px-1.5 py-1 shadow-sm whitespace-nowrap -translate-x-1/2"
              >
                <SCIcon icon={Warning} size="xs" className="text-red-600 shrink-0 mt-px" />
                <div>
                  <div className="text-[11px] font-bold text-red-700">
                    {v.message}
                  </div>
                  {v.codeCitation && (
                    <div className="text-[11px] text-red-500">
                      {v.codeCitation}
                    </div>
                  )}
                </div>
              </div>
            </Html>
          )
        })}

      {/* Static annotations — hidden when ComplianceReportPanel handles display */}
      {!hideOverlays &&
        visibleAnnotations.map((a) => {
          const pos = a.position(params)
          return (
            <Html
              key={a.id}
              position={pos}
              distanceFactor={8}
              occlude={false}
            >
              <div
                style={{ pointerEvents: 'none' }}
                className="bg-white/90 backdrop-blur-sm border border-zinc-200 rounded px-1.5 py-0.5 shadow-sm whitespace-nowrap -translate-x-1/2"
              >
                <div className="text-[11px] font-bold text-zinc-700">
                  {a.label}
                </div>
                {a.codeCitation && (
                  <div className="text-[11px] text-zinc-400">
                    {a.codeCitation}
                  </div>
                )}
              </div>
            </Html>
          )
        })}
    </group>
  )
}

// src/app/dashboard/3d-lab/_templates/ParametricSceneRenderer.tsx
import { useMemo } from 'react'
import { Html } from '@react-three/drei'
import { AlertTriangle } from 'lucide-react'
import { useModuleInvalidate } from '../_hooks/useModuleInvalidate'
import { InstructionMesh } from '../_components/GeometryMesh'
import type { ParametricSceneConfig } from '../_types/templates'
import type { ModuleStoreState } from '../_stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'

// ─── Main Renderer ──────────────────────────────────────────────────────────

interface ParametricSceneRendererProps {
  config: ParametricSceneConfig
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
}

export function ParametricSceneRenderer({
  config,
  useStore,
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
      {/* Geometry meshes */}
      {geometryInstructions.map((inst) => (
        <InstructionMesh key={inst.id} inst={inst} />
      ))}

      {/* Violation annotations */}
      {activeViolations.map((v) => {
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
              <AlertTriangle className="h-3 w-3 text-red-600 shrink-0 mt-px" />
              <div>
                <div className="text-[9px] font-bold text-red-700">
                  {v.message}
                </div>
                {v.codeCitation && (
                  <div className="text-[8px] text-red-500">
                    {v.codeCitation}
                  </div>
                )}
              </div>
            </div>
          </Html>
        )
      })}

      {/* Static annotations */}
      {visibleAnnotations.map((a) => {
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
              <div className="text-[9px] font-bold text-zinc-700">
                {a.label}
              </div>
              {a.codeCitation && (
                <div className="text-[8px] text-zinc-400">
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

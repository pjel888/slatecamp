'use client'

// src/app/dashboard/3d-lab/_templates/ParametricSceneRenderer.tsx
import { useEffect, useMemo, useRef } from 'react'
import * as THREE from 'three'
import type { Group } from 'three'
import { useDisposeOnUnmount } from '@/components/r3f/useDisposeOnUnmount'
import { useModuleInvalidate } from '@/features/3d-lab/hooks/useModuleInvalidate'
import { InstructionMesh } from '@/features/3d-lab/components/templates/GeometryMesh'
import { HumanSilhouette } from '@/features/3d-lab/components/templates/HumanSilhouette'
import { useOverlayStore } from '@/features/3d-lab/stores/useOverlayStore'
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
  const groupRef = useRef<Group>(null)
  useDisposeOnUnmount(groupRef)

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

  // Emit overlay items for violations and annotations
  const upsertItem = useOverlayStore((s) => s.upsertItem)
  const removeItem = useOverlayStore((s) => s.removeItem)

  useEffect(() => {
    if (hideOverlays) return

    // Upsert violation overlays
    activeViolations.forEach((v) => {
      const pos = v.position?.(params) ?? [0, 0, 0]
      upsertItem({
        id: `parametric-violation-${v.id}`,
        worldPosition: new THREE.Vector3(pos[0], pos[1], pos[2]),
        type: 'violation',
        payload: {
          law: v.codeCitation ?? '',
          section: v.codeCitation ?? '',
          message: v.message,
          severity: 'error',
        },
        visible: true,
      })
    })

    // Upsert annotation overlays
    visibleAnnotations.forEach((a) => {
      const pos = a.position(params)
      upsertItem({
        id: `parametric-annotation-${a.id}`,
        worldPosition: new THREE.Vector3(pos[0], pos[1], pos[2]),
        type: 'label',
        payload: {
          text: a.label,
          codeRef: a.codeCitation,
        },
        visible: true,
      })
    })

    return () => {
      activeViolations.forEach((v) => removeItem(`parametric-violation-${v.id}`))
      visibleAnnotations.forEach((a) => removeItem(`parametric-annotation-${a.id}`))
    }
  }, [activeViolations, visibleAnnotations, params, hideOverlays, upsertItem, removeItem])

  return (
    <group ref={groupRef} scale={config.scale ?? 1}>
      {/* Human scale reference — 1.7m silhouette (research: scale calibration) */}
      {config.showHumanScale && (
        <HumanSilhouette position={[-1.2, 0, 0]} opacity={0.4} />
      )}

      {/* Geometry meshes */}
      {geometryInstructions.map((inst) => (
        <InstructionMesh key={inst.id} inst={inst} />
      ))}
    </group>
  )
}

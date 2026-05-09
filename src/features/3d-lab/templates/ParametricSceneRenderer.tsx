'use client'

// src/app/dashboard/3d-lab/_templates/ParametricSceneRenderer.tsx
import { useEffect, useMemo, useRef, useState } from 'react'
import * as THREE from 'three'
import type { Group } from 'three'
import { useDisposeOnUnmount } from '@/components/r3f/useDisposeOnUnmount'
import { useModuleInvalidate } from '@/features/3d-lab/hooks/useModuleInvalidate'
import { InstructionMesh } from '@/features/3d-lab/components/templates/GeometryMesh'
import { InstancedMesh } from '@/features/3d-lab/components/templates/InstancedMesh'
import { HumanSilhouette } from '@/features/3d-lab/components/templates/HumanSilhouette'
import { useOverlayStore } from '@/features/3d-lab/stores/useOverlayStore'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'
import type { ParametricSceneConfig } from '@/features/3d-lab/types/templates'
import type { ModuleStoreState } from '@/features/3d-lab/stores/createModuleStore'
import type { StoreApi, UseBoundStore } from 'zustand'
import { ClickInspectPopover } from '@/features/3d-lab/components/stairway/ClickInspectPopover'

// ─── Main Renderer ──────────────────────────────────────────────────────────

interface ParametricSceneRendererProps {
  config: ParametricSceneConfig
  useStore: UseBoundStore<StoreApi<ModuleStoreState>>
  /** When true, suppresses Html violation overlays in the 3D scene.
   *  Annotation labels may still render when config.alwaysShowAnnotations is enabled. */
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

  // Scene toolbar state
  const xrayMode = useViewportShellStore((s) => s.xrayMode)
  const dimensionsVisible = useViewportShellStore((s) => s.dimensionsVisible)
  const selectElement = useViewportShellStore((s) => s.selectElement)
  const clearSelection = useViewportShellStore((s) => s.clearSelection)

  // Local state for click inspection popover
  const [inspectTarget, setInspectTarget] = useState<string | null>(null)
  const [inspectPos, setInspectPos] = useState<{ x: number; y: number } | null>(null)

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
    const showViolationOverlays = !hideOverlays
    const showAnnotationOverlays = !hideOverlays || config.alwaysShowAnnotations === true
    if (!showViolationOverlays && !showAnnotationOverlays) return

    // Upsert violation overlays
    if (showViolationOverlays) {
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
    }

    // Upsert annotation overlays — normally respect dimensionsVisible;
    // selected teaching modules may keep labels visible beside the source panel.
    if (showAnnotationOverlays) {
      visibleAnnotations.forEach((a) => {
        const pos = a.position(params)
        const visibleByDefault = config.alwaysShowAnnotations === true && (
          config.defaultVisibleAnnotationIds == null || config.defaultVisibleAnnotationIds.includes(a.id)
        )
        upsertItem({
          id: `parametric-annotation-${a.id}`,
          worldPosition: new THREE.Vector3(pos[0], pos[1], pos[2]),
          type: 'label',
          payload: {
            text: a.label,
            codeRef: dimensionsVisible ? a.codeCitation : undefined,
          },
          visible: visibleByDefault || dimensionsVisible,
        })
      })
    }

    return () => {
      activeViolations.forEach((v) => removeItem(`parametric-violation-${v.id}`))
      visibleAnnotations.forEach((a) => removeItem(`parametric-annotation-${a.id}`))
    }
  }, [activeViolations, visibleAnnotations, params, hideOverlays, dimensionsVisible, config.alwaysShowAnnotations, config.defaultVisibleAnnotationIds, upsertItem, removeItem])

  return (
    <>
      <group ref={groupRef} scale={config.scale ?? 1}>
        {/* Human scale reference — 1.7m silhouette (research: scale calibration) */}
        {config.showHumanScale && (
          <HumanSilhouette position={[-1.2, 0, 0]} opacity={0.4} />
        )}

        {/* Geometry meshes — xray mode caps opacity at 0.3 */}
        {geometryInstructions.map((inst) => {
          const effectiveInst = xrayMode
            ? {
                ...inst,
                opacity: Math.min(inst.opacity ?? 1, 0.3),
                transparent: true,
              }
            : inst

          return inst.type === 'instanced' ? (
            <InstancedMesh key={inst.id} inst={effectiveInst} />
          ) : (
            <InstructionMesh 
              key={inst.id} 
              inst={effectiveInst} 
              onClick={(e) => {
                e.stopPropagation()
                selectElement(inst.id)
                setInspectTarget(inst.id)
                setInspectPos({ x: e.nativeEvent.clientX, y: e.nativeEvent.clientY })
              }}
            />
          )
        })}
      </group>

      {/* Stairway-specific click inspection popover */}
      {config.id === 'stairway-configurator' && inspectTarget && inspectPos && (
        <ClickInspectPopover
          elementId={inspectTarget}
          screenPosition={inspectPos}
          useStore={useStore}
          onClose={() => {
            setInspectTarget(null)
            setInspectPos(null)
            clearSelection()
          }}
        />
      )}
    </>
  )
}

// src/app/dashboard/3d-lab/_templates/ParametricScene.tsx
'use client'

import { useMemo } from 'react'
import { Warning } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { CanvasWrapper } from '../_components/CanvasWrapper'
import { GenericControlPanel } from '../_components/GenericControlPanel'
import { ParametricSceneRenderer } from './ParametricSceneRenderer'
import { createModuleStore } from '../_stores/createModuleStore'
import type { ParametricSceneConfig } from '../_types/templates'

// ─── Violation Summary Bar ──────────────────────────────────────────────────

function ViolationBar({
  config,
  useStore,
}: {
  config: ParametricSceneConfig
  useStore: ReturnType<typeof createModuleStore>
}) {
  const params = useStore((s) => s.params)

  const activeViolations = useMemo(
    () => (config.violations ?? []).filter((v) => v.check(params)),
    [config.violations, params]
  )

  if (activeViolations.length === 0) return null

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-red-600 text-white rounded-md px-3 py-1.5 shadow-lg">
      <SCIcon icon={Warning} size="xs" className="shrink-0" />
      <span className="text-[11px] font-bold">
        {activeViolations.length} code violation
        {activeViolations.length !== 1 ? 's' : ''} detected
      </span>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

interface ParametricSceneProps {
  config: ParametricSceneConfig
}

export default function ParametricScene({ config }: ParametricSceneProps) {
  // Build default values from parameter definitions
  const defaults = useMemo(() => {
    const d: Record<string, number | boolean | string> = {}
    for (const p of config.parameters) {
      d[p.key] = p.default
    }
    return d
  }, [config.parameters])

  // Create a stable Zustand store — recreated only if module id changes
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const useStore = useMemo(() => createModuleStore(defaults), [config.id])

  const cameraPos = config.camera?.position ?? [3, 3, 3]
  const cameraFov = config.camera?.fov ?? 45

  return (
    <div className="relative h-full w-full">
      {/* 3D Canvas */}
      <CanvasWrapper
        cameraPosition={cameraPos}
        cameraFov={cameraFov}
        minDistance={1}
        maxDistance={10}
      >
        <ParametricSceneRenderer config={config} useStore={useStore} />
      </CanvasWrapper>

      {/* Control Panel */}
      <GenericControlPanel
        title={config.title}
        parameters={config.parameters}
        presets={config.presets}
        useStore={useStore}
      />

      {/* Violation Summary Bar */}
      <ViolationBar config={config} useStore={useStore} />
    </div>
  )
}

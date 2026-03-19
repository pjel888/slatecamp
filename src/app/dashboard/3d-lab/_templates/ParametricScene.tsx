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

// ─── Context Scenario Banner ────────────────────────────────────────────────

const ContextScenarioBanner = ({ text }: { text: string }) => (
  <div className="absolute top-0 left-0 right-0 z-10 px-4 py-2.5 bg-white/90 backdrop-blur-sm border-b border-zinc-200">
    <p className="text-[12px] text-zinc-500 leading-relaxed max-w-[640px]">
      {text}
    </p>
  </div>
)

// ─── ALE Question Count Badge ───────────────────────────────────────────────

const AleQuestionBadge = ({ count }: { count: number }) => (
  <div className="absolute top-4 right-4 z-10">
    <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-[#E8853A] bg-white/90 backdrop-blur-sm border border-zinc-200 px-2.5 py-1 rounded-sm shadow-sm">
      ~{count} ALE questions / sitting
    </span>
  </div>
)

// ─── Violation Summary Bar ──────────────────────────────────────────────────

const ViolationBar = ({
  config,
  useStore,
}: {
  config: ParametricSceneConfig
  useStore: ReturnType<typeof createModuleStore>
}) => {
  const params = useStore((s) => s.params)

  const activeViolations = useMemo(
    () => (config.violations ?? []).filter((v) => v.check(params)),
    [config.violations, params]
  )

  if (activeViolations.length === 0) return null

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-2 bg-[#D64545] text-white rounded-sm px-3 py-1.5 shadow-md">
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
  const hasScenario = !!config.contextScenario

  return (
    <div className="relative h-full w-full">
      {/* Context Scenario — research: narrative encoding improves recall */}
      {hasScenario && <ContextScenarioBanner text={config.contextScenario!} />}

      {/* ALE Question Count Badge */}
      {config.aleQuestionCount != null && !hasScenario && (
        <AleQuestionBadge count={config.aleQuestionCount} />
      )}

      {/* 3D Canvas */}
      <CanvasWrapper
        cameraPosition={cameraPos}
        cameraFov={cameraFov}
        minDistance={1}
        maxDistance={10}
      >
        <ParametricSceneRenderer
          config={config}
          useStore={useStore}
        />
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

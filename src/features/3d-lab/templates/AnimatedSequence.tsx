'use client'

// src/app/dashboard/3d-lab/_templates/AnimatedSequence.tsx
import { useMemo, useCallback, useEffect, useRef } from 'react'
import { Play, Pause, CaretLeft, CaretRight } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { CanvasWrapper } from '@/features/3d-lab/components/CanvasWrapper'
import { SceneErrorBoundary } from '@/features/3d-lab/components/templates/SceneErrorBoundary'
import { createModuleStore } from '@/features/3d-lab/stores/createModuleStore'
import { AnimatedSequenceScene } from './AnimatedSequenceScene'
import type { AnimatedSequenceConfig } from '@/features/3d-lab/types/templates'
import { LabSlider } from '@/features/3d-lab/components/controls/LabSlider'

// ─── Props ──────────────────────────────────────────────────────────────────

interface AnimatedSequenceProps {
  config: AnimatedSequenceConfig
}

// ─── Component ──────────────────────────────────────────────────────────────

export default function AnimatedSequence({ config }: AnimatedSequenceProps) {
  const useStore = useMemo(
    () => createModuleStore({ currentStep: 0, isPlaying: false }),
    [config.id],
  )

  const currentStep = useStore((s) => (s.params.currentStep as number) ?? 0)
  const isPlaying = useStore((s) => (s.params.isPlaying as boolean) ?? false)
  const setParam = useStore((s) => s.setParam)

  const maxStep = config.steps.length - 1
  const step = config.steps[currentStep]
  const cam = config.camera

  // Auto-play interval
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const speed = config.autoPlaySpeed ?? 1500

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => {
        const state = useStore.getState()
        const cur = state.params.currentStep as number
        if (cur < maxStep) {
          state.setParam('currentStep', cur + 1)
        } else if (config.loop) {
          state.setParam('currentStep', 0)
        } else {
          state.setParam('isPlaying', false)
        }
      }, speed)
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [isPlaying, speed, maxStep, config.loop, useStore])

  const handlePlayPause = useCallback(() => {
    const cur = useStore.getState().params.currentStep as number
    if (!isPlaying && cur >= maxStep && !config.loop) {
      // Restart from beginning if at end
      setParam('currentStep', 0)
    }
    setParam('isPlaying', !isPlaying)
  }, [isPlaying, maxStep, config.loop, setParam, useStore])

  const handleStepBack = useCallback(() => {
    if (currentStep > 0) {
      setParam('currentStep', currentStep - 1)
      setParam('isPlaying', false)
    }
  }, [currentStep, setParam])

  const handleStepForward = useCallback(() => {
    if (currentStep < maxStep) {
      setParam('currentStep', currentStep + 1)
      setParam('isPlaying', false)
    }
  }, [currentStep, maxStep, setParam])

  const _handleSliderChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setParam('currentStep', parseInt(e.target.value, 10))
      setParam('isPlaying', false)
    },
    [setParam],
  )

  return (
    <SceneErrorBoundary>
      <div className="relative h-full w-full">
        {/* 3D Canvas */}
        <CanvasWrapper
          sceneConfig={{
            cameraPosition: cam?.position ?? [5, 5, 5],
            cameraFov: cam?.fov ?? 40,
            showGround: false,
            minDistance: 0.01,
            maxDistance: Infinity,
          }}
        >
          <AnimatedSequenceScene config={config} useStore={useStore} />
        </CanvasWrapper>

        {/* Timeline Control Bar — bottom center */}
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 w-full max-w-md px-4">
          <div className="bg-card/95 backdrop-blur-sm border border-border rounded-md shadow-lg px-3 py-2.5">
            {/* Step label */}
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Step {currentStep + 1} / {config.steps.length}
              </span>
              {step && (
                <span className="text-[11px] font-bold text-foreground truncate ml-2">
                  {step.label}
                </span>
              )}
            </div>

            <LabSlider
              label={`Step ${currentStep + 1}`}
              value={currentStep}
              min={0}
              max={maxStep}
              step={1}
              onChange={(v) => {
                setParam('currentStep', Math.round(v))
                setParam('isPlaying', false)
              }}
              formatValue={(_v) => `/ ${config.steps.length}`}
              compact
              className="mb-2"
            />

            {/* Controls */}
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={handleStepBack}
                disabled={currentStep === 0}
                className="rounded-sm p-1.5 hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <SCIcon icon={CaretLeft} size="sm" className="text-foreground" />
              </button>
              <button
                onClick={handlePlayPause}
                className="rounded-sm p-1.5 hover:bg-muted transition-colors"
              >
                {isPlaying ? (
                  <SCIcon icon={Pause} size="sm" className="text-foreground" />
                ) : (
                  <SCIcon icon={Play} size="sm" className="text-foreground" />
                )}
              </button>
              <button
                onClick={handleStepForward}
                disabled={currentStep >= maxStep}
                className="rounded-sm p-1.5 hover:bg-muted transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <SCIcon icon={CaretRight} size="sm" className="text-foreground" />
              </button>
            </div>
          </div>
        </div>

        {/* Step Info Panel — right side */}
        {step && (
          <div className="absolute top-4 right-4 z-10 w-64">
            <div className="bg-card/95 backdrop-blur-sm border border-border rounded-md shadow-lg p-3">
              <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground block mb-0.5">
                Step {currentStep + 1}
              </span>
              <h3 className="text-sm font-bold text-foreground leading-snug mb-1">
                {step.label}
              </h3>
              {step.description && (
                <p className="text-xs text-text-secondary leading-relaxed mb-2">
                  {step.description}
                </p>
              )}
              {step.codeCitation && (
                <div className="inline-flex items-center px-1.5 py-0.5 bg-muted rounded text-[11px] font-bold text-muted-foreground uppercase tracking-wide">
                  {step.codeCitation}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </SceneErrorBoundary>
  )
}

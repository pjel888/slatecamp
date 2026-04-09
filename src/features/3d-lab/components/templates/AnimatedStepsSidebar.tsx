'use client'

import { useCallback } from 'react'
import { Play, Pause, SkipBack, SkipForward } from 'lucide-react'
import type { AnimatedSequenceConfig } from '@/features/3d-lab/types/templates'
import type { createModuleStore } from '@/features/3d-lab/stores/createModuleStore'
import { LabSlider } from '@/features/3d-lab/components/controls/LabSlider'

interface AnimatedStepsSidebarProps {
  config: AnimatedSequenceConfig
  useStore: ReturnType<typeof createModuleStore>
}

/**
 * AnimatedStepsSidebar — Step list + playback controls for animated sequence.
 * Extracted from AnimatedSequence to serve as ViewportSidebar slot content.
 */
export const AnimatedStepsSidebar = ({ config, useStore }: AnimatedStepsSidebarProps) => {
  const params = useStore((s) => s.params)
  const setParam = useStore((s) => s.setParam)

  const currentStep = typeof params.currentStep === 'number' ? params.currentStep : 0
  const isPlaying = params.isPlaying === true
  const totalSteps = config.steps.length

  const handlePlayPause = useCallback(() => {
    setParam('isPlaying', !isPlaying)
  }, [isPlaying, setParam])

  const handlePrev = useCallback(() => {
    if (currentStep > 0) setParam('currentStep', currentStep - 1)
  }, [currentStep, setParam])

  const handleNext = useCallback(() => {
    if (currentStep < totalSteps - 1) setParam('currentStep', currentStep + 1)
  }, [currentStep, totalSteps, setParam])

  const step = config.steps[currentStep]

  return (
    <div>
      {/* Playback controls */}
      <div className="px-3 py-2 border-b border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
            Step {currentStep + 1} / {totalSteps}
          </span>
        </div>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={handlePrev}
            disabled={currentStep === 0}
            className="p-1.5 rounded-sm hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <SkipBack size={14} />
          </button>
          <button
            type="button"
            onClick={handlePlayPause}
            className="p-1.5 rounded-sm bg-primary text-white hover:bg-primary/90 transition-colors"
          >
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={currentStep === totalSteps - 1}
            className="p-1.5 rounded-sm hover:bg-muted disabled:opacity-30 transition-colors"
          >
            <SkipForward size={14} />
          </button>
        </div>
        {/* Step slider */}
        <LabSlider
          label="Step"
          value={currentStep}
          min={0}
          max={totalSteps - 1}
          step={1}
          onChange={(v) => setParam('currentStep', Math.round(v))}
          formatValue={(v) => `${Math.round(v) + 1} / ${totalSteps}`}
          compact
          className="mt-2"
        />
      </div>

      {/* Step list */}
      <div className="p-2 space-y-1">
        {config.steps.map((s, i) => (
          <button
            key={s.id}
            onClick={() => setParam('currentStep', i)}
            className={`w-full text-left rounded px-2 py-1.5 transition-colors cursor-pointer ${
              i === currentStep
                ? 'bg-primary-50 border border-primary/30'
                : i < currentStep
                  ? 'hover:bg-muted border border-transparent opacity-60'
                  : 'hover:bg-muted border border-transparent'
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-bold text-muted-foreground w-4 shrink-0">
                {i + 1}
              </span>
              <span className="text-[11px] font-medium text-foreground truncate">
                {s.label}
              </span>
            </div>
          </button>
        ))}
      </div>

      {/* Current step detail */}
      {step && (
        <div className="px-3 py-2 border-t border-border">
          <h4 className="text-xs font-bold text-foreground mb-1">{step.label}</h4>
          {step.description && (
            <p className="text-[11px] text-text-secondary leading-relaxed">
              {step.description}
            </p>
          )}
          {step.codeCitation && (
            <div className="mt-1 text-[11px] text-muted-foreground">
              {step.codeCitation}
            </div>
          )}
        </div>
      )}
    </div>
  )
}

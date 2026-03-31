'use client'

import { useSiteControlsStore, TOUR_STEP_LABELS } from '../../_stores/siteControlsStore'

const STEP_DESCRIPTIONS: Record<number, string> = {
  0: 'Explore the raw lot — your starting canvas for every development control calculation.',
  1: 'Required setback margins appear. These minimum distances from lot lines are set by PD 1096.',
  2: 'The maximum building footprint (AMBF) materializes. Drag the sliders to see PSO impact.',
  3: 'The building rises floor by floor. Watch the BHL ceiling — exceed it and the mass turns red.',
  4: 'Open space requirements fill in. Context buildings appear to give a sense of neighborhood.',
  5: 'All controls unlocked. Test different configurations and see live violation detection.',
}

/**
 * Guided tour overlay — positioned at the top of the canvas area.
 * Shows step progress, description, and navigation controls.
 * When tourStep is null, shows a floating "Start Guided Tour" button.
 */
export function TourOverlay() {
  const tourStep = useSiteControlsStore((s) => s.tourStep)
  const setTourStep = useSiteControlsStore((s) => s.setTourStep)
  const nextTourStep = useSiteControlsStore((s) => s.nextTourStep)
  const prevTourStep = useSiteControlsStore((s) => s.prevTourStep)

  // No tour active — show start button
  if (tourStep === null) {
    return (
      <button
        onClick={() => setTourStep(0)}
        className="absolute bottom-4 left-4 z-20 rounded-sm border border-[#D4DAE3] bg-white/90 px-3 py-2 text-xs font-medium text-[#1A2332] shadow-sm backdrop-blur-sm transition-colors duration-150 hover:bg-[#EEF2FC] hover:border-[#1B3FC4]"
      >
        Start Guided Tour
      </button>
    )
  }

  const stepInfo = TOUR_STEP_LABELS[tourStep]
  const description = STEP_DESCRIPTIONS[tourStep]
  const isLastStep = tourStep === 5

  return (
    <div className="absolute left-4 right-4 top-4 z-20 rounded-md border border-[#D4DAE3] bg-white/90 px-4 py-3 shadow-sm backdrop-blur-sm md:left-4 md:right-auto md:max-w-sm">
      {/* Step indicator */}
      <div className="mb-1 flex items-center gap-2">
        <span className="text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
          Step {String(tourStep).padStart(2, '0')} — {stepInfo.subtitle}
        </span>
        {/* Step dots */}
        <div className="flex gap-1 ml-auto">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <button
              key={i}
              onClick={() => setTourStep(i as 0 | 1 | 2 | 3 | 4 | 5)}
              className={`h-1.5 w-1.5 rounded-full transition-colors duration-150 ${
                i === tourStep ? 'bg-[#1B3FC4]' : i < tourStep ? 'bg-[#1B3FC4]/40' : 'bg-[#D4DAE3]'
              }`}
              aria-label={`Go to step ${i}`}
            />
          ))}
        </div>
      </div>

      {/* Title */}
      <p className="mb-1 text-sm font-medium text-[#1A2332]">{stepInfo.title}</p>

      {/* Description */}
      <p className="mb-3 text-xs leading-relaxed text-[#4A5568]">{description}</p>

      {/* Navigation */}
      <div className="flex items-center gap-2">
        <button
          onClick={prevTourStep}
          disabled={tourStep === 0}
          className="rounded-sm border border-[#D4DAE3] px-2.5 py-1 text-[11px] font-medium text-[#4A5568] transition-colors duration-150 hover:bg-[#F8F7F5] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Prev
        </button>
        <span className="flex-1 text-center text-[10px] text-[#8896A7]">
          {tourStep + 1} of 6
        </span>
        <button
          onClick={isLastStep ? () => setTourStep(null) : nextTourStep}
          className="rounded-sm border border-[#1B3FC4] bg-[#1B3FC4] px-2.5 py-1 text-[11px] font-medium text-white transition-colors duration-150 hover:bg-[#1535A8]"
        >
          {isLastStep ? 'Enter Sandbox' : 'Next'}
        </button>
        <button
          onClick={() => setTourStep(null)}
          className="rounded-sm px-1.5 py-1 text-[11px] text-[#8896A7] transition-colors duration-150 hover:text-[#4A5568]"
          aria-label="Exit tour"
        >
          Exit
        </button>
      </div>
    </div>
  )
}

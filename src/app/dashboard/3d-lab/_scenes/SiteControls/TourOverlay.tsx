'use client'

import { useSiteControlsStore, TOUR_STEP_LABELS } from '../../_stores/siteControlsStore'

/**
 * 6-step guided tour overlay. Positioned absolutely over the Canvas.
 * When tour is null (sandbox mode), shows a "Guided Tour" button.
 * Steps 0-5 progressively reveal scene layers.
 */
export function TourOverlay() {
  const tourStep = useSiteControlsStore((s) => s.tourStep)
  const setTourStep = useSiteControlsStore((s) => s.setTourStep)
  const nextTourStep = useSiteControlsStore((s) => s.nextTourStep)
  const prevTourStep = useSiteControlsStore((s) => s.prevTourStep)

  // Sandbox mode — show entry button
  if (tourStep === null) {
    return (
      <button
        onClick={() => setTourStep(0)}
        className="absolute left-3 top-3 z-20 rounded-sm border border-[#D4DAE3] bg-white/90 px-3 py-1.5 text-[10px] font-medium text-[#1A2332] shadow-sm backdrop-blur-sm transition-colors duration-150 hover:bg-[#EEF2FC] hover:border-[#1B3FC4]"
      >
        Guided Tour
      </button>
    )
  }

  const step = TOUR_STEP_LABELS[tourStep]
  if (!step) return null

  return (
    <div className="absolute left-3 right-3 top-3 z-20 rounded-md border border-[#1B3FC4] bg-white/95 p-3 shadow-md backdrop-blur-sm md:left-3 md:right-auto md:w-72">
      {/* Progress bar */}
      <div className="mb-2 flex items-center gap-1.5">
        {[0, 1, 2, 3, 4, 5].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors duration-150 ${
              s <= tourStep ? 'bg-[#1B3FC4]' : 'bg-[#D4DAE3]'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <p className="text-[10px] font-medium uppercase tracking-wider text-[#8896A7]">
        Step {tourStep + 1} — {step.subtitle}
      </p>
      <p className="mt-0.5 text-sm font-medium text-[#1A2332]">{step.title}</p>

      {/* Navigation */}
      <div className="mt-3 flex items-center gap-2">
        <button
          onClick={prevTourStep}
          disabled={tourStep === 0}
          className="rounded-sm border border-[#D4DAE3] px-2.5 py-1 text-[10px] font-medium text-[#4A5568] transition-colors duration-150 hover:bg-[#F8F7F5] disabled:opacity-30 disabled:cursor-not-allowed"
        >
          Back
        </button>
        <button
          onClick={nextTourStep}
          className="rounded-sm bg-[#1B3FC4] px-2.5 py-1 text-[10px] font-medium text-white transition-colors duration-150 hover:bg-[#1535A8]"
        >
          {tourStep < 5 ? 'Next' : 'Explore'}
        </button>
        <button
          onClick={() => setTourStep(null)}
          className="ml-auto text-[10px] text-[#8896A7] transition-colors duration-150 hover:text-[#1A2332]"
        >
          Skip
        </button>
      </div>
    </div>
  )
}

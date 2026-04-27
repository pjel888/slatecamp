'use client'

import { useDevControlsStore } from '../stores/useDevControlsStore'

// 6-step guided tour overlay — positioned absolutely over the canvas.
// Tour steps follow the canonical computation sequence.

const TOUR_STEPS = [
  { title: 'Read the Lot', description: 'Start with the Total Lot Area (TLA). The lot boundary defines the full extent of your site — everything else is carved from this.', focus: 'tla' },
  { title: 'Carve the Margins', description: 'Setbacks create mandatory buffers from property lines. They differ by zoning class and RROW width. This is where you cannot build.', focus: 'setbacks' },
  { title: 'Find the Footprint', description: 'The AMBF is the maximum area your building can occupy. It\'s the lesser of the setback-based envelope and the PSO-based limit.', focus: 'ambf' },
  { title: 'Rise Within Limits', description: 'Building Height Limit (BHL) caps how tall you can go. It\'s governed by both zoning and road width. Your volume is AMBF × BHL.', focus: 'bhl' },
  { title: 'Give Back the Ground', description: 'Open space (TOSL) = TLA minus AMBF. It splits into ISA (paved) and USA (unpaved). The closure identity must hold: TLA = AMBF + ISA + USA.', focus: 'tosl' },
  { title: 'Test Your Limits', description: 'You\'re in sandbox mode now. Adjust any parameter and watch how the site responds. Try triggering a violation — then fix it.', focus: null },
]

export function TourOverlay() {
  const tourStep = useDevControlsStore((s) => s.tourStep)
  const nextTourStep = useDevControlsStore((s) => s.nextTourStep)
  const prevTourStep = useDevControlsStore((s) => s.prevTourStep)
  const setTourStep = useDevControlsStore((s) => s.setTourStep)

  if (tourStep === null) return null

  const step = TOUR_STEPS[tourStep]
  if (!step) return null

  const isFirst = tourStep === 0
  const isLast = tourStep === TOUR_STEPS.length - 1

  return (
    <div
      className="absolute inset-x-0 bottom-0 z-20 p-4 md:bottom-4 md:left-4 md:right-auto md:max-w-sm"
      data-testid="3dlab-devcontrols-tour-overlay"
      data-3dlab-onboarding-stage="devcontrols-tour"
    >
      <div className="rounded-md border border-border bg-card p-4 shadow-md">
        {/* Step indicator */}
        <div className="mb-2 flex items-center gap-1.5">
          {TOUR_STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-150 ${
                i <= tourStep ? 'bg-primary' : 'bg-border'
              }`}
            />
          ))}
        </div>

        {/* Step counter */}
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground mb-1">
          Step {tourStep + 1} of {TOUR_STEPS.length}
        </p>

        {/* Content */}
        <h3 className="text-sm font-semibold text-foreground mb-1">{step.title}</h3>
        <p className="text-xs text-text-secondary leading-relaxed mb-3">{step.description}</p>

        {/* Navigation */}
        <div className="flex items-center gap-2">
          {!isFirst && (
            <button
              onClick={prevTourStep}
              className="rounded-sm border border-border px-3 py-1.5 text-[10px] font-medium text-text-secondary transition-colors duration-150 hover:bg-surface-light"
            >
              Back
            </button>
          )}
          {!isLast ? (
            <button
              onClick={nextTourStep}
              className="rounded-sm bg-primary px-3 py-1.5 text-[10px] font-medium text-white transition-colors duration-150 hover:bg-primary-700"
            >
              Next
            </button>
          ) : (
            <button
              onClick={() => setTourStep(null)}
              className="rounded-sm bg-primary px-3 py-1.5 text-[10px] font-medium text-white transition-colors duration-150 hover:bg-primary-700"
            >
              Start Exploring
            </button>
          )}
          <button
            onClick={() => setTourStep(null)}
            className="ml-auto text-[10px] text-muted-foreground transition-colors duration-150 hover:text-foreground"
          >
            Skip tour
          </button>
        </div>
      </div>
    </div>
  )
}

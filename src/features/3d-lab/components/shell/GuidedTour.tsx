'use client'

// GuidedTour — shared guided tour for 3D Lab modules
// Config-driven via tourStops array. Progress dots, Back/Next/Skip.
// Stores completion per module in localStorage.

import { useState, useEffect, useCallback } from 'react'

export interface TourStop {
  id: string
  title: string
  description: string
  /** Camera position to snap to during this stop */
  cameraPosition?: [number, number, number]
  /** Element ID to spotlight/highlight */
  spotlightElement?: string
}

interface GuidedTourProps {
  moduleId: string
  stops: TourStop[]
  onCameraSnap?: (position: [number, number, number]) => void
}

const STORAGE_KEY_PREFIX = 'slatecamp-tour-completed-'

export const GuidedTour = ({ moduleId, stops, onCameraSnap }: GuidedTourProps) => {
  const [currentStep, setCurrentStep] = useState(0)
  const [dismissed, setDismissed] = useState(false)

  // Check if tour already completed
  useEffect(() => {
    try {
      const completed = localStorage.getItem(`${STORAGE_KEY_PREFIX}${moduleId}`)
      if (completed === 'true') setDismissed(true)
    } catch { /* localStorage unavailable */ }
  }, [moduleId])

  const handleNext = useCallback(() => {
    if (currentStep < stops.length - 1) {
      const nextStep = currentStep + 1
      setCurrentStep(nextStep)
      if (stops[nextStep]?.cameraPosition && onCameraSnap) {
        onCameraSnap(stops[nextStep].cameraPosition!)
      }
    } else {
      // Tour complete
      try { localStorage.setItem(`${STORAGE_KEY_PREFIX}${moduleId}`, 'true') } catch {}
      setDismissed(true)
    }
  }, [currentStep, stops, moduleId, onCameraSnap])

  const handleBack = useCallback(() => {
    if (currentStep > 0) {
      const prevStep = currentStep - 1
      setCurrentStep(prevStep)
      if (stops[prevStep]?.cameraPosition && onCameraSnap) {
        onCameraSnap(stops[prevStep].cameraPosition!)
      }
    }
  }, [currentStep, stops, onCameraSnap])

  const handleSkip = useCallback(() => {
    try { localStorage.setItem(`${STORAGE_KEY_PREFIX}${moduleId}`, 'true') } catch {}
    setDismissed(true)
  }, [moduleId])

  if (dismissed || stops.length === 0) return null

  const stop = stops[currentStep]

  return (
    <div className="absolute bottom-20 left-4 z-30 max-w-sm rounded-md border border-border bg-card p-4 shadow-lg pointer-events-auto">
      {/* Progress dots */}
      <div className="mb-2 flex items-center gap-1">
        {stops.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-1.5 rounded-full transition-colors duration-150 ${
              i === currentStep ? 'bg-primary' : i < currentStep ? 'bg-primary/40' : 'bg-muted'
            }`}
          />
        ))}
        <span className="ml-auto text-[10px] text-muted-foreground">
          Step {currentStep + 1} of {stops.length}
        </span>
      </div>

      {/* Content */}
      <h3 className="text-sm font-display font-semibold text-foreground">{stop.title}</h3>
      <p className="mt-1 text-xs text-muted-foreground leading-relaxed">{stop.description}</p>

      {/* Actions */}
      <div className="mt-3 flex items-center justify-between">
        <button
          type="button"
          onClick={handleSkip}
          className="text-[10px] text-muted-foreground hover:text-foreground transition-colors duration-150"
        >
          Skip tour
        </button>
        <div className="flex gap-2">
          {currentStep > 0 && (
            <button
              type="button"
              onClick={handleBack}
              className="rounded-sm px-2.5 py-1 text-xs text-muted-foreground hover:text-foreground hover:bg-muted transition-colors duration-150"
            >
              Back
            </button>
          )}
          <button
            type="button"
            onClick={handleNext}
            className="rounded-sm bg-primary px-2.5 py-1 text-xs font-medium text-white transition-colors duration-150 hover:bg-primary/90"
          >
            {currentStep < stops.length - 1 ? 'Next' : 'Finish'}
          </button>
        </div>
      </div>
    </div>
  )
}

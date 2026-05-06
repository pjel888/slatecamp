'use client'

import { useState, useEffect, useCallback } from 'react'
import { HandGrabbing, Crosshair, ClipboardText } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { markGlobal3DLabOnboardingComplete } from './onboarding/state'

interface OnboardingFlowProps {
  onComplete: () => void
}

const STEPS = [
  {
    Icon: HandGrabbing,
    instruction: 'Drag anywhere to rotate the model. Scroll or pinch to zoom.',
  },
  {
    Icon: Crosshair,
    instruction: 'Tap the glowing dots on the model to open a code annotation.',
  },
  {
    Icon: ClipboardText,
    instruction: "After reading a hotspot, tap 'Practice a question' to answer one exam question.",
  },
]

/**
 * OnboardingFlow — Refactored to use Tailwind and semantic tokens.
 * Displays orientation steps for new 3D Lab users.
 */
export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    // Parent coordinates whether the global orientation should be mounted.
    // This component only owns presentation and completion persistence.
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleComplete = useCallback(() => {
    markGlobal3DLabOnboardingComplete()
    setVisible(false)
    setTimeout(onComplete, 200)
  }, [onComplete])

  const handleNext = useCallback(() => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      handleComplete()
    }
  }, [step, handleComplete])

  const handleSkip = useCallback(() => {
    handleComplete()
  }, [handleComplete])

  const { Icon, instruction } = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <div
      className="contents"
      data-testid="3dlab-onboarding-overlay"
      data-3dlab-onboarding-stage="global"
    >
      {/* Backdrop */}
      <div
        className={cn(
          "fixed inset-0 bg-black/50 z-[300] transition-opacity duration-200",
          visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
        onClick={handleSkip}
      />

      {/* Card — centered on desktop, bottom sheet on mobile */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="3D Lab orientation"
        data-testid="3dlab-onboarding-dialog"
        className={cn(
          "fixed z-[301] bg-card p-6 flex flex-col gap-5 transition-opacity duration-200 shadow-modal",
          "sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:w-96 sm:rounded-xl",
          "bottom-0 left-0 right-0 rounded-t-xl sm:bottom-auto",
          visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        )}
      >
        {/* Icon + instruction */}
        <div className="flex flex-col items-center gap-6 py-2">
          <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center border-4 border-white shadow-sm">
            <Icon size={44} className="text-primary" weight="duotone" />
          </div>
          <p className="text-[15px] font-medium text-foreground text-center leading-[1.5] tracking-tight px-2">
            {instruction}
          </p>
        </div>

        {/* Step dots */}
        <div className="flex justify-center gap-2">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                "w-1.5 h-1.5 rounded-full transition-all duration-200",
                i === step ? "bg-primary w-4" : "bg-border-default opacity-40"
              )}
            />
          ))}
        </div>

        {/* Next button */}
        <div className="flex flex-col gap-3">
          <Button 
            onClick={handleNext} 
            className="w-full font-mono text-[11px] font-bold uppercase tracking-widest"
            size="lg"
          >
            {isLast ? 'Start exploring' : 'Next'}
          </Button>

          {/* Skip link */}
          <button
            onClick={handleSkip}
            className="bg-transparent border-0 cursor-pointer font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground hover:text-foreground transition-colors p-1"
          >
            Skip Orientation
          </button>
        </div>
      </div>
    </div>
  )
}

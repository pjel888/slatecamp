'use client'

import { useState, useEffect, useCallback } from 'react'
import { HandGrabbing, Crosshair, ClipboardText } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
} from '@/components/ui/modal'
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
 * OnboardingFlow — global 3D Lab orientation using the canonical Modal shell.
 */
export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
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
      <Modal open={visible} onOpenChange={(open) => { if (!open) handleSkip() }}>
        <ModalContent
          size="md"
          role="dialog"
          aria-label="3D Lab orientation"
          data-testid="3dlab-onboarding-dialog"
          maxHeight="calc(100dvh - 24px)"
        >
          <ModalHeader closeAriaLabel="Skip orientation">
            <ModalTitle>3D Lab orientation</ModalTitle>
            <ModalDescription>
              Step {step + 1} of {STEPS.length}
            </ModalDescription>
          </ModalHeader>

          <ModalBody className="flex flex-col items-center gap-6 px-6 py-6 text-center">
            <div className="flex h-20 w-20 items-center justify-center rounded-full border-4 border-white bg-primary/10 shadow-sm">
              <Icon size={44} className="text-primary" weight="duotone" />
            </div>
            <p className="px-2 text-[15px] font-medium leading-[1.5] tracking-tight text-foreground">
              {instruction}
            </p>
            <div className="flex justify-center gap-2" aria-hidden="true">
              {STEPS.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    'h-1.5 rounded-full transition-all duration-200',
                    i === step ? 'w-4 bg-primary' : 'w-1.5 bg-border-default opacity-40',
                  )}
                />
              ))}
            </div>
          </ModalBody>

          <ModalFooter className="flex-col-reverse sm:flex-col-reverse">
            <Button
              onClick={handleNext}
              className="w-full font-mono text-[11px] font-bold uppercase tracking-widest"
              size="lg"
            >
              {isLast ? 'Start exploring' : 'Next'}
            </Button>
            <button
              type="button"
              onClick={handleSkip}
              className="w-full rounded-sm bg-transparent p-1 font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            >
              Skip Orientation
            </button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  )
}

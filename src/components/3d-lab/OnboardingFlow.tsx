'use client'

import { useState, useEffect } from 'react'
import { HandGrabbing, Crosshair, ClipboardText } from '@phosphor-icons/react/dist/ssr'

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

export const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0)
  const [visible, setVisible] = useState(false)
  const [show, setShow] = useState(false)

  useEffect(() => {
    const alreadyOnboarded = localStorage.getItem('3dlab_onboarded')
    if (!alreadyOnboarded) {
      setShow(true)
      // Trigger fade-in after mount
      requestAnimationFrame(() => setVisible(true))
    }
  }, [])

  if (!show) return null

  const handleComplete = () => {
    localStorage.setItem('3dlab_onboarded', 'true')
    setVisible(false)
    setTimeout(onComplete, 200)
  }

  const handleNext = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1)
    } else {
      handleComplete()
    }
  }

  const handleSkip = () => {
    handleComplete()
  }

  const { Icon, instruction } = STEPS[step]
  const isLast = step === STEPS.length - 1

  return (
    <>
      <style>{ONBOARDING_STYLES}</style>

      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.50)',
          zIndex: 300,
          opacity: visible ? 1 : 0,
          transition: 'opacity 200ms ease-out',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      />

      {/* Card — centered on desktop, bottom sheet on mobile */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="3D Lab orientation"
        style={{
          position: 'fixed',
          zIndex: 301,
          opacity: visible ? 1 : 0,
          transition: 'opacity 200ms ease-out',
          // Desktop: centered
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'min(calc(100vw - 32px), 384px)',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '20px',
        }}
        className="onboarding-card"
      >
        {/* Icon + instruction */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: '16px',
            paddingTop: '8px',
            paddingBottom: '8px',
          }}
        >
          <Icon size={48} color="#1B3FC4" weight="duotone" />
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              color: '#1A2332',
              margin: 0,
              lineHeight: 1.5,
              textAlign: 'center',
            }}
          >
            {instruction}
          </p>
        </div>

        {/* Step dots */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          {STEPS.map((_, i) => (
            <div
              key={i}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                backgroundColor: i === step ? '#1B3FC4' : '#D4DAE3',
                transition: 'background-color 150ms ease-out',
              }}
            />
          ))}
        </div>

        {/* Next button */}
        <button
          onClick={handleNext}
          style={{
            width: '100%',
            backgroundColor: '#1B3FC4',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: '6px',
            padding: '10px 16px',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            fontWeight: 500,
            cursor: 'pointer',
            transition: 'background-color 150ms ease-out',
          }}
          onMouseEnter={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1535A8'
          }}
          onMouseLeave={(e) => {
            ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1B3FC4'
          }}
        >
          {isLast ? 'Start exploring →' : 'Next'}
        </button>

        {/* Skip link */}
        <div style={{ display: 'flex', justifyContent: 'center' }}>
          <button
            onClick={handleSkip}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              fontFamily: '"DM Mono", monospace',
              fontSize: '10px',
              color: '#8896A7',
              textDecoration: 'none',
              padding: '2px 4px',
              transition: 'text-decoration 150ms ease-out',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.textDecoration = 'none'
            }}
          >
            Skip
          </button>
        </div>
      </div>
    </>
  )
}

const ONBOARDING_STYLES = `
@media (max-width: 639px) {
  .onboarding-card {
    top: auto !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
    transform: none !important;
    width: 100% !important;
    border-radius: 12px 12px 0 0 !important;
    padding: 24px 16px 32px !important;
  }
}
@media (prefers-reduced-motion: reduce) {
  .onboarding-card,
  .onboarding-card + * {
    transition: none !important;
  }
}
`

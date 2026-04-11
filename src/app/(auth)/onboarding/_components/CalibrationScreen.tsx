'use client'

import { useEffect, useState } from 'react'
import { CheckCircle } from '@phosphor-icons/react'
import { cn } from '@/lib/utils'

interface CalibrationScreenProps {
  onComplete: () => void
}

const CALIBRATION_STEPS = [
  { id: 'path', label: 'Calculating study path...', duration: 1200 },
  { id: 'lea', label: 'Analyzing LEA subjects...', duration: 1500 },
  { id: 'score', label: 'Initializing readiness score...', duration: 1000 },
  { id: 'final', label: 'Preparing your dashboard...', duration: 800 },
]

export const CalibrationScreen = ({ onComplete }: CalibrationScreenProps) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<string[]>([])

  useEffect(() => {
    if (currentStepIndex >= CALIBRATION_STEPS.length) {
      const timer = setTimeout(() => {
        onComplete()
      }, 500)
      return () => clearTimeout(timer)
    }

    const step = CALIBRATION_STEPS[currentStepIndex]
    const timer = setTimeout(() => {
      setCompletedSteps((prev) => [...prev, step.id])
      setCurrentStepIndex((prev) => prev + 1)
    }, step.duration)

    return () => clearTimeout(timer)
  }, [currentStepIndex, onComplete])

  return (
    <div className="flex flex-col items-center justify-center space-y-8 py-10">
      <div className="relative flex h-24 w-24 items-center justify-center">
        {/* Pulsing Outer Ring */}
        <div className="absolute inset-0 animate-ping rounded-full bg-primary/20 opacity-75" />
        
        {/* Scanning Ring */}
        <div className="absolute inset-0 rounded-full border-4 border-primary/10 border-t-primary animate-spin" />
        
        {/* Center Icon */}
        <div className="relative z-10 flex h-16 w-16 items-center justify-center rounded-full bg-primary text-white shadow-lg shadow-primary/20">
          <svg
            width="32"
            height="32"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="animate-pulse"
          >
            <path
              d="M12 2L2 7L12 12L22 7L12 2Z"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 17L12 22L22 17"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M2 12L12 17L22 12"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </div>
      </div>

      <div className="w-full max-w-[280px] space-y-4">
        {CALIBRATION_STEPS.map((step, index) => {
          const isCompleted = completedSteps.includes(step.id)
          const isCurrent = index === currentStepIndex
          const isPending = index > currentStepIndex

          return (
            <div
              key={step.id}
              className={cn(
                "flex items-center gap-3 transition-all duration-300",
                isPending && "opacity-30 blur-[0.5px]",
                isCompleted && "text-foreground",
                isCurrent && "text-primary scale-[1.02]"
              )}
            >
              <div className="flex h-5 w-5 items-center justify-center">
                {isCompleted ? (
                  <CheckCircle weight="fill" className="h-5 w-5 text-success" />
                ) : isCurrent ? (
                  <div className="h-2 w-2 animate-bounce rounded-full bg-primary" />
                ) : (
                  <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground" />
                )}
              </div>
              <span className={cn(
                "text-[13px] font-medium tracking-wide",
                isCurrent && "animate-pulse"
              )}>
                {step.label}
              </span>
            </div>
          )
        })}
      </div>

      <p className="text-center text-[10px] uppercase tracking-widest text-muted-foreground animate-pulse">
        Mastery Calibration in Progress
      </p>
    </div>
  )
}

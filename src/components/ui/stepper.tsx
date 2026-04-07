import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { Check, Warning } from '@phosphor-icons/react/dist/ssr'

import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Types                                                               */
/* ------------------------------------------------------------------ */

type StepStatus = 'complete' | 'active' | 'upcoming' | 'error'

interface StepItem {
  label: string
  description?: string
  status: StepStatus
  icon?: React.ReactNode
}

interface StepperProps {
  steps: StepItem[]
  orientation?: 'horizontal' | 'vertical'
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Step Indicator                                                      */
/* ------------------------------------------------------------------ */

const stepIndicatorVariants = cva(
  'flex items-center justify-center shrink-0 rounded-full text-sm font-medium transition-colors duration-150 ease-out',
  {
    variants: {
      status: {
        complete: 'bg-primary-50 text-primary dark:bg-primary/10 dark:text-primary-300',
        active: 'bg-primary text-white',
        upcoming: 'bg-muted text-muted-foreground',
        error: 'bg-destructive-50 text-destructive dark:bg-destructive/10 dark:text-destructive-300',
      },
      size: {
        sm: 'h-8 w-8',
        md: 'h-10 w-10',
      },
    },
    defaultVariants: {
      status: 'upcoming',
      size: 'md',
    },
  },
)

const StepIndicator = ({
  status,
  index,
  icon,
}: {
  status: StepStatus
  index: number
  icon?: React.ReactNode
}) => {
  const content = () => {
    if (icon) return icon
    if (status === 'complete') return <Check className="h-5 w-5" weight="bold" aria-hidden="true" />
    if (status === 'error') return <Warning className="h-5 w-5" weight="bold" aria-hidden="true" />
    return <span>{index + 1}</span>
  }

  return (
    <span
      data-slot="step-indicator"
      className={cn(stepIndicatorVariants({ status }))}
      aria-current={status === 'active' ? 'step' : undefined}
    >
      {content()}
    </span>
  )
}

/* ------------------------------------------------------------------ */
/*  Connector Line                                                      */
/* ------------------------------------------------------------------ */

const connectorVariants = cva('', {
  variants: {
    status: {
      complete: 'border-primary dark:border-primary/60',
      active: 'border-border',
      upcoming: 'border-border',
      error: 'border-border',
    },
  },
  defaultVariants: {
    status: 'upcoming',
  },
})

/* ------------------------------------------------------------------ */
/*  Step Label                                                          */
/* ------------------------------------------------------------------ */

const stepLabelVariants = cva('font-medium leading-tight', {
  variants: {
    status: {
      complete: 'text-primary dark:text-primary-300',
      active: 'text-foreground',
      upcoming: 'text-muted-foreground',
      error: 'text-destructive dark:text-destructive-300',
    },
  },
  defaultVariants: {
    status: 'upcoming',
  },
})

/* ------------------------------------------------------------------ */
/*  Stepper                                                             */
/* ------------------------------------------------------------------ */

const Stepper = ({ steps, orientation = 'horizontal', className }: StepperProps) => {
  if (orientation === 'vertical') {
    return (
      <ol data-slot="stepper" className={cn('space-y-0', className)} aria-label="Progress">
        {steps.map((step, index) => {
          const isLast = index === steps.length - 1
          return (
            <li key={`${step.label}-${index}`} data-slot="step" className="flex gap-3">
              <div className="flex flex-col items-center">
                <StepIndicator status={step.status} index={index} icon={step.icon} />
                {!isLast && (
                  <div
                    data-slot="step-connector"
                    className={cn(
                      'w-0 flex-1 border-l-2 my-1',
                      connectorVariants({ status: step.status }),
                    )}
                  />
                )}
              </div>
              <div className={cn('pb-6', isLast && 'pb-0')}>
                <p className={cn('text-sm', stepLabelVariants({ status: step.status }))}>
                  {step.label}
                </p>
                {step.description && (
                  <p className="mt-0.5 text-sm text-muted-foreground">{step.description}</p>
                )}
              </div>
            </li>
          )
        })}
      </ol>
    )
  }

  return (
    <ol
      data-slot="stepper"
      className={cn('flex w-full items-start', className)}
      aria-label="Progress"
    >
      {steps.map((step, index) => {
        const isLast = index === steps.length - 1
        return (
          <li
            key={`${step.label}-${index}`}
            data-slot="step"
            className={cn('flex items-center', !isLast && 'flex-1')}
          >
            <div className="flex flex-col items-center gap-1.5">
              <StepIndicator status={step.status} index={index} icon={step.icon} />
              <span
                className={cn(
                  'text-xs text-center max-w-[80px] sm:max-w-none',
                  stepLabelVariants({ status: step.status }),
                )}
              >
                {step.label}
              </span>
              {step.description && (
                <span className="text-xs text-muted-foreground text-center hidden sm:block">
                  {step.description}
                </span>
              )}
            </div>
            {!isLast && (
              <div
                data-slot="step-connector"
                className={cn(
                  'flex-1 border-t-2 mx-2 mt-5 self-start',
                  connectorVariants({ status: step.status }),
                )}
              />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export { Stepper, StepIndicator, stepIndicatorVariants }
export type { StepperProps, StepItem, StepStatus }

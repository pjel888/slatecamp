import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const trackVariants = cva('w-full rounded-full overflow-hidden bg-muted', {
  variants: {
    size: {
      sm: 'h-1',
      md: 'h-1.5',
      lg: 'h-2.5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const fillVariants = cva('h-full rounded-full', {
  variants: {
    variant: {
      primary: 'bg-primary',
      success: 'bg-emerald',
      warning: 'bg-warning',
      danger: 'bg-destructive',
      neutral: 'bg-foreground/60',
    },
    animate: {
      true: 'transition-all duration-300 ease-out',
      false: '',
    },
  },
  defaultVariants: {
    variant: 'primary',
    animate: true,
  },
})

interface ProgressBarProps {
  value: number
  variant?: 'primary' | 'success' | 'warning' | 'danger' | 'neutral'
  size?: 'sm' | 'md' | 'lg'
  label?: string
  showPercentage?: boolean
  animate?: boolean
  className?: string
}

const ProgressBar = ({
  value,
  variant = 'primary',
  size = 'md',
  label,
  showPercentage = false,
  animate = true,
  className,
}: ProgressBarProps) => {
  const clampedValue = Math.max(0, Math.min(100, value))

  return (
    <div
      data-slot="progress-bar"
      className={cn('w-full', className)}
      role="progressbar"
      aria-valuenow={clampedValue}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={label ?? `${clampedValue}% progress`}
    >
      {(label || showPercentage) && (
        <div className="mb-1.5 flex items-center justify-between">
          {label && (
            <span className="text-xs text-muted-foreground">{label}</span>
          )}
          {showPercentage && (
            <span className="text-xs text-muted-foreground tabular-nums ml-auto">
              {Math.round(clampedValue)}%
            </span>
          )}
        </div>
      )}
      <div className={trackVariants({ size })}>
        <div
          className={fillVariants({ variant, animate })}
          style={{ width: `${clampedValue}%` }}
        />
      </div>
    </div>
  )
}

export { ProgressBar, trackVariants, fillVariants }
export type { ProgressBarProps }

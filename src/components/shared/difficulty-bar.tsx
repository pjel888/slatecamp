import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const difficultyBarRootVariants = cva('', {
  variants: {
    size: {
      sm: 'flex items-center gap-2',
      md: 'flex items-center gap-0.5',
    },
  },
  defaultVariants: {
    size: 'md',
  },
})

const difficultyBarFillVariants = cva('h-full rounded-full transition-all duration-150', {
  variants: {
    tone: {
      low: 'bg-emerald-500',
      medium: 'bg-amber-500',
      high: 'bg-red-500',
    },
  },
})

const difficultyBarSegmentVariants = cva('h-2.5 w-1.5 rounded-[1px]', {
  variants: {
    filled: {
      true: 'bg-warning',
      false: 'bg-border',
    },
  },
})

interface DifficultyBarProps
  extends Omit<React.ComponentProps<'div'>, 'children'>,
    VariantProps<typeof difficultyBarRootVariants> {
  value: number | null // 0.0 - 1.0; null treated as 0
}

/**
 * sm â€” horizontal progress bar (used in tables/lists)
 * md â€” 5-segment dot bar (used in question editors)
 */
const DifficultyBar = ({
  value,
  size = 'md',
  className,
  title,
  ...props
}: DifficultyBarProps) => {
  const clamped = Math.max(0, Math.min(1, value ?? 0))
  const tone = clamped < 0.35 ? 'low' : clamped < 0.65 ? 'medium' : 'high'
  const resolvedTitle = title ?? `Difficulty: ${clamped.toFixed(2)}`

  if (size === 'sm') {
    const pct = Math.round(clamped * 100)

    return (
      <div
        data-slot="difficulty-bar"
        className={cn(difficultyBarRootVariants({ size }), className)}
        title={resolvedTitle}
        {...props}
      >
        <div data-slot="difficulty-bar-track" className="h-1.5 w-16 overflow-hidden rounded-full bg-muted">
          <div
            data-slot="difficulty-bar-fill"
            className={difficultyBarFillVariants({ tone })}
            style={{ width: `${pct}%` }}
          />
        </div>
        <span data-slot="difficulty-bar-value" className="font-[family-name:var(--font-dm-mono)] text-[11px] tabular-nums text-muted-foreground">
          {clamped.toFixed(2)}
        </span>
      </div>
    )
  }

  const filled = Math.round(clamped * 5)

  return (
    <div
      data-slot="difficulty-bar"
      className={cn(difficultyBarRootVariants({ size }), className)}
      title={resolvedTitle}
      {...props}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <div
          data-slot="difficulty-bar-segment"
          key={i}
          className={difficultyBarSegmentVariants({ filled: i < filled })}
        />
      ))}
    </div>
  )
}

export { DifficultyBar }
export type { DifficultyBarProps }

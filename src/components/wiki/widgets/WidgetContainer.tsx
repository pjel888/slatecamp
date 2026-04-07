import { cn } from '@/lib/utils'

interface WidgetContainerProps {
  label: string
  children: React.ReactNode
  interactive?: boolean
  className?: string
}

/**
 * Standardized container for all wiki widgets.
 * Provides consistent border, padding, radius, and eyebrow label.
 *
 * When `interactive` is true, the container gains a subtle shadow on hover.
 */
const WidgetContainer = ({
  label,
  children,
  interactive = false,
  className,
}: WidgetContainerProps) => (
  <div
    data-slot="widget-container"
    className={cn(
      'not-prose my-5 rounded-md border border-border bg-card overflow-hidden',
      interactive && 'transition-shadow duration-150 ease-out hover:shadow-sm',
      className,
    )}
  >
    <div className="px-4 pt-3 pb-0">
      <span className="font-mono text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
        {label}
      </span>
    </div>
    <div className="p-4">{children}</div>
  </div>
)

export { WidgetContainer }
export type { WidgetContainerProps }

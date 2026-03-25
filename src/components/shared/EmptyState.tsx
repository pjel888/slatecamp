import Link from 'next/link'

/* ------------------------------------------------------------------ */
/*  EmptyState — Server Component                                       */
/*  Welcoming empty state with honest observation and clear next step. */
/*  NEVER use: "No data found." / "Empty" / "Nothing here yet!"        */
/* ------------------------------------------------------------------ */

interface EmptyStateProps {
  message: string
  ctaLabel: string
  ctaHref: string
  icon?: React.ReactNode
}

export const EmptyState = ({
  message,
  ctaLabel,
  ctaHref,
  icon,
}: EmptyStateProps) => (
  <div className="flex flex-col items-center justify-center py-8 text-center">
    {icon && (
      <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">
        {icon}
      </div>
    )}

    <p className="max-w-[200px] text-sm text-muted-foreground">{message}</p>

    <Link
      href={ctaHref}
      className="mt-3 text-xs text-primary hover:underline transition-colors duration-150 ease-out"
    >
      {ctaLabel}
    </Link>
  </div>
)

export type { EmptyStateProps }

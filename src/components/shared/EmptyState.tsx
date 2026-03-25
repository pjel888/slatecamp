import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

import { cn } from '@/lib/utils'

interface EmptyStateAction {
  label: string
  href: string
}

interface EmptyStateProps {
  icon: LucideIcon
  title: string
  description: string
  action?: EmptyStateAction
  className?: string
}

export const EmptyState = ({
  icon: Icon,
  title,
  description,
  action,
  className,
}: EmptyStateProps) => (
  <div
    className={cn(
      'flex flex-col items-center justify-center py-12 text-center',
      className,
    )}
  >
    <Icon
      className="h-10 w-10 text-muted-foreground/50"
      aria-hidden="true"
    />
    <p className="mt-4 font-medium text-base text-foreground">{title}</p>
    <p className="mt-1.5 text-sm text-muted-foreground max-w-sm mx-auto">
      {description}
    </p>
    {action && (
      <Link
        href={action.href}
        className="mt-4 inline-flex items-center justify-center bg-primary text-primary-foreground rounded-sm px-4 py-2 text-sm font-medium transition-colors duration-150 ease-out hover:bg-primary/90"
      >
        {action.label}
      </Link>
    )}
  </div>
)

export type { EmptyStateProps, EmptyStateAction }

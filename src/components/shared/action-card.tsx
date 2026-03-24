'use client'

import * as React from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface ActionCardProps {
  icon?: React.ReactNode
  badge?: React.ReactNode
  title: string
  subtitle?: string
  description?: string
  metadata?: React.ReactNode
  footer?: React.ReactNode
  onClick?: () => void
  href?: string
  className?: string
}

const ActionCardInner = ({
  icon,
  badge,
  title,
  subtitle,
  description,
  metadata,
  footer,
  className,
}: Omit<ActionCardProps, 'onClick' | 'href'>) => (
  <div className={cn('flex flex-col h-full', className)}>
    {/* Header row: icon + badge */}
    <div className="flex items-start justify-between gap-3">
      {icon && (
        <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
          {icon}
        </div>
      )}
      {badge && <div className="shrink-0">{badge}</div>}
    </div>

    {/* Title + subtitle */}
    <div className="mt-3">
      <h3 className="text-sm font-semibold text-foreground leading-tight">
        {title}
      </h3>
      {subtitle && (
        <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>
      )}
    </div>

    {/* Description */}
    {description && (
      <p className="text-xs text-muted-foreground mt-2 line-clamp-2">
        {description}
      </p>
    )}

    {/* Metadata */}
    {metadata && <div className="mt-2">{metadata}</div>}

    {/* Spacer to push footer down */}
    <div className="flex-1" />

    {/* Footer */}
    {footer && (
      <div className="mt-3 pt-3 border-t border-border">{footer}</div>
    )}
  </div>
)

const ActionCard = ({
  icon,
  badge,
  title,
  subtitle,
  description,
  metadata,
  footer,
  onClick,
  href,
  className,
}: ActionCardProps) => {
  const isInteractive = !!onClick || !!href
  const innerProps = { icon, badge, title, subtitle, description, metadata, footer }

  if (href) {
    return (
      <Link href={href} className="block focus-visible:outline-none">
        <Card
          variant="interactive"
          className={cn('h-full', className)}
        >
          <ActionCardInner {...innerProps} />
        </Card>
      </Link>
    )
  }

  return (
    <Card
      variant={isInteractive ? 'interactive' : 'default'}
      className={cn(isInteractive && 'cursor-pointer', 'h-full', className)}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e: React.KeyboardEvent) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault()
                onClick()
              }
            }
          : undefined
      }
    >
      <ActionCardInner {...innerProps} />
    </Card>
  )
}

export { ActionCard }
export type { ActionCardProps }

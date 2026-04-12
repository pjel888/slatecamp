import * as React from 'react'
import { Card, type CardProps } from '@/components/ui/card'
import { SectionHeader, type SectionHeaderProps } from '@/components/shared/section-header'
import { cn } from '@/lib/utils'

interface DashboardMetricCardProps extends Omit<CardProps, 'title'> {
  /** Props for the SectionHeader component */
  headerProps: SectionHeaderProps
  /** Content of the card */
  children?: React.ReactNode
  /** Optional footer or bottom action area */
  footer?: React.ReactNode
  /** Custom class for the content container */
  contentClassName?: string
}

/**
 * A composite component that combines a Card with a SectionHeader.
 * Standardizes layout, padding, and typography for dashboard/admin metric views.
 */
export const DashboardMetricCard = ({
  headerProps,
  children,
  footer,
  className,
  contentClassName,
  variant = 'default',
  size = 'md',
  ...props
}: DashboardMetricCardProps) => {
  return (
    <Card 
      variant={variant} 
      size={size} 
      className={cn("flex flex-col h-full", className)}
      {...props}
    >
      <div className="flex flex-col flex-1">
        <SectionHeader 
          {...headerProps} 
          level="card" 
          className={cn("mb-4", headerProps.className)} 
        />
        
        <div className={cn("flex-1 min-h-0", contentClassName)}>
          {children}
        </div>
      </div>

      {footer && (
        <div className="mt-4 pt-4 border-t border-border/50">
          {footer}
        </div>
      )}
    </Card>
  )
}

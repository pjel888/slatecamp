import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { BarChart3, type LucideIcon } from 'lucide-react'
import Link from 'next/link'

interface ChartEmptyStateProps {
  title: string
  description?: string
  icon?: LucideIcon
  height?: string
  ctaText?: string
  ctaHref?: string
}

export const ChartEmptyState = ({
  title,
  description,
  icon: Icon = BarChart3,
  height = 'h-[200px]',
  ctaText,
  ctaHref,
}: ChartEmptyStateProps) => {
  return (
    <Card className={`${height} border-dashed border-border/50`}>
      <CardContent className="flex flex-col items-center justify-center h-full gap-2 p-4 text-center">
        <Icon className="w-6 h-6 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        {description && (
          <p className="text-xs text-muted-foreground/70 max-w-[240px] leading-relaxed">
            {description}
          </p>
        )}
        {ctaText && ctaHref && (
          <Button variant="outline" size="sm" className="mt-1" asChild>
            <Link href={ctaHref}>{ctaText}</Link>
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

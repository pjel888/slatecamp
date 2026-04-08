'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle } from 'lucide-react'

export default function AnalyticsError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="flex flex-col gap-2 p-4">
      <Card className="border-border/50">
        <CardContent className="flex flex-col items-center justify-center gap-3 py-12 text-center">
          <AlertTriangle className="w-8 h-8 text-muted-foreground/60" />
          <div>
            <p className="text-base font-medium text-foreground">
              Something went wrong loading analytics
            </p>
            <p className="text-sm text-muted-foreground mt-1 max-w-md">
              {error.message || 'An unexpected error occurred while loading your analytics data.'}
            </p>
          </div>
          <Button variant="outline" size="sm" onClick={reset}>
            Try again
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

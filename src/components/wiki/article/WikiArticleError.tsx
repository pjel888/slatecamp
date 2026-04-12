'use client'

import React from 'react'
import { WarningCircle, ArrowsClockwise } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { Button } from '@/components/ui/button'

export const WikiArticleError = () => {
  return (
    <div className="not-prose my-12 p-8 border-2 border-dashed border-border rounded-lg bg-muted/30 text-center">
      <div className="max-w-md mx-auto">
        <div className="w-12 h-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto mb-4">
          <SCIcon icon={WarningCircle} size="md" />
        </div>
        <h3 className="text-base font-semibold text-foreground mb-2">Failed to render article</h3>
        <p className="text-sm text-muted-foreground mb-6">
          There was a problem compiling the content for this article. Our team has been notified.
        </p>
        <Button 
          variant="outline"
          onClick={() => window.location.reload()}
          className="gap-2"
        >
          <SCIcon icon={ArrowsClockwise} size="xs" />
          Try Refreshing
        </Button>
      </div>
    </div>
  )
}

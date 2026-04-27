'use client'

import React from 'react'
import { Skeleton } from '@/components/ui/skeleton'

interface LabBrowserShellProps {
  children: React.ReactNode
}

/**
 * LabBrowserShell — Standardized container for the 3D Lab module browser.
 * Inherits dashboard sidebar and header, provides consistent max-width and padding.
 */
export const LabBrowserShell = ({ children }: LabBrowserShellProps) => {
  return (
    <div className="h-full w-full bg-page-bg overflow-y-auto">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </div>
    </div>
  )
}

export const LabBrowserLoadingState = ({
  title = 'Loading 3D Lab...',
  detail = 'Preparing interactive modules and navigation.',
}: {
  title?: string
  detail?: string
}) => {
  return (
    <div
      className="mx-auto max-w-7xl space-y-8"
      aria-busy="true"
      aria-live="polite"
    >
      <div className="space-y-2">
        <Skeleton className="h-7 w-52" />
        <p className="text-xs font-mono font-bold uppercase tracking-widest text-muted-foreground">
          {title}
        </p>
        <p className="max-w-md text-sm text-muted-foreground">{detail}</p>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="rounded-lg border border-border bg-card p-5 space-y-4"
          >
            <div className="flex items-center justify-between gap-3">
              <Skeleton className="h-10 w-10 rounded-lg" />
              <Skeleton className="h-4 w-24" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-5/6" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </div>
  )
}

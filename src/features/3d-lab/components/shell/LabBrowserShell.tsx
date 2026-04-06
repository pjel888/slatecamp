'use client'

import React from 'react'

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

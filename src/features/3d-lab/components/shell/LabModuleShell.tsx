'use client'

import React from 'react'

interface LabModuleShellProps {
  children: React.ReactNode
  topBar?: React.ReactNode
}

/**
 * LabModuleShell — Standardized container for a 3D Lab module viewer.
 * Provides a flex column that locks the top bar and lets the viewport fill available space.
 * Prevents double scrollbars by forcing overflow-hidden on the outer shell.
 */
export const LabModuleShell = ({ children, topBar }: LabModuleShellProps) => {
  return (
    <div className="flex flex-col h-full w-full overflow-hidden bg-surface-light">
      {topBar && (
        <div className="flex-none z-20 shadow-md border-b border-white/5">
          {topBar}
        </div>
      )}
      <div className="flex-1 relative z-10 min-h-0 min-w-0">
        {children}
      </div>
    </div>
  )
}

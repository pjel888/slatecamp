'use client'

import React from 'react'

interface LabOverlayLayerProps {
  children: React.ReactNode
  className?: string
}

/**
 * LabOverlayLayer — Absolute-positioned layer for HUD and overlays.
 * Ensures pointer events pass through to the canvas unless interactive elements are hit.
 */
export const LabOverlayLayer = ({ children, className = '' }: LabOverlayLayerProps) => {
  return (
    <div className={`absolute inset-0 z-30 pointer-events-none ${className}`}>
      {children}
    </div>
  )
}

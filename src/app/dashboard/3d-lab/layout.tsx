'use client'

import React from 'react'

/**
 * 3D Lab Layout.
 * The persistent canvas has been moved to LabViewportFrame 
 * to ensure WebGL is only initialized on module detail pages.
 */
const ThreeDLabLayoutPage = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="h-full w-full relative">
      {children}
    </div>
  )
}

export default ThreeDLabLayoutPage

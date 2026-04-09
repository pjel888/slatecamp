'use client'

// WebGLRecovery — overlay shown when WebGL context is lost
// Renders as a DOM overlay over the canvas area.

import { useState, useEffect } from 'react'

export const WebGLRecovery = () => {
  const [contextLost, setContextLost] = useState(false)

  useEffect(() => {
    const handleLost = (e: Event) => {
      e.preventDefault() // Prevents default browser handling
      setContextLost(true)
    }

    const handleRestored = () => {
      setContextLost(false)
    }

    // Listen on all canvases in the document
    const canvas = document.querySelector('canvas')
    if (canvas) {
      canvas.addEventListener('webglcontextlost', handleLost)
      canvas.addEventListener('webglcontextrestored', handleRestored)
    }

    return () => {
      if (canvas) {
        canvas.removeEventListener('webglcontextlost', handleLost)
        canvas.removeEventListener('webglcontextrestored', handleRestored)
      }
    }
  }, [])

  if (!contextLost) return null

  return (
    <div className="absolute inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 rounded-md border border-border bg-card p-8 shadow-lg">
        <div className="text-4xl">⚠️</div>
        <h2 className="text-lg font-display font-semibold text-foreground">
          3D Scene Crashed
        </h2>
        <p className="max-w-xs text-center text-sm text-muted-foreground">
          The 3D rendering context was lost. This can happen due to GPU memory pressure or browser resource limits.
        </p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => window.location.reload()}
            className="rounded-sm bg-primary px-4 py-2 text-sm font-medium text-white transition-colors duration-150 ease-out hover:bg-primary/90"
          >
            Reload Scene
          </button>
        </div>
      </div>
    </div>
  )
}

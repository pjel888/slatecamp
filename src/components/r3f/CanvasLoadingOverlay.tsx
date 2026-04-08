// src/components/r3f/CanvasLoadingOverlay.tsx
// Shared loading overlay for R3F Canvas initialization.
// Extracted from 3D Lab CanvasWrapper — reusable across any Canvas setup.
'use client'

import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'

interface CanvasLoadingOverlayProps {
  /** Whether the overlay is visible */
  visible: boolean
  /** Loading message text */
  message?: string
  /** Background class — override for different themes */
  bgClassName?: string
}

/**
 * Absolute-positioned overlay shown until Canvas WebGL context is created.
 * Renders above the Canvas via z-index. Hide by setting visible=false
 * once Canvas.onCreated fires.
 */
export function CanvasLoadingOverlay({
  visible,
  message = 'Loading Scene...',
  bgClassName = 'bg-primary-50/80',
}: CanvasLoadingOverlayProps) {
  if (!visible) return null

  return (
    <div className={`absolute inset-0 flex items-center justify-center ${bgClassName} z-10`}>
      <div className="flex flex-col items-center gap-3">
        <SCIcon icon={CircleNotch} size="lg" className="animate-spin text-muted-foreground/50" />
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {message}
        </span>
      </div>
    </div>
  )
}

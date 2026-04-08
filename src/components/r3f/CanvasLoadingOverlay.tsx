// src/components/r3f/CanvasLoadingOverlay.tsx
// Shared loading overlay for R3F Canvas initialization.
// Extracted from 3D Lab CanvasWrapper — reusable across any Canvas setup.
//
// Re-exports LoadingProgress (upgraded name) for backward compatibility.
// New code should import LoadingProgress from './LoadingProgress' directly.
'use client'

import { CircleNotch } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'

interface LoadingProgressProps {
  /** Whether the overlay is visible */
  visible: boolean
  /** Loading message text */
  message?: string
  /** Background class — override for different themes */
  bgClassName?: string
  /**
   * Optional loading progress percentage (0–100).
   * When provided and > 0, shows a progress bar beneath the spinner.
   * When absent or 0, falls back to the original spinner-only display.
   */
  progress?: number
}

/**
 * LoadingProgress — absolute-positioned overlay shown during Canvas/asset loading.
 * Renders above the Canvas via z-index. Hide by setting visible=false
 * once Canvas.onCreated fires or assets finish loading.
 *
 * When `progress` is supplied (e.g. from drei's useProgress), it displays a
 * numeric percentage and a thin progress bar. Without it, the original
 * spinner-only UI is shown (backward compatible).
 */
export const LoadingProgress = ({
  visible,
  message = 'Loading Scene...',
  bgClassName = 'bg-primary-50/80',
  progress,
}: LoadingProgressProps) => {
  if (!visible) return null

  const hasProgress = progress != null && progress > 0

  return (
    <div className={`absolute inset-0 flex items-center justify-center ${bgClassName} z-10`}>
      <div className="flex flex-col items-center gap-3">
        <SCIcon icon={CircleNotch} size="lg" className="animate-spin text-muted-foreground/50" />
        <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-muted-foreground">
          {message}
        </span>

        {hasProgress && (
          <div className="flex flex-col items-center gap-1.5 w-32">
            {/* Progress bar */}
            <div className="w-full h-0.5 bg-border rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-150 ease-out rounded-full"
                style={{ width: `${Math.min(100, progress!)}%` }}
              />
            </div>
            {/* Percentage label */}
            <span className="text-[10px] font-mono text-muted-foreground tabular-nums">
              {Math.round(progress!)}%
            </span>
          </div>
        )}
      </div>
    </div>
  )
}

/**
 * CanvasLoadingOverlay — backward-compatible alias for LoadingProgress.
 * Existing callers that import CanvasLoadingOverlay continue to work unchanged.
 * @deprecated Prefer importing `LoadingProgress` directly.
 */
export const CanvasLoadingOverlay = LoadingProgress

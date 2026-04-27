'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import type { ModuleConfig } from '@/types/3d-lab'
import { LabMetaPanel } from './shell/LabMetaPanel'
import { cn } from '@/lib/utils'
import { mark3DLabModuleSeen } from './onboarding/state'

interface ModuleContextCardProps {
  config: ModuleConfig
  onDismiss: () => void
  className?: string
}

const AUTO_DISMISS_MS = 6000

/**
 * ModuleContextCard — Refactored to use LabMetaPanel and semantic tokens.
 * Displays brief module metadata on first visit.
 */
export const ModuleContextCard = ({ config, onDismiss, className }: ModuleContextCardProps) => {
  const [visible, setVisible] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    // Parent coordinates if this module card should mount. The card owns its
    // reveal animation and writes both current + legacy completion keys.
    requestAnimationFrame(() => setVisible(true))
  }, [])

  const handleDismiss = useCallback(() => {
    mark3DLabModuleSeen(config.slug)
    setVisible(false)
    setTimeout(onDismiss, 150)
  }, [config.slug, onDismiss])

  // Auto-dismiss after 6 seconds
  useEffect(() => {
    timerRef.current = setTimeout(handleDismiss, AUTO_DISMISS_MS)
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [handleDismiss])

  // Dismiss on any canvas interaction
  useEffect(() => {
    const dismiss = () => handleDismiss()
    window.addEventListener('pointerdown', dismiss, { once: true })
    window.addEventListener('touchstart', dismiss, { once: true })
    window.addEventListener('wheel', dismiss, { passive: true, once: true } as AddEventListenerOptions)
    return () => {
      window.removeEventListener('pointerdown', dismiss)
      window.removeEventListener('touchstart', dismiss)
      window.removeEventListener('wheel', dismiss)
    }
  }, [handleDismiss])

  const hotspotCount = config.hotspots.length
  const estimatedMin = config.estimatedMinutes

  return (
    <div
      data-testid="3dlab-module-context-card"
      data-3dlab-onboarding-stage="module"
      className={cn(
        "fixed top-12 left-4 z-[250] w-[300px] transition-opacity duration-150",
        visible ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        className
      )}
    >
      <LabMetaPanel className="relative">
        <div className="flex flex-col gap-1.5">
          {/* Module code reference */}
          <p className="font-mono text-[9px] font-bold uppercase tracking-[0.15em] text-muted-foreground leading-none">
            {config.codeReference}
          </p>

          {/* Module title */}
          <p className="text-[14px] font-semibold text-foreground leading-tight tracking-tight">
            {config.title}
          </p>

          {/* Learning objective */}
          <p className="text-[12px] text-text-secondary leading-relaxed font-sans">
            {config.learningObjective}
          </p>

          {/* Metadata */}
          <div className="flex items-center gap-2 mt-1 pt-2 border-t border-border-default/20">
            <p className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              {hotspotCount} hotspot{hotspotCount !== 1 ? 's' : ''}
            </p>
            <span className="text-muted-foreground/30 text-[8px]">●</span>
            <p className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
              ~{estimatedMin} min read
            </p>
          </div>
        </div>

        {/* Progress bar — animates 0 → 100% over 6 seconds */}
        <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-muted/20">
          <div
            className={cn(
              "h-full bg-primary",
              visible ? "w-full" : "w-0"
            )}
            style={{
              transition: visible ? `width ${AUTO_DISMISS_MS}ms linear` : 'none',
            }}
          />
        </div>
      </LabMetaPanel>
    </div>
  )
}

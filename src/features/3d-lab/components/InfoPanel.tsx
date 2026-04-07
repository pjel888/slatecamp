'use client'

import { useEffect, useRef } from 'react'
import { CloseButton } from '@/components/ui/close-button'
import type { HotspotData } from '@/types/3d-lab'
import { LabMetaPanel } from './shell/LabMetaPanel'
import { cn } from '@/lib/utils'

interface InfoPanelProps {
  hotspot: HotspotData
  onPracticeClick: () => void
  onClose: () => void
  viewportWidth: number
}

/**
 * InfoPanel — Refactored to use LabMetaPanel and Tailwind.
 * Displays detailed information and practice CTA for a selected hotspot.
 */
export const InfoPanel = ({
  hotspot,
  onPracticeClick,
  onClose,
  viewportWidth,
}: InfoPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null)
  const isMobile = viewportWidth < 640

  // Close on click outside
  useEffect(() => {
    const handlePointerDown = (e: PointerEvent) => {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('pointerdown', handlePointerDown)
    return () => document.removeEventListener('pointerdown', handlePointerDown)
  }, [onClose])

  // Close on Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  const isExamCritical = hotspot.type === 'exam-critical'

  if (isMobile) {
    return (
      <div className="fixed inset-0 z-[200] pointer-events-none">
        {/* Backdrop */}
        <div 
          className="absolute inset-0 pointer-events-auto bg-black/20 animate-in fade-in duration-150" 
          onClick={onClose} 
        />
        <div
          ref={panelRef}
          role="region"
          aria-label="Information panel"
          className={cn(
            "absolute bottom-0 left-0 right-0 max-h-[60vh] overflow-y-auto bg-card rounded-t-xl shadow-2xl pointer-events-auto",
            "animate-in slide-in-from-bottom duration-200"
          )}
        >
          <PanelContent
            hotspot={hotspot}
            isExamCritical={isExamCritical}
            onPracticeClick={onPracticeClick}
            onClose={onClose}
          />
        </div>
      </div>
    )
  }

  return (
    <div
      ref={panelRef}
      role="region"
      aria-label="Information panel"
      className={cn(
        "fixed top-1/2 -translate-y-1/2 left-4 z-[200] w-[320px] animate-in fade-in slide-in-from-left-4 duration-150",
      )}
    >
      <LabMetaPanel title={isExamCritical ? 'Exam Content' : hotspot.eyebrow}>
        <PanelContent
          hotspot={hotspot}
          isExamCritical={isExamCritical}
          onPracticeClick={onPracticeClick}
          onClose={onClose}
        />
      </LabMetaPanel>
    </div>
  )
}

// ─── Shared panel body ────────────────────────────────────────────────────────

interface PanelContentProps {
  hotspot: HotspotData
  isExamCritical: boolean
  onPracticeClick: () => void
  onClose: () => void
}

const PanelContent = ({
  hotspot,
  isExamCritical,
  onPracticeClick,
  onClose,
}: PanelContentProps) => (
  <div className="flex flex-col gap-4">
    {/* Header with close button */}
    <div className="flex items-start justify-between gap-4">
      <div className="flex flex-col gap-1">
        {isExamCritical && (
          <span className="font-mono text-[9px] font-black uppercase tracking-[0.15em] text-destructive">
            ALE Watch · High Priority
          </span>
        )}
        <h2 className="text-[15px] font-semibold text-foreground leading-tight tracking-tight">
          {hotspot.title}
        </h2>
      </div>
      <CloseButton onClick={onClose} aria-label="Close panel" size="sm" className="-mt-1 -mr-1" />
    </div>

    {/* Body */}
    <p className="text-[13px] text-text-secondary leading-[1.6] font-sans">
      {hotspot.body}
    </p>

    {/* Values table */}
    {hotspot.values.length > 0 && (
      <div className="border-y border-border-default/20 py-3 flex flex-col gap-2">
        {hotspot.values.map((row, i) => (
          <div key={i} className="flex justify-between items-baseline gap-2">
            <span className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider flex-shrink-0">
              {row.label}
            </span>
            <span className={cn(
              "font-mono text-[13px] font-bold text-foreground text-right tabular-nums",
              row.isOld && "line-through opacity-40"
            )}>
              {row.value}
            </span>
          </div>
        ))}
      </div>
    )}

    {/* Source & CTA */}
    <div className="flex flex-col gap-4">
      {hotspot.source && (
        <p className="font-mono text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-60">
          Source: {hotspot.source}
        </p>
      )}

      <button
        onClick={onPracticeClick}
        className="w-full flex items-center justify-center gap-2 bg-primary/5 hover:bg-primary/10 text-primary border border-primary/20 rounded-md py-2.5 px-4 font-mono text-[11px] font-bold uppercase tracking-wider transition-all duration-150"
      >
        Practice a question →
      </button>
    </div>
  </div>
)

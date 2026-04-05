'use client'

import { useEffect, useRef } from 'react'
import { CloseButton } from '@/components/ui/close-button'
import type { HotspotData } from '@/types/3d-lab'

interface InfoPanelProps {
  hotspot: HotspotData
  onPracticeClick: () => void
  onClose: () => void
  viewportWidth: number
}

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

  // MOBILE: bottom-sheet
  if (isMobile) {
    return (
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 200,
          pointerEvents: 'none',
        }}
      >
        {/* Backdrop */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'auto',
          }}
          onClick={onClose}
        />
        <div
          ref={panelRef}
          role="region"
          aria-label="Information panel"
          className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 motion-reduce:animate-none"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            maxHeight: '60vh',
            overflowY: 'auto',
            backgroundColor: '#FFFFFF',
            borderTop: '0.5px solid var(--border)',
            borderRadius: '12px 12px 0 0',
            boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
            padding: '20px 16px 32px',
            pointerEvents: 'auto',
          }}
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

  // DESKTOP: floating panel, opens left if hotspot is in right half
  // We use a fixed-position panel; actual hotspot pixel position isn't available
  // here, so we use viewportWidth halving as a heuristic. The parent should pass
  // a more precise x position if available — for now we default to right-side open.
  const openLeft = false // parent can override by passing hotspot screen position
  const panelStyle: React.CSSProperties = {
    position: 'fixed',
    top: '50%',
    transform: 'translateY(-50%)',
    ...(openLeft ? { right: '16px' } : { left: '16px' }),
    width: '240px',
    backgroundColor: '#FFFFFF',
    border: '0.5px solid var(--border)',
    borderRadius: '12px',
    boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
    padding: '14px',
    zIndex: 200,
    overflowY: 'auto',
    maxHeight: 'calc(100vh - 80px)',
  }

  return (
    <div
      ref={panelRef}
      role="region"
      aria-label="Information panel"
      className="motion-safe:animate-in motion-safe:fade-in motion-safe:duration-150 motion-reduce:animate-none"
      style={panelStyle}
    >
      <PanelContent
        hotspot={hotspot}
        isExamCritical={isExamCritical}
        onPracticeClick={onPracticeClick}
        onClose={onClose}
      />
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
  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
    {/* Close button */}
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <CloseButton onClick={onClose} aria-label="Close panel" size="sm" />
    </div>

    {/* Eyebrow */}
    <p
      style={{
        fontFamily: '"DM Mono", monospace',
        fontSize: '9px',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        color: isExamCritical ? '#F5A623' : 'var(--muted-foreground)',
        margin: 0,
        lineHeight: 1.4,
      }}
    >
      {isExamCritical ? 'Most-tested · ALE Watch' : hotspot.eyebrow}
    </p>

    {/* Title */}
    <h2
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '13px',
        fontWeight: 600,
        color: 'var(--foreground)',
        margin: 0,
        lineHeight: 1.4,
      }}
    >
      {hotspot.title}
    </h2>

    {/* Body */}
    <p
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '12px',
        color: 'var(--muted-foreground)',
        margin: 0,
        lineHeight: 1.5,
      }}
    >
      {hotspot.body}
    </p>

    {/* Values table */}
    {hotspot.values.length > 0 && (
      <div
        style={{
          borderTop: '0.5px solid var(--border)',
          borderBottom: '0.5px solid var(--border)',
          paddingTop: '8px',
          paddingBottom: '8px',
          display: 'flex',
          flexDirection: 'column',
          gap: '4px',
        }}
      >
        {hotspot.values.map((row, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              gap: '8px',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '11px',
                color: 'var(--muted-foreground)',
                flexShrink: 0,
              }}
            >
              {row.label}
            </span>
            <span
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '12px',
                fontWeight: 500,
                color: 'var(--foreground)',
                textDecoration: row.isOld ? 'line-through' : 'none',
                opacity: row.isOld ? 0.5 : 1,
                textAlign: 'right',
              }}
            >
              {row.value}
            </span>
          </div>
        ))}
      </div>
    )}

    {/* Source */}
    <p
      style={{
        fontFamily: '"DM Mono", monospace',
        fontSize: '10px',
        color: 'var(--muted-foreground)',
        margin: 0,
        lineHeight: 1.4,
      }}
    >
      {hotspot.source}
    </p>

    {/* Practice CTA */}
    <button
      onClick={onPracticeClick}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        padding: 0,
        fontFamily: '"DM Mono", monospace',
        fontSize: '11px',
        color: 'var(--primary)',
        textAlign: 'left',
        textDecoration: 'none',
        transition: 'text-decoration 150ms ease-out',
      }}
      onMouseEnter={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.textDecoration = 'underline'
      }}
      onMouseLeave={(e) => {
        ;(e.currentTarget as HTMLButtonElement).style.textDecoration = 'none'
      }}
    >
      Practice a question on this →
    </button>
  </div>
)

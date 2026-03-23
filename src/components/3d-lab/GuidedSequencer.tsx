'use client'

// src/components/3d-lab/GuidedSequencer.tsx — Guided discovery flow controller
// Renders progress indicator, Next button, linger prompt, and completion CTA
// when exploreMode === 'guided'.

import { useState, useEffect, useRef } from 'react'
import { useLabStore } from '@/stores/useLabStore'
import { useGuidedSequence } from '@/hooks/useGuidedSequence'
import type { HotspotData } from '@/types/3d-lab'

const PILL_BG = 'rgba(20,23,36,0.92)'
const COBALT = '#1B3FC4'
const LINGER_DELAY_MS = 45_000

interface GuidedSequencerProps {
  hotspots: HotspotData[]
  moduleSlug: string
  children: React.ReactNode
}

export const GuidedSequencer = ({
  hotspots,
  moduleSlug,
  children,
}: GuidedSequencerProps) => {
  const exploreMode = useLabStore((s) => s.exploreMode)

  const { currentHotspotId, canAdvance, advance, isComplete, progress } =
    useGuidedSequence({
      moduleSlug,
      hotspots,
      totalHotspots: hotspots.length,
    })

  const [lingerVisible, setLingerVisible] = useState(false)
  const lingerTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  // Reset and restart linger timer whenever the current hotspot changes
  useEffect(() => {
    setLingerVisible(false)

    if (lingerTimerRef.current) {
      clearTimeout(lingerTimerRef.current)
    }

    if (!isComplete && currentHotspotId !== null) {
      lingerTimerRef.current = setTimeout(() => {
        setLingerVisible(true)
      }, LINGER_DELAY_MS)
    }

    return () => {
      if (lingerTimerRef.current) {
        clearTimeout(lingerTimerRef.current)
      }
    }
  }, [currentHotspotId, isComplete])

  // Dismiss linger prompt when user advances
  const handleAdvance = () => {
    setLingerVisible(false)
    advance()
  }

  const handleTestYourself = () => {
    useLabStore.setState({ quizModeActive: true, panelMode: 'quiz', labelsVisible: false, quizResults: [] })
  }

  // Only render guided UI overlay when in guided mode
  const isGuided = exploreMode === 'guided'

  return (
    <>
      {children}

      {isGuided && (
        <>
          {/* Linger prompt — fades in after 45s on same hotspot */}
          {lingerVisible && !isComplete && (
            <div
              role="status"
              aria-live="polite"
              style={{
                position: 'fixed',
                bottom: '72px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 51,
                animation: 'labFadeIn 200ms ease-out forwards',
              }}
            >
              <span
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '10px',
                  color: COBALT,
                  backgroundColor: 'rgba(255,255,255,0.92)',
                  border: `1px solid ${COBALT}`,
                  borderRadius: '4px',
                  padding: '5px 10px',
                  whiteSpace: 'nowrap',
                  display: 'inline-block',
                }}
              >
                Ready for the next one? →
              </span>
            </div>
          )}

          {/* Bottom-center progress indicator + Next / Test yourself button */}
          <div
            style={{
              position: 'fixed',
              bottom: '24px',
              left: '50%',
              transform: 'translateX(-50%)',
              zIndex: 50,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            {/* Progress pill */}
            <div
              style={{
                backgroundColor: PILL_BG,
                backdropFilter: 'blur(8px)',
                WebkitBackdropFilter: 'blur(8px)',
                border: '0.5px solid rgba(255,255,255,0.1)',
                borderRadius: '20px',
                padding: '5px 12px',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <span
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '11px',
                  color: '#ffffff',
                  letterSpacing: '0.02em',
                }}
              >
                {isComplete
                  ? `${progress.total} of ${progress.total}`
                  : `${progress.current} of ${progress.total}`}
              </span>
            </div>

            {/* Next button — only when current hotspot is visited and not complete */}
            {canAdvance && !isComplete && (
              <button
                onClick={handleAdvance}
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '11px',
                  color: '#ffffff',
                  backgroundColor: COBALT,
                  border: 'none',
                  borderRadius: '6px',
                  height: '36px',
                  padding: '0 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background-color 150ms ease-out',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1535A8'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = COBALT
                }}
              >
                Next →
              </button>
            )}

            {/* Test yourself — only when sequence is complete */}
            {isComplete && (
              <button
                onClick={handleTestYourself}
                style={{
                  fontFamily: '"DM Mono", monospace',
                  fontSize: '11px',
                  color: '#ffffff',
                  backgroundColor: COBALT,
                  border: 'none',
                  borderRadius: '6px',
                  height: '36px',
                  padding: '0 14px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  transition: 'background-color 150ms ease-out',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1535A8'
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLButtonElement).style.backgroundColor = COBALT
                }}
              >
                Test yourself →
              </button>
            )}
          </div>
        </>
      )}

      {/* Keyframe for fade-in animation — injected once */}
      <style>{`
        @keyframes labFadeIn {
          from { opacity: 0; transform: translateX(-50%) translateY(4px); }
          to   { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>
    </>
  )
}

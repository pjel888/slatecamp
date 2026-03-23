'use client'

// src/components/3d-lab/DisorientationDetector.tsx — Adaptive scaffolding intervention UI
// Renders contextual help overlays based on behavioral telemetry signals.

import { useState, useCallback } from 'react'
import { useLabStore } from '@/stores/useLabStore'
import { useLabTelemetry } from '@/hooks/useLabTelemetry'
import { labEvents } from '@/lib/lab-analytics'

const COBALT = '#1B3FC4'

type InterventionState =
  | 'none'
  | 'idle'
  | 'disorientation1'
  | 'disorientation2'

interface DisorientationDetectorProps {
  moduleSlug: string
  nearestUnvisitedHotspotId?: string
  // Configurable thresholds — defaults match research values in useLabTelemetry
  disorientation1Ms?: number
  disorientation2Ms?: number
  idleThresholdMs?: number
}

export const DisorientationDetector = ({
  moduleSlug,
  nearestUnvisitedHotspotId,
  disorientation1Ms,
  disorientation2Ms,
  idleThresholdMs,
}: DisorientationDetectorProps) => {
  const setExploreMode = useLabStore((s) => s.setExploreMode)
  const exploreMode = useLabStore((s) => s.exploreMode)

  const [intervention, setIntervention] = useState<InterventionState>('none')

  const handleDisorientation1 = useCallback(() => {
    setIntervention((prev) =>
      prev === 'none' || prev === 'idle' ? 'disorientation1' : prev
    )
  }, [])

  const handleDisorientation2 = useCallback(() => {
    setIntervention('disorientation2')
  }, [])

  const handleIdle = useCallback(() => {
    setIntervention((prev) => (prev === 'none' ? 'idle' : prev))
  }, [])

  useLabTelemetry(
    {
      moduleSlug,
      ...(disorientation1Ms !== undefined && { disorientation1Ms }),
      ...(disorientation2Ms !== undefined && { disorientation2Ms }),
      ...(idleThresholdMs !== undefined && { idleThresholdMs }),
    },
    {
      onDisorientation1: handleDisorientation1,
      onDisorientation2: handleDisorientation2,
      onIdle: handleIdle,
    }
  )

  const handleSwitchToGuided = () => {
    labEvents.modeSwitch(moduleSlug, exploreMode, 'guided', 'disorientation2_prompt')
    setExploreMode('guided')
    setIntervention('none')
  }

  const handleKeepExploring = () => {
    setIntervention('none')
  }

  if (intervention === 'none') return null

  return (
    <>
      {/* disorientation1: "Start here →" tooltip near nearest unvisited hotspot */}
      {intervention === 'disorientation1' && nearestUnvisitedHotspotId && (
        <div
          aria-live="polite"
          data-hotspot-hint={nearestUnvisitedHotspotId}
          style={{
            position: 'fixed',
            bottom: '96px',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 52,
            animation: 'labFadeInPulse 200ms ease-out forwards',
          }}
        >
          <span
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '10px',
              color: '#ffffff',
              backgroundColor: COBALT,
              borderRadius: '4px',
              padding: '5px 10px',
              whiteSpace: 'nowrap',
              display: 'inline-block',
            }}
          >
            Start here →
          </span>
        </div>
      )}

      {/* idle: nearest hotspot pulses more prominently — signal via data attribute */}
      {intervention === 'idle' && nearestUnvisitedHotspotId && (
        <div
          aria-live="polite"
          data-hotspot-pulse={nearestUnvisitedHotspotId}
          style={{ display: 'none' }}
        />
      )}

      {/* disorientation2: modal-style prompt to switch to guided mode */}
      {intervention === 'disorientation2' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Switch to Guided Mode?"
          aria-live="polite"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 60,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(0,0,0,0.35)',
            backdropFilter: 'blur(2px)',
            WebkitBackdropFilter: 'blur(2px)',
          }}
        >
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '12px',
              boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
              padding: '24px 28px',
              maxWidth: '320px',
              width: '90vw',
              display: 'flex',
              flexDirection: 'column',
              gap: '20px',
            }}
          >
            <p
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '13px',
                fontWeight: 500,
                color: '#1A2332',
                margin: 0,
                lineHeight: 1.5,
                textAlign: 'center',
              }}
            >
              Would you like to switch to Guided Mode?
            </p>

            <div
              style={{
                display: 'flex',
                gap: '10px',
                justifyContent: 'center',
              }}
            >
              {/* Ghost "Keep Exploring" button */}
              <button
                onClick={handleKeepExploring}
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#4A5568',
                  backgroundColor: 'transparent',
                  border: '1px solid #D4DAE3',
                  borderRadius: '6px',
                  height: '36px',
                  padding: '0 16px',
                  cursor: 'pointer',
                  transition: 'border-color 150ms ease-out, color 150ms ease-out',
                  whiteSpace: 'nowrap',
                }}
                onMouseEnter={(e) => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.borderColor = '#8896A7'
                  el.style.color = '#1A2332'
                }}
                onMouseLeave={(e) => {
                  const el = e.currentTarget as HTMLButtonElement
                  el.style.borderColor = '#D4DAE3'
                  el.style.color = '#4A5568'
                }}
              >
                Keep Exploring
              </button>

              {/* Primary "Switch to Guided" button */}
              <button
                onClick={handleSwitchToGuided}
                style={{
                  fontFamily: 'Inter, system-ui, sans-serif',
                  fontSize: '13px',
                  fontWeight: 500,
                  color: '#ffffff',
                  backgroundColor: COBALT,
                  border: 'none',
                  borderRadius: '6px',
                  height: '36px',
                  padding: '0 16px',
                  cursor: 'pointer',
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
                Switch to Guided
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes labFadeInPulse {
          0%   { opacity: 0; transform: translateX(-50%) scale(0.95); }
          100% { opacity: 1; transform: translateX(-50%) scale(1); }
        }
      `}</style>
    </>
  )
}

'use client'

// src/components/3d-lab/FreeExploreToggle.tsx — Guided / Free exploration mode toggle
// Adaptive visibility and default mode based on learner history (research-backed thresholds).

import { useEffect } from 'react'
import { useLabStore } from '@/stores/useLabStore'
import { labEvents } from '@/lib/lab-analytics'
import type { ExploreMode } from '@/types/3d-lab'

const PILL_BG = 'rgba(20,23,36,0.92)'
const COBALT = '#1B3FC4'
const LABEL_INACTIVE = 'rgba(255,255,255,0.55)'

interface FreeExploreToggleProps {
  moduleSlug: string
  previousScore?: number
  totalModulesCompleted?: number
  avgQuizScore?: number
}

// Decision logic derived from Phase 7 adaptive scaffolding research:
// Returns { defaultMode, toggleVisible }
const resolveAdaptiveConfig = (
  previousScore: number | undefined,
  totalModulesCompleted: number | undefined,
  avgQuizScore: number | undefined
): { defaultMode: ExploreMode; toggleVisible: boolean } => {
  const isFirstTime = previousScore === undefined
  const completed = totalModulesCompleted ?? 0
  const avg = avgQuizScore ?? 0

  if (isFirstTime) {
    if (completed >= 3 && avg >= 70) {
      // Abbreviated guided — toggle visible from start
      return { defaultMode: 'guided', toggleVisible: true }
    }
    // Full guided — toggle hidden until sequence complete
    return { defaultMode: 'guided', toggleVisible: false }
  }

  // Returning learner
  if (previousScore >= 80) {
    return { defaultMode: 'free', toggleVisible: true }
  }
  return { defaultMode: 'guided', toggleVisible: true }
}

export const FreeExploreToggle = ({
  moduleSlug,
  previousScore,
  totalModulesCompleted,
  avgQuizScore,
}: FreeExploreToggleProps) => {
  const exploreMode = useLabStore((s) => s.exploreMode)
  const setExploreMode = useLabStore((s) => s.setExploreMode)
  const guidedSequenceComplete = useLabStore((s) => s.guidedSequenceComplete)

  const { defaultMode, toggleVisible: baseToggleVisible } = resolveAdaptiveConfig(
    previousScore,
    totalModulesCompleted,
    avgQuizScore
  )

  // Toggle becomes visible once guided sequence completes for first-timers
  // with <3 modules (full guided path)
  const toggleVisible = baseToggleVisible || guidedSequenceComplete

  // Apply the resolved default mode on mount
  useEffect(() => {
    setExploreMode(defaultMode)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handleModeSelect = (mode: ExploreMode) => {
    if (mode === exploreMode) return
    labEvents.modeSwitch(moduleSlug, exploreMode, mode, 'toggle')
    setExploreMode(mode)
  }

  if (!toggleVisible) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: '52px', // below the 36px top bar + 16px gap
        right: '16px',
        zIndex: 50,
      }}
    >
      <div
        role="group"
        aria-label="Exploration mode"
        style={{
          display: 'flex',
          alignItems: 'center',
          backgroundColor: PILL_BG,
          backdropFilter: 'blur(8px)',
          WebkitBackdropFilter: 'blur(8px)',
          border: '0.5px solid rgba(255,255,255,0.1)',
          borderRadius: '20px',
          padding: '3px',
          gap: '2px',
        }}
      >
        {(['guided', 'free'] as ExploreMode[]).map((mode) => {
          const isActive = exploreMode === mode
          return (
            <button
              key={mode}
              aria-pressed={isActive}
              onClick={() => handleModeSelect(mode)}
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '10px',
                color: isActive ? '#ffffff' : LABEL_INACTIVE,
                backgroundColor: isActive ? COBALT : 'transparent',
                border: 'none',
                borderRadius: '16px',
                padding: '4px 10px',
                cursor: 'pointer',
                transition: 'background-color 150ms ease-out, color 150ms ease-out',
                whiteSpace: 'nowrap',
                lineHeight: 1.4,
              }}
            >
              {mode === 'guided' ? 'Guided' : 'Free'}
            </button>
          )
        })}
      </div>
    </div>
  )
}

'use client'

import { useState } from 'react'
import { CheckCircle, XCircle } from '@phosphor-icons/react'
import type { ModuleConfig, QuizResult } from '@/types/3d-lab'

interface ExitSummaryProps {
  config: ModuleConfig
  results: QuizResult[]
  onReturnToWiki: () => void
  onRetryModule: () => void
}

export const ExitSummary = ({
  config,
  results,
  onReturnToWiki,
  onRetryModule,
}: ExitSummaryProps) => {
  const [flashcardsEnabled, setFlashcardsEnabled] = useState(true)

  const correctCount = results.filter((r) => r.correct).length
  const totalCount = results.length
  const pct = totalCount > 0 ? (correctCount / totalCount) * 100 : 0

  const scoreColor =
    pct >= 80 ? '#2D9F6F' : pct >= 60 ? '#D4951A' : '#4A5568'

  const scoreMessage =
    pct >= 80
      ? "Great work! You've mastered this topic."
      : pct >= 60
      ? 'Good progress. A few areas to revisit.'
      : "Keep practicing — you're building understanding."

  // Build per-hotspot result map
  const correctByHotspot: Record<string, boolean> = {}
  results.forEach((r) => {
    // find question to get hotspotId
    const q = config.questions.find((q) => q.id === r.questionId)
    if (q) {
      correctByHotspot[q.hotspotId] = r.correct
    }
  })

  const highScore = pct >= 80

  return (
    <>
      <style>{EXIT_STYLES}</style>

      {/* Dimming backdrop */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.30)',
          zIndex: 300,
          pointerEvents: 'none',
        }}
      />

      {/* Summary card */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Module completion summary"
        style={{
          position: 'fixed',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 301,
          width: 'min(calc(100vw - 32px), 448px)',
          backgroundColor: '#FFFFFF',
          borderRadius: '12px',
          boxShadow: '0 8px 32px rgba(0,0,0,0.18)',
          padding: '24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '0',
          animation: 'exit-fade-in 200ms ease-out both',
          maxHeight: 'calc(100vh - 48px)',
          overflowY: 'auto',
        }}
      >
        {/* "Module complete" eyebrow */}
        <p
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '9px',
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
            color: '#8896A7',
            margin: '0 0 8px',
          }}
        >
          Module Complete
        </p>

        {/* Score */}
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '32px',
            fontWeight: 700,
            color: '#1A2332',
            margin: '0 0 6px',
            lineHeight: 1.1,
          }}
        >
          {correctCount}/{totalCount}
        </p>

        {/* Score interpretation */}
        <p
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '12px',
            color: scoreColor,
            margin: '0 0 16px',
            lineHeight: 1.5,
          }}
        >
          {scoreMessage}
        </p>

        {/* Divider */}
        <div
          style={{
            borderTop: '0.5px solid #D4DAE3',
            marginBottom: '16px',
          }}
        />

        {/* Key dimensions list */}
        {config.hotspots.length > 0 && (
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              marginBottom: '16px',
            }}
          >
            {config.hotspots.map((hotspot) => {
              const isCorrect = correctByHotspot[hotspot.id]
              const wasAnswered = hotspot.id in correctByHotspot
              const mainValue = hotspot.values[0]

              return (
                <div
                  key={hotspot.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  {wasAnswered ? (
                    isCorrect ? (
                      <CheckCircle
                        size={14}
                        color="#2D9F6F"
                        weight="fill"
                        style={{ flexShrink: 0 }}
                      />
                    ) : (
                      <XCircle
                        size={14}
                        color="#D64545"
                        weight="fill"
                        style={{ flexShrink: 0 }}
                      />
                    )
                  ) : (
                    <div
                      style={{
                        width: '14px',
                        height: '14px',
                        borderRadius: '50%',
                        backgroundColor: '#D4DAE3',
                        flexShrink: 0,
                      }}
                    />
                  )}

                  {mainValue && (
                    <span
                      style={{
                        fontFamily: '"DM Mono", monospace',
                        fontSize: '11px',
                        color: '#1A2332',
                        flexShrink: 0,
                      }}
                    >
                      {mainValue.value}
                    </span>
                  )}

                  <span
                    style={{
                      fontFamily: 'Inter, system-ui, sans-serif',
                      fontSize: '11px',
                      color: '#4A5568',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                      flex: 1,
                    }}
                  >
                    {hotspot.label}
                  </span>
                </div>
              )
            })}
          </div>
        )}

        {/* Divider */}
        <div
          style={{
            borderTop: '0.5px solid #D4DAE3',
            marginBottom: '16px',
          }}
        />

        {/* Score-based adaptive note */}
        {highScore && (
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '11px',
              color: '#4A5568',
              margin: '0 0 16px',
              lineHeight: 1.5,
              backgroundColor: '#EDFAF4',
              borderRadius: '6px',
              padding: '8px 10px',
            }}
          >
            Next time you visit, you&apos;ll start in Free Explore mode.
          </p>
        )}

        {/* Action buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {/* Return to Wiki */}
          <button
            onClick={onReturnToWiki}
            style={{
              width: '100%',
              backgroundColor: '#1B3FC4',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: '6px',
              padding: '10px 16px',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 150ms ease-out',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1535A8'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#1B3FC4'
            }}
          >
            Review in Wiki →
          </button>

          {/* Try Again */}
          <button
            onClick={onRetryModule}
            style={{
              width: '100%',
              backgroundColor: 'transparent',
              color: '#1B3FC4',
              border: '1px solid #1B3FC4',
              borderRadius: '6px',
              padding: '10px 16px',
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '13px',
              fontWeight: 500,
              cursor: 'pointer',
              transition: 'background-color 150ms ease-out',
              textAlign: 'center',
            }}
            onMouseEnter={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#EEF2FC'
            }}
            onMouseLeave={(e) => {
              ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = 'transparent'
            }}
          >
            Try Again
          </button>

          {/* Add to Flashcards toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 0 0',
            }}
          >
            <span
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '11px',
                color: '#4A5568',
              }}
            >
              Add to Flashcards
            </span>
            <button
              role="switch"
              aria-checked={flashcardsEnabled}
              onClick={() => setFlashcardsEnabled((v) => !v)}
              style={{
                width: '32px',
                height: '18px',
                borderRadius: '9px',
                border: 'none',
                backgroundColor: flashcardsEnabled ? '#1B3FC4' : '#D4DAE3',
                cursor: 'pointer',
                position: 'relative',
                transition: 'background-color 150ms ease-out',
                flexShrink: 0,
              }}
            >
              <span
                style={{
                  position: 'absolute',
                  top: '2px',
                  left: flashcardsEnabled ? '16px' : '2px',
                  width: '14px',
                  height: '14px',
                  borderRadius: '50%',
                  backgroundColor: '#FFFFFF',
                  transition: 'left 150ms ease-out',
                  display: 'block',
                }}
              />
            </button>
          </div>
        </div>
      </div>
    </>
  )
}

const EXIT_STYLES = `
@keyframes exit-fade-in {
  from { opacity: 0; transform: translate(-50%, calc(-50% + 12px)); }
  to   { opacity: 1; transform: translate(-50%, -50%); }
}
@media (prefers-reduced-motion: reduce) {
  [style*="exit-fade-in"] {
    animation: none !important;
  }
}
`

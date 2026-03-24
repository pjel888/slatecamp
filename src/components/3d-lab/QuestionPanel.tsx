'use client'

import { useEffect, useRef } from 'react'
import { CheckCircle, XCircle } from '@phosphor-icons/react'
import type { LabQuestion } from '@/types/3d-lab'

interface QuestionPanelProps {
  question: LabQuestion
  onSelectOption: (optionId: string) => void
  onBack: () => void
  selectedOptionId: string | null
  isAnswered: boolean
}

export const QuestionPanel = ({
  question,
  onSelectOption,
  onBack,
  selectedOptionId,
  isAnswered,
}: QuestionPanelProps) => {
  const panelRef = useRef<HTMLDivElement>(null)

  // Trap focus inside panel when open
  useEffect(() => {
    panelRef.current?.focus()
  }, [])

  // Close on Escape → back
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onBack])

  const getOptionState = (optionId: string): OptionState => {
    if (!isAnswered) return 'default'
    const isCorrect = optionId === question.correctOptionId
    const isSelected = optionId === selectedOptionId
    if (isSelected && isCorrect) return 'correct'
    if (isSelected && !isCorrect) return 'wrong'
    if (!isSelected && isCorrect) return 'reveal-correct'
    return 'locked'
  }

  const isMobile = typeof window !== 'undefined' && window.innerWidth < 640

  return (
    <>
      <style>{PANEL_ANIMATION}</style>

      {/* 20% canvas dim overlay */}
      <div
        style={{
          position: 'fixed',
          inset: 0,
          backgroundColor: 'rgba(0,0,0,0.2)',
          zIndex: 190,
          pointerEvents: 'none',
        }}
      />

      {/* Panel */}
      <div
        ref={panelRef}
        role="region"
        aria-label="Practice question"
        tabIndex={-1}
        style={isMobile ? mobileStyle : desktopStyle}
      >
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', outline: 'none' }}>
          {/* Tag */}
          <p
            style={{
              fontFamily: '"DM Mono", monospace',
              fontSize: '9px',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              color: '#8896A7',
              margin: 0,
            }}
          >
            Practice Question
          </p>

          {/* Stem */}
          <p
            style={{
              fontFamily: 'Inter, system-ui, sans-serif',
              fontSize: '12px',
              fontWeight: 500,
              color: '#1A2332',
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            {question.stem}
          </p>

          {/* Options */}
          {question.options && question.options.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {question.options.map((option) => {
                const state = getOptionState(option.id)
                return (
                  <OptionButton
                    key={option.id}
                    text={option.text}
                    state={state}
                    disabled={isAnswered}
                    onClick={() => {
                      if (!isAnswered) onSelectOption(option.id)
                    }}
                  />
                )
              })}
            </div>
          )}

          {/* Rationale — appears after answering */}
          {isAnswered && (
            <p
              style={{
                fontFamily: 'Inter, system-ui, sans-serif',
                fontSize: '11px',
                color: '#4A5568',
                margin: 0,
                lineHeight: 1.55,
                borderTop: '0.5px solid #D4DAE3',
                paddingTop: '10px',
                animation: 'panel-fade-in 150ms ease-out both',
              }}
            >
              {typeof question.rationale === 'string' ? question.rationale : (question.rationale as any)?.correct || ''}
            </p>
          )}

          {/* Back link */}
          <button
            onClick={onBack}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              padding: 0,
              fontFamily: '"DM Mono", monospace',
              fontSize: '11px',
              color: '#1B3FC4',
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
            ← Back to model
          </button>
        </div>
      </div>
    </>
  )
}

// ─── Option button ────────────────────────────────────────────────────────────

type OptionState = 'default' | 'correct' | 'wrong' | 'reveal-correct' | 'locked'

interface OptionButtonProps {
  text: string
  state: OptionState
  disabled: boolean
  onClick: () => void
}

const OPTION_STYLES: Record<OptionState, React.CSSProperties> = {
  default: {
    backgroundColor: '#FFFFFF',
    color: '#1A2332',
    border: '1px solid #D4DAE3',
  },
  correct: {
    backgroundColor: '#2D9F6F',
    color: '#FFFFFF',
    border: '1px solid #2D9F6F',
  },
  wrong: {
    backgroundColor: '#D64545',
    color: '#FFFFFF',
    border: '1px solid #D64545',
  },
  'reveal-correct': {
    backgroundColor: '#FFFFFF',
    color: '#2D9F6F',
    border: '1px solid #2D9F6F',
  },
  locked: {
    backgroundColor: '#FFFFFF',
    color: '#8896A7',
    border: '1px solid #D4DAE3',
    opacity: 0.6,
  },
}

const OptionButton = ({ text, state, disabled, onClick }: OptionButtonProps) => {
  const isHoverEnabled = state === 'default' && !disabled

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        fontFamily: 'Inter, system-ui, sans-serif',
        fontSize: '11px',
        lineHeight: 1.5,
        borderRadius: '6px',
        paddingTop: '8px',
        paddingBottom: '8px',
        paddingLeft: '12px',
        paddingRight: '12px',
        textAlign: 'left',
        cursor: disabled ? 'default' : 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '8px',
        transition: 'background-color 150ms ease-out, color 150ms ease-out',
        width: '100%',
        ...OPTION_STYLES[state],
      }}
      onMouseEnter={(e) => {
        if (!isHoverEnabled) return
        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#EEF2FC'
      }}
      onMouseLeave={(e) => {
        if (!isHoverEnabled) return
        ;(e.currentTarget as HTMLButtonElement).style.backgroundColor = '#FFFFFF'
      }}
    >
      <span style={{ flex: 1 }}>{text}</span>
      {state === 'correct' && (
        <CheckCircle size={14} color="#FFFFFF" weight="fill" style={{ flexShrink: 0 }} />
      )}
      {state === 'wrong' && (
        <XCircle size={14} color="#FFFFFF" weight="fill" style={{ flexShrink: 0 }} />
      )}
    </button>
  )
}

// ─── Panel position styles ────────────────────────────────────────────────────

const desktopStyle: React.CSSProperties = {
  position: 'fixed',
  top: '50%',
  left: '16px',
  transform: 'translateY(-50%)',
  width: '280px',
  backgroundColor: '#FFFFFF',
  borderRadius: '12px',
  boxShadow: '0 4px 24px rgba(0,0,0,0.12)',
  padding: '16px',
  zIndex: 200,
  animation: 'panel-fade-in 150ms ease-out both',
  overflowY: 'auto',
  maxHeight: 'calc(100vh - 80px)',
  outline: 'none',
}

const mobileStyle: React.CSSProperties = {
  position: 'fixed',
  bottom: 0,
  left: 0,
  right: 0,
  maxHeight: '60vh',
  overflowY: 'auto',
  backgroundColor: '#FFFFFF',
  borderRadius: '12px 12px 0 0',
  boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
  padding: '20px 16px 32px',
  zIndex: 200,
  animation: 'panel-fade-in 150ms ease-out both',
  outline: 'none',
}

const PANEL_ANIMATION = `
@keyframes panel-fade-in {
  from { opacity: 0; }
  to   { opacity: 1; }
}
@media (prefers-reduced-motion: reduce) {
  [style*="panel-fade-in"] { animation: none !important; }
}
`

'use client'

import { useLabStore } from '@/stores/useLabStore'
import { stairwayConfig } from './stairway.config'

// Colour tokens for compliance feedback
const COLOR_COMPLIANT = '#2D9F6F'     // Emerald
const COLOR_AT_LIMIT = '#D4951A'      // Amber
const COLOR_VIOLATION = '#D64545'     // Warm Red
const COLOR_CODE_BAND = '#1B3FC4'     // Camp Cobalt

const getTrackColor = (
  value: number,
  codeMin?: number,
  codeMax?: number,
): string => {
  const belowMin = codeMin !== undefined && value < codeMin
  const aboveMax = codeMax !== undefined && value > codeMax
  if (belowMin || aboveMax) return COLOR_VIOLATION
  const atMinEdge = codeMin !== undefined && value === codeMin
  const atMaxEdge = codeMax !== undefined && value === codeMax
  if (atMinEdge || atMaxEdge) return COLOR_AT_LIMIT
  return COLOR_COMPLIANT
}

export const StairwayControls = () => {
  const parametricValues = useLabStore((s) => s.parametricValues)
  const setParametricValue = useLabStore((s) => s.setParametricValue)

  const controls = stairwayConfig.parametricControls ?? []

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
        padding: '16px',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid #D4DAE3',
      }}
    >
      <p
        style={{
          margin: 0,
          fontSize: '11px',
          fontWeight: 600,
          color: '#8896A7',
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        Parametric Controls
      </p>

      {controls.map((control) => {
        const currentValue =
          parametricValues[control.id] ?? control.defaultValue
        const trackColor = getTrackColor(
          currentValue,
          control.codeMin,
          control.codeMax,
        )

        const isViolation =
          (control.codeMin !== undefined && currentValue < control.codeMin) ||
          (control.codeMax !== undefined && currentValue > control.codeMax)

        return (
          <div key={control.id} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {/* Label row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <label
                htmlFor={`control-${control.id}`}
                style={{
                  fontSize: '12px',
                  fontWeight: 500,
                  color: '#1A2332',
                  cursor: 'pointer',
                }}
              >
                {control.label}
              </label>
              <span
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  fontFamily: '"DM Mono", monospace',
                  color: trackColor,
                }}
              >
                {currentValue} {control.unit}
              </span>
            </div>

            {/* Range slider */}
            <input
              id={`control-${control.id}`}
              type="range"
              min={control.min}
              max={control.max}
              step={control.step}
              value={currentValue}
              onChange={(e) =>
                setParametricValue(control.id, Number(e.target.value))
              }
              style={{
                width: '100%',
                cursor: 'pointer',
                accentColor: trackColor,
              }}
            />

            {/* Code range indicator */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '11px', color: '#8896A7' }}>
                {control.min} {control.unit}
              </span>
              {(control.codeMin !== undefined || control.codeMax !== undefined) && (
                <span
                  style={{
                    fontSize: '11px',
                    color: COLOR_CODE_BAND,
                    fontWeight: 500,
                  }}
                >
                  Code:{' '}
                  {control.codeMin !== undefined ? `≥ ${control.codeMin}` : ''}
                  {control.codeMin !== undefined && control.codeMax !== undefined ? ' – ' : ''}
                  {control.codeMax !== undefined ? `≤ ${control.codeMax}` : ''}
                  {' '}{control.unit}
                </span>
              )}
              <span style={{ fontSize: '11px', color: '#8896A7' }}>
                {control.max} {control.unit}
              </span>
            </div>

            {/* Violation badge */}
            {isViolation && (
              <div
                style={{
                  padding: '4px 8px',
                  backgroundColor: '#FDF0F0',
                  border: '1px solid #D64545',
                  borderRadius: '6px',
                  fontSize: '11px',
                  color: COLOR_VIOLATION,
                  fontWeight: 500,
                }}
              >
                Outside code limits — adjust to comply
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}

'use client'

import { useState, useRef, useCallback } from 'react'
import type { ParametricControl, ComplianceState } from '@/types/3d-lab'

interface ParametricSliderProps {
  control: ParametricControl
  value: number
  onChange: (value: number) => void
  complianceState: ComplianceState
  checked?: boolean
}

const FILL_COLORS: Record<ComplianceState, string> = {
  compliant: '#1B3FC4',
  'at-limit': '#F5A623',
  violation: '#E63329',
}

const UNIT_LABELS: Record<ParametricControl['unit'], string> = {
  mm: 'mm',
  degrees: '°',
  ratio: '',
}

export const ParametricSlider = ({
  control,
  value,
  onChange,
  complianceState,
  checked: _checked,
}: ParametricSliderProps) => {
  const [isDragging, setIsDragging] = useState(false)
  const [isThumbHovered, setIsThumbHovered] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const rounded = Math.round(value)
  const fillColor = FILL_COLORS[complianceState]
  const unitLabel = UNIT_LABELS[control.unit]

  // Fill percentage for track gradient
  const pct = ((value - control.min) / (control.max - control.min)) * 100
  const clampedPct = Math.max(0, Math.min(100, pct))

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onChange(Number(e.target.value))
    },
    [onChange]
  )

  const handlePointerDown = useCallback(() => {
    setIsDragging(true)
  }, [])

  const handlePointerUp = useCallback(() => {
    setIsDragging(false)
  }, [])

  const thumbBorderWidth = isDragging ? '2.5px' : isThumbHovered ? '2.5px' : '2px'
  const thumbScale = isDragging ? 'scale(1.2)' : 'scale(1)'

  const valueText = `${rounded}${unitLabel === '°' ? '°' : unitLabel ? ' ' + unitLabel : ''}`

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
      {/* Label row */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
        }}
      >
        <label
          htmlFor={`slider-${control.id}`}
          style={{
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '11px',
            fontWeight: 500,
            color: '#1A2332',
            cursor: 'default',
          }}
        >
          {control.label}
        </label>
        {/* Live value */}
        <span
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '12px',
            fontWeight: 500,
            color: '#1A2332',
            minWidth: '52px',
            textAlign: 'right',
            transition: 'color 150ms ease-out',
          }}
        >
          {rounded}
          {unitLabel && (
            <span
              style={{
                fontFamily: '"DM Mono", monospace',
                fontSize: '10px',
                color: '#8896A7',
                marginLeft: '2px',
              }}
            >
              {unitLabel}
            </span>
          )}
        </span>
      </div>

      {/* Track + thumb wrapper — 44px touch target vertically */}
      <div
        style={{
          position: 'relative',
          height: '44px',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        {/* Custom track visual */}
        <div
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            height: '4px',
            borderRadius: '2px',
            backgroundColor: '#D4DAE3',
            pointerEvents: 'none',
          }}
        >
          {/* Fill */}
          <div
            style={{
              position: 'absolute',
              left: 0,
              width: `${clampedPct}%`,
              height: '100%',
              borderRadius: '2px',
              backgroundColor: fillColor,
              transition: isDragging
                ? 'none'
                : 'background-color 150ms ease-out, width 50ms ease-out',
            }}
          />
        </div>

        {/* Native range input — transparent, overlaid for interaction */}
        <input
          ref={inputRef}
          id={`slider-${control.id}`}
          type="range"
          min={control.min}
          max={control.max}
          step={control.step}
          value={value}
          onChange={handleChange}
          onPointerDown={handlePointerDown}
          onPointerUp={handlePointerUp}
          onMouseEnter={() => setIsThumbHovered(true)}
          onMouseLeave={() => {
            setIsThumbHovered(false)
            if (!isDragging) setIsDragging(false)
          }}
          aria-label={control.label}
          aria-valuemin={control.min}
          aria-valuemax={control.max}
          aria-valuenow={rounded}
          aria-valuetext={valueText}
          style={{
            position: 'absolute',
            left: 0,
            right: 0,
            width: '100%',
            height: '44px',
            margin: 0,
            opacity: 0,
            cursor: 'pointer',
            // Pull thumb to center of 44px track
            WebkitAppearance: 'none',
            appearance: 'none',
          }}
        />

        {/* Visual thumb — positioned via clampedPct */}
        <div
          style={{
            position: 'absolute',
            left: `calc(${clampedPct}% - 7px)`,
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            backgroundColor: '#ffffff',
            border: `${thumbBorderWidth} solid ${fillColor}`,
            boxSizing: 'border-box',
            pointerEvents: 'none',
            transform: thumbScale,
            transition: 'transform 150ms ease-out, border-color 150ms ease-out, border-width 150ms ease-out',
          }}
        />
      </div>

      {/* Range labels */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '-6px',
        }}
      >
        <span
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '9px',
            color: '#8896A7',
          }}
        >
          min {control.min}
        </span>
        <span
          style={{
            fontFamily: '"DM Mono", monospace',
            fontSize: '9px',
            color: '#8896A7',
          }}
        >
          max {control.max}
        </span>
      </div>
    </div>
  )
}

'use client'

import { useCallback } from 'react'
import { Slider as SliderPrimitive } from '@base-ui/react/slider'

// ─── UnifiedSlider ─────────────────────────────────────────────────────────
// Standardized slider with violation state and context line.
// Follows the SlateCamp Design System v1 slider spec:
//   - Eyebrow label (mono, 9px, uppercase) + right-aligned value
//   - 4px track, Cobalt fill, 16px white thumb
//   - Optional context line (info/warning/error)

interface UnifiedSliderProps {
  label: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  unit: string
  isViolating?: boolean
  contextLine?: string
  contextLineType?: 'info' | 'warning' | 'error'
  formatValue?: (v: number) => string
}

const CONTEXT_COLORS = {
  info: 'text-muted-foreground',
  warning: 'text-amber-600',
  error: 'text-destructive',
} as const

export function UnifiedSlider({
  label,
  value,
  onChange,
  min,
  max,
  step,
  unit,
  isViolating = false,
  contextLine,
  contextLineType = 'info',
  formatValue,
}: UnifiedSliderProps) {
  const handleChange = useCallback(
    (val: number | number[]) => {
      const v = Array.isArray(val) ? val[0] : val
      onChange(v)
    },
    [onChange],
  )

  const displayValue = formatValue ? formatValue(value) : value.toFixed(step < 1 ? 1 : 0)

  return (
    <div className="space-y-1">
      {/* Label row */}
      <div className="flex items-baseline justify-between">
        <span className="font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
          {label}
        </span>
        <span
          className={`font-mono text-sm font-medium tabular-nums ${
            isViolating ? 'text-destructive' : 'text-foreground'
          }`}
        >
          {displayValue}
          {unit && (
            <span className="ml-0.5 text-[9px] font-normal text-muted-foreground">{unit}</span>
          )}
        </span>
      </div>

      {/* Slider */}
      <SliderPrimitive.Root
        value={[value]}
        onValueChange={handleChange}
        min={min}
        max={max}
        step={step}
        className="w-full"
      >
        <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none py-2">
          <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-muted">
            <SliderPrimitive.Indicator
              className={`h-full ${isViolating ? 'bg-destructive' : 'bg-primary'}`}
            />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className={`relative block size-4 shrink-0 rounded-full border-2 bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] select-none after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3 ${
              isViolating ? 'border-destructive' : 'border-primary'
            }`}
          />
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>

      {/* Context line */}
      {contextLine && (
        <p className={`text-[11px] ${CONTEXT_COLORS[contextLineType]}`}>{contextLine}</p>
      )}
    </div>
  )
}

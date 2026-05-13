'use client'

// ─── LabSlider ──────────────────────────────────────────────────────────────
// Canonical slider for ALL 3D Lab modules.
// Built on @base-ui/react/slider for buttery-smooth pointer-captured dragging.
//
// Variants:
//   default — label row, 4px track, 16px thumb, optional range labels
//   compact — label inline with value, 4px track, 12px thumb, no range labels
//
// Violation state turns fill + thumb border red.
// Optional contextLine for info/warning/error hints below the slider.

import { useCallback, memo, useState, useEffect, useRef } from 'react'
import { Info } from 'lucide-react'
import { Slider as SliderPrimitive, SliderRoot } from '@base-ui/react/slider'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import { cn } from '@/lib/utils'

const MONO_FONT = 'var(--font-dm-mono), monospace'

// ─── Context line colors ────────────────────────────────────────────────────

const CONTEXT_COLORS = {
  info: 'text-muted-foreground',
  warning: 'text-amber-600',
  error: 'text-destructive',
} as const

// ─── Props ──────────────────────────────────────────────────────────────────

interface LabSliderProps {
  label: string
  labelInfoTitle?: string
  labelInfoDescription?: string
  value: number
  onChange: (value: number) => void
  min: number
  max: number
  step: number
  unit?: string
  /** Red fill + red thumb border when violating */
  isViolating?: boolean
  /** Small informational/warning line below the slider */
  contextLine?: string
  contextLineType?: 'info' | 'warning' | 'error'
  /** Custom value formatter (default: auto-detect decimals from step) */
  formatValue?: (v: number) => string
  /** Show min/max labels below the track (default: true, forced false in compact) */
  showRangeLabels?: boolean
  /** Compact mode for toolbar-embedded use — tighter spacing, smaller text */
  compact?: boolean
  /** Optional className on the outermost wrapper */
  className?: string
}

// ─── Component ──────────────────────────────────────────────────────────────

const LabSlider = memo(({
  label,
  labelInfoTitle,
  labelInfoDescription,
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
  showRangeLabels,
  compact = false,
  className,
}: LabSliderProps) => {
  // ── Decoupled Visual State ─────────────────────────────────────────────────
  // Allows the slider thumb to drag smoothly (viscous) while still emitting
  // stepped/integer values to the parent.
  const [localValue, setLocalValue] = useState(value)
  const isDragging = useRef(false)

  // Sync from props, but only if not currently dragging
  useEffect(() => {
    if (!isDragging.current) {
      setLocalValue(value)
    }
  }, [value])

  const handleChange = useCallback(
    (val: number | number[], eventDetails: SliderRoot.ChangeEventDetails) => {
      const num = Array.isArray(val) ? val[0] : val
      
      // If triggered by a user interaction, mark as dragging to block prop syncs
      if (['drag', 'track-press', 'keyboard'].includes(eventDetails.reason)) {
        isDragging.current = true
      }
      
      setLocalValue(num)

      // Emit snapped value to parent
      const inverseStep = 1 / step
      const snappedVal = Math.round(num * inverseStep) / inverseStep
      onChange(snappedVal)
    },
    [onChange, step],
  )

  const handleCommit = useCallback(() => {
    isDragging.current = false
    setLocalValue(value)
  }, [value])

  // Auto-format: use decimals matching the step precision on the actual snapped value (parent's value)
  const displayValue = formatValue
    ? formatValue(value)
    : step < 1
      ? value.toFixed(Math.max(1, -Math.floor(Math.log10(step))))
      : String(Math.round(value))

  const shouldShowRangeLabels = showRangeLabels ?? !compact
  const hasLabelInfo = Boolean(labelInfoDescription)

  // ── Compact variant (toolbar-embedded) ──────────────────────────────────
  if (compact) {
    return (
      <div className={cn('flex items-center gap-1.5', className)}>
        <span
          className="text-[9px] font-bold uppercase tracking-widest text-muted-foreground shrink-0"
          style={{ fontFamily: MONO_FONT }}
        >
          {label}
        </span>

        <SliderPrimitive.Root
          value={[localValue]}
          onValueChange={handleChange}
          onValueCommitted={handleCommit}
          min={min}
          max={max}
          step={0.001} // Force continuous motion locally
          className="w-20"
        >
          <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none py-1.5">
            <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-muted">
              <SliderPrimitive.Indicator
                className={isViolating ? 'h-full bg-destructive' : 'h-full bg-primary'}
              />
            </SliderPrimitive.Track>
            <SliderPrimitive.Thumb
              className={cn(
                'relative block size-3 shrink-0 rounded-full border-2 bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] select-none cursor-pointer',
                'after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3',
                isViolating ? 'border-destructive' : 'border-primary',
              )}
            />
          </SliderPrimitive.Control>
        </SliderPrimitive.Root>

        <span
          className="text-[9px] font-bold text-foreground tabular-nums w-8 text-right shrink-0"
          style={{ fontFamily: MONO_FONT }}
        >
          {displayValue}{unit ? unit : ''}
        </span>
      </div>
    )
  }

  // ── Default variant (parameter panel) ───────────────────────────────────
  return (
    <div className={cn('space-y-1', className)}>
      {/* Label row */}
      <div className="flex items-center justify-between">
        <div className="flex min-w-0 items-center gap-2">
          {hasLabelInfo && (
            <Popover>
              <PopoverTrigger asChild>
                <button
                  type="button"
                  className="inline-flex size-3 items-center justify-center rounded-full text-muted-foreground/45 transition-colors hover:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  aria-label={`Explain ${label}`}
                >
                  <Info className="size-3" aria-hidden="true" strokeWidth={1.8} />
                </button>
              </PopoverTrigger>
              <PopoverContent side="right" align="start" sideOffset={8} className="w-72 max-w-[300px]">
                <PopoverHeader>
                  <PopoverTitle>{labelInfoTitle ?? label}</PopoverTitle>
                  <PopoverDescription className="text-xs leading-relaxed">
                    {labelInfoDescription}
                  </PopoverDescription>
                </PopoverHeader>
              </PopoverContent>
            </Popover>
          )}
          <label className="truncate text-[11px] font-medium text-foreground">
            {label}
          </label>
        </div>
        <span
          className={cn(
            'font-medium tabular-nums',
            isViolating ? 'text-destructive' : 'text-foreground',
          )}
          style={{ fontFamily: MONO_FONT, fontSize: 12 }}
        >
          {displayValue}
          {unit && (
            <span className="text-muted-foreground ml-0.5" style={{ fontSize: 11 }}>
              {unit}
            </span>
          )}
        </span>
      </div>

      {/* Slider */}
      <SliderPrimitive.Root
        value={[localValue]}
        onValueChange={handleChange}
        onValueCommitted={handleCommit}
        min={min}
        max={max}
        step={0.001} // Force continuous motion locally
        className="w-full"
      >
        <SliderPrimitive.Control className="relative flex w-full touch-none items-center select-none py-1.5">
          <SliderPrimitive.Track className="relative h-1 w-full grow overflow-hidden rounded-full bg-muted">
            <SliderPrimitive.Indicator
              className={isViolating ? 'h-full bg-destructive' : 'h-full bg-primary'}
            />
          </SliderPrimitive.Track>
          <SliderPrimitive.Thumb
            className={cn(
              'relative block size-4 shrink-0 rounded-full border-2 bg-white shadow-sm ring-ring/50 transition-[color,box-shadow] select-none cursor-pointer',
              'after:absolute after:-inset-2 hover:ring-3 focus-visible:ring-3 focus-visible:outline-hidden active:ring-3',
              isViolating ? 'border-destructive' : 'border-primary',
            )}
          />
        </SliderPrimitive.Control>
      </SliderPrimitive.Root>

      {/* Range labels */}
      {shouldShowRangeLabels && (
        <div className="flex justify-between">
          <span className="text-muted-foreground" style={{ fontFamily: MONO_FONT, fontSize: 11 }}>
            {min}
          </span>
          <span className="text-muted-foreground" style={{ fontFamily: MONO_FONT, fontSize: 11 }}>
            {max}
          </span>
        </div>
      )}

      {/* Context line */}
      {contextLine && (
        <p className={cn('text-[10px]', CONTEXT_COLORS[contextLineType])}>{contextLine}</p>
      )}
    </div>
  )
})

LabSlider.displayName = 'LabSlider'

export { LabSlider }
export type { LabSliderProps }

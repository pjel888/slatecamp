'use client'

import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'

interface ThresholdMarker {
  value: number
  lawColor: string
  label: string
}

interface DimensionSliderProps {
  label: string
  value: number
  min: number
  max: number
  step: number
  unit: string
  thresholds: ThresholdMarker[]
  isViolating: boolean
  onChange: (value: number) => void
}

const DimensionSlider = ({
  label,
  value,
  min,
  max,
  step,
  unit,
  thresholds,
  isViolating,
  onChange,
}: DimensionSliderProps) => {
  const range = max - min

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between">
        <span className="text-sm text-foreground">{label}</span>
        <span
          className={cn(
            'text-sm font-mono tabular-nums',
            isViolating ? 'text-destructive font-medium' : 'text-muted-foreground',
          )}
        >
          {value} {unit}
        </span>
      </div>
      <div className="relative">
        <Slider
          value={[value]}
          min={min}
          max={max}
          step={step}
          onValueChange={(val) => onChange(Array.isArray(val) ? val[0] : val)}
        />
        {/* Threshold markers */}
        <div className="absolute inset-x-0 top-0 h-full pointer-events-none" aria-hidden="true">
          {thresholds.map((t) => {
            const pct = ((t.value - min) / range) * 100
            if (pct < 0 || pct > 100) return null
            return (
              <div
                key={`${t.label}-${t.value}`}
                className="absolute top-0 h-full w-px"
                style={{ left: `${pct}%`, backgroundColor: t.lawColor }}
                title={`${t.label}: ${t.value} ${unit}`}
              />
            )
          })}
        </div>
      </div>
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  )
}

export { DimensionSlider }
export type { DimensionSliderProps, ThresholdMarker }

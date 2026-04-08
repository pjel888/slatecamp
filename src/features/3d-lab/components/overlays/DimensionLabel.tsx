'use client'

import type { DimensionPayload } from '../../stores/useOverlayStore'

interface DimensionLabelProps {
  style: React.CSSProperties
  payload: DimensionPayload
}

export const DimensionLabel = ({ style, payload }: DimensionLabelProps) => {
  const displayValue =
    payload.unit === 'mm'
      ? `${Math.round(payload.value * 1000)} mm`
      : `${payload.value.toFixed(2)} m`

  return (
    <div
      style={style}
      className={`flex flex-col items-center gap-0.5 ${
        payload.isViolating
          ? 'text-destructive'
          : 'text-foreground'
      }`}
    >
      {payload.label && (
        <span className="font-mono text-[8px] uppercase tracking-widest opacity-70">
          {payload.label}
        </span>
      )}
      <span
        className={`font-mono text-[11px] font-bold px-1.5 py-0.5 rounded bg-card/90 shadow-sm ${
          payload.isViolating ? 'ring-1 ring-destructive' : ''
        }`}
      >
        {displayValue}
      </span>
    </div>
  )
}

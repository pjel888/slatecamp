'use client'

import type { ViolationPayload } from '../../stores/useOverlayStore'

interface ViolationBadgeProps {
  style: React.CSSProperties
  payload: ViolationPayload
}

export const ViolationBadge = ({ style, payload }: ViolationBadgeProps) => {
  const isError = payload.severity === 'error'
  return (
    <div
      style={style}
      role="alert"
      aria-label={`${payload.severity}: ${payload.message}`}
      className={`flex items-start gap-1 px-2 py-1 rounded shadow-sm whitespace-nowrap ${
        isError
          ? 'bg-destructive-50 border border-destructive/30 text-destructive'
          : 'bg-warning-50 border border-warning/30 text-warning'
      }`}
    >
      <div>
        <div className="text-[11px] font-bold">
          {payload.message}
        </div>
        {payload.section && (
          <div className="text-[11px] opacity-80">
            {payload.section}
          </div>
        )}
      </div>
    </div>
  )
}

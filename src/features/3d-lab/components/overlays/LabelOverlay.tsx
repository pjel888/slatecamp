'use client'

import type { LabelPayload } from '../../stores/useOverlayStore'

interface LabelOverlayProps {
  style: React.CSSProperties
  payload: LabelPayload
}

export const LabelOverlay = ({ style, payload }: LabelOverlayProps) => {
  return (
    <div
      style={style}
      className="px-1.5 py-0.5 bg-card/90 backdrop-blur-sm border border-border rounded shadow-sm whitespace-nowrap"
      role="status"
    >
      <div className="text-[11px] font-bold text-foreground">
        {payload.text}
      </div>
      {payload.subtext && (
        <div className="text-[11px] text-text-secondary">
          {payload.subtext}
        </div>
      )}
      {payload.codeRef && (
        <div className="text-[11px] text-muted-foreground">
          {payload.codeRef}
        </div>
      )}
    </div>
  )
}

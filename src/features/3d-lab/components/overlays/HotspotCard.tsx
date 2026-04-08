'use client'

import { useOverlayStore } from '../../stores/useOverlayStore'
import type { HotspotPayload } from '../../stores/useOverlayStore'

interface HotspotCardProps {
  id: string
  style: React.CSSProperties
  payload: HotspotPayload
}

export const HotspotCard = ({ id, style, payload }: HotspotCardProps) => {
  const openHotspot = useOverlayStore((s) => s.openHotspot)
  const closeHotspot = useOverlayStore((s) => s.closeHotspot)

  return (
    <div style={style}>
      {/* Trigger dot */}
      <button
        onClick={() => (payload.isOpen ? closeHotspot(id) : openHotspot(id))}
        aria-expanded={payload.isOpen}
        aria-label={payload.title}
        className="w-4 h-4 rounded-full bg-primary border-2 border-white shadow-md
                   flex items-center justify-center cursor-pointer
                   hover:scale-125 transition-transform duration-150
                   focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary"
      />

      {/* Expanded card */}
      {payload.isOpen && (
        <div
          className="absolute bottom-6 left-1/2 -translate-x-1/2 w-56
                     bg-card/95 backdrop-blur-sm rounded-md shadow-lg
                     border border-border p-2.5 z-50"
          role="tooltip"
        >
          <div className="flex items-start justify-between gap-2 mb-1.5">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-success shrink-0" />
              <span className="text-[11px] font-bold text-foreground leading-snug">
                {payload.title}
              </span>
            </div>
            <button
              onClick={() => closeHotspot(id)}
              className="shrink-0 rounded-sm p-0.5 hover:bg-muted transition-colors text-muted-foreground text-[10px]"
              aria-label="Close"
            >
              &times;
            </button>
          </div>
          <p className="text-[11px] text-text-secondary leading-relaxed">
            {payload.body}
          </p>
          {payload.codeRef && (
            <span className="inline-block mt-2 px-2 py-0.5 rounded bg-primary/10 font-mono text-[9px] text-primary">
              {payload.codeRef}
            </span>
          )}
          {/* Caret */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-border" />
        </div>
      )}
    </div>
  )
}

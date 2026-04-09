'use client'

import { useMemo } from 'react'
import type { FloorPlanConfig } from '@/features/3d-lab/types/templates'
import type { createModuleStore } from '@/features/3d-lab/stores/createModuleStore'

interface FloorPlanLegendSidebarProps {
  config: FloorPlanConfig
  useStore: ReturnType<typeof createModuleStore>
}

/**
 * FloorPlanLegendSidebar — Room legend + violation summary for floorplan template.
 * Extracted from FloorPlanWalkthrough to serve as ViewportSidebar slot content.
 */
export const FloorPlanLegendSidebar = ({ config, useStore }: FloorPlanLegendSidebarProps) => {
  const params = useStore((s) => s.params)

  const activeViolations = useMemo(() => {
    if (!config.violations) return []
    return config.violations.filter((v) => v.check(params))
  }, [config.violations, params])

  return (
    <div>
      {/* Room legend */}
      <div className="px-3 py-2 border-b border-border">
        <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
          Rooms
        </span>
      </div>
      <div className="p-2 space-y-1">
        {config.rooms.map((room) => (
          <div key={room.id} className="flex items-center gap-2 px-2 py-1">
            <div
              className="w-3 h-3 rounded-sm shrink-0 border border-black/10"
              style={{ backgroundColor: room.color, opacity: room.opacity ?? 0.7 }}
            />
            <span className="text-[11px] font-medium text-foreground truncate">
              {room.label}
            </span>
            {room.zone && (
              <span className="ml-auto text-[11px] text-muted-foreground">
                {room.zone}
              </span>
            )}
          </div>
        ))}
      </div>

      {/* Violations summary */}
      {config.violations && config.violations.length > 0 && (
        <>
          <div className="px-3 py-2 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-black uppercase tracking-widest text-muted-foreground">
                Compliance
              </span>
              <span className={`text-[11px] font-bold ${activeViolations.length > 0 ? 'text-destructive' : 'text-success'}`}>
                {activeViolations.length > 0 ? `${activeViolations.length} violation${activeViolations.length > 1 ? 's' : ''}` : 'All pass'}
              </span>
            </div>
          </div>
          <div className="p-2 space-y-1">
            {activeViolations.map((v) => (
              <div key={v.id} className="px-2 py-1 text-[11px] text-destructive bg-destructive/5 rounded border border-destructive/10">
                {v.message}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

'use client'

import { memo } from 'react'
import { Html } from '@react-three/drei'
import { X, ArrowSquareOut } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'

export interface HotspotDef {
  id: string
  position: [number, number, number]
  title: string
  description: string
  wikiSlug?: string
}

interface HotspotAnnotationProps {
  hotspot: HotspotDef
  isActive: boolean
  onActivate: (id: string) => void
  onDeactivate: () => void
  distanceFactor?: number
  isQuizMode?: boolean
}

/**
 * A 3D-anchored annotation dot that expands into an educational tooltip card.
 * Uses Drei's <Html> to place React DOM at exact 3D coordinates (Spatial Contiguity).
 */
export const HotspotAnnotation = memo(function HotspotAnnotation({
  hotspot,
  isActive,
  onActivate,
  onDeactivate,
  distanceFactor = 8,
  isQuizMode = false,
}: HotspotAnnotationProps) {
  return (
    <Html
      position={hotspot.position}
      distanceFactor={distanceFactor}
      occlude={false}
      zIndexRange={[100, 0]}
    >
      {/* Wrapper needed: Html injects into DOM outside Canvas, pointer-events must be explicit */}
      <div style={{ pointerEvents: 'none' }}>
        {isActive ? (
          <div
            style={{ pointerEvents: 'auto' }}
            className="w-56 bg-card/95 backdrop-blur-sm border border-border rounded-md shadow-lg p-2.5 -translate-x-1/2"
          >
            <div className="flex items-start justify-between gap-2 mb-1.5">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shrink-0" />
                <span className="text-[11px] font-bold text-foreground leading-snug">
                  {hotspot.title}
                </span>
              </div>
              <button
                onClick={onDeactivate}
                className="shrink-0 rounded-sm p-0.5 hover:bg-muted transition-colors"
              >
                <SCIcon icon={X} size="xs" className="text-muted-foreground" />
              </button>
            </div>
            <p className="text-[11px] text-text-secondary leading-relaxed mb-2">
              {hotspot.description}
            </p>
            {hotspot.wikiSlug && (
              <a
                href={`/dashboard/wiki/${hotspot.wikiSlug}`}
                className="inline-flex items-center gap-1 text-[11px] font-bold text-primary hover:text-primary-700 uppercase tracking-wide"
              >
                Wiki Article
                <SCIcon icon={ArrowSquareOut} size="xs" />
              </a>
            )}
            {/* Caret pointer downward */}
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-full w-0 h-0 border-l-[6px] border-r-[6px] border-t-[6px] border-l-transparent border-r-transparent border-t-border" />
          </div>
        ) : (
          <button
            style={{ pointerEvents: 'auto' }}
            onClick={() => onActivate(hotspot.id)}
            className={cn(
              'w-4 h-4 rounded-full -translate-x-1/2 -translate-y-1/2',
              'border-2 border-white shadow-md',
              'hover:scale-125 transition-transform duration-150 cursor-pointer',
              isQuizMode ? 'bg-amber-500' : 'bg-primary'
            )}
            title={isQuizMode ? 'Click to answer' : hotspot.title}
          />
        )}
      </div>
    </Html>
  )
})

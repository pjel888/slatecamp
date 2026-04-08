'use client'

import { useEffect } from 'react'
import { Vector3 } from 'three'
import { useOverlayStore } from '@/features/3d-lab/stores/useOverlayStore'

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
 * Emits a hotspot overlay item to useOverlayStore.
 * The actual DOM rendering is handled by DOMOverlayLayer + HotspotCard.
 */
export const HotspotAnnotation = ({
  hotspot,
  isActive,
}: HotspotAnnotationProps) => {
  const upsertItem = useOverlayStore((s) => s.upsertItem)
  const removeItem = useOverlayStore((s) => s.removeItem)

  const overlayId = `hotspot-${hotspot.id}`

  useEffect(() => {
    upsertItem({
      id: overlayId,
      worldPosition: new Vector3(hotspot.position[0], hotspot.position[1], hotspot.position[2]),
      type: 'hotspot',
      payload: {
        title: hotspot.title,
        body: hotspot.description,
        codeRef: hotspot.wikiSlug ? `/dashboard/wiki/${hotspot.wikiSlug}` : undefined,
        isOpen: isActive,
      },
      visible: true,
      zIndex: 20,
    })
    return () => removeItem(overlayId)
  }, [hotspot, isActive, upsertItem, removeItem, overlayId])

  return null
}

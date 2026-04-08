// src/app/dashboard/3d-lab/_components/ViolationIndicator.tsx
'use client'

import { useEffect } from 'react'
import { Vector3 } from 'three'
import { useOverlayStore } from '@/features/3d-lab/stores/useOverlayStore'

interface ViolationIndicatorProps {
  position: [number, number, number]
  message: string
  codeRef: string
  visible: boolean
  distanceFactor?: number
}

/**
 * Emits a violation overlay item to useOverlayStore.
 * The actual DOM rendering is handled by DOMOverlayLayer + ViolationBadge.
 */
export const ViolationIndicator = ({
  position,
  message,
  codeRef,
  visible,
}: ViolationIndicatorProps) => {
  const upsertItem = useOverlayStore((s) => s.upsertItem)
  const removeItem = useOverlayStore((s) => s.removeItem)

  const overlayId = `violation-${message.replace(/\s+/g, '-').slice(0, 30)}`

  useEffect(() => {
    if (!visible) {
      removeItem(overlayId)
      return
    }
    upsertItem({
      id: overlayId,
      worldPosition: new Vector3(position[0], position[1], position[2]),
      type: 'violation',
      payload: {
        law: codeRef,
        section: codeRef,
        message,
        severity: 'error',
      },
      visible: true,
    })
    return () => removeItem(overlayId)
  }, [position, message, codeRef, visible, upsertItem, removeItem, overlayId])

  return null
}

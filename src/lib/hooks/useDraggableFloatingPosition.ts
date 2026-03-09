'use client'

import { useState, useCallback, useEffect, useRef } from 'react'

const STORAGE_PREFIX = 'cerebro-dev-float-'
const DRAG_THRESHOLD_PX = 5

export interface FloatingPosition {
  right: number
  bottom: number
}

function loadPosition(id: string, defaultRight: number, defaultBottom: number): FloatingPosition {
  if (typeof window === 'undefined') return { right: defaultRight, bottom: defaultBottom }
  try {
    const raw = localStorage.getItem(STORAGE_PREFIX + id)
    if (!raw) return { right: defaultRight, bottom: defaultBottom }
    const parsed = JSON.parse(raw) as { right?: number; bottom?: number }
    return {
      right: typeof parsed.right === 'number' ? parsed.right : defaultRight,
      bottom: typeof parsed.bottom === 'number' ? parsed.bottom : defaultBottom,
    }
  } catch {
    return { right: defaultRight, bottom: defaultBottom }
  }
}

function savePosition(id: string, pos: FloatingPosition) {
  try {
    localStorage.setItem(STORAGE_PREFIX + id, JSON.stringify(pos))
  } catch {
    // ignore
  }
}

/**
 * Draggable floating position for dev pills. Persists to localStorage.
 * Default positions should be chosen so multiple pills don't overlap (e.g. right: 16 and right: 220).
 */
export function useDraggableFloatingPosition(
  id: string,
  defaultRight: number,
  defaultBottom: number
) {
  const [position, setPosition] = useState<FloatingPosition>(() =>
    loadPosition(id, defaultRight, defaultBottom)
  )

  useEffect(() => {
    setPosition(loadPosition(id, defaultRight, defaultBottom))
  }, [id, defaultRight, defaultBottom])

  const didDragRef = useRef(false)

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (e.button !== 0) return
      didDragRef.current = false
      const startX = e.clientX
      const startY = e.clientY
      const startRight = position.right
      const startBottom = position.bottom
      let didMove = false
      ;(e.target as HTMLElement).setPointerCapture?.(e.pointerId)

      const onMove = (e: PointerEvent) => {
        const deltaX = e.clientX - startX
        const deltaY = e.clientY - startY
        if (!didMove && (Math.abs(deltaX) > DRAG_THRESHOLD_PX || Math.abs(deltaY) > DRAG_THRESHOLD_PX)) {
          didMove = true
          didDragRef.current = true
        }
        setPosition((prev) => {
          const next = didMove
            ? {
                right: Math.max(0, startRight - deltaX),
                bottom: Math.max(0, startBottom - deltaY),
              }
            : prev
          if (didMove) savePosition(id, next)
          return next
        })
      }
      const onUp = () => {
        ;(e.target as HTMLElement).releasePointerCapture?.(e.pointerId)
        window.removeEventListener('pointermove', onMove)
        window.removeEventListener('pointerup', onUp)
      }
      window.addEventListener('pointermove', onMove)
      window.addEventListener('pointerup', onUp)
    },
    [id, position.right, position.bottom]
  )

  const style: React.CSSProperties = {
    position: 'fixed',
    right: position.right,
    bottom: position.bottom,
    zIndex: 9999,
  }

  return { style, onPointerDown, didDragRef }
}

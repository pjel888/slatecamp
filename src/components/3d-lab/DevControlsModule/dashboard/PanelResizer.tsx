'use client'

import { useCallback, useRef, useEffect } from 'react'

// Drag-to-resize handle for toolbar panels.
// Uses pointer events on window to avoid losing capture.
// Width updates via direct DOM mutation (ref) to prevent React re-renders
// that would cause 3D viewport frame drops during drag.

interface PanelResizerProps {
  side: 'left' | 'right'
  panelRef: React.RefObject<HTMLDivElement | null>
  minWidth?: number
  maxWidth?: number
}

export function PanelResizer({ side, panelRef, minWidth = 220, maxWidth = 500 }: PanelResizerProps) {
  const dragging = useRef(false)
  const startX = useRef(0)
  const startWidth = useRef(0)

  const onPointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault()
    dragging.current = true
    startX.current = e.clientX
    startWidth.current = panelRef.current?.offsetWidth ?? 280
    document.body.style.cursor = 'col-resize'
    document.body.style.userSelect = 'none'
  }, [panelRef])

  useEffect(() => {
    const onPointerMove = (e: PointerEvent) => {
      if (!dragging.current || !panelRef.current) return
      const delta = side === 'left'
        ? e.clientX - startX.current
        : startX.current - e.clientX
      const newWidth = Math.min(maxWidth, Math.max(minWidth, startWidth.current + delta))
      // Direct DOM mutation — no React re-render, no viewport stutter
      panelRef.current.style.width = `${newWidth}px`
    }

    const onPointerUp = () => {
      if (!dragging.current) return
      dragging.current = false
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
    }

    window.addEventListener('pointermove', onPointerMove)
    window.addEventListener('pointerup', onPointerUp)
    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      window.removeEventListener('pointerup', onPointerUp)
    }
  }, [panelRef, side, minWidth, maxWidth])

  return (
    <div
      onPointerDown={onPointerDown}
      className={`absolute top-0 bottom-0 z-20 w-1 cursor-col-resize transition-colors duration-150 hover:bg-[#1B3FC4]/20 active:bg-[#1B3FC4]/30 ${
        side === 'left' ? 'right-0' : 'left-0'
      }`}
    />
  )
}

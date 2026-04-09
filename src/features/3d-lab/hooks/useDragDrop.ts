'use client'

// useDragDrop — shared drag-and-drop hook for 3D Lab
// Provides visual drop target feedback and cancel on Escape.

import { useState, useCallback, useEffect } from 'react'

interface DragState {
  isDragging: boolean
  dragItemId: string | null
  dragItemType: string | null
  isValidTarget: boolean
}

export const useDragDrop = () => {
  const [state, setState] = useState<DragState>({
    isDragging: false,
    dragItemId: null,
    dragItemType: null,
    isValidTarget: false,
  })

  const startDrag = useCallback((itemId: string, itemType: string) => {
    setState({
      isDragging: true,
      dragItemId: itemId,
      dragItemType: itemType,
      isValidTarget: false,
    })
  }, [])

  const setValidTarget = useCallback((valid: boolean) => {
    setState((prev) => ({ ...prev, isValidTarget: valid }))
  }, [])

  const endDrag = useCallback(() => {
    setState({
      isDragging: false,
      dragItemId: null,
      dragItemType: null,
      isValidTarget: false,
    })
  }, [])

  const cancelDrag = useCallback(() => {
    endDrag()
  }, [endDrag])

  // Cancel on Escape
  useEffect(() => {
    if (!state.isDragging) return

    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') cancelDrag()
    }

    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [state.isDragging, cancelDrag])

  return {
    ...state,
    startDrag,
    setValidTarget,
    endDrag,
    cancelDrag,
  }
}

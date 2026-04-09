'use client'

// useSelectionModel — shared selection hook for 3D Lab viewport elements
// Manages selection state and provides handlers for click/double-click/ctrl+click/tab/escape

import { useCallback } from 'react'
import { useViewportShellStore } from '@/features/3d-lab/stores/useViewportShellStore'

export const useSelectionModel = () => {
  const selectedIds = useViewportShellStore((s) => s.selectedIds)
  const hoveredId = useViewportShellStore((s) => s.hoveredId)
  const selectElement = useViewportShellStore((s) => s.selectElement)
  const toggleSelect = useViewportShellStore((s) => s.toggleSelect)
  const clearSelection = useViewportShellStore((s) => s.clearSelection)
  const setHoveredId = useViewportShellStore((s) => s.setHoveredId)

  const handleClick = useCallback((id: string, event?: { ctrlKey?: boolean; metaKey?: boolean; shiftKey?: boolean }) => {
    if (event?.ctrlKey || event?.metaKey) {
      toggleSelect(id)
    } else {
      selectElement(id)
    }
  }, [selectElement, toggleSelect])

  const handleHover = useCallback((id: string | null) => {
    setHoveredId(id)
  }, [setHoveredId])

  const handleEscape = useCallback(() => {
    clearSelection()
  }, [clearSelection])

  return {
    selectedIds,
    hoveredId,
    handleClick,
    handleHover,
    handleEscape,
    clearSelection,
    isSelected: useCallback((id: string) => selectedIds.has(id), [selectedIds]),
    isHovered: useCallback((id: string) => hoveredId === id, [hoveredId]),
    selectionCount: selectedIds.size,
    selectionSummary: `${selectedIds.size} element${selectedIds.size !== 1 ? 's' : ''} selected`,
  }
}

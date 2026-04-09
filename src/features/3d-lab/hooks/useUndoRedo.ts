'use client'

// useUndoRedo — undo/redo history for module parameters
// Wraps parameter changes with history tracking.
// Ctrl+Z = undo, Ctrl+Shift+Z = redo (handled by useViewportShortcuts)

import { useCallback, useRef } from 'react'

interface HistoryEntry {
  params: Record<string, number | boolean | string>
  timestamp: number
  description: string
}

const MAX_HISTORY = 50

export const useUndoRedo = (
  getParams: () => Record<string, number | boolean | string>,
  setParams: (params: Record<string, number | boolean | string>) => void,
) => {
  const historyRef = useRef<HistoryEntry[]>([])
  const indexRef = useRef(-1)
  const isUndoingRef = useRef(false)

  const pushState = useCallback((description: string = 'Parameter change') => {
    if (isUndoingRef.current) return

    const currentParams = { ...getParams() }
    const history = historyRef.current

    // Truncate any forward history if we're not at the end
    if (indexRef.current < history.length - 1) {
      historyRef.current = history.slice(0, indexRef.current + 1)
    }

    // Push new entry
    historyRef.current.push({
      params: currentParams,
      timestamp: Date.now(),
      description,
    })

    // Cap history size
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current = historyRef.current.slice(-MAX_HISTORY)
    }

    indexRef.current = historyRef.current.length - 1
  }, [getParams])

  const undo = useCallback(() => {
    if (indexRef.current <= 0) return false

    isUndoingRef.current = true
    indexRef.current -= 1
    const entry = historyRef.current[indexRef.current]
    if (entry) {
      setParams(entry.params)
    }
    isUndoingRef.current = false
    return true
  }, [setParams])

  const redo = useCallback(() => {
    if (indexRef.current >= historyRef.current.length - 1) return false

    isUndoingRef.current = true
    indexRef.current += 1
    const entry = historyRef.current[indexRef.current]
    if (entry) {
      setParams(entry.params)
    }
    isUndoingRef.current = false
    return true
  }, [setParams])

  return {
    pushState,
    undo,
    redo,
    canUndo: indexRef.current > 0,
    canRedo: indexRef.current < historyRef.current.length - 1,
    historyLength: historyRef.current.length,
    currentIndex: indexRef.current,
  }
}

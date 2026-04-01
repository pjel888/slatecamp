'use client'

import { useState, useCallback, useEffect } from 'react'

// ─── Panel State Hook ──────────────────────────────────────────────────────
// Manages left/right panel collapse state + active left panel tab.
// Persists to localStorage so panel preferences survive page reloads.

export type InputTab = 'lot' | 'building' | 'settings'

interface PanelState {
  leftCollapsed: boolean
  rightCollapsed: boolean
  activeTab: InputTab
}

// Version key — bump to invalidate stale localStorage (e.g. after layout fixes)
const STORAGE_VERSION = 2
const STORAGE_KEY = `slatecamp-3dlab-panels-v${STORAGE_VERSION}`

const DEFAULT_STATE: PanelState = {
  leftCollapsed: false,
  rightCollapsed: false,
  activeTab: 'lot',
}

function loadState(): PanelState {
  if (typeof window === 'undefined') return DEFAULT_STATE
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return DEFAULT_STATE
    const parsed = JSON.parse(raw)
    return { ...DEFAULT_STATE, ...parsed }
  } catch {
    return DEFAULT_STATE
  }
}

function saveState(state: PanelState) {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage full or unavailable — silently ignore
  }
}

export function usePanelState() {
  const [state, setState] = useState<PanelState>(DEFAULT_STATE)

  // Hydrate from localStorage after mount (avoids SSR mismatch)
  useEffect(() => {
    setState(loadState())
  }, [])

  const update = useCallback((patch: Partial<PanelState>) => {
    setState((prev) => {
      const next = { ...prev, ...patch }
      saveState(next)
      return next
    })
  }, [])

  const toggleLeft = useCallback(() => {
    update({ leftCollapsed: !state.leftCollapsed })
  }, [state.leftCollapsed, update])

  const toggleRight = useCallback(() => {
    update({ rightCollapsed: !state.rightCollapsed })
  }, [state.rightCollapsed, update])

  const toggleBoth = useCallback(() => {
    const bothOpen = !state.leftCollapsed && !state.rightCollapsed
    update({ leftCollapsed: bothOpen, rightCollapsed: bothOpen })
  }, [state.leftCollapsed, state.rightCollapsed, update])

  const setActiveTab = useCallback(
    (tab: InputTab) => update({ activeTab: tab }),
    [update],
  )

  return {
    leftCollapsed: state.leftCollapsed,
    rightCollapsed: state.rightCollapsed,
    activeTab: state.activeTab,
    toggleLeft,
    toggleRight,
    toggleBoth,
    setActiveTab,
  }
}

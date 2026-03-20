'use client'

import { useState, useEffect } from 'react'

const NAV_COLLAPSED_KEY = 'notes-nav-collapsed'
const LIST_COLLAPSED_KEY = 'notes-list-collapsed'

/**
 * Manages panel collapse states for the notes shell.
 * Persists to localStorage and handles Ctrl/Cmd + \ keyboard shortcuts.
 */
export const useNotesPanels = () => {
  const [navCollapsed, setNavCollapsed] = useState(false)
  const [listCollapsed, setListCollapsed] = useState(false)

  // Read persisted collapse states on mount
  useEffect(() => {
    if (localStorage.getItem(NAV_COLLAPSED_KEY) === 'true') setNavCollapsed(true)
    if (localStorage.getItem(LIST_COLLAPSED_KEY) === 'true') setListCollapsed(true)
  }, [])

  // Persist navCollapsed
  useEffect(() => {
    localStorage.setItem(NAV_COLLAPSED_KEY, String(navCollapsed))
  }, [navCollapsed])

  // Persist listCollapsed
  useEffect(() => {
    localStorage.setItem(LIST_COLLAPSED_KEY, String(listCollapsed))
  }, [listCollapsed])

  // Keyboard shortcut: Ctrl/Cmd + \ to toggle nav, Ctrl/Cmd + Shift + \ to toggle list
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') {
        e.preventDefault()
        if (e.shiftKey) {
          setListCollapsed((prev) => !prev)
        } else {
          setNavCollapsed((prev) => !prev)
        }
      }
    }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  return {
    navCollapsed,
    setNavCollapsed,
    listCollapsed,
    setListCollapsed,
  }
}

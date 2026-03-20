'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import { usePathname } from 'next/navigation'
import type { SidebarContextValue } from './types'
import { STORAGE_KEY } from './types'

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

const SidebarContext = createContext<SidebarContextValue | null>(null)

// ---------------------------------------------------------------------------
// Hook
// ---------------------------------------------------------------------------

export const useSidebar = (): SidebarContextValue => {
  const ctx = useContext(SidebarContext)
  if (!ctx) {
    throw new Error('useSidebar must be used within a <SidebarProvider>')
  }
  return ctx
}

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

interface SidebarProviderProps {
  children: React.ReactNode
}

export const SidebarProvider = ({ children }: SidebarProviderProps) => {
  // ---- State ----
  const [expanded, setExpandedState] = useState(false)
  const contentRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  // ---- Persistence helpers ----
  const persistExpanded = useCallback((value: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      // localStorage unavailable (SSR, private browsing, quota)
    }
  }, [])

  const setExpanded = useCallback(
    (v: boolean) => {
      setExpandedState(v)
      persistExpanded(v)
    },
    [persistExpanded],
  )

  const toggle = useCallback(() => {
    setExpandedState((prev) => {
      const next = !prev
      persistExpanded(next)
      return next
    })
  }, [persistExpanded])

  // ---- Hydrate from localStorage on mount ----
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'true') {
        setExpandedState(true)
      }
    } catch {
      // localStorage unavailable
    }
  }, [])

  // ---- Auto-collapse on route change (OVR-06) ----
  useEffect(() => {
    setExpandedState(false)
  }, [pathname])

  // ---- Escape key handler (OVR-05) ----
  useEffect(() => {
    if (!expanded) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setExpandedState(false)
        persistExpanded(false)
        requestAnimationFrame(() => {
          toggleRef.current?.focus()
        })
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [expanded, persistExpanded])

  // ---- Inert management on main content (A11-04) ----
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    if (expanded) {
      el.setAttribute('inert', '')
    } else {
      el.removeAttribute('inert')
    }
  }, [expanded])

  // ---- Render ----
  return (
    <SidebarContext.Provider
      value={{ expanded, setExpanded, toggle, contentRef, toggleRef }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

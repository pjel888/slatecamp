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
  // collapsed=true means overlay is closed (rail only visible)
  const [collapsed, setCollapsedState] = useState(true)
  const contentRef = useRef<HTMLDivElement>(null)
  const toggleRef = useRef<HTMLButtonElement>(null)
  const pathname = usePathname()

  // ---- Persistence helpers ----
  const persistCollapsed = useCallback((value: boolean) => {
    try {
      window.localStorage.setItem(STORAGE_KEY, String(value))
    } catch {
      // localStorage unavailable (SSR, private browsing, quota)
    }
  }, [])

  const setCollapsed = useCallback(
    (v: boolean) => {
      setCollapsedState(v)
      persistCollapsed(v)
    },
    [persistCollapsed],
  )

  const toggle = useCallback(() => {
    setCollapsedState((prev) => {
      const next = !prev
      persistCollapsed(next)
      return next
    })
  }, [persistCollapsed])

  // ---- Hydrate from localStorage on mount ----
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY)
      if (stored === 'false') {
        setCollapsedState(false)
      }
    } catch {
      // localStorage unavailable
    }
  }, [])

  // ---- Auto-collapse overlay on route change ----
  useEffect(() => {
    setCollapsedState(true)
  }, [pathname])

  // ---- Escape key closes overlay ----
  useEffect(() => {
    if (collapsed) return

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setCollapsedState(true)
        persistCollapsed(true)
        requestAnimationFrame(() => {
          toggleRef.current?.focus()
        })
      }
    }

    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [collapsed, persistCollapsed])

  // ---- Inert management on main content when overlay is open ----
  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    if (!collapsed) {
      el.setAttribute('inert', '')
    } else {
      el.removeAttribute('inert')
    }
  }, [collapsed])

  // ---- Render ----
  return (
    <SidebarContext.Provider
      value={{ collapsed, setCollapsed, toggle, contentRef, toggleRef }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

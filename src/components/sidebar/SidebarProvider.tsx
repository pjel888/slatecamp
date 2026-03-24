'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
} from 'react'
import { useRouter } from 'next/navigation'
import type { SidebarContextValue } from './types'
import { STORAGE_KEY } from './types'
import { SHORTCUT_MAP } from './sidebar-constants'

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
  const [expanded, setExpandedState] = useState(false)
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  const sidebarRef = useRef<HTMLElement | null>(null)
  const toggleRef = useRef<HTMLButtonElement | null>(null)
  const contentRef = useRef<HTMLDivElement | null>(null)

  const router = useRouter()

  // ---- Stable setters ----

  const setExpanded = useCallback((v: boolean) => {
    setExpandedState(v)
    try {
      window.localStorage.setItem(STORAGE_KEY, String(v))
    } catch {
      // localStorage unavailable (SSR, private browsing, quota)
    }
  }, [])

  const toggle = useCallback(() => {
    setExpandedState((prev) => {
      const next = !prev
      try {
        window.localStorage.setItem(STORAGE_KEY, String(next))
      } catch {
        // localStorage unavailable
      }
      return next
    })
  }, [])

  const expand = useCallback(() => {
    setExpanded(true)
  }, [setExpanded])

  const collapse = useCallback(() => {
    setExpanded(false)
  }, [setExpanded])

  // ---- Hydrate from localStorage on mount (SSR-safe) ----

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

  // ---- Reduced motion detection ----

  useEffect(() => {
    if (typeof window === 'undefined') return

    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mq.matches)

    const onChange = (e: MediaQueryListEvent) => {
      setPrefersReducedMotion(e.matches)
    }

    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [])

  // ---- Inert management on main content when overlay is open ----

  useEffect(() => {
    const el = contentRef.current
    if (!el) return

    if (expanded) {
      el.setAttribute('inert', '')
    } else {
      el.removeAttribute('inert')
    }
  }, [expanded])

  // ---- Click-outside to collapse ----

  useEffect(() => {
    if (!expanded) return

    const onMouseDown = (e: MouseEvent) => {
      const sidebar = sidebarRef.current
      if (!sidebar) return
      if (sidebar.contains(e.target as Node)) return
      setExpanded(false)
    }

    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [expanded, setExpanded])

  // ---- Keyboard shortcuts ----

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const isModifier = e.metaKey || e.ctrlKey

      // Cmd/Ctrl+B: toggle sidebar
      if (isModifier && e.key === 'b') {
        e.preventDefault()
        toggle()
        return
      }

      // Escape: collapse if expanded, return focus to toggle button
      if (e.key === 'Escape' && expanded) {
        setExpanded(false)
        requestAnimationFrame(() => {
          toggleRef.current?.focus()
        })
        return
      }

      // Cmd/Ctrl+1–4: navigate to routes
      if (isModifier && e.key in SHORTCUT_MAP) {
        e.preventDefault()
        router.push(SHORTCUT_MAP[e.key])
      }
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [expanded, toggle, setExpanded, router])

  // ---- Render ----

  return (
    <SidebarContext.Provider
      value={{
        expanded,
        setExpanded,
        toggle,
        expand,
        collapse,
        prefersReducedMotion,
        sidebarRef,
        toggleRef,
        contentRef,
      }}
    >
      {children}
    </SidebarContext.Provider>
  )
}

'use client'

import { useState, useEffect, useCallback, useRef, type ReactNode } from 'react'
import { ChevronDown } from 'lucide-react'

// ─── CollapsibleSection ────────────────────────────────────────────────────
// Reusable collapsible panel section with chevron animation, optional badge,
// and localStorage persistence. Used in both Input and Output panels.

interface CollapsibleSectionProps {
  title: string
  badge?: ReactNode
  defaultOpen?: boolean
  persistKey?: string
  children: ReactNode
}

function getPersistedState(key: string | undefined, fallback: boolean): boolean {
  if (!key || typeof window === 'undefined') return fallback
  try {
    const val = localStorage.getItem(`slatecamp-3dlab-section-${key}`)
    if (val === null) return fallback
    return val === '1'
  } catch {
    return fallback
  }
}

function persistState(key: string | undefined, open: boolean) {
  if (!key || typeof window === 'undefined') return
  try {
    localStorage.setItem(`slatecamp-3dlab-section-${key}`, open ? '1' : '0')
  } catch {
    // silently ignore
  }
}

export function CollapsibleSection({
  title,
  badge,
  defaultOpen = false,
  persistKey,
  children,
}: CollapsibleSectionProps) {
  const [open, setOpen] = useState(defaultOpen)
  const contentRef = useRef<HTMLDivElement>(null)
  const [maxHeight, setMaxHeight] = useState<number | undefined>(undefined)

  // Hydrate persisted state after mount
  useEffect(() => {
    setOpen(getPersistedState(persistKey, defaultOpen))
  }, [persistKey, defaultOpen])

  // Measure content height for smooth animation
  useEffect(() => {
    if (contentRef.current) {
      setMaxHeight(contentRef.current.scrollHeight)
    }
  }, [open, children])

  const toggle = useCallback(() => {
    const next = !open
    setOpen(next)
    persistState(persistKey, next)
  }, [open, persistKey])

  return (
    <div className="border-b border-border last:border-b-0">
      <button
        onClick={toggle}
        aria-expanded={open}
        className="flex w-full items-center gap-2 px-4 py-2.5 text-left transition-colors duration-150 hover:bg-muted/50"
      >
        <ChevronDown
          size={12}
          className="shrink-0 text-muted-foreground transition-transform duration-200 ease-out"
          style={{ transform: open ? 'rotate(0deg)' : 'rotate(-90deg)' }}
        />
        <span className="flex-1 font-mono text-[9px] font-medium uppercase tracking-widest text-muted-foreground">
          {title}
        </span>
        {badge && <span className="shrink-0">{badge}</span>}
      </button>

      <div
        ref={contentRef}
        className="overflow-hidden transition-[max-height] duration-200 ease-out"
        style={{ maxHeight: open ? (maxHeight ?? 2000) : 0 }}
        aria-hidden={!open}
      >
        <div className="px-4 pb-3">{children}</div>
      </div>
    </div>
  )
}

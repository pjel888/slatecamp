'use client'

import * as React from 'react'
import type { TocHeading } from '@/lib/wiki-markdown'
import { cn } from '@/lib/utils'

interface WikiTableOfContentsProps {
  headings: TocHeading[]
  /** ID of the scroll container to observe. Defaults to document. */
  scrollContainerId?: string
}

export function WikiTableOfContents({ headings, scrollContainerId }: WikiTableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const observerRef = React.useRef<IntersectionObserver | null>(null)
  const suppressObserverRef = React.useRef(false)

  React.useEffect(() => {
    // Use the scroll container as the IntersectionObserver root
    // so heading visibility is tracked relative to the center pane, not the viewport
    const root = scrollContainerId
      ? document.getElementById(scrollContainerId)
      : null

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (suppressObserverRef.current) return
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      {
        root: root || null,
        rootMargin: '-10% 0% -70% 0%',
        threshold: 0,
      }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [headings, scrollContainerId])

  // Don't render anything if there are no headings
  if (headings.length === 0) return null

  const handleClick = (id: string) => {
    suppressObserverRef.current = true
    setActiveId(id)

    // Scroll the heading into view within the center pane
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }

    // Highlight flash
    document.querySelectorAll('.highlight-fade').forEach(el => {
      el.classList.remove('highlight-fade')
    })
    if (el) {
      el.classList.add('highlight-fade')
      setTimeout(() => el.classList.remove('highlight-fade'), 3000)
    }

    // Re-enable observer after scroll settles
    window.setTimeout(() => {
      suppressObserverRef.current = false
    }, 600)
  }

  return (
    <nav aria-label="Table of contents">
      <p className="text-[11px] font-medium text-muted-foreground uppercase tracking-wider mb-3">
        On this page
      </p>
      <ul className="space-y-0.5 border-l border-border">
        {headings.map(({ id, text, level }, index) => {
          const isActive = activeId === id
          return (
            <li key={`${id}-${index}`}>
              <button
                onClick={() => handleClick(id)}
                aria-current={isActive ? 'true' : undefined}
                className={cn(
                  'block w-full text-left text-xs py-1 transition-colors leading-snug rounded-sm -ml-px',
                  level === 3 ? 'pl-5' : 'pl-3',
                  isActive
                    ? 'bg-primary-50 text-foreground font-medium'
                    : 'text-muted-foreground hover:text-text-secondary hover:bg-muted/40',
                )}
              >
                {text}
              </button>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}

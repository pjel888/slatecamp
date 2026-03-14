'use client'

import * as React from 'react'
import type { TocHeading } from '@/lib/wiki-markdown'

interface WikiTableOfContentsProps {
  headings: TocHeading[]
}

export function WikiTableOfContents({ headings }: WikiTableOfContentsProps) {
  const [activeId, setActiveId] = React.useState<string | null>(null)
  const observerRef = React.useRef<IntersectionObserver | null>(null)
  const suppressObserverRef = React.useRef(false)

  React.useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (suppressObserverRef.current) return

        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-20% 0% -60% 0%', threshold: 0 }
    )

    headings.forEach(({ id }) => {
      const el = document.getElementById(id)
      if (el) observerRef.current?.observe(el)
    })

    return () => observerRef.current?.disconnect()
  }, [headings])

  if (headings.length === 0) {
    return (
      <nav aria-label="Table of contents">
        <p className="text-xs font-medium text-foreground mb-3">On this page</p>
        <p className="text-xs text-muted-foreground italic">No sections found</p>
      </nav>
    )
  }

  const handleHighlight = (id: string) => {
    // Clear any existing highlights first to avoid "abuse" or clutter
    document.querySelectorAll('.highlight-fade').forEach(el => {
      el.classList.remove('highlight-fade')
    })

    const target = document.getElementById(id)
    if (target) {
      target.classList.add('highlight-fade')
      // CSS animation handles the fade, but we remove the class after it finishes
      setTimeout(() => {
        target.classList.remove('highlight-fade')
      }, 3000)
    }
  }

  const handleClick = (id: string) => {
    suppressObserverRef.current = true
    setActiveId(id)
    handleHighlight(id)

    // Re-enable observer updates shortly after the jump settles
    window.setTimeout(() => {
      suppressObserverRef.current = false
    }, 400)
  }

  return (
    <nav aria-label="Table of contents">
      <p className="text-xs font-medium text-foreground mb-3">On this page</p>
      <ul className="space-y-1">
        {headings.map(({ id, text, level }, index) => (
          <li
            key={`${id}-${index}`}
            style={{ paddingLeft: level === 3 ? '12px' : '0' }}
          >
            <a
              href={`#${id}`}
              onClick={(e) => {
                // Let browser handle anchor scroll, but immediately mark this as active
                handleClick(id)
              }}
              className={`block text-xs py-0.5 transition-colors leading-snug ${
                activeId === id
                  ? 'text-foreground font-medium'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

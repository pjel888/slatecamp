'use client'

import { useEffect, useRef, useState } from 'react'

export interface TocHeading {
  id: string
  text: string
  level: 2 | 3
}

/**
 * Exported pure helper — extracts h2 and h3 headings from markdown source text.
 * Headings are identified by leading ## or ### syntax (not inside code blocks).
 */
export function extractHeadings(markdown: string): TocHeading[] {
  const lines = markdown.split('\n')
  const headings: TocHeading[] = []

  for (const line of lines) {
    const h2 = line.match(/^## (.+)$/)
    const h3 = line.match(/^### (.+)$/)
    if (h2) {
      const text = h2[1].trim()
      headings.push({ id: slugify(text), text, level: 2 })
    } else if (h3) {
      const text = h3[1].trim()
      headings.push({ id: slugify(text), text, level: 3 })
    }
  }

  return headings
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

interface WikiTableOfContentsProps {
  headings: TocHeading[]
}

export function WikiTableOfContents({ headings }: WikiTableOfContentsProps) {
  const [activeId, setActiveId] = useState<string | null>(null)
  const observerRef = useRef<IntersectionObserver | null>(null)

  useEffect(() => {
    observerRef.current = new IntersectionObserver(
      (entries) => {
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

  if (headings.length === 0) return null

  return (
    <nav aria-label="Table of contents">
      <p className="text-xs font-medium text-foreground mb-3">On this page</p>
      <ul className="space-y-1">
        {headings.map(({ id, text, level }) => (
          <li key={id} style={{ paddingLeft: level === 3 ? '12px' : '0' }}>
            <a
              href={`#${id}`}
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

'use client'

import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'

interface TocItem {
  id: string
  label: string
  level?: number
}

interface StickyTOCProps {
  items: TocItem[]
  className?: string
}

const StickyTOC = ({ items, className }: StickyTOCProps) => {
  const [activeId, setActiveId] = useState<string>('')

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id)
          }
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0.1 },
    )

    for (const item of items) {
      const el = document.getElementById(item.id)
      if (el) observer.observe(el)
    }

    return () => observer.disconnect()
  }, [items])

  if (items.length === 0) return null

  return (
    <nav className={cn('sticky top-20 w-44 shrink-0 hidden xl:block', className)}>
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.1em] text-muted-foreground mb-2">
        On this page
      </p>
      <ul className="space-y-px">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              onClick={(e) => {
                e.preventDefault()
                document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' })
              }}
              className={cn(
                'block text-[11px] py-0.5 border-l pl-2.5 transition-colors duration-150',
                (item.level ?? 2) > 2 && 'ml-2.5',
                activeId === item.id
                  ? 'text-primary border-l-primary font-medium'
                  : 'text-muted-foreground border-l-border hover:text-foreground',
              )}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  )
}

export { StickyTOC }
export type { StickyTOCProps, TocItem }

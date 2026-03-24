'use client'

import { useState, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Search } from 'lucide-react'

const searchablePages = [
  { title: 'Overview', href: '/developer', keywords: 'home portal dashboard' },
  { title: 'Design System', href: '/developer/design-system', keywords: 'colors typography tokens campfire' },
  { title: 'API Reference', href: '/developer/api-reference', keywords: 'endpoints routes actions webhooks' },
  { title: 'Architecture', href: '/developer/architecture', keywords: 'schema database auth deployment' },
  { title: 'Component Library', href: '/developer/components', keywords: 'ui primitives mdx widgets' },
  { title: 'Dev Tools', href: '/developer/tools', keywords: 'console database logs test' },
  { title: 'Console', href: '/developer/tools/console', keywords: 'flags impersonation system' },
  { title: 'Database Browser', href: '/developer/tools/db', keywords: 'tables rls rows' },
  { title: 'Audit Logs', href: '/developer/tools/logs', keywords: 'events actions history' },
  { title: 'Test Data', href: '/developer/tools/test-data', keywords: 'mock generator sessions' },
]

export const DevPortalSearch = () => {
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const results = useMemo(() => {
    if (!query.trim()) return []
    const q = query.toLowerCase()
    return searchablePages.filter(
      (p) => p.title.toLowerCase().includes(q) || p.keywords.includes(q),
    )
  }, [query])

  const handleSelect = (href: string) => {
    router.push(href)
    setQuery('')
    setOpen(false)
  }

  return (
    <div className="relative ml-auto">
      <div className="flex items-center gap-1.5 bg-white/[0.06] border border-white/10 rounded-xs px-2.5 py-1 w-[200px]">
        <Search className="w-3.5 h-3.5 text-white/30 shrink-0" />
        <input
          type="text"
          placeholder="Search docs..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          className="bg-transparent border-none outline-none text-white/60 text-xs w-full placeholder:text-white/25"
        />
        <kbd className="font-[family-name:var(--font-dm-mono)] text-[9px] text-white/25 border border-white/10 px-1 py-px rounded">
          ⌘K
        </kbd>
      </div>

      {open && results.length > 0 && (
        <div className="absolute top-full mt-1 left-0 right-0 bg-card border border-border rounded-xs shadow-md overflow-hidden z-50">
          {results.map((page) => (
            <button
              key={page.href}
              type="button"
              onMouseDown={() => handleSelect(page.href)}
              className="w-full text-left px-3 py-2 text-xs text-foreground hover:bg-muted transition-colors"
            >
              {page.title}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

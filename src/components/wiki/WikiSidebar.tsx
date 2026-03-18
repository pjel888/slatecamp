'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CaretDown, CaretRight, FileText, BookOpen, Folder, MagnifyingGlass } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { getTaxonomyTree } from '@/lib/actions/wiki-actions'
import type { TaxonomyNode } from '@/lib/actions/taxonomy'
import { cn } from '@/lib/utils'

const VISITED_KEY = 'wiki_visited_slugs'

function loadVisited(): Set<string> {
  try {
    const raw = localStorage.getItem(VISITED_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function markVisited(slug: string) {
  try {
    const visited = loadVisited()
    visited.add(slug)
    localStorage.setItem(VISITED_KEY, JSON.stringify([...visited]))
  } catch {}
}

interface WikiSidebarProps {
  disciplineId: string
  disciplineName: string
  collapsed?: boolean
}

export function WikiSidebar({
  disciplineId,
  disciplineName,
  collapsed,
}: WikiSidebarProps) {
  const pathname = usePathname()
  const [nodes, setNodes] = React.useState<TaxonomyNode[]>([])
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [visited, setVisited] = React.useState<Set<string>>(new Set())
  const searchRef = React.useRef<HTMLInputElement>(null)

  // / keyboard shortcut focuses search
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) {
        e.preventDefault()
        searchRef.current?.focus()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  // Load visited slugs from localStorage
  React.useEffect(() => {
    setVisited(loadVisited())
  }, [])

  // Mark current page as visited
  React.useEffect(() => {
    const slug = pathname.split('/wiki/')[1]
    if (slug) {
      markVisited(slug)
      setVisited(prev => {
        const next = new Set(prev)
        next.add(slug)
        return next
      })
    }
  }, [pathname])

  React.useEffect(() => {
    if (disciplineId) {
      setLoading(true)
      getTaxonomyTree(disciplineId).then((data) => {
        setNodes(data)

        // Auto-expand nodes that contain the active slug
        const newExpanded: Record<string, boolean> = {}
        const expandParents = (nodeId: string) => {
          const node = data.find(n => n.node_id === nodeId)
          if (node) {
            newExpanded[node.node_id] = true
            if (node.parent_id) expandParents(node.parent_id)
          }
        }

        const activeNodes = data.filter((n) => n.slug && pathname.includes(n.slug))
        const activeArticles = data.flatMap(n => n.articles || []).filter(a => a.slug && pathname.includes(a.slug))

        activeNodes.forEach(n => expandParents(n.node_id))
        activeArticles.forEach(a => {
          const parentNode = data.find(n => n.articles?.some(art => art.article_id === a.article_id))
          if (parentNode) expandParents(parentNode.node_id)
        })

        setExpanded((prev) => ({ ...prev, ...newExpanded }))
        setLoading(false)
      })
    }
  }, [disciplineId, pathname])

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  const rootNodes = nodes.filter((n) => n.level === 1)

  if (!disciplineId) {
    return (
      <aside className="w-full h-full bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-zinc-100 p-3 rounded-md inline-block mb-3">
          <SCIcon icon={BookOpen} size="lg" className="text-zinc-400" />
        </div>
        <p className="text-xs font-bold text-zinc-900 mb-1">No Discipline</p>
        <p className="text-[11px] text-zinc-500 leading-relaxed mb-3">
          Select your exam type in Settings to view the syllabus.
        </p>
        <Link href="/dashboard/settings">
          <button className="text-[11px] font-bold text-primary hover:text-[#1535A8] uppercase tracking-wider cursor-pointer">
            Go to Settings
          </button>
        </Link>
      </aside>
    )
  }

  // --- Read/unread dot helper ---
  const isNodeVisited = (node: TaxonomyNode): boolean => {
    if (node.slug && visited.has(node.slug)) return true
    if (node.articles?.some(a => a.slug && visited.has(a.slug))) return true
    return false
  }

  const ReadDot = ({ isRead }: { isRead: boolean }) => (
    <span
      className={cn(
        'w-1.5 h-1.5 rounded-full shrink-0',
        isRead ? 'bg-[#2D9F6F]' : 'bg-zinc-300',
      )}
      aria-label={isRead ? 'Read' : 'Unread'}
    />
  )

  // --- Search filter ---
  const query = searchQuery.trim().toLowerCase()
  const matchesSearch = (node: TaxonomyNode): boolean => {
    if (!query) return true
    if (node.name.toLowerCase().includes(query)) return true
    if (node.articles?.some(a => a.title.toLowerCase().includes(query))) return true
    const children = nodes.filter(n => n.parent_id === node.node_id)
    return children.some(child => matchesSearch(child))
  }
  const filteredRoots = rootNodes.filter(matchesSearch)

  // When searching, force-expand all matching nodes so results are visible
  const isSearching = query.length > 0
  const isNodeExpanded = (nodeId: string) => isSearching || !!expanded[nodeId]

  // --- Render ---
  const renderNode = (node: TaxonomyNode, isChild = false) => {
    const children = nodes.filter((n) => n.parent_id === node.node_id)
    const nodeArticles = node.articles || []
    const hasChildren = children.length > 0
    const hasArticles = nodeArticles.length > 0
    const isCategory = node.level === 1 || hasChildren

    if (!isCategory && !hasArticles) return null

    // When searching, skip non-matching children
    const filteredChildren = isSearching
      ? children.filter(matchesSearch)
      : children
    const filteredArticles = isSearching
      ? nodeArticles.filter(a => a.title.toLowerCase().includes(query))
      : nodeArticles

    const checkIsActive = (n: TaxonomyNode): boolean => {
      if (n.slug && pathname.includes(n.slug)) return true
      if (n.articles?.some(a => a.slug && pathname.includes(a.slug))) return true
      const childNodes = nodes.filter(child => child.parent_id === n.node_id)
      return childNodes.some(child => checkIsActive(child))
    }

    const isActive = checkIsActive(node)
    const nodeExpanded = isNodeExpanded(node.node_id)

    return (
      <div key={node.node_id} className="space-y-0.5 min-w-0">
        {isCategory ? (
          <div className={cn(
            'w-full flex items-center gap-1 py-1 px-1 rounded-sm transition-all group min-w-0',
            isActive ? 'bg-[#EEF2FC]/50' : 'hover:bg-zinc-100',
            isChild && 'pl-2'
          )}>
            <button
              onClick={() => toggle(node.node_id)}
              className="p-1 hover:bg-zinc-200 rounded text-zinc-400 shrink-0"
            >
              {nodeExpanded ? (
                <SCIcon icon={CaretDown} size="xs" />
              ) : (
                <SCIcon icon={CaretRight} size="xs" />
              )}
            </button>
            <Link
              href={`/dashboard/wiki/${node.slug ?? ''}`}
              className={cn(
                'flex-1 flex items-center gap-2 py-0.5 px-1 text-[13px] font-medium truncate min-w-0',
                isActive ? 'text-[#1535A8]' : 'text-zinc-700'
              )}
            >
              <span className="truncate">{node.name}</span>
            </Link>
            <ReadDot isRead={isNodeVisited(node)} />
          </div>
        ) : (
          <Link
            href={`/dashboard/wiki/${node.slug ?? ''}`}
            className={cn(
              'w-full flex items-center gap-2 py-1.5 px-2 text-[13px] font-medium rounded-sm transition-all group min-w-0',
              isActive
                ? 'text-[#1535A8] bg-[#EEF2FC]'
                : 'text-zinc-600 hover:text-zinc-900 hover:bg-white',
              isChild && 'ml-3.5',
            )}
          >
            <SCIcon icon={FileText} size="xs"
              className={cn('shrink-0', isActive ? 'text-primary' : 'text-zinc-300')}
            />
            <span className="truncate">{node.name}</span>
            <ReadDot isRead={isNodeVisited(node)} />
          </Link>
        )}

        {nodeExpanded && isCategory && (
          <div
            className={cn(
              'ml-3.5 pl-3 border-l mt-0.5 mb-1 space-y-0.5 min-w-0',
              isActive ? 'border-primary/30' : 'border-zinc-200/60',
            )}
          >
            {filteredChildren.map((child) => renderNode(child, true))}

            {filteredArticles.map((art) => {
              const isArtActive = pathname.includes(art.slug || '')
              const isArtRead = art.slug ? visited.has(art.slug) : false
              return (
                <Link
                  key={art.article_id}
                  href={`/dashboard/wiki/${art.slug}`}
                  className={cn(
                    'group flex items-center gap-2 py-1.5 px-2 text-[12px] rounded-sm transition-all min-w-0',
                    isArtActive
                      ? 'bg-[#EEF2FC] text-[#1535A8] font-medium'
                      : 'text-zinc-500 hover:text-zinc-900 hover:bg-white',
                  )}
                >
                  <SCIcon icon={FileText} size="xs"
                    className={cn('shrink-0', isArtActive ? 'text-primary' : 'text-zinc-300')}
                  />
                  <span className="truncate">{art.title}</span>
                  <ReadDot isRead={isArtRead} />
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside className="w-full h-full bg-background flex flex-col overflow-hidden">
      {/* Element 1: Search — pinned to top, never scrolls */}
      <div className="shrink-0 p-2 pb-1">
        <div className="relative">
          <SCIcon icon={MagnifyingGlass} size="xs" className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none" />
          <input
            ref={searchRef}
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search topics..."
            className="w-full h-8 pl-7 pr-8 text-xs rounded-sm border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:border-[#1B3FC4] focus:ring-1 focus:ring-[#1B3FC4]/20 transition-colors"
          />
          {!searchQuery && (
            <kbd className="absolute right-2 top-1/2 -translate-y-1/2 text-[11px] text-zinc-400 bg-zinc-100 border border-zinc-200 rounded px-1 py-0.5 font-mono pointer-events-none">
              /
            </kbd>
          )}
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 text-xs"
              aria-label="Clear search"
            >
              &times;
            </button>
          )}
        </div>
      </div>

      {/* Element 2: Taxonomy tree — fills all remaining height, scrolls independently */}
      <nav className="flex-1 overflow-y-auto p-2 pt-1 space-y-1">
        {loading ? (
          <div className="space-y-3 pt-2 px-2">
            <div className="h-3 w-3/4 bg-zinc-200 animate-pulse rounded" />
            <div className="h-3 w-1/2 bg-zinc-200 animate-pulse rounded" />
            <div className="h-3 w-2/3 bg-zinc-200 animate-pulse rounded" />
          </div>
        ) : filteredRoots.length === 0 ? (
          <div className="px-2 py-4 text-center">
            <p className="text-xs text-zinc-400">No matching topics</p>
          </div>
        ) : (
          <div className="space-y-0.5">
            {filteredRoots.map((node) => renderNode(node))}
          </div>
        )}
      </nav>
    </aside>
  )
}

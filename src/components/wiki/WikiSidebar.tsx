'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { CaretDown, CaretRight, FileText, BookOpen, MagnifyingGlass, Scales } from '@phosphor-icons/react'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { getTaxonomyTree, getLawsTaxonomyTree } from '@/lib/actions/wiki-actions'
import type { TaxonomyNode } from '@/lib/actions/taxonomy'
import { cn } from '@/lib/utils'
import { useWikiNavigation } from '@/components/wiki/WikiNavigationContext'


interface WikiSidebarProps {
  disciplineId: string
  disciplineName: string
  collapsed?: boolean
}

export const WikiSidebar = ({
  disciplineId,
  disciplineName,
  collapsed,
}: WikiSidebarProps) => {
  const pathname = usePathname()
  const { navigate } = useWikiNavigation()
  const [nodes, setNodes] = React.useState<TaxonomyNode[]>([])
  const [lawsNodes, setLawsNodes] = React.useState<TaxonomyNode[]>([])
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({})
  const [loading, setLoading] = React.useState(true)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [isHovered, setIsHovered] = React.useState(false)
  const searchRef = React.useRef<HTMLInputElement>(null)

  // Dim non-active items when an article is open to reduce cognitive load
  const hasArticleOpen = pathname !== '/dashboard/wiki' && pathname.startsWith('/dashboard/wiki/')
  const isDimmed = hasArticleOpen && !isHovered

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


  // Fetch taxonomy data ONLY when discipline changes (not on every navigation)
  React.useEffect(() => {
    if (disciplineId) {
      setLoading(true)
      Promise.all([
        getTaxonomyTree(disciplineId),
        getLawsTaxonomyTree(disciplineId),
      ]).then(([data, laws]) => {
        setNodes(data)
        setLawsNodes(laws)
        setLoading(false)
      })
    }
  }, [disciplineId])

  // Auto-expand parent nodes to reveal the active article (reacts to pathname changes)
  React.useEffect(() => {
    const allNodes = [...nodes, ...lawsNodes]
    if (allNodes.length === 0) return

    const newExpanded: Record<string, boolean> = {}
    const expandParents = (nodeId: string) => {
      const node = allNodes.find(n => n.node_id === nodeId)
      if (node) {
        newExpanded[node.node_id] = true
        if (node.parent_id) expandParents(node.parent_id)
      }
    }

    const activeNodes = allNodes.filter((n) => n.slug && pathname.includes(n.slug))
    const activeArticles = allNodes.flatMap(n => n.articles || []).filter(a => a.slug && pathname.includes(a.slug))

    activeNodes.forEach(n => expandParents(n.node_id))
    activeArticles.forEach(a => {
      const parentNode = allNodes.find(n => n.articles?.some(art => art.article_id === a.article_id))
      if (parentNode) expandParents(parentNode.node_id)
    })

    if (Object.keys(newExpanded).length > 0) {
      setExpanded((prev) => ({ ...prev, ...newExpanded }))
    }
  }, [pathname, nodes, lawsNodes])

  const toggle = (id: string) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }))
  }

  /** Navigate using transition so WikiContentShell can show skeleton */
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href === pathname) return // already on this page
    e.preventDefault()
    navigate(href)
  }

  const rootNodes = nodes.filter((n) => n.level === 1)
  const lawsRootNodes = lawsNodes.filter((n) => n.level === 1)

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


  // --- Search filter ---
  const query = searchQuery.trim().toLowerCase()
  const matchesSearchIn = (node: TaxonomyNode, sourceNodes: TaxonomyNode[]): boolean => {
    if (!query) return true
    if (node.name.toLowerCase().includes(query)) return true
    if (node.articles?.some(a => a.title.toLowerCase().includes(query))) return true
    const children = sourceNodes.filter(n => n.parent_id === node.node_id)
    return children.some(child => matchesSearchIn(child, sourceNodes))
  }
  const matchesSearch = (node: TaxonomyNode): boolean => matchesSearchIn(node, nodes)
  const filteredRoots = rootNodes.filter(matchesSearch)
  const filteredLawsRoots = lawsRootNodes.filter(n => matchesSearchIn(n, lawsNodes))

  // When searching, force-expand all matching nodes so results are visible
  const isSearching = query.length > 0
  const isNodeExpanded = (nodeId: string) => isSearching || !!expanded[nodeId]

  // --- Render ---
  const renderNode = (node: TaxonomyNode, isChild = false, sourceNodes: TaxonomyNode[] = nodes) => {
    const children = sourceNodes.filter((n) => n.parent_id === node.node_id)
    const nodeArticles = node.articles || []
    const hasChildren = children.length > 0
    const isCategory = node.level <= 2 || hasChildren || nodeArticles.length > 0

    // When searching, skip non-matching children
    const filteredChildren = isSearching
      ? children.filter(c => matchesSearchIn(c, sourceNodes))
      : children
    const filteredArticles = isSearching
      ? nodeArticles.filter(a => a.title.toLowerCase().includes(query))
      : nodeArticles

    const checkIsActive = (n: TaxonomyNode): boolean => {
      if (n.slug && pathname.includes(n.slug)) return true
      if (n.articles?.some(a => a.slug && pathname.includes(a.slug))) return true
      const childNodes = sourceNodes.filter(child => child.parent_id === n.node_id)
      return childNodes.some(child => checkIsActive(child))
    }

    const isActive = checkIsActive(node)
    const nodeExpanded = isNodeExpanded(node.node_id)

    return (
      <div key={node.node_id} className="space-y-0.5 min-w-0">
        {isCategory ? (
          <div className={cn(
            'w-full flex items-center gap-1 py-1 px-1 rounded-sm transition-colors duration-200 group min-w-0',
            isActive ? 'bg-[#EEF2FC]/50' : 'hover:bg-zinc-100',
            isChild && 'pl-2'
          )}>
            <button
              onClick={() => toggle(node.node_id)}
              className={cn(
                'p-1 hover:bg-zinc-200 rounded shrink-0 transition-colors duration-200',
                isDimmed && !isActive ? 'text-zinc-300' : 'text-zinc-400',
              )}
            >
              {nodeExpanded ? (
                <SCIcon icon={CaretDown} size="xs" />
              ) : (
                <SCIcon icon={CaretRight} size="xs" />
              )}
            </button>
            <Link
              href={`/dashboard/wiki/${node.slug ?? ''}`}
              onClick={(e) => handleLinkClick(e, `/dashboard/wiki/${node.slug ?? ''}`)}
              className={cn(
                'flex-1 flex items-center gap-2 py-0.5 px-1 text-[13px] font-medium truncate min-w-0 transition-colors duration-200',
                isActive ? 'text-[#1535A8]' : isDimmed ? 'text-zinc-400' : 'text-zinc-700',
              )}
            >
              <span className="truncate">
                {node.level === 2 && node.sort_order != null
                  ? `${String(node.sort_order).padStart(2, '0')} — ${node.name}`
                  : node.name}
              </span>
            </Link>
          </div>
        ) : (
          <Link
            href={`/dashboard/wiki/${node.slug ?? ''}`}
            onClick={(e) => handleLinkClick(e, `/dashboard/wiki/${node.slug ?? ''}`)}
            className={cn(
              'w-full flex items-center gap-2 py-1.5 px-2 text-[13px] font-medium rounded-sm transition-colors duration-200 group min-w-0',
              isActive
                ? 'text-[#1535A8] bg-[#EEF2FC]'
                : isDimmed
                  ? 'text-zinc-400'
                  : 'text-zinc-600 hover:text-zinc-900 hover:bg-white',
            )}
          >
            <SCIcon icon={FileText} size="xs"
              className={cn('shrink-0 transition-colors duration-200', isActive ? 'text-primary' : isDimmed ? 'text-zinc-300' : 'text-zinc-300')}
            />
            <span className="truncate">{node.name}</span>
          </Link>
        )}

        {nodeExpanded && isCategory && (
          <div
            className={cn(
              'ml-5 pl-2.5 border-l mt-0.5 mb-1 space-y-0.5 min-w-0 transition-colors duration-200',
              isActive ? 'border-primary/30' : isDimmed ? 'border-zinc-200/30' : 'border-zinc-200/60',
            )}
          >
            {filteredChildren.map((child) => renderNode(child, true, sourceNodes))}

            {filteredArticles.map((art) => {
              const artHref = `/dashboard/wiki/${art.slug}`
              const isArtActive = pathname.includes(art.slug || '')
              return (
                <Link
                  key={art.article_id}
                  href={artHref}
                  onClick={(e) => handleLinkClick(e, artHref)}
                  className={cn(
                    'group flex items-center gap-2 py-1.5 px-2 text-[12px] rounded-sm transition-colors duration-200 min-w-0',
                    isArtActive
                      ? 'bg-[#EEF2FC] text-[#1535A8] font-medium'
                      : isDimmed
                        ? 'text-zinc-400'
                        : 'text-zinc-500 hover:text-zinc-900 hover:bg-white',
                  )}
                >
                  <SCIcon icon={FileText} size="xs"
                    className={cn('shrink-0 transition-colors duration-200', isArtActive ? 'text-primary' : isDimmed ? 'text-zinc-300/50' : 'text-zinc-300')}
                  />
                  <span className="truncate">{art.title}</span>
                </Link>
              )
            })}
          </div>
        )}
      </div>
    )
  }

  return (
    <aside
      className="w-full h-full bg-background flex flex-col overflow-hidden"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Element 1: Search — pinned to top, never scrolls */}
      <div className={cn('shrink-0 p-2 pb-1 transition-opacity duration-200', isDimmed && 'opacity-50')}>
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
          <>
            <div className={cn('mb-1.5 px-1 flex items-center gap-1.5 transition-opacity duration-200', isDimmed && 'opacity-40')}>
              <SCIcon icon={BookOpen} size="xs" className="text-zinc-400" />
              <span className="font-dm-mono text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-400">
                Syllabus
              </span>
            </div>
            <div className="space-y-0.5">
              {filteredRoots.map((node) => renderNode(node))}
            </div>
          </>
        )}

        {/* Laws & Codes — cross-reference section */}
        {!loading && filteredLawsRoots.length > 0 && (
          <>
            <div className={cn('mt-4 mb-1.5 px-1 flex items-center gap-1.5 transition-opacity duration-200', isDimmed && 'opacity-40')}>
              <SCIcon icon={Scales} size="xs" className="text-zinc-400" />
              <span className="font-dm-mono text-[11px] font-medium uppercase tracking-[0.15em] text-zinc-400">
                Laws &amp; Codes
              </span>
            </div>
            <div className="space-y-0.5">
              {filteredLawsRoots.map((node) => renderNode(node, false, lawsNodes))}
            </div>
          </>
        )}
      </nav>
    </aside>
  )
}

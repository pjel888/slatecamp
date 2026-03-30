'use client'

import * as React from 'react'
import Link from 'next/link'
import { CaretRight, FileText, BookOpen, Stack, ArrowsIn, ArrowsOut } from '@phosphor-icons/react/dist/ssr'
import { cn } from '@/lib/utils'
import { SearchInput } from '@/components/ui/input'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TaxonomyTreeNode {
  node_id: string
  name: string
  slug?: string | null
  level: number
  parent_id?: string | null
  ale_id?: string | null
  sort_order?: number | null
  is_leaf?: boolean
  children?: TaxonomyTreeNode[]
  article_count?: number
  question_count?: number
  articles?: Array<{ article_id: string; title: string; slug: string }>
}

interface TaxonomyTreeProps {
  nodes: TaxonomyTreeNode[]
  /** Currently active slug (highlights the matching node/article) */
  activeSlug?: string
  /** Base path for links. Default: '/dashboard/wiki' */
  basePath?: string
  /** Called on navigation instead of default Link behavior */
  onNavigate?: (href: string) => void
  /** Show article/question counts right-aligned. Default: true */
  showCounts?: boolean
  /** Show search filter. Default: true when > 10 nodes */
  showSearch?: boolean
  /** Dim non-active items when an article is active */
  dimInactive?: boolean
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Extract ALE ID suffix for compact display */
const aleIdSuffix = (aleId: string | null | undefined, isLeaf: boolean): string | null => {
  if (!aleId) return null
  const parts = aleId.split('-')
  if (isLeaf && parts.length >= 4) return parts.slice(-2).join('-')
  if (parts.length >= 3) return parts.slice(-1)[0]
  return aleId
}

/** Strip leading "NN — " prefix from node name for display */
const displayName = (node: TaxonomyTreeNode): string => {
  return node.name.replace(/^\d{1,2}\s*[—–-]\s*/, '')
}

/** Extract the sort order number for right-aligned display */
const sortLabel = (node: TaxonomyTreeNode, index?: number): string | null => {
  const order = node.sort_order ?? (index != null ? index + 1 : null)
  if (order != null) return String(order).padStart(2, '0')
  // Try extracting from name prefix "01 — ..."
  const match = node.name.match(/^(\d{1,2})\s*[—–-]/)
  if (match) return match[1].padStart(2, '0')
  return null
}

/** Walk tree to find ancestor node_ids for a given slug */
const findAncestorIds = (
  nodes: TaxonomyTreeNode[],
  slug: string,
): string[] => {
  const walk = (list: TaxonomyTreeNode[], path: string[]): string[] | null => {
    for (const node of list) {
      const nodeSlug = node.slug ?? ''
      const effectiveSlug = nodeSlug
        || (node.level >= 3 && node.articles?.length ? node.articles[0].slug : '')
      const isMatch = effectiveSlug === slug || node.articles?.some(a => a.slug === slug)

      if (isMatch) return [...path, node.node_id]
      if (node.children?.length) {
        const found = walk(node.children, [...path, node.node_id])
        if (found) return found
      }
    }
    return null
  }
  return walk(nodes, []) ?? []
}

const STORAGE_KEY = 'wiki_taxonomy_expanded'

/** Highlight ALL matched substrings in search results.
 *  Regex-safe, dark mode aware, 2-char minimum to avoid noise. */
const HighlightMatch = ({ text, query }: { text: string; query: string }) => {
  if (!query || query.length < 2) return <>{text}</>
  const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  const parts = text.split(new RegExp(`(${escaped})`, 'gi'))
  if (parts.length === 1) return <>{text}</>
  return (
    <>
      {parts.map((part, i) =>
        i % 2 === 1 ? (
          <mark key={i} className="bg-amber-100 text-inherit rounded-sm px-px dark:bg-amber-900/30">{part}</mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  )
}

/** Count all nodes in tree (for showSearch threshold) */
const countNodes = (nodes: TaxonomyTreeNode[]): number => {
  let count = 0
  const walk = (list: TaxonomyTreeNode[]) => {
    for (const n of list) {
      count++
      if (n.children?.length) walk(n.children)
    }
  }
  walk(nodes)
  return count
}

/** Filter: a node is visible if it or any descendant matches the query.
 *  Uses a shared mutable path to avoid O(n*d) array allocations. */
const filterNodes = (
  nodes: TaxonomyTreeNode[],
  query: string,
): Set<string> | null => {
  if (!query.trim()) return null
  const q = query.toLowerCase()
  const matches = new Set<string>()
  const path: string[] = []

  const walk = (list: TaxonomyTreeNode[]) => {
    for (const node of list) {
      const nameMatch = node.name.toLowerCase().includes(q)
      const aleMatch = node.ale_id?.toLowerCase().includes(q) ?? false
      const articleMatch = node.articles?.some(a => a.title.toLowerCase().includes(q)) ?? false

      if (nameMatch || aleMatch || articleMatch) {
        matches.add(node.node_id)
        for (const id of path) matches.add(id)
      }

      if (node.children?.length) {
        path.push(node.node_id)
        walk(node.children)
        path.pop()
      }
    }
  }
  walk(nodes)
  return matches.size > 0 ? matches : new Set()
}

/* ------------------------------------------------------------------ */
/*  TreeBranch (recursive node renderer)                               */
/* ------------------------------------------------------------------ */

interface TreeBranchProps {
  node: TaxonomyTreeNode
  depth: number
  expanded: Set<string>
  onToggle: (id: string) => void
  activeSlug?: string
  activeAncestors: Set<string> | null
  basePath: string
  onNavigate?: (href: string) => void
  showCounts: boolean
  dimInactive: boolean
  matchSet: Set<string> | null
  searchQuery: string
  siblingIndex?: number
}

const TreeBranch = React.memo(({
  node,
  depth,
  expanded,
  onToggle,
  activeSlug,
  activeAncestors,
  basePath,
  onNavigate,
  showCounts,
  dimInactive,
  matchSet,
  searchQuery,
  siblingIndex,
}: TreeBranchProps) => {
  const hasChildren = (node.children?.length ?? 0) > 0
  const hasArticles = (node.articles?.length ?? 0) > 0
  // Level 1 = subjects, level 2 = subtopics → always show chevron
  // Level 3+ = articles → always leaf, never expandable
  const isArticle = node.level >= 3
  const isExpandable = !isArticle && (hasChildren || hasArticles || node.level <= 2)
  // During search: auto-expand matched ancestors. Otherwise: user's expanded state.
  const isExpanded = matchSet
    ? matchSet.has(node.node_id)
    : expanded.has(node.node_id)
  const isLeaf = isArticle
  const nodeSlug = node.slug ?? ''
  // For leaf nodes (articles): use the first article's slug if the node has no slug
  const effectiveSlug = nodeSlug
    || (isLeaf && node.articles?.length ? node.articles[0].slug : '')
  const isActive = activeSlug
    ? (effectiveSlug === activeSlug || node.articles?.some(a => a.slug === activeSlug))
    : false
  const isChildActive = activeAncestors?.has(node.node_id) ?? false
  const isDimmed = dimInactive && activeSlug && !isActive && !isChildActive

  // Indentation: 20px per depth level
  const indent = depth * 20

  // Right-aligned: sort order number
  const orderLabel = sortLabel(node, siblingIndex)

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (onNavigate) {
      e.preventDefault()
      onNavigate(href)
    }
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggle(node.node_id)
  }

  // Filter children by match set
  const visibleChildren = matchSet
    ? (node.children ?? []).filter(c => matchSet.has(c.node_id))
    : (node.children ?? [])

  const visibleArticles = matchSet
    ? (node.articles ?? []).filter(a => {
        // Articles don't have node IDs in matchSet, show them if parent matches
        return matchSet.has(node.node_id)
      })
    : (node.articles ?? [])

  const nodeHref = `${basePath}/${effectiveSlug}`

  // Level-based icon: subjects=BookOpen, subtopics=Stack, articles=FileText
  const LevelIcon = node.level <= 1 ? BookOpen : node.level === 2 ? Stack : FileText

  return (
    <>
      {/* Node row */}
      <div
        className={cn(
          'group flex items-center min-w-0 transition-opacity duration-150',
          node.level <= 1 && 'mt-2 first:mt-0',
          node.level === 2 && 'mt-3 first:mt-0',
          isDimmed && 'opacity-60 grayscale-[0.3]',
        )}
        style={{ paddingLeft: `${indent}px` }}
      >
        {/* Expand/collapse chevron (subjects + subtopics) or spacer */}
        {isExpandable ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleToggle}
            className={cn(
              'flex w-5 shrink-0 items-center justify-center text-text-secondary transition-colors duration-150',
              'hover:text-foreground cursor-pointer',
              node.level <= 1 ? 'h-8' : 'h-6',
            )}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <CaretRight
              className={cn(
                'h-3 w-3 transition-transform duration-150',
                isExpanded && 'rotate-90',
              )}
            />
          </button>
        ) : (
          <span className={cn('flex w-5 shrink-0 items-center justify-center', node.level <= 1 ? 'h-8' : 'h-6')} />
        )}

        {/* Level icon */}
        <LevelIcon
          className={cn(
            'h-3.5 w-3.5 shrink-0 mr-2 transition-colors duration-150',
            isActive || isChildActive ? 'text-primary' : isDimmed ? 'text-muted-foreground' : 'text-text-secondary',
          )}
        />

        {/* Node name (link) — numbers stripped, shown on right instead */}
        <Link
          href={nodeHref}
          onClick={(e) => handleClick(e, nodeHref)}
          className={cn(
            'flex-1 truncate transition-colors duration-150 min-w-0',
            node.level <= 1
              ? 'text-[13px] font-bold py-1.5 tracking-tight'
              : isLeaf
                ? 'text-xs font-medium py-px'
                : 'text-[12.5px] font-semibold py-px',
            isActive || isChildActive
              ? 'text-primary'
              : isDimmed
                ? 'text-muted-foreground'
                : 'text-text-secondary hover:text-primary',
          )}
        >
          <HighlightMatch text={displayName(node)} query={searchQuery} />
        </Link>

        {/* Right-aligned sort order number in DM Mono */}
        {orderLabel && (
          <span
            className={cn(
              'ml-auto shrink-0 pl-2 font-[family-name:var(--font-dm-mono)] text-[10px] tabular-nums tracking-widest opacity-60',
              isActive || isChildActive ? 'text-primary' : 'text-text-secondary',
            )}
          >
            {orderLabel}
          </span>
        )}
      </div>

      {/* Expanded children + articles */}
      {isExpanded && isExpandable && (
        <div
          className={cn(
            'border-l transition-colors duration-150 space-y-2 mt-2 mb-2',
            isActive || isChildActive ? 'border-primary/40 shadow-[inset_1px_0_0_rgba(27,63,196,0.1)]' : 'border-border/60',
          )}
          style={{ marginLeft: `${indent + 10}px` }}
        >
          <div style={{ marginLeft: '12px' }}>
            {/* Child nodes */}
            {visibleChildren.map((child, i) => (
              <TreeBranch
                key={child.node_id}
                node={child}
                depth={0}
                expanded={expanded}
                onToggle={onToggle}
                activeSlug={activeSlug}
                activeAncestors={activeAncestors}
                basePath={basePath}
                onNavigate={onNavigate}
                showCounts={showCounts}
                dimInactive={dimInactive}
                matchSet={matchSet}
                searchQuery={searchQuery}
                siblingIndex={i}
              />
            ))}

            {/* Article links */}
            {visibleArticles.map((art) => {
              const artHref = `${basePath}/${art.slug}`
              const isArtActive = activeSlug === art.slug

              return (
                <div key={art.article_id} className="flex items-center min-w-0 py-0.5">
                  <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                    <span
                      className={cn(
                        'h-1 w-1 rounded-full transition-colors duration-150',
                        isArtActive ? 'bg-primary' : 'bg-border-default',
                      )}
                    />
                  </span>
                  <Link
                    href={artHref}
                    onClick={(e) => handleClick(e, artHref)}
                    className={cn(
                      'flex-1 truncate py-0.5 text-xs transition-colors duration-150 min-w-0',
                      isArtActive
                        ? 'text-primary font-bold'
                        : isDimmed
                          ? 'text-muted-foreground'
                          : 'text-text-secondary hover:text-primary',
                    )}
                  >
                    <HighlightMatch text={art.title} query={searchQuery} />
                  </Link>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </>
  )
})
TreeBranch.displayName = 'TreeBranch'

/* ------------------------------------------------------------------ */
/*  TaxonomyTree (main export)                                         */
/* ------------------------------------------------------------------ */

const TaxonomyTree = ({
  nodes,
  activeSlug,
  basePath = '/dashboard/wiki',
  onNavigate,
  showCounts = true,
  showSearch,
  dimInactive = false,
  className,
}: TaxonomyTreeProps) => {
  // Restore expanded state from localStorage only when an article is active
  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    if (!activeSlug) return new Set()
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) return new Set(JSON.parse(stored) as string[])
    } catch { /* ignore */ }
    return new Set()
  })
  const [searchQuery, setSearchQuery] = React.useState('')
  const deferredQuery = React.useDeferredValue(searchQuery)
  const isSearchPending = searchQuery !== deferredQuery

  const totalNodes = React.useMemo(() => countNodes(nodes), [nodes])
  const shouldShowSearch = showSearch ?? totalNodes > 10

  const handleExpandAll = React.useCallback(() => {
    const allIds = new Set<string>()
    const walk = (list: TaxonomyTreeNode[]) => {
      for (const n of list) {
        if (!n.is_leaf && (n.children?.length || n.articles?.length)) {
          allIds.add(n.node_id)
        }
        if (n.children?.length) walk(n.children)
      }
    }
    walk(nodes)
    setExpanded(allIds)
  }, [nodes])

  const handleCollapseAll = React.useCallback(() => {
    setExpanded(new Set())
  }, [])

  const matchSet = React.useMemo(
    () => filterNodes(nodes, deferredQuery),
    [nodes, deferredQuery],
  )

  // Pre-compute active ancestor set for O(1) lookups in TreeBranch
  const activeAncestors = React.useMemo(() => {
    if (!activeSlug) return null
    return new Set(findAncestorIds(nodes, activeSlug))
  }, [activeSlug, nodes])

  // Auto-expand ancestor path to active article
  React.useEffect(() => {
    if (!activeSlug || nodes.length === 0) return
    const ancestors = findAncestorIds(nodes, activeSlug)
    if (ancestors.length === 0) return
    setExpanded(prev => {
      const next = new Set(prev)
      let changed = false
      for (const id of ancestors) {
        if (!next.has(id)) { next.add(id); changed = true }
      }
      return changed ? next : prev
    })
  }, [activeSlug, nodes])

  // Persist expanded state to localStorage
  React.useEffect(() => {
    if (expanded.size === 0) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]))
    } catch { /* ignore */ }
  }, [expanded])

  const onToggle = React.useCallback((id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const visibleRoots = matchSet
    ? nodes.filter(n => matchSet.has(n.node_id))
    : nodes

  const isEmpty = nodes.length === 0
  const noResults = matchSet !== null && visibleRoots.length === 0

  return (
    <div className={cn(
      'group/tree flex flex-col',
      'transition-opacity duration-200 ease-out',
      className,
    )}>
      <div className="flex flex-col gap-1.5 p-2 pb-3 border-b border-border/60">
        {shouldShowSearch && (
          <SearchInput
            onChange={setSearchQuery}
            placeholder="Filter syllabus..."
            size="sm"
            debounceMs={250}
            loading={isSearchPending}
            className="bg-muted/30 border-none shadow-none focus-visible:ring-1 focus-visible:ring-primary/20"
          />
        )}
        
        <div className="flex items-center justify-end px-1 mt-0.5">
          <div className="flex items-center gap-2">
            <button
              onClick={handleExpandAll}
              className="p-1 rounded-sm hover:bg-muted text-text-tertiary hover:text-primary transition-colors cursor-pointer"
              title="Expand All"
            >
              <ArrowsOut size={13} weight="bold" />
            </button>
            <button
              onClick={handleCollapseAll}
              className="p-1 rounded-sm hover:bg-muted text-text-tertiary hover:text-primary transition-colors cursor-pointer"
              title="Collapse All"
            >
              <ArrowsIn size={13} weight="bold" />
            </button>
          </div>
        </div>
      </div>

      {/* Screen reader announcement for search results */}
      <div aria-live="polite" aria-atomic="true" className="sr-only">
        {deferredQuery && !noResults && `${matchSet?.size ?? 0} topics match "${deferredQuery}"`}
        {deferredQuery && noResults && `No topics match "${deferredQuery}"`}
      </div>

      {isEmpty ? (
        <div className="px-3 py-8 text-center text-sm text-muted-foreground">
          No taxonomy data
        </div>
      ) : noResults ? (
        <div className="px-3 py-6 text-center">
          <p className="text-sm text-muted-foreground">
            No topics match &ldquo;<span className="font-medium text-text-secondary">{deferredQuery}</span>&rdquo;
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Try a shorter or different keyword
          </p>
        </div>
      ) : (
        <nav className="overflow-y-auto p-1 py-3 space-y-0.5" aria-label="Taxonomy navigation">
          {visibleRoots.map((node, i) => (
            <TreeBranch
              key={node.node_id}
              node={node}
              depth={0}
              expanded={expanded}
              onToggle={onToggle}
              activeSlug={activeSlug}
              activeAncestors={activeAncestors}
              basePath={basePath}
              onNavigate={onNavigate}
              showCounts={showCounts}
              dimInactive={dimInactive}
              matchSet={matchSet}
              searchQuery={deferredQuery}
              siblingIndex={i}
            />
          ))}
        </nav>
      )}
    </div>
  )
}

export { TaxonomyTree }
export type { TaxonomyTreeNode, TaxonomyTreeProps }

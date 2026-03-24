'use client'

import * as React from 'react'
import Link from 'next/link'
import { ChevronRight, FileText, BookOpen, Layers } from 'lucide-react'
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

/** Filter: a node is visible if it or any descendant matches the query */
const filterNodes = (
  nodes: TaxonomyTreeNode[],
  query: string,
): Set<string> | null => {
  if (!query.trim()) return null
  const q = query.toLowerCase()
  const matches = new Set<string>()

  const walk = (list: TaxonomyTreeNode[], ancestors: string[]) => {
    for (const node of list) {
      const nameMatch = node.name.toLowerCase().includes(q)
      const aleMatch = node.ale_id?.toLowerCase().includes(q) ?? false
      const articleMatch = node.articles?.some(a => a.title.toLowerCase().includes(q)) ?? false

      if (nameMatch || aleMatch || articleMatch) {
        matches.add(node.node_id)
        ancestors.forEach(id => matches.add(id))
      }

      if (node.children?.length) {
        walk(node.children, [...ancestors, node.node_id])
      }
    }
  }
  walk(nodes, [])
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
  basePath: string
  onNavigate?: (href: string) => void
  showCounts: boolean
  dimInactive: boolean
  matchSet: Set<string> | null
  siblingIndex?: number
}

const TreeBranch = React.memo(({
  node,
  depth,
  expanded,
  onToggle,
  activeSlug,
  basePath,
  onNavigate,
  showCounts,
  dimInactive,
  matchSet,
  siblingIndex,
}: TreeBranchProps) => {
  const hasChildren = (node.children?.length ?? 0) > 0
  const hasArticles = (node.articles?.length ?? 0) > 0
  // Level 1 = subjects, level 2 = subtopics → always show chevron
  // Level 3+ = articles → always leaf, never expandable
  const isArticle = node.level >= 3
  const isExpandable = !isArticle && (hasChildren || hasArticles || node.level <= 2)
  const isExpanded = expanded.has(node.node_id)
  const isLeaf = isArticle
  const nodeSlug = node.slug ?? ''
  // For leaf nodes (articles): use the first article's slug if the node has no slug
  const effectiveSlug = nodeSlug
    || (isLeaf && node.articles?.length ? node.articles[0].slug : '')
  const isActive = activeSlug
    ? (effectiveSlug === activeSlug || node.articles?.some(a => a.slug === activeSlug))
    : false
  const isChildActive = activeSlug
    ? node.articles?.some(a => a.slug === activeSlug) ||
      node.children?.some(function checkChild(c: TaxonomyTreeNode): boolean {
        if (c.slug === activeSlug) return true
        if (c.articles?.some(a => a.slug === activeSlug)) return true
        return c.children?.some(checkChild) ?? false
      })
    : false
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

  // Level-based icon: subjects=BookOpen, subtopics=Layers, articles=FileText
  const LevelIcon = node.level <= 1 ? BookOpen : node.level === 2 ? Layers : FileText

  return (
    <>
      {/* Node row */}
      <div
        className={cn(
          'group flex items-center min-w-0',
          node.level <= 1 && 'mt-2 first:mt-0',
          node.level === 2 && 'mt-1 first:mt-0',
        )}
        style={{ paddingLeft: `${indent}px` }}
      >
        {/* Expand/collapse chevron (subjects + subtopics) or leaf dot (articles) */}
        {isExpandable ? (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleToggle}
            className={cn(
              'flex w-5 shrink-0 items-center justify-center text-[#1A2332] transition-colors duration-150',
              'hover:text-foreground',
              node.level <= 1 ? 'h-8' : 'h-5',
            )}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <ChevronRight
              className={cn(
                'h-3 w-3 transition-transform duration-150',
                isExpanded && 'rotate-90',
              )}
            />
          </button>
        ) : (
          <span className={cn('flex w-5 shrink-0 items-center justify-center', node.level <= 1 ? 'h-8' : 'h-5')}>
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                isActive ? 'bg-primary' : 'bg-border',
              )}
            />
          </span>
        )}

        {/* Level icon */}
        <LevelIcon
          className={cn(
            'h-3.5 w-3.5 shrink-0 mr-2 transition-colors duration-150',
            isActive || isChildActive ? 'text-primary' : isDimmed ? 'text-[#4A5568]' : 'text-[#1A2332]',
          )}
        />

        {/* Node name (link) — numbers stripped, shown on right instead */}
        <Link
          href={nodeHref}
          onClick={(e) => handleClick(e, nodeHref)}
          className={cn(
            'flex-1 truncate transition-colors duration-150 min-w-0',
            node.level <= 1
              ? 'text-xs font-semibold py-1.5'
              : isLeaf
                ? 'text-xs font-medium py-px'
                : 'text-xs font-semibold py-px',
            isActive || isChildActive
              ? 'text-primary'
              : isDimmed
                ? 'text-[#4A5568]'
                : 'text-[#1A2332] hover:text-primary',
          )}
        >
          {displayName(node)}
        </Link>

        {/* Right-aligned sort order number in DM Mono */}
        {orderLabel && (
          <span
            className={cn(
              'ml-auto shrink-0 pl-2 font-[family-name:var(--font-dm-mono)] text-[11px] tabular-nums',
              isActive || isChildActive ? 'text-primary' : 'text-[#4A5568]',
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
            'border-l transition-colors duration-150 space-y-0.5',
            isActive || isChildActive ? 'border-primary/30' : 'border-border/60',
          )}
          style={{ marginLeft: `${indent + 22}px` }}
        >
          {/* Child nodes */}
          {visibleChildren.map((child, i) => (
            <TreeBranch
              key={child.node_id}
              node={child}
              depth={0}
              expanded={expanded}
              onToggle={onToggle}
              activeSlug={activeSlug}
              basePath={basePath}
              onNavigate={onNavigate}
              showCounts={showCounts}
              dimInactive={dimInactive}
              matchSet={matchSet}
              siblingIndex={i}
            />
          ))}

          {/* Article links */}
          {visibleArticles.map((art) => {
            const artHref = `${basePath}/${art.slug}`
            const isArtActive = activeSlug === art.slug

            return (
              <div key={art.article_id} className="flex items-center min-w-0">
                <span className="flex h-5 w-5 shrink-0 items-center justify-center">
                  <FileText
                    className={cn(
                      'h-3 w-3 transition-colors duration-150',
                      isArtActive ? 'text-primary' : 'text-[#1A2332]',
                    )}
                  />
                </span>
                <Link
                  href={artHref}
                  onClick={(e) => handleClick(e, artHref)}
                  className={cn(
                    'flex-1 truncate py-0.5 text-xs font-medium transition-colors duration-150 min-w-0',
                    isArtActive
                      ? 'text-primary font-medium'
                      : isDimmed
                        ? 'text-[#4A5568]'
                        : 'text-[#1A2332] hover:text-primary',
                  )}
                >
                  {art.title}
                </Link>
              </div>
            )
          })}
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
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set())
  const [searchQuery, setSearchQuery] = React.useState('')

  const totalNodes = React.useMemo(() => countNodes(nodes), [nodes])
  const shouldShowSearch = showSearch ?? totalNodes > 10

  const matchSet = React.useMemo(
    () => filterNodes(nodes, searchQuery),
    [nodes, searchQuery],
  )

  // Auto-expand matching nodes during search
  React.useEffect(() => {
    if (!matchSet || matchSet.size === 0) return
    setExpanded(prev => {
      const next = new Set(prev)
      for (const id of matchSet) next.add(id)
      return next
    })
  }, [matchSet])

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
    <div className={cn('flex flex-col transition-opacity duration-200', className)}>
      {shouldShowSearch && (
        <div className="border-b border-border p-1 pb-2">
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Filter topics..."
            size="sm"
            debounceMs={150}
          />
        </div>
      )}

      {isEmpty ? (
        <div className="px-3 py-8 text-center text-sm text-muted-foreground">
          No taxonomy data
        </div>
      ) : noResults ? (
        <div className="px-3 py-8 text-center text-sm text-muted-foreground">
          No matching topics
        </div>
      ) : (
        <nav className="overflow-y-auto p-1 space-y-0.5" aria-label="Taxonomy navigation">
          {visibleRoots.map((node, i) => (
            <TreeBranch
              key={node.node_id}
              node={node}
              depth={0}
              expanded={expanded}
              onToggle={onToggle}
              activeSlug={activeSlug}
              basePath={basePath}
              onNavigate={onNavigate}
              showCounts={showCounts}
              dimInactive={dimInactive}
              matchSet={matchSet}
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

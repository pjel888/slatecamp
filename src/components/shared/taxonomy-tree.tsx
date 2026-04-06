'use client'

import * as React from 'react'
import Link from 'next/link'
import { CaretRight, FileText, BookOpen, Stack, ArrowsIn, ArrowsOut, ListBullets, Question } from '@phosphor-icons/react/dist/ssr'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'
import { SCIcon } from '@/components/graphics/icons/Icon'
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
  articles?: Array<{ article_id: string; title: string; slug: string; question_count?: number }>
}

interface TaxonomyTreeProps {
  nodes: TaxonomyTreeNode[]
  /** Currently active slug (highlights the matching node/article) */
  activeSlug?: string
  /** Currently active node_id (highlights the matching node) */
  activeNodeId?: string | null
  /** Base path for links. Default: '/dashboard/wiki' */
  basePath?: string
  /** Called on navigation instead of default Link behavior */
  onNavigate?: (href: string) => void
  /** Called when a node is selected (e.g. for admin selection) */
  onSelect?: (id: string, name: string, node: TaxonomyTreeNode) => void
  /** Called when a node expansion state changes */
  onExpandToggle?: (id: string, expanded: boolean) => void
  /** Show article/question counts right-aligned. Default: true */
  showCounts?: boolean
  /** Show search filter. Default: true when > 10 nodes */
  showSearch?: boolean
  /** Dim non-active items when an article is active */
  dimInactive?: boolean
  /** Right-aligned content renderer for rows. If provided, replaces default counts. */
  renderRight?: (node: TaxonomyTreeNode, index?: number) => React.ReactNode
  /** Special "Root" action (e.g. "All Questions") */
  rootAction?: {
    label: string
    icon?: PhosphorIcon
    onClick: () => void
    isActive?: boolean
  }
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Strip leading "NN — " prefix from node name for display */
const displayName = (name: string): string => {
  return name.replace(/^\d{1,2}\s*[—–-]\s*/, '')
}

/** Extract the sort order number for right-aligned display */
const sortLabel = (node: TaxonomyTreeNode, index?: number): string | null => {
  const order = node.sort_order ?? (index != null ? index + 1 : null)
  if (order != null) return String(order).padStart(2, '0')
  const match = node.name.match(/^(\d{1,2})\s*[—–-]/)
  if (match) return match[1].padStart(2, '0')
  return null
}

/** Walk tree to find ancestor node_ids for a given slug */
const findAncestorIds = (nodes: TaxonomyTreeNode[], slug: string): string[] => {
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

/** Highlight matched substrings in search results. */
const HighlightMatch = React.memo(({ text, query }: { text: string; query: string }) => {
  if (!query || query.length < 2) return <>{text}</>
  
  const parts = React.useMemo(() => {
    try {
      const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
      return text.split(new RegExp(`(${escaped})`, 'gi'))
    } catch (e) {
      return [text]
    }
  }, [text, query])

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
})
HighlightMatch.displayName = 'HighlightMatch'

/** Count all nodes in tree */
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

/** Filter logic */
const filterNodes = (nodes: TaxonomyTreeNode[], query: string): Set<string> | null => {
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
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface TaxonomyTreeContextValue {
  expanded: Set<string>
  onToggle: (id: string) => void
  activeSlug?: string
  activeNodeId?: string | null
  activeAncestors: Set<string> | null
  basePath: string
  onNavigate?: (href: string) => void
  onSelect?: (id: string, name: string, node: TaxonomyTreeNode) => void
  showCounts: boolean
  dimInactive: boolean
  matchSet: Set<string> | null
  searchQuery: string
  renderRight?: (node: TaxonomyTreeNode, index?: number) => React.ReactNode
}

const TaxonomyTreeContext = React.createContext<TaxonomyTreeContextValue | null>(null)

function useTaxonomyTree() {
  const context = React.useContext(TaxonomyTreeContext)
  if (!context) throw new Error('useTaxonomyTree must be used within a TaxonomyTreeProvider')
  return context
}

/* ------------------------------------------------------------------ */
/*  TreeRow (Unified row renderer for nodes and articles)              */
/* ------------------------------------------------------------------ */

interface TreeRowProps {
  id: string
  label: string
  href: string
  isActive: boolean
  isDimmed: boolean
  isChildActive?: boolean
  level: number
  isExpandable?: boolean
  isExpanded?: boolean
  onToggle?: () => void
  orderLabel?: string | null
  rawNode?: TaxonomyTreeNode // Optional, used for onSelect
  isArticle?: boolean
}

const TreeRow = React.memo(({
  id,
  label,
  href,
  isActive,
  isDimmed,
  isChildActive,
  level,
  isExpandable,
  isExpanded,
  onToggle,
  orderLabel,
  rawNode,
  isArticle = false,
}: TreeRowProps) => {
  const { onNavigate, onSelect, searchQuery, renderRight, showCounts } = useTaxonomyTree()
  
  const handleClick = (e: React.MouseEvent) => {
    // Branch A: structural node click in Admin/Filter mode
    if (onSelect && rawNode) {
      e.preventDefault()
      onSelect(id, label, rawNode)
      return
    }
    // Branch B: structural node click in Navigation mode
    if (isExpandable) {
      e.preventDefault()
      onToggle?.()
      return
    }
    // Branch C: leaf/article node — trigger navigation
    if (onNavigate) {
      e.preventDefault()
      onNavigate(href)
    }
  }

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    onToggle?.()
  }

  // Level-based icon: level 1=BookOpen, level 2=Stack, level 3+=FileText
  const LevelIcon = isArticle ? FileText : level <= 1 ? BookOpen : level === 2 ? Stack : FileText

  const InnerContent = (
    <>
      {/* Expand/collapse chevron or spacer */}
      {isExpandable ? (
        <button
          type="button"
          tabIndex={-1}
          onClick={handleToggle}
          className={cn(
            'flex w-5 shrink-0 items-center justify-center transition-colors duration-200',
            'hover:text-foreground cursor-pointer',
            isActive || isChildActive ? 'text-primary' : 'text-text-tertiary group-hover/tree:text-text-secondary',
            level <= 1 ? 'h-8' : 'h-6',
          )}
          aria-label={isExpanded ? 'Collapse' : 'Expand'}
        >
          <CaretRight
            className={cn(
              'h-3 w-3 transition-transform duration-200',
              isExpanded && 'rotate-90',
            )}
          />
        </button>
      ) : (
        <span className={cn('flex w-5 shrink-0 items-center justify-center', level <= 1 ? 'h-8' : 'h-6')} />
      )}

      {/* Level icon */}
      <LevelIcon
        className={cn(
          'h-3.5 w-3.5 shrink-0 mr-2 transition-colors duration-200',
          isActive || isChildActive ? 'text-primary' : 'text-text-tertiary group-hover/tree:text-text-secondary',
        )}
      />

      {/* Label */}
      <span
        className={cn(
          'flex-1 truncate transition-colors duration-200 min-w-0',
          level <= 1
            ? 'text-[13px] font-semibold py-1.5'
            : level >= 3
              ? 'text-xs font-normal py-px'
              : 'text-[12.5px] font-medium py-px',
          isActive || isChildActive
            ? 'text-primary'
            : 'text-text-tertiary group-hover/tree:text-text-secondary group-hover:text-primary',
        )}
      >
        <HighlightMatch text={label} query={searchQuery} />
      </span>

      {/* Right-aligned custom content or sort order */}
      <div className="ml-auto flex items-center gap-1.5 pl-2">
        {renderRight && rawNode ? (
          renderRight(rawNode)
        ) : showCounts && rawNode ? (
          <>
            {rawNode.question_count !== undefined && rawNode.question_count > 0 && (
              <span className="flex items-center gap-0.5 text-[10px] px-1.5 py-0.5 rounded-md bg-zinc-100 text-zinc-500 font-medium">
                <Question size={10} weight="bold" />
                {rawNode.question_count}
              </span>
            )}
            {orderLabel && (
              <span
                className={cn(
                  'font-[family-name:var(--font-dm-mono)] text-[10px] tabular-nums tracking-widest transition-colors duration-200',
                  isActive || isChildActive ? 'text-primary opacity-60' : 'text-text-tertiary opacity-40 group-hover/tree:opacity-60 group-hover/tree:text-text-secondary',
                )}
              >
                {orderLabel}
              </span>
            )}
          </>
        ) : null}
      </div>
    </>
  )

  const rowClasses = cn(
    'group flex items-center min-w-0 transition-all duration-200 rounded-sm px-1 cursor-pointer',
    level <= 1 && 'mt-2 first:mt-0',
    level === 2 && 'mt-3 first:mt-0',
    // Background logic: primary highlight for active, subtle gray for hover
    isActive ? 'bg-primary/10' : 'hover:bg-muted/60',
    // Inactive logic: 75% opacity and grayed unless tree is hovered OR part of active path
    !isActive && !isChildActive && 'opacity-75 grayscale-[0.4] group-hover/tree:opacity-100 group-hover/tree:grayscale-0',
  )

  // Use <div> for everything when onSelect is provided or for structural nodes
  if (onSelect || isExpandable) {
    return (
      <div className={rowClasses} onClick={handleClick}>
        {InnerContent}
      </div>
    )
  }

  return (
    <Link
      href={href}
      onClick={handleClick}
      className={rowClasses}
    >
      {InnerContent}
    </Link>
  )
})
TreeRow.displayName = 'TreeRow'

/* ------------------------------------------------------------------ */
/*  TreeBranch (recursive node renderer)                               */
/* ------------------------------------------------------------------ */

interface TreeBranchProps {
  node: TaxonomyTreeNode
  siblingIndex?: number
}

const TreeBranch = React.memo(({
  node,
  siblingIndex,
}: TreeBranchProps) => {
  const {
    expanded,
    onToggle,
    activeSlug,
    activeNodeId,
    activeAncestors,
    basePath,
    dimInactive,
    matchSet,
  } = useTaxonomyTree()

  const hasChildren = (node.children?.length ?? 0) > 0
  const hasArticles = (node.articles?.length ?? 0) > 0
  
  const isArticleNode = node.level >= 3
  const isExpandable = !isArticleNode && (hasChildren || hasArticles || node.level <= 2)
  const isExpanded = matchSet ? matchSet.has(node.node_id) : expanded.has(node.node_id)
  
  const nodeSlug = node.slug ?? ''
  const effectiveSlug = nodeSlug || (isArticleNode && node.articles?.length ? node.articles[0].slug : '')
    
  const isActive = activeNodeId 
    ? activeNodeId === node.node_id
    : activeSlug
      ? (effectiveSlug === activeSlug || node.articles?.some(a => a.slug === activeSlug))
      : false
    
  const isChildActive = activeAncestors?.has(node.node_id) ?? false
  const isDimmed = dimInactive && (activeSlug || activeNodeId) && !isActive && !isChildActive

  const orderLabel = React.useMemo(() => sortLabel(node, siblingIndex), [node, siblingIndex])
  const label = React.useMemo(() => displayName(node.name), [node.name])

  const visibleChildren = React.useMemo(() => {
    if (!matchSet) return node.children ?? []
    return (node.children ?? []).filter(c => matchSet.has(c.node_id))
  }, [node.children, matchSet])

  const visibleArticles = React.useMemo(() => {
    if (!matchSet) return node.articles ?? []
    return matchSet.has(node.node_id) ? node.articles ?? [] : []
  }, [node.articles, matchSet, node.node_id])

  return (
    <>
      <TreeRow
        id={node.node_id}
        label={label}
        href={`${basePath}/${effectiveSlug}`}
        isActive={isActive}
        isDimmed={isDimmed}
        isChildActive={isChildActive}
        level={node.level}
        isExpandable={isExpandable}
        isExpanded={isExpanded}
        onToggle={() => onToggle(node.node_id)}
        orderLabel={orderLabel}
        rawNode={node}
      />

      {isExpanded && isExpandable && (
        <div
          className={cn(
            'border-l transition-all duration-300 space-y-2 mt-2 mb-2',
            isActive || isChildActive ? 'border-primary/40 shadow-[inset_1px_0_0_rgba(27,63,196,0.1)]' : 'border-border/60',
            !isActive && !isChildActive && 'opacity-70 group-hover/tree:opacity-100',
          )}
          style={{ marginLeft: '10px' }}
        >
          <div style={{ marginLeft: '12px' }}>
            {/* Child nodes */}
            {visibleChildren.map((child, i) => (
              <TreeBranch
                key={child.node_id}
                node={child}
                siblingIndex={i}
              />
            ))}

            {/* Direct articles (linked to this node) */}
            {visibleArticles.map((art) => (
              <TreeRow
                key={art.article_id}
                id={art.article_id}
                label={art.title}
                href={`${basePath}/${art.slug}`}
                isActive={activeSlug === art.slug || activeNodeId === art.article_id}
                isDimmed={dimInactive && (!!activeSlug || !!activeNodeId) && activeSlug !== art.slug && activeNodeId !== art.article_id}
                isChildActive={false}
                level={3} 
                isArticle={true}
                rawNode={{ 
                  node_id: `article:${art.article_id}`, 
                  name: art.title, 
                  level: 3, 
                  question_count: art.question_count 
                } as any}
              />
            ))}
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
  activeNodeId,
  basePath = '/dashboard/wiki',
  onNavigate,
  onSelect,
  onExpandToggle,
  showCounts = true,
  showSearch,
  dimInactive = false,
  renderRight,
  rootAction,
  className,
}: TaxonomyTreeProps) => {
  const [expanded, setExpanded] = React.useState<Set<string>>(() => {
    if (!activeSlug && !activeNodeId) return new Set()
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

  const matchSet = React.useMemo(() => filterNodes(nodes, deferredQuery), [nodes, deferredQuery])
  
  const activeAncestors = React.useMemo(() => {
    if (!activeSlug && !activeNodeId) return null
    return new Set(findAncestorIds(nodes, activeSlug ?? ''))
  }, [activeSlug, activeNodeId, nodes])

  React.useEffect(() => {
    if ((!activeSlug && !activeNodeId) || nodes.length === 0) return
    const ancestors = findAncestorIds(nodes, activeSlug ?? '')
    if (ancestors.length === 0) return
    setExpanded(prev => {
      const next = new Set(prev)
      let changed = false
      for (const id of ancestors) {
        if (!next.has(id)) { next.add(id); changed = true }
      }
      return changed ? next : prev
    })
  }, [activeSlug, activeNodeId, nodes])

  React.useEffect(() => {
    if (expanded.size === 0) return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...expanded]))
    } catch { /* ignore */ }
  }, [expanded])

  const onToggle = React.useCallback((id: string) => {
    let isNowExpanded = false
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
        isNowExpanded = false
      } else {
        next.add(id)
        isNowExpanded = true
      }
      return next
    })
    if (onExpandToggle) onExpandToggle(id, isNowExpanded)
  }, [onExpandToggle])

  const contextValue = React.useMemo(() => ({
    expanded,
    onToggle,
    activeSlug,
    activeNodeId,
    activeAncestors,
    basePath,
    onNavigate,
    onSelect,
    showCounts,
    dimInactive,
    matchSet,
    searchQuery: deferredQuery,
    renderRight,
  }), [expanded, onToggle, activeSlug, activeNodeId, activeAncestors, basePath, onNavigate, onSelect, showCounts, dimInactive, matchSet, deferredQuery, renderRight])

  const visibleRoots = matchSet ? nodes.filter(n => matchSet.has(n.node_id)) : nodes
  const isEmpty = nodes.length === 0
  const noResults = matchSet !== null && visibleRoots.length === 0

  return (
    <TaxonomyTreeContext.Provider value={contextValue}>
      <div className={cn('group/tree flex flex-col transition-opacity duration-200 ease-out', className)}>
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
              <button onClick={handleExpandAll} className="p-1 rounded-sm hover:bg-muted text-text-tertiary hover:text-primary transition-colors cursor-pointer" title="Expand All">
                <ArrowsOut size={16} weight="bold" className="w-4 h-4" />
              </button>
              <button onClick={handleCollapseAll} className="p-1 rounded-sm hover:bg-muted text-text-tertiary hover:text-primary transition-colors cursor-pointer" title="Collapse All">
                <ArrowsIn size={16} weight="bold" className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {isEmpty ? (
          <div className="px-3 py-8 text-center text-sm text-muted-foreground">No taxonomy data</div>
        ) : noResults ? (
          <div className="px-3 py-6 text-center">
            <p className="text-sm text-muted-foreground">
              No topics match &ldquo;<span className="font-medium text-text-secondary">{deferredQuery}</span>&rdquo;
            </p>
          </div>
        ) : (
          <nav className="overflow-y-auto p-1 py-3 space-y-0.5" aria-label="Taxonomy navigation">
            {rootAction && (
              <button
                type="button"
                onClick={rootAction.onClick}
                className={cn(
                  'w-full flex items-center gap-1.5 px-3 py-1.5 text-sm cursor-pointer transition-colors duration-150 rounded-sm mb-2',
                  'hover:bg-muted/60',
                  rootAction.isActive && 'bg-primary/10 text-primary',
                )}
              >
                {rootAction.icon ? (
                  <SCIcon icon={rootAction.icon} size="base" className="flex-shrink-0" />
                ) : (
                  <ListBullets size={16} className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="font-medium">{rootAction.label}</span>
              </button>
            )}
            {visibleRoots.map((node, i) => (
              <TreeBranch key={node.node_id} node={node} siblingIndex={i} />
            ))}
          </nav>
        )}
      </div>
    </TaxonomyTreeContext.Provider>
  )
}

export { TaxonomyTree }
export type { TaxonomyTreeNode, TaxonomyTreeProps }

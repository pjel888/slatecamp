'use client'

import * as React from 'react'
import { CaretRight, Check, TreeStructure } from '@phosphor-icons/react'

import { cn } from '@/lib/utils'
import { SearchInput } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/shared/empty-state'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface TaxonomyPickerNode {
  node_id: string
  ale_id?: string
  name: string
  level: number
  parent_id?: string | null
  children?: TaxonomyPickerNode[]
  article_count?: number
  question_count?: number
}

interface TaxonomyPickerProps {
  variant: 'dropdown' | 'sidebar' | 'inline'
  mode: 'single' | 'multi'
  nodes: TaxonomyPickerNode[]
  value?: string | string[]
  onChange: (value: string | string[]) => void
  showCounts?: boolean
  showAleId?: boolean
  showStatusBadges?: boolean
  placeholder?: string
  disabled?: boolean
  className?: string
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Build a flat ordered list of visible node IDs for keyboard navigation */
const buildVisibleList = (
  nodes: TaxonomyPickerNode[],
  expanded: Set<string>,
  matchSet: Set<string> | null,
): string[] => {
  const result: string[] = []
  const walk = (list: TaxonomyPickerNode[]) => {
    for (const node of list) {
      if (matchSet && !matchSet.has(node.node_id)) continue
      result.push(node.node_id)
      if (node.children?.length && expanded.has(node.node_id)) {
        walk(node.children)
      }
    }
  }
  walk(nodes)
  return result
}

/** Find a node by ID in the tree */
const findNode = (
  nodes: TaxonomyPickerNode[],
  id: string,
): TaxonomyPickerNode | null => {
  for (const node of nodes) {
    if (node.node_id === id) return node
    if (node.children?.length) {
      const found = findNode(node.children, id)
      if (found) return found
    }
  }
  return null
}

/** Build a map from node_id to parent node_id */
const buildParentMap = (
  nodes: TaxonomyPickerNode[],
  map: Map<string, string> = new Map(),
): Map<string, string> => {
  for (const node of nodes) {
    if (node.children?.length) {
      for (const child of node.children) {
        map.set(child.node_id, node.node_id)
      }
      buildParentMap(node.children, map)
    }
  }
  return map
}

/** Collect all ancestor IDs for a set of node IDs */
const collectAncestors = (
  nodeIds: Set<string>,
  parentMap: Map<string, string>,
): Set<string> => {
  const ancestors = new Set<string>()
  for (const id of nodeIds) {
    let current = parentMap.get(id)
    while (current) {
      ancestors.add(current)
      current = parentMap.get(current)
    }
  }
  return ancestors
}

/**
 * Filter tree: a node is visible if it matches the query OR any descendant matches.
 * Returns a Set of all visible node IDs.
 */
const filterTree = (
  nodes: TaxonomyPickerNode[],
  query: string,
  parentMap: Map<string, string>,
): Set<string> | null => {
  if (!query.trim()) return null
  const q = query.toLowerCase()
  const directMatches = new Set<string>()

  const walk = (list: TaxonomyPickerNode[]) => {
    for (const node of list) {
      const nameMatch = node.name.toLowerCase().includes(q)
      const aleMatch = node.ale_id?.toLowerCase().includes(q) ?? false
      if (nameMatch || aleMatch) {
        directMatches.add(node.node_id)
      }
      if (node.children?.length) walk(node.children)
    }
  }
  walk(nodes)

  if (directMatches.size === 0) return new Set()

  const ancestors = collectAncestors(directMatches, parentMap)
  // Visible = direct matches + all their ancestors
  return new Set([...directMatches, ...ancestors])
}

/* ------------------------------------------------------------------ */
/*  TreeNode                                                           */
/* ------------------------------------------------------------------ */

interface TreeNodeProps {
  node: TaxonomyPickerNode
  level: number
  expanded: Set<string>
  onToggleExpand: (id: string) => void
  selected: Set<string>
  onSelect: (id: string) => void
  mode: 'single' | 'multi'
  showCounts: boolean
  showAleId: boolean
  focusedId: string | null
  matchSet: Set<string> | null
  onFocusNode: (id: string) => void
  nodeRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
}

const TreeNode = React.memo(({
  node,
  level,
  expanded,
  onToggleExpand,
  selected,
  onSelect,
  mode,
  showCounts,
  showAleId,
  focusedId,
  matchSet,
  onFocusNode,
  nodeRefs,
}: TreeNodeProps) => {
  const hasChildren = (node.children?.length ?? 0) > 0
  const isExpanded = expanded.has(node.node_id)
  const isSelected = selected.has(node.node_id)
  const isFocused = focusedId === node.node_id
  const isLeaf = !hasChildren
  const isL0 = level === 0

  const setRef = React.useCallback(
    (el: HTMLDivElement | null) => {
      if (el) {
        nodeRefs.current.set(node.node_id, el)
      } else {
        nodeRefs.current.delete(node.node_id)
      }
    },
    [node.node_id, nodeRefs],
  )

  const handleClick = React.useCallback(() => {
    onSelect(node.node_id)
    onFocusNode(node.node_id)
  }, [node.node_id, onSelect, onFocusNode])

  const handleChevronClick = React.useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      onToggleExpand(node.node_id)
    },
    [node.node_id, onToggleExpand],
  )

  // Level-specific padding: 16px per level (matching visual spec)
  const paddingLeft = level * 16

  // Level-specific vertical padding: L0=5px, L1=4px, L2=3px
  const verticalPadding = isL0 ? 'py-[5px]' : isLeaf ? 'py-[3px]' : 'py-1'

  // Level-specific font size: L0=12px/500, L1=12px, L2=11px
  const fontSize = isLeaf ? 'text-[11px]' : 'text-xs'
  const fontWeight = isL0 && !isSelected ? 'font-medium' : ''

  // Extract ALE ID suffix for compact display (e.g., "ALE-HIST-001-06" → "001-06")
  const aleIdSuffix = React.useMemo(() => {
    if (!node.ale_id) return null
    const parts = node.ale_id.split('-')
    // Show last 2 segments for leaf nodes, last 1 for others
    if (isLeaf && parts.length >= 4) return parts.slice(-2).join('-')
    if (parts.length >= 3) return parts.slice(-1)[0]
    return node.ale_id
  }, [node.ale_id, isLeaf])

  return (
    <>
      <div
        ref={setRef}
        role="treeitem"
        aria-expanded={hasChildren ? isExpanded : undefined}
        aria-selected={isSelected}
        aria-level={level + 1}
        tabIndex={isFocused ? 0 : -1}
        data-node-id={node.node_id}
        className={cn(
          'flex items-center gap-1.5 px-1.5 cursor-pointer transition-colors duration-100',
          'outline-none',
          verticalPadding,
          // Hover for L0
          isL0 && !isSelected && 'hover:bg-muted',
          // Selected state
          isSelected && 'bg-primary/10 text-primary font-medium',
          // Hover (non-selected)
          !isSelected && !isL0 && 'hover:bg-muted',
          // Focus ring
          isFocused && !isSelected && 'ring-1 ring-primary/30',
          isFocused && isSelected && 'ring-1 ring-primary/50',
        )}
        style={{ paddingLeft: `${paddingLeft + 6}px` }}
        onClick={handleClick}
      >
        {/* Chevron for parent nodes / Dot for leaf nodes */}
        {hasChildren ? (
          <button
            type="button"
            tabIndex={-1}
            className="flex shrink-0 items-center justify-center rounded-sm p-0.5 text-muted-foreground transition-colors duration-100 hover:text-foreground"
            onClick={handleChevronClick}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <CaretRight
              className={cn(
                'h-2.5 w-2.5 transition-transform duration-150',
                isExpanded && 'rotate-90',
              )}
            />
          </button>
        ) : (
          /* Leaf dot indicator: 6px circle */
          <span
            className={cn(
              'h-1.5 w-1.5 shrink-0 rounded-full',
              isSelected ? 'bg-primary' : 'bg-border',
            )}
          />
        )}

        {/* Checkbox (multi mode) */}
        {mode === 'multi' && (
          <span
            className={cn(
              'flex h-4 w-4 shrink-0 items-center justify-center rounded-sm border transition-colors duration-100',
              isSelected
                ? 'border-primary bg-primary text-primary-foreground'
                : 'border-input bg-card',
            )}
          >
            {isSelected && <Check className="h-3 w-3" />}
          </span>
        )}

        {/* Node name — level-specific sizing */}
        <span className={cn('min-w-0 truncate', fontSize, fontWeight)}>
          {node.name}
        </span>

        {/* Right-aligned: counts and/or ALE ID suffix in DM Mono */}
        <span className="ml-auto flex shrink-0 items-center gap-0.5 font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground">
          {showCounts && (node.article_count || node.question_count) ? (
            <>
              {node.article_count != null && node.article_count > 0 && (
                <span>{node.article_count}a</span>
              )}
              {node.article_count != null && node.article_count > 0 &&
                node.question_count != null && node.question_count > 0 && (
                <span className="mx-0.5">·</span>
              )}
              {node.question_count != null && node.question_count > 0 && (
                <span>{node.question_count}q</span>
              )}
            </>
          ) : showAleId && aleIdSuffix ? (
            <span className={cn(isSelected && 'text-primary')}>
              {aleIdSuffix}
            </span>
          ) : null}
        </span>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div role="group">
          {node.children!.map((child) => {
            if (matchSet && !matchSet.has(child.node_id)) return null
            return (
              <TreeNode
                key={child.node_id}
                node={child}
                level={level + 1}
                expanded={expanded}
                onToggleExpand={onToggleExpand}
                selected={selected}
                onSelect={onSelect}
                mode={mode}
                showCounts={showCounts}
                showAleId={showAleId}
                focusedId={focusedId}
                matchSet={matchSet}
                onFocusNode={onFocusNode}
                nodeRefs={nodeRefs}
              />
            )
          })}
        </div>
      )}
    </>
  )
})
TreeNode.displayName = 'TreeNode'

/* ------------------------------------------------------------------ */
/*  Tree Skeleton                                                      */
/* ------------------------------------------------------------------ */

const TreeSkeleton = () => (
  <div className="space-y-0.5 p-2">
    {/* L0 */}
    <div className="flex items-center gap-1.5 rounded-md bg-muted py-[5px] px-1.5" style={{ paddingLeft: '6px' }}>
      <Skeleton className="h-2.5 w-2.5 shrink-0" />
      <Skeleton className="h-3 w-36" />
      <Skeleton className="ml-auto h-2.5 w-12" />
    </div>
    {/* L1 */}
    <div className="flex items-center gap-1.5 py-1 px-1.5" style={{ paddingLeft: '22px' }}>
      <Skeleton className="h-2.5 w-2.5 shrink-0" />
      <Skeleton className="h-3 w-28" />
      <Skeleton className="ml-auto h-2.5 w-6" />
    </div>
    {/* L2 leaves */}
    {[24, 20, 28].map((w, i) => (
      <div key={i} className="flex items-center gap-1.5 py-[3px] px-1.5" style={{ paddingLeft: '38px' }}>
        <Skeleton className="h-1.5 w-1.5 shrink-0 rounded-full" />
        <Skeleton className={`h-3 w-${w}`} />
        <Skeleton className="ml-auto h-2.5 w-8" />
      </div>
    ))}
    {/* L1 collapsed */}
    <div className="flex items-center gap-1.5 py-1 px-1.5" style={{ paddingLeft: '22px' }}>
      <Skeleton className="h-2.5 w-2.5 shrink-0" />
      <Skeleton className="h-3 w-32" />
      <Skeleton className="ml-auto h-2.5 w-6" />
    </div>
  </div>
)

/* ------------------------------------------------------------------ */
/*  TreeContent (shared tree body for all variants)                    */
/* ------------------------------------------------------------------ */

interface TreeContentProps {
  nodes: TaxonomyPickerNode[]
  mode: 'single' | 'multi'
  expanded: Set<string>
  onToggleExpand: (id: string) => void
  selected: Set<string>
  onSelect: (id: string) => void
  showCounts: boolean
  showAleId: boolean
  searchQuery: string
  onSearchChange: (q: string) => void
  focusedId: string | null
  matchSet: Set<string> | null
  onFocusNode: (id: string) => void
  onKeyDown: (e: React.KeyboardEvent) => void
  nodeRefs: React.MutableRefObject<Map<string, HTMLDivElement>>
  treeRef: React.RefObject<HTMLDivElement | null>
  showSearch?: boolean
}

const TreeContent = ({
  nodes,
  mode,
  expanded,
  onToggleExpand,
  selected,
  onSelect,
  showCounts,
  showAleId,
  searchQuery,
  onSearchChange,
  focusedId,
  matchSet,
  onFocusNode,
  onKeyDown,
  nodeRefs,
  treeRef,
  showSearch = true,
}: TreeContentProps) => {
  const visibleRoots = matchSet
    ? nodes.filter((n) => matchSet.has(n.node_id))
    : nodes

  const isEmpty = nodes.length === 0
  const noResults = matchSet !== null && visibleRoots.length === 0

  return (
    <>
      {showSearch && (
        <div className="border-b border-border px-3 py-3">
          <SearchInput
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Filter nodes..."
            size="sm"
            debounceMs={150}
          />
        </div>
      )}

      {isEmpty ? (
        <EmptyState
          icon={<TreeStructure size={20} />}
          message="No taxonomy data available"
          className="py-8"
        />
      ) : noResults ? (
        <div className="px-3 py-8 text-center text-sm text-muted-foreground">
          No matching nodes
        </div>
      ) : (
        <div
          ref={treeRef}
          role="tree"
          aria-label="Taxonomy tree"
          aria-multiselectable={mode === 'multi'}
          onKeyDown={onKeyDown}
          className="overflow-auto px-3 py-3"
        >
          {visibleRoots.map((node) => (
            <TreeNode
              key={node.node_id}
              node={node}
              level={0}
              expanded={expanded}
              onToggleExpand={onToggleExpand}
              selected={selected}
              onSelect={onSelect}
              mode={mode}
              showCounts={showCounts}
              showAleId={showAleId}
              focusedId={focusedId}
              matchSet={matchSet}
              onFocusNode={onFocusNode}
              nodeRefs={nodeRefs}
            />
          ))}
        </div>
      )}
    </>
  )
}

/* ------------------------------------------------------------------ */
/*  TaxonomyPicker (main export)                                       */
/* ------------------------------------------------------------------ */

const TaxonomyPicker = ({
  variant,
  mode,
  nodes,
  value,
  onChange,
  showCounts = false,
  showAleId = false,
  placeholder = 'Select topic...',
  disabled = false,
  className,
}: TaxonomyPickerProps) => {
  // --- State ---
  const [expanded, setExpanded] = React.useState<Set<string>>(() => new Set())
  const [searchQuery, setSearchQuery] = React.useState('')
  const [focusedId, setFocusedId] = React.useState<string | null>(null)
  const [dropdownOpen, setDropdownOpen] = React.useState(false)

  // --- Refs ---
  const treeRef = React.useRef<HTMLDivElement>(null)
  const nodeRefs = React.useRef<Map<string, HTMLDivElement>>(new Map())
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const popoverRef = React.useRef<HTMLDivElement>(null)
  const typeAheadBuffer = React.useRef('')
  const typeAheadTimer = React.useRef<ReturnType<typeof setTimeout> | null>(null)

  // --- Derived ---
  const parentMap = React.useMemo(() => buildParentMap(nodes), [nodes])

  const matchSet = React.useMemo(
    () => filterTree(nodes, searchQuery, parentMap),
    [nodes, searchQuery, parentMap],
  )

  // Auto-expand ancestors of matching nodes when searching
  React.useEffect(() => {
    if (!matchSet || matchSet.size === 0) return
    setExpanded((prev) => {
      const next = new Set(prev)
      for (const id of matchSet) {
        // expand all nodes in matchSet that have children
        const node = findNode(nodes, id)
        if (node?.children?.length) {
          next.add(id)
        }
      }
      return next
    })
  }, [matchSet, nodes])

  const selected = React.useMemo<Set<string>>(() => {
    if (!value) return new Set()
    if (Array.isArray(value)) return new Set(value)
    return new Set([value])
  }, [value])

  const visibleList = React.useMemo(
    () => buildVisibleList(nodes, expanded, matchSet),
    [nodes, expanded, matchSet],
  )

  // --- Selected label for dropdown trigger ---
  const selectedLabel = React.useMemo(() => {
    if (mode === 'multi') {
      const count = selected.size
      if (count === 0) return placeholder
      if (count === 1) {
        const node = findNode(nodes, [...selected][0])
        return node?.name ?? placeholder
      }
      return `${count} topics selected`
    }
    if (selected.size === 0) return placeholder
    const node = findNode(nodes, [...selected][0])
    return node?.name ?? placeholder
  }, [mode, selected, nodes, placeholder])

  // --- Handlers ---
  const onToggleExpand = React.useCallback((id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }, [])

  const onSelect = React.useCallback(
    (id: string) => {
      if (mode === 'single') {
        onChange(id)
        if (variant === 'dropdown') {
          setDropdownOpen(false)
        }
      } else {
        const next = new Set(selected)
        if (next.has(id)) {
          next.delete(id)
        } else {
          next.add(id)
        }
        onChange([...next])
      }
    },
    [mode, onChange, selected, variant],
  )

  const onFocusNode = React.useCallback((id: string) => {
    setFocusedId(id)
    const el = nodeRefs.current.get(id)
    if (el) {
      el.scrollIntoView({ block: 'nearest' })
      el.focus({ preventScroll: true })
    }
  }, [])

  // --- Keyboard ---
  const onKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      const currentIdx = focusedId ? visibleList.indexOf(focusedId) : -1

      switch (e.key) {
        case 'ArrowDown': {
          e.preventDefault()
          const nextIdx = currentIdx < visibleList.length - 1 ? currentIdx + 1 : 0
          onFocusNode(visibleList[nextIdx])
          break
        }
        case 'ArrowUp': {
          e.preventDefault()
          const prevIdx = currentIdx > 0 ? currentIdx - 1 : visibleList.length - 1
          onFocusNode(visibleList[prevIdx])
          break
        }
        case 'ArrowRight': {
          e.preventDefault()
          if (!focusedId) break
          const node = findNode(nodes, focusedId)
          if (!node?.children?.length) break
          if (!expanded.has(focusedId)) {
            onToggleExpand(focusedId)
          } else {
            // Move to first visible child
            const firstChild = node.children.find(
              (c) => !matchSet || matchSet.has(c.node_id),
            )
            if (firstChild) onFocusNode(firstChild.node_id)
          }
          break
        }
        case 'ArrowLeft': {
          e.preventDefault()
          if (!focusedId) break
          if (expanded.has(focusedId)) {
            onToggleExpand(focusedId)
          } else {
            // Move to parent
            const parentId = parentMap.get(focusedId)
            if (parentId) onFocusNode(parentId)
          }
          break
        }
        case 'Enter':
        case ' ': {
          e.preventDefault()
          if (focusedId) onSelect(focusedId)
          break
        }
        case 'Escape': {
          if (variant === 'dropdown') {
            e.preventDefault()
            setDropdownOpen(false)
            triggerRef.current?.focus()
          }
          break
        }
        default: {
          // Type-ahead: single printable character
          if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey) {
            typeAheadBuffer.current += e.key.toLowerCase()
            if (typeAheadTimer.current) clearTimeout(typeAheadTimer.current)
            typeAheadTimer.current = setTimeout(() => {
              typeAheadBuffer.current = ''
            }, 500)

            const match = visibleList.find((id) => {
              const node = findNode(nodes, id)
              return node?.name.toLowerCase().startsWith(typeAheadBuffer.current)
            })
            if (match) onFocusNode(match)
          }
        }
      }
    },
    [
      focusedId,
      visibleList,
      nodes,
      expanded,
      matchSet,
      parentMap,
      variant,
      onFocusNode,
      onToggleExpand,
      onSelect,
    ],
  )

  // --- Close dropdown on outside click ---
  React.useEffect(() => {
    if (variant !== 'dropdown' || !dropdownOpen) return

    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as Node
      if (
        triggerRef.current?.contains(target) ||
        popoverRef.current?.contains(target)
      ) {
        return
      }
      setDropdownOpen(false)
    }

    document.addEventListener('mousedown', handleOutsideClick)
    return () => document.removeEventListener('mousedown', handleOutsideClick)
  }, [variant, dropdownOpen])

  // --- Focus first visible node when dropdown opens ---
  React.useEffect(() => {
    if (variant === 'dropdown' && dropdownOpen && visibleList.length > 0) {
      // Focus selected node or first node
      const firstSelected = visibleList.find((id) => selected.has(id))
      const target = firstSelected ?? visibleList[0]
      // Small delay to let popover render
      requestAnimationFrame(() => {
        onFocusNode(target)
      })
    }
  }, [dropdownOpen]) // intentionally limited deps — only on open/close

  // --- Shared tree props ---
  const treeProps = {
    nodes,
    mode,
    expanded,
    onToggleExpand,
    selected,
    onSelect,
    showCounts,
    showAleId,
    searchQuery,
    onSearchChange: setSearchQuery,
    focusedId,
    matchSet,
    onFocusNode,
    onKeyDown,
    nodeRefs,
    treeRef,
  } as const

  // --- Dropdown variant ---
  if (variant === 'dropdown') {
    return (
      <div className={cn('relative', className)}>
        <button
          ref={triggerRef}
          type="button"
          disabled={disabled}
          onClick={() => setDropdownOpen((prev) => !prev)}
          className={cn(
            'flex h-9 w-full items-center justify-between rounded-sm border border-input bg-transparent px-3 text-sm transition-colors',
            'focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 outline-none',
            'disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
            selected.size > 0 ? 'text-foreground' : 'text-muted-foreground',
          )}
          aria-haspopup="tree"
          aria-expanded={dropdownOpen}
        >
          <span className="truncate">{selectedLabel}</span>
          <CaretRight
            className={cn(
              'ml-2 h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-150',
              dropdownOpen && 'rotate-90',
            )}
          />
        </button>

        {dropdownOpen && (
          <div
            ref={popoverRef}
            className="absolute left-0 top-[calc(100%+4px)] z-50 w-full min-w-[240px] rounded-lg border border-border bg-card shadow-md"
          >
            <div className="max-h-80 overflow-auto">
              <TreeContent {...treeProps} />
            </div>
          </div>
        )}
      </div>
    )
  }

  // --- Sidebar variant ---
  if (variant === 'sidebar') {
    return (
      <div
        className={cn(
          'overflow-hidden rounded-md border border-border bg-card',
          disabled && 'pointer-events-none opacity-50',
          className,
        )}
      >
        <div className="max-h-[480px] overflow-auto">
          <TreeContent {...treeProps} />
        </div>
      </div>
    )
  }

  // --- Inline variant ---
  return (
    <div
      className={cn(
        'overflow-auto',
        disabled && 'pointer-events-none opacity-50',
        className,
      )}
    >
      <TreeContent {...treeProps} showSearch={nodes.length > 10} />
    </div>
  )
}

export { TaxonomyPicker, TreeSkeleton as TaxonomyPickerSkeleton }
export type { TaxonomyPickerNode, TaxonomyPickerProps }

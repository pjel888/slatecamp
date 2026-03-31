'use client'

import { useState, useMemo, useCallback } from 'react'
import { CaretRight, ListBullets, FileText } from '@phosphor-icons/react/dist/ssr'
import { SearchInput } from '@/components/ui/input'
import { cn } from '@/lib/utils'

import type { QuestionTreeNode } from '@/lib/actions/admin/question-queries'

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface QuestionTreeNavProps {
  tree: QuestionTreeNode[]
  selectedNodeId: string | null
  onSelectNode: (nodeId: string | null) => void
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Strip leading "NN — " prefix from node name for display */
const displayName = (name: string): string => {
  return name.replace(/^\d{1,2}\s*[—–-]\s*/, '')
}

/** Check if a node or any descendant matches the search query */
const nodeMatchesSearch = (node: QuestionTreeNode, query: string): boolean => {
  const q = query.toLowerCase()
  if (displayName(node.name).toLowerCase().includes(q)) return true
  if (node.articles.some((a) => a.title.toLowerCase().includes(q))) return true
  return node.children.some((child) => nodeMatchesSearch(child, q))
}

/* ------------------------------------------------------------------ */
/*  TreeNode                                                           */
/* ------------------------------------------------------------------ */

const levelIndent: Record<number, string> = {
  1: 'pl-3',
  2: 'pl-6',
  3: 'pl-9',
}

const TreeNodeRow = ({
  node,
  selectedNodeId,
  onSelectNode,
  expandedIds,
  onToggleExpand,
  searchQuery,
}: {
  node: QuestionTreeNode
  selectedNodeId: string | null
  onSelectNode: (nodeId: string | null) => void
  expandedIds: Set<string>
  onToggleExpand: (nodeId: string) => void
  searchQuery: string
}) => {
  const isExpanded = expandedIds.has(node.nodeId)
  const isSelected = selectedNodeId === node.nodeId
  const hasChildren = node.children.length > 0 || node.articles.length > 0

  return (
    <div>
      <button
        type="button"
        onClick={() => {
          onSelectNode(node.nodeId)
          if (hasChildren && !isExpanded) {
            onToggleExpand(node.nodeId)
          }
        }}
        className={cn(
          'w-full flex items-center gap-1.5 pr-3 py-1.5 text-sm cursor-pointer transition-colors duration-150',
          'hover:bg-zinc-50',
          levelIndent[node.level] ?? 'pl-3',
          isSelected && 'bg-[#EEF2FC] text-[#1B3FC4]',
        )}
      >
        {hasChildren ? (
          <span
            onClick={(e) => {
              e.stopPropagation()
              onToggleExpand(node.nodeId)
            }}
            className="flex-shrink-0 p-0.5"
          >
            <CaretRight
              size={12}
              className={cn(
                'text-[#8896A7] transition-transform duration-150',
                isExpanded && 'rotate-90',
              )}
            />
          </span>
        ) : (
          <span className="w-4 flex-shrink-0" />
        )}

        <span
          className={cn(
            'flex-1 min-w-0 truncate text-left',
            node.level === 1 && 'font-semibold text-[#1A2332]',
            node.level === 2 && 'font-medium text-[#1A2332]',
            node.level === 3 && 'text-[#4A5568]',
            isSelected && 'text-[#1B3FC4]',
          )}
        >
          {displayName(node.name)}
        </span>

        {node.questionCount > 0 && (
          <span className="flex-shrink-0 text-[11px] text-[#8896A7] bg-zinc-100 rounded-md px-1.5 py-0.5">
            {node.questionCount}
          </span>
        )}
      </button>

      {isExpanded && (
        <div>
          {node.children.map((child) => (
            <TreeNodeRow
              key={child.nodeId}
              node={child}
              selectedNodeId={selectedNodeId}
              onSelectNode={onSelectNode}
              expandedIds={expandedIds}
              onToggleExpand={onToggleExpand}
              searchQuery={searchQuery}
            />
          ))}
          {node.articles.map((article) => (
            <button
              key={article.articleId}
              type="button"
              onClick={() => onSelectNode(`article:${article.articleId}`)}
              className={cn(
                'w-full flex items-center gap-1.5 pl-9 pr-3 py-1.5 text-sm cursor-pointer transition-colors duration-150',
                'hover:bg-zinc-50',
                node.level === 2 && 'pl-12',
                selectedNodeId === `article:${article.articleId}` && 'bg-[#EEF2FC] text-[#1B3FC4]',
              )}
            >
              <FileText size={12} className="flex-shrink-0 text-[#8896A7]" />
              <span
                className={cn(
                  'flex-1 min-w-0 truncate text-left text-[#4A5568]',
                  selectedNodeId === `article:${article.articleId}` && 'text-[#1B3FC4]',
                )}
              >
                {article.title}
              </span>
              {article.questionCount > 0 && (
                <span className="flex-shrink-0 text-[11px] text-[#8896A7] bg-zinc-100 rounded-md px-1.5 py-0.5">
                  {article.questionCount}
                </span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  QuestionTreeNav                                                    */
/* ------------------------------------------------------------------ */

export const QuestionTreeNav = ({
  tree,
  selectedNodeId,
  onSelectNode,
}: QuestionTreeNavProps) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => {
    // Expand level-1 nodes by default
    return new Set(tree.map((n) => n.nodeId))
  })

  const handleToggleExpand = useCallback((nodeId: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(nodeId)) {
        next.delete(nodeId)
      } else {
        next.add(nodeId)
      }
      return next
    })
  }, [])

  const filteredTree = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return tree
    return tree.filter((node) => nodeMatchesSearch(node, searchQuery))
  }, [tree, searchQuery])

  // When searching, auto-expand all matching nodes
  const effectiveExpanded = useMemo(() => {
    if (!searchQuery || searchQuery.length < 2) return expandedIds
    const ids = new Set<string>()
    const walk = (nodes: QuestionTreeNode[]) => {
      for (const n of nodes) {
        if (nodeMatchesSearch(n, searchQuery)) {
          ids.add(n.nodeId)
          walk(n.children)
        }
      }
    }
    walk(tree)
    return ids
  }, [searchQuery, expandedIds, tree])

  return (
    <div className="w-[300px] shrink-0 border-r border-[#D4DAE3] bg-white flex flex-col overflow-hidden">
      {/* Search */}
      <div className="p-3 border-b border-[#D4DAE3]">
        <SearchInput
          size="sm"
          placeholder="Filter topics..."
          value={searchQuery}
          onChange={(val) => setSearchQuery(val)}
        />
      </div>

      {/* Scrollable tree */}
      <div className="flex-1 overflow-y-auto py-1">
        {/* All Questions option */}
        <button
          type="button"
          onClick={() => onSelectNode(null)}
          className={cn(
            'w-full flex items-center gap-1.5 px-3 py-1.5 text-sm cursor-pointer transition-colors duration-150',
            'hover:bg-zinc-50',
            selectedNodeId === null && 'bg-[#EEF2FC] text-[#1B3FC4]',
          )}
        >
          <ListBullets size={14} className="flex-shrink-0" />
          <span className="font-medium">All Questions</span>
        </button>

        {/* Tree nodes */}
        {filteredTree.map((node) => (
          <TreeNodeRow
            key={node.nodeId}
            node={node}
            selectedNodeId={selectedNodeId}
            onSelectNode={onSelectNode}
            expandedIds={effectiveExpanded}
            onToggleExpand={handleToggleExpand}
            searchQuery={searchQuery}
          />
        ))}

        {filteredTree.length === 0 && searchQuery.length >= 2 && (
          <div className="px-3 py-6 text-center text-sm text-[#8896A7]">
            No matching topics
          </div>
        )}
      </div>
    </div>
  )
}

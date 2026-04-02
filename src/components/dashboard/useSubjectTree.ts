'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { getTaxonomyTree } from '@/lib/actions/taxonomy'
import type { TaxonomyNode } from '@/types/app'

interface UseSubjectTreeOptions {
  disciplineId: string
  initialQuestionCount?: number
}

interface UseSubjectTreeReturn {
  tree: TaxonomyNode[]
  loading: boolean
  expandedNodes: Set<string>
  selectedNodeId: string | null
  questionCount: number
  selectedNode: TaxonomyNode | null
  toggleExpand: (id: string) => void
  setSelectedNodeId: (id: string | null) => void
  setQuestionCount: (count: number) => void
}

export function useSubjectTree({
  disciplineId,
  initialQuestionCount = 10,
}: UseSubjectTreeOptions): UseSubjectTreeReturn {
  const [tree, setTree] = useState<TaxonomyNode[]>([])
  const [loading, setLoading] = useState(false)
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [questionCount, setQuestionCount] = useState(initialQuestionCount)

  useEffect(() => {
    if (tree.length === 0) {
      setLoading(true)
      getTaxonomyTree(disciplineId)
        .then((nodes) => setTree(nodes as unknown as TaxonomyNode[]))
        .finally(() => setLoading(false))
    }
  }, [disciplineId, tree.length])

  const selectedNode = useMemo(() => {
    if (!selectedNodeId) return null
    const findNode = (nodes: TaxonomyNode[]): TaxonomyNode | null => {
      for (const node of nodes) {
        if (node.node_id === selectedNodeId) return node
        if (node.children) {
          const found = findNode(node.children)
          if (found) return found
        }
      }
      return null
    }
    return findNode(tree)
  }, [tree, selectedNodeId])

  const toggleExpand = useCallback((id: string) => {
    setExpandedNodes((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  return {
    tree,
    loading,
    expandedNodes,
    selectedNodeId,
    questionCount,
    selectedNode,
    toggleExpand,
    setSelectedNodeId,
    setQuestionCount,
  }
}

'use client'

import * as React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { BookOpen } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { getTaxonomyTree } from '@/lib/actions/wiki-actions'
import type { TaxonomyNode } from '@/lib/actions/taxonomy'
import { cn } from '@/lib/utils'
import { useWikiNavigation } from './WikiNavigationContext'
import { Eyebrow } from '@/components/ui/eyebrow'
import { TaxonomyTree } from '@/components/shared/taxonomy-tree'
import type { TaxonomyTreeNode } from '@/components/shared/taxonomy-tree'

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

/** Convert a flat TaxonomyNode[] (parent_id references) into nested TaxonomyTreeNode[] */
const buildNestedTree = (flatNodes: TaxonomyNode[]): TaxonomyTreeNode[] => {
  const nodeMap = new Map<string, TaxonomyTreeNode>()

  // First pass: create all tree nodes
  for (const n of flatNodes) {
    nodeMap.set(n.node_id, {
      node_id: n.node_id,
      name: n.name,
      slug: n.slug ?? null,
      level: n.level,
      parent_id: n.parent_id,
      ale_id: n.ale_id ?? null,
      sort_order: n.sort_order ?? null,
      is_leaf: n.is_leaf,
      article_count: n.articles?.length ?? 0,
      articles: n.articles,
      children: [],
    })
  }

  // Second pass: attach children to parents
  const roots: TaxonomyTreeNode[] = []
  for (const n of flatNodes) {
    const treeNode = nodeMap.get(n.node_id)!
    if (n.parent_id && nodeMap.has(n.parent_id)) {
      nodeMap.get(n.parent_id)!.children!.push(treeNode)
    } else {
      roots.push(treeNode)
    }
  }

  // Propagate article counts upward
  const countArticles = (node: TaxonomyTreeNode): number => {
    const ownCount = node.articles?.length ?? 0
    const childCount = (node.children ?? []).reduce((sum, c) => sum + countArticles(c), 0)
    const total = ownCount + childCount
    node.article_count = total
    return total
  }
  roots.forEach(countArticles)

  return roots
}

/* ------------------------------------------------------------------ */
/*  WikiSidebar                                                        */
/* ------------------------------------------------------------------ */

interface WikiSidebarProps {
  disciplineId: string
  disciplineName: string
  collapsed?: boolean
  initialNodes?: TaxonomyNode[]
}

export const WikiSidebar = ({
  disciplineId,
  disciplineName,
  collapsed,
  initialNodes,
}: WikiSidebarProps) => {
  const pathname = usePathname()
  const { navigate } = useWikiNavigation()
  const [nodes, setNodes] = React.useState<TaxonomyNode[]>(initialNodes ?? [])
  const [loading, setLoading] = React.useState(!initialNodes?.length)

  // Fetch taxonomy data ONLY when discipline changes
  React.useEffect(() => {
    if (initialNodes?.length) {
      setLoading(false)
      return
    }
    if (disciplineId) {
      setLoading(true)
      getTaxonomyTree(disciplineId).then((data) => {
        setNodes(data)
        setLoading(false)
      })
    }
  }, [disciplineId, initialNodes])

  // Build nested tree
  const syllabusTree = React.useMemo(() => buildNestedTree(nodes), [nodes])

  // Extract active slug from pathname
  const activeSlug = React.useMemo(() => {
    const prefix = '/dashboard/wiki/'
    if (!pathname.startsWith(prefix)) return undefined
    return pathname.slice(prefix.length).split('/')[0] || undefined
  }, [pathname])

  // Navigate using transition so WikiContentShell shows skeleton
  const handleNavigate = React.useCallback((href: string) => {
    if (href === pathname) return
    navigate(href)
  }, [pathname, navigate])

  // No discipline state
  if (!disciplineId) {
    return (
      <aside className="w-full h-full bg-background flex flex-col items-center justify-center p-6 text-center">
        <div className="bg-muted p-3 rounded-md inline-block mb-3">
          <SCIcon icon={BookOpen} size="lg" className="text-muted-foreground" />
        </div>
        <p className="text-xs font-semibold text-foreground mb-1">No Discipline</p>
        <p className="text-[11px] text-muted-foreground leading-relaxed mb-3">
          Select your exam type in Settings to view the syllabus.
        </p>
        <Link href="/dashboard/settings">
          <button className="text-[11px] font-semibold text-primary hover:text-primary/80 uppercase tracking-wider cursor-pointer">
            Go to Settings
          </button>
        </Link>
      </aside>
    )
  }

  // Loading state
  if (loading) {
    return (
      <aside className="w-full h-full bg-background flex flex-col overflow-hidden">
        <div className="p-4 space-y-3">
          <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
          <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
          <div className="h-3 w-2/3 bg-muted animate-pulse rounded" />
          <div className="h-3 w-1/2 bg-muted animate-pulse rounded" />
          <div className="h-3 w-3/4 bg-muted animate-pulse rounded" />
        </div>
      </aside>
    )
  }

  const hasArticleOpen = pathname !== '/dashboard/wiki' && pathname.startsWith('/dashboard/wiki/')

  return (
    <aside className="w-full h-full bg-background flex flex-col overflow-hidden">
      
      {/* Syllabus section */}
      {syllabusTree.length > 0 && (
        <div className="flex flex-col flex-1 min-h-0">
          <div className="px-3 pt-3 pb-1.5 flex items-center gap-1.5 shrink-0">
            <SCIcon icon={BookOpen} size="xs" className="text-muted-foreground" />
            <Eyebrow>Syllabus</Eyebrow>
          </div>
          <TaxonomyTree
            nodes={syllabusTree}
            activeSlug={activeSlug}
            basePath="/dashboard/wiki"
            onNavigate={handleNavigate}
            showCounts
            showSearch
            dimInactive={hasArticleOpen}
            className="flex-1 min-h-0"
          />
        </div>
      )}
    </aside>
  )
}

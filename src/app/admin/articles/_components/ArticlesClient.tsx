'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  BookOpen,
  PlusCircle,
  WarningCircle,
  MagnifyingGlass,
} from '@phosphor-icons/react/dist/ssr'
import { PageHeader } from '@/components/shared/page-header'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { TaxonomyTree, type TaxonomyTreeNode } from '@/components/shared/taxonomy-tree'
import type {
  AdminArticle,
  AdminTaxonomyNode,
  AdminDiscipline,
} from '@/lib/actions/admin/wiki-queries'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface ArticlesClientProps {
  disciplines: AdminDiscipline[]
  treeByDiscipline: Record<string, AdminTaxonomyNode[]>
  unmappedArticles: AdminArticle[]
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

const stripNumberPrefix = (name: string) => name.replace(/^\d{1,2}\s*[—–-]\s*/, '')

const computeWordCount = (content: string | null): number =>
  content ? content.split(/\s+/).filter(Boolean).length : 0

/** Walk tree to collect all article_ids within a node subtree */
const collectArticleIds = (node: AdminTaxonomyNode): string[] => {
  const ids: string[] = (node.articles ?? []).map((a) => a.article_id)
  for (const child of node.children ?? []) ids.push(...collectArticleIds(child))
  return ids
}

/* ------------------------------------------------------------------ */
/*  Article row                                                        */
/* ------------------------------------------------------------------ */

const ArticleRow = ({ article }: { article: AdminArticle }) => {
  const router = useRouter()
  const words = computeWordCount(article.content)
  const status = article.status ?? 'draft'

  const statusBadge = status === 'published'
    ? <Badge variant="success" size="sm" dot>Published</Badge>
    : status === 'review'
      ? <Badge variant="warning" size="sm" dot>Review</Badge>
      : <Badge variant="default" size="sm" dot>Draft</Badge>

  return (
    <div
      className="group flex items-center gap-3 px-3 py-2.5 border-b border-border last:border-0 hover:bg-muted/40 cursor-pointer transition-colors duration-100"
      onClick={() => router.push(`/admin/articles/${article.article_id}`)}
    >
      {/* Status indicator */}
      <span
        className={cn(
          'mt-0.5 w-1.5 h-1.5 rounded-full shrink-0',
          status === 'published' ? 'bg-emerald' : status === 'review' ? 'bg-amber-500' : 'bg-muted-foreground',
        )}
      />

      {/* Title */}
      <span className="flex-1 text-xs font-medium text-text-primary truncate min-w-0">
        {article.title}
      </span>

      {/* Meta chips — only visible on hover for clean look */}
      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-150 shrink-0">
        <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-text-tertiary tabular-nums">
          {words.toLocaleString()} w
        </span>
        {article.questionCount > 0 && (
          <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-emerald tabular-nums">
            {article.questionCount}q
          </span>
        )}
      </div>

      {/* Status badge */}
      {statusBadge}

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
        <Link
          href={`/admin/articles/${article.article_id}`}
          className="text-[11px] text-camp-cobalt hover:text-primary-700 transition-colors duration-150 whitespace-nowrap"
          onClick={(e) => e.stopPropagation()}
        >
          Edit →
        </Link>
        {article.slug && (
          <Link
            href={`/dashboard/wiki/${article.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[11px] text-text-tertiary hover:text-text-secondary transition-colors duration-150 whitespace-nowrap"
            onClick={(e) => e.stopPropagation()}
          >
            Preview ↗
          </Link>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Right panel — article list for selected node                       */
/* ------------------------------------------------------------------ */

interface ArticlesPanelProps {
  selectedNodeId: string | null
  selectedNodeName: string | null
  articles: AdminArticle[]
  totalInTree: number
  filter: StatusFilter
  onFilterChange: (f: StatusFilter) => void
}

type StatusFilter = 'all' | 'published' | 'draft' | 'review'
const STATUS_TABS: { key: StatusFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'published', label: 'Published' },
  { key: 'draft', label: 'Draft' },
  { key: 'review', label: 'Review' },
]

const ArticlesPanel = ({
  selectedNodeId,
  selectedNodeName,
  articles,
  totalInTree,
  filter,
  onFilterChange,
}: ArticlesPanelProps) => {
  const [search, setSearch] = useState('')

  const filtered = useMemo(() => {
    let list = articles
    if (filter !== 'all') {
      list = list.filter((a) => {
        if (filter === 'published') return a.status === 'published'
        if (filter === 'review') return a.status === 'review'
        return !a.status || a.status === 'draft'
      })
    }
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter((a) => a.title.toLowerCase().includes(q))
    }
    return list
  }, [articles, filter, search])

  const counts = useMemo(
    () => ({
      all: articles.length,
      published: articles.filter((a) => a.status === 'published').length,
      draft: articles.filter((a) => !a.status || a.status === 'draft').length,
      review: articles.filter((a) => a.status === 'review').length,
    }),
    [articles],
  )

  if (!selectedNodeId) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-12 h-12 rounded-md bg-muted flex items-center justify-center mb-3">
          <BookOpen className="w-6 h-6 text-muted-foreground" />
        </div>
        <p className="text-sm font-medium text-text-primary mb-1">Select a node</p>
        <p className="text-xs text-text-tertiary max-w-xs">
          Click any subject, subtopic, or article group in the taxonomy tree on the left to view
          its articles here.
        </p>
        <p className="mt-4 font-[family-name:var(--font-dm-mono)] text-[11px] text-text-tertiary">
          {totalInTree} articles total in this discipline
        </p>
      </div>
    )
  }

  return (
    <div className="flex-1 h-full flex flex-col overflow-hidden">
      {/* Panel header */}
      <div className="px-4 pt-4 pb-0 shrink-0">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <h2 className="text-sm font-semibold text-text-primary truncate">
              {stripNumberPrefix(selectedNodeName ?? '')}
            </h2>
            <p className="text-[11px] text-text-tertiary mt-0.5">
              {articles.length} article{articles.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Link href="/admin/articles/new">
            <Button size="sm" className="shrink-0">
              <PlusCircle className="w-3.5 h-3.5 mr-1.5" />
              New Article
            </Button>
          </Link>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Search articles…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs bg-muted border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground"
          />
        </div>

        {/* Status tabs */}
        <div className="flex border-b border-border">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => onFilterChange(tab.key)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium transition-colors duration-150 border-b-2 -mb-px',
                filter === tab.key
                  ? 'border-camp-cobalt text-camp-cobalt'
                  : 'border-transparent text-text-secondary hover:text-text-primary',
              )}
            >
              {tab.label}
              <span
                className={cn(
                  'ml-1 font-[family-name:var(--font-dm-mono)] text-[11px]',
                  filter === tab.key ? 'text-camp-cobalt' : 'text-text-tertiary',
                )}
              >
                ({counts[tab.key]})
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Article list */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <p className="text-sm text-text-secondary font-medium mb-1">No articles found</p>
            <p className="text-xs text-text-tertiary">
              {search ? 'Try a different search term' : 'No articles match this filter'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filtered.map((article) => (
              <ArticleRow key={article.article_id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main component                                                     */
/* ------------------------------------------------------------------ */

export const ArticlesClient = ({
  disciplines,
  treeByDiscipline,
  unmappedArticles,
}: ArticlesClientProps) => {
  const router = useRouter()
  const [activeDisciplineId, setActiveDisciplineId] = useState<string | null>(
    disciplines[0]?.discipline_id ?? null,
  )
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [selectedNodeName, setSelectedNodeName] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [globalSearch, setGlobalSearch] = useState('')

  const currentTree = useMemo(() => 
    (activeDisciplineId ? (treeByDiscipline[activeDisciplineId] ?? []) : []) as unknown as TaxonomyTreeNode[]
  , [activeDisciplineId, treeByDiscipline])

  // Global pool of all articles
  const allArticles = useMemo(() => {
    const result: AdminArticle[] = [...unmappedArticles]
    const seen = new Set<string>()
    for (const a of unmappedArticles) seen.add(a.article_id)
    
    const collect = (nodes: AdminTaxonomyNode[]) => {
      for (const node of nodes) {
        for (const a of node.articles ?? []) {
          if (!seen.has(a.article_id)) {
            seen.add(a.article_id)
            result.push(a)
          }
        }
        collect(node.children ?? [])
      }
    }
    for (const dId of Object.keys(treeByDiscipline)) {
      collect(treeByDiscipline[dId])
    }
    return result
  }, [treeByDiscipline, unmappedArticles])

  // Collect articles for the right panel
  const selectedArticles = useMemo(() => {
    if (globalSearch.trim()) {
      const q = globalSearch.toLowerCase()
      return allArticles.filter((a) => a.title.toLowerCase().includes(q))
    }

    if (!selectedNodeId) return []

    // Special case: "unmapped" pseudo-node
    if (selectedNodeId === '__unmapped__') return unmappedArticles

    // Walk the tree to find the selected node
    const findNode = (nodes: AdminTaxonomyNode[]): AdminTaxonomyNode | null => {
      for (const n of nodes) {
        if (n.node_id === selectedNodeId) return n
        const found = findNode(n.children ?? [])
        if (found) return found
      }
      return null
    }
    const node = findNode(treeByDiscipline[activeDisciplineId!] ?? [])
    if (!node) return []
    const ids = collectArticleIds(node)
    // Deduplicate
    const seen = new Set<string>()
    const result: AdminArticle[] = []
    for (const id of ids) {
      if (seen.has(id)) continue
      seen.add(id)
      const article = (node.articles ?? []).find((a) => a.article_id === id)
        ?? findArticleById(treeByDiscipline[activeDisciplineId!] ?? [], id)
      if (article) result.push(article)
    }
    return result
  }, [globalSearch, selectedNodeId, activeDisciplineId, treeByDiscipline, unmappedArticles, allArticles])

  const effectiveNodeId = globalSearch.trim() ? '__global__' : selectedNodeId
  const effectiveNodeName = globalSearch.trim() ? 'Search Results' : selectedNodeName

  // Count total articles in current tree
  const totalInTree = useMemo(() => {
    const count = (nodes: AdminTaxonomyNode[]): number =>
      nodes.reduce((s, n) => s + (n.articles?.length ?? 0) + count(n.children ?? []), 0)
    return count((treeByDiscipline[activeDisciplineId!] ?? []))
  }, [activeDisciplineId, treeByDiscipline])

  const onSelect = useCallback((id: string, name: string, node: TaxonomyTreeNode) => {
    // If it's a leaf article (level 3+ with slug), we could technically navigate,
    // but the admin articles page is designed to show the list on the right.
    // However, if it's a single-article leaf, navigating to editor is a nice UX.
    const adminNode = node as unknown as AdminTaxonomyNode
    if (adminNode.level >= 3 && (adminNode.articles?.length ?? 0) === 1) {
      router.push(`/admin/articles/${adminNode.articles![0].article_id}`)
      return
    }
    setSelectedNodeId(id)
    setSelectedNodeName(name)
    setStatusFilter('all')
  }, [router])

  const renderNodeRight = useCallback((node: TaxonomyTreeNode) => {
    const adminNode = node as unknown as AdminTaxonomyNode
    if (!adminNode.article_count) return null
    return (
      <span className="font-[family-name:var(--font-dm-mono)] text-[10px] tabular-nums shrink-0 ml-auto pl-2 text-text-tertiary">
        {adminNode.article_count}
      </span>
    )
  }, [])

  return (
    <div className="flex flex-col gap-4">
      {/* Top header */}
      <div className="shrink-0">
        <PageHeader
          title="Articles"
          subtitle="Manage knowledge base content"
          actions={
            <div className="flex items-center gap-2">
              <div className="relative w-64">
                <MagnifyingGlass className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search globally..."
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full pl-8 pr-3 py-1.5 text-xs bg-white border border-border rounded-sm focus:outline-none focus:ring-1 focus:ring-primary/40 placeholder:text-muted-foreground"
                />
              </div>
              <Link href="/admin/articles/new">
                <Button size="sm">
                  <PlusCircle className="w-3.5 h-3.5 mr-1" />
                  New Article
                </Button>
              </Link>
            </div>
          }
        />
      </div>

      {/* Discipline tabs */}
      {disciplines.length > 1 && (
        <div className="flex gap-0 border-b border-border shrink-0 mb-0">
          {disciplines.map((d) => (
            <button
              key={d.discipline_id}
              type="button"
              onClick={() => {
                setActiveDisciplineId(d.discipline_id)
                setSelectedNodeId(null)
                setSelectedNodeName(null)
              }}
              className={cn(
                'px-4 py-2 text-xs font-medium transition-colors duration-150 border-b-2 -mb-px',
                activeDisciplineId === d.discipline_id
                  ? 'border-camp-cobalt text-camp-cobalt'
                  : 'border-transparent text-text-secondary hover:text-text-primary',
              )}
            >
              {d.acronym ?? d.name}
            </button>
          ))}
        </div>
      )}

      {/* Two-panel layout */}
      <div className="flex border border-border rounded-md overflow-hidden bg-white" style={{ height: 'calc(100vh - 12rem)' }}>
        {/* Left: taxonomy tree */}
        <aside className="w-72 shrink-0 border-r border-border flex flex-col bg-background h-full opacity-100 transition-opacity">
          <div className="px-3 py-2.5 border-b border-border shrink-0 flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-muted-foreground" />
            <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.15em] text-text-2">
              Syllabus
            </span>
            <span className="ml-auto font-[family-name:var(--font-dm-mono)] text-[11px] text-text-tertiary tabular-nums">
              {totalInTree} articles
            </span>
          </div>

          <div className={`flex-1 overflow-y-auto transition-opacity duration-200 ${globalSearch.trim() ? 'opacity-30 pointer-events-none' : 'opacity-100'}`}>
            <TaxonomyTree
              nodes={currentTree}
              activeNodeId={selectedNodeId}
              onSelect={onSelect}
              renderRight={renderNodeRight}
              showCounts={false}
              showSearch={false}
              basePath="/admin/articles"
              className="py-1"
            />

            {/* Unmapped articles */}
            {unmappedArticles.length > 0 && (
              <div className="mt-3 border-t border-border pt-2 px-1">
                <div
                  className={cn(
                    'flex items-center gap-1.5 px-2 py-1.5 rounded-sm cursor-pointer transition-colors duration-100',
                    selectedNodeId === '__unmapped__'
                      ? 'bg-primary/10 text-primary'
                      : 'hover:bg-muted text-amber-600',
                  )}
                  onClick={() => onSelect('__unmapped__', 'Unmapped Articles', { node_id: '__unmapped__', name: 'Unmapped Articles', level: 1 } as TaxonomyTreeNode)}
                >
                  <WarningCircle className="w-3.5 h-3.5 shrink-0" />
                  <span className="text-xs font-medium flex-1">Unmapped Articles</span>
                  <span className="font-[family-name:var(--font-dm-mono)] text-[11px] tabular-nums">
                    {unmappedArticles.length}
                  </span>
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Right: article panel */}
        <ArticlesPanel
          selectedNodeId={effectiveNodeId}
          selectedNodeName={effectiveNodeName}
          articles={selectedArticles}
          totalInTree={totalInTree}
          filter={statusFilter}
          onFilterChange={setStatusFilter}
        />
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Tree-walking helpers                                               */
/* ------------------------------------------------------------------ */

const findArticleById = (nodes: AdminTaxonomyNode[], id: string): AdminArticle | undefined => {
  for (const n of nodes) {
    const found = (n.articles ?? []).find((a) => a.article_id === id)
    if (found) return found
    const deep = findArticleById(n.children ?? [], id)
    if (deep) return deep
  }
  return undefined
}

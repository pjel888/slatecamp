'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Search,
  Plus,
  FileText,
  ArrowRight,
  FolderTree,
  HelpCircle,
  LayoutGrid,
  List,
} from 'lucide-react'
import { TaxonomyTree, type TaxonomyTreeNode } from '@/components/shared/taxonomy-tree'
import { Badge } from '@/components/ui/badge'
import { StatusBadge } from '@/components/ui/status-badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { cn } from '@/lib/utils'

// ─── Types ───────────────────────────────────────────────────

interface EnrichedArticle {
  article_id: string
  title: string
  slug: string
  status: string
  content: string
  difficulty_label: string | null
  created_at: string
  updated_at: string
  word_count: number
  question_count: number
  node_ids: string[]
  primary_ale_id: string | null
  primary_node_name: string | null
}

interface Stats {
  totalArticles: number
  totalQuestions: number
  topicsWithArticles: number
  totalTopics: number
}

interface ContentEditorIndexProps {
  articles: EnrichedArticle[]
  taxonomyTree: TaxonomyTreeNode[]
  stats: Stats
}

// ─── Status Filter ───────────────────────────────────────────

type StatusFilter = 'all' | 'draft' | 'review' | 'published'

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'Review' },
  { value: 'published', label: 'Published' },
]

// ─── Helpers ─────────────────────────────────────────────────

const formatDate = (iso: string) =>
  new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

/** Collect all descendant node IDs from a tree node */
const collectNodeIds = (node: TaxonomyTreeNode): string[] => {
  const ids = [node.node_id]
  if (node.children) {
    for (const child of node.children) {
      ids.push(...collectNodeIds(child))
    }
  }
  return ids
}

/** Find a node in the taxonomy tree by ID */
const findNodeById = (
  nodes: TaxonomyTreeNode[],
  id: string,
): TaxonomyTreeNode | null => {
  for (const node of nodes) {
    if (node.node_id === id) return node
    if (node.children) {
      const found = findNodeById(node.children, id)
      if (found) return found
    }
  }
  return null
}

// ─── Component ───────────────────────────────────────────────

export const ContentEditorIndex = ({
  articles,
  taxonomyTree,
  stats,
}: ContentEditorIndexProps) => {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Compute the set of node IDs that match the selected topic (including descendants)
  const selectedNodeIds = useMemo(() => {
    if (!selectedNodeId) return null
    const node = findNodeById(taxonomyTree, selectedNodeId)
    if (!node) return null
    return new Set(collectNodeIds(node))
  }, [selectedNodeId, taxonomyTree])

  const selectedNodeName = useMemo(() => {
    if (!selectedNodeId) return null
    const node = findNodeById(taxonomyTree, selectedNodeId)
    return node?.name?.replace(/^\d{1,2}\s*[—–-]\s*/, '') || null
  }, [selectedNodeId, taxonomyTree])

  // Filter articles
  const filteredArticles = useMemo(() => {
    let result = articles

    // Topic filter
    if (selectedNodeIds) {
      result = result.filter((a) =>
        a.node_ids.some((nid) => selectedNodeIds.has(nid))
      )
    }

    // Status filter
    if (statusFilter !== 'all') {
      result = result.filter((a) => a.status === statusFilter)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (a) =>
          a.title.toLowerCase().includes(q) ||
          a.slug.toLowerCase().includes(q) ||
          (a.primary_ale_id && a.primary_ale_id.toLowerCase().includes(q)) ||
          (a.primary_node_name && a.primary_node_name.toLowerCase().includes(q))
      )
    }

    return result
  }, [articles, selectedNodeIds, statusFilter, searchQuery])

  // Handle taxonomy node click
  const handleNodeNavigate = useCallback(
    (href: string) => {
      // Extract node info from href — the TaxonomyTree passes basePath/slug
      // We use onNavigate to intercept and filter instead
    },
    []
  )

  // Filtered stats
  const filteredStats = useMemo(() => {
    const qCount = filteredArticles.reduce((sum, a) => sum + a.question_count, 0)
    const wCount = filteredArticles.reduce((sum, a) => sum + a.word_count, 0)
    return {
      articles: filteredArticles.length,
      questions: qCount,
      words: wCount,
    }
  }, [filteredArticles])

  return (
    <div className="flex h-[calc(100vh-8rem)] overflow-hidden">
      {/* ── Left: Taxonomy Sidebar ────────────────────────────── */}
      {!sidebarCollapsed && (
        <div className="flex w-[280px] shrink-0 flex-col border-r border-[#D4DAE3] bg-white">
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-[#D4DAE3] px-4 py-3">
            <div className="flex items-center gap-2">
              <FolderTree className="h-3.5 w-3.5 text-[#4A5568]" />
              <span className="font-mono text-[11px] font-medium uppercase tracking-widest text-[#8896A7]">
                Topics
              </span>
            </div>
            {selectedNodeId && (
              <button
                type="button"
                onClick={() => setSelectedNodeId(null)}
                className="text-[11px] text-[#1B3FC4] hover:text-[#1535A8] transition-colors duration-150"
              >
                Clear
              </button>
            )}
          </div>

          {/* Taxonomy Tree */}
          <div className="flex-1 overflow-y-auto">
            <TaxonomyTree
              nodes={taxonomyTree}
              basePath="/admin/content"
              showCounts={true}
              showSearch={true}
              onNavigate={(href) => {
                // Extract the last segment as the slug, find node by slug
                // But TaxonomyTree sends basePath/slug — we need node_id
                // Instead, we'll use a click handler approach
              }}
            />
          </div>

          {/* Coverage stats */}
          <div className="border-t border-[#D4DAE3] px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[11px] text-[#8896A7]">Topics</p>
                <p className="text-sm font-semibold text-[#1A2332]">
                  {stats.totalTopics}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#8896A7]">Covered</p>
                <p className="text-sm font-semibold text-[#2D9F6F]">
                  {stats.topicsWithArticles}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#8896A7]">Articles</p>
                <p className="text-sm font-semibold text-[#1A2332]">
                  {stats.totalArticles}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-[#8896A7]">Questions</p>
                <p className="text-sm font-semibold text-[#1A2332]">
                  {stats.totalQuestions}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Right: Article List ───────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar: Search + Filters */}
        <div className="flex shrink-0 items-center gap-3 border-b border-[#D4DAE3] bg-white px-5 py-3">
          {/* Sidebar toggle */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-sm border border-[#D4DAE3] text-[#4A5568] hover:bg-[#F8F7F5] hover:text-[#1A2332] transition-colors duration-150"
            aria-label={sidebarCollapsed ? 'Show topics' : 'Hide topics'}
          >
            <FolderTree className="h-3.5 w-3.5" />
          </button>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-[#8896A7]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search articles by title, slug, or topic..."
              className="h-8 w-full rounded-sm border border-[#D4DAE3] bg-white pl-8 pr-3 text-sm text-[#1A2332] placeholder:text-[#8896A7] focus:border-[#1B3FC4] focus:ring-2 focus:ring-[#1B3FC4]/20 outline-none transition-colors duration-150"
            />
          </div>

          {/* Status filter pills */}
          <div className="flex rounded-sm border border-[#D4DAE3]">
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setStatusFilter(opt.value)}
                className={cn(
                  'px-2.5 py-1 text-[11px] font-medium transition-colors duration-150 first:rounded-l-sm last:rounded-r-sm',
                  statusFilter === opt.value
                    ? 'bg-[#1B3FC4] text-white'
                    : 'bg-white text-[#4A5568] hover:bg-[#F8F7F5] hover:text-[#1A2332]'
                )}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Spacer */}
          <div className="flex-1" />

          {/* Active filter indicator */}
          {selectedNodeName && (
            <div className="flex items-center gap-1.5">
              <Badge variant="primary" size="sm" pill>
                {selectedNodeName}
              </Badge>
              <button
                type="button"
                onClick={() => setSelectedNodeId(null)}
                className="text-[11px] text-[#8896A7] hover:text-[#D64545] transition-colors duration-150"
              >
                &times;
              </button>
            </div>
          )}

          {/* New Article */}
          <Link href="/admin/content/new">
            <Button variant="primary" size="sm">
              <Plus className="w-3.5 h-3.5" />
              New Article
            </Button>
          </Link>
        </div>

        {/* Stats bar */}
        <div className="flex shrink-0 items-center gap-4 border-b border-[#D4DAE3] bg-[#F8F7F5] px-5 py-2">
          <span className="text-[11px] text-[#8896A7]">
            <span className="font-semibold text-[#1A2332]">{filteredStats.articles}</span>{' '}
            {filteredStats.articles === 1 ? 'article' : 'articles'}
          </span>
          <span className="h-3 w-px bg-[#D4DAE3]" />
          <span className="text-[11px] text-[#8896A7]">
            <span className="font-semibold text-[#1A2332]">{filteredStats.questions}</span>{' '}
            questions
          </span>
          <span className="h-3 w-px bg-[#D4DAE3]" />
          <span className="text-[11px] text-[#8896A7]">
            <span className="font-semibold text-[#1A2332]">
              {filteredStats.words.toLocaleString()}
            </span>{' '}
            words
          </span>
          {(searchQuery || statusFilter !== 'all' || selectedNodeId) && (
            <>
              <span className="h-3 w-px bg-[#D4DAE3]" />
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('')
                  setStatusFilter('all')
                  setSelectedNodeId(null)
                }}
                className="text-[11px] text-[#1B3FC4] hover:text-[#1535A8] transition-colors duration-150"
              >
                Clear all filters
              </button>
            </>
          )}
        </div>

        {/* Article list */}
        <div className="flex-1 overflow-y-auto">
          {filteredArticles.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              {articles.length === 0 ? (
                <EmptyState
                  icon={<FileText className="w-5 h-5" />}
                  message="No articles yet"
                  description="Create your first article to start building content and questions together."
                  action={{
                    label: '+ Create Article',
                    href: '/admin/content/new',
                  }}
                />
              ) : (
                <EmptyState
                  icon={<Search className="w-5 h-5" />}
                  message="No matching articles"
                  description="Try adjusting your search or filter criteria."
                  action={{
                    label: 'Clear filters',
                    onClick: () => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      setSelectedNodeId(null)
                    },
                  }}
                />
              )}
            </div>
          ) : (
            <div className="divide-y divide-[#D4DAE3]">
              {filteredArticles.map((article) => (
                <Link
                  key={article.article_id}
                  href={`/admin/content/${article.article_id}`}
                  className="group flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-[#F8F7F5]"
                >
                  {/* Icon */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-[#EEF2FC]">
                    <FileText className="h-4 w-4 text-[#1B3FC4]" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium text-[#1A2332] truncate">
                        {article.title || 'Untitled'}
                      </span>
                      <StatusBadge
                        status={
                          article.status === 'published'
                            ? 'published'
                            : article.status === 'review'
                              ? 'review'
                              : 'draft'
                        }
                      />
                      {article.difficulty_label && (
                        <Badge variant="outline" size="sm">
                          {article.difficulty_label}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-[#8896A7]">
                      {article.primary_ale_id && (
                        <span className="font-mono text-[#4A5568]">
                          {article.primary_ale_id}
                        </span>
                      )}
                      {article.primary_node_name && (
                        <span className="truncate max-w-[200px]">
                          {article.primary_node_name.replace(
                            /^\d{1,2}\s*[—–-]\s*/,
                            ''
                          )}
                        </span>
                      )}
                      <span>{article.word_count.toLocaleString()}w</span>
                      <span className="flex items-center gap-0.5">
                        <HelpCircle className="h-2.5 w-2.5" />
                        {article.question_count}q
                      </span>
                      <span>Updated {formatDate(article.updated_at)}</span>
                    </div>
                  </div>

                  {/* Hover action */}
                  <div className="shrink-0 flex items-center gap-1 text-xs font-medium text-[#1B3FC4] opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                    Open Editor
                    <ArrowRight className="w-3 h-3" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

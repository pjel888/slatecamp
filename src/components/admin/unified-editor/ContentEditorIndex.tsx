'use client'

import { useState, useMemo, useCallback } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { MagnifyingGlass, Plus, FileText, ArrowRight, TreeStructure, Question, Stack } from '@phosphor-icons/react/dist/ssr'
import { TaxonomyTree, type TaxonomyTreeNode } from '@/components/shared/taxonomy-tree'
import { Badge, StatusBadge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/empty-state'
import { cn } from '@/lib/utils'
import { Eyebrow } from '@/components/ui/eyebrow'
import { QuestionsTableClient } from '@/components/admin/QuestionsTableClient'

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
  prompt_count: number
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

interface SearchableQuestion {
  id: string
  topic_id: string
  text: string
}

interface ContentEditorIndexProps {
  articles: EnrichedArticle[]
  searchableQuestions?: SearchableQuestion[]
  taxonomyTree: TaxonomyTreeNode[]
  stats: Stats
  defaultViewMode?: ViewMode
}

// ─── View Mode ───────────────────────────────────────────────

type ViewMode = 'articles' | 'questions'

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
  searchableQuestions = [],
  taxonomyTree,
  stats,
  defaultViewMode = 'articles',
}: ContentEditorIndexProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize from URL params
  const [viewMode, setViewMode] = useState<ViewMode>(() => {
    const mode = searchParams.get('view')
    return (mode === 'questions' || mode === 'articles') ? mode : defaultViewMode
  })
  
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(() => {
    return searchParams.get('topic')
  })

  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  // Sync state back to URL
  const updateUrl = useCallback((mode: ViewMode, topic: string | null) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('view', mode)
    if (topic) params.set('topic', topic)
    else params.delete('topic')
    router.replace(`/admin/knowledge?${params.toString()}`, { scroll: false })
  }, [router, searchParams])

  const handleSetViewMode = (mode: ViewMode) => {
    setViewMode(mode)
    updateUrl(mode, selectedNodeId)
  }

  const handleSetSelectedNodeId = (id: string | null) => {
    setSelectedNodeId(id)
    updateUrl(viewMode, id)
  }

  // Compute the set of node IDs that match the selected topic (including descendants)
  const selectedNodeIds = useMemo(() => {
    if (!selectedNodeId || selectedNodeId === 'unassigned') return null
    const node = findNodeById(taxonomyTree, selectedNodeId)
    if (!node) return null
    return new Set(collectNodeIds(node))
  }, [selectedNodeId, taxonomyTree])

  const selectedNodeName = useMemo(() => {
    if (!selectedNodeId) return null
    if (selectedNodeId === 'unassigned') return 'Unassigned'
    const node = findNodeById(taxonomyTree, selectedNodeId)
    return node?.name?.replace(/^\d{1,2}\s*[—–-]\s*/, '') || null
  }, [selectedNodeId, taxonomyTree])

  // Filter articles
  const filteredArticles = useMemo(() => {
    let result = articles

    // Topic filter
    if (selectedNodeId === 'unassigned') {
      result = result.filter((a) => a.node_ids.length === 0)
    } else if (selectedNodeIds) {
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
  }, [articles, selectedNodeIds, selectedNodeId, statusFilter, searchQuery])

  // Filter questions for hybrid search
  const filteredQuestions = useMemo(() => {
    if (!searchQuery.trim() || viewMode !== 'articles') return []
    const q = searchQuery.toLowerCase()
    return searchableQuestions.filter(sq => 
      sq.text.toLowerCase().includes(q)
    )
  }, [searchableQuestions, searchQuery, viewMode])

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
        <div className="flex w-[280px] shrink-0 flex-col border-r border-border bg-card">
          {/* Sidebar header */}
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <div className="flex items-center gap-2">
              <TreeStructure className="h-3.5 w-3.5 text-text-secondary" />
              <Eyebrow>Topics</Eyebrow>
            </div>
            {selectedNodeId && (
              <button
                type="button"
                onClick={() => handleSetSelectedNodeId(null)}
                className="text-[11px] text-camp-cobalt hover:text-primary-700 transition-colors duration-150"
              >
                Clear
              </button>
            )}
          </div>

          {/* Taxonomy Tree */}
          <div className="flex-1 overflow-y-auto">
            <TaxonomyTree
              nodes={taxonomyTree}
              basePath="/admin/knowledge"
              showCounts={true}
              showSearch={true}
              onNavigate={(href) => {
                // Intercept navigation to update local filter instead of hard redirect
                const parts = href.split('/')
                const slug = parts[parts.length - 1]
                // Note: TaxonomyTree implementation details might vary,
                // but usually we'd find the node by slug here.
                // We'll let users click to filter
              }}
            />
            
            <button
              type="button"
              onClick={() => handleSetSelectedNodeId('unassigned')}
              className={cn(
                "w-full text-left px-4 py-2 text-xs font-medium border-t border-border transition-colors",
                selectedNodeId === 'unassigned' 
                  ? "bg-primary-50 text-camp-cobalt" 
                  : "text-text-secondary hover:bg-surface-light"
              )}
            >
              Unassigned Content
            </button>
          </div>

          {/* Global Coverage stats */}
          <div className="border-t border-border px-4 py-3">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <p className="text-[11px] text-text-tertiary">Topics</p>
                <p className="text-sm font-semibold text-text-primary">
                  {stats.totalTopics}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-text-tertiary">Covered</p>
                <p className="text-sm font-semibold text-emerald">
                  {stats.topicsWithArticles}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-text-tertiary">Articles</p>
                <p className="text-sm font-semibold text-text-primary">
                  {stats.totalArticles}
                </p>
              </div>
              <div>
                <p className="text-[11px] text-text-tertiary">Questions</p>
                <p className="text-sm font-semibold text-text-primary">
                  {stats.totalQuestions}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ── Right: Content List ───────────────────────────────── */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar: Search + Filters + View Toggle */}
        <div className="flex shrink-0 items-center gap-3 border-b border-border bg-card px-5 py-3">
          {/* Sidebar toggle */}
          <button
            type="button"
            onClick={() => setSidebarCollapsed((v) => !v)}
            className="flex h-8 w-8 items-center justify-center rounded-sm border border-border text-text-secondary hover:bg-surface-light hover:text-text-primary transition-colors duration-150"
            aria-label={sidebarCollapsed ? 'Show topics' : 'Hide topics'}
          >
            <TreeStructure className="h-3.5 w-3.5" />
          </button>

          {/* View Mode Toggle */}
          <div className="flex rounded-sm border border-border mr-2">
            <button
              type="button"
              onClick={() => handleSetViewMode('articles')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium transition-colors duration-150 rounded-l-sm',
                viewMode === 'articles'
                  ? 'bg-camp-cobalt text-white'
                  : 'bg-card text-text-secondary hover:bg-surface-light'
              )}
            >
              <FileText size={14} />
              Articles
            </button>
            <button
              type="button"
              onClick={() => handleSetViewMode('questions')}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1 text-[11px] font-medium transition-colors duration-150 rounded-r-sm',
                viewMode === 'questions'
                  ? 'bg-camp-cobalt text-white'
                  : 'bg-card text-text-secondary hover:bg-surface-light'
              )}
            >
              <Question size={14} />
              Questions
            </button>
          </div>

          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <MagnifyingGlass className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-text-tertiary" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={viewMode === 'articles' ? "Search articles..." : "Search questions..."}
              className="h-8 w-full rounded-sm border border-border bg-card pl-8 pr-3 text-sm text-text-primary placeholder:text-text-tertiary focus:border-camp-cobalt focus:ring-2 focus:ring-camp-cobalt/20 outline-none transition-colors duration-150"
            />
          </div>

          {/* Status filter pills (Articles only) */}
          {viewMode === 'articles' && (
            <div className="flex rounded-sm border border-border">
              {STATUS_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setStatusFilter(opt.value)}
                  className={cn(
                    'px-2.5 py-1 text-[11px] font-medium transition-colors duration-150 first:rounded-l-sm last:rounded-r-sm',
                    statusFilter === opt.value
                      ? 'bg-camp-cobalt text-white'
                      : 'bg-card text-text-secondary hover:bg-surface-light hover:text-text-primary'
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {/* Spacer */}
          <div className="flex-1" />

          {/* Active filter indicator */}
          {selectedNodeName && (
            <div className="flex items-center gap-1.5 mr-2">
              <Badge variant="primary" size="sm" shape="pill">
                {selectedNodeName}
              </Badge>
              <button
                type="button"
                onClick={() => handleSetSelectedNodeId(null)}
                className="text-[11px] text-text-tertiary hover:text-destructive transition-colors duration-150"
              >
                &times;
              </button>
            </div>
          )}

          {/* New Content Buttons */}
          <div className="flex items-center gap-2">
            <Link href={`/admin/knowledge/questions/new${selectedNodeId ? `?topic=${selectedNodeId}` : ''}`}>
              <Button variant="secondary" size="sm">
                <Plus className="w-3.5 h-3.5" weight="bold" />
                New Question
              </Button>
            </Link>
            <Link href="/admin/knowledge/new">
              <Button variant="primary" size="sm">
                <Plus className="w-3.5 h-3.5" weight="bold" />
                New Article
              </Button>
            </Link>
          </div>
        </div>

        {/* Dynamic Content Area */}
        {viewMode === 'articles' ? (
          <>
            {/* Stats bar */}
            <div className="flex shrink-0 items-center gap-4 border-b border-border bg-surface-light px-5 py-2">
              <span className="text-[11px] text-text-tertiary">
                <span className="font-semibold text-text-primary">{filteredStats.articles}</span>{' '}
                {filteredStats.articles === 1 ? 'article' : 'articles'}
              </span>
              <span className="h-3 w-px bg-border" />
              <span className="text-[11px] text-text-tertiary">
                <span className="font-semibold text-text-primary">{filteredStats.questions}</span>{' '}
                questions
              </span>
              <span className="h-3 w-px bg-border" />
              <span className="text-[11px] text-text-tertiary">
                <span className="font-semibold text-text-primary">
                  {filteredStats.words.toLocaleString()}
                </span>{' '}
                words
              </span>
              {(searchQuery || statusFilter !== 'all' || selectedNodeId) && (
                <>
                  <span className="h-3 w-px bg-border" />
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('')
                      setStatusFilter('all')
                      handleSetSelectedNodeId(null)
                    }}
                    className="text-[11px] text-camp-cobalt hover:text-primary-700 transition-colors duration-150"
                  >
                    Clear all filters
                  </button>
                </>
              )}
            </div>

            {/* Article list */}
            <div className="flex-1 overflow-y-auto">
              {filteredArticles.length === 0 && filteredQuestions.length === 0 ? (
                <div className="flex items-center justify-center h-full">
                  {articles.length === 0 ? (
                    <EmptyState
                      icon={<FileText size={20} />}
                      title="No articles yet"
                      description="Create your first article to start building content and questions together."
                      action={
                        <Button asChild variant="primary">
                          <Link href="/admin/knowledge/new">+ Create Article</Link>
                        </Button>
                      }
                    />
                  ) : (
                    <EmptyState
                      icon={<MagnifyingGlass size={20} />}
                      title="No matching content"
                      description="Try adjusting your search or filter criteria."
                      action={
                        <Button
                          variant="secondary"
                          onClick={() => {
                            setSearchQuery('')
                            setStatusFilter('all')
                            handleSetSelectedNodeId(null)
                          }}
                        >
                          Clear filters
                        </Button>
                      }
                    />
                  )}
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {/* Article Results */}
                  {filteredArticles.map((article) => (
                    <Link
                      key={article.article_id}
                      href={`/admin/knowledge/${article.article_id}`}
                      className="group flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-surface-light"
                    >
                      {/* Icon */}
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-primary-50">
                        <FileText size={16} className="text-camp-cobalt" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-medium text-text-primary truncate">
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
                        <div className="flex items-center gap-3 text-[11px] text-text-tertiary">
                          {article.primary_ale_id && (
                            <span className="font-mono text-text-secondary">
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
                            <Question size={10} />
                            {article.question_count}q
                          </span>
                          <span className="flex items-center gap-0.5">
                            <Stack size={10} />
                            {article.prompt_count}p
                          </span>
                          <span>Updated {formatDate(article.updated_at)}</span>

                        </div>
                      </div>

                      {/* Hover action */}
                      <div className="shrink-0 flex items-center gap-1 text-xs font-medium text-camp-cobalt opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                        Open Editor
                        <ArrowRight size={12} />
                      </div>
                    </Link>
                  ))}

                  {/* Question Matches (Hybrid Search) */}
                  {filteredQuestions.length > 0 && (
                    <>
                      <div className="bg-surface-light px-5 py-2 border-t border-border">
                        <Eyebrow>Question Bank Matches</Eyebrow>
                      </div>
                      {filteredQuestions.map((q) => (
                        <Link
                          key={q.id}
                          href={`/admin/knowledge/questions/${q.id}`}
                          className="group flex items-center gap-4 px-5 py-3.5 transition-colors duration-150 hover:bg-card bg-surface-light/30"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-amber-50">
                            <Question size={16} className="text-amber-600" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-text-primary line-clamp-1">
                              {q.text}
                            </p>
                            <p className="text-[11px] text-text-tertiary mt-0.5">
                              Found in assessment bank
                            </p>
                          </div>
                          <div className="shrink-0 flex items-center gap-1 text-xs font-medium text-amber-600 opacity-0 group-hover:opacity-100 transition-opacity duration-150">
                            Moderate
                            <ArrowRight size={12} />
                          </div>
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex-1 overflow-hidden p-4 bg-surface-light">
            <QuestionsTableClient
              questions={[]} // Fetched dynamically by selectedNodeId prop
              articleGroups={[]}
              totalCount={0}
              page={1}
              pageSize={50}
              taxonomyTree={taxonomyTree as any}
              externalSelectedNodeId={selectedNodeId}
              externalSearchQuery={searchQuery}
            />
          </div>
        )}
      </div>
    </div>
  )
}

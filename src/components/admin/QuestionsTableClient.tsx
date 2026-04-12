'use client'

import { useState, useCallback, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { CaretRight } from '@phosphor-icons/react/dist/ssr'
import { Badge } from '@/components/ui/badge'
import { DifficultyBar } from '@/components/shared/difficulty-bar'
import { QuestionQualityBadges } from '@/components/admin/QuestionQualityBadges'
import { QuestionQuickPreview } from '@/components/admin/QuestionQuickPreview'
import { BulkActionBar } from '@/components/admin/BulkActionBar'
import { bulkDeleteQuestions } from '@/lib/actions/admin/bulk'
import { toast } from '@/lib/hooks/use-toast'
import { cn } from '@/lib/utils'
import { TaxonomyTree, type TaxonomyTreeNode } from '@/components/shared/taxonomy-tree'

import type { Question, ArticleGroup } from '@/lib/actions/admin/question-queries'
import { getQuestionsByTopicIds } from '@/lib/actions/admin/question-queries'

/* ------------------------------------------------------------------ */
/*  Props                                                              */
/* ------------------------------------------------------------------ */

interface QuestionsTableClientProps {
  questions: Question[]
  articleGroups: ArticleGroup[]
  totalCount: number
  page: number
  pageSize: number
  taxonomyTree: TaxonomyTreeNode[]
  /** If provided, the table will filter by this node and hide its own internal tree nav */
  externalSelectedNodeId?: string | null
  /** If provided, the table will filter by this search query */
  externalSearchQuery?: string
  externalFilter?: string
}

/* ------------------------------------------------------------------ */
/*  QuestionRow                                                        */
/* ------------------------------------------------------------------ */

const QuestionRow = ({
  question,
  isSelected,
  onToggleSelect,
  onNavigate,
}: {
  question: Question
  isSelected: boolean
  onToggleSelect: (id: string) => void
  onNavigate: (id: string) => void
}) => {
  const opts = question.options as string[] | { text: string; is_correct?: boolean }[]

  return (
    <tr
      className={cn(
        'bg-card border-b border-border transition-colors duration-150',
        'hover:bg-muted/50',
        isSelected && 'bg-primary/5',
        'cursor-pointer',
      )}
      onClick={(e) => {
        const target = e.target as HTMLElement
        if (
          target.closest('[data-slot="checkbox"]') ||
          target.closest('button') ||
          target.closest('a') ||
          target.closest('input')
        ) {
          return
        }
        onNavigate(question.question_id)
      }}
    >
      <td className="px-4 py-3 w-10">
        <input
          type="checkbox"
          checked={isSelected}
          onChange={() => onToggleSelect(question.question_id)}
          className="h-4 w-4 rounded border-border"
          aria-label={`Select question ${question.question_id}`}
          onClick={(e) => e.stopPropagation()}
        />
      </td>
      <td className="px-4 py-3 text-sm">
        <span className="block max-w-[400px] truncate text-sm text-foreground">
          {question.text || '\u2014'}
        </span>
      </td>
      <td className="px-4 py-3 text-sm">
        <DifficultyBar value={question.difficulty} size="sm" />
      </td>
      <td className="px-4 py-3 text-sm">
        <QuestionQualityBadges
          hasRationale={Boolean(question.rationale)}
          hasCitation={Boolean(question.code_citation)}
        />
      </td>
      <td className="px-4 py-3 text-sm">
        {question.code_citation ? (
          <span className="text-[11px] font-[family-name:var(--font-dm-mono)] text-foreground">
            {question.code_citation}
          </span>
        ) : (
          <span className="text-muted-foreground">{'\u2014'}</span>
        )}
      </td>
      <td className="px-4 py-3 text-sm text-right">
        <div className="flex items-center gap-2 justify-end" onClick={(e) => e.stopPropagation()}>
          <QuestionQuickPreview
            stem={question.text}
            options={opts && opts.length > 0 ? opts : ['', '', '', '']}
            correctAnswer={0}
            rationale={question.rationale}
            codeCitation={question.code_citation}
          />
          {(question.article_id || question.topic_id) && (
            <Link
              href={question.article_id ? `/admin/knowledge/${question.article_id}` : `/admin/knowledge?topic=${question.topic_id}&view=articles`}
              className="whitespace-nowrap text-xs text-primary transition-colors duration-150 hover:text-primary-700"
              onClick={(e) => e.stopPropagation()}
              title="Open content editor to view this question in article context"
            >
              View in context &rarr;
            </Link>
          )}
        </div>
      </td>
    </tr>
  )
}

/* ------------------------------------------------------------------ */
/*  ArticleAccordionGroup                                              */
/* ------------------------------------------------------------------ */

const statusVariantMap: Record<string, 'success' | 'warning' | 'secondary'> = {
  published: 'success',
  draft: 'warning',
  review: 'secondary',
}

const ArticleAccordionGroup = ({
  group,
  isExpanded,
  onToggleExpand,
  selectedKeys,
  onToggleSelect,
  onToggleGroupSelect,
  onNavigate,
}: {
  group: ArticleGroup
  isExpanded: boolean
  onToggleExpand: () => void
  selectedKeys: Set<string>
  onToggleSelect: (id: string) => void
  onToggleGroupSelect: (ids: string[], select: boolean) => void
  onNavigate: (id: string) => void
}) => {
  const groupQuestionIds = useMemo(
    () => group.questions.map((q) => q.question_id),
    [group.questions],
  )

  const allSelected = groupQuestionIds.length > 0 && groupQuestionIds.every((id) => selectedKeys.has(id))
  const someSelected = groupQuestionIds.some((id) => selectedKeys.has(id))

  const handleToggleGroupSelect = () => {
    onToggleGroupSelect(groupQuestionIds, !allSelected)
  }

  return (
    <div className="border border-border rounded-md overflow-hidden">
      {/* Accordion header */}
      <button
        type="button"
        onClick={onToggleExpand}
        className={cn(
          'w-full flex items-center gap-3 px-4 py-3 text-left transition-colors duration-150',
          'hover:bg-muted/50',
          isExpanded ? 'bg-muted/30' : 'bg-card',
        )}
        aria-expanded={isExpanded}
      >
        <CaretRight
          size={16}
          className={cn(
            'text-muted-foreground transition-transform duration-150 flex-shrink-0',
            isExpanded && 'rotate-90',
          )}
        />

        <span className="flex-1 min-w-0 flex items-center gap-2">
          <span className="text-sm font-medium text-foreground truncate">
            {group.articleTitle}
          </span>

          {group.articleStatus !== 'none' && (
            <Badge
              variant={statusVariantMap[group.articleStatus] ?? 'secondary'}
              size="xs"
              shape="pill"
            >
              {group.articleStatus}
            </Badge>
          )}
        </span>

        <Badge variant="primary" size="xs" shape="pill">
          {group.questionCount} {group.questionCount === 1 ? 'question' : 'questions'}
        </Badge>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="border-t border-border">
          {group.questions.length === 0 ? (
            <div className="px-4 py-6 text-center text-sm text-muted-foreground">
              No questions in this article
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-muted/20">
                <tr>
                  <th className="px-4 py-2 w-10" scope="col">
                    <input
                      type="checkbox"
                      checked={allSelected}
                      ref={(el) => {
                        if (el) el.indeterminate = someSelected && !allSelected
                      }}
                      onChange={handleToggleGroupSelect}
                      className="h-4 w-4 rounded border-border"
                      aria-label={`Select all questions in ${group.articleTitle}`}
                    />
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide" scope="col">
                    Stem
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide" scope="col">
                    Difficulty
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide" scope="col">
                    Quality
                  </th>
                  <th className="px-4 py-2 text-left text-xs font-medium text-muted-foreground uppercase tracking-wide" scope="col">
                    Citation
                  </th>
                  <th className="px-4 py-2 text-right text-xs font-medium text-muted-foreground uppercase tracking-wide" scope="col">
                    {/* Actions */}
                  </th>
                </tr>
              </thead>
              <tbody>
                {group.questions.map((question) => (
                  <QuestionRow
                    key={question.question_id}
                    question={question}
                    isSelected={selectedKeys.has(question.question_id)}
                    onToggleSelect={onToggleSelect}
                    onNavigate={onNavigate}
                  />
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/*  Main Component                                                     */
/* ------------------------------------------------------------------ */

/** Collect all node IDs in a subtree (inclusive) */
const collectAllNodeIds = (node: TaxonomyTreeNode): Set<string> => {
  const ids = new Set<string>([node.node_id])
  if (node.children) {
    for (const child of node.children) {
      for (const id of collectAllNodeIds(child)) {
        ids.add(id)
      }
    }
  }
  return ids
}

/** Find a node by ID in the tree */
const findTaxonomyNode = (nodes: TaxonomyTreeNode[], nodeId: string): TaxonomyTreeNode | null => {
  for (const node of nodes) {
    if (node.node_id === nodeId) return node
    if (node.children) {
      const found = findTaxonomyNode(node.children, nodeId)
      if (found) return found
    }
  }
  return null
}

export const QuestionsTableClient = ({
  questions,
  articleGroups,
  totalCount,
  page,
  pageSize,
  taxonomyTree,
  externalSelectedNodeId,
  externalSearchQuery,
  externalFilter,
}: QuestionsTableClientProps) => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set())
  const [internalSelectedNodeId, setInternalSelectedNodeId] = useState<string | null>(null)
  const [nodeGroups, setNodeGroups] = useState<ArticleGroup[] | null>(null)
  const [nodeLoading, setNodeLoading] = useState(false)
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState(externalSearchQuery)
  
  const activeNodeId = externalSelectedNodeId !== undefined ? externalSelectedNodeId : internalSelectedNodeId

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearchQuery(externalSearchQuery)
    }, 300)

    return () => {
      clearTimeout(handler)
    }
  }, [externalSearchQuery])

  const [expandedArticles, setExpandedArticles] = useState<Set<string>>(() => {
    if (articleGroups.length > 0) {
      return new Set([articleGroups[0].articleId ?? '__unassigned__'])
    }
    return new Set()
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  const navigateTo = (p: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('page', String(p))
    router.push(`/admin/knowledge/questions?${params.toString()}`)
  }

  const handleToggleExpand = useCallback((articleId: string | null) => {
    const key = articleId ?? '__unassigned__'
    setExpandedArticles((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }, [])

  const handleToggleSelect = useCallback((questionId: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      if (next.has(questionId)) {
        next.delete(questionId)
      } else {
        next.add(questionId)
      }
      return next
    })
  }, [])

  const handleToggleGroupSelect = useCallback((ids: string[], select: boolean) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev)
      for (const id of ids) {
        if (select) {
          next.add(id)
        } else {
          next.delete(id)
        }
      }
      return next
    })
  }, [])

  const handleNavigate = useCallback(
    (questionId: string) => {
      router.push(`/admin/knowledge/questions/${questionId}`)
    },
    [router],
  )

  const handleBulkDelete = async () => {
    const idsToDelete = [...selectedKeys]
    if (idsToDelete.length === 0) {
      return
    }

    const result = await bulkDeleteQuestions(idsToDelete)
    if (result.error) {
      toast({
        title: 'Delete failed',
        description: result.error,
        variant: 'error',
      })
      throw new Error(result.error)
    }

    setSelectedKeys(new Set())
    router.refresh()
    toast({
      title: 'Questions deleted',
      description: `${idsToDelete.length} ${idsToDelete.length === 1 ? 'question was' : 'questions were'} removed.`,
      variant: 'success',
    })
  }

  const handleNodeSelect = useCallback(async (nodeId: string | null) => {
    if (externalSelectedNodeId === undefined) {
      setInternalSelectedNodeId(nodeId)
    }

    if (nodeId === null && !debouncedSearchQuery) {
      setNodeGroups(null)
      return
    }

    if (nodeId === 'unassigned' && !debouncedSearchQuery) {
      setNodeGroups([])
      return
    }

    setNodeLoading(true)
    try {
      let topicIds: string[] = []

      if (nodeId && nodeId.startsWith('article:')) {
        topicIds = [nodeId.replace('article:', '')]
      } else if (nodeId) {
        const node = findTaxonomyNode(taxonomyTree, nodeId)
        if (node) {
          topicIds = [...collectAllNodeIds(node)]
        }
      }

      const { data } = await getQuestionsByTopicIds(topicIds, debouncedSearchQuery)
      setNodeGroups(data)
      setExpandedArticles(new Set(data.map(g => g.articleId ?? '__unassigned__')))
    } catch {
      setNodeGroups([])
    } finally {
      setNodeLoading(false)
    }
  }, [taxonomyTree, externalSelectedNodeId, debouncedSearchQuery])

  useEffect(() => {
    handleNodeSelect(activeNodeId)
  }, [activeNodeId, debouncedSearchQuery, handleNodeSelect])

  const displayGroups = useMemo(() => {
    const groups = nodeGroups !== null ? nodeGroups : (questions.length > 0 ? articleGroups : [])
    if (externalFilter !== 'missing_rationale') return groups

    return groups
      .map((group) => ({
        ...group,
        questions: group.questions.filter((question) => !question.rationale || question.rationale.trim() === ''),
        questionCount: group.questions.filter((question) => !question.rationale || question.rationale.trim() === '').length,
      }))
      .filter((group) => group.questionCount > 0)
  }, [nodeGroups, questions, articleGroups, externalFilter])
  const showEmptyPrompt = activeNodeId === null && nodeGroups === null && questions.length === 0 && !debouncedSearchQuery

  return (
    <div className="space-y-4 h-full flex flex-col">
      {/* Bulk action bar */}
      {selectedKeys.size > 0 && (
        <BulkActionBar
          selectedCount={selectedKeys.size}
          onDelete={handleBulkDelete}
          entityName="questions"
        />
      )}

      {/* Two-panel layout */}
      <div className={cn(
        'flex flex-1 overflow-hidden rounded-md border border-border bg-card',
        externalSelectedNodeId !== undefined ? 'border-none' : '',
      )}>
        {/* Left panel: unified taxonomy tree (only if not external) */}
        {externalSelectedNodeId === undefined && (
          <div className="flex w-[300px] shrink-0 flex-col overflow-hidden border-r border-border">
            <TaxonomyTree
              nodes={taxonomyTree}
              onSelect={(id) => handleNodeSelect(id)}
              activeNodeId={activeNodeId}
              showCounts={true}
              basePath="/admin/knowledge/questions"
              rootAction={{
                label: 'All Questions',
                onClick: () => handleNodeSelect(null),
                isActive: activeNodeId === null
              }}
            />
          </div>
        )}

        {/* Right panel: accordion groups */}
        <div className="flex-1 overflow-y-auto">
          {showEmptyPrompt ? (
            <div className="flex h-full items-center justify-center p-8">
              <div className="text-center">
                <CaretRight size={32} weight="duotone" className="mx-auto mb-3 text-border" />
                <p className="text-sm font-medium text-foreground">Select a subject or article</p>
                <p className="mt-1 text-[11px] text-muted-foreground">
                  Browse the taxonomy tree on the left to view questions by topic
                </p>
              </div>
            </div>
          ) : nodeLoading ? (
            <div className="flex h-full items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">Loading questions...</p>
            </div>
          ) : displayGroups.length === 0 ? (
            <div className="flex h-full items-center justify-center p-8">
              <p className="text-sm text-muted-foreground">No questions found for the selected topic</p>
            </div>
          ) : (
            <div className="space-y-2 p-3">
              {displayGroups.map((group) => {
                const key = group.articleId ?? '__unassigned__'
                return (
                  <ArticleAccordionGroup
                    key={key}
                    group={group}
                    isExpanded={expandedArticles.has(key)}
                    onToggleExpand={() => handleToggleExpand(group.articleId)}
                    selectedKeys={selectedKeys}
                    onToggleSelect={handleToggleSelect}
                    onToggleGroupSelect={handleToggleGroupSelect}
                    onNavigate={handleNavigate}
                  />
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {externalSelectedNodeId === undefined && totalPages > 1 && (
        <div className="flex items-center justify-between px-1 shrink-0 py-2">
          <p className="text-sm text-muted-foreground">
            Page {page} of {totalPages.toLocaleString()} &mdash; {totalCount.toLocaleString()} total questions
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigateTo(page - 1)}
              disabled={page <= 1}
              className="rounded-sm border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors duration-150 hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
            >
              Previous
            </button>
            <button
              onClick={() => navigateTo(page + 1)}
              disabled={page >= totalPages}
              className="rounded-sm border border-border px-3 py-1.5 text-sm text-text-secondary transition-colors duration-150 hover:bg-background disabled:cursor-not-allowed disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

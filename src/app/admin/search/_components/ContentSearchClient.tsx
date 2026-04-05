'use client'

import * as React from 'react'
import Link from 'next/link'
import { MagnifyingGlass } from '@phosphor-icons/react/dist/ssr'
import { createClient } from '@/lib/supabase/client'
import { SectionHeader } from '@/components/shared/section-header'
import { SearchInput } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { EmptyState } from '@/components/shared/empty-state'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface QuestionResult {
  question_id: string
  text: string
}

interface ArticleResult {
  article_id: string
  title: string
}

interface TaxonomyResult {
  node_id: string
  name: string
  ale_id: string
}

/* ------------------------------------------------------------------ */
/*  Client Component                                                   */
/* ------------------------------------------------------------------ */

export const ContentSearchClient = () => {
  const [inputValue, setInputValue] = React.useState('')
  const deferredValue = React.useDeferredValue(inputValue)
  const [loading, setLoading] = React.useState(false)
  const [questions, setQuestions] = React.useState<QuestionResult[]>([])
  const [articles, setArticles] = React.useState<ArticleResult[]>([])
  const [taxonomy, setTaxonomy] = React.useState<TaxonomyResult[]>([])
  const [hasSearched, setHasSearched] = React.useState(false)
  const [searchError, setSearchError] = React.useState<string | null>(null)

  const handleInputChange = React.useCallback((value: string) => {
    setInputValue(value)
    if (!value.trim()) {
      setQuestions([])
      setArticles([])
      setTaxonomy([])
      setHasSearched(false)
      setSearchError(null)
    }
  }, [])

  React.useEffect(() => {
    if (!deferredValue.trim()) return

    const performSearch = async () => {
      setLoading(true)
      setHasSearched(true)
      setSearchError(null)

      try {
        const supabase = createClient()
        const searchTerm = `%${deferredValue.trim()}%`

        const [qRes, aRes, tRes] = await Promise.all([
          supabase
            .from('questions')
            .select('question_id, text')
            .ilike('text', searchTerm)
            .limit(20),
          supabase
            .from('wiki_articles')
            .select('article_id, title')
            .ilike('title', searchTerm)
            .limit(20),
          supabase
            .from('taxonomy_tree')
            .select('node_id, name, ale_id')
            .or(`name.ilike.${searchTerm},ale_id.ilike.${searchTerm}`)
            .limit(20),
        ])

        setQuestions((qRes.data ?? []) as QuestionResult[])
        setArticles((aRes.data ?? []) as ArticleResult[])
        setTaxonomy((tRes.data ?? []) as TaxonomyResult[])
      } catch {
        setSearchError('Search failed. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    performSearch()
  }, [deferredValue])

  const totalCount = questions.length + articles.length + taxonomy.length

  const renderQuestions = () =>
    questions.map((q) => (
      <Link
        key={q.question_id}
        href={`/admin/knowledge/questions/${q.question_id}`}
        className="flex items-start gap-3 rounded-md border border-border p-3 transition-colors duration-150 hover:border-primary/30 hover:bg-muted/50"
      >
        <Badge variant="primary" size="xs" className="mt-0.5 shrink-0">
          Question
        </Badge>
        <span className="text-sm line-clamp-2">{q.text}</span>
      </Link>
    ))

  const renderArticles = () =>
    articles.map((a) => (
      <Link
        key={a.article_id}
        href={`/admin/articles/${a.article_id}`}
        className="flex items-start gap-3 rounded-md border border-border p-3 transition-colors duration-150 hover:border-primary/30 hover:bg-muted/50"
      >
        <Badge variant="success" size="xs" className="mt-0.5 shrink-0">
          Article
        </Badge>
        <span className="text-sm line-clamp-2">{a.title}</span>
      </Link>
    ))

  const renderTaxonomy = () =>
    taxonomy.map((t) => (
      <Link
        key={t.node_id}
        href="/admin/taxonomy"
        className="flex items-start gap-3 rounded-md border border-border p-3 transition-colors duration-150 hover:border-primary/30 hover:bg-muted/50"
      >
        <Badge variant="info" size="xs" className="mt-0.5 shrink-0">
          Taxonomy
        </Badge>
        <div className="min-w-0">
          <span className="text-sm line-clamp-1">{t.name}</span>
          {t.ale_id && (
            <span className="font-[family-name:var(--font-dm-mono)] text-[11px] text-muted-foreground block truncate">
              {t.ale_id}
            </span>
          )}
        </div>
      </Link>
    ))

  const noResults = hasSearched && !loading && totalCount === 0

  return (
    <div className="space-y-6">
      <SectionHeader
        eyebrow="Quality"
        title="Content Search"
        level="page"
      />

      <SearchInput
        placeholder="Search questions, articles, taxonomy..."
        onChange={handleInputChange}
        loading={loading}
        size="lg"
        shortcutHint="/"
      />

      {searchError && (
        <p className="text-sm text-destructive">{searchError}</p>
      )}

      {!hasSearched && !searchError && (
        <EmptyState
          icon={<MagnifyingGlass size={20} />}
          title="Search across all content"
          description="Type to search questions, articles, and taxonomy nodes."
        />
      )}

      {noResults && !searchError && (
        <EmptyState
          icon={<MagnifyingGlass size={20} />}
          title="No results found"
          description={`No content matches "${inputValue}". Try a different search term.`}
        />
      )}

      {hasSearched && totalCount > 0 && (
        <Tabs defaultValue="all">
          <TabsList variant="underline">
            <TabsTrigger value="all">
              All
              <Badge variant="default" size="xs" className="ml-1">
                {totalCount}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="questions">
              Questions
              <Badge variant="default" size="xs" className="ml-1">
                {questions.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="articles">
              Articles
              <Badge variant="default" size="xs" className="ml-1">
                {articles.length}
              </Badge>
            </TabsTrigger>
            <TabsTrigger value="taxonomy">
              Taxonomy
              <Badge variant="default" size="xs" className="ml-1">
                {taxonomy.length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="mt-4 space-y-2">
            {renderQuestions()}
            {renderArticles()}
            {renderTaxonomy()}
          </TabsContent>

          <TabsContent value="questions" className="mt-4 space-y-2">
            {questions.length > 0 ? (
              renderQuestions()
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No matching questions
              </p>
            )}
          </TabsContent>

          <TabsContent value="articles" className="mt-4 space-y-2">
            {articles.length > 0 ? (
              renderArticles()
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No matching articles
              </p>
            )}
          </TabsContent>

          <TabsContent value="taxonomy" className="mt-4 space-y-2">
            {taxonomy.length > 0 ? (
              renderTaxonomy()
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">
                No matching taxonomy nodes
              </p>
            )}
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}

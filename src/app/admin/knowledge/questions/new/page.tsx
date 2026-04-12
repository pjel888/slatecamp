import { redirect } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { canManageContent } from '@/lib/admin/roles'
import { createClient } from '@/lib/supabase/server'
import { QuestionEditor } from '@/components/admin/QuestionEditor'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import {
  getArticleFull,
} from '@/lib/actions/admin/content'
import { resolveTopicArticleContext } from '@/lib/admin/topic-article-resolution'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/ui/eyebrow'

interface PageProps {
  searchParams: Promise<{ topic?: string }>
}

const NewQuestionPage = async ({ searchParams }: PageProps) => {
  const authorized = await canManageContent()
  if (!authorized) redirect(ROUTES.admin.root)

  const { topic: topicId } = await searchParams
  const supabase = await createClient()

  const [{ data: nodes }, { data: primaryMappings }] = await Promise.all([
    supabase
      .from('taxonomy_tree')
      .select('node_id, name, lea_id, level, parent_id, subject_area, is_leaf')
      .order('level', { ascending: true })
      .order('name', { ascending: true }),
    supabase
      .from('wiki_article_taxonomy')
      .select('node_id, article_id')
      .eq('is_primary', true),
  ])

  const primaryArticleIds = [...new Set((primaryMappings || []).map((mapping) => mapping.article_id))]
  const mappedArticlesResult: {
    data: Array<{ article_id: string; title: string; status: string | null; updated_at: string }> | null
  } = primaryArticleIds.length
    ? await supabase
        .from('wiki_articles')
        .select('article_id, title, status, updated_at')
        .in('article_id', primaryArticleIds)
    : { data: [] }
  const mappedArticles = mappedArticlesResult.data || []

  const topicResolution = resolveTopicArticleContext({
    topicId,
    primaryMappings: primaryMappings || [],
    articles: mappedArticles,
  })
  const { topicArticles, selectedTopicArticle, hasAmbiguousPrimaryMappings } = topicResolution

  // Find linked article via topic_id if provided
  let article = null
  if (selectedTopicArticle) {
    article = await getArticleFull(selectedTopicArticle.articleId)
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-card px-6 py-4">
        <Breadcrumb
          items={[
            { label: 'Question Bank', href: ROUTES.admin.knowledgeQuestions },
            { label: 'Create Question' },
          ]}
        />
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Question Editor (60%) */}
        <div className="w-[60%] overflow-y-auto bg-card p-6">
          <div className="mb-6">
            <Eyebrow>Question Bank</Eyebrow>
            <h1 className="mt-1 text-2xl font-bold text-foreground">Create New Question</h1>
            <p className="mt-1 text-sm text-muted-foreground">Draft a new assessment item</p>
          </div>
          {hasAmbiguousPrimaryMappings ? (
            <div className="mb-4 rounded-md border border-warning/30 bg-warning-50 px-4 py-3 text-sm text-warning-700">
              Multiple primary article mappings exist for this topic. The editor is using the most recently updated article context until the mapping is cleaned up.
            </div>
          ) : null}
          <QuestionEditor 
            taxonomyNodes={nodes || []}
            topicArticles={topicArticles}
            question={topicId ? { topic_id: topicId, article_id: article?.article_id ?? null, correct_option_id: 'A' } as any : undefined} 
          />
        </div>

        {/* Right: Article Context (40%) - Sticky Reference Pane */}
        <div className="w-[40%] overflow-y-auto bg-surface-light p-6">
          <div className="mb-4">
            <Eyebrow>Reference Material</Eyebrow>
          </div>
          {article ? (
            <div className="space-y-4">
              <Card className="p-4">
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-lg font-bold text-foreground">{article.title}</h2>
                  <span className="rounded-full bg-success-50 px-2 py-0.5 text-[10px] font-mono font-bold uppercase text-emerald">
                    {article.status}
                  </span>
                </div>
                <div className="prose prose-sm mt-4 max-w-none text-text-secondary line-clamp-[20]">
                  <div dangerouslySetInnerHTML={{ __html: article.content.slice(0, 5000) + (article.content.length > 5000 ? '...' : '') }} />
                </div>
              </Card>
              <div className="flex justify-end">
                <a 
                  href={`/admin/knowledge/${article.article_id}`}
                  target="_blank"
                  className="text-xs font-medium text-primary hover:underline"
                >
                  Open Full Article &rarr;
                </a>
              </div>
            </div>
          ) : (
            <div className="flex h-full flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-8 text-center">
              <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-surface-light">
                <svg className="h-6 w-6 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <p className="text-sm font-medium text-muted-foreground">
                No Reference Context
              </p>
              <p className="mt-2 max-w-[200px] text-[11px] text-text-tertiary">
                Select a topic from the Knowledge Browser to view source material while writing questions.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default NewQuestionPage

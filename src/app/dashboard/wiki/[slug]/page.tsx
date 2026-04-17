import {
  WikiArticle,
  WikiArticleSkeleton,
  getArticleHeadings,
  WikiArticleHero,
  WikiHeader,
  WikiRightSidebar,
  WikiRightSidebarSkeleton,
  TeachBackPrompt,
  WrongAnswerBanner,
  WikiReadTracker,
} from '@/components/wiki'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getSubjectName } from '@/types/testing'
import { Suspense } from 'react'
import { estimateReadingTime } from '@/lib/wiki-markdown'
import { getTeachBackCriteria } from '@/lib/actions/teach-back'
import { ROUTES } from '@/lib/routes'
import { getArticleSources, getArticleSiblings } from '@/lib/actions/wiki-actions'
import { getCachedArticleAndNode } from '@/lib/actions/cached-queries'
import { getEIPromptsForArticle, getUserEIResponsesForArticle } from '@/lib/actions/ei-prompts'

const mapDifficulty = (level?: number | null): 'Foundational' | 'Intermediate' | 'Advanced' => {
  if (!level || level <= 1) return 'Foundational'
  if (level === 2) return 'Intermediate'
  return 'Advanced'
}

interface WikiArticlePageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ 
    minimal?: string
    from?: string
    topic?: string
  }>
}

/**
 * Single Wiki Article Page (Async Server Component)
 */
export default async function WikiArticlePage(props: WikiArticlePageProps) {
  const { slug } = await props.params
  const searchParams = await props.searchParams
  const isMinimal = searchParams.minimal === 'true'
  const fromWrongAnswer = searchParams.from === 'wrong-answer'
  const sourceTopicId = searchParams.topic

  // 1. Fetch main article & node data (cached)
  const { article, node } = await getCachedArticleAndNode(slug)

  if (!article) {
    return notFound()
  }

  // ALL secondary data in parallel — no more sequential waterfall
  const [eiPrompts, eiResponses, sources, teachBackCriteria, relatedTopics, siblings] = await Promise.all([
    getEIPromptsForArticle(article.article_id),
    getUserEIResponsesForArticle(article.article_id),
    getArticleSources(article.article_id),
    node?.node_id ? getTeachBackCriteria(node.node_id) : Promise.resolve(null),
    getRelatedTopics(node),
    node?.node_id ? getArticleSiblings(node.node_id) : Promise.resolve({ prev: null, next: null }),
  ])

  const practiceHref = ROUTES.quiz.setup('camp')
  const practiceLabel = 'Practice this Article'
  const wikiNodeId = node?.node_id ?? undefined
  const wikiNodeName = node?.name ?? undefined

  // Extract data for all zones
  const headings = getArticleHeadings(article)
  const readingTime = estimateReadingTime(article.content || '')

  const sidebarContent = (
    <WikiRightSidebar
      practiceHref={practiceHref}
      practiceLabel={practiceLabel}
      nodeId={wikiNodeId}
      articleId={article.article_id}
      topicName={wikiNodeName}
      relatedTopics={relatedTopics}
      headings={headings}
      articleSlug={article.slug}
      scrollContainerId="wiki-center-pane"
      sources={sources}
    />
  )

  return (
    <>
      <WikiHeader
        nodeId={wikiNodeId}
        articleId={article.article_id}
        articleTitle={article.title}
        articleSlug={article.slug}
        scrollContainerId="wiki-center-pane"
        mobileActionsContent={sidebarContent}
      />

      <div className="flex flex-1 min-h-0 relative">
        <main
          id="wiki-center-pane"
          className={cn(
            'flex-1 min-w-0 overflow-y-auto scroll-smooth bg-background flex flex-col',
            !isMinimal && 'selection:bg-primary/10 selection:text-primary'
          )}
        >
          <div className="flex-1">
            <div className={cn(
              'max-w-4xl mx-auto px-8 py-12',
              isMinimal && 'px-4 py-6 max-w-none'
            )}>
              {fromWrongAnswer && (
                <div className="mb-8">
                  <WrongAnswerBanner fromWrongAnswer={true} topicName={sourceTopicId || wikiNodeName || null} />
                </div>
              )}

              <WikiArticleHero
                title={article.title}
                subject={getSubjectName(node?.subject_area) || 'General Knowledge'}
                difficulty={mapDifficulty(node?.level)}
                readTime={`${readingTime} min`}
                updatedNote={article.updated_at ? `Updated ${new Date(article.updated_at).toLocaleDateString()}` : undefined}
                leaTestsYou="demonstrate comprehensive understanding of this architectural principle and apply it correctly in professional practice."
              />

              <Suspense fallback={<WikiArticleSkeleton />}>
                <WikiArticle
                  article={article}
                  nodeId={wikiNodeId}
                  nodeName={wikiNodeName}
                  eiPrompts={eiPrompts}
                  eiResponses={eiResponses}
                />
              </Suspense>

              {teachBackCriteria && (
                <div className="mt-16 pt-16 border-t border-wiki-border">
                  <TeachBackPrompt
                    topicId={wikiNodeId!}
                    topicName={wikiNodeName!}
                    entryPoint="wiki"
                  />
                </div>
              )}

            </div>
          </div>

          <WikiReadTracker
            articleId={article.article_id}
            scrollContainerId="wiki-center-pane"
          />

          {/* Prev/Next — sticky to the bottom, always visible. Hidden in print. */}
          {!isMinimal && (
            <div className="shrink-0 border-t border-border bg-background print:hidden">
              <div className="max-w-4xl mx-auto px-8 py-3 flex items-center justify-between text-xs text-muted-foreground">
                {siblings.prev ? (
                  <Link 
                    href={ROUTES.wiki.article(siblings.prev.slug || '')}
                    className="flex items-center gap-1 hover:text-primary transition-colors"
                  >
                    &larr; {siblings.prev.name}
                  </Link>
                ) : <span />}
                
                {siblings.next ? (
                  <Link 
                    href={ROUTES.wiki.article(siblings.next.slug || '')}
                    className="flex items-center gap-1 hover:text-primary transition-colors text-right"
                  >
                    {siblings.next.name} &rarr;
                  </Link>
                ) : <span />}
              </div>
            </div>
          )}
        </main>

        {!isMinimal && (
          <aside className="hidden xl:block w-[280px] shrink-0 border-l border-border bg-background overflow-y-auto">
            <Suspense fallback={<div className="p-6"><WikiRightSidebarSkeleton /></div>}>
              <div className="p-6 sticky top-0">
                {sidebarContent}
              </div>
            </Suspense>
          </aside>
        )}
      </div>
    </>
  )
}

/** Fetch siblings or related topics helper */
async function getRelatedTopics(node: any) {
  if (!node?.parent_id) return []
  const supabase = await createClient()
  const { data } = await supabase
    .from('taxonomy_tree')
    .select('name, slug')
    .eq('parent_id', node.parent_id)
    .neq('node_id', node.node_id)
    .is('deprecated_at', null)
    .limit(3)

  return (data || []).map(d => ({ title: d.name, slug: d.slug || '' }))
}

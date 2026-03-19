import {
  getWikiArticleBySlug,
  getWikiArticleByTaxonomySlug,
  getActiveTaxonomyNode,
} from '@/lib/actions/wiki-actions'
import { getEIPromptsForArticle, getUserEIResponsesForArticle } from '@/lib/actions/ei-prompts'
import { WikiArticle, getArticleHeadings } from '@/components/wiki/WikiArticle'
import { WikiArticleHeader } from '@/components/wiki/WikiArticleHeader'
import { WikiHeader } from '@/components/wiki/WikiHeader'
import { WikiRightSidebar } from '@/components/wiki/WikiRightSidebar'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'
import { estimateReadingTime } from '@/lib/wiki-markdown'
import { getTeachBackCriteria } from '@/lib/actions/teach-back'
import { TeachBackPrompt } from '@/components/wiki/TeachBackPrompt'
import { WrongAnswerBanner } from '@/components/wiki/WrongAnswerBanner'
import { WikiReadTracker } from '@/components/wiki/WikiReadTracker'

interface PageProps {
  params: Promise<{
    slug: string
  }>
}

export default async function WikiArticlePage({ params }: PageProps) {
  const { slug } = await params

  // 1. Try direct article slug
  let article = await getWikiArticleBySlug(slug)

  // 2. Fallback to taxonomy node slug
  if (!article) {
    article = await getWikiArticleByTaxonomySlug(slug)
  }

  // 3. Get the associated taxonomy node
  const node = await getActiveTaxonomyNode(slug)

  // 4. If still not found, check if it's a valid taxonomy slug but just missing an article
  if (!article) {
    const supabase = await createClient()
    const { data: nodeData } = await supabase
      .from('taxonomy_tree')
      .select('name, node_id')
      .eq('slug', slug)
      .maybeSingle()

    if (nodeData) {
      return (
        <>
          <Suspense fallback={null}>
            <div className="sticky top-0 z-30 border-b border-zinc-200 bg-background">
              <WikiHeader nodeId={nodeData.node_id} />
            </div>
          </Suspense>

          <div className="flex-1 overflow-y-auto flex items-center justify-center">
            <div className="text-center p-12 bg-white rounded-md border border-zinc-100 shadow-sm max-w-lg">
              <h1 className="text-xl font-bold text-zinc-900 mb-3">
                {nodeData.name}
              </h1>
              <p className="text-zinc-500 mb-8 leading-relaxed">
                We&apos;re currently drafting the authoritative content for this topic.
                Check back soon for comprehensive coverage of {nodeData.name}.
              </p>
              <div className="flex justify-center mb-8">
                <Link href={`/dashboard/testing?topicId=${nodeData.node_id}`}>
                  <Button className="bg-primary hover:bg-[#1535A8] text-white font-bold rounded-sm px-8">
                    Practice this Topic anyway
                  </Button>
                </Link>
              </div>
              <div className="h-px w-full bg-zinc-100 mb-8" />
              <p className="text-sm text-zinc-400 italic">
                Knowledge ID: {nodeData.node_id}
              </p>
            </div>
          </div>
        </>
      )
    }
  }

  if (!article) {
    notFound()
  }

  // Extract data for all zones
  const headings = getArticleHeadings(article)
  const readingTime = estimateReadingTime(article.content || '')

  // Fetch EI prompts + user responses in parallel
  const [eiPrompts, eiResponses] = await Promise.all([
    getEIPromptsForArticle(article.article_id),
    getUserEIResponsesForArticle(article.article_id),
  ])

  const practiceHref = node?.node_id
    ? `/dashboard/testing?topicId=${node.node_id}`
    : `/dashboard/testing?articleId=${article.article_id}`
  const practiceLabel = `Practice this ${node?.name ? 'Topic' : 'Article'}`

  // Check if teach-back criteria exist for this topic
  const teachBackCriteria = node?.node_id
    ? await getTeachBackCriteria(node.node_id)
    : null

  // Related topics: sibling articles under the same parent taxonomy node
  let relatedTopics: { slug: string; title: string }[] = []
  if (node?.parent_id) {
    const supabase = await createClient()
    const { data: siblings } = await supabase
      .from('taxonomy_tree')
      .select('slug, name')
      .eq('parent_id', node.parent_id)
      .neq('node_id', node.node_id)
      .not('slug', 'is', null)
      .limit(3)

    if (siblings) {
      relatedTopics = siblings.map((s: any) => ({ slug: s.slug, title: s.name }))
    }
  }

  return (
    <>
      {/* Zone 1: Header — full-width, sticky top, fixed height */}
      <Suspense fallback={null}>
        <div className="sticky top-0 z-30 border-b border-zinc-200 bg-background">
          <WikiHeader
            nodeId={node?.node_id}
            articleTitle={article.title}
            articleSlug={article.slug}
            scrollContainerId="wiki-center-pane"
            mobileActionsContent={
              <WikiRightSidebar
                practiceHref={practiceHref}
                practiceLabel={practiceLabel}
                relatedTopics={relatedTopics}
                headings={headings}
                articleSlug={article.slug}
                scrollContainerId="wiki-center-pane"
              />
            }
          />
        </div>
      </Suspense>

      {/* Zone 3 + Zone 4 body */}
      <div className="flex flex-1 min-h-0">
        {/* Zone 3: Center Pane — flex column: scrollable article + sticky footer */}
        <main className="flex-1 min-w-0 flex flex-col h-full">
          {/* Scrollable article area */}
          <div
            id="wiki-center-pane"
            className="flex-1 overflow-y-auto"
          >
            {/* Read tracking — records open, tracks scroll depth + time spent */}
            <WikiReadTracker
              articleId={article.article_id}
              scrollContainerId="wiki-center-pane"
            />

            <div className="max-w-prose mx-auto px-6 py-8">
              {/* Wrong-answer context banner (UX Strategy Section 6) */}
              <Suspense fallback={null}>
                <WrongAnswerBanner />
              </Suspense>

              <WikiArticleHeader
                title={article.title}
                updatedAt={article.updated_at}
                readingTime={readingTime}
              />

              <WikiArticle
                article={article}
                nodeId={node?.node_id}
                nodeName={node?.name}
                eiPrompts={eiPrompts}
                eiResponses={eiResponses}
              />

              {/* Feature 7: Feynman Teach-Back (only if criteria exist for this topic) */}
              {teachBackCriteria && node?.node_id && node?.name && (
                <TeachBackPrompt
                  topicId={node.node_id}
                  topicName={node.name}
                  entryPoint="wiki"
                />
              )}
            </div>
          </div>

          {/* Prev/Next — sticky to the bottom, always visible. Hidden in print. */}
          <div className="shrink-0 border-t border-zinc-200 bg-background print:hidden">
            <div className="max-w-prose mx-auto px-6 py-3 flex items-center justify-between text-xs text-zinc-400">
              <span>&larr; Previous topic</span>
              <span>Next topic &rarr;</span>
            </div>
          </div>
        </main>

        {/* Zone 4: Right Sidebar — sticky, strict ordering. Hidden in print. */}
        <aside className="hidden lg:block print:!hidden w-56 shrink-0 border-l border-zinc-100 bg-zinc-50/30 h-full overflow-y-auto">
          <WikiRightSidebar
            practiceHref={practiceHref}
            practiceLabel={practiceLabel}
            relatedTopics={relatedTopics}
            headings={headings}
            articleSlug={article.slug}
            scrollContainerId="wiki-center-pane"
          />
        </aside>
      </div>
    </>
  )
}

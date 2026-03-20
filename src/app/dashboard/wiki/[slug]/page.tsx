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

const ITEM_STYLES: Record<string, { label: string; border: string; bg: string; text: string }> = {
  fact:           { label: 'Key Fact',        border: 'border-l-[#1B3FC4]', bg: 'bg-[#EEF2FC]',  text: 'text-[#1B3FC4]' },
  definition:     { label: 'Definition',      border: 'border-l-[#2D9F6F]', bg: 'bg-[#EDFAF4]',  text: 'text-[#2D9F6F]' },
  formula:        { label: 'Formula',         border: 'border-l-[#D4951A]', bg: 'bg-[#FEF8ED]',  text: 'text-[#D4951A]' },
  concept:        { label: 'Concept',         border: 'border-l-[#3B82C8]', bg: 'bg-[#EEF6FC]',  text: 'text-[#3B82C8]' },
  code_provision: { label: 'Code Provision',  border: 'border-l-[#8896A7]', bg: 'bg-[#F5F7FA]',  text: 'text-[#4A5568]' },
  exam_tip:       { label: 'Exam Tip',        border: 'border-l-[#E8853A]', bg: 'bg-[#FEF3E8]',  text: 'text-[#E8853A]' },
  warning:        { label: 'Warning',         border: 'border-l-[#D64545]', bg: 'bg-[#FDF0F0]',  text: 'text-[#D64545]' },
  heading:        { label: '',                border: '',                    bg: '',               text: '' },
  detail:         { label: 'Detail',          border: 'border-l-[#D4DAE3]', bg: 'bg-white',      text: 'text-[#4A5568]' },
  cross_ref:      { label: 'Cross Reference', border: 'border-l-[#D4DAE3]', bg: 'bg-[#F8F7F5]',  text: 'text-[#4A5568]' },
}

const WikiItemsRenderer = ({ items }: { items: { type: string; text: string }[] }) => (
  <>
    {items.map((item, i) => {
      if (item.type === 'heading') {
        return (
          <h2 key={i} className="text-base font-bold text-[#1A2332] mt-6 mb-2 first:mt-0">
            {item.text}
          </h2>
        )
      }

      const style = ITEM_STYLES[item.type] ?? ITEM_STYLES.detail

      return (
        <div
          key={i}
          className={`border-l-3 pl-4 py-2.5 rounded-r-sm ${style.border} ${style.bg}`}
        >
          {style.label && (
            <span className={`font-mono text-[11px] font-medium uppercase tracking-wider ${style.text} block mb-1`}>
              {style.label}
            </span>
          )}
          <p className="text-sm text-[#1A2332] leading-relaxed">{item.text}</p>
        </div>
      )
    })}
  </>
)

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

  // 4. If still not found, check if it's a valid taxonomy slug — render wiki_items as structured content
  if (!article) {
    const supabase = await createClient()
    const { data: nodeData } = await supabase
      .from('taxonomy_tree')
      .select('name, node_id, wiki_items, ale_id, exam_frequency, bloom_level')
      .eq('slug', slug)
      .maybeSingle()

    if (nodeData) {
      const wikiItems: { type: string; text: string }[] = Array.isArray(nodeData.wiki_items) ? nodeData.wiki_items : []

      return (
        <>
          <Suspense fallback={null}>
            <div className="sticky top-0 z-30 border-b border-zinc-200 bg-background">
              <WikiHeader nodeId={nodeData.node_id} />
            </div>
          </Suspense>

          <div className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-8">
              <h1 className="text-xl font-bold text-[#1A2332] mb-1">
                {nodeData.name}
              </h1>
              {nodeData.ale_id && (
                <p className="font-mono text-[11px] text-[#8896A7] mb-6">
                  {nodeData.ale_id}
                  {nodeData.exam_frequency && <span className="ml-3">Exam frequency: {nodeData.exam_frequency}</span>}
                  {nodeData.bloom_level && <span className="ml-3">Bloom: {nodeData.bloom_level}</span>}
                </p>
              )}

              {wikiItems.length > 0 ? (
                <div className="space-y-4">
                  <WikiItemsRenderer items={wikiItems} />
                </div>
              ) : (
                <p className="text-[#4A5568] leading-relaxed">
                  Content for this topic is being developed. Check back soon.
                </p>
              )}

              <div className="mt-8 pt-6 border-t border-[#D4DAE3]">
                <Link href={`/dashboard/testing?topicId=${nodeData.node_id}`}>
                  <Button className="bg-[#1B3FC4] hover:bg-[#1535A8] text-white font-bold rounded-sm px-8">
                    Practice this Topic
                  </Button>
                </Link>
              </div>
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

            <div className="max-w-4xl mx-auto px-8 py-8">
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
            <div className="max-w-4xl mx-auto px-8 py-3 flex items-center justify-between text-xs text-zinc-400">
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

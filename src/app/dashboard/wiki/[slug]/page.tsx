import { getArticleSources } from '@/lib/actions/wiki-actions'
import { getCachedArticleAndNode } from '@/lib/actions/cached-queries'
import { getEIPromptsForArticle, getUserEIResponsesForArticle } from '@/lib/actions/ei-prompts'
import { WikiArticle, getArticleHeadings } from '@/components/wiki/WikiArticle'
import { WikiItemRenderer } from '@/components/wiki/WikiItemRenderer'
import { WikiArticleHero } from '@/components/wiki/WikiArticleHero'
import { WikiHeader } from '@/components/wiki/WikiHeader'
import { WikiRightSidebar } from '@/components/wiki/WikiRightSidebar'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import Link from 'next/link'
import type { TaxonomyNode } from '@/lib/actions/taxonomy'
import { getSubjectName } from '@/types/testing'
import { Button } from '@/components/ui/button'
import { Suspense } from 'react'
import { estimateReadingTime } from '@/lib/wiki-markdown'
import { getTeachBackCriteria } from '@/lib/actions/teach-back'
import { TeachBackPrompt } from '@/components/wiki/TeachBackPrompt'
import { WrongAnswerBanner } from '@/components/wiki/WrongAnswerBanner'
import { WikiReadTracker } from '@/components/wiki/WikiReadTracker'
import { PrequestionGate } from '@/components/wiki/PrequestionGate'

const mapDifficulty = (level?: number | null): 'Foundational' | 'Intermediate' | 'Advanced' => {
  if (!level || level <= 1) return 'Foundational'
  if (level === 2) return 'Intermediate'
  return 'Advanced'
}

interface PageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

/** Fetch sibling articles under the same parent taxonomy node. */
async function getRelatedTopics(node: TaxonomyNode | null): Promise<{ slug: string; title: string }[]> {
  if (!node?.parent_id) return []
  const supabase = await createClient()
  const { data: siblings } = await supabase
    .from('taxonomy_tree')
    .select('slug, name')
    .eq('parent_id', node.parent_id)
    .neq('node_id', node.node_id)
    .not('slug', 'is', null)
    .limit(3)
  return siblings?.map((s: any) => ({ slug: s.slug, title: s.name })) ?? []
}

export default async function WikiArticlePage({ params, searchParams }: PageProps) {
  const [{ slug }, sp] = await Promise.all([params, searchParams])

  // Cached article + node lookup (revalidates hourly)
  const { article, node } = await getCachedArticleAndNode(slug)

  // Taxonomy-only fallback: node exists but no published article
  if (!article && node) {
    const wikiItems: { type: string; text: string; source_ref?: string }[] = Array.isArray((node as any).wiki_items) ? (node as any).wiki_items : []
    const threeDLabLinked: boolean = (node as any).three_d_lab_linked === true

    return (
      <>
        <Suspense fallback={null}>
          <div className="sticky top-0 z-30 border-b border-border bg-background">
            <WikiHeader nodeId={node.node_id} />
          </div>
        </Suspense>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-8 py-8">
            <h1 className="text-xl font-bold text-foreground mb-1">
              {node.name}
            </h1>
            {node.ale_id && (
              <p className="font-mono text-[11px] text-muted-foreground mb-6">
                {node.ale_id}
                {(node as any).exam_frequency && <span className="ml-3">Exam frequency: {(node as any).exam_frequency}</span>}
                {(node as any).bloom_level && <span className="ml-3">Bloom: {(node as any).bloom_level}</span>}
              </p>
            )}

            {wikiItems.length > 0 ? (
              <WikiItemRenderer
                items={wikiItems}
                aleId={node.ale_id}
                threeDLabLinked={threeDLabLinked}
              />
            ) : (
              <p className="text-text-secondary leading-relaxed">
                Content for this topic is being developed. Check back soon.
              </p>
            )}

            <div className="mt-8 pt-6 border-t border-border">
              <Link href={`/quiz/subject/setup`}>
                <Button className="font-bold rounded-sm px-8">
                  Practice this Topic
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </>
    )
  }

  if (!article) {
    notFound()
  }

  // Extract data for all zones
  const headings = getArticleHeadings(article)
  const readingTime = estimateReadingTime(article.content || '')

  // ALL secondary data in parallel — no more sequential waterfall
  const [eiPrompts, eiResponses, sources, teachBackCriteria, relatedTopics] = await Promise.all([
    getEIPromptsForArticle(article.article_id),
    getUserEIResponsesForArticle(article.article_id),
    getArticleSources(article.article_id),
    node?.node_id ? getTeachBackCriteria(node.node_id) : Promise.resolve(null),
    getRelatedTopics(node),
  ])

  const practiceHref = '/quiz/camp/setup'
  const practiceLabel = 'Practice this Article'
  const wikiNodeId = node?.node_id ?? undefined
  const wikiTopicName = node?.name ?? article.title

  return (
    <>
      {/* Zone 1: Header — full-width, sticky top, fixed height */}
      <Suspense fallback={null}>
        <div className="sticky top-0 z-30 border-b border-border bg-background">
          <WikiHeader
            nodeId={node?.node_id}
            articleId={article.article_id}
            articleTitle={article.title}
            articleSlug={article.slug}
            scrollContainerId="wiki-center-pane"
            mobileActionsContent={
              <WikiRightSidebar
                practiceHref={practiceHref}
                practiceLabel={practiceLabel}
                nodeId={wikiNodeId}
                topicName={wikiTopicName}
                relatedTopics={relatedTopics}
                headings={headings}
                articleSlug={article.slug}
                scrollContainerId="wiki-center-pane"
                sources={sources}
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

            {/* Pre-reading questions gate (IMPL_04: metacognitive priming) — skip when arriving from quiz feedback */}
            {node?.node_id && sp?.from !== 'quiz' ? (
              <PrequestionGate
                topicId={node.node_id}
                topicName={node.name ?? article.title}
              >
                <div className="max-w-4xl mx-auto px-8 py-8">
                  <WrongAnswerBanner
                    fromWrongAnswer={sp?.from === 'wrong-answer'}
                    topicName={(sp?.topic as string) ?? null}
                  />

                  <WikiArticleHero
                    subject={article.subject_label || (node?.ale_id ? `${node.ale_id} · ${getSubjectName(node.subject_area)}` : getSubjectName(node?.subject_area))}
                    difficulty={article.difficulty_label || mapDifficulty(node?.difficulty)}
                    readTime={`~${readingTime} min`}
                    title={article.title}
                    updatedNote={article.updated_note || `Updated ${new Date(article.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                    aleTestsYou={article.ale_tests_you || node?.description || 'Identify key concepts and apply them to exam scenarios.'}
                  />

                  <WikiArticle
                    article={article}
                    nodeId={node.node_id}
                    nodeName={node.name}
                    eiPrompts={eiPrompts}
                    eiResponses={eiResponses}
                  />

                  {teachBackCriteria && node.name && (
                    <TeachBackPrompt
                      topicId={node.node_id}
                      topicName={node.name}
                      entryPoint="wiki"
                    />
                  )}
                </div>
              </PrequestionGate>
            ) : (
              <div className="max-w-4xl mx-auto px-8 py-8">
                <WrongAnswerBanner
                  fromWrongAnswer={sp?.from === 'wrong-answer'}
                  topicName={(sp?.topic as string) ?? null}
                />

                <WikiArticleHero
                  subject={article.subject_label || (node?.ale_id ? `${node.ale_id} · ${getSubjectName(node.subject_area)}` : getSubjectName(node?.subject_area))}
                  difficulty={article.difficulty_label || mapDifficulty(node?.difficulty)}
                  readTime={`~${readingTime} min`}
                  title={article.title}
                  updatedNote={article.updated_note || `Updated ${new Date(article.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                  aleTestsYou={article.ale_tests_you || node?.description || 'Identify key concepts and apply them to exam scenarios.'}
                />

                <WikiArticle
                  article={article}
                  nodeId={node?.node_id}
                  nodeName={node?.name}
                  eiPrompts={eiPrompts}
                  eiResponses={eiResponses}
                />

                {teachBackCriteria && node?.node_id && node?.name && (
                  <TeachBackPrompt
                    topicId={node.node_id}
                    topicName={node.name}
                    entryPoint="wiki"
                  />
                )}
              </div>
            )}
          </div>

          {/* Prev/Next — sticky to the bottom, always visible. Hidden in print. */}
          <div className="shrink-0 border-t border-border bg-background print:hidden">
            <div className="max-w-4xl mx-auto px-8 py-3 flex items-center justify-between text-xs text-muted-foreground">
              <span>&larr; Previous topic</span>
              <span>Next topic &rarr;</span>
            </div>
          </div>
        </main>

        {/* Zone 4: Right Sidebar — sticky, strict ordering. Hidden in print. */}
        <aside className="hidden lg:block print:!hidden w-56 shrink-0 border-l border-border/60">
          <div className="sticky top-0 max-h-screen overflow-y-auto py-6 px-4">
            <WikiRightSidebar
              practiceHref={practiceHref}
              practiceLabel={practiceLabel}
              nodeId={wikiNodeId}
              topicName={wikiTopicName}
              relatedTopics={relatedTopics}
              headings={headings}
              articleSlug={article.slug}
              scrollContainerId="wiki-center-pane"
              sources={sources}
            />
          </div>
        </aside>
      </div>
    </>
  )
}

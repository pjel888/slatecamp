import {
  WikiArticle,
  WikiArticleSkeleton,
  getArticleHeadings,
  WikiArticleHero,
  WikiLearningJourney,
  WikiLearningCompletion,
  WikiHeader,
  WikiRightSidebar,
  WikiRightSidebarSkeleton,
  WrongAnswerBanner,
  WikiReadTracker,
} from '@/components/wiki'
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { getSubjectName } from '@/types/testing'
import { Suspense } from 'react'
import { estimateReadingTime } from '@/lib/wiki-markdown'
import { ROUTES } from '@/lib/routes'
import {
  getArticleSources,
  getArticleSiblings,
  type WikiArticleSource,
} from '@/lib/actions/wiki-actions'
import { getCachedArticleAndNode, getCachedTaxonomyTreeByDiscipline } from '@/lib/actions/cached-queries'
import {
  getEIPromptsForArticle,
  getUserEIResponsesForArticle,
  type EIPrompt,
  type EIResponseMap,
} from '@/lib/actions/ei-prompts'
import type { TaxonomyNode } from '@/lib/actions/taxonomy'
import { isDemoMode } from '@/lib/demo/config'

const mapDifficulty = (level?: number | null): 'Foundational' | 'Intermediate' | 'Advanced' => {
  if (!level || level <= 1) return 'Foundational'
  if (level === 2) return 'Intermediate'
  return 'Advanced'
}

const normalizeDifficulty = (label?: string | null, level?: number | null): 'Foundational' | 'Intermediate' | 'Advanced' => {
  if (label === 'Foundational' || label === 'Intermediate' || label === 'Advanced') return label
  return mapDifficulty(level)
}

const formatUpdatedNote = (updatedNote?: string | null, updatedAt?: string | null) => {
  if (updatedNote?.trim()) return updatedNote
  if (!updatedAt) return undefined
  return `Updated ${new Date(updatedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}`
}

const formatReadTime = (storedReadTime: string | null | undefined, minutes: number) => {
  if (storedReadTime?.trim()) return storedReadTime.replace(/\s*read$/i, '')
  return `${minutes} min`
}

const truncateMetadataDescription = (value: string, maxLength = 155) => {
  const normalized = value.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  return `${normalized.slice(0, maxLength - 1).trimEnd()}…`
}

interface ArticleLearningMetadata {
  title: string
  subject_label?: string | null
  difficulty_label?: string | null
  lea_tests_you?: string | null
}

const getArticleLearningContext = (
  article: ArticleLearningMetadata,
  node: TaxonomyNode | null,
) => {
  const subjectLabel = article.subject_label || getSubjectName(node?.subject_area) || 'General Knowledge'
  const difficultyLabel = normalizeDifficulty(article.difficulty_label, node?.difficulty ?? node?.level)
  const learningPurpose =
    article.lea_tests_you ||
    node?.description ||
    `Understand ${node?.name || article.title} well enough to recognize it in exam and practice scenarios.`

  return { subjectLabel, difficultyLabel, learningPurpose }
}

interface WikiArticlePageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ 
    minimal?: string
    from?: string
    topic?: string
  }>
}

export async function generateMetadata(
  props: Pick<WikiArticlePageProps, 'params'>,
): Promise<Metadata> {
  const { slug } = await props.params
  const { article, node } = await getCachedArticleAndNode(slug)

  if (!article) {
    return {
      title: 'Wiki Article Not Found | SlateCamp',
      robots: { index: false, follow: false },
    }
  }

  const { subjectLabel, difficultyLabel, learningPurpose } = getArticleLearningContext(article, node)
  const description = truncateMetadataDescription(learningPurpose)
  const title = `${article.title} | SlateCamp Wiki`

  return {
    title,
    description,
    robots: { index: false, follow: false },
    openGraph: {
      title,
      description,
      type: 'article',
    },
    twitter: {
      card: 'summary',
      title,
      description,
    },
    other: {
      'slatecamp:wiki-subject': subjectLabel,
      'slatecamp:wiki-difficulty': difficultyLabel,
    },
  }
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

  const demoMode = isDemoMode()

  // Demo-mode wiki smoke tests should prove route/content resolution without
  // waiting on optional personalization, teach-back, source, or sibling sidebars.
  // Live/staging runs keep the full parallel data fan-out below.
  const demoEIPrompts: EIPrompt[] = []
  const demoEIResponses: EIResponseMap = {}
  const demoSources: WikiArticleSource[] = []
  const [eiPrompts, eiResponses, sources, relatedTopics, siblings] = demoMode
    ? [demoEIPrompts, demoEIResponses, demoSources, [], { prev: null, next: null }] as const
    : await Promise.all([
        getEIPromptsForArticle(article.article_id),
        getUserEIResponsesForArticle(article.article_id),
        getArticleSources(article.article_id),
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
  const { subjectLabel, difficultyLabel, learningPurpose } = getArticleLearningContext(article, node)
  const readTimeLabel = formatReadTime(article.read_time, readingTime)
  const updatedNote = formatUpdatedNote(article.updated_note, article.updated_at)

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
        disciplineId={node?.discipline_id ?? undefined}
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
                subject={subjectLabel}
                difficulty={difficultyLabel}
                readTime={readTimeLabel}
                updatedNote={updatedNote}
                leaTestsYou={learningPurpose}
              />

              <WikiLearningJourney
                title={article.title}
                subject={subjectLabel}
                difficulty={difficultyLabel}
                readTime={readTimeLabel}
                whyItMatters={learningPurpose}
                nodeName={wikiNodeName}
                headings={headings}
                relatedTopics={relatedTopics}
                isMinimal={isMinimal}
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

              {!isMinimal && (
                <WikiLearningCompletion
                  title={article.title}
                  headings={headings}
                  nodeName={wikiNodeName}
                />
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
async function getRelatedTopics(node: TaxonomyNode | null) {
  if (!node?.parent_id || !node.discipline_id) return []

  const disciplineTree = await getCachedTaxonomyTreeByDiscipline(node.discipline_id)
  return disciplineTree
    .filter(
      (candidate) =>
        candidate.parent_id === node.parent_id &&
        candidate.node_id !== node.node_id,
    )
    .slice(0, 3)
    .map((candidate) => ({
      title: candidate.name,
      slug: candidate.slug || '',
    }))
}

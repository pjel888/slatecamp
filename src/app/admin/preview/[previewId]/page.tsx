import { notFound } from 'next/navigation'
import { Suspense } from 'react'

import { getEIPromptsForArticle, getUserEIResponsesForArticle } from '@/lib/actions/ei-prompts'
import { getArticleHeadings, WikiArticle, WikiHeader, WikiArticleHero, WikiRightSidebar, TeachBackPrompt } from '@/components/wiki'
import { getSubjectName } from '@/types/testing'
import { estimateReadingTime } from '@/lib/wiki-markdown'
import { getTeachBackCriteria } from '@/lib/actions/teach-back'
import type { TaxonomyNode } from '@/lib/actions/taxonomy'
import { requirePermissionOrRedirect } from '@/lib/admin/roles'
import { createAdminClient } from '@/lib/supabase/admin'

const mapDifficulty = (level?: number | null): 'Foundational' | 'Intermediate' | 'Advanced' => {
  if (!level || level <= 1) return 'Foundational'
  if (level === 2) return 'Intermediate'
  return 'Advanced'
}

/** Fetch sibling articles under the same parent taxonomy node. */
async function getRelatedTopics(node: TaxonomyNode | null, supabase: any): Promise<{ slug: string; title: string }[]> {
  if (!node?.parent_id) return []
  const { data: siblings } = await supabase
    .from('taxonomy_tree')
    .select('slug, name')
    .eq('parent_id', node.parent_id)
    .neq('node_id', node.node_id)
    .not('slug', 'is', null)
    .limit(3)
  return siblings?.map((s: any) => ({ slug: s.slug, title: s.name })) ?? []
}

/** 
 * Admin Preview Page
 * 
 * Note: loading.tsx is intentionally omitted for this route to replicate the 
 * student-view experience and leverage parent loading states or inline 
 * fallbacks where appropriate.
 */
export default async function PreviewPage(props: { params: Promise<{ previewId: string }> }) {
  await requirePermissionOrRedirect('admin.preview.view')

  const params = await props.params
  const previewId = params.previewId

  const supabase = createAdminClient()

  // 1. Fetch draft from DB
  const { data: draft, error: draftError } = await supabase
    .from('admin_draft_previews')
    .select('content, article_id')
    .eq('id', previewId)
    .single()

  if (draftError || !draft) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-full">
        <h2 className="text-xl font-bold text-foreground">Preview Not Found or Expired</h2>
        <p className="mt-2 text-muted-foreground">
          Please close this window and generate a new preview from the editor.
        </p>
      </div>
    )
  }

  // 2. Fetch the corresponding article metadata
  const { data: articleData, error: articleError } = await supabase
    .from('wiki_articles')
    .select('article_id, title, slug, lea_tests_you, updated_note, subject_label, difficulty_label, updated_at, created_at')
    .eq('article_id', draft.article_id)
    .single()

  if (articleError || !articleData) {
    notFound()
  }

  // Inject the draft content into the article object
  const article = {
    ...articleData,
    content: draft.content
  }

  // 3. Get node mappings (for topics, taxonomy info)
  const { data: mappings } = await supabase
    .from('wiki_article_taxonomy')
    .select('node_id, is_primary')
    .eq('article_id', article.article_id)

  const primaryMapping = mappings?.find((m) => m.is_primary) || mappings?.[0]
  let node = null
  if (primaryMapping) {
    const { data: nodeData } = await supabase
      .from('taxonomy_tree')
      .select('node_id, name, lea_id, subject_area, difficulty, description')
      .eq('node_id', primaryMapping.node_id)
      .single()
    node = nodeData
  }

  // 4. Extract data for zones
  const headings = getArticleHeadings(article)
  const readingTime = estimateReadingTime(article.content || '')

  const [eiPrompts, eiResponses, sources, teachBackCriteria, relatedTopics] = await Promise.all([
    getEIPromptsForArticle(article.article_id),
    getUserEIResponsesForArticle(article.article_id), // Wait, should we show responses in Admin preview? Actually `getUserEIResponsesForArticle` uses `auth.uid()`, which is fine since admin is authed.
    supabase
      .from('wiki_article_sources')
      .select('source_id, label, description, url, source_type, sort_order')
      .eq('article_id', article.article_id)
      .order('sort_order', { ascending: true })
      .then(({ data }) => data || []),
    node?.node_id ? getTeachBackCriteria(node.node_id) : Promise.resolve(null),
    getRelatedTopics(node, supabase),
  ])

  const practiceHref = '#'
  const practiceLabel = 'Practice is disabled in preview'
  const wikiNodeId = node?.node_id ?? undefined
  const wikiTopicName = node?.name ?? article.title

  return (
    <div className="flex flex-col h-screen bg-surface-light overflow-hidden">
      {/* Fake Header to replicate student view */}
      <Suspense fallback={null}>
        <div className="sticky top-0 z-30 border-b border-border bg-background">
          <WikiHeader
            nodeId={node?.node_id}
            articleId={article.article_id}
            articleTitle={article.title}
            articleSlug={article.slug}
            scrollContainerId="wiki-center-pane"
            disableUserActions={true}
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
                disableUserActions={true}
              />
            }
          />
        </div>
      </Suspense>

      {/* Main body area matching Student View structure (Zone 3 and 4) */}
      <div className="flex flex-1 min-h-0 bg-surface-light">
        <main className="flex-1 min-w-0 flex flex-col h-full relative">
          <div id="wiki-center-pane" className="flex-1 overflow-y-auto">
            <div className="max-w-4xl mx-auto px-8 py-8">
              <div className="mb-4 flex items-center rounded-sm border border-warning/30 bg-warning/10 px-4 py-2 text-[11px] text-warning shadow-sm">
                <span className="mr-1 font-semibold">Draft Preview Mode:</span> This is a live preview of your unsaved editor content. Read tracking and analytics are disabled.
              </div>
              
              <WikiArticleHero
                subject={article.subject_label || (node?.lea_id ? `${node.lea_id} · ${getSubjectName(node.subject_area)}` : getSubjectName(node?.subject_area))}
                difficulty={article.difficulty_label || mapDifficulty(node?.difficulty)}
                readTime={`~${readingTime} min`}
                title={article.title}
                updatedNote={article.updated_note || `Updated ${new Date(article.updated_at).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}`}
                leaTestsYou={article.lea_tests_you || node?.description || 'Identify key concepts and apply them to exam scenarios.'}
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
          </div>
        </main>

        <aside className="hidden lg:block print:!hidden w-56 shrink-0 border-l border-border/60 bg-surface-light">
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
              disableUserActions={true}
            />
          </div>
        </aside>
      </div>
    </div>
  )
}

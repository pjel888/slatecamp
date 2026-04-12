import { redirect, notFound } from 'next/navigation'
import { ROUTES } from '@/lib/routes'
import { canManageContent, canReviewContent } from '@/lib/admin/roles'
import { createClient } from '@/lib/supabase/server'
import { QuestionEditor } from '@/components/admin/QuestionEditor'
import { Breadcrumb } from '@/components/ui/breadcrumb'
import {
  getArticleFull,
} from '@/lib/actions/admin/content'
import { getQuestion } from '@/lib/actions/admin/question-queries'
import { Card } from '@/components/ui/card'
import { Eyebrow } from '@/components/ui/eyebrow'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { sanitizeMDX } from '@/lib/wiki-markdown'
import { isExceptionQuestionType, normalizeQuestionType } from '@/lib/admin/editor-integrity/standard-question'
import { Note, Warn, Tip, Example, Callout, AlertBox, CalloutBox, AuthorityContent, GenericBlock, SPP206RefServices, SPP207RefServices } from '@/components/wiki'

interface PageProps {
  params: Promise<{ id: string }>
}

const WIKI_PROSE_CLASS_NAME =
  'prose prose-wiki dark:prose-invert'

const mdxComponents = {
  Note,
  Warn,
  Warning: Warn,
  Tip,
  Example,
  Callout,
  AlertBox,
  CalloutBox,
  AuthorityContent,
  h2: (props: any) => <h2 className="text-xl font-bold mt-6 mb-3 text-foreground" {...props} />,
  h3: (props: any) => <h3 className="text-lg font-bold mt-4 mb-2 text-foreground" {...props} />,
  p: (props: any) => <p className="text-sm leading-relaxed mb-4 text-text-secondary" {...props} />,
  ul: (props: any) => <ul className="list-disc pl-5 mb-4 space-y-1 text-sm text-text-secondary" {...props} />,
  ol: (props: any) => <ol className="list-decimal pl-5 mb-4 space-y-1 text-sm text-text-secondary" {...props} />,
  li: (props: any) => <li className="mb-1" {...props} />,
  code: (props: any) => <code className="bg-muted px-1.5 py-0.5 rounded font-mono text-[13px]" {...props} />,
  // Generic passthrough for AI-hallucinated component names
  ConflictMatrix: GenericBlock,
  EthicalFramework: GenericBlock,
  RegulationFramework: GenericBlock,
  WikiExactTable: GenericBlock,
  InfoBox: GenericBlock,
  Alert: AlertBox,
  QuestionBank: GenericBlock,
  ComparisonChart: GenericBlock,
  TechnicalBox: GenericBlock,
  DataQualitySpec: GenericBlock,
  DataTable: GenericBlock,
  ComplianceChecklist: GenericBlock,
  SensorTable: GenericBlock,
  BEMSFunctionality: GenericBlock,
  EnergyDashboard: GenericBlock,
  PriceBreakdown: GenericBlock,
  // No-op stubs
  SPP206RefServices,
  SPP207RefServices,
}

const ArticlePreview = async ({ content }: { content: string }) => {
  let mdxContent: React.ReactNode

  try {
    const sanitized = sanitizeMDX(content)
    const { content: compiledContent } = await compileMDX({
      source: sanitized,
      components: mdxComponents,
      options: { mdxOptions: { remarkPlugins: [remarkGfm] } },
    })
    mdxContent = compiledContent
  } catch (err) {
    console.error('MDX Compilation Error:', err)
    return <div className="whitespace-pre-wrap text-sm font-sans">{content}</div>
  }

  return <div className={WIKI_PROSE_CLASS_NAME}>{mdxContent}</div>
}

const QuestionDetailPage = async ({ params }: PageProps) => {
  const [canManage, canReview] = await Promise.all([
    canManageContent(),
    canReviewContent(),
  ])
  if (!canManage && !canReview) redirect(ROUTES.admin.root)

  const { id } = await params
  
  // Fetch question with normalization helper
  const question = await getQuestion(id)
  if (!question) notFound()

  const supabase = await createClient()

  // Fetch all taxonomy nodes for the selector
  const { data: nodes } = await supabase
    .from('taxonomy_tree')
    .select('node_id, name, lea_id, level, parent_id, subject_area, is_leaf')
    .order('level', { ascending: true })
    .order('name', { ascending: true })

  const normalizedQuestionType = normalizeQuestionType((question as any).question_type)

  // Find linked article via direct article ownership. Fallback topic mapping is reserved for
  // exception-class questions that are not directly article-owned.
  let article = null
  if ((question as any).article_id) {
    article = await getArticleFull((question as any).article_id)
  }

  if (!article && question.topic_id && isExceptionQuestionType(normalizedQuestionType)) {
    const { data: mapping } = await supabase
      .from('wiki_article_taxonomy')
      .select('article_id')
      .eq('node_id', question.topic_id)
      .eq('is_primary', true)
      .single()

    if (mapping) {
      article = await getArticleFull(mapping.article_id)
    }
  }

  return (
    <div className="flex h-[calc(100vh-4rem)] flex-col overflow-hidden">
      <div className="shrink-0 border-b border-border bg-card px-6 py-4">
        <Breadcrumb
          items={[
            { label: 'Question Bank', href: ROUTES.admin.knowledgeQuestions },
            { label: 'Question Editor' },
          ]}
        />
      </div>
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Question Editor (60%) */}
        <div className="w-[60%] overflow-y-auto bg-card p-6">
          <div className="mb-6">
            <Eyebrow>Question Moderation</Eyebrow>
            <h1 className="text-2xl font-bold text-foreground mt-1">Edit Question</h1>
            <p className="text-sm text-muted-foreground mt-1 font-mono">{question.id}</p>
          </div>
          {!canManage ? (
            <div className="mb-4 rounded-md border border-primary/20 bg-primary-50 px-4 py-3 text-sm text-primary-700">
              Reviewer mode is read-only here. Inspect the question and linked article context, then use the review queue to approve or request changes.
            </div>
          ) : null}
          <QuestionEditor
            readOnly={!canManage}
            taxonomyNodes={nodes || []}
            question={{
              ...(question as any),
              article_id: article?.article_id ?? (question as any).article_id ?? null,
              question_type: (question as any).question_type ?? 'mcq',
            }}
          />
        </div>

        {/* Right: Article Context (40%) - Sticky Reference Pane */}
        <div className="w-[40%] overflow-y-auto bg-surface-light p-6">
          <div className="mb-4">
            <Eyebrow>Article Reference</Eyebrow>
          </div>
          {article ? (
            <div className="space-y-4">
              <Card className="p-4">
                <h2 className="mb-4 text-lg font-bold text-foreground">{article.title}</h2>
                <ArticlePreview content={article.content.slice(0, 5000) + (article.content.length > 5000 ? '...' : '')} />
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
            <div className="h-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-card/50 p-8 text-center">
              <p className="text-sm text-muted-foreground">
                This question is not currently linked to a direct article owner.
              </p>
              <p className="mt-2 text-[11px] text-text-tertiary">
                Standard questions must carry `article_id`. Exception-class questions may use topic context only when supported by their dedicated workflow.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default QuestionDetailPage

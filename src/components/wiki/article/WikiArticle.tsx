import React, { Suspense } from 'react'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { Skeleton } from '@/components/ui/skeleton'
import {
  containsSlatecampUiBlockPlaceholder,
  createHeadingIdTracker,
  createMdxFallbackSource,
  extractHeadings,
  repairSlatecampUiBlockPlaceholdersForRender,
  sanitizeMDX,
  injectEIPrompts,
} from '@/lib/wiki-markdown'
import type { WikiArticle as WikiArticleType } from '@/types/app'
import type { TocHeading } from '@/lib/wiki-markdown'
import type { EIPrompt as EIPromptType, EIResponseMap } from '@/lib/actions/ei-prompts'
import { WikiHighlighter } from '../shared/WikiHighlighter'
import { WikiNoteAnchor } from '../shared/WikiNoteAnchor'
import { WikiTextSelection } from '../shared/WikiTextSelection'
import { resolveWidgets } from '../widgets/registry'
import { WikiArticleError } from './WikiArticleError'

// --- COMPONENTS FOR MDX ---
import { Note, Warn, Tip, Example, Callout, AlertBox, CalloutBox, AuthorityContent } from '../blocks/Callout'
import { WikiCalloutBox } from '../blocks/WikiCalloutBox'
import { WikiExamTable } from '../blocks/WikiExamTable'
import { WikiArticleHero } from './WikiArticleHero'
import { WikiPartHeader } from '../blocks/WikiPartHeader'
import { WikiChangedPill } from '../blocks/WikiChangedPill'
import { WikiMistakeCard } from '../blocks/WikiMistakeCard'
import { WikiMistakeList } from '../blocks/WikiMistakeList'
import { ElaborativeInterrogation } from '../blocks/ElaborativeInterrogation'
import { KeyValues } from '../blocks/KeyValues'
import { FormulaBlock } from '../blocks/FormulaBlock'
import { InlineQuiz } from '../blocks/InlineQuiz'
import { Tabs, Tab } from '../blocks/WikiTabs'
import { Accordion, AccordionItem } from '../blocks/WikiAccordion'
import { ExamTip } from '../blocks/ExamTip'
import { ComparisonTable } from '../blocks/ComparisonTable'
import { SubjectSnapshot } from '../blocks/SubjectSnapshot'
import { LawCallout } from '../blocks/LawCallout'
import { RevealBlock } from '../blocks/RevealBlock'
import { WikiReference } from '../shared/WikiReference'
import { Mermaid } from '../blocks/Mermaid'
import { WikiTableTabs } from '../blocks/WikiTableTabs'
import { WikiPre } from '../blocks/WikiPre'
import { GenericBlock, SPP206RefServices, SPP207RefServices } from '../blocks/GenericBlock'
import { ArticleMedia } from '../blocks/ArticleMedia'
import { DoorHinge3D } from '../blocks/DoorHinge3D'
import { SourceList, SourceQuote, SourceRef } from '../blocks/SourceReference'

interface WikiArticleProps {
  article: WikiArticleType
  nodeId?: string
  nodeName?: string
  eiPrompts?: EIPromptType[]
  eiResponses?: EIResponseMap
}

const WIKI_PROSE_CLASS_NAME =
  'prose prose-wiki dark:prose-invert'

function getHeadingText(children: React.ReactNode): string {
  return React.Children.toArray(children)
    .map((child) => {
      if (typeof child === 'string' || typeof child === 'number') return String(child)
      if (React.isValidElement<{ children?: React.ReactNode }>(child)) {
        return getHeadingText(child.props.children)
      }
      return ''
    })
    .join('')
}

function createWikiHeadingComponents() {
  const nextHeadingId = createHeadingIdTracker()

  const WikiH2 = ({ children, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h2 id={id || nextHeadingId(getHeadingText(children))} {...props}>
      {children}
    </h2>
  )

  const WikiH3 = ({ children, id, ...props }: React.HTMLAttributes<HTMLHeadingElement>) => (
    <h3 id={id || nextHeadingId(getHeadingText(children))} {...props}>
      {children}
    </h3>
  )

  return { h2: WikiH2, h3: WikiH3 }
}

/** Stable component for Tables */
function WikiTable(props: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="not-prose my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  )
}

/** Stable component for Table Head */
function WikiTHead(props: any) {
  return <thead className="bg-muted dark:bg-muted" {...props} />
}

/** Stable component for Table Header Cells */
function WikiTH(props: any) {
  return <th className="px-3.5 py-2.5 text-left font-[var(--font-dm-mono)] text-[8px] font-medium uppercase tracking-[0.08em] text-muted-foreground border-b-[1.5px] border-border" {...props} />
}

/** Stable component for Table Cells */
function WikiTD(props: any) {
  return <td className="px-3.5 py-[11px] text-sm text-foreground border-b border-border/60 align-top leading-relaxed [&_strong]:text-foreground [&_strong]:font-semibold last:[&:where(tr:last-child_td)]:border-b-0" {...props} />
}

/** Stable component for Inline Code */
function WikiCode(props: any) {
  return <code {...props} />
}

/** Stable component for DB-driven EI prompts */
function EIPromptComponent(props: any) {
  const { idx, prompts, responses, articleId } = props
  if (!prompts || !responses) return null
  const prompt = prompts[idx]
  if (!prompt) return null
  const response = responses[prompt.prompt_id]
  return (
    <ElaborativeInterrogation
      promptId={prompt.prompt_id}
      question={prompt.prompt_text}
      answer={prompt.reveal_text}
      options={prompt.options}
      articleId={articleId}
      existingResponse={response ?? null}
    />
  )
}

/** Stable component for Legacy EI tags */
function WikiEIBlock(props: any) {
  return (
    <ElaborativeInterrogation 
      promptId="" 
      question={props.question} 
      answer={props.answer} 
      options={[]} 
      articleId={props.articleId} 
    />
  )
}

/** Master components map — ALL values are stable function references */
const WIKI_COMPONENTS = {
  table: WikiTable,
  thead: WikiTHead,
  th: WikiTH,
  td: WikiTD,
  pre: WikiPre,
  code: WikiCode,
  Note,
  Warn,
  Warning: Warn,
  Tip,
  Example,
  Callout,
  ExamTip,
  AlertBox,
  CalloutBox,
  AuthorityContent,
  ComparisonTable,
  SubjectSnapshot,
  WikiCalloutBox,
  WikiExamTable,
  WikiArticleHero,
  WikiPartHeader,
  WikiChangedPill,
  WikiMistakeCard,
  WikiMistakeList,
  MistakeCard: WikiMistakeCard,
  MistakeList: WikiMistakeList,
  Mistakes: WikiMistakeList,
  KeyValues,
  FormulaBlock,
  InlineQuiz,
  Tabs,
  Tab,
  Accordion,
  AccordionItem,
  ElaborativeInterrogation,
  LawCallout,
  RevealBlock,
  WikiReference,
  Mermaid,
  WikiTableTabs,
  WikiPre,
  EIPrompt: EIPromptComponent,
  EIBlock: WikiEIBlock,
  // Generic passthrough for AI-hallucinated or legacy component names
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

  // Article media — images, carousels, YouTube embeds, video, embeds
  ArticleMedia,
  DoorHinge3D,
  SourceRef,
  SourceQuote,
  SourceList,
}

export const getArticleHeadings = (article: WikiArticleType): TocHeading[] => {
  const content = article.content || ''
  const processedContent = content.replace(/\\n/g, '\n')
  return extractHeadings(processedContent)
}

export const compileWikiArticleWithRenderer = async ({
  article,
  eiPrompts = [],
  eiResponses = {},
}: {
  article: Pick<WikiArticleType, 'article_id' | 'content'>
  eiPrompts?: EIPromptType[]
  eiResponses?: EIResponseMap
}) => {
  const content = article.content || ''
  const rawContent = content.replace(/\\n/g, '\n')
  const cleaned = rawContent
    .replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')

  const processedContent = repairSlatecampUiBlockPlaceholdersForRender(
    injectEIPrompts(cleaned, eiPrompts)
  )
  if (containsSlatecampUiBlockPlaceholder(processedContent)) {
    throw new Error('Raw SLATECAMP_UI_BLOCK placeholders detected in article content. Content must be repaired before rendering.')
  }
  const sanitizedContent = sanitizeMDX(processedContent)
  const widgets = await resolveWidgets(sanitizedContent)
  const headingComponents = createWikiHeadingComponents()
  const components = { ...WIKI_COMPONENTS, ...headingComponents, ...widgets }
  const scope = {
    __mdx_prompts: eiPrompts,
    __mdx_responses: eiResponses,
    __mdx_article_id: article.article_id,
  }

  try {
    return await compileMDX({
      source: sanitizedContent,
      components,
      options: {
        mdxOptions: { remarkPlugins: [remarkGfm] },
        scope,
      },
    })
  } catch (error) {
    const fallbackSource = createMdxFallbackSource(processedContent)
    if (!fallbackSource || fallbackSource === sanitizedContent) throw error

    return await compileMDX({
      source: fallbackSource,
      components,
      options: {
        mdxOptions: { remarkPlugins: [remarkGfm] },
        scope,
      },
    })
  }
}

export const WikiArticle = async ({
  article,
  nodeId,
  nodeName,
  eiPrompts = [],
  eiResponses = {},
}: WikiArticleProps) => {
  if (!article) return null

  const content = article.content || ''
  const rawContent = content.replace(/\\n/g, '\n')
  const cleaned = rawContent
    .replace(/\[EI\][\s\S]*?\[\/EI\]/g, '')
    .replace(/<!--[\s\S]*?-->/g, '')
  
  const processedContent = repairSlatecampUiBlockPlaceholdersForRender(
    injectEIPrompts(cleaned, eiPrompts)
  )
  sanitizeMDX(processedContent)

  let mdxContent = null
  try {
    const { content: compiled } = await compileWikiArticleWithRenderer({
      article: {
        article_id: article.article_id,
        content: article.content || '',
      },
      eiPrompts,
      eiResponses,
    })
    mdxContent = compiled
  } catch (err: any) {
    console.warn('[MDX WARN] Falling back to article error state:', err.message)
    mdxContent = <WikiArticleError />
  }

  return (
    <>
      <WikiNoteAnchor
        article_id={article.article_id}
        article_title={article.title}
        topic_id={nodeId}
        topic_name={nodeName}
        source_url={`/dashboard/wiki/${article.article_id}`}
      />

      <Suspense fallback={null}><WikiHighlighter /></Suspense>
      <WikiTextSelection articleId={article.article_id} />

      <div className={`${WIKI_PROSE_CLASS_NAME} mt-8`}>
        {mdxContent}
      </div>
    </>
  )
}

export const WikiArticleSkeleton = () => {
  return (
    <div className="space-y-10 mt-8">
      {/* Article Hero Skeleton */}
      <div className="space-y-4">
        <Skeleton className="h-8 w-[60%] rounded-md opacity-40" />
        <div className="flex gap-3">
          <Skeleton className="h-4 w-24 rounded-full opacity-30" />
          <Skeleton className="h-4 w-20 rounded-full opacity-30" />
          <Skeleton className="h-4 w-16 rounded-full opacity-30" />
        </div>
      </div>

      {/* Paragraph blocks */}
      {[1, 2, 3].map((p) => (
        <div key={p} className="space-y-3">
          <Skeleton className="h-4 w-full opacity-40" />
          <Skeleton className="h-4 w-[95%] opacity-30" />
          <Skeleton className="h-4 w-[98%] opacity-40" />
          <Skeleton className="h-4 w-[40%] opacity-20" />
        </div>
      ))}

      {/* Block placeholder */}
      <div className="p-6 border border-border rounded-lg bg-muted/20 space-y-3">
        <Skeleton className="h-3 w-20 opacity-30" />
        <Skeleton className="h-4 w-full opacity-20" />
        <Skeleton className="h-4 w-2/3 opacity-20" />
      </div>
    </div>
  )
}

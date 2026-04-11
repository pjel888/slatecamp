import React, { Suspense } from 'react'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { Skeleton } from '@/components/ui/skeleton'
import { extractHeadings, sanitizeMDX } from '@/lib/wiki-markdown'
import type { WikiArticle as WikiArticleType } from '@/types/app'
import type { TocHeading } from '@/lib/wiki-markdown'
import type { EIPrompt as EIPromptType, EIResponseMap } from '@/lib/actions/ei-prompts'
import { WikiHighlighter } from '../shared/WikiHighlighter'
import { WikiNoteAnchor } from '../shared/WikiNoteAnchor'
import { WikiTextSelection } from '../shared/WikiTextSelection'
import { resolveWidgets } from '../widgets/registry'

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
import { WikiPre } from '../blocks/WikiPre'
import { GenericBlock, SPP206RefServices, SPP207RefServices } from '../blocks/GenericBlock'

interface WikiArticleProps {
  article: WikiArticleType
  nodeId?: string
  nodeName?: string
  eiPrompts?: EIPromptType[]
  eiResponses?: EIResponseMap
}

const WIKI_PROSE_CLASS_NAME =
  'prose prose-wiki dark:prose-invert'

/** Stable component for H2 headings */
function WikiH2(props: React.HTMLAttributes<HTMLHeadingElement>) {
  const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
  return <h2 id={id} {...props} />
}

/** Stable component for H3 headings */
function WikiH3(props: React.HTMLAttributes<HTMLHeadingElement>) {
  const id = props.children?.toString().toLowerCase().replace(/[^a-z0-9\s-]/g, '').trim().replace(/\s+/g, '-')
  return <h3 id={id} {...props} />
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
  h2: WikiH2,
  h3: WikiH3,
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
}

const injectEIPrompts = (content: string, prompts: EIPromptType[]): string => {
  if (prompts.length === 0) return content
  const promptsByHeading = new Map<string, number[]>()
  prompts.forEach((prompt, idx) => {
    const key = prompt.insert_after_heading.toLowerCase().trim()
    if (!promptsByHeading.has(key)) promptsByHeading.set(key, [])
    promptsByHeading.get(key)!.push(idx)
  })

  const lines = content.split('\n')
  const result: string[] = []
  for (const line of lines) {
    result.push(line)
    const headingMatch = line.match(/^(#{2,4})\s+(.+)$/)
    if (headingMatch) {
      const headingText = headingMatch[2].trim().toLowerCase()
      const indices = promptsByHeading.get(headingText)
      if (indices) {
        for (const idx of indices) {
          result.push('')
          result.push(`<EIPrompt idx={${idx}} prompts={__mdx_prompts} responses={__mdx_responses} articleId={__mdx_article_id} />`)
          result.push('')
        }
      }
    }
  }
  return result.join('\n')
}

export const getArticleHeadings = (article: WikiArticleType): TocHeading[] => {
  const content = article.content || ''
  const processedContent = content.replace(/\\n/g, '\n')
  return extractHeadings(processedContent)
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
  
  const processedContent = injectEIPrompts(cleaned, eiPrompts)
  const sanitizedContent = sanitizeMDX(processedContent)

  // Resolve dynamic widgets
  const widgets = await resolveWidgets(sanitizedContent)

  const components = { ...WIKI_COMPONENTS, ...widgets }
  const scope = {
    __mdx_prompts: eiPrompts,
    __mdx_responses: eiResponses,
    __mdx_article_id: article.article_id,
  }

  let mdxContent = null
  try {
    const { content: compiled } = await compileMDX({
      source: sanitizedContent,
      components,
      options: { 
        mdxOptions: { remarkPlugins: [remarkGfm] },
        scope 
      },
    })
    mdxContent = compiled
  } catch (err: any) {
    console.error('[MDX ERROR]', err.message)
    mdxContent = <pre className="p-4 bg-amber-50 text-amber-800 rounded-md overflow-auto">{sanitizedContent}</pre>
  }

  return (
    <>
      <WikiNoteAnchor
        article_id={article.article_id}
        article_title={article.title}
        topic_id={nodeId}
        topic_name={nodeName}
        source_url={`/dashboard/wiki/${article.slug}`}
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
    <div className="space-y-8 mt-8">
      {[1, 2, 3].map((p) => (
        <div key={p} className="space-y-3">
          <Skeleton className="h-4 w-full opacity-40" />
          <Skeleton className="h-4 w-[95%] opacity-30" />
          <Skeleton className="h-4 w-[98%] opacity-40" />
          <Skeleton className="h-4 w-[40%] opacity-20" />
        </div>
      ))}
    </div>
  )
}

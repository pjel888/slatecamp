import React, { Suspense } from 'react'
import { compileMDX } from 'next-mdx-remote/rsc'
import remarkGfm from 'remark-gfm'
import { extractHeadings } from '@/lib/wiki-markdown'
import type { WikiArticle as WikiArticleType } from '@/types/app'
import type { TocHeading } from '@/lib/wiki-markdown'
import type { EIPrompt as EIPromptType, EIResponseMap } from '@/lib/actions/ei-prompts'
import { WikiHighlighter } from './WikiHighlighter'
import { WikiNoteAnchor } from './WikiNoteAnchor'
import { WikiTextSelection } from './WikiTextSelection'
import { resolveWidgets } from './widgets/registry'

// --- COMPONENTS FOR MDX ---
import { Note, Warn, Tip, Example, Callout, AlertBox, CalloutBox, AuthorityContent } from './WikiCallout'
import { WikiCalloutBox } from './WikiCalloutBox'
import { WikiExamTable } from './WikiExamTable'
import { WikiArticleHero } from './WikiArticleHero'
import { WikiPartHeader } from './WikiPartHeader'
import { WikiChangedPill } from './WikiChangedPill'
import { WikiMistakeCard } from './WikiMistakeCard'
import { WikiMistakeList } from './WikiMistakeList'
import { ElaborativeInterrogation } from './ElaborativeInterrogation'
import { KeyValues } from './KeyValues'
import { FormulaBlock } from './FormulaBlock'
import { InlineQuiz } from './InlineQuiz'
import { Tabs, Tab } from './WikiTabs'
import { Accordion, AccordionItem } from './WikiAccordion'
import { ExamTip } from './ExamTip'
import { ComparisonTable } from './ComparisonTable'
import { SubjectSnapshot } from './SubjectSnapshot'
import { LawCallout } from './LawCallout'
import { RevealBlock } from './RevealBlock'
import { WikiReference } from './WikiReference'
import { Mermaid } from './Mermaid'
import { WikiPre } from './WikiPre'
import { GenericBlock, SPP206RefServices, SPP207RefServices } from './GenericBlock'

interface WikiArticleProps {
  article: WikiArticleType
  nodeId?: string
  nodeName?: string
  eiPrompts?: EIPromptType[]
  eiResponses?: EIResponseMap
}

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

  // Resolve dynamic widgets
  const widgets = await resolveWidgets(processedContent)

  const components = { ...WIKI_COMPONENTS, ...widgets }
  const scope = {
    __mdx_prompts: eiPrompts,
    __mdx_responses: eiResponses,
    __mdx_article_id: article.article_id,
  }

  let mdxContent = null
  try {
    const { content: compiled } = await compileMDX({
      source: processedContent,
      components,
      options: { 
        mdxOptions: { remarkPlugins: [remarkGfm] },
        scope 
      },
    })
    mdxContent = compiled
  } catch (err: any) {
    console.error('[MDX ERROR]', err.message)
    mdxContent = <pre className="p-4 bg-amber-50 text-amber-800 rounded-md overflow-auto">{processedContent}</pre>
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
      <WikiTextSelection />

      <div className="wiki-prose max-w-none mt-8">
        {mdxContent}
      </div>
    </>
  )
}

import React from 'react'
import { Note, Warn, Tip, Example, Callout } from './WikiCallout'
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

/** Derive a URL-safe anchor slug from heading text. */
function toHeadingId(children: React.ReactNode): string | undefined {
  if (!children) return undefined
  return children
    .toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
}

/** Stable component for H2 headings */
export function WikiH2(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h2 id={toHeadingId(props.children)} {...props} />
}

/** Stable component for H3 headings */
export function WikiH3(props: React.HTMLAttributes<HTMLHeadingElement>) {
  return <h3 id={toHeadingId(props.children)} {...props} />
}

/** Stable component for Tables */
export function WikiTable(props: React.HTMLAttributes<HTMLTableElement>) {
  return (
    <div className="not-prose my-4 overflow-x-auto">
      <table className="w-full border-collapse text-sm" {...props} />
    </div>
  )
}

/** Stable component for Table Head */
export function WikiTHead(props: React.HTMLAttributes<HTMLTableSectionElement>) {
  return <thead className="bg-muted dark:bg-muted" {...props} />
}

/** Stable component for Table Header Cells */
export function WikiTH(props: React.HTMLAttributes<HTMLTableCellElement>) {
  return <th className="px-3.5 py-2.5 text-left font-[var(--font-dm-mono)] text-[8px] font-medium uppercase tracking-[0.08em] text-muted-foreground border-b-[1.5px] border-border" {...props} />
}

/** Stable component for Table Cells */
export function WikiTD(props: React.HTMLAttributes<HTMLTableCellElement>) {
  return <td className="px-3.5 py-[11px] text-sm text-foreground border-b border-border/60 align-top leading-relaxed [&_strong]:text-foreground [&_strong]:font-semibold last:[&:where(tr:last-child_td)]:border-b-0" {...props} />
}

/** Stable component for Inline Code */
export function WikiCode(props: React.HTMLAttributes<HTMLElement>) {
  return <code {...props} />
}

/** Stable component for Legacy EI tags */
export function WikiEIBlock(props: { question: string; answer: string; articleId?: string }) {
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

/**
 * DB-driven EI prompt component.
 * Data is passed via props (injected during injectEIPrompts).
 */
export function EIPrompt(props: any) {
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

/** 
 * Master components map. 
 * ALL keys point to stable, named function references.
 */
export const baseMdxComponents = {
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
  EIBlock: WikiEIBlock,
  EIPrompt,
}

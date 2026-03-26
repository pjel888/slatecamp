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
import { LawCallout } from './LawCallout'
import { ExamTip } from './ExamTip'
import { AlertBox } from './AlertBox'
import { ComparisonTable } from './ComparisonTable'
import { SubjectSnapshot } from './SubjectSnapshot'
import { ProcessFlow } from './ProcessFlow'
import { AuthorityContent } from './AuthorityContent'
import { GenericBlock, SPP206RefServices, SPP207RefServices } from './GenericBlock'

/** Derive a URL-safe anchor slug from heading text. */
const toHeadingId = (children: React.ReactNode): string | undefined =>
  children
    ?.toString()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')

export const baseMdxComponents = {
  // Headings with auto-generated IDs for anchor linking
  h2: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    React.createElement('h2', { id: toHeadingId(props.children), ...props })
  ),
  h3: (props: React.HTMLAttributes<HTMLHeadingElement>) => (
    React.createElement('h3', { id: toHeadingId(props.children), ...props })
  ),

  // Tables — prototype wiki-table styling
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    React.createElement(
      'div',
      { className: 'not-prose my-4 overflow-x-auto' },
      React.createElement('table', { className: 'w-full border-collapse text-sm', ...props }),
    )
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    React.createElement('thead', { className: 'bg-muted dark:bg-[#252420]', ...props })
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    React.createElement('th', {
      className: 'px-3.5 py-2.5 text-left font-[var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[0.08em] text-[#A8A8A5] border-b-[1.5px] border-[#E0DED8] dark:border-[#3A3835]',
      ...props,
    })
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    React.createElement('td', {
      className: 'px-3.5 py-[11px] text-sm text-[#3D3D3A] border-b border-[#ECEAE4] align-top leading-relaxed [&_strong]:text-wiki-ink [&_strong]:font-semibold last:[&:where(tr:last-child_td)]:border-b-0 dark:text-[#C8C6C0] dark:border-[#3A3835] dark:[&_strong]:text-[#E2E0D8]',
      ...props,
    })
  ),

  // Code blocks — horizontal scroll, styled container
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    React.createElement('pre', {
      className: 'not-prose my-6 overflow-x-auto rounded-md bg-zinc-950 text-zinc-100 p-4 text-[13px] leading-relaxed font-mono border border-zinc-800',
      ...props,
    })
  ),
  code: (props: React.HTMLAttributes<HTMLElement>) => (
    React.createElement('code', props)
  ),

  // Callout blocks — available as JSX in MDX content
  Note,
  Warn,
  Warning: Warn,
  Tip,
  Example,
  Callout,

  // Wiki UI spec-v1 components — exam-focused article rendering
  WikiCalloutBox,
  WikiExamTable,
  WikiArticleHero,
  WikiPartHeader,
  WikiChangedPill,
  WikiMistakeCard,
  WikiMistakeList,

  // New spec-v1 components — interactive content blocks
  KeyValues,
  FormulaBlock,
  InlineQuiz,
  Tabs,
  Tab,
  Accordion,
  AccordionItem,

  // EI — direct MDX usage (not DB-driven, uses revealText prop)
  ElaborativeInterrogation,

  // Law citation callouts — color-coded by legal code
  LawCallout,

  // Exam-specific tip callout (blue, distinct from green Tip)
  ExamTip,

  // Type-mapped alert callout (requirement, warning, info, danger)
  AlertBox,

  // Comparison-styled table wrapper (alternating rows, blue header)
  ComparisonTable,

  // Compact metadata bar for subject overview articles
  SubjectSnapshot,

  // Ordered process timeline with vertical connector
  ProcessFlow,

  // Legal authority citation block
  AuthorityContent,

  // No-op stubs for self-closing reference tags
  SPP206RefServices,
  SPP207RefServices,

  // Generic passthrough for AI-hallucinated component names
  ConflictMatrix: GenericBlock,
  EthicalFramework: GenericBlock,
  RegulationFramework: GenericBlock,
  WikiExactTable: GenericBlock,
  InfoBox: GenericBlock,
  Alert: GenericBlock,
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
}

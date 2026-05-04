import React from 'react'
import {
  Note, Warn, Tip, Example, Callout, AlertBox, AuthorityContent,
  WikiCalloutBox, WikiExamTable, WikiArticleHero, WikiPartHeader,
  WikiChangedPill, WikiMistakeCard, WikiMistakeList, ElaborativeInterrogation,
  KeyValues, FormulaBlock, InlineQuiz, Tabs, Tab, Accordion, AccordionItem,
  LawCallout, ExamTip, ComparisonTable, SubjectSnapshot, ProcessFlow,
  GenericBlock, SPP206RefServices, SPP207RefServices
} from '@/components/wiki'

// Article media — visual infrastructure for images, carousels, YouTube embeds
import { ArticleMedia } from '@/components/wiki'

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

  // Tables — Flowbite-aligned wiki-table styling
  table: (props: React.HTMLAttributes<HTMLTableElement>) => (
    React.createElement(
      'div',
      { className: 'not-prose my-4 overflow-x-auto rounded-md border border-border' },
      React.createElement('table', { className: 'w-full border-collapse text-sm', ...props }),
    )
  ),
  thead: (props: React.HTMLAttributes<HTMLTableSectionElement>) => (
    React.createElement('thead', { className: 'bg-primary-50 sticky top-0 z-10 dark:bg-primary/10', ...props })
  ),
  th: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    React.createElement('th', {
      className: 'px-3.5 py-2.5 text-left font-[var(--font-dm-mono)] text-[10px] font-medium uppercase tracking-[0.08em] text-primary-700 border-b border-border dark:text-primary-300 dark:border-border',
      ...props,
    })
  ),
  tr: (props: React.HTMLAttributes<HTMLTableRowElement>) => (
    React.createElement('tr', {
      className: 'even:bg-muted/30 hover:bg-primary-50/50 transition-colors duration-100 dark:even:bg-muted/10 dark:hover:bg-primary/5',
      ...props,
    })
  ),
  td: (props: React.HTMLAttributes<HTMLTableCellElement>) => (
    React.createElement('td', {
      className: 'px-3.5 py-[11px] text-sm text-foreground border-b border-border align-top leading-relaxed [&_strong]:text-foreground [&_strong]:font-semibold last:[&:where(tr:last-child_td)]:border-b-0 dark:text-foreground',
      ...props,
    })
  ),

  // Code blocks — horizontal scroll, styled container
  pre: (props: React.HTMLAttributes<HTMLPreElement>) => (
    React.createElement('pre', {
      className: 'not-prose my-6 overflow-x-auto rounded-md bg-foreground text-background p-4 text-[13px] leading-relaxed font-mono border border-foreground/20',
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

  // Article media — images, carousels, YouTube embeds, video, embeds
  ArticleMedia,

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

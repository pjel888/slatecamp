import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/developer/Breadcrumbs'
import { ComponentPageLayout } from '@/components/developer/ComponentPageLayout'
import {
  getComponentBySlug,
  getComponentsByDomain,
} from '@/lib/developer/componentRegistry'
import type { PropsTableEntry } from '@/types/developer'

/* ------------------------------------------------------------------ */
/*  Content Blocks Domain — Component Documentation Pages              */
/* ------------------------------------------------------------------ */

interface ComponentData {
  propsTable: PropsTableEntry[]
  codeSnippet: string
  preview: React.ReactNode
}

/* ── InlineQuiz ──────────────────────────────────────────────────── */

const inlineQuizData: ComponentData = {
  propsTable: [
    { name: 'question', type: 'string', defaultValue: null, required: true, description: 'The quiz question text.' },
    { name: 'options', type: 'Array<{ id: string; text: string; correct?: boolean }>', defaultValue: null, required: true, description: 'Answer choices with correctness flag.' },
    { name: 'explanation', type: 'string', defaultValue: null, required: false, description: 'Rationale shown after answering.' },
    { name: 'source', type: 'string', defaultValue: null, required: false, description: 'Citation source for the correct answer.' },
  ],
  codeSnippet: `import { InlineQuiz } from '@/components/wiki/InlineQuiz'

<InlineQuiz
  question="What is the minimum corridor width for commercial occupancies?"
  options={[
    { id: 'a', text: '1.00 meter' },
    { id: 'b', text: '1.10 meters' },
    { id: 'c', text: '1.20 meters', correct: true },
    { id: 'd', text: '1.50 meters' },
  ]}
  explanation="PD 1096 mandates 1.20m minimum for commercial corridors."
  source="PD 1096, Section 401.3"
/>`,
  preview: (
    <div className="w-full max-w-md bg-card border border-border rounded-md p-5">
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-primary mb-2">
        Quick Check
      </p>
      <p className="text-sm font-medium text-foreground leading-snug mb-4">
        What is the minimum corridor width for commercial occupancies?
      </p>
      <div className="space-y-2">
        {[
          { id: 'a', text: '1.00 meter' },
          { id: 'b', text: '1.10 meters' },
          { id: 'c', text: '1.20 meters' },
          { id: 'd', text: '1.50 meters' },
        ].map((opt) => (
          <div
            key={opt.id}
            className="flex items-center gap-3 px-3 py-2.5 rounded-sm border border-border bg-card text-foreground"
          >
            <span className="flex-shrink-0 w-4 h-4 rounded-full border-2 border-border" />
            <span className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium text-muted-foreground mr-1">
              {opt.id.toUpperCase()}.
            </span>
            <span className="text-[13px]">{opt.text}</span>
          </div>
        ))}
      </div>
    </div>
  ),
}

/* ── FormulaBlock ────────────────────────────────────────────────── */

const formulaBlockData: ComponentData = {
  propsTable: [
    { name: 'formula', type: 'string', defaultValue: null, required: true, description: 'The formula expression to display.' },
    { name: 'variables', type: 'Array<{ symbol: string; label: string; unit?: string }>', defaultValue: null, required: false, description: 'Variable definitions shown below the formula.' },
    { name: 'title', type: 'string', defaultValue: null, required: false, description: 'Optional title above the formula.' },
  ],
  codeSnippet: `import { FormulaBlock } from '@/components/wiki/FormulaBlock'

<FormulaBlock
  formula="A = \\u03C0 \\u00D7 r\\u00B2"
  title="Area of a Circle"
  variables={[
    { symbol: 'A', label: 'Area', unit: 'sq m' },
    { symbol: 'r', label: 'Radius', unit: 'm' },
  ]}
/>`,
  preview: (
    <div className="w-full max-w-sm bg-card border border-border rounded-md p-5">
      <p className="font-[family-name:var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-[0.12em] text-muted-foreground mb-2">
        Formula
      </p>
      <p className="text-[11px] font-medium text-foreground mb-3">Area of a Circle</p>
      <div className="bg-muted/50 rounded-sm px-4 py-3 text-center mb-3">
        <span className="font-[family-name:var(--font-dm-mono)] text-lg text-foreground">
          A = <span className="text-primary">&#960;</span> &#215; r<sup>2</sup>
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex items-center gap-2 text-[12px]">
          <span className="font-[family-name:var(--font-dm-mono)] text-primary font-semibold">A</span>
          <span className="text-muted-foreground">Area (sq m)</span>
        </div>
        <div className="flex items-center gap-2 text-[12px]">
          <span className="font-[family-name:var(--font-dm-mono)] text-primary font-semibold">r</span>
          <span className="text-muted-foreground">Radius (m)</span>
        </div>
      </div>
    </div>
  ),
}

/* ── ExamTip ─────────────────────────────────────────────────────── */

const examTipData: ComponentData = {
  propsTable: [
    { name: 'children', type: 'React.ReactNode', defaultValue: null, required: true, description: 'Tip content to display.' },
    { name: 'title', type: 'string', defaultValue: "'Exam Tip'", required: false, description: 'Heading text for the callout.' },
    { name: 'variant', type: "'info' | 'warning' | 'strategy'", defaultValue: "'info'", required: false, description: 'Visual style variant.' },
  ],
  codeSnippet: `import { ExamTip } from '@/components/wiki/ExamTip'

<ExamTip title="Exam Tip" variant="strategy">
  Focus on the 2024 IRR updates to BP-344 — examiners
  frequently test the new threshold and door-closer
  force limits.
</ExamTip>`,
  preview: (
    <div className="w-full max-w-md rounded-md border-l-4 border-primary bg-[#EEF2FC] px-4 py-3">
      <div className="flex items-center gap-2 mb-1.5">
        <svg className="w-4 h-4 text-primary flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span className="text-[13px] font-semibold text-primary">Exam Tip</span>
      </div>
      <p className="text-[13px] text-foreground leading-relaxed">
        Focus on the 2024 IRR updates to BP-344 — examiners frequently test the
        new threshold and door-closer force limits.
      </p>
    </div>
  ),
}

/* ── Placeholder data for remaining components ───────────────────── */

const makePlaceholder = (title: string): ComponentData => ({
  propsTable: [
    { name: 'children', type: 'React.ReactNode', defaultValue: null, required: true, description: `Content for the ${title} block.` },
    { name: 'className', type: 'string', defaultValue: null, required: false, description: 'Additional CSS class names.' },
  ],
  codeSnippet: `import { ${title} } from '@/components/wiki/${title}'

<${title}>
  {/* Content here */}
</${title}>`,
  preview: (
    <div className="w-full max-w-md bg-muted/30 border border-dashed border-border rounded-md px-6 py-10 flex items-center justify-center">
      <span className="text-[13px] text-muted-foreground">
        Preview: {title}
      </span>
    </div>
  ),
})

/* ── Component data lookup ───────────────────────────────────────── */

const COMPONENT_DATA: Record<string, ComponentData> = {
  'inline-quiz': inlineQuizData,
  'formula-block': formulaBlockData,
  'exam-tip': examTipData,
  'process-flow': makePlaceholder('ProcessFlow'),
  'wiki-comparison-table': makePlaceholder('WikiComparisonTable'),
  'law-callout': makePlaceholder('LawCallout'),
  'alert-box': makePlaceholder('AlertBox'),
  'accordion': makePlaceholder('Accordion'),
  'teach-back-prompt': makePlaceholder('TeachBackPrompt'),
  'elaborative-interrogation': makePlaceholder('ElaborativeInterrogation'),
  'key-values': makePlaceholder('KeyValues'),
}

/* ------------------------------------------------------------------ */
/*  Static params                                                      */
/* ------------------------------------------------------------------ */

export const generateStaticParams = () =>
  getComponentsByDomain('content-blocks').map((c) => ({ component: c.slug }))

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const ContentBlocksComponentPage = async ({
  params,
}: {
  params: Promise<{ component: string }>
}) => {
  const { component } = await params
  const meta = getComponentBySlug('content-blocks', component)

  if (!meta) {
    notFound()
  }

  const data = COMPONENT_DATA[component]

  if (!data) {
    notFound()
  }

  return (
    <>
      <Breadcrumbs />
      <ComponentPageLayout
        title={meta.title}
        description={meta.description}
        domain="Content Blocks"
        status={meta.status}
        importPath={meta.importPath}
        filePath={meta.filePath}
        preview={data.preview}
        propsTable={data.propsTable}
        codeSnippet={data.codeSnippet}
        lastUpdated="2026-03-25"
      />
    </>
  )
}

export default ContentBlocksComponentPage

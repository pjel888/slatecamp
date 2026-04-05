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
    <div className="w-full max-w-md rounded-md border-l-4 border-primary bg-primary-50 px-4 py-3">
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

/* ── ProcessFlow ─────────────────────────────────────────────────── */

const processFlowData: ComponentData = {
  propsTable: [
    { name: 'children', type: 'React.ReactNode', defaultValue: null, required: true, description: 'An <ol> with <li> steps rendered as a vertical timeline.' },
  ],
  codeSnippet: `import { ProcessFlow } from '@/components/wiki/ProcessFlow'

<ProcessFlow>
  <ol>
    <li><strong>Step 1:</strong> Pre-application conference</li>
    <li><strong>Step 2:</strong> Submit building permit application</li>
    <li><strong>Step 3:</strong> Plan review and approval</li>
  </ol>
</ProcessFlow>`,
  preview: (
    <div className="w-full max-w-md pl-4 border-l-2 border-primary/30">
      <ol className="list-none m-0 p-0 space-y-4">
        {[
          { step: 'Pre-application Conference', desc: 'Consult with the Building Official on zoning, setback, and use requirements.' },
          { step: 'Submit Application', desc: 'File the building permit application with complete architectural and structural plans.' },
          { step: 'Plan Review', desc: 'The OBO reviews compliance with PD 1096, BP 344, and the Fire Code (RA 9514).' },
          { step: 'Permit Issuance', desc: 'Upon approval, the Building Permit and ancillary permits are released.' },
          { step: 'Construction & Inspection', desc: 'Periodic inspections at foundation, framing, and pre-occupancy stages.' },
        ].map((item) => (
          <li key={item.step} className="relative pl-6 text-sm leading-relaxed text-foreground before:content-[''] before:absolute before:left-[-13px] before:top-[7px] before:w-2.5 before:h-2.5 before:rounded-full before:bg-primary before:border-2 before:border-white before:shadow-[0_0_0_2px_rgba(27,63,196,0.3)]">
            <strong className="text-primary font-semibold">{item.step}.</strong>{' '}
            {item.desc}
          </li>
        ))}
      </ol>
    </div>
  ),
}

/* ── ComparisonTable ─────────────────────────────────────────────── */

const comparisonTableData: ComponentData = {
  propsTable: [
    { name: 'children', type: 'React.ReactNode', defaultValue: null, required: true, description: 'A <table> element with <thead> and <tbody>. Styles are applied via descendant selectors.' },
  ],
  codeSnippet: `import { ComparisonTable } from '@/components/wiki/ComparisonTable'

<ComparisonTable>
  <table>
    <thead>
      <tr><th>Parameter</th><th>Old Code</th><th>Revised IRR</th></tr>
    </thead>
    <tbody>
      <tr><td>Corridor Width</td><td>1.00 m</td><td>1.20 m</td></tr>
    </tbody>
  </table>
</ComparisonTable>`,
  preview: (
    <div className="w-full max-w-lg overflow-x-auto rounded-md border border-border">
      <table className="w-full border-collapse text-sm">
        <thead className="bg-primary">
          <tr>
            <th className="px-3.5 py-2.5 text-left text-xs font-semibold text-white">Parameter</th>
            <th className="px-3.5 py-2.5 text-left text-xs font-semibold text-white">PD 1096 (Original)</th>
            <th className="px-3.5 py-2.5 text-left text-xs font-semibold text-white">Revised IRR (2024)</th>
          </tr>
        </thead>
        <tbody>
          {[
            { param: 'Min. Ceiling Height', old: '2.40 m', revised: '2.70 m' },
            { param: 'Min. Corridor Width (Commercial)', old: '1.00 m', revised: '1.20 m' },
            { param: 'Door Closer Force Limit', old: 'Not specified', revised: '35 N max' },
            { param: 'Min. Habitable Room Area', old: '6.00 sq m', revised: '9.00 sq m' },
          ].map((row, i) => (
            <tr key={row.param} className={i % 2 === 0 ? 'bg-white' : 'bg-muted/30'}>
              <td className="px-3.5 py-[11px] text-sm text-foreground border-b border-border align-top leading-relaxed font-semibold">{row.param}</td>
              <td className="px-3.5 py-[11px] text-sm text-foreground border-b border-border align-top leading-relaxed">{row.old}</td>
              <td className="px-3.5 py-[11px] text-sm text-foreground border-b border-border align-top leading-relaxed">{row.revised}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  ),
}

/* ── LawCallout ──────────────────────────────────────────────────── */

const lawCalloutData: ComponentData = {
  propsTable: [
    { name: 'code', type: "'nbcp' | 'bp344' | 'ra9514' | 'bp220' | 'pd957' | 'irr'", defaultValue: null, required: true, description: 'Law identifier that determines border color and eyebrow label.' },
    { name: 'section', type: 'string', defaultValue: null, required: false, description: 'Section reference appended to the eyebrow label.' },
    { name: 'title', type: 'string', defaultValue: null, required: false, description: 'Bold heading below the eyebrow.' },
    { name: 'children', type: 'React.ReactNode', defaultValue: null, required: true, description: 'Body content of the callout.' },
  ],
  codeSnippet: `import { LawCallout } from '@/components/wiki/LawCallout'

<LawCallout code="nbcp" section="Rule VII, Section 708" title="Light and Ventilation">
  Every room intended for human habitation shall be provided with
  windows with a total free area of openings equal to at least 10%
  of the floor area of the room.
</LawCallout>`,
  preview: (
    <div className="w-full max-w-md rounded-r-lg border-l-[3px] border-primary bg-cobalt-light px-4 py-3">
      <span className="block font-mono text-[11px] font-medium uppercase tracking-widest text-primary mb-1">
        NBCP (PD 1096) — Rule VII, Section 708
      </span>
      <p className="text-sm font-semibold text-foreground mb-1">
        Light and Ventilation
      </p>
      <div className="text-sm text-foreground/80 leading-relaxed">
        Every room intended for human habitation shall be provided with
        windows with a total free area of openings equal to at least <strong className="font-semibold text-foreground">10% of the floor area</strong> of the room.
        Toilets, bathrooms, and laundry rooms shall have a window area of at least <strong className="font-semibold text-foreground">1/20 of the floor area</strong>.
      </div>
    </div>
  ),
}

/* ── AlertBox ────────────────────────────────────────────────────── */

const alertBoxData: ComponentData = {
  propsTable: [
    { name: 'type', type: "'requirement' | 'warning' | 'info' | 'danger'", defaultValue: "'info'", required: false, description: 'Visual variant that sets the icon, color, and label.' },
    { name: 'children', type: 'React.ReactNode', defaultValue: null, required: true, description: 'Body content of the alert.' },
  ],
  codeSnippet: `import { AlertBox } from '@/components/wiki/AlertBox'

<AlertBox type="warning">
  Do not confuse the minimum ceiling height of habitable rooms
  (2.70 m) with the minimum for mezzanines (1.80 m clear height).
  This is a frequent source of incorrect answers.
</AlertBox>`,
  preview: (
    <div className="w-full max-w-md rounded-md border-l-4 border-[hsl(var(--warning))]/30 bg-[hsl(var(--warning))]/5 px-4 py-3">
      <span className="flex items-center gap-2 mb-1.5">
        <svg className="w-4 h-4 text-[hsl(var(--warning))]" viewBox="0 0 256 256" fill="currentColor">
          <path d="M236.8,188.09,149.35,36.22h0a24.76,24.76,0,0,0-42.7,0L19.2,188.09a23.51,23.51,0,0,0,0,23.72A24.35,24.35,0,0,0,40.55,224h174.9a24.35,24.35,0,0,0,21.33-12.19A23.51,23.51,0,0,0,236.8,188.09ZM120,104a8,8,0,0,1,16,0v40a8,8,0,0,1-16,0Zm8,88a12,12,0,1,1,12-12A12,12,0,0,1,128,192Z" />
        </svg>
        <span className="text-xs font-semibold uppercase tracking-wider text-[hsl(var(--warning))]">
          Warning
        </span>
      </span>
      <span className="block text-sm text-foreground/80 leading-relaxed">
        Do not confuse the minimum ceiling height of habitable rooms (<strong className="font-semibold text-foreground">2.70 m</strong>) with the minimum for mezzanines (<strong className="font-semibold text-foreground">1.80 m clear height</strong>). This is a frequent source of incorrect answers on the ALE.
      </span>
    </div>
  ),
}

/* ── Accordion ───────────────────────────────────────────────────── */

const accordionData: ComponentData = {
  propsTable: [
    { name: 'children', type: 'React.ReactNode', defaultValue: null, required: true, description: 'AccordionItem children.' },
    { name: 'allowMultiple', type: 'boolean', defaultValue: 'false', required: false, description: 'Allow multiple items to be open simultaneously.' },
  ],
  codeSnippet: `import { Accordion, AccordionItem } from '@/components/wiki/Accordion'

<Accordion allowMultiple>
  <AccordionItem title="What is the minimum front setback?">
    Under PD 1096, the minimum front setback for residential
    buildings is 4.50 m from the property line.
  </AccordionItem>
  <AccordionItem title="Do corner lots have different rules?">
    Yes — corner lots require setbacks on both street-facing sides.
  </AccordionItem>
</Accordion>`,
  preview: (
    <div className="w-full max-w-md border border-border rounded-[10px] overflow-hidden">
      {[
        { q: 'What is the minimum front setback for residential lots?', a: 'Under PD 1096 Rule VIII, the minimum front yard setback is 4.50 m from the property line for residential buildings. Narrower setbacks apply only to inner-urban lots under specific zoning ordinances.' },
        { q: 'Do corner lots have different setback rules?', a: 'Yes. Corner lots require setbacks on both street-facing sides. The front setback applies to the longer frontage, and a side-street setback of at least 3.00 m applies to the shorter frontage.' },
        { q: 'Are there setback exemptions for firewalls?', a: 'Buildings with a firewall extending at least 300 mm above the roofline may reduce the side setback to zero on the firewall side, subject to the local building official\u2019s approval.' },
      ].map((item, i) => (
        <div key={item.q} className={i < 2 ? 'border-b border-border' : ''}>
          <button
            type="button"
            className="w-full flex justify-between items-center px-[18px] py-3.5 bg-background text-left text-sm font-semibold text-foreground"
          >
            {item.q}
            <svg aria-hidden="true" width="12" height="12" viewBox="0 0 12 12" fill="none" className={`text-muted-foreground transition-transform duration-200 ${i === 0 ? 'rotate-180' : ''}`}>
              <path d="M2.5 4.5L6 8L9.5 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          {i === 0 && (
            <div className="px-[18px] pb-4">
              <div className="text-[13px] text-muted-foreground leading-relaxed">
                {item.a}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  ),
}

/* ── TeachBackPrompt ─────────────────────────────────────────────── */

const teachBackPromptData: ComponentData = {
  propsTable: [
    { name: 'topicId', type: 'string', defaultValue: null, required: true, description: 'UUID of the wiki topic for server-side evaluation.' },
    { name: 'topicName', type: 'string', defaultValue: null, required: true, description: 'Human-readable topic name shown in the prompt.' },
    { name: 'entryPoint', type: "'wiki' | 'blindspot' | 'trail'", defaultValue: null, required: true, description: 'Where the teach-back was triggered from.' },
    { name: 'trailDayId', type: 'string', defaultValue: null, required: false, description: 'Optional trail-day UUID for trail-based teach-backs.' },
  ],
  codeSnippet: `import { TeachBackPrompt } from '@/components/wiki/TeachBackPrompt'

<TeachBackPrompt
  topicId="a1b2c3d4-..."
  topicName="minimum corridor width for commercial occupancies"
  entryPoint="wiki"
/>`,
  preview: (
    <div className="w-full max-w-xl border-t border-border pt-8">
      <div className="max-w-xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground mb-2">
          Teach-Back
        </p>
        <h3 className="text-base font-semibold text-foreground mb-1">
          Can you explain this in your own words?
        </h3>
        <p className="text-sm text-muted-foreground mb-4">
          Explaining a concept forces deeper processing. Write at least 20 words.
        </p>
        <div className="w-full px-4 py-3 border border-border rounded-md text-sm text-muted-foreground bg-background min-h-[120px]">
          In my own words, the minimum corridor width for commercial occupancies is...
        </div>
        <div className="flex items-center justify-between mt-3">
          <span className="text-xs text-muted-foreground">0 words</span>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">Skip for now</span>
            <span className="h-9 px-5 rounded-sm bg-muted text-muted-foreground font-bold text-xs uppercase tracking-[0.15em] inline-flex items-center">
              Submit
            </span>
          </div>
        </div>
      </div>
    </div>
  ),
}

/* ── ElaborativeInterrogation ────────────────────────────────────── */

const elaborativeInterrogationData: ComponentData = {
  propsTable: [
    { name: 'promptId', type: 'string', defaultValue: null, required: true, description: 'UUID for the prompt, used for analytics and persistence.' },
    { name: 'question', type: 'string', defaultValue: null, required: true, description: 'The question text displayed to the student.' },
    { name: 'answer', type: 'string', defaultValue: null, required: false, description: 'Explanation text revealed after answering. Accepts HTML.' },
    { name: 'revealText', type: 'string', defaultValue: null, required: false, description: 'MDX alias for answer.' },
    { name: 'options', type: 'Array<{ text: string; is_correct: boolean }> | string', defaultValue: null, required: true, description: 'MCQ answer choices (array or MDX-serialized string). Empty array triggers open-ended mode.' },
    { name: 'articleId', type: 'string', defaultValue: null, required: false, description: 'Article UUID for analytics tracking.' },
    { name: 'type', type: "'mcq' | 'open'", defaultValue: null, required: false, description: 'Prompt format — inferred from options if omitted.' },
    { name: 'placeholder', type: 'string', defaultValue: null, required: false, description: 'Placeholder text for the open-ended textarea.' },
    { name: 'existingResponse', type: '{ selected_option_index: number | null; response_text: string | null; responded_at: string } | null', defaultValue: 'null', required: false, description: 'Pre-existing response from the database.' },
  ],
  codeSnippet: `import { ElaborativeInterrogation } from '@/components/wiki/ElaborativeInterrogation'

<ElaborativeInterrogation
  promptId="ei-ceiling-height-01"
  question="Why is the minimum ceiling height 2.70 m and not lower?"
  options={[
    { text: 'Structural load requirements', is_correct: false },
    { text: 'Adequate ventilation and thermal comfort', is_correct: true },
    { text: 'Fire truck ladder access', is_correct: false },
  ]}
  answer="The 2.70 m minimum ensures adequate air volume for natural ventilation and thermal comfort in tropical climates, per PD 1096 Rule VIII."
/>`,
  preview: (
    <div className="w-full max-w-md border border-border rounded-xl overflow-hidden bg-card">
      <div className="flex items-center gap-2.5 px-5 py-3.5 bg-gradient-to-br from-cobalt-light to-[var(--wiki-gradient-blue)] border-b border-border">
        <div className="w-7 h-7 rounded-lg bg-primary flex items-center justify-center text-white text-sm">
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
        <div className="flex-1">
          <div className="font-mono text-[11px] font-medium uppercase tracking-[0.1em] text-primary">Think About It</div>
          <div className="text-[13px] text-muted-foreground mt-px">Test your understanding before moving on</div>
        </div>
      </div>
      <div className="p-5">
        <p className="text-[15px] font-semibold text-foreground mb-4 leading-relaxed">
          Why is the minimum ceiling height 2.70 m and not lower?
        </p>
        <div className="flex flex-col gap-2">
          {[
            { letter: 'A', text: 'Structural load requirements', correct: false },
            { letter: 'B', text: 'Adequate ventilation and thermal comfort', correct: true },
            { letter: 'C', text: 'Fire truck ladder access', correct: false },
          ].map((opt) => (
            <div
              key={opt.letter}
              className="flex items-start gap-3 px-4 py-3 border-[1.5px] border-border rounded-[10px] text-sm text-foreground leading-[1.45]"
            >
              <span className="w-6 h-6 rounded-full border-[1.5px] border-border flex items-center justify-center text-xs font-semibold shrink-0 mt-px font-mono">
                {opt.letter}
              </span>
              <span>{opt.text}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  ),
}

/* ── KeyValues ───────────────────────────────────────────────────── */

const keyValuesData: ComponentData = {
  propsTable: [
    { name: 'items', type: 'Array<{ value: string; label: string }> | string', defaultValue: null, required: true, description: 'Key-value pairs to display. Accepts a native array or MDX-serialized string.' },
  ],
  codeSnippet: `import { KeyValues } from '@/components/wiki/KeyValues'

<KeyValues items={[
  { value: '2.70 m', label: 'Min Ceiling Height' },
  { value: '1.20 m', label: 'Min Corridor Width' },
  { value: '9.00 m\u00B2', label: 'Min Habitable Room' },
  { value: '0.90 m', label: 'Min Door Width' },
]} />`,
  preview: (
    <div className="w-full max-w-lg grid grid-cols-[repeat(auto-fit,minmax(140px,1fr))] gap-3">
      {[
        { value: '2.70 m', label: 'Min Ceiling Height' },
        { value: '1.20 m', label: 'Min Corridor Width' },
        { value: '9.00 m\u00B2', label: 'Min Habitable Room' },
        { value: '0.90 m', label: 'Min Door Width' },
      ].map((item) => (
        <div
          key={item.label}
          className="bg-card border border-border rounded-[10px] px-4 py-4 text-center"
        >
          <div className="font-sans text-[28px] font-bold text-primary leading-none mb-1">
            {item.value}
          </div>
          <div className="font-mono text-[11px] text-muted-foreground uppercase tracking-[0.06em]">
            {item.label}
          </div>
        </div>
      ))}
    </div>
  ),
}

/* ── Component data lookup ───────────────────────────────────────── */

const COMPONENT_DATA: Record<string, ComponentData> = {
  'inline-quiz': inlineQuizData,
  'formula-block': formulaBlockData,
  'exam-tip': examTipData,
  'process-flow': processFlowData,
  'wiki-comparison-table': comparisonTableData,
  'law-callout': lawCalloutData,
  'alert-box': alertBoxData,
  'accordion': accordionData,
  'teach-back-prompt': teachBackPromptData,
  'elaborative-interrogation': elaborativeInterrogationData,
  'key-values': keyValuesData,
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

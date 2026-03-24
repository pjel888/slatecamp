import { notFound } from 'next/navigation'
import { Breadcrumbs } from '@/components/developer/Breadcrumbs'
import { ComponentPageLayout } from '@/components/developer/ComponentPageLayout'
import {
  getComponentBySlug,
  getComponentsByDomain,
} from '@/lib/developer/componentRegistry'
import type { PropsTableEntry } from '@/types/developer'
import {
  QuestionCardPreview,
  AnswerOptionPreview,
  RationalePanelPreview,
  DifficultyBadgePreview,
  SessionTimerPreview,
} from '../_previews'

/* ------------------------------------------------------------------ */
/*  Questions Domain — Component Documentation Pages                   */
/* ------------------------------------------------------------------ */

interface ComponentData {
  propsTable: PropsTableEntry[]
  codeSnippet: string
  preview: React.ReactNode
}

/* ── QuestionCard ────────────────────────────────────────────────── */

const questionCardData: ComponentData = {
  propsTable: [
    { name: 'question', type: 'string', defaultValue: null, required: true, description: 'The question text to display.' },
    { name: 'options', type: 'Array<{ id: string; text: string }>', defaultValue: null, required: true, description: 'Answer choices to render.' },
    { name: 'difficulty', type: "'easy' | 'medium' | 'hard'", defaultValue: null, required: true, description: 'Difficulty level badge.' },
    { name: 'subject', type: 'string', defaultValue: null, required: true, description: 'Subject area tag.' },
    { name: 'onSelect', type: '(id: string) => void', defaultValue: null, required: false, description: 'Callback when an option is selected.' },
    { name: 'selectedId', type: 'string', defaultValue: null, required: false, description: 'Currently selected option id.' },
    { name: 'showResult', type: 'boolean', defaultValue: 'false', required: false, description: 'Whether to reveal correct/incorrect styling.' },
    { name: 'correctId', type: 'string', defaultValue: null, required: false, description: 'The id of the correct answer for result display.' },
  ],
  codeSnippet: `import { QuestionCard } from '@/components/shared/question-card'

<QuestionCard
  question="What is the minimum corridor width for commercial occupancies per PD 1096?"
  options={[
    { id: 'a', text: '1.00m' },
    { id: 'b', text: '1.10m' },
    { id: 'c', text: '1.20m' },
    { id: 'd', text: '1.50m' },
  ]}
  difficulty="medium"
  subject="Building Code"
/>`,
  preview: <QuestionCardPreview />,
}

/* ── AnswerOption ────────────────────────────────────────────────── */

const answerOptionData: ComponentData = {
  propsTable: [
    { name: 'id', type: 'string', defaultValue: null, required: true, description: 'Unique identifier for the option.' },
    { name: 'text', type: 'string', defaultValue: null, required: true, description: 'Answer text to display.' },
    { name: 'selected', type: 'boolean', defaultValue: 'false', required: false, description: 'Whether this option is currently selected.' },
    { name: 'correct', type: 'boolean', defaultValue: null, required: false, description: 'Whether this option is the correct answer.' },
    { name: 'showResult', type: 'boolean', defaultValue: 'false', required: false, description: 'Whether to show correct/incorrect styling.' },
    { name: 'onClick', type: '() => void', defaultValue: null, required: false, description: 'Click handler for selection.' },
  ],
  codeSnippet: `import { AnswerOption } from '@/components/questions/AnswerOption'

<AnswerOption id="a" text="1.00 meter" />
<AnswerOption id="b" text="1.10 meters" selected />
<AnswerOption id="c" text="1.20 meters" selected correct showResult />`,
  preview: <AnswerOptionPreview />,
}

/* ── RationalePanel ──────────────────────────────────────────────── */

const rationalePanelData: ComponentData = {
  propsTable: [
    { name: 'rationale', type: 'string', defaultValue: null, required: true, description: 'Explanation text for the answer.' },
    { name: 'citations', type: 'Array<{ text: string; source: string }>', defaultValue: null, required: false, description: 'Source citations displayed as badges.' },
    { name: 'isCorrect', type: 'boolean', defaultValue: null, required: true, description: 'Whether the submitted answer was correct.' },
  ],
  codeSnippet: `import { RationalePanel } from '@/components/questions/RationalePanel'

<RationalePanel
  rationale="The minimum corridor width for commercial occupancies under PD 1096 is 1.20 meters."
  citations={[
    { text: 'PD 1096, Section 401.3', source: '/wiki/pd-1096/section-401' },
    { text: 'NBC Table 4.1.1', source: '/wiki/pd-1096/table-411' },
  ]}
  isCorrect={true}
/>`,
  preview: <RationalePanelPreview />,
}

/* ── DifficultyBadge ─────────────────────────────────────────────── */

const difficultyBadgeData: ComponentData = {
  propsTable: [
    { name: 'difficulty', type: "'easy' | 'medium' | 'hard'", defaultValue: null, required: true, description: 'Difficulty level to display.' },
    { name: 'size', type: "'sm' | 'md'", defaultValue: "'sm'", required: false, description: 'Badge sizing.' },
  ],
  codeSnippet: `import { DifficultyBadge } from '@/components/questions/DifficultyBadge'

<DifficultyBadge difficulty="easy" />
<DifficultyBadge difficulty="medium" />
<DifficultyBadge difficulty="hard" size="md" />`,
  preview: <DifficultyBadgePreview />,
}

/* ── SessionTimer ────────────────────────────────────────────────── */

const sessionTimerData: ComponentData = {
  propsTable: [
    { name: 'duration', type: 'number', defaultValue: null, required: true, description: 'Total session duration in seconds.' },
    { name: 'onExpire', type: '() => void', defaultValue: null, required: false, description: 'Callback fired when the timer reaches zero.' },
    { name: 'isPaused', type: 'boolean', defaultValue: 'false', required: false, description: 'Whether the countdown is paused.' },
  ],
  codeSnippet: `import { SessionTimer } from '@/components/questions/SessionTimer'

<SessionTimer
  duration={1800}
  onExpire={handleExpire}
/>`,
  preview: <SessionTimerPreview />,
}

/* ── Component data lookup ───────────────────────────────────────── */

const COMPONENT_DATA: Record<string, ComponentData> = {
  'question-card': questionCardData,
  'answer-option': answerOptionData,
  'rationale-panel': rationalePanelData,
  'difficulty-badge': difficultyBadgeData,
  'session-timer': sessionTimerData,
}

/* ------------------------------------------------------------------ */
/*  Static params                                                      */
/* ------------------------------------------------------------------ */

export const generateStaticParams = () =>
  getComponentsByDomain('questions').map((c) => ({ component: c.slug }))

/* ------------------------------------------------------------------ */
/*  Page                                                               */
/* ------------------------------------------------------------------ */

const QuestionsComponentPage = async ({
  params,
}: {
  params: Promise<{ component: string }>
}) => {
  const { component } = await params
  const meta = getComponentBySlug('questions', component)

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
        domain="Question & Q&A"
        status={meta.status}
        importPath={meta.importPath}
        filePath={meta.filePath}
        preview={data.preview}
        propsTable={data.propsTable}
        codeSnippet={data.codeSnippet}
        lastUpdated="2026-03-20"
      />
    </>
  )
}

export default QuestionsComponentPage

import type { Meta, StoryObj } from '@storybook/react'

import { IntroSlide1 } from './IntroSlide1'
import { IntroSlide2 } from './IntroSlide2'
import { IntroSlide3 } from './IntroSlide3'
import { PressureLevelSelector } from './PressureLevelSelector'
import { QuestionCountPills } from './QuestionCountPills'
import { SetupFlow } from './SetupFlow'
import type { TaxonomySubject } from '@/types/quiz-config'

const sampleSubjects: TaxonomySubject[] = [
  {
    nodeId: 'nbcp',
    name: 'National Building Code',
    leaId: 'nbcp',
    masteryWeight: 0.62,
    interactionCount: 18,
    subtopics: [
      { nodeId: 'nbcp-fire', name: 'Fire zones', leaId: 'nbcp-fire', isLeaf: true, masteryWeight: 0.35, interactionCount: 8 },
      { nodeId: 'nbcp-exits', name: 'Means of egress', leaId: 'nbcp-exits', isLeaf: true, masteryWeight: 0.74, interactionCount: 10 },
    ],
  },
  {
    nodeId: 'bp344',
    name: 'Accessibility Law',
    leaId: 'bp344',
    masteryWeight: 0.41,
    interactionCount: 12,
    subtopics: [
      { nodeId: 'bp344-ramps', name: 'Ramps', leaId: 'bp344-ramps', isLeaf: true, masteryWeight: 0.28, interactionCount: 5 },
      { nodeId: 'bp344-parking', name: 'Accessible parking', leaId: 'bp344-parking', isLeaf: true, masteryWeight: 0.52, interactionCount: 7 },
    ],
  },
]

const meta = {
  title: 'Quiz V2/Setup Controls',
  component: SetupFlow,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Quiz setup controls. Stories cover primitive-backed setup selector controls and setup flow slides.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[620px] rounded-md border border-border bg-background p-6'>
        <Story />
      </div>
    ),
  ],
  args: {
    mode: 'storm',
    readinessScore: 70,
    subjects: sampleSubjects,
    onBegin: () => undefined,
    onBack: () => undefined,
  },
} satisfies Meta<typeof SetupFlow>

export default meta
type Story = StoryObj<typeof meta>

export const SetupFlowStorm: Story = {}

export const QuestionCountSelector: Story = {
  render: () => (
    <QuestionCountPills selected={30} onChange={() => undefined} />
  ),
}

export const PressureSelector: Story = {
  render: () => (
    <PressureLevelSelector currentRS={58} selected={1} onChange={() => undefined} />
  ),
}

export const IntroSlideOne: Story = {
  render: () => (
    <IntroSlide1
      mode='camp'
      questionCount={30}
      onCountChange={() => undefined}
      onBegin={() => undefined}
    />
  ),
}

export const TopicSearchAndSelection: Story = {
  render: () => (
    <IntroSlide2
      mode='focus_review'
      subjects={sampleSubjects}
      onContinue={() => undefined}
    />
  ),
}

export const AdvancedConfig: Story = {
  render: () => <IntroSlide3 onBegin={() => undefined} />,
}

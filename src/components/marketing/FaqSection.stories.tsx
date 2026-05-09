import type { Meta, StoryObj } from '@storybook/react'
import { FaqSection } from './FaqSection'

const meta = {
  title: 'Marketing/FaqSection',
  component: FaqSection,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Source: @/components/marketing/FaqSection',
      },
    },
  },
} satisfies Meta<typeof FaqSection>

export default meta

type Story = StoryObj<typeof meta>

const sixQuestions = [
  {
    question: 'What is the Licensure Examination for Architects and who needs to take it?',
    answer:
      'The Licensure Examination for Architects is the Philippine board exam for architecture graduates seeking registration as architects. SlateCamp helps candidates organize review around codes, topics, questions, and source trails; always verify current requirements with PRC and PRBoA materials.',
  },
  {
    question: 'How does SlateCamp help when my architecture knowledge feels scattered?',
    answer:
      'SlateCamp gives students a calmer map: source-backed resources where verified, visual explanations, quizzes, 3D labs, and practical tools that turn missed answers into topics to repair.',
  },
  {
    question: 'What do I get after creating a free account?',
    answer:
      'You can start with dashboard-gated free resources, preview tools, and readiness-oriented practice surfaces. Account creation keeps progress, weak topics, and next steps in one place.',
  },
  {
    question: 'What is the Readiness Score?',
    answer:
      'The Readiness Score is a study signal that helps you see what feels stable and what needs repair. It is not a board-result forecast or pass promise; it is a way to choose the next topic more clearly.',
  },
  {
    question: 'Can I use SlateCamp on mobile?',
    answer:
      'Yes. SlateCamp is designed for mobile browsers so you can read explanations, answer questions, and check tools from common study devices without installing an app.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Free resources can require signup by design. The landing page shows previews, then a free account unlocks saved progress, dashboard context, and gated resources where needed. No credit card is required for the free starting path.',
  },
]

const fourQuestions = sixQuestions.slice(0, 4)

export const AccordionVariant: Story = {
  args: {
    questions: sixQuestions,
    heading: 'Frequently asked questions',
    subheading: 'Everything you need to know before you start.',
    variant: 'accordion',
  },
}

export const GridVariant: Story = {
  args: {
    questions: fourQuestions,
    heading: 'Common questions',
    subheading: 'Quick answers to what learners ask most.',
    variant: 'grid',
  },
}

export const DarkMode: Story = {
  args: {
    questions: sixQuestions,
    heading: 'Frequently asked questions',
    subheading: 'Everything you need to know before you start.',
    variant: 'accordion',
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <Story />
      </div>
    ),
  ],
}

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
    question: 'What is the LEA and who needs to take it?',
    answer:
      'The Licensure Examination for Architects (LEA) is the Philippine board exam required for all architecture graduates who wish to practice as licensed architects. It covers seven subjects spanning design, history, utilities, and the National Building Code.',
  },
  {
    question: 'How does SlateCamp differ from traditional review centers?',
    answer:
      'SlateCamp uses an adaptive IRT-based engine that adjusts question difficulty to your current ability level. Instead of passive lectures, you get targeted practice sessions that close your specific knowledge gaps — not a generic review for everyone.',
  },
  {
    question: 'How many questions are in the question bank?',
    answer:
      'The bank contains over 2,400 questions, each written to the LEA syllabus and verified by licensed architects. Every question is tagged to its exact code provision — no recycled PDFs or scraped notes.',
  },
  {
    question: 'What is the Readiness Score?',
    answer:
      'Your Readiness Score is a composite metric computed from six vectors: mastery level, time since last review, consistency, coverage, strength in weak areas, and 30-day performance trend. It gives you a single number that tells you how prepared you are for exam day.',
  },
  {
    question: 'Can I use SlateCamp on mobile?',
    answer:
      'Yes. SlateCamp is fully responsive and optimized for mobile browsers. Review sessions, the wiki, and analytics are all accessible from any device without needing to install an app.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'You can explore the platform in Try Mode — a curated set of questions and wiki articles available without an account. A full subscription unlocks all 2,400+ questions, spaced repetition scheduling, and your personal analytics dashboard.',
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
    subheading: 'Quick answers to what reviewees ask most.',
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

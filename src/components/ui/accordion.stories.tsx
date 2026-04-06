import type { Meta, StoryObj } from '@storybook/react'
import { Accordion, AccordionItem } from './accordion'

const meta = {
  title: 'UI/Accordion',
  component: Accordion,
  tags: ['autodocs'],
  args: {
    children: null,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/ui/accordion',
      },
    },
  },
} satisfies Meta<typeof Accordion>

export default meta

type Story = StoryObj<typeof meta>

export const SingleOpen: Story = {
  render: () => (
    <div className="w-[560px] max-w-full">
      <Accordion>
        <AccordionItem title="What belongs in Storybook?">
          Component stories, shared interaction patterns, and curated scenes that mirror real usage.
        </AccordionItem>
        <AccordionItem title="What should stay out?">
          Route files, runtime-only hosts, and stale duplicate surfaces that no longer drive the app.
        </AccordionItem>
        <AccordionItem title="Why keep the story surface narrow?">
          Fewer, higher-signal stories are easier to trust and maintain during refactors.
        </AccordionItem>
      </Accordion>
    </div>
  ),
}

export const MultipleOpen: Story = {
  render: () => (
    <div className="w-[560px] max-w-full">
      <Accordion allowMultiple>
        <AccordionItem title="Student-facing patterns">
          Use this for compact explanations, FAQs, and collapsible guidance.
        </AccordionItem>
        <AccordionItem title="Editorial workflows">
          Pair it with section headers and contextual actions instead of crowding the page with permanent detail.
        </AccordionItem>
        <AccordionItem title="Performance guidance">
          Keep content light enough that expansion feels instantaneous in the production shell.
        </AccordionItem>
      </Accordion>
    </div>
  ),
}

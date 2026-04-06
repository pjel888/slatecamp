import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { WikiTableOfContents } from './WikiTableOfContents'
import { wikiCompositionParagraphs, wikiHeadingsFixture } from '@/storybook/fixtures/wiki'

const HeadingPreview = ({
  id,
  text,
}: {
  id: string
  text: string
}) => (
  <section className="space-y-2">
    <h2 id={id} className="text-lg font-semibold text-foreground">
      {text}
    </h2>
    <p className="text-sm leading-7 text-text-secondary">
      {wikiCompositionParagraphs[0]}
    </p>
    <p className="text-sm leading-7 text-text-secondary">
      {wikiCompositionParagraphs[1]}
    </p>
  </section>
)

const TableOfContentsDemo = (
  props: ComponentProps<typeof WikiTableOfContents>,
) => (
  <div className="grid w-full max-w-6xl gap-6 rounded-md border border-border bg-white p-6 lg:grid-cols-[240px_minmax(0,1fr)]">
    <WikiTableOfContents {...props} />
    <div
      id="wiki-center-pane"
      className="max-h-[420px] space-y-8 overflow-y-auto rounded-md border border-border bg-background p-6"
    >
      {wikiHeadingsFixture.map((heading) => (
        <HeadingPreview
          key={heading.id}
          id={heading.id}
          text={heading.text}
        />
      ))}
    </div>
  </div>
)

const meta = {
  title: 'Wiki/Navigation/Wiki Table Of Contents',
  component: WikiTableOfContents,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/navigation/WikiTableOfContents',
      },
    },
  },
  args: {
    headings: wikiHeadingsFixture,
    scrollContainerId: 'wiki-center-pane',
  },
  render: (args) => <TableOfContentsDemo {...args} />,
} satisfies Meta<typeof WikiTableOfContents>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

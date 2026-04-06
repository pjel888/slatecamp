import type { Meta, StoryObj } from '@storybook/react'
import { WikiNavigationProvider } from './WikiNavigationContext'
import { WikiContentShell } from './WikiContentShell'
import { wikiCompositionParagraphs } from '@/storybook/fixtures/wiki'

const ContentShellFrame = () => (
  <WikiNavigationProvider>
    <div className="w-full max-w-5xl overflow-hidden rounded-md border border-border bg-white">
      <WikiContentShell>
        <div className="space-y-4 p-8">
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-text-secondary">
            Article shell
          </p>
          <h2 className="text-2xl font-semibold text-foreground">
            The content shell keeps the center pane stable while navigation changes.
          </h2>
          {wikiCompositionParagraphs.map((paragraph) => (
            <p key={paragraph} className="max-w-3xl text-sm leading-7 text-text-secondary">
              {paragraph}
            </p>
          ))}
        </div>
      </WikiContentShell>
    </div>
  </WikiNavigationProvider>
)

const meta = {
  title: 'Wiki/Navigation/Wiki Content Shell',
  component: WikiContentShell,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/navigation/WikiContentShell',
      },
    },
  },
  args: {
    children: null,
  },
} satisfies Meta<typeof WikiContentShell>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => <ContentShellFrame />,
}

import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { WikiDisciplineProvider } from './WikiDisciplineContext'
import { WikiNavigationProvider } from './WikiNavigationContext'
import { WikiHeaderClient } from './WikiHeaderClient'
import { wikiHeaderFixture } from '@/storybook/fixtures/wiki'

const HeaderFrame = (props: ComponentProps<typeof WikiHeaderClient>) => (
  <WikiNavigationProvider>
    <WikiDisciplineProvider
      disciplineId="laws-discipline"
      disciplineName="Building Laws and Ethics"
    >
      <div className="w-full max-w-5xl rounded-md border border-border bg-white">
        <WikiHeaderClient {...props} />
      </div>
    </WikiDisciplineProvider>
  </WikiNavigationProvider>
)

const meta = {
  title: 'Wiki/Navigation/Wiki Header',
  component: WikiHeaderClient,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    appShell: {
      pathname: '/dashboard/wiki/fire-separation-occupancy-exit-strategy',
    },
    docs: {
      description: {
        component:
          'Server source: @/components/wiki/navigation/WikiHeader. Storybook documents the client shell via WikiHeaderClient.',
      },
    },
  },
  args: {
    ...wikiHeaderFixture,
    mobileActionsContent: (
      <div className="space-y-2 p-4 text-sm text-text-secondary">
        <p className="font-medium text-foreground">Mobile actions</p>
        <p>Review this topic, open related notes, and scan the article outline.</p>
      </div>
    ),
  },
  render: (args) => <HeaderFrame {...args} />,
} satisfies Meta<typeof WikiHeaderClient>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutArticleTitle: Story = {
  args: {
    ...wikiHeaderFixture,
    articleId: undefined,
    articleTitle: undefined,
    articleSlug: undefined,
  },
}

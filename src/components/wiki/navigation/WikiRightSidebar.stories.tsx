import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { WikiRightSidebar } from './WikiRightSidebar'
import {
  wikiHeaderFixture,
  wikiHeadingsFixture,
  wikiRelatedTopicsFixture,
  wikiSourcesFixture,
} from '@/storybook/fixtures/wiki'

const SidebarFrame = (props: ComponentProps<typeof WikiRightSidebar>) => (
  <div className="w-full max-w-xs rounded-md border border-border bg-white p-5">
    <WikiRightSidebar {...props} />
  </div>
)

const meta = {
  title: 'Wiki/Navigation/Wiki Right Sidebar',
  component: WikiRightSidebar,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    appShell: {
      pathname: '/dashboard/wiki/fire-separation-occupancy-exit-strategy',
      withToaster: true,
    },
    docs: {
      description: {
        component: 'Source: @/components/wiki/navigation/WikiRightSidebar',
      },
    },
  },
  args: {
    practiceHref: '/dashboard/quiz',
    practiceLabel: 'Review this topic',
    nodeId: 'storybook-topic',
    articleId: wikiHeaderFixture.articleId,
    topicName: 'Fire Safety Planning',
    relatedTopics: wikiRelatedTopicsFixture,
    headings: wikiHeadingsFixture,
    articleSlug: wikiHeaderFixture.articleSlug,
    scrollContainerId: wikiHeaderFixture.scrollContainerId,
    sources: wikiSourcesFixture,
  },
  render: (args) => <SidebarFrame {...args} />,
} satisfies Meta<typeof WikiRightSidebar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutTableOfContents: Story = {
  args: {
    headings: [],
  },
}

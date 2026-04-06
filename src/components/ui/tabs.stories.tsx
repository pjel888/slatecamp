import type { Meta, StoryObj } from '@storybook/react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
  args: {
    children: null,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/ui/tabs',
      },
    },
  },
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

export const Underline: Story = {
  render: () => (
    <Tabs defaultValue="overview" className="w-[520px]">
      <TabsList variant="underline">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="sources">Sources</TabsTrigger>
        <TabsTrigger value="changes">Changes</TabsTrigger>
      </TabsList>
      <TabsContent value="overview" className="pt-4 text-sm text-muted-foreground">
        Track the overall article state and authoring context.
      </TabsContent>
      <TabsContent value="sources" className="pt-4 text-sm text-muted-foreground">
        Review the citation queue before publishing.
      </TabsContent>
      <TabsContent value="changes" className="pt-4 text-sm text-muted-foreground">
        Compare this revision against the current live version.
      </TabsContent>
    </Tabs>
  ),
}

export const Segmented: Story = {
  render: () => (
    <Tabs defaultValue="all" className="w-[420px]">
      <TabsList variant="segmented">
        <TabsTrigger value="all">All</TabsTrigger>
        <TabsTrigger value="drafts">Drafts</TabsTrigger>
        <TabsTrigger value="published">Published</TabsTrigger>
      </TabsList>
      <TabsContent value="all" className="pt-4 text-sm text-muted-foreground">
        Use segmented tabs when the options behave like a compact filter bar.
      </TabsContent>
      <TabsContent value="drafts" className="pt-4 text-sm text-muted-foreground">
        Drafts stay visible but visually subordinate to the active segment.
      </TabsContent>
      <TabsContent value="published" className="pt-4 text-sm text-muted-foreground">
        Published items can share the same content slot without layout shift.
      </TabsContent>
    </Tabs>
  ),
}

import type { Meta, StoryObj } from '@storybook/react'
import { WikiArticleHero } from './WikiArticleHero'
import { wikiArticleHeroFixture } from '@/storybook/fixtures/wiki'

const meta = {
  title: 'Wiki/Article/Wiki Article Hero',
  component: WikiArticleHero,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/article/WikiArticleHero',
      },
    },
  },
  args: wikiArticleHeroFixture,
} satisfies Meta<typeof WikiArticleHero>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Minimal: Story = {
  args: {
    ...wikiArticleHeroFixture,
    isMinimal: true,
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import { KeyValues } from './KeyValues'
import { wikiKeyValuesFixture } from '@/storybook/fixtures/wiki'

const meta = {
  title: 'Wiki/Blocks/Key Values',
  component: KeyValues,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/blocks/KeyValues',
      },
    },
  },
  args: {
    items: wikiKeyValuesFixture,
  },
} satisfies Meta<typeof KeyValues>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const FromMdxString: Story = {
  args: {
    items: JSON.stringify(wikiKeyValuesFixture),
  },
}

import type { Meta, StoryObj } from '@storybook/react'
import { WikiExamTable } from './WikiExamTable'
import { wikiExamTableFixture } from '@/storybook/fixtures/wiki'

const meta = {
  title: 'Wiki/Blocks/Wiki Exam Table',
  component: WikiExamTable,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/blocks/WikiExamTable',
      },
    },
  },
  args: wikiExamTableFixture,
} satisfies Meta<typeof WikiExamTable>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

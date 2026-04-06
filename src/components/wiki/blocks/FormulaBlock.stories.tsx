import type { Meta, StoryObj } from '@storybook/react'
import { FormulaBlock } from './FormulaBlock'
import { wikiFormulaStepsFixture } from '@/storybook/fixtures/wiki'

const meta = {
  title: 'Wiki/Blocks/Formula Block',
  component: FormulaBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component: 'Source: @/components/wiki/blocks/FormulaBlock',
      },
    },
  },
  args: {
    label: 'Exit planning heuristic',
    steps: wikiFormulaStepsFixture,
  },
} satisfies Meta<typeof FormulaBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const FromMdxString: Story = {
  args: {
    steps: JSON.stringify(wikiFormulaStepsFixture),
  },
}

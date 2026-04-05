import type { Meta, StoryObj } from '@storybook/react'
import { CodeBlock } from './CodeBlock'

const meta = {
  title: 'Shared/CodeBlock',
  component: CodeBlock,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/shared/CodeBlock',
      },
    },
  },
  args: {
    language: 'tsx',
    showLineNumbers: true,
    code: `const CampfireCallout = () => {
  return <div className="rounded-md border border-border bg-card p-4">Ready.</div>
}`,
  },
} satisfies Meta<typeof CodeBlock>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {}

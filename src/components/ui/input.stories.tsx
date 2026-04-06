import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Input, SearchInput } from './input'

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/ui/input',
      },
    },
  },
  args: {
    placeholder: 'Article title',
    size: 'md',
  },
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: (args) => <Input className="w-[320px]" {...args} />,
}

export const Sizes: Story = {
  render: () => (
    <div className="w-[320px] space-y-3">
      <Input size="sm" placeholder="Small input" />
      <Input size="md" placeholder="Medium input" />
      <Input size="lg" placeholder="Large input" />
    </div>
  ),
}

export const Search: Story = {
  render: () => {
    const [query, setQuery] = React.useState('zoning')

    return (
      <div className="w-[360px] space-y-3">
        <SearchInput
          value={query}
          onChange={setQuery}
          onClear={() => setQuery('')}
          shortcutHint="Ctrl K"
          placeholder="Search the wiki"
          debounceMs={0}
        />
        <p className="text-xs text-muted-foreground">
          Query preview: <span className="font-mono">{query || 'empty'}</span>
        </p>
      </div>
    )
  },
}

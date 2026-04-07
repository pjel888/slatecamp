import type { Meta, StoryObj } from '@storybook/react'
import { RadioGroup, RadioGroupItem } from './radio-group'

const meta = {
  title: 'UI/RadioGroup',
  component: RadioGroup,
  tags: ['autodocs'],
  args: { children: null },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <RadioGroup defaultValue="practice" className="w-[200px]">
      {['practice', 'timed', 'adaptive'].map((mode) => (
        <div key={mode} className="flex items-center gap-2">
          <RadioGroupItem value={mode} id={mode} />
          <label htmlFor={mode} className="text-sm capitalize">{mode}</label>
        </div>
      ))}
    </RadioGroup>
  ),
}

export const Disabled: Story = {
  render: () => (
    <RadioGroup defaultValue="a" className="w-[200px]">
      <div className="flex items-center gap-2">
        <RadioGroupItem value="a" id="ra" />
        <label htmlFor="ra" className="text-sm">Option A</label>
      </div>
      <div className="flex items-center gap-2">
        <RadioGroupItem value="b" id="rb" disabled />
        <label htmlFor="rb" className="text-sm text-muted-foreground">Option B (disabled)</label>
      </div>
    </RadioGroup>
  ),
}

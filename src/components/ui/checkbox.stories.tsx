import type { Meta, StoryObj } from '@storybook/react'
import { Checkbox } from './checkbox'

const meta = {
  title: 'UI/Checkbox',
  component: Checkbox,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Checkbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="cb1" />
      <label htmlFor="cb1" className="text-sm">Accept terms</label>
    </div>
  ),
}

export const Checked: Story = {
  render: () => (
    <div className="flex items-center gap-2">
      <Checkbox id="cb2" defaultChecked />
      <label htmlFor="cb2" className="text-sm">Already checked</label>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Checkbox id="cb3" disabled />
        <label htmlFor="cb3" className="text-sm text-muted-foreground">Disabled unchecked</label>
      </div>
      <div className="flex items-center gap-2">
        <Checkbox id="cb4" disabled defaultChecked />
        <label htmlFor="cb4" className="text-sm text-muted-foreground">Disabled checked</label>
      </div>
    </div>
  ),
}

export const Group: Story = {
  render: () => (
    <fieldset className="space-y-2">
      <legend className="text-sm font-medium mb-2">Select subjects</legend>
      {['PD 1096', 'RA 9266', 'Site Planning', 'Anthropometrics'].map((s) => (
        <div key={s} className="flex items-center gap-2">
          <Checkbox id={s} />
          <label htmlFor={s} className="text-sm">{s}</label>
        </div>
      ))}
    </fieldset>
  ),
}

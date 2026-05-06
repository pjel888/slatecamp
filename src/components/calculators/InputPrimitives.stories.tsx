import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'

import {
  CheckboxField,
  FieldLabel,
  NumberInput,
  PresetButton,
  SectionLabel,
  Separator,
  ToggleButton,
} from './InputPrimitives'

const meta = {
  title: 'Calculators/InputPrimitives',
  component: CheckboxField,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Compact calculator controls. CheckboxField uses shared Checkbox and Label primitives.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[320px] rounded-md border border-border bg-card p-4'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof CheckboxField>

export default meta
type Story = StoryObj<typeof meta>

const InteractiveControls = () => {
  const [checked, setChecked] = useState(true)
  const [value, setValue] = useState(12)
  const [activePreset, setActivePreset] = useState('compact')
  const [enabled, setEnabled] = useState(false)

  return (
    <div className='space-y-3'>
      <SectionLabel>Paint calculator</SectionLabel>
      <div className='space-y-1.5'>
        <FieldLabel>Area allowance</FieldLabel>
        <NumberInput value={value} onChange={setValue} min={0} step={1} />
      </div>
      <Separator />
      <CheckboxField
        label='Include primer coat'
        checked={checked}
        onChange={setChecked}
      />
      <div className='flex gap-2 pt-1'>
        {['compact', 'standard'].map((preset) => (
          <PresetButton
            key={preset}
            label={preset}
            active={activePreset === preset}
            onClick={() => setActivePreset(preset)}
          />
        ))}
      </div>
      <ToggleButton
        label={enabled ? 'enabled' : 'disabled'}
        active={enabled}
        onClick={() => setEnabled((current) => !current)}
        className='w-full'
      />
    </div>
  )
}

export const Controls: Story = {
  args: {
    label: 'Include primer coat',
    checked: true,
    onChange: () => undefined,
  },
  render: () => <InteractiveControls />,
}

export const CheckboxUnchecked: Story = {
  args: {
    label: 'Include labor estimate',
    checked: false,
    onChange: () => undefined,
  },
}

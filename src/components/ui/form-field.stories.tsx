import type { Meta, StoryObj } from '@storybook/react'
import { FormField } from './form-field'
import { Input } from './input'
import { Textarea } from './textarea'
import { Checkbox } from './checkbox'
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from './select'

const meta = {
  title: 'UI/FormField',
  component: FormField,
  tags: ['autodocs'],
  args: {
    label: 'Label',
    children: null,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Atomic form field wrapper: Label + Input + Helper/Error text. Source: @/components/ui/form-field',
      },
    },
  },
} satisfies Meta<typeof FormField>

export default meta
type Story = StoryObj<typeof meta>

export const LabelAndInput: Story = {
  render: () => (
    <div className="w-[320px]">
      <FormField label="Email address" htmlFor="email-1">
        <Input id="email-1" type="email" placeholder="you@example.com" />
      </FormField>
    </div>
  ),
}

export const WithHelper: Story = {
  render: () => (
    <div className="w-[320px]">
      <FormField label="Username" htmlFor="user-1" hint="Must be 3-20 characters, letters and numbers only.">
        <Input id="user-1" placeholder="johndoe" />
      </FormField>
    </div>
  ),
}

export const WithError: Story = {
  render: () => (
    <div className="w-[320px]">
      <FormField label="Password" htmlFor="pw-1" error="Password must be at least 8 characters.">
        <Input id="pw-1" type="password" aria-invalid="true" />
      </FormField>
    </div>
  ),
}

export const Required: Story = {
  render: () => (
    <div className="w-[320px]">
      <FormField label="Full name" htmlFor="name-1" required>
        <Input id="name-1" placeholder="Juan dela Cruz" />
      </FormField>
    </div>
  ),
}

export const Disabled: Story = {
  render: () => (
    <div className="w-[320px]">
      <FormField label="Account ID" htmlFor="acct-1" hint="Auto-generated. Cannot be changed.">
        <Input id="acct-1" value="SC-2026-0412" disabled />
      </FormField>
    </div>
  ),
}

export const AllElementTypes: Story = {
  name: 'All Element Types',
  render: () => (
    <div className="w-[320px] space-y-6">
      <FormField label="Text input" htmlFor="t-input" required>
        <Input id="t-input" placeholder="Enter text..." />
      </FormField>

      <FormField label="Message" htmlFor="t-textarea" hint="Max 500 characters.">
        <Textarea id="t-textarea" placeholder="Write your message..." maxLength={500} />
      </FormField>

      <FormField label="Subject area" htmlFor="t-select">
        <Select>
          <SelectTrigger id="t-select">
            <SelectValue placeholder="Choose a subject..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pd1096">PD 1096</SelectItem>
            <SelectItem value="ra9266">RA 9266</SelectItem>
            <SelectItem value="siteplanning">Site Planning</SelectItem>
          </SelectContent>
        </Select>
      </FormField>

      <FormField label="Terms and conditions">
        <div className="flex items-center gap-2">
          <Checkbox id="t-check" />
          <label htmlFor="t-check" className="text-sm text-foreground">
            I agree to the terms
          </label>
        </div>
      </FormField>
    </div>
  ),
}

export const DarkMode: Story = {
  name: 'Dark Mode Grid',
  render: () => (
    <div className="w-[320px] space-y-6">
      <FormField label="Normal field" htmlFor="dm-1">
        <Input id="dm-1" placeholder="Normal state" />
      </FormField>
      <FormField label="With helper" htmlFor="dm-2" hint="Helper text appears here.">
        <Input id="dm-2" placeholder="Has hint" />
      </FormField>
      <FormField label="With error" htmlFor="dm-3" error="This field is required." required>
        <Input id="dm-3" aria-invalid="true" />
      </FormField>
      <FormField label="Disabled" htmlFor="dm-4">
        <Input id="dm-4" value="Locked value" disabled />
      </FormField>
    </div>
  ),
}

import type { Meta, StoryObj } from '@storybook/react'
import { ContactForm } from './ContactForm'

const meta = {
  title: 'Marketing/ContactForm',
  component: ContactForm,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Contact form with server action integration. Displays success/error alerts on submission. Source: @/components/marketing/ContactForm',
      },
    },
  },
} satisfies Meta<typeof ContactForm>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

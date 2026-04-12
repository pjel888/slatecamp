import type { Meta, StoryObj } from '@storybook/react'
import { SubjectDistributionBar } from './subject-distribution-bar'

const meta = {
  title: 'Shared/SubjectDistributionBar',
  component: SubjectDistributionBar,
  tags: ['autodocs'],
} satisfies Meta<typeof SubjectDistributionBar>

export default meta
type Story = StoryObj<typeof meta>

const mockItems = [
  { id: '1', leaId: 'PRAC', name: 'Professional Practice', primaryCount: 450, secondaryCount: 12 },
  { id: '2', leaId: 'HIST', name: 'History of Architecture', primaryCount: 320, secondaryCount: 8 },
  { id: '3', leaId: 'STRC', name: 'Structural Design', primaryCount: 280, secondaryCount: 5 },
  { id: '4', leaId: 'PLAN', name: 'Planning', primaryCount: 150, secondaryCount: 15 },
  { id: '5', leaId: 'MATL', name: 'Materials & Construction', primaryCount: 510, secondaryCount: 20 },
  { id: '6', leaId: 'UTIL', name: 'Utilities', primaryCount: 210, secondaryCount: 4 },
  { id: '7', leaId: 'DSGN', name: 'Architectural Design', primaryCount: 390, secondaryCount: 10 },
  { id: '8', leaId: 'THEO', name: 'Theory of Architecture', primaryCount: 180, secondaryCount: 6 },
]

export const Default: Story = {
  args: {
    items: mockItems,
    maxPrimaryCount: 600,
  },
}

export const CustomLabels: Story = {
  args: {
    items: mockItems.slice(0, 4),
    maxPrimaryCount: 600,
    primaryLabel: 'Questions',
    secondaryLabel: 'Notes',
  },
}

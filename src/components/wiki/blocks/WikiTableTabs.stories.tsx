import type { Meta, StoryObj } from '@storybook/react'
import { WikiTableTabs } from './WikiTableTabs'

const bp344Table = `
| Ramp condition | Maximum slope | Landing / width cue | Exam trap |
|---|---|---|---|
| Normal accessible ramp | 1:12 | Check run length before counting landings | Treating 1:12 as optional |
| Short existing-condition ramp | 1:10 | Only when the governing rule allows the exception | Applying exception to new work |
| Walking surface | 1:20 or gentler | Usually treated as route, not ramp | Calling every slope a ramp |
`

const pd1096Table = `
| Metric | What it controls | Learner cue |
|---|---|---|
| TLA | Total lot area | Start with the legal lot size |
| PSO | Percentage of site occupancy | Limits footprint coverage |
| AMBF | Allowable maximum building footprint | Compare against proposed footprint |
| TGFA | Total gross floor area | Do not confuse with footprint |
`

const meta = {
  title: 'Wiki/Blocks/Wiki Table Tabs',
  component: WikiTableTabs,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Source: @/components/wiki/blocks/WikiTableTabs. Uses @tanstack/react-table for data modeling and responsive div/ARIA rendering for wiki article comparisons.',
      },
    },
  },
  args: {
    caption: 'Numbers that matter',
    tables: [
      { id: 'bp344', title: 'BP 344', content: bp344Table },
      { id: 'pd1096', title: 'PD 1096', content: pd1096Table },
    ],
  },
} satisfies Meta<typeof WikiTableTabs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithDefaultTab: Story = {
  args: {
    defaultTab: 'pd1096',
  },
}

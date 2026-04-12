import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Omnibar } from './Omnibar'

const meta = {
  title: 'Shared/Omnibar',
  component: Omnibar,
  parameters: {
    layout: 'fullscreen',
  },
  decorators: [
    (Story) => (
      <div className="h-screen w-full bg-slate-100 p-8">
        <Story />
        <p className="text-center text-muted-foreground mt-4 text-xs">
          Tip: This component is usually toggled with Ctrl+K
        </p>
      </div>
    ),
  ],
} satisfies Meta<typeof Omnibar>

export default meta
type Story = StoryObj<typeof meta>

export const Closed: Story = {
  args: {
    open: false,
    setOpen: (open) => console.log('setOpen', open),
  },
}

export const IdleOpen: Story = {
  args: {
    open: true,
    setOpen: (open) => console.log('setOpen', open),
  },
}

const mockResults = [
  {
    article_id: '1',
    title: 'PD 1096 - Rule VIII: Light and Ventilation',
    slug: 'pd-1096-rule-8',
    snippet: 'This rule covers the requirements for <mark>light</mark> and <mark>ventilation</mark> in buildings, including minimum requirements for air space, window openings, and ceiling heights.',
  },
  {
    article_id: '2',
    title: 'BP 344 - Accessibility Law',
    slug: 'bp-344',
    snippet: 'An Act to Enhance the Mobility of Disabled Persons by Requiring Certain Buildings, Institutions, Establishments and Public Utilities to install Facilities and Other Devices.',
  },
  {
    article_id: '3',
    title: 'Fire Code of the Philippines (RA 9514)',
    slug: 'ra-9514',
    snippet: 'Comprehensive Fire Code of the Philippines of 2008 and for other purposes.',
  },
]

// Note: Omnibar internally handles search via server action `searchWikiArticles`.
// In a real Storybook setup, we would use MSW to mock that API call.
// Since we can't easily add MSW here, these stories represent the UI shell.
// For "Results" state, we'd need to modify Omnibar to accept initialResults for testing, 
// but we'll stick to the current production API.

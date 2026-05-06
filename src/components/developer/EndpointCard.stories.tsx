import type { Meta, StoryObj } from '@storybook/react'

import { EndpointCard } from './EndpointCard'

const meta = {
  title: 'Developer/EndpointCard',
  component: EndpointCard,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Developer API endpoint card. Expandable endpoint rows use the shared Button primitive while preserving compact API-reference styling.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className='w-[720px] max-w-[calc(100vw-2rem)] bg-canvas p-6'>
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof EndpointCard>

export default meta
type Story = StoryObj<typeof meta>

export const Expandable: Story = {
  args: {
    method: 'POST',
    path: '/api/v1/questions/generate',
    description: 'Generate a new ALE practice question for a selected topic.',
    auth: 'Bearer token',
    badges: ['AI', 'rate-limited'],
    requestSchema: `type Request = {\n  topicId: string\n  difficulty: 'easy' | 'medium' | 'hard'\n}`,
    responseExample: `{
  "id": "q_123",
  "status": "queued"
}`,
    curlExample: `curl -X POST https://api.slatecamp.com/api/v1/questions/generate \\
  -H "Authorization: Bearer $SLATECAMP_TOKEN"`,
  },
}

export const Static: Story = {
  args: {
    method: 'GET',
    path: '/api/v1/health',
    description: 'Return current API service health.',
    auth: 'None',
    badges: ['public'],
  },
}

import type { Meta, StoryObj } from '@storybook/react'

import { AssetList } from './AssetList'

const sampleAssets = [
  {
    id: 'asset-1',
    name: 'Structural Frame Reference',
    slug: 'structural-frame-reference',
    url: 'https://example.com/structural-frame.png',
    thumbnail: null,
    status: 'published',
    metadata: { system: 'structural', layer: 'frame' },
    created_at: '2026-05-01T00:00:00.000Z',
  },
  {
    id: 'asset-2',
    name: 'MEP Coordination Diagram',
    slug: 'mep-coordination-diagram',
    url: 'https://example.com/mep.png',
    thumbnail: null,
    status: 'in_review',
    metadata: { system: 'mep', layer: 'coordination' },
    created_at: '2026-05-02T00:00:00.000Z',
  },
  {
    id: 'asset-3',
    name: 'Architectural Wall Section',
    slug: 'architectural-wall-section',
    url: 'https://example.com/wall-section.png',
    thumbnail: null,
    status: 'draft',
    metadata: { system: 'architectural', layer: 'details' },
    created_at: '2026-05-03T00:00:00.000Z',
  },
]

const meta = {
  title: 'Admin/AssetList',
  component: AssetList,
  tags: ['autodocs'],
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Admin asset grid with primitive-backed filter controls. Search uses shared Input; status/system filters use shared Select.',
      },
    },
  },
  decorators: [
    (Story) => (
      <div className='min-h-screen bg-canvas p-6'>
        <Story />
        <div id='asset-uploader' className='mt-12 rounded-md border border-dashed border-border p-4 text-sm text-muted-foreground'>
          Asset uploader anchor target
        </div>
      </div>
    ),
  ],
} satisfies Meta<typeof AssetList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    initialAssets: sampleAssets,
  },
}

export const Empty: Story = {
  args: {
    initialAssets: [],
  },
}

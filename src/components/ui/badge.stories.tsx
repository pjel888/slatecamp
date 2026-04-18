import type { Meta, StoryObj } from '@storybook/react'
import {
  Badge,
  DifficultyBadge,
  MasteryBadge,
  SessionModeBadge,
  StatusBadge,
  VerificationBadge,
} from './badge'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/ui/badge',
      },
    },
  },
  args: {
    children: 'Published',
    variant: 'primary',
    size: 'sm',
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {}

export const VariantGallery: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="default">Default</Badge>
      <Badge variant="primary">Primary</Badge>
      <Badge variant="success">Success</Badge>
      <Badge variant="warning">Warning</Badge>
      <Badge variant="danger">Danger</Badge>
      <Badge variant="info">Info</Badge>
      <Badge variant="outline">Outline</Badge>
      <Badge variant="ghost">Ghost</Badge>
    </div>
  ),
}

export const SemanticPresets: Story = {
  render: () => (
    <div className="grid gap-3">
      <div className="flex flex-wrap gap-2">
        <StatusBadge status="published" />
        <StatusBadge status="draft" />
        <StatusBadge status="archived" />
        <StatusBadge status="review" />
      </div>
      <div className="flex flex-wrap gap-2">
        <VerificationBadge status="clean" />
        <VerificationBadge status="has_issues" count={3} />
        <VerificationBadge status="unverified" />
      </div>
      <div className="flex flex-wrap gap-2">
        <DifficultyBadge level="foundational" />
        <DifficultyBadge level="intermediate" />
        <DifficultyBadge level="advanced" />
      </div>
      <div className="flex flex-wrap gap-2">
        <SessionModeBadge mode="camp" />
        <SessionModeBadge mode="storm" />
        <SessionModeBadge mode="focus_review" />
        <SessionModeBadge mode="full_exam" />
      </div>
      <div className="flex flex-wrap gap-2">
        <MasteryBadge tier="building" />
        <MasteryBadge tier="developing" />
        <MasteryBadge tier="proficient" />
        <MasteryBadge tier="mastered" />
      </div>
    </div>
  ),
}

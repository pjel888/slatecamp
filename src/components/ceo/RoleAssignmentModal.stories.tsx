import type { Meta, StoryObj } from '@storybook/react'

import { RoleAssignmentModal } from './RoleAssignmentModal'
import type { TeamMember } from '@/types/ceo'

const member: TeamMember = {
  id: 'team-member-1',
  displayName: 'Philip Echavez Lewis',
  roleTitle: 'Founder',
  department: 'operations',
  monthlyCostPhp: null,
  systemRole: 'admin',
  startDate: '2026-01-01',
  endDate: null,
  userId: 'user-1',
}

const meta = {
  title: 'CEO/RoleAssignmentModal',
  component: RoleAssignmentModal,
  tags: ['autodocs'],
  parameters: { layout: 'centered' },
  args: {
    member,
    isOpen: true,
    onClose: () => undefined,
  },
} satisfies Meta<typeof RoleAssignmentModal>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

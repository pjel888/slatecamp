import type { Meta, StoryObj } from '@storybook/react'
import { User, Gear, Envelope, DownloadSimple } from '@phosphor-icons/react/dist/ssr'
import { Badge } from './badge'
import { ListGroup, ListGroupItem } from './list-group'

const meta = {
  title: 'UI/ListGroup',
  component: ListGroup,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Styled list group with optional icons and badges. Source: @/components/ui/list-group',
      },
    },
  },
} satisfies Meta<typeof ListGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ListGroup className="w-64">
      <ListGroupItem>Profile</ListGroupItem>
      <ListGroupItem>Settings</ListGroupItem>
      <ListGroupItem>Messages</ListGroupItem>
      <ListGroupItem>Download</ListGroupItem>
    </ListGroup>
  ),
}

export const WithIcons: Story = {
  render: () => (
    <ListGroup className="w-64">
      <ListGroupItem icon={<User />}>Profile</ListGroupItem>
      <ListGroupItem icon={<Gear />}>Settings</ListGroupItem>
      <ListGroupItem icon={<Envelope />}>Messages</ListGroupItem>
      <ListGroupItem icon={<DownloadSimple />}>Download</ListGroupItem>
    </ListGroup>
  ),
}

export const WithBadges: Story = {
  render: () => (
    <ListGroup className="w-72">
      <ListGroupItem trailing={<Badge variant="primary" size="sm">New</Badge>}>
        Notifications
      </ListGroupItem>
      <ListGroupItem trailing={<Badge variant="warning" size="sm">3</Badge>}>
        Pending Reviews
      </ListGroupItem>
      <ListGroupItem trailing={<Badge variant="success" size="sm">Done</Badge>}>
        Completed Tasks
      </ListGroupItem>
    </ListGroup>
  ),
}

export const Interactive: Story = {
  render: () => (
    <ListGroup className="w-64">
      <ListGroupItem interactive active icon={<User />}>
        Profile
      </ListGroupItem>
      <ListGroupItem interactive icon={<Gear />}>
        Settings
      </ListGroupItem>
      <ListGroupItem interactive icon={<Envelope />}>
        Messages
      </ListGroupItem>
      <ListGroupItem interactive disabled icon={<DownloadSimple />}>
        Download
      </ListGroupItem>
    </ListGroup>
  ),
}

export const DarkMode: Story = {
  name: 'Dark Mode Grid',
  render: () => (
    <div className="flex gap-6 flex-wrap">
      <ListGroup className="w-64">
        <ListGroupItem icon={<User />}>Profile</ListGroupItem>
        <ListGroupItem icon={<Gear />}>Settings</ListGroupItem>
        <ListGroupItem icon={<Envelope />}>Messages</ListGroupItem>
      </ListGroup>
      <ListGroup className="w-64">
        <ListGroupItem interactive active icon={<User />}>
          Active Item
        </ListGroupItem>
        <ListGroupItem interactive icon={<Gear />}>
          Normal Item
        </ListGroupItem>
        <ListGroupItem interactive disabled icon={<DownloadSimple />}>
          Disabled Item
        </ListGroupItem>
      </ListGroup>
    </div>
  ),
}

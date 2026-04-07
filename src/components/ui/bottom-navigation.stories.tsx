import type { Meta, StoryObj } from '@storybook/react'
import { House, Exam, BookOpen, Cube, UserCircle } from '@phosphor-icons/react/dist/ssr'
import { BottomNavigation } from './bottom-navigation'

const meta = {
  title: 'UI/BottomNavigation',
  component: BottomNavigation,
  tags: ['autodocs'],
  args: {
    items: [],
  },
  parameters: {
    layout: 'fullscreen',
    viewport: { defaultViewport: 'mobile1' },
    docs: {
      description: {
        component:
          'Mobile bottom navigation bar. Hidden on lg+ screens. Source: @/components/ui/bottom-navigation',
      },
    },
  },
} satisfies Meta<typeof BottomNavigation>

export default meta
type Story = StoryObj<typeof meta>

const FOUR_ITEMS = [
  { label: 'Home', href: '/dashboard', icon: <House /> },
  { label: 'Drills', href: '/dashboard/drills', icon: <Exam /> },
  { label: 'Wiki', href: '/dashboard/wiki', icon: <BookOpen /> },
  { label: 'Profile', href: '/dashboard/settings', icon: <UserCircle /> },
]

const FIVE_ITEMS = [
  { label: 'Home', href: '/dashboard', icon: <House /> },
  { label: 'Drills', href: '/dashboard/drills', icon: <Exam /> },
  { label: 'Wiki', href: '/dashboard/wiki', icon: <BookOpen /> },
  { label: '3D Lab', href: '/dashboard/3d-lab', icon: <Cube /> },
  { label: 'Profile', href: '/dashboard/settings', icon: <UserCircle /> },
]

export const FourItems: Story = {
  render: () => (
    <div className="relative h-[667px] bg-background">
      <div className="p-4 text-sm text-muted-foreground">
        Dashboard content area. Bottom nav is fixed at bottom.
      </div>
      <BottomNavigation items={FOUR_ITEMS} />
    </div>
  ),
}

export const FiveItems: Story = {
  render: () => (
    <div className="relative h-[667px] bg-background">
      <div className="p-4 text-sm text-muted-foreground">
        Dashboard content with 5-item bottom nav.
      </div>
      <BottomNavigation items={FIVE_ITEMS} />
    </div>
  ),
}

export const DarkMode: Story = {
  name: 'Dark Mode Grid',
  render: () => (
    <div className="relative h-[667px] bg-background">
      <div className="p-4 text-sm text-muted-foreground">
        Bottom navigation in dark mode.
      </div>
      <BottomNavigation items={FIVE_ITEMS} />
    </div>
  ),
}

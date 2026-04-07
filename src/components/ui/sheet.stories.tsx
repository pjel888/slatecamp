import type { Meta, StoryObj } from '@storybook/react'
import { Sheet, SheetTrigger, SheetContent, SheetHeader, SheetTitle, SheetDescription } from './sheet'

const meta = {
  title: 'UI/Sheet',
  component: Sheet,
  tags: ['autodocs'],
  args: { children: null },
  parameters: { layout: 'centered' },
} satisfies Meta<typeof Sheet>

export default meta
type Story = StoryObj<typeof meta>

export const Right: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger className="inline-flex items-center justify-center rounded-sm border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
        Open Sheet
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Sheet Title</SheetTitle>
          <SheetDescription>This is a sheet panel that slides from the right.</SheetDescription>
        </SheetHeader>
        <div className="p-4 text-sm text-muted-foreground">
          Sheet content goes here.
        </div>
      </SheetContent>
    </Sheet>
  ),
}

export const Left: Story = {
  render: () => (
    <Sheet>
      <SheetTrigger className="inline-flex items-center justify-center rounded-sm border border-border bg-card px-4 py-2 text-sm font-medium hover:bg-muted">
        Open Left
      </SheetTrigger>
      <SheetContent side="left">
        <SheetHeader>
          <SheetTitle>Navigation</SheetTitle>
          <SheetDescription>Sidebar panel from left.</SheetDescription>
        </SheetHeader>
      </SheetContent>
    </Sheet>
  ),
}

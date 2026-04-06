import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'
import {
  ConfirmDialog,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from './dialog'

const meta = {
  title: 'UI/Dialog',
  component: Dialog,
  tags: ['autodocs'],
  args: {
    children: null,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/ui/dialog',
      },
    },
  },
} satisfies Meta<typeof Dialog>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <Dialog>
      <DialogTrigger render={<Button>Open dialog</Button>} />
      <DialogContent size="md">
        <DialogHeader>
          <DialogTitle>Publish article revision</DialogTitle>
          <DialogDescription>
            Confirm the metadata and source citations before promoting this article to students.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 text-sm text-muted-foreground">
          <p>Revision: 2026.04.06</p>
          <p>Pending reviewer checks: 2</p>
        </div>
        <DialogFooter showCloseButton>
          <Button>Publish now</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  ),
}

export const ConfirmPattern: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Archive draft
        </Button>
        <ConfirmDialog
          open={open}
          onOpenChange={setOpen}
          title="Archive this draft?"
          description="The article will leave the active editing queue but can still be restored later."
          confirmLabel="Archive draft"
          confirmVariant="destructive"
          onConfirm={async () => undefined}
        />
      </>
    )
  },
}

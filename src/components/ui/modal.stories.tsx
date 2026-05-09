import * as React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Button } from './button'
import {
  ConfirmModal,
  Modal,
  ModalBody,
  ModalContent,
  ModalDescription,
  ModalFooter,
  ModalHeader,
  ModalTitle,
  ModalTrigger,
} from './modal'

const meta = {
  title: 'UI/Modal',
  component: Modal,
  tags: ['autodocs'],
  args: {
    children: null,
  },
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Source: @/components/ui/modal',
      },
    },
  },
} satisfies Meta<typeof Modal>

export default meta

type Story = StoryObj<typeof meta>

export const Overview: Story = {
  render: () => (
    <Modal>
      <ModalTrigger render={<Button>Open modal</Button>} />
      <ModalContent size="md">
        <ModalHeader>
          <ModalTitle>Publish article revision</ModalTitle>
          <ModalDescription>
            Confirm the metadata and source citations before promoting this article to students.
          </ModalDescription>
        </ModalHeader>
        <ModalBody className="p-4">
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Revision: 2026.04.06</p>
            <p>Pending reviewer checks: 2</p>
          </div>
        </ModalBody>
        <ModalFooter showCloseButton>
          <Button>Publish now</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
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
        <ConfirmModal
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

export const CommandStyle: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open search modal</Button>
        <Modal open={open} onOpenChange={setOpen}>
          <ModalContent size="lg" position="top-center" backdrop="blur">
            <ModalHeader>
              <ModalTitle>Search</ModalTitle>
            </ModalHeader>
            <ModalBody className="p-3">
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                Search results would appear here
              </div>
            </ModalBody>
            <ModalFooter>
              <span className="text-[11px] text-muted-foreground uppercase tracking-widest">
                Press Esc to close
              </span>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  },
}

export const TallScrollingContent: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button onClick={() => setOpen(true)}>Open tall modal</Button>
        <Modal open={open} onOpenChange={setOpen}>
          <ModalContent size="lg">
            <ModalHeader>
              <ModalTitle>Long Content</ModalTitle>
            </ModalHeader>
            <ModalBody className="p-4 space-y-4">
              {Array.from({ length: 20 }).map((_, i) => (
                <p key={i} className="text-sm text-muted-foreground">
                  Line {i + 1}: Lorem ipsum dolor sit amet, consectetur adipiscing elit.
                  Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </p>
              ))}
            </ModalBody>
            <ModalFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setOpen(false)}>Save</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </>
    )
  },
}

export const DestructiveConfirm: Story = {
  render: () => {
    const [open, setOpen] = React.useState(false)

    return (
      <>
        <Button variant="destructive" onClick={() => setOpen(true)}>
          Delete permanently
        </Button>
        <ConfirmModal
          open={open}
          onOpenChange={setOpen}
          title="Delete permanently?"
          description="This action cannot be undone. All associated data will be removed from the system."
          confirmLabel="Delete"
          confirmVariant="destructive"
          onConfirm={async () => undefined}
        />
      </>
    )
  },
}

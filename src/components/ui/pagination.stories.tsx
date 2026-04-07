import type { Meta, StoryObj } from '@storybook/react'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
} from './pagination'

const meta = {
  title: 'UI/Pagination',
  component: Pagination,
  tags: ['autodocs'],
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Pagination with Previous/Next and page numbers. Source: @/components/ui/pagination',
      },
    },
  },
} satisfies Meta<typeof Pagination>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        {[1, 2, 3, 4, 5, 6, 7].map((page) => (
          <PaginationItem key={page}>
            <PaginationLink isActive={page === 3}>{page}</PaginationLink>
          </PaginationItem>
        ))}
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

export const Compact: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

export const FirstPageActive: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious disabled />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>2</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>3</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>12</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

export const LastPageActive: Story = {
  render: () => (
    <Pagination>
      <PaginationContent>
        <PaginationItem>
          <PaginationPrevious />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>1</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationEllipsis />
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>10</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink>11</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationLink isActive>12</PaginationLink>
        </PaginationItem>
        <PaginationItem>
          <PaginationNext disabled />
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  ),
}

export const DarkMode: Story = {
  name: 'Dark Mode Grid',
  render: () => (
    <div className="space-y-4">
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious disabled />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink isActive>1</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>2</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>3</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationEllipsis />
          </PaginationItem>
          <PaginationItem>
            <PaginationLink>12</PaginationLink>
          </PaginationItem>
          <PaginationItem>
            <PaginationNext />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    </div>
  ),
}

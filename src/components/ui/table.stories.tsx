import type { Meta, StoryObj } from '@storybook/react'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableCaption,
} from './table'

const meta = {
  title: 'UI/Table',
  component: Table,
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Primitive table components with data-slot pattern. Source: @/components/ui/table',
      },
    },
  },
} satisfies Meta<typeof Table>

export default meta
type Story = StoryObj<typeof meta>

const SAMPLE_DATA = [
  { subject: 'PD 1096 — Fire Code', score: 92, mastery: 'Proficient', sessions: 14 },
  { subject: 'RA 9266 — Architecture Act', score: 85, mastery: 'Developing', sessions: 8 },
  { subject: 'Site Planning', score: 78, mastery: 'Building', sessions: 6 },
  { subject: 'Philippine Architecture', score: 95, mastery: 'Mastered', sessions: 18 },
  { subject: 'Anthropometrics', score: 70, mastery: 'Building', sessions: 4 },
]

export const Default: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Mastery</TableHead>
          <TableHead className="text-right">Sessions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SAMPLE_DATA.map((row) => (
          <TableRow key={row.subject}>
            <TableCell className="font-medium">{row.subject}</TableCell>
            <TableCell>{row.score}%</TableCell>
            <TableCell>{row.mastery}</TableCell>
            <TableCell className="text-right">{row.sessions}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const Striped: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Score</TableHead>
          <TableHead>Mastery</TableHead>
          <TableHead className="text-right">Sessions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SAMPLE_DATA.map((row, i) => (
          <TableRow key={row.subject} className={i % 2 === 1 ? 'bg-muted/30' : ''}>
            <TableCell className="font-medium">{row.subject}</TableCell>
            <TableCell>{row.score}%</TableCell>
            <TableCell>{row.mastery}</TableCell>
            <TableCell className="text-right">{row.sessions}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const WithCaption: Story = {
  render: () => (
    <Table>
      <TableCaption>LEA Subject Performance Summary</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Score</TableHead>
          <TableHead className="text-right">Sessions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {SAMPLE_DATA.slice(0, 3).map((row) => (
          <TableRow key={row.subject}>
            <TableCell className="font-medium">{row.subject}</TableCell>
            <TableCell>{row.score}%</TableCell>
            <TableCell className="text-right">{row.sessions}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  ),
}

export const StickyHeader: Story = {
  render: () => (
    <div className="max-h-[200px] overflow-y-auto border border-border rounded-sm">
      <Table>
        <TableHeader className="sticky top-0 z-10 bg-muted">
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Mastery</TableHead>
            <TableHead className="text-right">Sessions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[...SAMPLE_DATA, ...SAMPLE_DATA].map((row, i) => (
            <TableRow key={`${row.subject}-${i}`}>
              <TableCell className="font-medium">{row.subject}</TableCell>
              <TableCell>{row.score}%</TableCell>
              <TableCell>{row.mastery}</TableCell>
              <TableCell className="text-right">{row.sessions}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

export const Empty: Story = {
  render: () => (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Subject</TableHead>
          <TableHead>Score</TableHead>
          <TableHead className="text-right">Sessions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        <TableRow>
          <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
            No results found.
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  ),
}

export const DarkMode: Story = {
  name: 'Dark Mode Grid',
  render: () => (
    <div className="rounded-sm border border-border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Subject</TableHead>
            <TableHead>Score</TableHead>
            <TableHead>Mastery</TableHead>
            <TableHead className="text-right">Sessions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {SAMPLE_DATA.map((row) => (
            <TableRow key={row.subject}>
              <TableCell className="font-medium">{row.subject}</TableCell>
              <TableCell>{row.score}%</TableCell>
              <TableCell>{row.mastery}</TableCell>
              <TableCell className="text-right">{row.sessions}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  ),
}

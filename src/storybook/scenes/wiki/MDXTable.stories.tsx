import React from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { baseMdxComponents } from '@/components/wiki/mdx-components-shared'

const { table: Table, thead: THead, th: Th, tr: Tr, td: Td } = baseMdxComponents

const meta = {
  title: 'Wiki/MDXTable',
  tags: ['autodocs'],
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        component:
          'Wiki MDX table styling with cobalt header, striped rows, and hover states. Source: mdx-components-shared.ts',
      },
    },
  },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SampleTable = () => (
  <Table>
    <THead>
      <Tr>
        <Th>Provision</Th>
        <Th>PD 1096 Reference</Th>
        <Th>Requirement</Th>
      </Tr>
    </THead>
    <tbody>
      <Tr>
        <Td><strong>Fire Exits</strong></Td>
        <Td>Section 1207</Td>
        <Td>Min. 2 exits per floor, max 45m travel distance</Td>
      </Tr>
      <Tr>
        <Td><strong>Corridor Width</strong></Td>
        <Td>Section 1208</Td>
        <Td>Min. 1.12m for occupancy &lt;50, 1.68m for &gt;50</Td>
      </Tr>
      <Tr>
        <Td><strong>Stairway Width</strong></Td>
        <Td>Section 1209</Td>
        <Td>Min. 1.12m clear width, 900mm handrail height</Td>
      </Tr>
      <Tr>
        <Td><strong>Fire Resistance</strong></Td>
        <Td>Section 1210</Td>
        <Td>1-hour rating for Type III, 2-hour for Type I</Td>
      </Tr>
      <Tr>
        <Td><strong>Sprinkler Systems</strong></Td>
        <Td>Section 1211</Td>
        <Td>Required for buildings &gt;4 stories or &gt;1000 sqm</Td>
      </Tr>
    </tbody>
  </Table>
)

export const Default: Story = {
  name: 'Cobalt Header + Striped Rows',
  render: () => (
    <div className="prose-wiki max-w-3xl">
      <SampleTable />
    </div>
  ),
}

export const WithSurroundingContent: Story = {
  name: 'In Article Context',
  render: () => (
    <div className="prose-wiki max-w-3xl">
      <h2>Fire Safety Requirements</h2>
      <p>
        The following table summarizes key fire safety provisions under PD 1096
        (National Building Code of the Philippines) that are commonly tested in the LEA.
      </p>
      <SampleTable />
      <h3>Key Takeaways</h3>
      <p>
        Fire exit requirements vary by occupancy type and building height.
        Always cross-reference with the latest IRR amendments.
      </p>
    </div>
  ),
}

export const Scrollable: Story = {
  name: 'Horizontal Scroll (Narrow Container)',
  render: () => (
    <div className="prose-wiki max-w-[400px]">
      <Table>
        <THead>
          <Tr>
            <Th>Subject</Th>
            <Th>Code</Th>
            <Th>Year</Th>
            <Th>Coverage</Th>
            <Th>Weight</Th>
          </Tr>
        </THead>
        <tbody>
          <Tr>
            <Td>Philippine Architecture</Td>
            <Td>RA 9266</Td>
            <Td>2004</Td>
            <Td>Professional practice</Td>
            <Td>15%</Td>
          </Tr>
          <Tr>
            <Td>Building Code</Td>
            <Td>PD 1096</Td>
            <Td>1977</Td>
            <Td>Construction standards</Td>
            <Td>20%</Td>
          </Tr>
        </tbody>
      </Table>
    </div>
  ),
}

export const DarkMode: Story = {
  name: 'Dark Mode Grid',
  render: () => (
    <div className="prose-wiki max-w-3xl space-y-6">
      <h2>LEA Subject Coverage</h2>
      <SampleTable />
    </div>
  ),
}

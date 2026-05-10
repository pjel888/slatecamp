import { describe, expect, it } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { WikiTableTabs } from '@/components/wiki/blocks/WikiTableTabs'

const mockTables = [
  {
    id: 'bp344',
    title: 'BP 344',
    content: `
| Requirement | Standard | Exam trap |
|---|---|---|
| Ramp slope | 1:12 maximum | Treating steeper slopes as normal |
| Door clear width | 0.90 m minimum | Confusing leaf width with clear width |
`,
  },
  {
    id: 'pd1096',
    title: 'PD 1096',
    content: `
| Metric | Meaning | Exam trap |
|---|---|---|
| TLA | Total lot area | Using floor area instead |
| AMBF | Allowable maximum building footprint | Confusing footprint with TGFA |
`,
  },
]

describe('WikiTableTabs', () => {
  it('renders tabbed article tables from markdown input', () => {
    render(<WikiTableTabs caption="Numbers that matter" tables={mockTables} />)

    expect(screen.getByText('Numbers that matter')).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'BP 344' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'PD 1096' })).toBeInTheDocument()
    expect(screen.getByRole('table', { name: 'BP 344' })).toBeInTheDocument()
    expect(screen.getAllByText('Requirement')[0]).toBeInTheDocument()
    expect(screen.getAllByText('1:12 maximum')[0]).toBeInTheDocument()
  })

  it('switches between table tabs', async () => {
    render(<WikiTableTabs tables={mockTables} />)

    await userEvent.click(screen.getByRole('tab', { name: 'PD 1096' }))

    expect(screen.getByRole('table', { name: 'PD 1096' })).toBeInTheDocument()
    expect(screen.getAllByText('Allowable maximum building footprint')[0]).toBeInTheDocument()
  })

  it('parses MDX stringified table props', () => {
    render(<WikiTableTabs tables={JSON.stringify(mockTables)} defaultTab="pd1096" />)

    expect(screen.getByRole('table', { name: 'PD 1096' })).toBeInTheDocument()
    expect(screen.getAllByText('Total lot area')[0]).toBeInTheDocument()
  })

  it('parses MDX string props after escaped newlines become raw newlines', () => {
    const mdxTables =
      '[{"id":"raw","title":"Raw newlines","content":"| Check | Value |' +
      '\n|---|---|' +
      '\n| Clear width | 1200 mm minimum |"}]'

    render(<WikiTableTabs tables={mdxTables} />)

    expect(screen.getByRole('table', { name: 'Raw newlines' })).toBeInTheDocument()
    expect(screen.getAllByText('1200 mm minimum')[0]).toBeInTheDocument()
  })
})

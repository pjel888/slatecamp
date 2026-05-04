import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ActionCard } from '@/components/shared/action-card'

describe('ActionCard', () => {
  it('renders title as accessible heading', () => {
    render(<ActionCard title="Start Quiz" />)

    expect(screen.getByRole('heading', { name: /start quiz/i })).toBeInTheDocument()
  })

  it('renders description and subtitle when provided', () => {
    render(
      <ActionCard
        title="Topic Review"
        subtitle="PD 1096"
        description="Review zoning classifications and building codes."
      />,
    )

    expect(screen.getByText('PD 1096')).toBeInTheDocument()
    expect(
      screen.getByText('Review zoning classifications and building codes.'),
    ).toBeInTheDocument()
  })

  it('renders icon and badge when provided', () => {
    render(
      <ActionCard
        title="Flashcards"
        icon={<span data-testid="card-icon">📖</span>}
        badge={<span data-testid="card-badge">New</span>}
      />,
    )

    expect(screen.getByTestId('card-icon')).toBeInTheDocument()
    expect(screen.getByTestId('card-badge')).toBeInTheDocument()
  })

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<ActionCard title="Launch" onClick={handleClick} />)

    const card = screen.getByRole('button', { name: /launch/i })
    expect(card).toBeInTheDocument()
    expect(card).toHaveAttribute('tabIndex', '0')

    await userEvent.click(card)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('calls onClick when Enter or Space key is pressed', async () => {
    const handleClick = vi.fn()
    render(<ActionCard title="Launch" onClick={handleClick} />)

    const card = screen.getByRole('button', { name: /launch/i })

    // Focus the card first, then press Enter
    card.focus()
    await userEvent.keyboard('{enter}')
    expect(handleClick).toHaveBeenCalledTimes(1)

    // Press Space
    await userEvent.keyboard(' ')
    expect(handleClick).toHaveBeenCalledTimes(2)
  })

  it('does not have button role when not interactive', () => {
    render(<ActionCard title="Read Only" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(screen.getByText('Read Only')).toBeInTheDocument()
  })

  it('renders metadata and footer when provided', () => {
    render(
      <ActionCard
        title="Analytics"
        metadata={<span data-testid="meta">Updated today</span>}
        footer={<span data-testid="footer">View report</span>}
      />,
    )

    expect(screen.getByTestId('meta')).toBeInTheDocument()
    expect(screen.getByTestId('footer')).toBeInTheDocument()
  })

  it('renders as a link when href is provided', () => {
    render(<ActionCard title="Go to Wiki" href="/wiki" />)

    const link = screen.getByRole('link', { name: /go to wiki/i })
    expect(link).toHaveAttribute('href', '/wiki')
  })
})

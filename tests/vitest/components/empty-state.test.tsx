import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { EmptyState } from '@/components/shared/empty-state'

describe('EmptyState', () => {
  it('renders title and description', () => {
    render(
      <EmptyState
        title="No quizzes yet"
        description="Start your first quiz to track progress."
      />,
    )

    expect(screen.getByText('No quizzes yet')).toBeInTheDocument()
    expect(
      screen.getByText('Start your first quiz to track progress.'),
    ).toBeInTheDocument()
  })

  it('renders the card variant wrapped in a Card', () => {
    const { container } = render(
      <EmptyState
        variant="card"
        title="Chart unavailable"
        description="Data will appear once you complete a quiz."
      />,
    )

    expect(
      container.querySelector('[data-slot="card"]'),
    ).toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="empty-state"]'),
    ).toBeInTheDocument()
  })

  it('renders an action slot when provided', () => {
    render(
      <EmptyState
        title="No sessions"
        description="Create a session to begin."
        action={<button>Start Session</button>}
      />,
    )

    expect(
      screen.getByRole('button', { name: /start session/i }),
    ).toBeInTheDocument()
  })

  it('does not render missing optional slots', () => {
    const { container } = render(<EmptyState title="Just a title" />)

    expect(screen.queryByRole('button')).not.toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="empty-state-description"]'),
    ).not.toBeInTheDocument()
    expect(
      container.querySelector('[data-slot="empty-state-icon"]'),
    ).not.toBeInTheDocument()
  })

  it('applies custom className', () => {
    const { container } = render(
      <EmptyState title="Custom" className="my-custom-class" />,
    )

    expect(container.querySelector('[data-slot="empty-state"]')).toHaveClass(
      'my-custom-class',
    )
  })
})

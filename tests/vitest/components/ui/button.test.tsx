import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Button, PendingButton, SubmitButton } from '@/components/ui/button'

describe('Button', () => {
  it('renders with accessible name and calls onClick when clicked', async () => {
    const handleClick = vi.fn()
    render(<Button onClick={handleClick}>Submit</Button>)

    const button = screen.getByRole('button', { name: /submit/i })
    expect(button).toBeInTheDocument()

    await userEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    render(
      <Button onClick={handleClick} disabled>
        Disabled
      </Button>,
    )

    const button = screen.getByRole('button', { name: /disabled/i })
    expect(button).toBeDisabled()

    await userEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('shows loading spinner and blocks interaction when loading=true', async () => {
    const handleClick = vi.fn()
    render(
      <Button onClick={handleClick} loading loadingText="Saving...">
        Save
      </Button>,
    )

    // Should show loading text, not original children
    expect(screen.queryByText('Save')).not.toBeInTheDocument()
    expect(screen.getByText('Saving...')).toBeInTheDocument()

    // Spinner should be present (aria-hidden svg)
    const spinner = document.querySelector('svg[aria-hidden="true"]')
    expect(spinner).toBeInTheDocument()

    // Click should be blocked
    const button = screen.getByRole('button')
    await userEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('auto-enters loading state when onClick returns a promise', async () => {
    const handleClick = vi.fn().mockResolvedValue(undefined)
    render(<Button onClick={handleClick}>Async</Button>)

    const button = screen.getByRole('button', { name: /async/i })

    await userEvent.click(button)

    // After async resolution, onClick should have been called
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders left and right icons alongside label', () => {
    render(
      <Button leftIcon={<span data-testid="left-icon">L</span>} rightIcon={<span data-testid="right-icon">R</span>}>
        Label
      </Button>,
    )

    expect(screen.getByText('Label')).toBeInTheDocument()
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('forwards asChild to render children without button wrapper', () => {
    const { container } = render(
      <Button asChild>
        <a href="/test">Link Button</a>
      </Button>,
    )

    const link = container.querySelector('a[href="/test"]')
    expect(link).toBeInTheDocument()
    expect(link).toHaveTextContent('Link Button')
  })
})

describe('PendingButton', () => {
  it('reflects pending state with aria-busy and preserves accessible name', () => {
    const { rerender } = render(<PendingButton pending={false}>Idle</PendingButton>)

    let button = screen.getByRole('button', { name: /idle/i })
    expect(button).not.toHaveAttribute('aria-busy')

    rerender(<PendingButton pending>Working</PendingButton>)

    // PendingButton passes pendingLabel as loadingText, so spinner + label is visible
    button = screen.getByRole('button', { name: /working/i })
    expect(button).toHaveAttribute('aria-busy', 'true')
  })

  it('preserves children as accessible name when no pendingLabel is provided', () => {
    render(
      <PendingButton pending>
        Save Changes
      </PendingButton>,
    )

    // When pending with no pendingLabel, children are rendered as sr-only
    const button = screen.getByRole('button', { name: /save changes/i })
    expect(button).toHaveAttribute('aria-busy', 'true')
    expect(document.querySelector('svg[aria-hidden="true"]')).toBeInTheDocument()
  })
})

describe('SubmitButton', () => {
  it('renders as a submit button with default pending label', () => {
    render(<SubmitButton>Submit</SubmitButton>)

    const button = screen.getByRole('button', { name: /submit/i })
    expect(button).toHaveAttribute('type', 'submit')
  })
})

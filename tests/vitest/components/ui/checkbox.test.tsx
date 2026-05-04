import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Checkbox } from '@/components/ui/checkbox'

describe('Checkbox', () => {
  it('toggles checked state on click', async () => {
    render(<Checkbox />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toBeChecked()

    await userEvent.click(checkbox)
    expect(checkbox).toBeChecked()

    await userEvent.click(checkbox)
    expect(checkbox).not.toBeChecked()
  })

  it('respects defaultChecked', () => {
    render(<Checkbox defaultChecked />)

    expect(screen.getByRole('checkbox')).toBeChecked()
  })

  it('does not toggle when disabled', async () => {
    render(<Checkbox disabled />)

    const checkbox = screen.getByRole('checkbox')
    // Base UI Checkbox renders a span with role="checkbox"; aria-disabled marks disabled state
    expect(checkbox).toHaveAttribute('aria-disabled', 'true')
    expect(checkbox).toHaveAttribute('aria-checked', 'false')

    await userEvent.click(checkbox)
    expect(checkbox).toHaveAttribute('aria-checked', 'false')
  })

  it('calls onCheckedChange when toggled', async () => {
    const handleChange = vi.fn()
    render(<Checkbox onCheckedChange={handleChange} />)

    const checkbox = screen.getByRole('checkbox')
    await userEvent.click(checkbox)

    expect(handleChange).toHaveBeenCalledWith(true, expect.anything())

    await userEvent.click(checkbox)
    expect(handleChange).toHaveBeenCalledWith(false, expect.anything())
  })

  it('renders check indicator when checked', async () => {
    render(<Checkbox />)

    const checkbox = screen.getByRole('checkbox')
    expect(checkbox).not.toContainElement(screen.queryByTestId('checkbox-indicator'))

    await userEvent.click(checkbox)

    // The indicator uses data-slot attribute
    const indicator = document.querySelector('[data-slot="checkbox-indicator"]')
    expect(indicator).toBeInTheDocument()
  })
})

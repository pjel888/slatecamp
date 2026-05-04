import { describe, it, expect } from 'vitest'
import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ThemeToggle } from '@/components/shared/ThemeToggle'
import { render as appRender } from '../utils/render'

describe('ThemeToggle', () => {
  it('renders a button with accessible label', () => {
    appRender(<ThemeToggle />)

    expect(
      screen.getByRole('button', { name: /toggle theme/i }),
    ).toBeInTheDocument()
  })

  it('toggles theme when clicked', async () => {
    appRender(<ThemeToggle />)

    const button = screen.getByRole('button', { name: /toggle theme/i })

    // First click toggles from default (light) to dark
    await userEvent.click(button)
    await waitFor(() => {
      expect(document.documentElement).toHaveClass('dark')
    })

    // Second click toggles back to light
    await userEvent.click(button)
    await waitFor(() => {
      expect(document.documentElement).not.toHaveClass('dark')
    })
  })
})

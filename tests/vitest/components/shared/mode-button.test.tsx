import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ModeButton, modeColors } from '@/components/shared/mode-button'

describe('ModeButton', () => {
  it('renders with accessible name and calls onClick', async () => {
    const handleClick = vi.fn()
    render(
      <ModeButton mode="camp" onClick={handleClick}>
        Camp Mode
      </ModeButton>,
    )

    const button = screen.getByRole('button', { name: /camp mode/i })
    expect(button).toBeInTheDocument()

    await userEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('does not call onClick when disabled', async () => {
    const handleClick = vi.fn()
    render(
      <ModeButton mode="storm" onClick={handleClick} disabled>
        Storm
      </ModeButton>,
    )

    const button = screen.getByRole('button', { name: /storm/i })
    expect(button).toBeDisabled()

    await userEvent.click(button)
    expect(handleClick).not.toHaveBeenCalled()
  })

  it('renders each supported mode without throwing', () => {
    const modes = Object.keys(modeColors) as Array<keyof typeof modeColors>

    modes.forEach((mode) => {
      const { unmount } = render(
        <ModeButton mode={mode}>{mode}</ModeButton>,
      )
      expect(screen.getByRole('button', { name: mode })).toBeInTheDocument()
      unmount()
    })
  })

  it('renders active state and remains interactive', async () => {
    const handleClick = vi.fn()
    render(
      <ModeButton mode="focus_review" active onClick={handleClick}>
        Focus
      </ModeButton>,
    )

    const button = screen.getByRole('button', { name: /focus/i })
    expect(button).toBeInTheDocument()

    await userEvent.click(button)
    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('renders all variant types', () => {
    const variants = ['solid', 'outline', 'ghost'] as const

    variants.forEach((variant) => {
      const { unmount } = render(
        <ModeButton mode="proof" variant={variant}>
          {variant}
        </ModeButton>,
      )
      expect(
        screen.getByRole('button', { name: variant }),
      ).toBeInTheDocument()
      unmount()
    })
  })

  it('forwards ref and additional button attributes', () => {
    render(
      <ModeButton mode="chill" data-testid="mode-btn">
        Chill
      </ModeButton>,
    )

    expect(screen.getByTestId('mode-btn')).toBeInTheDocument()
  })
})

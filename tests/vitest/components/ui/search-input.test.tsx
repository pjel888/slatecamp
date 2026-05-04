import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { SearchInput } from '@/components/ui/input'

describe('SearchInput', () => {
  beforeEach(() => {
    vi.useFakeTimers({ shouldAdvanceTime: true })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('renders with placeholder and shortcut hint', () => {
    render(<SearchInput placeholder="Find articles..." shortcutHint="⌘K" />)

    expect(screen.getByPlaceholderText('Find articles...')).toBeInTheDocument()
    expect(screen.getByText('⌘K')).toBeInTheDocument()
  })

  it('calls onChange after debounce when user types', async () => {
    const handleChange = vi.fn()
    render(<SearchInput onChange={handleChange} debounceMs={300} />)

    const input = screen.getByRole('textbox')
    await userEvent.type(input, 'hello')

    // Before debounce, onChange should not have been called
    expect(handleChange).not.toHaveBeenCalled()

    vi.advanceTimersByTime(300)

    // After debounce, onChange should have been called with final value
    expect(handleChange).toHaveBeenCalledWith('hello')
  })

  it('shows clear button when input has value and calls onClear', async () => {
    const handleChange = vi.fn()
    const handleClear = vi.fn()
    render(<SearchInput onChange={handleChange} onClear={handleClear} />)

    const input = screen.getByRole('textbox')

    // Initially no clear button
    expect(screen.queryByLabelText(/clear search/i)).not.toBeInTheDocument()

    await userEvent.type(input, 'query')
    vi.advanceTimersByTime(300)

    // After typing, clear button appears
    const clearButton = screen.getByLabelText(/clear search/i)
    expect(clearButton).toBeInTheDocument()

    // Clicking clear calls onClear and clears value
    await userEvent.click(clearButton)
    expect(handleClear).toHaveBeenCalledTimes(1)
    expect(handleChange).toHaveBeenLastCalledWith('')
  })

  it('shows spinner instead of search icon when loading', () => {
    render(<SearchInput loading />)

    const spinner = document.querySelector('svg[aria-hidden="true"]')
    expect(spinner).toBeInTheDocument()
  })

  it('respects controlled value', async () => {
    const handleChange = vi.fn()
    const { rerender } = render(
      <SearchInput value="initial" onChange={handleChange} />,
    )

    expect(screen.getByRole('textbox')).toHaveValue('initial')

    rerender(<SearchInput value="updated" onChange={handleChange} />)
    expect(screen.getByRole('textbox')).toHaveValue('updated')
  })
})

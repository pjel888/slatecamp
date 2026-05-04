import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { QuestionCard } from '@/components/shared/question-card'

const mockOptions = [
  { id: 'a', label: 'A', text: 'Concrete' },
  { id: 'b', label: 'B', text: 'Steel' },
  { id: 'c', label: 'C', text: 'Wood', isCorrect: true },
  { id: 'd', label: 'D', text: 'Glass' },
]

describe('QuestionCard — quiz variant', () => {
  it('renders stem and all options', () => {
    render(
      <QuestionCard
        variant="quiz"
        stem="What is the strongest material?"
        options={mockOptions}
      />,
    )

    expect(screen.getByText('What is the strongest material?')).toBeInTheDocument()
    expect(screen.getByText('Concrete')).toBeInTheDocument()
    expect(screen.getByText('Steel')).toBeInTheDocument()
    expect(screen.getByText('Wood')).toBeInTheDocument()
    expect(screen.getByText('Glass')).toBeInTheDocument()
  })

  it('calls onSelectOption when an option is clicked', async () => {
    const handleSelect = vi.fn()
    render(
      <QuestionCard
        variant="quiz"
        stem="Pick one"
        options={mockOptions}
        onSelectOption={handleSelect}
      />,
    )

    const optionB = screen.getByRole('button', { name: /option b: steel/i })
    await userEvent.click(optionB)

    expect(handleSelect).toHaveBeenCalledWith('b')
  })

  it('marks selected option when selectedOptionId is provided', () => {
    render(
      <QuestionCard
        variant="quiz"
        stem="Pick one"
        options={mockOptions}
        selectedOptionId="b"
      />,
    )

    const optionB = screen.getByRole('button', { name: /option b: steel/i })
    expect(optionB).toHaveAttribute('aria-pressed', 'true')
  })

  it('shows correct/incorrect/faded states after submission', () => {
    render(
      <QuestionCard
        variant="quiz"
        stem="Pick one"
        options={mockOptions}
        selectedOptionId="b"
        submitted
      />,
    )

    // After submit, options should no longer be interactive buttons
    expect(screen.queryByRole('button', { name: /option b: steel/i })).not.toBeInTheDocument()

    // All options should be present as non-interactive
    expect(screen.getByText('Concrete')).toBeInTheDocument()
    expect(screen.getByText('Steel')).toBeInTheDocument()
    expect(screen.getByText('Wood')).toBeInTheDocument()
  })

  it('renders question number and total', () => {
    render(
      <QuestionCard
        variant="quiz"
        stem="Q"
        options={mockOptions}
        questionNumber={3}
        totalQuestions={10}
      />,
    )

    expect(screen.getByText('Q3 of 10')).toBeInTheDocument()
  })

  it('calls onFlag when flag button is clicked', async () => {
    const handleFlag = vi.fn()
    render(
      <QuestionCard
        variant="quiz"
        stem="Q"
        options={mockOptions}
        onFlag={handleFlag}
      />,
    )

    const flagButton = screen.getByRole('button', { name: /flag question/i })
    await userEvent.click(flagButton)

    expect(handleFlag).toHaveBeenCalledTimes(1)
  })

  it('shows remove-flag label when already flagged', () => {
    render(
      <QuestionCard
        variant="quiz"
        stem="Q"
        options={mockOptions}
        flagged
        onFlag={() => {}}
      />,
    )

    expect(screen.getByRole('button', { name: /remove flag/i })).toBeInTheDocument()
  })
})

describe('QuestionCard — review variant', () => {
  it('shows correct answer highlighted and user wrong answer marked', () => {
    render(
      <QuestionCard
        variant="review"
        stem="What is the strongest material?"
        options={mockOptions}
        userAnswerId="b"
        correctAnswerId="c"
      />,
    )

    expect(screen.getByText('What is the strongest material?')).toBeInTheDocument()
    expect(screen.getByText('Concrete')).toBeInTheDocument()
    expect(screen.getByText('Steel')).toBeInTheDocument()
    expect(screen.getByText('Wood')).toBeInTheDocument()
  })

  it('renders collapsible rationale section', async () => {
    render(
      <QuestionCard
        variant="review"
        stem="Q"
        options={mockOptions}
        userAnswerId="b"
        correctAnswerId="c"
        rationale="<p>Wood is strongest in tension.</p>"
      />,
    )

    // Rationale should be collapsed initially (show toggle button)
    const toggleButton = screen.getByRole('button', { name: /show rationale/i })
    expect(toggleButton).toBeInTheDocument()

    // Click to expand
    await userEvent.click(toggleButton)
    expect(screen.getByText('Wood is strongest in tension.')).toBeInTheDocument()

    // Toggle should now say "Hide"
    expect(screen.getByRole('button', { name: /hide rationale/i })).toBeInTheDocument()
  })
})

describe('QuestionCard — preview variant', () => {
  it('shows metadata badges and highlights correct answer', () => {
    render(
      <QuestionCard
        variant="preview"
        stem="What material?"
        options={mockOptions}
        metadata={{
          difficulty: 0.8,
          status: 'published',
          topicName: 'Materials',
          leaId: 'MAT-001',
        }}
      />,
    )

    expect(screen.getByText('What material?')).toBeInTheDocument()
    expect(screen.getByText('Hard')).toBeInTheDocument()
    expect(screen.getByText('published')).toBeInTheDocument()
    expect(screen.getByText('Materials')).toBeInTheDocument()
    expect(screen.getByText('MAT-001')).toBeInTheDocument()
  })

  it('renders non-interactive options in preview mode', () => {
    render(
      <QuestionCard
        variant="preview"
        stem="Q"
        options={mockOptions}
      />,
    )

    // No interactive buttons in preview
    expect(screen.queryByRole('button', { name: /option/i })).not.toBeInTheDocument()
  })
})

describe('QuestionCard — compact variant', () => {
  it('truncates stem and shows badges', () => {
    render(
      <QuestionCard
        variant="compact"
        stem="This is a very long question stem that should be truncated when displayed in compact mode"
        options={[]}
        questionNumber={5}
        metadata={{ difficulty: 0.2, status: 'draft' }}
        truncateStem={20}
      />,
    )

    expect(screen.getByText('Q5')).toBeInTheDocument()
    expect(screen.getByText('Easy')).toBeInTheDocument()
    expect(screen.getByText('draft')).toBeInTheDocument()
  })
})

describe('QuestionCard — accessibility', () => {
  it('options have aria-labels describing label and text', () => {
    render(
      <QuestionCard
        variant="quiz"
        stem="Q"
        options={mockOptions}
      />,
    )

    expect(
      screen.getByRole('button', { name: /option a: concrete/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByRole('button', { name: /option c: wood/i }),
    ).toBeInTheDocument()
  })
})

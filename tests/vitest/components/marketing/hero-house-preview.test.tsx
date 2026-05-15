import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fireEvent, render, screen, within } from '@testing-library/react'

const playCorrectSoundMock = vi.hoisted(() => vi.fn())

interface MockSlideToSubmitProps {
  onSubmit: () => void
  disabled?: boolean
  checked?: boolean
  label?: string
  checkedLabel?: string
  testId?: string
}

vi.mock('@/components/quiz-v2/SlideToSubmit', () => ({
  SlideToSubmit: ({
    onSubmit,
    disabled = false,
    checked = false,
    label = 'Slide to submit',
    checkedLabel,
    testId,
  }: MockSlideToSubmitProps) => {
    const visibleLabel = checked && checkedLabel ? checkedLabel : label

    return (
      <div
        role='slider'
        aria-label={visibleLabel}
        aria-disabled={disabled ? true : undefined}
        aria-valuenow={checked ? 100 : 0}
        aria-valuemin={0}
        aria-valuemax={100}
        data-testid={testId}
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(event) => {
          if (!disabled && (event.key === 'Enter' || event.key === ' ')) onSubmit()
        }}
      >
        {visibleLabel}
      </div>
    )
  },
}))

vi.mock('@/lib/audio/feedbackSounds', () => ({
  playCorrectSound: playCorrectSoundMock,
}))

import {
  HERO_LOT_CAMERA_FOV,
  HERO_LOT_CAMERA_POSITION,
  HERO_LOT_STAGE_CLASS,
  HeroHousePreview,
  LOT_MODEL_GROUP_POSITION,
  SETBACK_GRID_STEP_METERS,
  getRoadDetailPlan,
  getSetbackGridPlan,
} from '@/components/marketing/hero/HeroHousePreview'

describe('HeroHousePreview setback geometry', () => {
  it('gives the hero lot model a non-clipping camera and visible stage', () => {
    expect(HERO_LOT_STAGE_CLASS).toContain('overflow-visible')
    expect(HERO_LOT_STAGE_CLASS).not.toContain('overflow-hidden')
    expect(HERO_LOT_STAGE_CLASS).not.toContain('mask-image')
    expect(HERO_LOT_STAGE_CLASS).toContain('inset-x-[-24%]')
    expect(HERO_LOT_CAMERA_FOV).toBeGreaterThanOrEqual(27)
    expect(HERO_LOT_CAMERA_POSITION[2]).toBeGreaterThanOrEqual(7.8)
  })

  it('uses a half-meter grid and keeps front/rear colors ahead of side colors', () => {
    const plan = getSetbackGridPlan({ front: 4.5, side: 2, rear: 2 })

    expect(SETBACK_GRID_STEP_METERS).toBe(0.5)
    expect(plan.columns).toBe(32)
    expect(plan.rows).toBe(64)
    expect(plan.frontRows).toBe(9)
    expect(plan.sideColumns).toBe(4)
    expect(plan.rearRows).toBe(4)

    expect(plan.road.position[2]).toBeLessThan(-1.6)
    expect(plan.road.size[0]).toBe(1.6)

    const roadDetails = getRoadDetailPlan(plan.road)
    expect(roadDetails.nearSidewalk.position[2]).toBeGreaterThan(plan.road.position[2])
    expect(roadDetails.nearSidewalk.position[2]).toBeLessThan(-1.6)
    expect(roadDetails.nearCurb.position[2]).toBeCloseTo(-1.673)
    expect(roadDetails.farSidewalk.position[2]).toBeLessThan(plan.road.position[2])
    expect(roadDetails.laneEdgeLines).toHaveLength(2)
    expect(roadDetails.centerDashes).toHaveLength(5)
    expect(roadDetails.centerDashes[0].position[0]).toBeLessThan(0)
    expect(roadDetails.centerDashes[2].position[0]).toBeCloseTo(0)
    expect(roadDetails.centerDashes[4].position[0]).toBeGreaterThan(0)
    expect(roadDetails.sidewalkJoints).toHaveLength(8)
    expect(roadDetails.asphaltSeams).toHaveLength(2)

    expect(plan.bands.front.size).toEqual([1.6, expect.any(Number), 0.45])
    expect(plan.bands.front.position[2]).toBeCloseTo(-1.375)
    expect(plan.bands.rear.size).toEqual([1.6, expect.any(Number), 0.2])
    expect(plan.bands.rear.position[2]).toBeCloseTo(1.5)

    expect(plan.bands.leftSide.grid.startRow).toBe(9)
    expect(plan.bands.leftSide.grid.endRowExclusive).toBe(60)
    expect(plan.bands.leftSide.grid.rowCount).toBe(51)
    expect(plan.bands.leftSide.grid.columnCount).toBe(4)
    expect(plan.bands.leftSide.size).toEqual([0.2, expect.any(Number), 2.55])
    expect(plan.bands.leftSide.position[0]).toBeCloseTo(-0.7)
    expect(plan.bands.leftSide.position[2]).toBeCloseTo(0.125)
    expect(plan.bands.rightSide.position[0]).toBeCloseTo(0.7)
    expect(LOT_MODEL_GROUP_POSITION[1]).toBeGreaterThan(0)
  })

  it('maps every quiz option to exact half-meter cell counts', () => {
    expect(getSetbackGridPlan({ front: 5, side: 3, rear: 1 })).toMatchObject({
      frontRows: 10,
      sideColumns: 6,
      rearRows: 2,
    })
    expect(getSetbackGridPlan({ front: 3, side: 3, rear: 3 })).toMatchObject({
      frontRows: 6,
      sideColumns: 6,
      rearRows: 6,
    })
    expect(getSetbackGridPlan({ front: 2, side: 2, rear: 4.5 })).toMatchObject({
      frontRows: 4,
      sideColumns: 4,
      rearRows: 9,
    })
  })
})

describe('HeroHousePreview', () => {
  beforeEach(() => {
    playCorrectSoundMock.mockClear()
  })

  it('keeps setback option values readable and submits through the slide control', () => {
    render(<HeroHousePreview />)

    const quizCard = screen.getByLabelText(/R-1 setback quiz modal/i)
    const modelStage = screen.getByTestId('hero-lot-model-stage')
    expect(modelStage.className).toContain('overflow-visible')
    expect(modelStage.className).toContain('inset-x-[-24%]')
    expect(modelStage.className).not.toContain('overflow-hidden')
    expect(modelStage.className).not.toContain('mask-image')
    expect(quizCard.className).toContain('bg-slate-100/[0.18]')
    expect(quizCard.className).toContain('p-0')
    expect(quizCard.className).toContain('backdrop-blur-[10px]')
    expect(quizCard.className).toContain('rounded-lg')
    expect(screen.getByTestId('hero-setback-quiz-body').className).toContain('p-1')
    expect(screen.getByTestId('hero-setback-quiz-header').className).toContain('p-1')
    expect(screen.getByText(/Site rule check/i)).toBeInTheDocument()
    expect(screen.getByText(/Site rule check/i).className).not.toContain('rounded-full')
    expect(screen.getByText(/Site rule check/i).className).not.toContain('px-')
    expect(screen.getByText(/PD 1096/i)).toBeInTheDocument()
    expect(screen.getByText(/Site rule check/i).parentElement?.querySelector('[aria-hidden="true"]')).toBeNull()

    const questionText = screen.getByText(/For an R-1 residential single-detached dwelling/i)
    expect(questionText.className).toContain('border-b')
    const legend = screen.getByTestId('setback-color-legend')
    expect(legend).toBeInTheDocument()
    expect(within(legend).getByText('Front')).toBeInTheDocument()
    expect(within(legend).getByText('Side')).toBeInTheDocument()
    expect(within(legend).getByText('Rear')).toBeInTheDocument()

    const rotationToggle = screen.getByRole('button', { name: /pause slow lot rotation/i })
    expect(rotationToggle).toHaveAttribute('aria-pressed', 'true')
    expect(rotationToggle.textContent).toBe('')
    expect(rotationToggle.className).toContain('h-7')
    expect(rotationToggle.className).toContain('w-7')
    expect(rotationToggle.className).not.toContain('bg-white')
    expect(rotationToggle.className).not.toContain('border-white')
    expect(rotationToggle.className).not.toContain('shadow-')
    expect(rotationToggle.className).not.toContain('backdrop-')
    expect(rotationToggle.className).toContain('bottom-[calc(var(--hero-slider-stack-height)+0.35rem)]')
    const rotationIconShell = screen.getByTestId('hero-model-rotation-icon-shell')
    expect(rotationIconShell.className).toContain('text-white/72')
    expect(rotationIconShell.className).toContain('[filter:drop-shadow')
    expect(rotationIconShell.className).toContain('group-hover:text-white/92')
    expect(rotationIconShell.className).not.toContain('bg-')
    expect(rotationIconShell.className).not.toContain('border')
    expect(rotationIconShell.className).not.toContain('backdrop')
    expect(rotationIconShell.className).not.toContain('shadow-')

    fireEvent.click(rotationToggle)
    expect(screen.getByRole('button', { name: /play slow lot rotation/i })).toHaveAttribute('aria-pressed', 'false')

    const submitSlider = screen.getByRole('slider', { name: /slide to submit/i })
    expect(submitSlider).not.toHaveAttribute('aria-disabled')
    expect(submitSlider.parentElement?.className).toContain('rounded-lg')
    expect(submitSlider.parentElement?.className).toContain('bottom-0')
    expect(submitSlider.parentElement?.className).toContain('mb-2')
    expect(submitSlider.parentElement?.className).toContain('p-1.5')
    expect(submitSlider.parentElement?.className).not.toContain('pb-0')

    const options = screen.getAllByRole('radio')
    expect(options).toHaveLength(4)

    const letters = ['a', 'b', 'c', 'd']
    letters.forEach((letter, i) => {
      expect(within(options[i]).getByText(letter)).toBeInTheDocument()
    })
    expect(screen.queryByText('(a)')).not.toBeInTheDocument()
    const firstLetterMarker = within(options[0]).getByText('a')
    expect(firstLetterMarker.className).toContain('h-5')
    expect(firstLetterMarker.className).toContain('w-5')
    expect(firstLetterMarker.className).toContain('rounded-full')
    expect(firstLetterMarker.className).toContain('bg-camp-green/18')
    expect(firstLetterMarker.className).not.toContain('uppercase')

    const divider = options[0].querySelector('.w-px')
    expect(divider).toBeInTheDocument()
    expect(divider?.className).toContain('bg-slate-900/8')

    const firstOption = within(options[0])
    expect(firstOption.getByText('Front')).toBeInTheDocument()
    expect(firstOption.getByText('Side')).toBeInTheDocument()
    expect(firstOption.getByText('Rear')).toBeInTheDocument()
    expect(firstOption.getByText('Front').parentElement?.className).toContain('whitespace-nowrap')
    expect(firstOption.getByText('Side').className).toContain('min-w-[2.9rem]')
    expect(firstOption.getByText('4.50 m')).toBeInTheDocument()
    expect(firstOption.getAllByText('2.00 m')).toHaveLength(2)

    expect(within(options[0]).getByText('a').className).toContain('bg-camp-green/18')
    expect(screen.queryByTestId('hero-setback-success-effect')).not.toBeInTheDocument()
    expect(playCorrectSoundMock).not.toHaveBeenCalled()
    expect(
      screen.getByText(
        /Visualization: front 4\.50 m is beside the road, side 2\.00 m fills only uncolored side cells, and rear 2\.00 m is opposite the road\./i,
      ),
    ).toBeInTheDocument()
    expect(screen.queryByText(/Correct: 4\.50 m front, 2\.00 m sides, 2\.00 m rear\./i)).not.toBeInTheDocument()

    fireEvent.keyDown(submitSlider, { key: 'Enter' })

    expect(submitSlider).toHaveTextContent('You are correct!')
    expect(submitSlider).toHaveAttribute('aria-label', 'You are correct!')
    expect(screen.getByText(/Correct: 4\.50 m front, 2\.00 m sides, 2\.00 m rear\./i)).toBeInTheDocument()
    expect(playCorrectSoundMock).toHaveBeenCalledTimes(1)
    expect(screen.getByTestId('hero-setback-success-effect')).toBeInTheDocument()
    expect(submitSlider.parentElement?.className).toContain('border-camp-green/45')
    expect(submitSlider.parentElement?.className).toContain('bg-camp-green/[0.13]')
  })

  it('does not show the success burst for an incorrect slide submission', () => {
    render(<HeroHousePreview />)

    const submitSlider = screen.getByRole('slider', { name: /slide to submit/i })
    const options = screen.getAllByRole('radio')

    fireEvent.click(options[1])
    expect(submitSlider).not.toHaveAttribute('aria-disabled')

    fireEvent.keyDown(submitSlider, { key: 'Enter' })

    expect(submitSlider).toHaveTextContent('Sign up to get it right next time')
    expect(submitSlider).toHaveAttribute('aria-label', 'Sign up to get it right next time')
    expect(screen.getByText(/Not this one\. Check the R-1 row in Table VIII\.2\./i)).toBeInTheDocument()
    expect(playCorrectSoundMock).not.toHaveBeenCalled()
    expect(screen.queryByTestId('hero-setback-success-effect')).not.toBeInTheDocument()
    expect(submitSlider.parentElement?.className).not.toContain('border-camp-green/45')
    expect(submitSlider.parentElement?.className).not.toContain('bg-camp-green/[0.13]')
  })

  it('suppresses the animated success burst when reduced motion is requested', () => {
    const originalMatchMedia = window.matchMedia
    window.matchMedia = vi.fn().mockImplementation((query: string) => ({
      matches: query === '(prefers-reduced-motion: reduce)',
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }))

    try {
      render(<HeroHousePreview />)

      const submitSlider = screen.getByRole('slider', { name: /slide to submit/i })

      fireEvent.keyDown(submitSlider, { key: 'Enter' })

      expect(submitSlider).toHaveTextContent('You are correct!')
      expect(screen.getByText(/Correct: 4\.50 m front, 2\.00 m sides, 2\.00 m rear\./i)).toBeInTheDocument()
      expect(playCorrectSoundMock).not.toHaveBeenCalled()
      expect(screen.queryByTestId('hero-setback-success-effect')).not.toBeInTheDocument()
    } finally {
      window.matchMedia = originalMatchMedia
    }
  })
})

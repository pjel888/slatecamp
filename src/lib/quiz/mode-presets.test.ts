/// <reference types="bun-types" />
import { describe, test, expect } from 'bun:test'
import { MODE_PRESETS, mergeWithPreset, getScoreBand, getNextDifficulty, MODE_LABELS } from './mode-presets'
import type { QuizMode } from '@/types/quiz-config'

const ALL_MODES: QuizMode[] = ['camp', 'chill', 'subject', 'focus_review', 'custom', 'storm', 'full_exam', 'endurance']

describe('MODE_PRESETS', () => {
  test('every mode has a preset', () => {
    for (const mode of ALL_MODES) {
      expect(MODE_PRESETS[mode]).toBeDefined()
      expect(MODE_PRESETS[mode].mode).toBe(mode)
    }
  })

  test('every preset has all required sections', () => {
    for (const mode of ALL_MODES) {
      const preset = MODE_PRESETS[mode]
      expect(preset.setup).toBeDefined()
      expect(preset.timer).toBeDefined()
      expect(preset.feedback).toBeDefined()
      expect(preset.navigation).toBeDefined()
      expect(preset.results).toBeDefined()
      expect(preset.breaks).toBeDefined()
    }
  })

  test('camp defaults to 20 questions, immediate feedback, no timer', () => {
    const camp = MODE_PRESETS.camp
    expect(camp.setup.questionCount).toBe(20)
    expect(camp.feedback.timing).toBe('immediate')
    expect(camp.timer.enabled).toBe(false)
    expect(camp.navigation.backAllowed).toBe(false)
    expect(camp.feedback.gatedProgressionDelayMs).toBe(3000)
  })

  test('chill defaults to 10 questions, free navigation', () => {
    const chill = MODE_PRESETS.chill
    expect(chill.setup.questionCount).toBe(10)
    expect(chill.navigation.model).toBe('free')
    expect(chill.navigation.backAllowed).toBe(true)
    expect(chill.feedback.showConfidenceRating).toBe(false)
  })

  test('storm defaults to 50 questions, deferred feedback, timer bar', () => {
    const storm = MODE_PRESETS.storm
    expect(storm.setup.questionCount).toBe(50)
    expect(storm.feedback.timing).toBe('deferred')
    expect(storm.timer.enabled).toBe(true)
    expect(storm.timer.mode).toBe('bar')
    expect(storm.navigation.questionPalette).toBe(true)
    expect(storm.navigation.bookmarkEnabled).toBe(true)
  })

  test('full_exam has 200 questions, countdown timer, 24h delayed results', () => {
    const full_exam = MODE_PRESETS.full_exam
    expect(full_exam.setup.questionCount).toBe(200)
    expect(full_exam.timer.mode).toBe('countdown')
    expect(full_exam.timer.totalSeconds).toBe(14400)
    expect(full_exam.results.showImmediately).toBe(false)
    expect(full_exam.results.delayHours).toBe(24)
    expect(full_exam.feedback.timing).toBe('none')
  })

  test('endurance has 100 questions, countup timer, stamina chart', () => {
    const ext = MODE_PRESETS.endurance
    expect(ext.setup.questionCount).toBe(100)
    expect(ext.timer.mode).toBe('countup')
    expect(ext.results.showStaminaChart).toBe(true)
  })

  test('focus_review starts with easy difficulty', () => {
    expect(MODE_PRESETS.focus_review.setup.initialDifficulty).toBe('easy')
    expect(MODE_PRESETS.focus_review.feedback.gatedProgressionDelayMs).toBe(4000)
  })

  test('subject has 25 questions, adaptive difficulty', () => {
    expect(MODE_PRESETS.subject.setup.questionCount).toBe(25)
    expect(MODE_PRESETS.subject.setup.difficultyMode).toBe('adaptive')
  })
})

describe('mergeWithPreset', () => {
  test('returns preset when no overrides', () => {
    const result = mergeWithPreset('camp', {})
    expect(result).toEqual(MODE_PRESETS.camp)
  })

  test('overrides top-level setup fields', () => {
    const result = mergeWithPreset('camp', {
      setup: { questionCount: 30 },
    } as any)
    expect(result.setup.questionCount).toBe(30)
    expect(result.setup.difficultyMode).toBe('adaptive') // preserved from preset
  })

  test('overrides timer fields while preserving others', () => {
    const result = mergeWithPreset('storm', {
      timer: { totalSeconds: 9000 },
    } as any)
    expect(result.timer.totalSeconds).toBe(9000)
    expect(result.timer.enabled).toBe(true) // preserved
    expect(result.timer.mode).toBe('bar') // preserved
  })

  test('preserves mode from preset', () => {
    const result = mergeWithPreset('chill', {})
    expect(result.mode).toBe('chill')
  })
})

describe('getScoreBand', () => {
  test('70%+ is Passing with emerald color', () => {
    const band = getScoreBand(85)
    expect(band.label).toBe('Passing')
    expect(band.colorClass).toContain('emerald')
  })

  test('50-69% is Building with neutral color', () => {
    const band = getScoreBand(55)
    expect(band.label).toBe('Building')
    expect(band.colorClass).toContain('ink-primary')
  })

  test('below 50% is Needs review with neutral color (NEVER red)', () => {
    const band = getScoreBand(30)
    expect(band.label).toBe('Needs review')
    expect(band.colorClass).not.toContain('red')
    expect(band.colorClass).toContain('ink-primary')
  })

  test('boundary: exactly 70% is Passing', () => {
    expect(getScoreBand(70).label).toBe('Passing')
  })

  test('boundary: exactly 50% is Building', () => {
    expect(getScoreBand(50).label).toBe('Building')
  })
})

describe('getNextDifficulty', () => {
  test('returns current difficulty when window is empty', () => {
    expect(getNextDifficulty([], 3)).toBe(3)
  })

  test('increases difficulty when accuracy >= 90%', () => {
    expect(getNextDifficulty([true, true, true, true, true], 3)).toBe(4)
  })

  test('decreases difficulty when accuracy <= 60%', () => {
    expect(getNextDifficulty([false, false, false, true, false], 3)).toBe(2)
  })

  test('stays same when in sweet spot (60-90%)', () => {
    expect(getNextDifficulty([true, true, true, false, true], 3)).toBe(3) // 80%
  })

  test('caps at 5 (max difficulty)', () => {
    expect(getNextDifficulty([true, true, true, true, true], 5)).toBe(5)
  })

  test('floors at 1 (min difficulty)', () => {
    expect(getNextDifficulty([false, false, false, false, false], 1)).toBe(1)
  })
})

describe('MODE_LABELS', () => {
  test('every mode has a human-readable label', () => {
    for (const mode of ALL_MODES) {
      expect(MODE_LABELS[mode]).toBeDefined()
      expect(typeof MODE_LABELS[mode]).toBe('string')
      expect(MODE_LABELS[mode].length).toBeGreaterThan(0)
    }
  })
})

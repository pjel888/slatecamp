/// <reference types="bun-types" />
import { describe, test, expect } from 'bun:test'
import { computeCalibration } from './confidence-calibration'

describe('computeCalibration', () => {
  test('returns zeros for empty input', () => {
    const result = computeCalibration([])
    expect(result.overconfidenceRate).toBe(0)
    expect(result.luckyGuessRate).toBe(0)
    expect(result.totalWithConfidence).toBe(0)
  })

  test('skips answers without confidence', () => {
    const result = computeCalibration([
      { confidenceLevel: null, isCorrect: true },
      { confidenceLevel: null, isCorrect: false },
    ])
    expect(result.totalWithConfidence).toBe(0)
  })

  test('detects overconfidence (very sure but wrong)', () => {
    const result = computeCalibration([
      { confidenceLevel: 3, isCorrect: false },
      { confidenceLevel: 3, isCorrect: false },
      { confidenceLevel: 3, isCorrect: true },
    ])
    expect(result.overconfidenceRate).toBeCloseTo(0.667, 2)
  })

  test('detects lucky guesses (guessing but correct)', () => {
    const result = computeCalibration([
      { confidenceLevel: 1, isCorrect: true },
      { confidenceLevel: 1, isCorrect: true },
      { confidenceLevel: 1, isCorrect: false },
    ])
    expect(result.luckyGuessRate).toBeCloseTo(0.667, 2)
  })

  test('perfect calibration: confident=correct, unsure=wrong', () => {
    const result = computeCalibration([
      { confidenceLevel: 3, isCorrect: true },
      { confidenceLevel: 3, isCorrect: true },
      { confidenceLevel: 1, isCorrect: false },
      { confidenceLevel: 1, isCorrect: false },
    ])
    expect(result.calibrationScore).toBe(1.0)
    expect(result.overconfidenceRate).toBe(0)
    expect(result.luckyGuessRate).toBe(0)
  })

  test('generates warning summary for high overconfidence', () => {
    const result = computeCalibration([
      { confidenceLevel: 3, isCorrect: false },
      { confidenceLevel: 3, isCorrect: false },
      { confidenceLevel: 3, isCorrect: false },
      { confidenceLevel: 3, isCorrect: true },
    ])
    expect(result.summary).toContain('overconfident')
  })

  test('generates lucky guess summary', () => {
    const result = computeCalibration([
      { confidenceLevel: 1, isCorrect: true },
      { confidenceLevel: 1, isCorrect: true },
      { confidenceLevel: 1, isCorrect: true },
      { confidenceLevel: 2, isCorrect: true },
    ])
    expect(result.summary).toContain('guesses')
  })
})

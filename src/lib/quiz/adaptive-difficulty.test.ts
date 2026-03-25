/// <reference types="bun-types" />
import { describe, test, expect } from 'bun:test'
import {
  createAdaptiveState,
  updateAdaptiveState,
  getDifficultyLabel,
  masteryToDifficulty,
} from './adaptive-difficulty'

describe('createAdaptiveState', () => {
  test('creates state with default difficulty 3', () => {
    const state = createAdaptiveState()
    expect(state.currentDifficulty).toBe(3)
    expect(state.recentWindow).toEqual([])
    expect(state.targetAccuracy).toBe(0.85)
    expect(state.currentAccuracy).toBe(0)
  })

  test('accepts custom initial difficulty', () => {
    const state = createAdaptiveState(1)
    expect(state.currentDifficulty).toBe(1)
  })
})

describe('updateAdaptiveState', () => {
  test('adds answer to window', () => {
    const state = createAdaptiveState()
    const next = updateAdaptiveState(state, true)
    expect(next.recentWindow).toEqual([true])
  })

  test('window caps at 5 answers', () => {
    let state = createAdaptiveState()
    for (let i = 0; i < 7; i++) {
      state = updateAdaptiveState(state, true)
    }
    expect(state.recentWindow.length).toBe(5)
  })

  test('increases difficulty after 3+ correct at 90%+', () => {
    let state = createAdaptiveState(2)
    state = updateAdaptiveState(state, true)
    state = updateAdaptiveState(state, true)
    state = updateAdaptiveState(state, true) // 3/3 = 100%
    expect(state.currentDifficulty).toBe(3)
  })

  test('decreases difficulty after 3+ wrong at 60%-', () => {
    let state = createAdaptiveState(4)
    state = updateAdaptiveState(state, false)
    state = updateAdaptiveState(state, false)
    state = updateAdaptiveState(state, false) // 0/3 = 0%
    expect(state.currentDifficulty).toBe(3)
  })

  test('stays same in sweet spot', () => {
    let state = createAdaptiveState(3)
    state = updateAdaptiveState(state, true)
    state = updateAdaptiveState(state, true)
    state = updateAdaptiveState(state, false) // 2/3 = 67%
    expect(state.currentDifficulty).toBe(3)
  })

  test('does not adjust with fewer than 3 answers', () => {
    let state = createAdaptiveState(3)
    state = updateAdaptiveState(state, true)
    state = updateAdaptiveState(state, true)
    // Only 2 answers — should not adjust
    expect(state.currentDifficulty).toBe(3)
  })
})

describe('getDifficultyLabel', () => {
  test('1-2 is Easy', () => {
    expect(getDifficultyLabel(1)).toBe('Easy')
    expect(getDifficultyLabel(2)).toBe('Easy')
  })

  test('3-4 is Medium', () => {
    expect(getDifficultyLabel(3)).toBe('Medium')
    expect(getDifficultyLabel(4)).toBe('Medium')
  })

  test('5 is Hard', () => {
    expect(getDifficultyLabel(5)).toBe('Hard')
  })
})

describe('masteryToDifficulty', () => {
  test('high mastery (0.8+) → difficulty 4', () => {
    expect(masteryToDifficulty(0.9)).toBe(4)
    expect(masteryToDifficulty(0.8)).toBe(4)
  })

  test('medium mastery (0.6-0.79) → difficulty 3', () => {
    expect(masteryToDifficulty(0.7)).toBe(3)
    expect(masteryToDifficulty(0.6)).toBe(3)
  })

  test('low mastery (0.4-0.59) → difficulty 2', () => {
    expect(masteryToDifficulty(0.5)).toBe(2)
    expect(masteryToDifficulty(0.4)).toBe(2)
  })

  test('very low mastery (<0.4) → difficulty 1', () => {
    expect(masteryToDifficulty(0.2)).toBe(1)
    expect(masteryToDifficulty(0)).toBe(1)
  })
})

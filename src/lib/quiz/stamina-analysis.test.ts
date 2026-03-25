/// <reference types="bun-types" />
import { describe, test, expect } from 'bun:test'
import { analyzeStamina, detectFatigue } from './stamina-analysis'

describe('analyzeStamina', () => {
  test('creates blocks of correct size', () => {
    const answers = Array.from({ length: 50 }, (_, i) => ({
      is_correct: i % 2 === 0,
      time_spent_ms: 30000,
    }))
    const blocks = analyzeStamina(answers, 25)
    expect(blocks.length).toBe(2)
    expect(blocks[0].questionRange).toEqual([1, 25])
    expect(blocks[1].questionRange).toEqual([26, 50])
  })

  test('computes accuracy per block', () => {
    const block1 = Array.from({ length: 25 }, () => ({ is_correct: true, time_spent_ms: 20000 }))
    const block2 = Array.from({ length: 25 }, () => ({ is_correct: false, time_spent_ms: 40000 }))
    const blocks = analyzeStamina([...block1, ...block2], 25)
    expect(blocks[0].accuracy).toBe(1.0)
    expect(blocks[1].accuracy).toBe(0.0)
  })

  test('handles partial last block', () => {
    const answers = Array.from({ length: 30 }, () => ({
      is_correct: true,
      time_spent_ms: 20000,
    }))
    const blocks = analyzeStamina(answers, 25)
    expect(blocks.length).toBe(2)
    expect(blocks[1].questionRange).toEqual([26, 30])
  })

  test('computes avg time per question', () => {
    const answers = Array.from({ length: 25 }, () => ({
      is_correct: true,
      time_spent_ms: 30000,
    }))
    const blocks = analyzeStamina(answers, 25)
    expect(blocks[0].avgTimePerQuestion).toBe(30000)
  })

  test('handles null time_spent_ms', () => {
    const answers = Array.from({ length: 25 }, () => ({
      is_correct: true,
      time_spent_ms: null,
    }))
    const blocks = analyzeStamina(answers, 25)
    expect(blocks[0].avgTimePerQuestion).toBe(0)
  })
})

describe('detectFatigue', () => {
  test('detects fatigue when accuracy drops >15%', () => {
    const blocks = [
      { blockNumber: 1, questionRange: [1, 25] as [number, number], accuracy: 0.90, avgTimePerQuestion: 30000 },
      { blockNumber: 2, questionRange: [26, 50] as [number, number], accuracy: 0.85, avgTimePerQuestion: 32000 },
      { blockNumber: 3, questionRange: [51, 75] as [number, number], accuracy: 0.70, avgTimePerQuestion: 38000 },
    ]
    const result = detectFatigue(blocks)
    expect(result.hasFatigue).toBe(true)
    expect(result.accuracyDrop).toBe(20) // 90% - 70% = 20%
  })

  test('detects fatigue when time increases >30%', () => {
    const blocks = [
      { blockNumber: 1, questionRange: [1, 25] as [number, number], accuracy: 0.80, avgTimePerQuestion: 30000 },
      { blockNumber: 2, questionRange: [26, 50] as [number, number], accuracy: 0.78, avgTimePerQuestion: 42000 },
    ]
    const result = detectFatigue(blocks)
    expect(result.hasFatigue).toBe(true)
    expect(result.timeIncrease).toBe(40) // 40% increase
  })

  test('no fatigue when performance is stable', () => {
    const blocks = [
      { blockNumber: 1, questionRange: [1, 25] as [number, number], accuracy: 0.80, avgTimePerQuestion: 30000 },
      { blockNumber: 2, questionRange: [26, 50] as [number, number], accuracy: 0.78, avgTimePerQuestion: 31000 },
    ]
    const result = detectFatigue(blocks)
    expect(result.hasFatigue).toBe(false)
  })

  test('returns no fatigue for single block', () => {
    const blocks = [
      { blockNumber: 1, questionRange: [1, 25] as [number, number], accuracy: 0.50, avgTimePerQuestion: 60000 },
    ]
    const result = detectFatigue(blocks)
    expect(result.hasFatigue).toBe(false)
  })

  test('includes message when fatigue detected', () => {
    const blocks = [
      { blockNumber: 1, questionRange: [1, 25] as [number, number], accuracy: 0.90, avgTimePerQuestion: 30000 },
      { blockNumber: 2, questionRange: [26, 50] as [number, number], accuracy: 0.60, avgTimePerQuestion: 35000 },
    ]
    const result = detectFatigue(blocks)
    expect(result.message).toBeDefined()
    expect(result.message).toContain('accuracy dropped')
  })
})

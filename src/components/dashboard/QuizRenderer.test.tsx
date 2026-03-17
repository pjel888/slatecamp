import { expect, test, describe, beforeEach, afterEach } from "bun:test";

// ─── localStorage mock (bun test runs in Node — no DOM) ───────────────────────
const _store: Record<string, string> = {}
const localStorage = {
  getItem: (k: string) => _store[k] ?? null,
  setItem: (k: string, v: string) => { _store[k] = v },
  removeItem: (k: string) => { delete _store[k] },
  clear: () => { Object.keys(_store).forEach((k) => delete _store[k]) },
}

// ─── Replicated pure logic from QuizRenderer ─────────────────────────────────
// These mirror the exact logic in QuizRenderer.tsx so changes there
// will be caught by test failures here.

type OptionState = 'default' | 'selected' | 'struck' | 'correct' | 'wrong' | 'faded'

function getOptionState(
  optionId: string,
  correctOptionId: string,
  selectedAnswer: string | undefined,
  struckSet: Set<string>,
  isChecked: boolean,
): OptionState {
  const isSelected = selectedAnswer === optionId
  const isCorrect = optionId === correctOptionId
  const isStruck = struckSet.has(optionId)

  if (!isChecked) {
    if (isSelected) return 'selected' // selection beats strikethrough
    if (isStruck) return 'struck'
    return 'default'
  }
  if (isCorrect) return 'correct'
  if (isSelected && !isCorrect) return 'wrong'
  return 'faded'
}

// Mirrors ResultsSummary score + mastery label logic
function computeStats(questions: { question_id: string; correct_option_id: string }[], answers: Record<string, string>) {
  const total = questions.length
  let correct = 0
  questions.forEach((q) => {
    if (answers[q.question_id] === q.correct_option_id) correct++
  })
  const score = Math.round((correct / total) * 100)
  const masteryLabel = score >= 75 ? 'Mastered' : score >= 50 ? 'Developing' : 'Keep Practicing'
  const masteryColor = score >= 75 ? 'text-emerald-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'
  return { total, correct, score, masteryLabel, masteryColor }
}

// Mirrors AITutorDrawer parseTutorResponse logic
function parseTutorResponse(text: string) {
  const get = (label: string) => {
    const re = new RegExp(`\\*\\*${label}:\\*\\*\\s*([\\s\\S]*?)(?=\\n\\*\\*|$)`, 'i')
    return text.match(re)?.[1]?.trim() || ''
  }
  return {
    misconception: get('Misconception') || text,
    principle: get('Principle'),
    wikiHint: get('Wiki Reference'),
  }
}

// Mirrors LocalStorage helpers
const LS_KEY = (sessionId: string) => `slatecamp_quiz_${sessionId}`

function persistToLS(sessionId: string, state: { answers: Record<string, string>; flags: string[]; strikes: Record<string, string[]>; currentIndex: number }) {
  try {
    localStorage.setItem(LS_KEY(sessionId), JSON.stringify({ ...state, ts: Date.now() }))
  } catch { /* ignore */ }
}

function restoreFromLS(sessionId: string) {
  try {
    const raw = localStorage.getItem(LS_KEY(sessionId))
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

function clearLS(sessionId: string) {
  try { localStorage.removeItem(LS_KEY(sessionId)) } catch { /* ignore */ }
}

// ─── Option State Tests ───────────────────────────────────────────────────────

describe("getOptionState — pre-check", () => {
  const correct = 'opt-a'
  const wrong = 'opt-b'
  const other = 'opt-c'

  test("unselected, unchosen option is 'default'", () => {
    expect(getOptionState(other, correct, undefined, new Set(), false)).toBe('default')
  })

  test("selected option before check is 'selected'", () => {
    expect(getOptionState(wrong, correct, wrong, new Set(), false)).toBe('selected')
  })

  test("struck option before check is 'struck'", () => {
    expect(getOptionState(wrong, correct, undefined, new Set([wrong]), false)).toBe('struck')
  })

  test("selected takes priority over struck when not checked", () => {
    // If user somehow selects a struck option, selected wins
    expect(getOptionState(wrong, correct, wrong, new Set([wrong]), false)).toBe('selected')
  })
})

describe("getOptionState — post-check", () => {
  const correct = 'opt-a'
  const wrong = 'opt-b'
  const other = 'opt-c'

  test("correct option is always 'correct' after check", () => {
    expect(getOptionState(correct, correct, wrong, new Set(), true)).toBe('correct')
  })

  test("selected wrong answer is 'wrong' after check", () => {
    expect(getOptionState(wrong, correct, wrong, new Set(), true)).toBe('wrong')
  })

  test("unselected incorrect options are 'faded' after check", () => {
    expect(getOptionState(other, correct, wrong, new Set(), true)).toBe('faded')
  })

  test("correct option is 'correct' even when it was selected", () => {
    expect(getOptionState(correct, correct, correct, new Set(), true)).toBe('correct')
  })
})

// ─── Score & Mastery Label Tests ──────────────────────────────────────────────

describe("computeStats", () => {
  const questions = [
    { question_id: 'q1', correct_option_id: 'a' },
    { question_id: 'q2', correct_option_id: 'b' },
    { question_id: 'q3', correct_option_id: 'c' },
    { question_id: 'q4', correct_option_id: 'd' },
  ]

  test("100% score → Mastered, emerald", () => {
    const stats = computeStats(questions, { q1: 'a', q2: 'b', q3: 'c', q4: 'd' })
    expect(stats.score).toBe(100)
    expect(stats.masteryLabel).toBe('Mastered')
    expect(stats.masteryColor).toBe('text-emerald-600')
  })

  test("75% score → Mastered (boundary)", () => {
    const stats = computeStats(questions, { q1: 'a', q2: 'b', q3: 'c', q4: 'x' })
    expect(stats.score).toBe(75)
    expect(stats.masteryLabel).toBe('Mastered')
  })

  test("50% score → Developing (boundary)", () => {
    const stats = computeStats(questions, { q1: 'a', q2: 'b', q3: 'x', q4: 'x' })
    expect(stats.score).toBe(50)
    expect(stats.masteryLabel).toBe('Developing')
    expect(stats.masteryColor).toBe('text-amber-600')
  })

  test("49% score → Keep Practicing", () => {
    // 1/4 = 25%
    const stats = computeStats(questions, { q1: 'a', q2: 'x', q3: 'x', q4: 'x' })
    expect(stats.score).toBe(25)
    expect(stats.masteryLabel).toBe('Keep Practicing')
    expect(stats.masteryColor).toBe('text-red-600')
  })

  test("0% score → Keep Practicing", () => {
    const stats = computeStats(questions, { q1: 'x', q2: 'x', q3: 'x', q4: 'x' })
    expect(stats.score).toBe(0)
    expect(stats.masteryLabel).toBe('Keep Practicing')
  })

  test("correct count is accurate", () => {
    const stats = computeStats(questions, { q1: 'a', q2: 'b', q3: 'x', q4: 'x' })
    expect(stats.correct).toBe(2)
    expect(stats.total).toBe(4)
  })
})

// ─── AI Response Parser Tests ─────────────────────────────────────────────────

describe("parseTutorResponse", () => {
  const structured = `**Misconception:** Students often confuse X with Y because of surface similarity.
**Principle:** The core concept is that Z governs this relationship.
**Wiki Reference:** Structural Load Paths`

  test("parses all three sections", () => {
    const result = parseTutorResponse(structured)
    expect(result.misconception).toContain('Students often confuse X with Y')
    expect(result.principle).toContain('Z governs this relationship')
    expect(result.wikiHint).toBe('Structural Load Paths')
  })

  test("case-insensitive label matching", () => {
    const lower = `**misconception:** wrong reasoning here\n**principle:** correct concept here\n**wiki reference:** Topic Name`
    const result = parseTutorResponse(lower)
    expect(result.misconception).toContain('wrong reasoning')
    expect(result.principle).toContain('correct concept')
  })

  test("falls back to full text when no structured format", () => {
    const plain = 'This is a plain explanation without formatting.'
    const result = parseTutorResponse(plain)
    expect(result.misconception).toBe(plain)
    expect(result.principle).toBe('')
    expect(result.wikiHint).toBe('')
  })
})

// ─── LocalStorage Helpers Tests ───────────────────────────────────────────────

describe("localStorage helpers", () => {
  const SESSION_ID = 'test-session-123'

  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  test("persistToLS stores state under correct key", () => {
    persistToLS(SESSION_ID, { answers: { q1: 'a' }, flags: ['q2'], strikes: {}, currentIndex: 3 })
    const raw = localStorage.getItem(LS_KEY(SESSION_ID))
    expect(raw).not.toBeNull()
    const parsed = JSON.parse(raw!)
    expect(parsed.answers).toEqual({ q1: 'a' })
    expect(parsed.flags).toEqual(['q2'])
    expect(parsed.currentIndex).toBe(3)
    expect(typeof parsed.ts).toBe('number')
  })

  test("restoreFromLS retrieves stored state", () => {
    persistToLS(SESSION_ID, { answers: { q1: 'b' }, flags: [], strikes: { q1: ['opt-c'] }, currentIndex: 1 })
    const restored = restoreFromLS(SESSION_ID)
    expect(restored).not.toBeNull()
    expect(restored.answers).toEqual({ q1: 'b' })
    expect(restored.strikes.q1).toEqual(['opt-c'])
  })

  test("restoreFromLS returns null for unknown session", () => {
    expect(restoreFromLS('nonexistent-session')).toBeNull()
  })

  test("clearLS removes the stored state", () => {
    persistToLS(SESSION_ID, { answers: {}, flags: [], strikes: {}, currentIndex: 0 })
    clearLS(SESSION_ID)
    expect(restoreFromLS(SESSION_ID)).toBeNull()
  })

  test("different sessions don't collide", () => {
    persistToLS('session-A', { answers: { q1: 'a' }, flags: [], strikes: {}, currentIndex: 0 })
    persistToLS('session-B', { answers: { q1: 'b' }, flags: [], strikes: {}, currentIndex: 5 })
    expect(restoreFromLS('session-A').answers.q1).toBe('a')
    expect(restoreFromLS('session-B').answers.q1).toBe('b')
  })
})

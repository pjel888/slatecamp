
import type { MasteryLabel } from '@/types/dashboard'
import { getMasteryLevel } from '@/lib/constants/mastery'

// ── Short labels for radar chart axes ─────────────────────────────────────────

const SHORT_LABELS: Record<string, string> = {
  'Architectural Design and Site Planning': 'Arch Design',
  'Architectural Practice': 'Practice',
  'Building Materials and Construction': 'Materials',
  'Building Utilities': 'Utilities',
  'History of Architecture': 'History',
  'Structural Design': 'Structural',
  'Theory and Principles of Planning': 'Planning',
  'Theory of Architecture': 'Theory',
}

export const shortLabel = (subject: string): string => {
  return SHORT_LABELS[subject] ?? subject.split(' ').slice(0, 2).join(' ')
}

// ── Helpers ─────────────────────────────────────────────────────────────────

export const getMasteryLabel = (weight: number): MasteryLabel => getMasteryLevel(weight) as MasteryLabel

export const MODE_NAMES: Record<string, string> = {
  camp: 'Quiz',
  storm: 'Timed Quiz',
  chill: 'Quiz',
  timed: 'Timed Quiz',
  practice: 'Practice Quiz',
  custom: 'Quiz',
  focus_review: 'Focus Review',
  full_exam: 'Full Exam Simulation',
  endurance: 'Design Endurance Training',
}

export const MODE_BADGES: Record<string, string> = {
  camp: 'CAMP',
  storm: 'STORM',
  timed: 'TIMED',
  practice: 'PRACTICE',
  chill: 'CHILL',
  custom: 'CUSTOM',
  focus_review: 'FOCUS',
}

export const MODE_TOOLTIPS: Record<string, string> = {
  camp: 'Quiz gives you instant feedback after each question — ideal for learning and review.',
  storm: 'Timed Quiz simulates exam pressure — no feedback until you finish.',
  timed: 'Timed Quiz adds a countdown — practice working under pressure.',
  practice: 'Practice Quiz lets you study at your own pace with full explanations.',
  chill: 'Quiz can be configured without pressure: no timer and full feedback.',
}

export const formatModeName = (mode: string): string => {
  return MODE_NAMES[mode] ?? 'Quiz'
}

export const getWeekBoundary = (weeksAgo: number): { start: string; end: string } => {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0=Sun
  const startOfThisWeek = new Date(now)
  startOfThisWeek.setDate(now.getDate() - dayOfWeek - (weeksAgo * 7))
  startOfThisWeek.setHours(0, 0, 0, 0)
  const endOfWeek = new Date(startOfThisWeek)
  endOfWeek.setDate(startOfThisWeek.getDate() + 7)
  return { start: startOfThisWeek.toISOString(), end: endOfWeek.toISOString() }
}

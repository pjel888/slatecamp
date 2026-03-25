
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
  camp: 'Camp Mode',
  storm: 'Storm Mode',
  chill: 'Chill Mode',
  timed: 'Timed Quiz',
  practice: 'Practice Quiz',
  custom: 'Custom Quiz',
  blindspot: 'Focus Review',
  proof_sim: 'Full Exam Simulation',
  endurance: 'Extended Practice',
}

export const MODE_BADGES: Record<string, string> = {
  camp: 'CAMP',
  storm: 'STORM',
  timed: 'TIMED',
  practice: 'PRACTICE',
  chill: 'CHILL',
  custom: 'CUSTOM',
  blindspot: 'FOCUS',
}

export const MODE_TOOLTIPS: Record<string, string> = {
  camp: 'Camp Mode gives you instant feedback after each question — ideal for learning and review.',
  storm: 'Storm Mode simulates real exam conditions — no feedback until you finish.',
  timed: 'Timed Quiz adds a countdown — practice working under pressure.',
  practice: 'Practice Quiz lets you study at your own pace with full explanations.',
  chill: 'Chill Mode removes all pressure — study relaxed, no timer, full feedback.',
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

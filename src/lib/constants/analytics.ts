export const PACING_TARGET_MS = 120_000 // 2 min = ALE exam standard

export const PASSING_ACCURACY = 75 // percent

export const SUBJECT_COLORS: Record<string, string> = {
  'Architectural Design and Site Planning': '#3B6B9C',
  'Architectural Practice':                '#7c3aed',
  'Building Materials and Construction':   '#059669',
  'Building Utilities':                    '#0891b2',
  'History of Architecture':              '#D4951A',
  'Structural Design':                    '#D64545',
  'Theory and Principles of Planning':    '#9333ea',
  'Theory of Architecture':              '#0284c7',
}

export const SUBJECT_COLOR_FALLBACK = '#71717a'

export function getSubjectColor(subject: string): string {
  return SUBJECT_COLORS[subject] ?? SUBJECT_COLOR_FALLBACK
}

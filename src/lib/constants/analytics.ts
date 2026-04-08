export const PACING_TARGET_MS = 120_000 // 2 min = LEA exam standard

export const PASSING_ACCURACY = 75 // percent

export const SUBJECT_COLORS: Record<string, string> = {
  // LEA-* IDs (canonical — matches taxonomy_tree.subject_area)
  'LEA-DSGN': '#1B3FC4',
  'LEA-PRAC': '#7c3aed',
  'LEA-MATL': '#059669',
  'LEA-UTIL': '#0891b2',
  'LEA-HIST': '#D4951A',
  'LEA-STRC': '#D64545',
  'LEA-PLAN': '#9333ea',
  'LEA-THEO': '#0284c7',
  // Full names (matches taxonomy_tree.name on subject-level nodes)
  'Architectural Design and Site Planning': '#1B3FC4',
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

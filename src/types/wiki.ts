export interface WikiActionResult {
  success: boolean
  error?: string
}

export type WikiCalloutType = 'most-tested' | 'lea-watch' | 'version-alert'

export interface WikiCalloutBoxProps {
  type: WikiCalloutType
  children: React.ReactNode
}

export interface WikiTableRow {
  parameter: string
  dimension?: string
  value: string
  source?: string
  isMostTested?: boolean
  isChanged?: boolean
  isSectionHeader?: boolean
}

export interface WikiTableProps {
  caption?: string
  columns: string[]
  rows: WikiTableRow[]
  hasSourceColumn?: boolean
}

export interface WikiPartHeaderProps {
  partNumber: number | string
  title: string
  subtitle?: string
}

export interface WikiArticleHeroProps {
  subject: string
  difficulty: 'Foundational' | 'Intermediate' | 'Advanced'
  readTime: string
  title: string
  updatedNote?: string
  leaTestsYou?: string
  isMinimal?: boolean
}

export type LawCalloutCode = 'nbcp' | 'bp344' | 'ra9514' | 'bp220' | 'pd957' | 'irr'

export interface LawCalloutProps {
  code: LawCalloutCode
  section?: string
  title?: string
  children: React.ReactNode
}

/**
 * WikiMistakeCard — canonical prop shape used internally by WikiMistakeCard.
 *
 * The MDX content uses one of three conventions:
 *   A) NEW:  mistake, correction, context             (154 articles)
 *   B) OLD:  number, title, wrongValue, correctValue, explanation, sourceRef  (2 articles)
 *   C) BODY: title, body                                (9 articles)
 *
 * WikiMistakeCard normalizes all three into this internal shape.
 */
export interface WikiMistakeProps {
  number: number
  title: string
  wrongValue: string
  correctValue: string
  explanation: string
  sourceRef?: string
}

/** Raw props as they may appear in MDX — union of all three conventions. */
export interface WikiMistakeCardRawProps {
  // Convention A — NEW (compose-step output)
  mistake?: string
  correction?: string
  context?: string
  // Convention B — OLD (original component contract)
  number?: number
  title?: string
  wrongValue?: string
  correctValue?: string
  explanation?: string
  sourceRef?: string
  // Convention C — BODY
  body?: string
}

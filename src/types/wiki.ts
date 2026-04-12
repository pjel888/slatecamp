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
  updatedNote: string
  leaTestsYou: string
  isMinimal?: boolean
}

export type LawCalloutCode = 'nbcp' | 'bp344' | 'ra9514' | 'bp220' | 'pd957' | 'irr'

export interface LawCalloutProps {
  code: LawCalloutCode
  section?: string
  title?: string
  children: React.ReactNode
}

export interface WikiMistakeProps {
  number: number
  title: string
  wrongValue: string
  correctValue: string
  explanation: string
  sourceRef?: string
}

/* ------------------------------------------------------------------
 *  Coverage classification helpers — pure, non-async, safe to import
 *  in both Server Components and Server Actions files.
 * ------------------------------------------------------------------ */

export interface CoverageCellData {
  node_id: string
  name: string
  ale_id: string | null
  questionCount: number
  hasArticle: boolean
  examFrequency: string | null
}

export type CoverageLevel = 'full' | 'partial' | 'empty' | 'critical'

export const classifyCoverage = (cell: CoverageCellData): CoverageLevel => {
  const hasQuestions = cell.questionCount > 0
  const isHighFrequency = cell.examFrequency === 'high'

  if (cell.questionCount >= 10 && cell.hasArticle) return 'full'
  if (hasQuestions || cell.hasArticle) return 'partial'
  if (!hasQuestions && !cell.hasArticle && isHighFrequency) return 'critical'
  return 'empty'
}

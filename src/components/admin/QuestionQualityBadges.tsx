'use client'

export interface QuestionQualityBadgesProps {
  hasRationale: boolean
  hasCitation: boolean
}

export const QuestionQualityBadges = ({ hasRationale, hasCitation }: QuestionQualityBadgesProps) => (
  <div className="flex items-center gap-2">
    <span
      className={`text-[11px] font-medium ${
        hasRationale ? 'text-[emerald]' : 'text-[destructive]'
      }`}
    >
      {hasRationale ? '✓ Rationale' : '✗ Rationale'}
    </span>
    <span
      className={`text-[11px] font-medium ${
        hasCitation ? 'text-[emerald]' : 'text-[destructive]'
      }`}
    >
      {hasCitation ? '✓ Citation' : '✗ Citation'}
    </span>
  </div>
)

'use client'

export interface QuestionQualityBadgesProps {
  hasRationale: boolean
  hasCitation: boolean
}

export const QuestionQualityBadges = ({ hasRationale, hasCitation }: QuestionQualityBadgesProps) => (
  <div className="flex items-center gap-2">
    <span
      className={`text-[11px] font-medium ${
        hasRationale ? 'text-[#2D9F6F]' : 'text-[#D64545]'
      }`}
    >
      {hasRationale ? '✓ Rationale' : '✗ Rationale'}
    </span>
    <span
      className={`text-[11px] font-medium ${
        hasCitation ? 'text-[#2D9F6F]' : 'text-[#D64545]'
      }`}
    >
      {hasCitation ? '✓ Citation' : '✗ Citation'}
    </span>
  </div>
)

'use client'

type ReviewCenterValue = 'jpt' | 'atlas_cdc' | 'other' | 'none'

interface ReviewCenterStepProps {
  value: ReviewCenterValue
  otherText: string
  onChange: (value: ReviewCenterValue) => void
  onOtherTextChange: (text: string) => void
}

const REVIEW_CENTER_OPTIONS: {
  value: ReviewCenterValue
  label: string
  subLabel: string
}[] = [
  {
    value: 'jpt',
    label: 'JPT Review Center',
    subLabel: 'José Palma Torres Review Center',
  },
  {
    value: 'atlas_cdc',
    label: 'ATLAS-CDC',
    subLabel: 'Architecture & Technology Learning and Advancement Suite',
  },
  {
    value: 'other',
    label: 'Another center',
    subLabel: 'I attend a review center not listed here',
  },
  {
    value: 'none',
    label: 'Self-directed only',
    subLabel: 'I study independently without a review center',
  },
]

export const ReviewCenterStep = ({
  value,
  otherText,
  onChange,
  onOtherTextChange,
}: ReviewCenterStepProps) => {
  return (
    <div className="space-y-4">
      <div>
        <p className="text-sm font-medium text-foreground mb-1">
          Are you enrolled in a review center?
        </p>
        <p className="text-xs text-muted-foreground mb-3">
          This helps SlateCamp complement your schedule, not compete with it.
        </p>
        <div className="space-y-2">
          {REVIEW_CENTER_OPTIONS.map(({ value: optValue, label, subLabel }) => (
            <label key={optValue} className="block cursor-pointer">
              <input
                type="radio"
                name="enrolledReviewCenter"
                value={optValue}
                checked={value === optValue}
                onChange={() => onChange(optValue)}
                className="peer sr-only"
              />
              <div className="rounded-md border border-border p-3 transition-colors duration-150 peer-checked:border-primary peer-checked:bg-primary/10 hover:border-primary/50 hover:bg-primary/5">
                <div className="flex items-start gap-3">
                  <div
                    className={[
                      'mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors duration-150',
                      value === optValue ? 'border-primary' : 'border-border',
                    ].join(' ')}
                  >
                    {value === optValue && (
                      <div className="h-2 w-2 rounded-full bg-primary" />
                    )}
                  </div>
                  <div>
                    <span className="text-sm font-medium text-foreground">{label}</span>
                    <p className="mt-0.5 text-xs text-muted-foreground">{subLabel}</p>
                  </div>
                </div>
              </div>
            </label>
          ))}
        </div>
      </div>

      {value === 'other' && (
        <div>
          <label htmlFor="reviewCenterOther" className="block text-sm font-medium text-foreground mb-1.5">
            Which review center?
          </label>
          <input
            type="text"
            id="reviewCenterOther"
            value={otherText}
            onChange={e => onOtherTextChange(e.target.value)}
            placeholder="e.g. Arki Review Center"
            className="w-full rounded-sm border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
      )}
    </div>
  )
}

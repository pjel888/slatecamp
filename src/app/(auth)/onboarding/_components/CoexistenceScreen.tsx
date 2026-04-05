'use client'

interface CoexistenceScreenProps {
  onContinue: () => void
}

export const CoexistenceScreen = ({ onContinue }: CoexistenceScreenProps) => {
  return (
    <div className="space-y-6">
      <div className="rounded-md border border-border bg-[#EEF2FC] px-5 py-5 space-y-3">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-sm bg-[#1B3FC4]/10">
            <svg
              width="14"
              height="14"
              viewBox="0 0 14 14"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M7 1L8.73 4.51L12.61 5.07L9.8 7.81L10.46 11.68L7 9.86L3.54 11.68L4.2 7.81L1.39 5.07L5.27 4.51L7 1Z"
                stroke="#1B3FC4"
                strokeWidth="1.2"
                strokeLinejoin="round"
              />
            </svg>
          </div>
          <h2 className="text-base font-bold text-[#1A2332] leading-snug">
            SlateCamp works alongside your review center.
          </h2>
        </div>

        <p className="text-sm text-[#4A5568] leading-relaxed">
          Your heatmap will tell you which sessions to prioritize. If your review center schedule covers History this week but your heatmap shows your biggest gap elsewhere — SlateCamp will tell you. You&apos;ll never waste a study session.
        </p>
      </div>

      <button
        type="button"
        onClick={onContinue}
        className="w-full rounded-sm bg-[#1B3FC4] px-4 py-2.5 text-sm font-semibold text-white transition-colors duration-150 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
      >
        Got it. Let&apos;s see my gaps &rarr;
      </button>
    </div>
  )
}

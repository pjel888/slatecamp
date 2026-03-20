import { cn } from '@/lib/utils'
import type { WikiCalloutBoxProps } from '@/types/wiki'

const calloutConfig = {
  'most-tested': {
    border: 'border-l-[3px] border-[#1B3FC4]',
    bg: 'bg-[#EEF3FD]',
    label: 'Most-tested',
    eyebrow: 'text-[#1B3FC4]',
    darkBg: 'dark:bg-[#1B3FC410]',
  },
  'ale-watch': {
    border: 'border-l-[3px] border-[#E63329]',
    bg: 'bg-[#FFF0EF]',
    label: 'ALE Watch',
    eyebrow: 'text-[#E63329]',
    darkBg: 'dark:bg-[#E6332910]',
  },
  'version-alert': {
    border: 'border-l-[3px] border-[#F5A623]',
    bg: 'bg-[#FFF8E6]',
    label: 'Version alert — read first',
    eyebrow: 'text-[#92400E]',
    darkBg: 'dark:bg-[#F5A62310]',
  },
} as const

export const WikiCalloutBox = ({ type, children }: WikiCalloutBoxProps) => {
  const config = calloutConfig[type]
  return (
    <div
      className={cn(
        "not-prose rounded-r-lg px-4 py-3 my-5",
        config.border,
        config.bg,
        config.darkBg,
      )}
      role="note"
    >
      <p className={cn(
        "font-[var(--font-dm-mono)] text-[9px] font-medium uppercase tracking-widest mb-1",
        config.eyebrow
      )}>
        {config.label}
      </p>
      <div className="text-sm text-[#3D3D3A] leading-relaxed [&_strong]:font-semibold [&_strong]:text-[#1A1A1A] dark:text-[#C8C6C0] dark:[&_strong]:text-[#E2E0D8]">
        {children}
      </div>
    </div>
  )
}

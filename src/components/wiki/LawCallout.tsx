import { cn } from '@/lib/utils'
import type { LawCalloutProps, LawCalloutCode } from '@/types/wiki'

const lawConfig: Record<LawCalloutCode, {
  border: string
  bg: string
  darkBg: string
  eyebrow: string
  label: string
}> = {
  nbcp: {
    border: 'border border-camp-cobalt/20',
    bg: 'bg-cobalt-light',
    darkBg: 'dark:bg-[#1B3FC410]',
    eyebrow: 'text-camp-cobalt',
    label: 'NBCP (PD 1096)',
  },
  bp344: {
    border: 'border border-emerald/20',
    bg: 'bg-success-50',
    darkBg: 'dark:bg-[#2D9F6F10]',
    eyebrow: 'text-emerald',
    label: 'BP 344 — Accessibility',
  },
  ra9514: {
    border: 'border border-destructive/20',
    bg: 'bg-destructive-50',
    darkBg: 'dark:bg-[#D6454510]',
    eyebrow: 'text-destructive',
    label: 'RA 9514 — Fire Code',
  },
  bp220: {
    border: 'border border-warning/20',
    bg: 'bg-warning-50',
    darkBg: 'dark:bg-[#D4951A10]',
    eyebrow: 'text-[#92400E]',
    label: 'BP 220 — Housing',
  },
  pd957: {
    border: 'border border-text-secondary/20',
    bg: 'bg-surface-focused',
    darkBg: 'dark:bg-[#4A556810]',
    eyebrow: 'text-text-secondary',
    label: 'PD 957 — Subdivisions',
  },
  irr: {
    border: 'border border-camp-orange/20',
    bg: 'bg-[#FFF5ED]',
    darkBg: 'dark:bg-[#E8853A10]',
    eyebrow: 'text-[#C2410C]',
    label: 'Revised IRR',
  },
}

export const LawCallout = ({ code, section, title, children }: LawCalloutProps) => {
  const config = lawConfig[code]
  const eyebrowText = section ? `${config.label} — ${section}` : config.label

  return (
    <div
      className={cn(
        'not-prose rounded-md px-4 py-3 my-5',
        config.border,
        config.bg,
        config.darkBg,
      )}
      role="note"
    >
      <span
        className={cn(
          'block font-[var(--font-dm-mono)] text-[11px] font-medium uppercase tracking-widest mb-1',
          config.eyebrow,
        )}
      >
        {eyebrowText}
      </span>
      {title && (
        <p className="text-sm font-semibold text-wiki-ink mb-1 dark:text-[#E2E0D8]">
          {title}
        </p>
      )}
      <div className="text-sm text-[#3D3D3A] leading-relaxed [&_strong]:font-semibold [&_strong]:text-wiki-ink dark:text-[#C8C6C0] dark:[&_strong]:text-[#E2E0D8]">
        {children}
      </div>
    </div>
  )
}

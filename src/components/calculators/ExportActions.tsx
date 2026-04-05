// src/app/calculators/_components/ExportActions.tsx
// PDF export + Save project buttons with premium gate.
// Free users see disabled buttons with "Premium" badge.
'use client'

import { cn } from '@/lib/utils'

interface ExportActionsProps {
  isPremium: boolean
  onExportPDF?: () => void
  onSave?: () => void
}

export function ExportActions({
  isPremium,
  onExportPDF,
  onSave,
}: ExportActionsProps) {
  return (
    <div className="flex gap-2">
      <button
        onClick={isPremium ? onExportPDF : undefined}
        disabled={!isPremium}
        className={cn(
          'flex-1 rounded-sm border px-3 py-2 font-sans text-xs transition-colors duration-150',
          isPremium
            ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
            : 'cursor-not-allowed border-border bg-muted text-muted-foreground',
        )}
      >
        Export PDF
        {!isPremium && (
          <span className="ml-1 font-mono text-[8px] uppercase tracking-wider">
            Premium
          </span>
        )}
      </button>

      <button
        onClick={isPremium ? onSave : undefined}
        disabled={!isPremium}
        className={cn(
          'flex-1 rounded-sm border px-3 py-2 font-sans text-xs transition-colors duration-150',
          isPremium
            ? 'border-primary bg-primary/5 text-primary hover:bg-primary/10'
            : 'cursor-not-allowed border-border bg-muted text-muted-foreground',
        )}
      >
        Save
        {!isPremium && (
          <span className="ml-1 font-mono text-[8px] uppercase tracking-wider">
            Premium
          </span>
        )}
      </button>
    </div>
  )
}

/**
 * BlindspotPriorityFlag — Server Component
 *
 * Displays a priority callout when Focus Review (Blindspot Protocol)
 * has flagged taxonomy nodes within a trail step as critical gaps.
 * Renders null when no nodes are flagged.
 */

import { WarningCircle } from '@phosphor-icons/react/dist/ssr'

interface BlindspotPriorityFlagProps {
  flaggedNodeCount?: number
}

const BlindspotPriorityFlag = ({ flaggedNodeCount }: BlindspotPriorityFlagProps) => {
  if (!flaggedNodeCount || flaggedNodeCount <= 0) {
    return null
  }

  return (
    <div className="rounded-md border border-[destructive] bg-[#FDF0F0] p-3">
      <div className="flex items-center gap-1.5">
        <WarningCircle size={14} weight="bold" className="shrink-0 text-[destructive]" />
        <span className="font-mono text-[11px] font-semibold text-[destructive]">
          PRIORITY FLAG
        </span>
      </div>
      <p className="mt-1.5 text-xs text-[text-secondary]">
        Focus Review identified this topic as a critical gap. This step matters more than usual today.
      </p>
    </div>
  )
}

export { BlindspotPriorityFlag }
export type { BlindspotPriorityFlagProps }

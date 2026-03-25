'use client'

import { useDevStore, IMPERSONATION_PRESETS, type ImpersonationPreset } from '@/stores/dev-store'
import { User, ShieldCheck, Buildings, GraduationCap, Briefcase, Crown } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'

const PRESET_ICONS: Record<string, PhosphorIcon> = {
  arch_student: User,
  ust_student: GraduationCap,
  aecom_employee: Briefcase,
  university_dean: Buildings,
  sme_admin: ShieldCheck,
  super_admin: Crown,
}

function PresetCard({ preset }: { preset: ImpersonationPreset }) {
  const activePresetId = useDevStore((s) => s.activePresetId)
  const impersonateAs = useDevStore((s) => s.impersonateAs)
  const isActive = activePresetId === preset.id
  const PresetIcon = PRESET_ICONS[preset.id] ?? User

  return (
    <button
      type="button"
      onClick={() => impersonateAs(preset)}
      className={`flex flex-col items-start gap-1 rounded-lg border p-3 text-left transition-all ${
        isActive
          ? 'border-blue-500 bg-blue-500/10 ring-1 ring-blue-500/30'
          : 'border-border bg-background hover:border-muted-foreground/30 hover:bg-muted'
      }`}
    >
      <div className="flex items-center gap-2">
        <SCIcon icon={PresetIcon} size="xs" className={isActive ? 'text-blue-500' : 'text-muted-foreground'} />
        <span className={`text-xs font-semibold ${isActive ? 'text-blue-500' : 'text-foreground'}`}>
          {preset.label}
        </span>
      </div>
      <span className="text-[11px] text-muted-foreground leading-tight">
        {preset.description}
      </span>
      <div className="flex items-center gap-1.5 mt-0.5">
        <span className="inline-flex rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {preset.tier}
        </span>
        <span className="inline-flex rounded-full bg-muted px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
          {preset.role}
        </span>
      </div>
    </button>
  )
}

export function ImpersonationPanel() {
  const isImpersonating = useDevStore((s) => s.isImpersonating)
  const stopImpersonating = useDevStore((s) => s.stopImpersonating)

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">
          Impersonation
        </h3>
        {isImpersonating && (
          <button
            type="button"
            onClick={stopImpersonating}
            className="rounded-md bg-red-500/10 px-2 py-1 text-[11px] font-semibold text-red-500 transition-colors hover:bg-red-500/20"
          >
            Stop Impersonating
          </button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        {IMPERSONATION_PRESETS.map((preset) => (
          <PresetCard key={preset.id} preset={preset} />
        ))}
      </div>
    </div>
  )
}

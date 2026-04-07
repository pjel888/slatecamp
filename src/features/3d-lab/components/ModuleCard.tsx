'use client'

import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'
import { Cube, Stack, MapTrifold, Scissors, Play, Calculator, Wall } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import { cn } from '@/lib/utils'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'
import type { ModuleRegistryEntry, TemplateType } from '../types/templates'

// ─── Template Badges ─────────────────────────────────────────────────────────

const TEMPLATE_META: Record<TemplateType, { label: string; icon: PhosphorIcon; className: string }> = {
  parametric: { label: 'Parametric', icon: Cube,        className: 'bg-primary/5 text-primary border-primary/10' },
  exploded:   { label: 'Exploded',   icon: Stack,       className: 'bg-purple-500/5 text-purple-600 border-purple-500/10' },
  floorplan:  { label: 'Floor Plan', icon: MapTrifold,  className: 'bg-emerald-500/5 text-emerald-600 border-emerald-500/10' },
  cutaway:    { label: 'Cutaway',    icon: Scissors,    className: 'bg-amber-500/5 text-amber-600 border-amber-500/10' },
  animated:   { label: 'Animated',   icon: Play,        className: 'bg-rose-500/5 text-rose-600 border-rose-500/10' },
  calculator:          { label: 'Calculator',        icon: Calculator, className: 'bg-camp-orange/5 text-camp-orange border-camp-orange/10' },
  'wall-configurator': { label: 'Wall Configurator', icon: Wall,       className: 'bg-primary/5 text-primary border-primary/10' },
}

// ─── Module Card ─────────────────────────────────────────────────────────────

export function ModuleCard({ module, basePath }: { module: ModuleRegistryEntry; basePath: string }) {
  const isBuilt = module.status === 'built' || module.status === 'ready'
  const tmpl = TEMPLATE_META[module.templateType]

  const card = (
    <div
      className={cn(
        'group relative flex h-full flex-col rounded-lg border p-5 transition-all duration-200 ease-out',
        isBuilt
          ? 'cursor-pointer border-border-default/60 bg-card hover:border-primary/30 hover:shadow-md'
          : 'cursor-default border-border-default/30 bg-muted/20 opacity-60',
      )}
    >
      {/* Template + status badges */}
      <div className="mb-4 flex items-center gap-2 flex-wrap">
        <span className={cn(
          "inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider",
          tmpl.className
        )}>
          <SCIcon icon={tmpl.icon} size="xs" weight="bold" />
          {tmpl.label}
        </span>
        {isBuilt ? (
          <span className="rounded border border-emerald/10 bg-emerald/5 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-emerald">
            Available
          </span>
        ) : (
          <span className="rounded border border-border-default/20 bg-muted/10 px-2 py-0.5 font-mono text-[9px] font-bold uppercase tracking-wider text-muted-foreground">
            Coming Soon
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-[15px] font-semibold text-foreground group-hover:text-primary transition-colors duration-200 tracking-tight">
        {module.title}
      </h3>

      {/* Description — fixed 2-line height */}
      <p className="mt-1.5 flex-1 text-[12px] leading-[1.5] text-text-secondary line-clamp-2 font-sans">
        {module.description ?? '\u00A0'}
      </p>

      {/* Code reference — always rendered for consistent height */}
      <p className="mt-4 font-mono text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground/50">
        {module.codeRef ?? '\u00A0'}
      </p>
    </div>
  )

  if (isBuilt) {
    return (
      <Link href={ROUTES.THREE_D_LAB_MODULE(module.id)} className="block h-full">
        {card}
      </Link>
    )
  }

  return card
}

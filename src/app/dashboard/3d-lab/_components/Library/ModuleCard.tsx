'use client'

import Link from 'next/link'
import { Cube, Stack, MapTrifold, Scissors, Play } from '@phosphor-icons/react/dist/ssr'
import { SCIcon } from '@/components/graphics/icons/Icon'
import type { Icon as PhosphorIcon } from '@phosphor-icons/react/lib'
import type { ModuleRegistryEntry, TemplateType } from '../../_types/templates'

// ─── Template Badges ─────────────────────────────────────────────────────────

const TEMPLATE_META: Record<TemplateType, { label: string; icon: PhosphorIcon; className: string }> = {
  parametric: { label: 'Parametric', icon: Cube,        className: 'bg-primary/10 text-primary' },
  exploded:   { label: 'Exploded',   icon: Stack,       className: 'bg-purple-500/10 text-purple-600' },
  floorplan:  { label: 'Floor Plan', icon: MapTrifold,  className: 'bg-emerald-500/10 text-emerald-600' },
  cutaway:    { label: 'Cutaway',    icon: Scissors,    className: 'bg-amber-500/10 text-amber-600' },
  animated:   { label: 'Animated',   icon: Play,        className: 'bg-rose-500/10 text-rose-600' },
}

// ─── Module Card ─────────────────────────────────────────────────────────────

export function ModuleCard({ module, basePath }: { module: ModuleRegistryEntry; basePath: string }) {
  const isBuilt = module.status === 'built' || module.status === 'ready'
  const tmpl = TEMPLATE_META[module.templateType]

  const card = (
    <div
      className={[
        'group relative flex h-full flex-col rounded-md border p-4 transition-all duration-150 ease-out',
        isBuilt
          ? 'cursor-pointer border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm'
          : 'cursor-default border-zinc-100 bg-zinc-50/50 opacity-60',
      ].join(' ')}
    >
      {/* Template + status badges */}
      <div className="mb-2 flex items-center gap-2 flex-wrap">
        <span className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[11px] font-medium ${tmpl.className}`}>
          <SCIcon icon={tmpl.icon} size="xs" />
          {tmpl.label}
        </span>
        {isBuilt ? (
          <span className="rounded-md bg-green-500/10 px-1.5 py-0.5 text-[11px] font-medium text-green-600">
            Available
          </span>
        ) : (
          <span className="rounded-md bg-zinc-500/10 px-1.5 py-0.5 text-[11px] font-medium text-zinc-500">
            Coming Soon
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-150">
        {module.title}
      </h3>

      {/* Description — fixed 2-line height */}
      <p className="mt-1 flex-1 text-[11px] leading-relaxed text-muted-foreground line-clamp-2">
        {module.description ?? '\u00A0'}
      </p>

      {/* Code reference — always rendered for consistent height */}
      <p className="mt-2 text-[11px] font-mono text-muted-foreground/70">
        {module.codeRef ?? '\u00A0'}
      </p>
    </div>
  )

  if (isBuilt) {
    return (
      <Link href={`${basePath}?model=${module.id}`} className="block h-full">
        {card}
      </Link>
    )
  }

  return card
}
